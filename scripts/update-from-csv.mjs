/**
 * update-from-csv.mjs
 * CSV se products ka content DB mein update karo.
 * Usage: node scripts/update-from-csv.mjs
 */

import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { execSync } from "child_process";

const DB = process.env.DATABASE_URL;
if (!DB) { console.error("DATABASE_URL not set"); process.exit(1); }

// ── Helper: run a psql command ────────────────────────────────────────────────
function psql(sql) {
  return execSync(`psql "${DB}" -t -A -c ${JSON.stringify(sql)}`, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  }).trim();
}

// ── 1. CSV read ───────────────────────────────────────────────────────────────
const csv = readFileSync(
  new URL(
    "../attached_assets/wc-product-export-30-7-2026-1785451386332_1785528998795.csv",
    import.meta.url
  )
);
const rows = parse(csv, { columns: true, bom: true, skip_empty_lines: true });

// ── 2. DB products load ───────────────────────────────────────────────────────
const raw = psql("SELECT id||'|'||slug||'|'||name FROM products ORDER BY id");
const dbProducts = raw.split("\n").filter(Boolean).map(line => {
  const [id, slug, ...rest] = line.split("|");
  return { id: parseInt(id), slug, name: rest.join("|") };
});

// ── 3. Slug helper ────────────────────────────────────────────────────────────
function toSlug(s) {
  return s.toLowerCase().replace(/[''`]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

// ── 4. Manual slug overrides (CSV name → DB slug) ─────────────────────────────
const MANUAL = {
  "resealable mylar bags":           "custom-resealable-mylar-bags",
  "burger boxes":                    "custom-burger-boxes",
  "luxury candle packaging":         "custom-printed-candle-boxes",
  "corrugated mailer boxes":         "custom-corrugated-mailer-boxes",
  "cardboard gift boxes":            "custom-cardboard-gift-boxes",
  "die cut boxes":                   "custom-corrugated-shipping-boxes",
  "ring boxes":                      "custom-ring-boxes",
  "luxury chocolate boxes":          "luxury-chocolate-boxes",
  "counter display boxes":           "custom-counter-display-boxes",
  "clothing boxes":                  "custom-clothing-boxes",
  "tea boxes":                       "custom-tea-boxes",
  "christmas gift boxes":            "custom-christmas-gift-boxes",
  "kraft pizza boxes":               "custom-kraft-pizza-boxes",
  "custom cream jars":               "custom-cream-jar-packaging",
  "coffee bags":                     "custom-coffee-bags",
  "custom paper tubes":              "custom-paper-tubes",
  "custom medicine boxes":           "custom-medicine-boxes",
  "die cut stickers":                "custom-die-cut-stickers",
  "100ml bottle boxes":              "custom-100ml-bottle-boxes",
  "mobile phone packaging":          "custom-vape-cartridge-packaging",
  "breakfast cereal boxes":          "custom-breakfast-cereal-boxes",
  "hemp packaging":                  "custom-kratom-mylar-pouches",
  "paper shopping bags":             "custom-paper-shopping-bags",
  "packaging sleeves":               "custom-packaging-sleeves",
  "corrugated shipping boxes":       "custom-corrugated-shipping-boxes",
  "kraft window boxes":              "custom-kraft-window-boxes",
  "presentation folders":            "custom-presentation-folders",
  "vape cartridge packaging":        "custom-vape-cartridge-packaging",
  "custom phone case boxes":         "custom-medicine-boxes",
  "perfume boxes":                   "custom-perfume-boxes",
  "mushroom chocolate bar boxes":    "custom-mushroom-chocolate-bar-boxes",
  "freeze dried candy packaging":    "freeze-dried-candy-packaging",
  "drone packaging boxes":           "custom-drone-retail-packaging",
  "custom seed packet envelopes":    "custom-kraft-seed-packet-envelopes",
  "mushroom grow kit boxes":         "custom-mushroom-chocolate-bar-boxes",
  "custom eid gift boxes":           "custom-eid-gift-boxes",
  "custom diwali gift boxes":        "custom-diwali-gift-boxes",
  "custom pickle jar boxes":         "custom-cream-jar-packaging",
  "custom hot sauce boxes":          "custom-hot-sauce-boxes",
  "custom kratom packaging bags":    "custom-kratom-mylar-pouches",
  "custom wax melt packaging":       "custom-wax-melt-boxes",
  "custom kava packaging":           "custom-kava-adaptogen-pouches",
  "custom kombucha boxes":           "custom-kombucha-packaging",
  "custom microgreens packaging":    "custom-microgreens-packaging",
  "custom crystal/gemstone boxes":   "gemstone-crystal-display-boxes",
  "custom bone broth boxes":         "custom-supplement-standup-pouches",
  "custom collagen peptide bags":    "custom-supplement-standup-pouches",
  "custom smudge stick packaging":   "custom-incense-smudge-stick-boxes",
  "custom fermented food packaging": "custom-fermented-food-packaging",
  "custom candle cloche boxes":      "custom-printed-candle-boxes",
  "custom resin art packaging":      "custom-resin-art-gift-boxes",
  "custom spore syringe packaging":  "custom-medical-syringe-boxes",
  "custom charcuterie box packaging":"custom-charcuterie-gift-boxes",
  "custom matcha packaging":         "custom-matcha-powder-bags",
  "custom tallow balm boxes":        "custom-tallow-balm-packaging",
  "custom sourdough bread boxes":    "custom-bread-bakery-boxes",
  "custom adaptogens packaging":     "custom-kava-adaptogen-pouches",
};

const dbBySlug     = Object.fromEntries(dbProducts.map(p => [p.slug, p]));
const dbByNormName = Object.fromEntries(dbProducts.map(p => [toSlug(p.name), p]));

function findDbProduct(csvName) {
  const lower = csvName.toLowerCase().trim();
  if (MANUAL[lower]) return dbBySlug[MANUAL[lower]] || null;
  const slug = toSlug(csvName);
  if (dbBySlug[slug]) return dbBySlug[slug];
  if (dbByNormName[slug]) return dbByNormName[slug];
  return dbProducts.find(p => p.slug.includes(slug) || slug.includes(toSlug(p.name).slice(0,12))) || null;
}

// ── 5. Clean WordPress HTML ───────────────────────────────────────────────────
function cleanHtml(html) {
  if (!html) return "";
  return html
    .replace(/\\n/g,"\n").replace(/\\r/g,"")
    .replace(/<h1(\s[^>]*)?>/gi,"<h2$1>").replace(/<\/h1>/gi,"</h2>")
    .replace(/(<(?:span|b|strong|em|i))\s+style="[^"]*"/gi,"$1")
    .replace(/<span>/gi,"").replace(/<\/span>/gi,"")
    .replace(/<(p|div)[^>]*>\s*<\/\1>/gi,"")
    .replace(/\s{3,}/g," ").trim();
}

// ── 6. Escape for psql ────────────────────────────────────────────────────────
function esc(s) { return s.replace(/'/g,"''"); }

// ── 7. Update DB ──────────────────────────────────────────────────────────────
let updated = 0, skipped = 0, notFound = 0;

for (const row of rows) {
  const csvName = (row["Name"] || "").trim();
  if (!csvName) continue;

  const dbProd = findDbProduct(csvName);
  if (!dbProd) {
    console.log(`  ✗ NOT FOUND: "${csvName}"`);
    notFound++; continue;
  }

  const desc      = cleanHtml(row["Description"] || "");
  const shortDesc = (row["Short description"] || "").trim();
  const metaTitle = (row["Meta: title"] || "").trim();
  const metaDesc  = (row["Meta: rank_math_description"] || "").trim();
  const sku       = (row["SKU"] || "").trim();

  const parts = [];
  if (desc)      parts.push(`description = '${esc(desc)}'`);
  if (shortDesc) parts.push(`short_description = '${esc(shortDesc)}'`);
  if (metaTitle) parts.push(`meta_title = '${esc(metaTitle)}'`);
  if (metaDesc)  parts.push(`meta_description = '${esc(metaDesc)}'`);
  if (sku)       parts.push(`sku = '${esc(sku)}'`);

  if (parts.length === 0) { skipped++; continue; }

  psql(`UPDATE products SET ${parts.join(", ")} WHERE id = ${dbProd.id}`);
  console.log(`  ✓ ${dbProd.slug}`);
  updated++;
}

console.log(`\nDone! updated=${updated}  skipped=${skipped}  notFound=${notFound}`);
