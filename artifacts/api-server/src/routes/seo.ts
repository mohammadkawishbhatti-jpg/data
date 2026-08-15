import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { sitemapHandler } from "./sitemap";

const router = Router();
const BASE_URL = "https://www.primepackagingboxes.com";

// GET /robots.txt
router.get("/robots.txt", async (_req, res) => {
  try {
    const [settings] = await db.select().from(siteSettingsTable).limit(1);
    const custom = (settings as any)?.robotsTxt;
    if (custom) { res.type("text/plain").send(custom); return; }
  } catch (_) {}
  res.type("text/plain").send(
`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /customer-portal

Sitemap: ${BASE_URL}/sitemap.xml`
  );
});

// Keep a dynamic API copy available because the static site sitemap index
// points here. This stays current when products/categories/posts change.
router.get("/sitemap.xml", sitemapHandler);

export default router;
