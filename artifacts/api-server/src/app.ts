import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import fs from "fs/promises";
import rateLimit from "express-rate-limit";
import sharp from "sharp";
import router from "./routes";
import sitemapRouter from "./routes/sitemap";
import { logger } from "./lib/logger";
import { countryBlockMiddleware } from "./middlewares/countryBlock";
import { adminAuditMiddleware, pruneAdminAuditLogs } from "./lib/audit";
import { publishScheduledContent } from "./lib/scheduled-publishing";
import { monitoringMiddleware } from "./lib/monitoring";

// ── Security headers middleware ───────────────────────────────────────────────
function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  if (process.env.NODE_ENV === "production" || process.env.SECURE_COOKIE === "true") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  if (!req.path.startsWith("/uploads")) {
    res.setHeader("Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self';"
    );
  }
  next();
}

const app: Express = express();

// Gzip all responses — biggest win for JSON API payloads
app.use(compression());
app.use(securityHeaders);
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const ALLOWED_ORIGINS = [
  "https://primepackagingboxes.com",
  "https://www.primepackagingboxes.com",
  /\.replit\.dev$/,
  /localhost:\d+$/,
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl)
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    callback(null, allowed);
  },
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: "session",
    pruneSessionInterval: 60 * 60, // clean expired sessions every hour
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production" || process.env.SECURE_COOKIE === "true",
    sameSite: "lax",
  },
}));

// Record every successful authenticated admin mutation without coupling audit
// persistence to the mutation response. Entries are automatically pruned after
// seven days, with this interval covering quiet workspaces too.
app.use(adminAuditMiddleware);
app.use(monitoringMiddleware);
const auditCleanupTimer = setInterval(() => void pruneAdminAuditLogs(true), 60 * 60 * 1000);
auditCleanupTimer.unref?.();
void publishScheduledContent();
const scheduledPublishingTimer = setInterval(() => void publishScheduledContent(), 60 * 1000);
scheduledPublishingTimer.unref?.();

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// SVG fallback middleware: if .webp/.png/.jpg is not found but .svg exists, serve the SVG
// Uses async fs.access — no sync I/O, does not block the event loop
async function svgFallback(req: express.Request, res: express.Response, next: express.NextFunction) {
  const file = path.join(UPLOADS_DIR, path.basename(req.path));
  try {
    await fs.access(file);
    return next(); // file exists — let static middleware serve it
  } catch {
    // file not found — check for SVG equivalent
    const svgFile = file.replace(/\.(webp|png|jpg|jpeg)$/, ".svg");
    try {
      await fs.access(svgFile);
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=604800");
      return res.sendFile(svgFile);
    } catch {
      return next();
    }
  }
}

// Serve uploaded media at both /uploads/ (direct) and /api/uploads/ (Replit proxy-compatible)
async function responsiveUpload(req: express.Request, res: express.Response, next: express.NextFunction) {
  const requestedWidth = Number(req.query.w);
  const fileName = path.basename(req.path);
  if (!Number.isInteger(requestedWidth) || requestedWidth < 160 || requestedWidth > 2400 || !/\.(webp|png|jpe?g)$/i.test(fileName)) {
    return next();
  }

  const source = path.join(UPLOADS_DIR, fileName);
  try {
    await fs.access(source);
    const body = await sharp(source)
      .resize({ width: requestedWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    return res.send(body);
  } catch {
    return next();
  }
}

app.use("/uploads",     responsiveUpload, svgFallback, express.static(UPLOADS_DIR, { maxAge: "7d" }));
app.use("/api/uploads", responsiveUpload, svgFallback, express.static(UPLOADS_DIR, { maxAge: "7d" }));

// ── Public API response cache (5 min for public GET routes) ──────────────────
function publicCache(seconds: number) {
  return (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set("Cache-Control", `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`);
    next();
  };
}
app.use("/api/products",   publicCache(300));
app.use("/api/categories", publicCache(300));
// CMS pages are edited from the admin builder and must never serve stale HTML.
app.use("/api/pages",      (_req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  next();
});
app.use("/api/banners",    publicCache(600));
// /api/settings intentionally NOT cached publicly — it may contain sensitive admin config fields

// Browser fetch clients cannot use a bodyless 304 response as JSON. Keep API
// responses revalidated by the server without conditional 304s; the explicit
// publicCache middleware above can still opt public catalog routes into caching.
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/uploads/")) return next();
  // Express can still convert a response to 304 when the browser sends
  // If-None-Match/If-Modified-Since, even with no-cache headers. API clients
  // need the JSON body on every request because fetch cannot rehydrate a 304.
  delete req.headers["if-none-match"];
  delete req.headers["if-modified-since"];
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// ── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
// Strict limiter for portal login (brute force protection)
const portalLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
// Loose limiter for public submission endpoints (anti-spam)
const submissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,
  message: { error: "Too many requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});
// AI chat limiter — protect Gemini API costs
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,
  message: { error: "Too many chat messages. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/admin/login",  loginLimiter);
app.use("/api/portal/login", portalLoginLimiter);
app.use("/api/contact",      submissionLimiter);
app.use("/api/quotes",       submissionLimiter);
app.use("/api/chat",         chatLimiter);

// Country block middleware (before API routes)
app.use(countryBlockMiddleware);

// Sitemap at root (not under /api) for Google crawlers
app.use(sitemapRouter);
app.use("/api", router);

// ── Serve built React apps (Admin Panel, Customer Portal, Main Site) ──────────
const SITE_DIR    = path.join(process.cwd(), "../prime-site/dist/public");
const ADMIN_DIR   = path.join(process.cwd(), "../admin-panel/dist/public");
const PORTAL_DIR  = path.join(process.cwd(), "../customer-portal/dist/public");
const PUBLIC_SITE_ORIGIN = "https://www.primepackagingboxes.com";

type PublicSeo = { title: string; description: string; canonical?: string };

function immutableAssetHeaders(res: express.Response, filePath: string) {
  if (filePath.endsWith("index.html")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return;
  }
  // Vite fingerprints production JS/CSS assets. New builds receive new URLs,
  // so these can safely stay in the browser cache for a year.
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
}

const PUBLIC_SEO: Record<string, PublicSeo> = {
  "/": { title: "Custom Packaging Boxes | Free Design, Low MOQ, Fast US & UK Shipping | Prime Packaging Boxes", description: "Premium custom packaging boxes with free design support, low minimums from 100 units, and 7–10 day turnaround for USA and UK brands." },
  "/shop": { title: "Shop Custom Packaging Boxes | Prime Packaging Boxes", description: "Explore custom packaging styles for retail, food, beauty, gifts, shipping, and more. Every box is made to your brand with free design support." },
  "/products": { title: "Custom Packaging Products | Prime Packaging Boxes", description: "Browse custom mailer, rigid, corrugated, retail, food, and specialty packaging boxes with low MOQs and free design support." },
  "/about": { title: "About Prime Packaging Boxes | Custom Packaging USA", description: "Learn about Prime Packaging Boxes, a Torrance, California packaging partner serving brands with custom boxes, free design, and reliable production." },
  "/contact": { title: "Contact Prime Packaging Boxes | Custom Packaging Support", description: "Contact Prime Packaging Boxes for custom packaging quotes, design support, samples, materials, quantities, and production timelines." },
  "/faq": { title: "FAQ & Support | Prime Packaging Boxes", description: "Answers about custom packaging minimums, materials, printing, samples, turnaround times, shipping, and pricing." },
  "/blog": { title: "Packaging Insights & Guides | Prime Packaging Boxes", description: "Explore practical packaging guides, box design advice, material comparisons, and production insights from Prime Packaging Boxes." },
  "/get-a-quote": { title: "Get a Free Quote | Prime Packaging Boxes", description: "Request a custom packaging quote with free design support, clear pricing, low minimums, and fast production guidance." },
  "/request-sample": { title: "Request a Free Sample Kit | Prime Packaging Boxes", description: "Request a packaging sample kit and explore premium materials, finishes, and box styles before placing your custom order." },
  "/delivery-policy": { title: "Delivery & Shipping Policy | Prime Packaging Boxes", description: "Review Prime Packaging Boxes delivery timelines, free shipping coverage, rush production options, and order dispatch details." },
  "/refund-return-policy": { title: "Refund & Return Policy | Prime Packaging Boxes", description: "Review the Prime Packaging Boxes satisfaction guarantee, manufacturing defect claims, reprints, refunds, and resolution timelines." },
  "/privacy-policy": { title: "Privacy Policy | Prime Packaging Boxes", description: "Learn how Prime Packaging Boxes collects, uses, protects, and deletes personal information submitted through our website." },
  "/terms-and-conditions": { title: "Terms & Conditions | Prime Packaging Boxes", description: "Read the terms that apply to quotes, custom packaging orders, artwork, approvals, payments, production, and delivery." },
  "/disclaimer": { title: "Disclaimer | Prime Packaging Boxes", description: "Review important information about packaging specifications, estimates, third-party services, customer artwork, and website content." },
  "/returns-claims-support": { title: "Returns & Claims Support | Prime Packaging Boxes", description: "Get help with damaged orders, manufacturing defects, printing issues, returns, claims, reprints, and customer support." },
  "/sitemap": { title: "Sitemap | Prime Packaging Boxes", description: "Browse the Prime Packaging Boxes website by product, category, resource, and policy page." },
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendSpaEntry(
  file: string,
  res: express.Response,
  seo?: PublicSeo,
) {
  try {
    let html = await fs.readFile(file, "utf8");
    if (seo) {
      const title = escapeHtml(seo.title);
      const description = escapeHtml(seo.description);
      const canonical = escapeHtml(seo.canonical || PUBLIC_SITE_ORIGIN + "/");
      const fallbackHeading = escapeHtml(seo.title.split("|")[0].trim());
      const seoFallback = `<noscript id="seo-fallback"><main><h1>${fallbackHeading}</h1><p>${description}</p></main></noscript>`;
      html = html
        .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
        .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${description}$2`)
        .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${title}$2`)
        .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${description}$2`)
        .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, `$1${title}$2`)
        .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, `$1${description}$2`)
        .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${canonical}$2`)
        .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${canonical}$2`)
        .replace(/<\/body>/i, `${seoFallback}</body>`);
    }
    res.type("html").send(html);
  } catch (error) {
    // The dev workflows serve these apps through Vite, so their production
    // dist folders may not exist beside the API. Return a clean 404 instead
    // of logging an expected ENOENT stack trace on every health probe.
    if (!res.headersSent) {
      const statusCode = (error as NodeJS.ErrnoException & { statusCode?: number }).statusCode;
      res.status(statusCode || 404).send("Not found");
    }
  }
}

// Admin panel — served at /admin/* (no-cache for instant live updates)
app.use("/admin", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}, express.static(ADMIN_DIR, { maxAge: 0 }));
app.get(["/admin", "/admin/*splat"], (_req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  sendSpaEntry(path.join(ADMIN_DIR, "index.html"), res);
});

// Customer portal — served at /customer-portal/*
app.use("/customer-portal", express.static(PORTAL_DIR, { maxAge: "1h" }));
app.get(["/customer-portal", "/customer-portal/*splat"], (_req, res) =>
  sendSpaEntry(path.join(PORTAL_DIR, "index.html"), res)
);

// Main site SPA — served at /*  (must come last). HTML stays revalidated while
// fingerprinted build assets are cached for a year.
app.use(express.static(SITE_DIR, { maxAge: "1y", setHeaders: immutableAssetHeaders }));
app.get("*splat", (req, res) => {
  const publicPath = req.path.replace(/\/+$/, "") || "/";
  const seo = PUBLIC_SEO[publicPath];
  return sendSpaEntry(
    path.join(SITE_DIR, "index.html"),
    res,
    seo ? { ...seo, canonical: `${PUBLIC_SITE_ORIGIN}${publicPath}` } : undefined,
  );
});

export default app;
