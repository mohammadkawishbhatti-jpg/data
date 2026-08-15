import { Router } from "express";
import { db } from "@workspace/db";
import { pagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetPageParams,
  CreatePageBody,
  UpdatePageBody,
  UpdatePageParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// GET /pages/:slug — CMS edits must be visible immediately in the storefront.
router.get("/pages/:slug", async (req, res) => {
  try {
    const { slug } = GetPageParams.parse(req.params);
    const [row] = await db.select().from(pagesTable)
      .where(eq(pagesTable.slug, slug));
    if (!row || !row.isPublished) return res.status(404).json({ error: "Not found" });
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: GET /admin/pages
router.get("/admin/pages", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(pagesTable).orderBy(pagesTable.title);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: POST /admin/pages
router.post("/admin/pages", requireAdmin, async (req, res) => {
  try {
    const data = CreatePageBody.parse(req.body);
    const [row] = await db.insert(pagesTable).values(data as any).returning();
    res.status(201).json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: GET /admin/pages/home — ensure the hard-coded homepage has an
// editable CMS record without replacing its dedicated React layout.
router.get("/admin/pages/home", requireAdmin, async (req, res) => {
  try {
    const [existing] = await db.select().from(pagesTable)
      .where(eq(pagesTable.slug, "home"));
    if (existing) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.json(fmt(existing));
    }

    const [homePage] = await db.insert(pagesTable).values({
      title: "Homepage",
      slug: "home",
      content: null,
      isPublished: true,
    }).returning();
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(201).json(fmt(homePage));
  } catch (e) {
    req.log.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: GET /admin/pages/:id
router.get("/admin/pages/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const [row] = await db.select().from(pagesTable).where(eq(pagesTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: DELETE /admin/pages/:id
router.delete("/admin/pages/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const [row] = await db.delete(pagesTable).where(eq(pagesTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: PUT /admin/pages/:id
router.put("/admin/pages/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = UpdatePageParams.parse(req.params);
    const data = UpdatePageBody.parse(req.body);
    const [row] = await db.update(pagesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pagesTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

function fmt(p: any) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content ?? null,
    metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
    isPublished: p.isPublished,
    updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
  };
}

export default router;
