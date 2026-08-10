import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, blogPostsTable, siteSettingsTable, pagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const BASE_URL = "https://www.primepackagingboxes.com";

const fmt = (d: Date | null | undefined) =>
  d ? new Date(d).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

const urlEntry = (loc: string, lastmod: string, priority: string, changefreq: string) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

// GET /robots.txt
router.get("/robots.txt", async (_req, res) => {
  try {
    const [settings] = await db.select().from(siteSettingsTable).limit(1);
    const custom = (settings as any)?.robotsTxt;
    if (custom) { res.type("text/plain").send(custom); return; }
  } catch (_) {}
  res.type("text/plain").send(
`User-agent: *
Disallow: /

Sitemap: ${BASE_URL}/sitemap.xml`
  );
});

// /api/sitemap.xml is not the canonical URL — return 404 so crawlers use /sitemap.xml
router.get("/sitemap.xml", (_req, res) => {
  res.status(404).type("text/plain").send("Sitemap is at /sitemap.xml (no /api prefix)");
});

export default router;
