import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { canEditContentLive, requireAdministrator, requireCapability } from "../middlewares/auth";
import {
  applyContentRevision,
  createContentRevision,
  revisionPayloadFromBlog,
} from "../lib/content-revisions";
import {
  ListBlogPostsQueryParams,
  GetBlogPostParams,
  CreateBlogPostBody,
  UpdateBlogPostBody,
  UpdateBlogPostParams,
  DeleteBlogPostParams,
} from "@workspace/api-zod";

const router = Router();

// GET /blog
router.get("/blog", async (req, res) => {
  try {
    const q = ListBlogPostsQueryParams.parse(req.query);
    const rows = await db.select().from(blogPostsTable)
      .where(eq(blogPostsTable.status, "published"))
      .orderBy(desc(blogPostsTable.createdAt))
      .limit(q.limit ?? 20)
      .offset(q.offset ?? 0);
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /blog/:slug
router.get("/blog/:slug", async (req, res) => {
  try {
    const { slug } = GetBlogPostParams.parse(req.params);
    const [row] = await db.select().from(blogPostsTable)
      .where(eq(blogPostsTable.slug, slug));
    if (!row || row.status !== "published") return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: GET /admin/blog
router.get("/admin/blog", requireCapability("content"), async (req, res) => {
  try {
    const rows = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: POST /admin/blog
router.post("/admin/blog", requireCapability("content"), async (req, res) => {
  try {
    const data = CreateBlogPostBody.parse(req.body);
    const [row] = await db.insert(blogPostsTable).values({
      title: data.title,
      slug: data.slug,
      excerpt: null,
      content: null,
      imageUrl: null,
      author: null,
      status: "draft",
      scheduledAt: null,
      metaTitle: null,
      metaDescription: null,
    }).returning();
    const revision = await createContentRevision({
      entityType: "blog",
      entityId: row.id,
      entityLabel: row.title,
      payload: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        status: data.scheduledAt ? "scheduled" : data.status,
      },
      req,
    });
    if (canEditContentLive(req)) {
      await applyContentRevision({ revisionId: revision.id, req });
      return res.status(201).json({ ...fmt(row), workflow: "live", revisionId: revision.id });
    }
    res.status(202).json({ ...fmt(row), workflow: "pending", revisionId: revision.id, previewToken: revision.previewToken });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: PUT /admin/blog/:id
router.put("/admin/blog/:id", requireCapability("content"), async (req, res) => {
  try {
    const { id } = UpdateBlogPostParams.parse(req.params);
    const data = UpdateBlogPostBody.parse(req.body);
    const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    const revision = await createContentRevision({
      entityType: "blog",
      entityId: id,
      entityLabel: data.title ?? row.title,
      payload: {
        ...revisionPayloadFromBlog(row),
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        status: data.scheduledAt ? "scheduled" : (data.status ?? row.status),
      },
      req,
    });
    if (canEditContentLive(req)) {
      await applyContentRevision({ revisionId: revision.id, req });
      return res.json({ ...fmt(row), workflow: "live", revisionId: revision.id });
    }
    res.status(202).json({ ...fmt(row), workflow: "pending", revisionId: revision.id, previewToken: revision.previewToken });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: DELETE /admin/blog/:id
router.delete("/admin/blog/:id", requireAdministrator, async (req, res) => {
  try {
    const { id } = DeleteBlogPostParams.parse(req.params);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

function fmt(b: any) {
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt ?? null,
    content: b.content ?? null,
    imageUrl: b.imageUrl ?? null,
    author: b.author ?? null,
    status: b.status,
    scheduledAt: b.scheduledAt?.toISOString?.() ?? b.scheduledAt ?? null,
    metaTitle: b.metaTitle ?? null,
    metaDescription: b.metaDescription ?? null,
    createdAt: b.createdAt?.toISOString?.() ?? b.createdAt,
    updatedAt: b.updatedAt?.toISOString?.() ?? b.updatedAt,
  };
}

export default router;
