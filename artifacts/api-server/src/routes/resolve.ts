/**
 * GET /api/resolve/:slug
 * Single endpoint to identify what a /:slug URL points to.
 * Returns { type: "product"|"category"|"blogPost"|"notFound", slug }
 * Used by SlugPage to avoid 3 parallel API calls.
 */
import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, blogPostsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/resolve/:slug", async (req, res) => {
  const { slug } = req.params;
  if (!slug) return res.json({ type: "notFound", slug });

  try {
    const [product, category, post] = await Promise.all([
      db.select({ id: productsTable.id })
        .from(productsTable)
        .where(and(eq(productsTable.slug, slug), eq(productsTable.isActive, true)))
        .limit(1),
      db.select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(and(eq(categoriesTable.slug, slug), eq(categoriesTable.isActive, true)))
        .limit(1),
      db.select({ id: blogPostsTable.id })
        .from(blogPostsTable)
        .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.status, "published")))
        .limit(1),
    ]);

    if (product.length)  return res.json({ type: "product",  slug });
    if (category.length) return res.json({ type: "category", slug });
    if (post.length)     return res.json({ type: "blogPost", slug });
    return res.json({ type: "notFound", slug });
  } catch {
    return res.status(500).json({ type: "notFound", slug });
  }
});

export default router;
