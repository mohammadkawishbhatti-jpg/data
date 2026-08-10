// Update product descriptions from WooCommerce CSV export
// Run: node scripts/update-product-content.mjs

import { createReadStream } from "fs";
import { parse } from "csv-parse";
import pg from "pg";
import { fileURLToPath } from "url";
import path from "path";

const { Pool } = pg;

const DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!DB_URL) throw new Error("No DATABASE_URL set");

const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

const CSV_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../attached_assets/wc-product-export-30-7-2026-1785451386332_1785499156486.csv"
);

function cleanHtml(html) {
  if (!html) return "";
  // Fix literal \n sequences (appear as /n in browser)
  html = html.replace(/\\\n/g, " ");
  // Collapse real newlines/tabs into spaces
  html = html.replace(/[\r\n\t]+/g, " ");
  // Collapse multiple spaces
  html = html.replace(/ {2,}/g, " ");
  // Clean whitespace between tags
  html = html.replace(/>\s+</g, "><");
  return html.trim();
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const rows = await new Promise((resolve, reject) => {
    const results = [];
    createReadStream(CSV_PATH)
      .pipe(parse({ columns: true, bom: true, relax_quotes: true, skip_empty_lines: true }))
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });

  console.log(`📄 CSV rows loaded: ${rows.length}`);

  let updated = 0, skipped = 0;

  for (const row of rows) {
    const name = (row["Name"] || "").trim();
    if (!name) { skipped++; continue; }

    const shortDesc = (row["Short description"] || "").trim();
    const description = cleanHtml(row["Description"] || "");
    const slug = toSlug(name);

    // Try match by slug first, then by name
    const result = await pool.query(
      `UPDATE products
       SET short_description = $1,
           description       = $2,
           updated_at        = NOW()
       WHERE slug = $3 OR LOWER(name) = LOWER($4)
       RETURNING id, name`,
      [shortDesc, description, slug, name]
    );

    if (result.rowCount > 0) {
      console.log(`  ✅ Updated: ${result.rows[0].name}`);
      updated++;
    } else {
      console.log(`  ⚠️  Not found in DB: ${name}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Done! Updated: ${updated} | Skipped/Not found: ${skipped}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
