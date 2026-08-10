import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import {
  GetCategoryParams,
  CreateCategoryBody,
  UpdateCategoryBody,
  UpdateCategoryParams,
  DeleteCategoryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// GET /categories
router.get("/categories", async (req, res) => {
  try {
    const cats = await db.select().from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(categoriesTable.sortOrder, categoriesTable.name);

    const counts = await db
      .select({ categoryId: productsTable.categoryId, cnt: count() })
      .from(productsTable)
      .where(eq(productsTable.isActive, true))
      .groupBy(productsTable.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.cnt)]));
    res.json(cats.map((c) => ({ ...formatCat(c), productCount: countMap.get(c.id) ?? 0 })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /categories/:slug
router.get("/categories/:slug", async (req, res) => {
  try {
    const { slug } = GetCategoryParams.parse(req.params);
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, slug));
    if (!cat) return res.status(404).json({ error: "Not found" });

    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        shortDescription: productsTable.shortDescription,
        categoryId: productsTable.categoryId,
        imageUrl: productsTable.imageUrl,
        isFeatured: productsTable.isFeatured,
        isActive: productsTable.isActive,
        minOrder: productsTable.minOrder,
        sortOrder: productsTable.sortOrder,
      })
      .from(productsTable)
      .where(and(eq(productsTable.categoryId, cat.id), eq(productsTable.isActive, true)))
      .orderBy(productsTable.sortOrder, productsTable.name);

    res.json({ ...formatCat(cat), productCount: products.length, products: products.map(formatProd) });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: GET /admin/categories
router.get("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder, categoriesTable.name);
    const counts = await db
      .select({ categoryId: productsTable.categoryId, cnt: count() })
      .from(productsTable)
      .groupBy(productsTable.categoryId);
    const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.cnt)]));
    res.json(cats.map((c) => ({ ...formatCat(c), productCount: countMap.get(c.id) ?? 0 })));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: POST /admin/categories
router.post("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const data = CreateCategoryBody.parse(req.body);
    const [row] = await db.insert(categoriesTable).values(data).returning();
    res.status(201).json({ ...formatCat(row), productCount: 0 });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: PUT /admin/categories/:id
router.put("/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = UpdateCategoryParams.parse(req.params);
    const data = UpdateCategoryBody.parse(req.body);
    const [row] = await db.update(categoriesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...formatCat(row), productCount: 0 });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: DELETE /admin/categories/:id
router.delete("/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = DeleteCategoryParams.parse(req.params);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatCat(c: any) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    imageUrl: c.imageUrl ?? null,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    metaTitle: c.metaTitle ?? null,
    metaDescription: c.metaDescription ?? null,
    productCount: 0,
  };
}

function formatProd(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    shortDescription: p.shortDescription ?? null,
    categoryId: p.categoryId ?? null,
    categoryName: null,
    categorySlug: null,
    imageUrl: p.imageUrl ?? null,
    images: p.images ?? [],
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    minOrder: p.minOrder ?? null,
    metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
  };
}

export default router;
