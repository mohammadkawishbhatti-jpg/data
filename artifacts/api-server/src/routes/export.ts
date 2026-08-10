import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// ── helpers ────────────────────────────────────────────────────────────────────
function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function csvRow(vals: (string | null | undefined)[]): string {
  return vals
    .map(v => {
      const s = (v ?? "").replace(/"/g, '""');
      return `"${s}"`;
    })
    .join(",");
}

// ── GET /api/admin/export/products.csv ────────────────────────────────────────
router.get("/admin/export/products.csv", requireAdmin, async (_req, res) => {
  const prods = await db.select().from(productsTable).orderBy(productsTable.name);
  const cats  = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));

  const headers = [
    "ID","Type","SKU","Name","Published","Is featured?","Short description","Description",
    "Sale price","Regular price","Categories","Images",
    "Weight (lbs)","Length (in)","Width (in)","Height (in)",
    "Meta: title","Meta: rank_math_description","Meta: rank_math_focus_keyword",
    "Slug"
  ];

  const lines: string[] = [headers.map(h => `"${h}"`).join(",")];

  for (const p of prods) {
    const catName = p.categoryId ? (catMap.get(p.categoryId) ?? "") : "";
    const imgs    = Array.isArray(p.images) ? (p.images as string[]) : [];
    const allImgs = [p.imageUrl, ...imgs].filter(Boolean).join(", ");

    lines.push(csvRow([
      String(p.id),
      "simple",
      p.sku,
      p.name,
      p.isActive ? "1" : "0",
      p.isFeatured ? "1" : "0",
      p.shortDescription,
      p.description,
      p.salePrice,
      p.regularPrice,
      catName,
      allImgs,
      p.weight,
      p.boxLength,
      p.boxWidth,
      p.boxHeight,
      p.metaTitle,
      p.metaDescription,
      p.focusKeyword,
      p.slug,
    ]));
  }

  const csv = lines.join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="products.csv"');
  res.send("\uFEFF" + csv); // BOM for Excel compatibility
});

// ── GET /api/admin/export/products.xml ────────────────────────────────────────
router.get("/admin/export/products.xml", requireAdmin, async (_req, res) => {
  const prods = await db.select().from(productsTable).orderBy(productsTable.name);
  const cats  = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, { name: c.name, slug: c.slug }]));

  const now = new Date().toUTCString();
  const items = prods.map(p => {
    const cat    = p.categoryId ? catMap.get(p.categoryId) : null;
    const imgs   = Array.isArray(p.images) ? (p.images as string[]) : [];
    const allImgs = [p.imageUrl, ...imgs].filter(Boolean);

    return `  <item>
    <title>${esc(p.name)}</title>
    <link>https://www.primepackagingboxes.com/${esc(p.slug)}/</link>
    <wp:post_name>${esc(p.slug)}</wp:post_name>
    <wp:post_type>product</wp:post_type>
    <wp:status>${p.isActive ? "publish" : "draft"}</wp:status>
    <content:encoded><![CDATA[${p.description ?? ""}]]></content:encoded>
    <excerpt:encoded><![CDATA[${p.shortDescription ?? ""}]]></excerpt:encoded>${cat ? `
    <category domain="product_cat" nicename="${esc(cat.slug)}"><![CDATA[${esc(cat.name)}]]></category>` : ""}
    <wp:postmeta><wp:meta_key>_regular_price</wp:meta_key><wp:meta_value><![CDATA[${p.regularPrice ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_sale_price</wp:meta_key><wp:meta_value><![CDATA[${p.salePrice ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_sku</wp:meta_key><wp:meta_value><![CDATA[${p.sku ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_weight</wp:meta_key><wp:meta_value><![CDATA[${p.weight ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_length</wp:meta_key><wp:meta_value><![CDATA[${p.boxLength ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_width</wp:meta_key><wp:meta_value><![CDATA[${p.boxWidth ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_height</wp:meta_key><wp:meta_value><![CDATA[${p.boxHeight ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_featured</wp:meta_key><wp:meta_value><![CDATA[${p.isFeatured ? "yes" : "no"}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_yoast_wpseo_title</wp:meta_key><wp:meta_value><![CDATA[${p.metaTitle ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_yoast_wpseo_metadesc</wp:meta_key><wp:meta_value><![CDATA[${p.metaDescription ?? ""}]]></wp:meta_value></wp:postmeta>
    <wp:postmeta><wp:meta_key>_yoast_wpseo_focuskw</wp:meta_key><wp:meta_value><![CDATA[${p.focusKeyword ?? ""}]]></wp:meta_value></wp:postmeta>${allImgs.map((url, i) => `
    <wp:postmeta><wp:meta_key>_image_${i}</wp:meta_key><wp:meta_value><![CDATA[${url}]]></wp:meta_value></wp:postmeta>`).join("")}
  </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
  <pubDate>${now}</pubDate>
  <wp:wxr_version>1.2</wp:wxr_version>
${items}
</channel>
</rss>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="products.xml"');
  res.send(xml);
});

// ── GET /api/admin/export/categories.csv ──────────────────────────────────────
router.get("/admin/export/categories.csv", requireAdmin, async (_req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);

  const headers = ["ID","Name","Slug","Description","Image URL","Active","Sort Order","Meta Title","Meta Description"];
  const lines   = [headers.map(h => `"${h}"`).join(",")];

  for (const c of cats) {
    lines.push(csvRow([
      String(c.id), c.name, c.slug, c.description,
      c.imageUrl, c.isActive ? "1" : "0",
      String((c as any).sortOrder ?? 0),
      c.metaTitle, c.metaDescription,
    ]));
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="categories.csv"');
  res.send("\uFEFF" + lines.join("\n"));
});

// ── GET /api/admin/export/categories.xml ──────────────────────────────────────
router.get("/admin/export/categories.xml", requireAdmin, async (_req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);

  const terms = cats.map(c => `  <wp:term>
    <wp:term_id>${c.id}</wp:term_id>
    <wp:term_taxonomy>product_cat</wp:term_taxonomy>
    <wp:term_slug>${esc(c.slug)}</wp:term_slug>
    <wp:term_name><![CDATA[${c.name}]]></wp:term_name>
    <wp:term_description><![CDATA[${c.description ?? ""}]]></wp:term_description>
    <wp:term_meta><wp:meta_key>image_url</wp:meta_key><wp:meta_value><![CDATA[${c.imageUrl ?? ""}]]></wp:meta_value></wp:term_meta>
    <wp:term_meta><wp:meta_key>meta_title</wp:meta_key><wp:meta_value><![CDATA[${c.metaTitle ?? ""}]]></wp:meta_value></wp:term_meta>
    <wp:term_meta><wp:meta_key>meta_description</wp:meta_key><wp:meta_value><![CDATA[${c.metaDescription ?? ""}]]></wp:meta_value></wp:term_meta>
  </wp:term>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
  <pubDate>${new Date().toUTCString()}</pubDate>
  <wp:wxr_version>1.2</wp:wxr_version>
${terms}
</channel>
</rss>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="categories.xml"');
  res.send(xml);
});

export default router;
