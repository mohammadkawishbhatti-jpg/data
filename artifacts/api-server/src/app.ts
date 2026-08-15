import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import fs from "fs/promises";
import rateLimit from "express-rate-limit";
import router from "./routes";
import sitemapRouter from "./routes/sitemap";
import { logger } from "./lib/logger";
import { countryBlockMiddleware } from "./middlewares/countryBlock";

// ── Security headers middleware ───────────────────────────────────────────────
function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (!req.path.startsWith("/uploads")) {
    res.setHeader("Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
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
  cookie: {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days — survives server restarts
    // In production (cPanel HTTPS) cookies must be secure + sameSite=none for cross-origin.
    // In development (HTTP localhost) these flags prevent cookies from being set at all.
    secure: process.env.SECURE_COOKIE === "true",
    sameSite: process.env.SECURE_COOKIE === "true" ? "none" : "lax",
  },
}));

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
app.use("/uploads",     svgFallback, express.static(UPLOADS_DIR, { maxAge: "7d" }));
app.use("/api/uploads", svgFallback, express.static(UPLOADS_DIR, { maxAge: "7d" }));

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

// ── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
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

function sendSpaEntry(file: string, res: express.Response) {
  res.sendFile(file, (error) => {
    // The dev workflows serve these apps through Vite, so their production
    // dist folders may not exist beside the API. Return a clean 404 instead
    // of logging an expected ENOENT stack trace on every health probe.
    if (error && !res.headersSent) {
      const statusCode = (error as NodeJS.ErrnoException & { statusCode?: number }).statusCode;
      res.status(statusCode || 404).send("Not found");
    }
  });
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

// Main site SPA — served at /*  (must come last)
app.use(express.static(SITE_DIR, { maxAge: "1h" }));
app.get("*splat", (_req, res) =>
  sendSpaEntry(path.join(SITE_DIR, "index.html"), res)
);

export default app;
