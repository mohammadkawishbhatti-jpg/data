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
import { requireAdministrator, requireCapability } from "../middlewares/auth";
import {
  createContentRevision,
  revisionPayloadFromPage,
} from "../lib/content-revisions";
import { sanitizeInlineDocument } from "../lib/inline-content";

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
router.get("/admin/pages", requireCapability("content"), async (req, res) => {
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
router.post("/admin/pages", requireCapability("content"), async (req, res) => {
  try {
    const data = CreatePageBody.parse(req.body);
    const [row] = await db.insert(pagesTable).values({
      title: data.title,
      slug: data.slug,
      content: null,
      metaTitle: null,
      metaDescription: null,
      scheduledAt: null,
      isPublished: false,
    } as any).returning();
    const revision = await createContentRevision({
      entityType: "page",
      entityId: row.id,
      entityLabel: row.title,
      payload: {
        ...data,
        content: data.content == null ? data.content : sanitizeInlineDocument(data.content),
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        isPublished: Boolean(data.isPublished),
      },
      req,
    });
    res.status(202).json({ ...fmt(row), workflow: "pending", revisionId: revision.id, previewToken: revision.previewToken });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: GET /admin/pages/home — ensure the hard-coded homepage has an
// editable CMS record without replacing its dedicated React layout.
router.get("/admin/pages/home", requireCapability("content"), async (req, res) => {
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
router.get("/admin/pages/:id", requireCapability("content"), async (req, res) => {
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
router.delete("/admin/pages/:id", requireAdministrator, async (req, res) => {
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
router.put("/admin/pages/:id", requireCapability("content"), async (req, res) => {
  try {
    const { id } = UpdatePageParams.parse(req.params);
    const data = UpdatePageBody.parse(req.body);
    const [row] = await db.select().from(pagesTable).where(eq(pagesTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    const sanitizedContent = data.content === undefined
      ? undefined
      : data.content == null
        ? data.content
        : sanitizeInlineDocument(data.content);
    const revision = await createContentRevision({
      entityType: "page",
      entityId: id,
      entityLabel: data.title ?? row.title,
      payload: {
        ...revisionPayloadFromPage(row),
        ...data,
        ...(sanitizedContent !== undefined ? { content: sanitizedContent } : {}),
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        isPublished: Boolean(data.isPublished),
      },
      req,
    });
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(202).json({ ...fmt(row), workflow: "pending", revisionId: revision.id, previewToken: revision.previewToken });
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
    scheduledAt: p.scheduledAt?.toISOString?.() ?? p.scheduledAt ?? null,
    updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
  };
}

export default router;
