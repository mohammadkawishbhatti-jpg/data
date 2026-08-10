import { Router } from "express";
import multer from "multer";
import { parseStringPromise } from "xml2js";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, pagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// Memory storage — accepts both XML (WXR) and CSV (WooCommerce)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "text/xml" ||
      file.mimetype === "application/xml" ||
      file.mimetype === "text/csv" ||
      file.mimetype === "application/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.endsWith(".xml") ||
      file.originalname.endsWith(".csv");
    cb(null, ok);
  },
});

// ── helpers ────────────────────────────────────────────────────────────────────

function txt(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val)) return String(val[0] ?? "").trim();
  return String(val).trim();
}

// ── Clean WordPress HTML content (removes literal \n artifacts from CSV export)
function cleanWpContent(html: string | null | undefined): string | null {
  if (!html) return null;
  return html
    .replace(/\\r\\n/g, " ")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\s{3,}/g, " ")
    .trim() || null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function getPostMeta(postmeta: any[], key: string): string {
  if (!Array.isArray(postmeta)) return "";
  const found = postmeta.find(
    (m) => txt(m?.["wp:meta_key"]) === key
  );
  return found ? txt(found?.["wp:meta_value"]) : "";
}

// ── POST /api/admin/import/wordpress ───────────────────────────────────────────
// Accepts a WordPress WXR .xml file, parses products + categories, upserts DB.

router.post(
  "/admin/import/wordpress",
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No XML file uploaded." });
    }

    let parsed: any;
    try {
      parsed = await parseStringPromise(req.file.buffer.toString("utf8"), {
        explicitArray: true,
        mergeAttrs: false,
      });
    } catch (e: any) {
      return res.status(400).json({ error: `XML parse error: ${e.message}` });
    }

    const channel = parsed?.rss?.channel?.[0];
    if (!channel) {
      return res.status(400).json({ error: "Invalid WXR: missing <channel>." });
    }

    const items: any[] = channel.item ?? [];
    const wpTerms: any[] = channel["wp:term"] ?? [];

    const stats = {
      categoriesCreated: 0,
      categoriesSkipped: 0,
      productsCreated: 0,
      productsUpdated: 0,
      productsSkipped: 0,
      pagesCreated: 0,
      pagesUpdated: 0,
      errors: [] as string[],
    };

    // ── 1. Import WXR terms (product_cat) as categories ──────────────────────
    for (const term of wpTerms) {
      const taxonomy = txt(term["wp:term_taxonomy"]);
      if (taxonomy !== "product_cat") continue;

      const name = txt(term["wp:term_name"]);
      const slug = txt(term["wp:term_slug"]) || slugify(name);
      const description = txt(term["wp:term_description"]);

      if (!name || !slug) continue;

      try {
        const existing = await db
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(eq(categoriesTable.slug, slug))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(categoriesTable).values({
            name,
            slug,
            description: description || null,
            isActive: true,
          });
          stats.categoriesCreated++;
        } else {
          stats.categoriesSkipped++;
        }
      } catch (e: any) {
        stats.errors.push(`Category "${name}": ${e.message}`);
      }
    }

    // ── 2. Also pick up inline <category domain="product_cat"> from items ────
    const inlineCategories = new Map<string, string>(); // slug → name
    for (const item of items) {
      const type = txt(item?.["wp:post_type"]);
      if (type !== "product") continue;

      const cats: any[] = item?.category ?? [];
      for (const c of cats) {
        const domain = c?.$?.domain ?? "";
        if (!String(domain).includes("product_cat")) continue;
        const catName = txt(c?._);
        const catSlug = txt(c?.$?.nicename) || slugify(catName);
        if (catName && catSlug) inlineCategories.set(catSlug, catName);
      }
    }

    for (const [slug, name] of inlineCategories.entries()) {
      try {
        const existing = await db
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(eq(categoriesTable.slug, slug))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(categoriesTable).values({ name, slug, isActive: true });
          stats.categoriesCreated++;
        }
      } catch (_) { /* skip */ }
    }

    // ── 3. Refresh categories lookup map ────────────────────────────────────
    const allCategories = await db
      .select({ id: categoriesTable.id, slug: categoriesTable.slug })
      .from(categoriesTable);
    const catBySlug = new Map(allCategories.map((c) => [c.slug, c.id]));

    // ── 4. Import products ──────────────────────────────────────────────────
    for (const item of items) {
      const postType = txt(item?.["wp:post_type"]);
      if (postType !== "product") continue;

      const status = txt(item?.["wp:status"]);
      // Import publish + draft; skip trash/auto-draft
      if (status === "trash" || status === "auto-draft") continue;

      const name = txt(item?.title);
      if (!name) continue;

      const rawSlug = txt(item?.["wp:post_name"]) || slugify(name);
      const slug = rawSlug || slugify(name);
      const description = cleanWpContent(txt(item?.["content:encoded"]));
      const shortDescription = cleanWpContent(txt(item?.["excerpt:encoded"]));

      // Meta fields
      const postmeta: any[] = item?.["wp:postmeta"] ?? [];
      const regularPrice = getPostMeta(postmeta, "_regular_price");
      const salePrice    = getPostMeta(postmeta, "_sale_price");
      const sku          = getPostMeta(postmeta, "_sku");
      const weight       = getPostMeta(postmeta, "_weight");
      const boxLength    = getPostMeta(postmeta, "_length");
      const boxWidth     = getPostMeta(postmeta, "_width");
      const boxHeight    = getPostMeta(postmeta, "_height");
      const isFeatured   = getPostMeta(postmeta, "_featured") === "yes";
      const thumbId      = getPostMeta(postmeta, "_thumbnail_id");

      // Image URL from attachment — best effort
      let imageUrl = "";
      if (thumbId) {
        const imgItem = items.find(
          (i) =>
            txt(i?.["wp:post_type"]) === "attachment" &&
            txt(i?.["wp:post_id"]) === thumbId
        );
        if (imgItem) imageUrl = txt(imgItem?.["wp:attachment_url"]);
      }

      // Gallery images
      const galleryIds = getPostMeta(postmeta, "_product_image_gallery")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const galleryUrls: string[] = [];
      for (const gid of galleryIds) {
        const gItem = items.find(
          (i) =>
            txt(i?.["wp:post_type"]) === "attachment" &&
            txt(i?.["wp:post_id"]) === gid
        );
        if (gItem) galleryUrls.push(txt(gItem?.["wp:attachment_url"]));
      }

      // Category resolution
      const cats: any[] = item?.category ?? [];
      let categoryId: number | null = null;
      for (const c of cats) {
        const domain = c?.$?.domain ?? "";
        if (!String(domain).includes("product_cat")) continue;
        const catSlug = txt(c?.$?.nicename);
        const cid = catBySlug.get(catSlug);
        if (cid) { categoryId = cid; break; }
      }

      const metaTitle       = getPostMeta(postmeta, "_yoast_wpseo_title") || name;
      const metaDescription = getPostMeta(postmeta, "_yoast_wpseo_metadesc") || "";
      const focusKeyword    = getPostMeta(postmeta, "_yoast_wpseo_focuskw") || "";

      const productData = {
        name,
        slug,
        description:      description  || null,
        shortDescription: shortDescription || null,
        categoryId,
        imageUrl:         imageUrl || null,
        images:           galleryUrls.length > 0 ? galleryUrls : [],
        isFeatured,
        isActive:         status === "publish",
        regularPrice:     regularPrice || null,
        salePrice:        salePrice    || null,
        sku:              sku          || null,
        weight:           weight       || null,
        boxLength:        boxLength    || null,
        boxWidth:         boxWidth     || null,
        boxHeight:        boxHeight    || null,
        metaTitle:        metaTitle    || null,
        metaDescription:  metaDescription || null,
        focusKeyword:     focusKeyword || null,
      };

      try {
        const existing = await db
          .select({ id: productsTable.id })
          .from(productsTable)
          .where(eq(productsTable.slug, slug))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(productsTable).values(productData);
          stats.productsCreated++;
        } else {
          await db
            .update(productsTable)
            .set({ ...productData, updatedAt: new Date() })
            .where(eq(productsTable.id, existing[0].id));
          stats.productsUpdated++;
        }
      } catch (e: any) {
        stats.productsSkipped++;
        stats.errors.push(`Product "${name}": ${e.message}`);
      }
    }

    // ── 5. Import WordPress pages ──────────────────────────────────────────
    for (const item of items) {
      const postType = txt(item?.["wp:post_type"]);
      if (postType !== "page") continue;

      const status = txt(item?.["wp:status"]);
      if (status === "trash" || status === "auto-draft") continue;

      const title = txt(item?.title);
      if (!title) continue;

      const slug = txt(item?.["wp:post_name"]) || slugify(title);
      const content = txt(item?.["content:encoded"]);
      const postmeta: any[] = item?.["wp:postmeta"] ?? [];
      const metaTitle       = getPostMeta(postmeta, "_yoast_wpseo_title") || title;
      const metaDescription = getPostMeta(postmeta, "_yoast_wpseo_metadesc") || "";
      const isPublished     = status === "publish";

      try {
        const existing = await db
          .select({ id: pagesTable.id })
          .from(pagesTable)
          .where(eq(pagesTable.slug, slug))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(pagesTable).values({
            title,
            slug,
            content: content || null,
            metaTitle: metaTitle || null,
            metaDescription: metaDescription || null,
            isPublished,
          });
          stats.pagesCreated++;
        } else {
          await db.update(pagesTable)
            .set({ title, content: content || null, metaTitle: metaTitle || null, metaDescription: metaDescription || null, isPublished, updatedAt: new Date() })
            .where(eq(pagesTable.id, existing[0].id));
          stats.pagesUpdated++;
        }
      } catch (e: any) {
        stats.errors.push(`Page "${title}": ${e.message}`);
      }
    }

    return res.json({
      ok: true,
      stats,
      message: `Import complete — ${stats.productsCreated} products created, ${stats.productsUpdated} updated, ${stats.pagesCreated} pages created.`,
    });
  }
);

// ── Simple CSV parser (handles quoted fields with commas inside) ───────────────
function parseCSV(text: string): Record<string, string>[] {
  // Strip UTF-8 BOM and normalise line endings
  const src = text.replace(/^\uFEFF/, "");

  // ── Full character-by-character parser ────────────────────────────────────
  // This correctly handles quoted fields that contain embedded newlines
  // (e.g. HTML descriptions in WooCommerce exports).
  const records: string[][] = [];
  let fields: string[] = [];
  let cur = "";
  let inQuote = false;
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === '"') {
      if (inQuote && src[i + 1] === '"') {
        // Escaped quote inside quoted field
        cur += '"';
        i += 2;
      } else {
        inQuote = !inQuote;
        i++;
      }
    } else if (ch === "," && !inQuote) {
      fields.push(cur);
      cur = "";
      i++;
    } else if ((ch === "\n" || ch === "\r") && !inQuote) {
      // Skip \r of \r\n pair
      if (ch === "\r" && src[i + 1] === "\n") i++;
      fields.push(cur);
      if (fields.some(f => f.trim())) records.push(fields);
      fields = [];
      cur = "";
      i++;
    } else {
      cur += ch;
      i++;
    }
  }
  // Last field / record
  fields.push(cur);
  if (fields.some(f => f.trim())) records.push(fields);

  if (records.length < 2) return [];

  const headers = records[0].map(h => h.trim());
  return records.slice(1).map(vals => {
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] ?? "").trim(); });
    return row;
  });
}

// ── Column name aliases (WooCommerce CSV headers vary slightly) ───────────────
function col(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k.toLowerCase()] ?? row[k] ?? "";
    if (v) return v;
  }
  return "";
}

// ── POST /api/admin/import/csv ─────────────────────────────────────────────────
// Accepts a WooCommerce product export CSV.
// ?mode=replace  → deletes ALL existing products first, then imports fresh.
// ?mode=skip     → (default) skips products whose slug already exists.
router.post(
  "/admin/import/csv",
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No CSV file uploaded." });

    const mode = (req.query.mode as string) || "skip"; // "replace" | "skip"

    let rows: Record<string, string>[];
    try {
      rows = parseCSV(req.file.buffer.toString("utf8"));
    } catch (e: any) {
      return res.status(400).json({ error: `CSV parse error: ${e.message}` });
    }
    if (rows.length === 0) {
      return res.status(400).json({ error: "CSV appears empty or has no data rows." });
    }

    const stats = {
      categoriesCreated: 0,
      categoriesSkipped: 0,
      productsCreated: 0,
      productsUpdated: 0,
      productsSkipped: 0,
      productsDeleted: 0,
      errors: [] as string[],
    };

    // ── 0. Replace mode — wipe all products first ─────────────────────────────
    if (mode === "replace") {
      try {
        const deleted = await db.delete(productsTable).returning({ id: productsTable.id });
        stats.productsDeleted = deleted.length;
      } catch (e: any) {
        return res.status(500).json({ error: `Failed to clear products: ${e.message}` });
      }
    }

    // ── 1. Collect & upsert categories ────────────────────────────────────────
    const catNames = new Set<string>();
    for (const row of rows) {
      const type = col(row, "type").toLowerCase();
      if (type === "variation" || type === "grouped") continue;
      const cats = col(row, "categories", "category");
      if (!cats) continue;
      // WooCommerce: "Category A, Category B > Sub" — split by comma, take first part before >
      cats.split(",").forEach(c => {
        const top = c.split(">")[0].trim();
        if (top) catNames.add(top);
      });
    }

    for (const name of catNames) {
      const slug = slugify(name);
      if (!slug) continue;
      try {
        const ex = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, slug)).limit(1);
        if (ex.length === 0) {
          await db.insert(categoriesTable).values({ name, slug, isActive: true });
          stats.categoriesCreated++;
        } else {
          stats.categoriesSkipped++;
        }
      } catch (e: any) {
        stats.errors.push(`Category "${name}": ${e.message}`);
      }
    }

    // ── 2. Refresh category lookup ─────────────────────────────────────────────
    const allCats = await db.select({ id: categoriesTable.id, slug: categoriesTable.slug }).from(categoriesTable);
    const catBySlug = new Map(allCats.map(c => [c.slug, c.id]));

    // ── 3. Import products (SKIP existing) ────────────────────────────────────
    for (const row of rows) {
      const type = col(row, "type").toLowerCase();
      // Skip variations and grouped parent placeholders
      if (type === "variation") continue;

      const name = col(row, "name");
      if (!name) continue;

      const slug = col(row, "slug", "post name") || slugify(name);
      if (!slug) continue;

      // ── Map fields ──────────────────────────────────────────────────────────
      const isPublished = col(row, "published", "status") === "1" || col(row, "published", "status").toLowerCase() === "publish";
      const isFeatured  = col(row, "is featured?", "featured", "is featured") === "1";
      const regularPrice = col(row, "regular price");
      const salePrice    = col(row, "sale price");
      const sku          = col(row, "sku");
      const weight       = col(row, "weight (kg)", "weight (lbs)", "weight");
      const boxLength    = col(row, "length (cm)", "length (in)", "length");
      const boxWidth     = col(row, "width (cm)",  "width (in)",  "width");
      const boxHeight    = col(row, "height (cm)", "height (in)", "height");
      const description  = cleanWpContent(col(row, "description"));
      const shortDesc    = cleanWpContent(col(row, "short description"));

      // Images: comma-separated URLs
      const images = col(row, "images", "image").split(",").map(u => u.trim()).filter(Boolean);
      const imageUrl    = images[0] || null;
      const galleryUrls = images.slice(1);

      // SEO — supports Yoast, RankMath, or plain meta columns
      const metaTitle = col(
        row,
        "meta: rank_math_title",   // RankMath (with title template)
        "meta: title",             // RankMath plain title / generic
        "meta: _yoast_wpseo_title","seo title","yoast seo: seo title"
      ) || name;
      const metaDescription = col(
        row,
        "meta: rank_math_description",
        "meta: _yoast_wpseo_metadesc","seo description","yoast seo: meta description"
      ) || "";
      const focusKeyword = col(
        row,
        "meta: rank_math_focus_keyword",
        "meta: _yoast_wpseo_focuskw","focus keyword"
      ) || "";

      // Category resolution: take first valid category slug
      let categoryId: number | null = null;
      const catsStr = col(row, "categories", "category");
      if (catsStr) {
        for (const c of catsStr.split(",")) {
          const top  = c.split(">")[0].trim();
          const cid  = catBySlug.get(slugify(top));
          if (cid) { categoryId = cid; break; }
        }
      }

      const productData = {
        name,
        slug,
        description:      description  || null,
        shortDescription: shortDesc    || null,
        categoryId,
        imageUrl,
        images:           galleryUrls.length ? galleryUrls : [],
        isFeatured,
        isActive:         isPublished,
        regularPrice:     regularPrice || null,
        salePrice:        salePrice    || null,
        sku:              sku          || null,
        weight:           weight       || null,
        boxLength:        boxLength    || null,
        boxWidth:         boxWidth     || null,
        boxHeight:        boxHeight    || null,
        metaTitle:        metaTitle    || null,
        metaDescription:  metaDescription || null,
        focusKeyword:     focusKeyword || null,
      };

      try {
        // In replace-mode all rows were deleted, so always insert.
        // In normal mode: update if exists, insert if new.
        if (mode === "replace") {
          await db.insert(productsTable).values(productData);
          stats.productsCreated++;
        } else {
          const ex = await db
            .select({ id: productsTable.id })
            .from(productsTable)
            .where(eq(productsTable.slug, slug))
            .limit(1);

          if (ex.length > 0) {
            await db
              .update(productsTable)
              .set({ ...productData, updatedAt: new Date() })
              .where(eq(productsTable.id, ex[0].id));
            stats.productsUpdated++;
          } else {
            await db.insert(productsTable).values(productData);
            stats.productsCreated++;
          }
        }
      } catch (e: any) {
        stats.productsSkipped++;
        stats.errors.push(`Product "${name}": ${e.message}`);
      }
    }

    const modeLabel = mode === "replace"
      ? `${stats.productsDeleted} old products deleted, ${stats.productsCreated} imported fresh`
      : `${stats.productsCreated} new, ${stats.productsUpdated} updated, ${stats.productsSkipped} errors`;

    return res.json({
      ok: true,
      stats,
      message: `CSV import done — ${modeLabel}, ${stats.categoriesCreated} categories created.`,
    });
  }
);

export default router;
