import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, or, and } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// GET /products
router.get("/products", async (req, res) => {
  try {
    const query = ListProductsQueryParams.parse(req.query);
    const conditions = [];

    if (query.featured === "true") conditions.push(eq(productsTable.isFeatured, true));
    if (query.category) conditions.push(eq(categoriesTable.slug, query.category));
    // Push search into SQL — avoids fetching all rows then JS-filtering
    if (query.search) {
      const s = `%${query.search}%`;
      conditions.push(or(ilike(productsTable.name, s), ilike(categoriesTable.name, s))!);
    }

    const rows = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        shortDescription: productsTable.shortDescription,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        imageUrl: productsTable.imageUrl,
        isFeatured: productsTable.isFeatured,
        isActive: productsTable.isActive,
        minOrder: productsTable.minOrder,
        sortOrder: productsTable.sortOrder,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(productsTable.isActive, true), ...conditions))
      .orderBy(productsTable.sortOrder, productsTable.name)
      .limit(query.limit ?? 200)
      .offset(query.offset ?? 0);

    res.json(rows.map(formatProduct));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/featured
router.get("/products/featured", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        shortDescription: productsTable.shortDescription,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        imageUrl: productsTable.imageUrl,
        isFeatured: productsTable.isFeatured,
        isActive: productsTable.isActive,
        minOrder: productsTable.minOrder,
        sortOrder: productsTable.sortOrder,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(productsTable.isActive, true), eq(productsTable.isFeatured, true)))
      .orderBy(productsTable.sortOrder)
      .limit(12);
    res.json(rows.map(formatProduct));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /products/:slug
router.get("/products/:slug", async (req, res) => {
  try {
    const { slug } = GetProductParams.parse(req.params);
    const [row] = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        shortDescription: productsTable.shortDescription,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        imageUrl: productsTable.imageUrl,
        images: productsTable.images,
        isFeatured: productsTable.isFeatured,
        isActive: productsTable.isActive,
        minOrder: productsTable.minOrder,
        metaTitle: productsTable.metaTitle,
        metaDescription: productsTable.metaDescription,
        sortOrder: productsTable.sortOrder,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.slug, slug));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(formatProduct(row));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: GET /admin/products
router.get("/admin/products", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        shortDescription: productsTable.shortDescription,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        imageUrl: productsTable.imageUrl,
        images: productsTable.images,
        isFeatured: productsTable.isFeatured,
        isActive: productsTable.isActive,
        minOrder: productsTable.minOrder,
        metaTitle: productsTable.metaTitle,
        metaDescription: productsTable.metaDescription,
        sortOrder: productsTable.sortOrder,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .orderBy(productsTable.sortOrder, productsTable.name);
    res.json(rows.map(formatProduct));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: POST /admin/products
router.post("/admin/products", requireAdmin, async (req, res) => {
  try {
    const data = CreateProductBody.parse(req.body);
    const [row] = await db.insert(productsTable).values({
      ...data,
      images: data.images ?? [],
    }).returning();
    res.status(201).json(formatProduct({ ...row, categoryName: null, categorySlug: null }));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: GET /admin/products/:id — fetch single product for editing
router.get("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db
      .select({
        id: productsTable.id, name: productsTable.name, slug: productsTable.slug,
        description: productsTable.description, shortDescription: productsTable.shortDescription,
        categoryId: productsTable.categoryId, categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug, imageUrl: productsTable.imageUrl,
        images: productsTable.images, isFeatured: productsTable.isFeatured,
        isActive: productsTable.isActive, minOrder: productsTable.minOrder,
        metaTitle: productsTable.metaTitle, metaDescription: productsTable.metaDescription,
        sortOrder: productsTable.sortOrder, regularPrice: productsTable.regularPrice,
        salePrice: productsTable.salePrice, sku: productsTable.sku,
        weight: productsTable.weight, boxLength: productsTable.boxLength,
        boxWidth: productsTable.boxWidth, boxHeight: productsTable.boxHeight,
        focusKeyword: productsTable.focusKeyword, tags: productsTable.tags,
        attributes: productsTable.attributes, createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(formatProduct(row));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// Admin: PUT /admin/products/:id
router.put("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = UpdateProductParams.parse(req.params);
    const data = UpdateProductBody.parse(req.body);
    const [row] = await db.update(productsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productsTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(formatProduct({ ...row, categoryName: null, categorySlug: null }));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: DELETE /admin/products/:id
router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = DeleteProductParams.parse(req.params);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Rewrite local /uploads/ paths to /api/uploads/ so the Replit shared proxy
 * (which routes /api/* to this server) can serve them correctly on any domain.
 */
function rewriteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return `/api/uploads/${url.slice("/uploads/".length)}`;
  return url;
}

function rewriteImages(images: string[] | null | undefined): string[] {
  if (!Array.isArray(images)) return [];
  return images.map(u => rewriteImageUrl(u) ?? u);
}

function formatProduct(r: any) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? null,
    shortDescription: r.shortDescription ?? null,
    categoryId: r.categoryId ?? null,
    categoryName: r.categoryName ?? null,
    categorySlug: r.categorySlug ?? null,
    imageUrl: rewriteImageUrl(r.imageUrl),
    images: rewriteImages(r.images),
    isFeatured: r.isFeatured,
    isActive: r.isActive,
    minOrder: r.minOrder ?? null,
    metaTitle: r.metaTitle ?? null,
    metaDescription: r.metaDescription ?? null,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
    updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
  };
}

export default router;
