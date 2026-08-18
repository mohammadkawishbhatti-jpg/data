import crypto from "node:crypto";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import {
  blogPostsTable,
  contentRevisionsTable,
  db,
  pageTemplatesTable,
  pagesTable,
  productsTable,
  categoriesTable,
  bannersTable,
} from "@workspace/db";

export type ContentEntityType = "page" | "blog" | "template" | "product" | "category" | "banner";

export type RevisionActor = {
  id?: number | null;
  username?: string | null;
  role?: string | null;
};

export type RevisionPayload = Record<string, unknown>;

function actorFromRequest(req: any): RevisionActor {
  const admin = req.session?.admin;
  return {
    id: admin?.id ?? null,
    username: admin?.username ?? null,
    role: admin?.role ?? null,
  };
}

export function revisionActor(req: any): RevisionActor {
  return actorFromRequest(req);
}

function previewToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function createContentRevision(input: {
  entityType: ContentEntityType;
  entityId: number;
  entityLabel: string;
  payload: RevisionPayload;
  req: any;
}) {
  const actor = actorFromRequest(input.req);
  const [revision] = await db.insert(contentRevisionsTable).values({
    entityType: input.entityType,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    payload: input.payload,
    status: "pending",
    createdById: actor.id ?? null,
    createdByUsername: actor.username ?? null,
    createdByRole: actor.role ?? null,
    previewToken: previewToken(),
    previewExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }).returning();
  return revision;
}

export async function getRevision(id: number) {
  const [revision] = await db.select().from(contentRevisionsTable)
    .where(eq(contentRevisionsTable.id, id));
  return revision ?? null;
}

export async function getPreviewRevision(token: string) {
  const [revision] = await db.select().from(contentRevisionsTable)
    .where(and(
      eq(contentRevisionsTable.previewToken, token),
      inArray(contentRevisionsTable.status, ["pending", "approved", "published"]),
    ));
  if (!revision || revision.previewExpiresAt.getTime() < Date.now()) return null;
  return {
    ...revision,
    basePayload: await getPreviewBasePayload(revision),
  };
}

async function getPreviewBasePayload(revision: any): Promise<RevisionPayload> {
  if (revision.entityId <= 0 || revision.payload?.operation === "create") return {};

  if (revision.entityType === "page") {
    const [row] = await db.select().from(pagesTable).where(eq(pagesTable.id, revision.entityId));
    return row ? revisionPayloadFromPage(row) : {};
  }
  if (revision.entityType === "blog") {
    const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, revision.entityId));
    return row ? revisionPayloadFromBlog(row) : {};
  }
  if (revision.entityType === "template") {
    const [row] = await db.select().from(pageTemplatesTable).where(eq(pageTemplatesTable.id, revision.entityId));
    return row ? { content: row.content } : {};
  }
  if (revision.entityType === "product") {
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, revision.entityId));
    return row ? revisionPayloadFromProduct(row) : {};
  }
  if (revision.entityType === "category") {
    const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, revision.entityId));
    return row ? revisionPayloadFromCategory(row) : {};
  }
  if (revision.entityType === "banner") {
    const [row] = await db.select().from(bannersTable).where(eq(bannersTable.id, revision.entityId));
    return row ? revisionPayloadFromBanner(row) : {};
  }
  return {};
}

export async function listContentRevisions(filters?: {
  status?: string;
  entityType?: string;
  entityId?: number;
  createdById?: number;
  createdByUsername?: string;
}) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(contentRevisionsTable.status, filters.status));
  if (filters?.entityType) conditions.push(eq(contentRevisionsTable.entityType, filters.entityType));
  if (filters?.entityId) conditions.push(eq(contentRevisionsTable.entityId, filters.entityId));
  if (filters?.createdById !== undefined || filters?.createdByUsername) {
    const ownerConditions = [];
    if (filters.createdById !== undefined) ownerConditions.push(eq(contentRevisionsTable.createdById, filters.createdById));
    if (filters.createdByUsername) ownerConditions.push(eq(contentRevisionsTable.createdByUsername, filters.createdByUsername));
    if (ownerConditions.length === 1) conditions.push(ownerConditions[0]);
    else if (ownerConditions.length > 1) conditions.push(or(...ownerConditions)!);
  }
  return db.select().from(contentRevisionsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(contentRevisionsTable.createdAt));
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function applyContentRevision(input: {
  revisionId: number;
  req: any;
  forcePublish?: boolean;
}) {
  const revision = await getRevision(input.revisionId);
  if (!revision) throw new Error("Revision not found");
  if (revision.status === "rejected") throw new Error("Rejected revisions cannot be published");

  const payload = revision.payload;
  const publishNow = input.forcePublish === true;
  const approvedAt = new Date();
  const actor = actorFromRequest(input.req);
  let appliedEntityId = revision.entityId;

  if (revision.entityType === "page") {
    const [row] = await db.update(pagesTable).set({
      title: String(payload.title ?? ""),
      slug: String(payload.slug ?? ""),
      content: payload.content == null ? null : String(payload.content),
      metaTitle: payload.metaTitle == null ? null : String(payload.metaTitle),
      metaDescription: payload.metaDescription == null ? null : String(payload.metaDescription),
      isPublished: publishNow ? true : Boolean(payload.isPublished),
      scheduledAt: publishNow ? null : toDate(payload.scheduledAt),
      updatedAt: approvedAt,
    }).where(eq(pagesTable.id, revision.entityId)).returning();
    if (!row) throw new Error("Page no longer exists");
  } else if (revision.entityType === "blog") {
    const requestedStatus = String(payload.status ?? "draft");
    const [row] = await db.update(blogPostsTable).set({
      title: String(payload.title ?? ""),
      slug: String(payload.slug ?? ""),
      excerpt: payload.excerpt == null ? null : String(payload.excerpt),
      content: payload.content == null ? null : String(payload.content),
      imageUrl: payload.imageUrl == null ? null : String(payload.imageUrl),
      author: payload.author == null ? null : String(payload.author),
      status: publishNow ? "published" : requestedStatus,
      scheduledAt: publishNow ? null : toDate(payload.scheduledAt),
      metaTitle: payload.metaTitle == null ? null : String(payload.metaTitle),
      metaDescription: payload.metaDescription == null ? null : String(payload.metaDescription),
      updatedAt: approvedAt,
    }).where(eq(blogPostsTable.id, revision.entityId)).returning();
    if (!row) throw new Error("Blog post no longer exists");
  } else if (revision.entityType === "template") {
    const [row] = await db.update(pageTemplatesTable).set({
      content: String(payload.content ?? ""),
      updatedAt: approvedAt,
    }).where(eq(pageTemplatesTable.id, revision.entityId)).returning();
    if (!row) throw new Error("Template no longer exists");
  } else if (revision.entityType === "product") {
    const operation = String(payload.operation ?? "update");
    if (operation === "delete") {
      const [row] = await db.delete(productsTable)
        .where(eq(productsTable.id, revision.entityId))
        .returning({ id: productsTable.id });
      if (!row) throw new Error("Product no longer exists");
    } else {
      const [row] = await db.update(productsTable).set({
        name: String(payload.name ?? ""),
        slug: String(payload.slug ?? ""),
        description: payload.description == null ? null : String(payload.description),
        shortDescription: payload.shortDescription == null ? null : String(payload.shortDescription),
        categoryId: payload.categoryId == null || payload.categoryId === "" ? null : Number(payload.categoryId),
        imageUrl: payload.imageUrl == null ? null : String(payload.imageUrl),
        images: Array.isArray(payload.images) ? payload.images.map(String) : [],
        isFeatured: Boolean(payload.isFeatured),
        isShowcase: Boolean(payload.isShowcase),
        isActive: Boolean(payload.isActive),
        minOrder: payload.minOrder == null || payload.minOrder === "" ? 100 : Number(payload.minOrder),
        metaTitle: payload.metaTitle == null ? null : String(payload.metaTitle),
        metaDescription: payload.metaDescription == null ? null : String(payload.metaDescription),
        sortOrder: payload.sortOrder == null || payload.sortOrder === "" ? 0 : Number(payload.sortOrder),
        regularPrice: payload.regularPrice == null ? null : String(payload.regularPrice),
        salePrice: payload.salePrice == null ? null : String(payload.salePrice),
        sku: payload.sku == null ? null : String(payload.sku),
        weight: payload.weight == null ? null : String(payload.weight),
        boxLength: payload.boxLength == null ? null : String(payload.boxLength),
        boxWidth: payload.boxWidth == null ? null : String(payload.boxWidth),
        boxHeight: payload.boxHeight == null ? null : String(payload.boxHeight),
        focusKeyword: payload.focusKeyword == null ? null : String(payload.focusKeyword),
        tags: payload.tags == null ? null : String(payload.tags),
        attributes: payload.attributes == null ? null : payload.attributes as Record<string, string>,
        updatedAt: approvedAt,
      }).where(eq(productsTable.id, revision.entityId)).returning();
      if (!row) throw new Error("Product no longer exists");
    }
  } else if (revision.entityType === "category") {
    const operation = String(payload.operation ?? "update");
    if (operation === "delete") {
      const [row] = await db.delete(categoriesTable)
        .where(eq(categoriesTable.id, revision.entityId))
        .returning({ id: categoriesTable.id });
      if (!row) throw new Error("Category no longer exists");
    } else if (operation === "create") {
      const [row] = await db.insert(categoriesTable).values({
        name: String(payload.name ?? ""),
        slug: String(payload.slug ?? ""),
        description: payload.description == null ? null : String(payload.description),
        imageUrl: payload.imageUrl == null ? null : String(payload.imageUrl),
        isFeatured: Boolean(payload.isFeatured),
        isActive: Boolean(payload.isActive),
        sortOrder: payload.sortOrder == null || payload.sortOrder === "" ? 0 : Number(payload.sortOrder),
        metaTitle: payload.metaTitle == null ? null : String(payload.metaTitle),
        metaDescription: payload.metaDescription == null ? null : String(payload.metaDescription),
        updatedAt: approvedAt,
      }).returning();
      if (!row) throw new Error("Unable to create category");
      appliedEntityId = row.id;
    } else {
      const [row] = await db.update(categoriesTable).set({
        name: payload.name == null ? undefined : String(payload.name),
        slug: payload.slug == null ? undefined : String(payload.slug),
        description: payload.description == null ? null : String(payload.description),
        imageUrl: payload.imageUrl == null ? null : String(payload.imageUrl),
        isFeatured: payload.isFeatured == null ? undefined : Boolean(payload.isFeatured),
        isActive: payload.isActive == null ? undefined : Boolean(payload.isActive),
        sortOrder: payload.sortOrder == null || payload.sortOrder === "" ? undefined : Number(payload.sortOrder),
        metaTitle: payload.metaTitle == null ? null : String(payload.metaTitle),
        metaDescription: payload.metaDescription == null ? null : String(payload.metaDescription),
        updatedAt: approvedAt,
      }).where(eq(categoriesTable.id, revision.entityId)).returning();
      if (!row) throw new Error("Category no longer exists");
    }
  } else if (revision.entityType === "banner") {
    const operation = String(payload.operation ?? "update");
    if (operation === "delete") {
      const [row] = await db.delete(bannersTable)
        .where(eq(bannersTable.id, revision.entityId))
        .returning({ id: bannersTable.id });
      if (!row) throw new Error("Banner no longer exists");
    } else if (operation === "create") {
      const [row] = await db.insert(bannersTable).values({
        title: String(payload.title ?? ""),
        subtitle: payload.subtitle == null ? null : String(payload.subtitle),
        imageUrl: payload.imageUrl == null ? null : String(payload.imageUrl),
        link: payload.link == null ? null : String(payload.link),
        isActive: Boolean(payload.isActive),
        sortOrder: payload.sortOrder == null || payload.sortOrder === "" ? 0 : Number(payload.sortOrder),
      }).returning();
      if (!row) throw new Error("Unable to create banner");
      appliedEntityId = row.id;
    } else {
      const [row] = await db.update(bannersTable).set({
        title: payload.title == null ? undefined : String(payload.title),
        subtitle: payload.subtitle == null ? null : String(payload.subtitle),
        imageUrl: payload.imageUrl == null ? null : String(payload.imageUrl),
        link: payload.link == null ? null : String(payload.link),
        isActive: payload.isActive == null ? undefined : Boolean(payload.isActive),
        sortOrder: payload.sortOrder == null || payload.sortOrder === "" ? undefined : Number(payload.sortOrder),
      }).where(eq(bannersTable.id, revision.entityId)).returning();
      if (!row) throw new Error("Banner no longer exists");
    }
  } else {
    throw new Error("Unsupported revision type");
  }

  const [updated] = await db.update(contentRevisionsTable).set({
    entityId: appliedEntityId,
    status: publishNow ? "published" : "approved",
    approvedById: actor.id ?? null,
    approvedByUsername: actor.username ?? null,
    approvedAt,
    publishedAt: publishNow ? approvedAt : null,
    rejectionReason: null,
  }).where(eq(contentRevisionsTable.id, revision.id)).returning();
  return updated;
}

export async function rejectContentRevision(input: {
  revisionId: number;
  req: any;
  reason?: string;
}) {
  const actor = actorFromRequest(input.req);
  const [updated] = await db.update(contentRevisionsTable).set({
    status: "rejected",
    approvedById: actor.id ?? null,
    approvedByUsername: actor.username ?? null,
    approvedAt: new Date(),
    rejectionReason: input.reason?.trim() || "Rejected by Super Admin",
  }).where(and(
    eq(contentRevisionsTable.id, input.revisionId),
    eq(contentRevisionsTable.status, "pending"),
  )).returning();
  if (!updated) throw new Error("Pending revision not found");
  return updated;
}

export function revisionPayloadFromPage(page: any): RevisionPayload {
  return {
    title: page.title,
    slug: page.slug,
    content: page.content ?? null,
    metaTitle: page.metaTitle ?? null,
    metaDescription: page.metaDescription ?? null,
    isPublished: page.isPublished !== false,
    scheduledAt: page.scheduledAt ?? null,
  };
}

export function revisionPayloadFromBlog(post: any): RevisionPayload {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? null,
    content: post.content ?? null,
    imageUrl: post.imageUrl ?? null,
    author: post.author ?? null,
    status: post.status ?? "draft",
    scheduledAt: post.scheduledAt ?? null,
    metaTitle: post.metaTitle ?? null,
    metaDescription: post.metaDescription ?? null,
  };
}

export function revisionPayloadFromProduct(product: any): RevisionPayload {
  return {
    operation: "update",
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    shortDescription: product.shortDescription ?? null,
    categoryId: product.categoryId ?? null,
    imageUrl: product.imageUrl ?? null,
    images: product.images ?? [],
    isFeatured: Boolean(product.isFeatured),
    isShowcase: Boolean(product.isShowcase),
    isActive: Boolean(product.isActive),
    minOrder: product.minOrder ?? 100,
    metaTitle: product.metaTitle ?? null,
    metaDescription: product.metaDescription ?? null,
    sortOrder: product.sortOrder ?? 0,
    regularPrice: product.regularPrice ?? null,
    salePrice: product.salePrice ?? null,
    sku: product.sku ?? null,
    weight: product.weight ?? null,
    boxLength: product.boxLength ?? null,
    boxWidth: product.boxWidth ?? null,
    boxHeight: product.boxHeight ?? null,
    focusKeyword: product.focusKeyword ?? null,
    tags: product.tags ?? null,
    attributes: product.attributes ?? null,
  };
}

export function revisionPayloadFromCategory(category: any, patch: Record<string, unknown> = {}, operation = "update"): RevisionPayload {
  const value = (key: string) => patch[key] !== undefined ? patch[key] : category[key];
  return {
    operation,
    name: value("name"),
    slug: value("slug"),
    description: value("description") ?? null,
    imageUrl: value("imageUrl") ?? null,
    isFeatured: value("isFeatured") !== false,
    isActive: value("isActive") !== false,
    sortOrder: value("sortOrder") ?? 0,
    metaTitle: value("metaTitle") ?? null,
    metaDescription: value("metaDescription") ?? null,
  };
}

export function revisionPayloadFromBanner(banner: any, patch: Record<string, unknown> = {}, operation = "update"): RevisionPayload {
  const value = (key: string) => patch[key] !== undefined ? patch[key] : banner[key];
  return {
    operation,
    title: value("title"),
    subtitle: value("subtitle") ?? null,
    imageUrl: value("imageUrl") ?? null,
    link: value("link") ?? null,
    isActive: value("isActive") !== false,
    sortOrder: value("sortOrder") ?? 0,
  };
}