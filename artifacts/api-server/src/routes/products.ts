import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, or, and, inArray } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";
import { canEditContentLive, requireCapability } from "../middlewares/auth";
import { createContentRevision } from "../lib/content-revisions";

const router = Router();

// GET /products
router.get("/products", async (req, res) => {
  try {
    const query = ListProductsQueryParams.parse(req.query);
    const conditions = [];

    if (query.featured === "true") conditions.push(eq(productsTable.isFeatured, true));
    if (query.showcase === "true") conditions.push(eq(productsTable.isShowcase, true));
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
        isShowcase: productsTable.isShowcase,
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
        isShowcase: productsTable.isShowcase,
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
        isShowcase: productsTable.isShowcase,
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
router.get("/admin/products", requireCapability("catalog"), async (req, res) => {
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
         isShowcase: productsTable.isShowcase,
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

// Admin: bulk product actions for catalog maintenance
router.post("/admin/products/bulk", requireCapability("catalog"), async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0)
      : [];
    const action = String(req.body?.action || "");
    const allowed = new Set(["activate", "deactivate", "feature", "unfeature", "showcase", "unshowcase"]);
    if (!ids.length || !allowed.has(action)) return res.status(400).json({ error: "Select products and a valid bulk action" });
    const updates: Record<string, boolean> =
      action === "activate" ? { isActive: true } :
      action === "deactivate" ? { isActive: false } :
      action === "feature" ? { isFeatured: true } :
      action === "unfeature" ? { isFeatured: false } :
      action === "showcase" ? { isShowcase: true } :
      { isShowcase: false };
    if (canEditContentLive(req)) {
      const rows = await db.update(productsTable)
        .set({ ...updates, updatedAt: new Date() })
        .where(inArray(productsTable.id, ids))
        .returning({ id: productsTable.id });
      return res.json({ success: true, updated: rows.length, pending: 0 });
    }
    const products = await db.select().from(productsTable).where(inArray(productsTable.id, ids));
    const revisionIds: number[] = [];
    for (const product of products) {
      const revision = await createContentRevision({
        entityType: "product",
        entityId: product.id,
        entityLabel: product.name,
        payload: productRevisionPayload(product, updates),
        req,
      });
      revisionIds.push(revision.id);
    }
    res.status(202).json({ success: true, updated: 0, pending: revisionIds.length, revisionIds });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bulk update failed" });
  }
});

// Admin: POST /admin/products
router.post("/admin/products", requireCapability("catalog"), async (req, res) => {
  try {
    const data = CreateProductBody.parse(req.body);
    if (canEditContentLive(req)) {
      const [row] = await db.insert(productsTable).values({
        ...data,
        images: data.images ?? [],
      }).returning();
      return res.status(201).json({ pendingApproval: false, product: formatProduct({ ...row, categoryName: null, categorySlug: null }) });
    }
    const [row] = await db.insert(productsTable).values({
      ...data,
      isActive: false,
      images: data.images ?? [],
    }).returning();
    const revision = await createContentRevision({
      entityType: "product",
      entityId: row.id,
      entityLabel: row.name,
      payload: { operation: "create", ...data, isActive: data.isActive !== false, images: data.images ?? [] },
      req,
    });
    res.status(202).json({ pendingApproval: true, revisionId: revision.id, product: formatProduct({ ...row, categoryName: null, categorySlug: null }) });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: GET /admin/products/:id — fetch single product for editing
router.get("/admin/products/:id", requireCapability("catalog"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db
      .select({
        id: productsTable.id, name: productsTable.name, slug: productsTable.slug,
        description: productsTable.description, shortDescription: productsTable.shortDescription,
        categoryId: productsTable.categoryId, categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug, imageUrl: productsTable.imageUrl,
        images: productsTable.images, isFeatured: productsTable.isFeatured,
        isShowcase: productsTable.isShowcase,
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
router.put("/admin/products/:id", requireCapability("catalog"), async (req, res) => {
  try {
    const { id } = UpdateProductParams.parse(req.params);
    const data = UpdateProductBody.parse(req.body);
    const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (canEditContentLive(req)) {
      const [row] = await db.update(productsTable)
        .set({ ...data, images: data.images ?? existing.images ?? [], updatedAt: new Date() })
        .where(eq(productsTable.id, id))
        .returning();
      return res.json({ pendingApproval: false, product: formatProduct({ ...row, categoryName: null, categorySlug: null }) });
    }
    const revision = await createContentRevision({
      entityType: "product",
      entityId: id,
      entityLabel: String((data as any).name ?? existing.name),
      payload: productRevisionPayload(existing, data),
      req,
    });
    res.status(202).json({ pendingApproval: true, revisionId: revision.id, product: formatProduct({ ...existing, ...data, categoryName: null, categorySlug: null }) });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: DELETE /admin/products/:id
router.delete("/admin/products/:id", requireCapability("catalog"), async (req, res) => {
  try {
    const { id } = DeleteProductParams.parse(req.params);
    const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (canEditContentLive(req)) {
      const [row] = await db.delete(productsTable)
        .where(eq(productsTable.id, id))
        .returning({ id: productsTable.id });
      if (!row) return res.status(404).json({ error: "Not found" });
      return res.json({ success: true, pendingApproval: false, productId: id });
    }
    const revision = await createContentRevision({
      entityType: "product",
      entityId: id,
      entityLabel: existing.name,
      payload: { operation: "delete", name: existing.name, slug: existing.slug },
      req,
    });
    res.status(202).json({ success: true, pendingApproval: true, revisionId: revision.id, productId: id });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

function productRevisionPayload(product: any, patch: Record<string, unknown>, operation = "update"): Record<string, unknown> {
  const value = (key: string) => patch[key] !== undefined ? patch[key] : product[key];
  return {
    operation,
    name: value("name"),
    slug: value("slug"),
    description: value("description") ?? null,
    shortDescription: value("shortDescription") ?? null,
    categoryId: value("categoryId") ?? null,
    imageUrl: value("imageUrl") ?? null,
    images: value("images") ?? [],
    isFeatured: Boolean(value("isFeatured")),
    isShowcase: Boolean(value("isShowcase")),
    isActive: Boolean(value("isActive")),
    minOrder: value("minOrder") ?? 100,
    metaTitle: value("metaTitle") ?? null,
    metaDescription: value("metaDescription") ?? null,
    sortOrder: value("sortOrder") ?? 0,
    regularPrice: value("regularPrice") ?? null,
    salePrice: value("salePrice") ?? null,
    sku: value("sku") ?? null,
    weight: value("weight") ?? null,
    boxLength: value("boxLength") ?? null,
    boxWidth: value("boxWidth") ?? null,
    boxHeight: value("boxHeight") ?? null,
    focusKeyword: value("focusKeyword") ?? null,
    tags: value("tags") ?? null,
    attributes: value("attributes") ?? null,
  };
}

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
    isShowcase: r.isShowcase,
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
