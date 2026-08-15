import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
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
router.get("/admin/blog", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: POST /admin/blog
router.post("/admin/blog", requireAdmin, async (req, res) => {
  try {
    const data = CreateBlogPostBody.parse(req.body);
    const [row] = await db.insert(blogPostsTable).values(data).returning();
    res.status(201).json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: PUT /admin/blog/:id
router.put("/admin/blog/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = UpdateBlogPostParams.parse(req.params);
    const data = UpdateBlogPostBody.parse(req.body);
    const [row] = await db.update(blogPostsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(blogPostsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: DELETE /admin/blog/:id
router.delete("/admin/blog/:id", requireAdmin, async (req, res) => {
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
    metaTitle: b.metaTitle ?? null,
    metaDescription: b.metaDescription ?? null,
    createdAt: b.createdAt?.toISOString?.() ?? b.createdAt,
    updatedAt: b.updatedAt?.toISOString?.() ?? b.updatedAt,
  };
}

export default router;
