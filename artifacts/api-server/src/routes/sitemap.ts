/**
 * XML Sitemap — dynamically generated from DB
 * GET /sitemap.xml  (mounted at root, NOT under /api)
 */
import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, blogPostsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const BASE = "https://www.primepackagingboxes.com";

function xmlEscape(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteImageUrl(image?: string | null) {
  if (!image) return "";
  try {
    return new URL(image, BASE).toString();
  } catch {
    return image;
  }
}

function url(loc: string, lastmod?: string, priority = "0.7", changefreq = "weekly", image?: string | null) {
  const imageUrl = absoluteImageUrl(image);
  return `  <url>
    <loc>${xmlEscape(BASE + loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${imageUrl ? `<image:image><image:loc>${xmlEscape(imageUrl)}</image:loc></image:image>` : ""}
  </url>`;
}

export async function sitemapHandler(req: Request, res: Response) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [products, categories, posts] = await Promise.all([
      db.select({ slug: productsTable.slug, updatedAt: productsTable.updatedAt, imageUrl: productsTable.imageUrl })
        .from(productsTable).where(eq(productsTable.isActive, true)),
      db.select({ slug: categoriesTable.slug, updatedAt: categoriesTable.updatedAt, imageUrl: categoriesTable.imageUrl })
        .from(categoriesTable).where(eq(categoriesTable.isActive, true)),
      db.select({ slug: blogPostsTable.slug, updatedAt: blogPostsTable.updatedAt, imageUrl: blogPostsTable.imageUrl })
        .from(blogPostsTable).where(eq(blogPostsTable.status, "published")),
    ]);

    // ── Static pages ──────────────────────────────────────────────────────────
    const staticUrls = [
      url("/",                       today, "1.0", "daily"),
      url("/products",               today, "0.9", "daily"),
      url("/about",                  today, "0.6", "monthly"),
      url("/contact",                today, "0.6", "monthly"),
      url("/faq",                    today, "0.6", "monthly"),
      url("/get-a-quote",            today, "0.9", "weekly"),
      url("/request-sample",         today, "0.7", "monthly"),
      url("/delivery-policy",        today, "0.4", "monthly"),
      url("/refund-return-policy",   today, "0.4", "monthly"),
      url("/privacy-policy",         today, "0.3", "yearly"),
      url("/terms-and-conditions",   today, "0.3", "yearly"),
      url("/disclaimer",             today, "0.3", "yearly"),
      url("/returns-claims-support", today, "0.3", "monthly"),
    ];

    // ── Products: /:slug (no prefix — matches live site structure) ──────────
    const productUrls = products.map(p =>
      url(`/${p.slug}`, p.updatedAt?.toISOString(), "0.8", "weekly", p.imageUrl)
    );

    // ── Categories: /:slug (no prefix — matches live site structure) ─────────
    const categoryUrls = categories.map(c =>
      url(`/${c.slug}`, c.updatedAt?.toISOString(), "0.7", "weekly", c.imageUrl)
    );

    // ── Blog: only add /blog index + posts when published posts exist ──────────
    // Blog posts are at /:slug (no /blog/ prefix) matching live site structure
    const blogUrls: string[] = [];
    if (posts.length > 0) {
      blogUrls.push(url("/blog", today, "0.8", "daily"));
      posts.forEach(p =>
        blogUrls.push(url(`/${p.slug}`, p.updatedAt?.toISOString(), "0.6", "weekly", p.imageUrl))
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
 <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
         xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticUrls, ...productUrls, ...categoryUrls, ...blogUrls].join("\n")}
</urlset>`;

    res
      .setHeader("Content-Type", "application/xml; charset=utf-8")
      .setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=7200")
      .send(xml);
  } catch (e) {
    (req as any).log?.error(e);
    res.status(500).send("Error generating sitemap");
  }
}

// Canonical sitemap endpoint for deployments where the API server owns the
// public root. The static site also exposes a sitemap index that points here.
router.get("/sitemap.xml", sitemapHandler);

export default router;
