#!/usr/bin/env node
/**
 * ────────────────────────────────────────────────────────────────────
 * sync-db-to-setup.mjs
 *
 * Automatically exports the current Replit DB (categories + products +
 * site_settings basics) and regenerates the db-setup.ts seed section.
 *
 * Run this EVERY TIME you add/update data in Replit and want it to
 * appear on the production (cPanel) server after the next deploy.
 *
 * Usage:
 *   node scripts/sync-db-to-setup.mjs
 *
 * ⚠️  IMPORTANT — 2 ALAG DATABASES:
 *
 *   REPLIT DB  →  sirf Replit (dev) ka data
 *   cPANEL DB  →  sirf live site (primepackagingboxes.com) ka data
 *
 *   Yeh dono KABHI auto-sync nahi hote.
 *
 *   ✅ cPanel pe admin panel se jo bhi changes karo (product add/edit,
 *      category, blog, settings) — woh FORAN cPanel DB mein save hote hain.
 *      Koi script chalane ki zaroorat NAHI.
 *
 *   ✅ Yeh script sirf tab chalao jab:
 *      - Replit mein naya data daala ho (dev mein kaam kiya ho)
 *      - Nayi/fresh server setup karni ho (DB wipe hone ke baad)
 *      - db-setup.ts ko latest Replit data ke saath update karna ho
 *
 *   🔴 KHABARDAR: db-setup URL ek baar se zyada chalane pe
 *      existing cPanel products OVERWRITE NAHI hote (DO NOTHING).
 *      cPanel ka data safe hai.
 *
 * What it does:
 *   1. Connects to the Replit PostgreSQL DB (DATABASE_URL)
 *   2. Reads all categories, products, and site settings
 *   3. Updates artifacts/api-server/src/routes/db-setup.ts with real data
 *   4. Rebuilds the API server (dist/index.mjs)
 *   5. Shows git diff summary
 *
 * After running this script:
 *   git add -A && git commit -m "sync: update db seed data" && git push origin main
 *   Then on cPanel: git pull && restart app
 *   Then open: primepackagingboxes.com/api/db-setup?key=prime-setup-2024-kawish
 * ────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { execSync } from "child_process";

const require = createRequire(import.meta.url);
const pg = require(
  path.resolve("node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/index.js")
);

const DB_SETUP_PATH = "artifacts/api-server/src/routes/db-setup.ts";

// ─────────────────────────────────────────────────────────
// 1. Connect to DB
// ─────────────────────────────────────────────────────────
const connStr = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!connStr) {
  console.error("❌  DATABASE_URL not set. Run inside Replit or set it manually.");
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: connStr });

console.log("🔗  Connected to DB. Exporting data...\n");

// ─────────────────────────────────────────────────────────
// 2. Export data
// ─────────────────────────────────────────────────────────
const [catsResult, prodsResult, settingsResult] = await Promise.all([
  pool.query(
    `SELECT id, name, slug, description, image_url, is_active, sort_order,
            meta_title, meta_description
     FROM categories ORDER BY sort_order, id`
  ),
  pool.query(
    `SELECT
       p.name, p.slug, c.slug AS cat_slug,
       p.description, p.short_description,
       p.image_url, p.images,
       p.is_active, p.is_featured, p.min_order,
       p.meta_title, p.meta_description, p.sort_order,
       p.regular_price, p.sale_price, p.sku, p.weight,
       p.box_length, p.box_width, p.box_height,
       p.focus_keyword, p.tags, p.attributes
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.sort_order, p.id`
  ),
  pool.query(
    `SELECT site_name, email, phone, address, robots_txt,
            whatsapp, facebook, instagram, twitter, linkedin,
            meta_title, meta_description, announcement_bar,
            clark_enabled, clark_bot_name, clark_greeting,
            clark_company_phone, clark_company_email, clark_company_address,
            clark_tone_notes, clark_quote_hours
     FROM site_settings LIMIT 1`
  ),
]);

const categories = catsResult.rows;
const products = prodsResult.rows;
const settings = settingsResult.rows[0] || {};

console.log(`✅  Categories : ${categories.length}`);
console.log(`✅  Products   : ${products.length}`);
console.log(`✅  Settings   : ${Object.keys(settings).length} fields\n`);

await pool.end();

// ─────────────────────────────────────────────────────────
// 3. Generate JS array strings
// ─────────────────────────────────────────────────────────
const j = JSON.stringify; // shorthand

const catArr = categories
  .map(
    (c) =>
      `      [${j(c.name)}, ${j(c.slug)}, ${j(c.image_url || null)}, ${
        c.is_active ? "true" : "false"
      }, ${Number(c.sort_order) || 0}, ${j(c.meta_title || null)}, ${j(
        c.meta_description || null
      )}]`
  )
  .join(",\n");

const prodArr = products
  .map((p) => {
    const imgs = Array.isArray(p.images)
      ? p.images
      : p.images
      ? JSON.parse(p.images)
      : [];
    const attrs = p.attributes ? JSON.stringify(p.attributes) : "null";
    return `      [${j(p.name)}, ${j(p.slug)}, ${j(p.cat_slug)}, ${j(
      p.description
    )}, ${j(p.short_description)}, ${j(p.image_url)}, ${j(imgs)}, ${
      p.is_active ? "true" : "false"
    }, ${p.is_featured ? "true" : "false"}, ${Number(p.min_order) || 100}, ${j(
      p.meta_title
    )}, ${j(p.meta_description)}, ${Number(p.sort_order) || 0}, ${j(
      p.regular_price
    )}, ${j(p.sale_price)}, ${j(p.sku)}, ${j(p.weight)}, ${j(
      p.box_length
    )}, ${j(p.box_width)}, ${j(p.box_height)}, ${j(p.focus_keyword)}, ${j(
      p.tags
    )}, ${attrs}]`;
  })
  .join(",\n");

// ─────────────────────────────────────────────────────────
// 4. Generate full db-setup.ts content
// ─────────────────────────────────────────────────────────
const ts = `import { Router } from "express";
// @ts-ignore — pg types resolved at runtime
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = Router();

const SETUP_KEY = process.env.DB_SETUP_KEY || "prime-setup-2024-kawish";

// GET /api/db-setup?key=prime-setup-2024-kawish
router.get("/", async (req, res) => {
  if (req.query.key !== SETUP_KEY) {
    return res.status(403).json({ error: "Invalid key" });
  }

  const client = await pool.connect();
  try {
    const results: string[] = [];

    // ── Create all tables ──────────────────────────────────────────────────
    const schema = \`
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username text NOT NULL UNIQUE,
  email text,
  role text NOT NULL DEFAULT 'admin',
  password_hash text NOT NULL,
  totp_secret text,
  totp_enabled boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session (
  sid varchar NOT NULL COLLATE "default" PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id integer REFERENCES categories(id),
  description text,
  short_description text,
  image_url text,
  images json DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  min_order integer DEFAULT 100,
  meta_title text,
  meta_description text,
  sort_order integer NOT NULL DEFAULT 0,
  regular_price text,
  sale_price text,
  sku text,
  weight text,
  box_length text,
  box_width text,
  box_height text,
  focus_keyword text,
  tags text,
  attributes json,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  link text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  image_url text,
  author text,
  status text NOT NULL DEFAULT 'draft',
  meta_title text,
  meta_description text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  follow_up_done boolean NOT NULL DEFAULT false,
  follow_up_date timestamp,
  follow_up_notes text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  product_type text,
  quantity text,
  dimensions text,
  material text,
  printing_details text,
  additional_notes text,
  status text NOT NULL DEFAULT 'new',
  source text DEFAULT 'form',
  clark_session_id text,
  clark_transcript text,
  clark_last_activity timestamp,
  admin_pending_message text,
  admin_took_over boolean DEFAULT false,
  clark_ip text,
  clark_country text,
  clark_city text,
  notes text,
  follow_up_done boolean NOT NULL DEFAULT false,
  follow_up_date timestamp,
  follow_up_notes text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT true,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_templates (
  id SERIAL PRIMARY KEY,
  type text NOT NULL UNIQUE,
  name text NOT NULL,
  content text,
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name text,
  site_description text,
  logo_url text,
  favicon_url text,
  email text,
  phone text,
  address text,
  robots_txt text,
  sitemap_settings text,
  header_code text,
  footer_code text,
  admin_email text,
  smtp_settings text,
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_pass text,
  smtp_from text,
  smtp_to text,
  smtp_secure text DEFAULT 'false',
  smtp2_host text,
  smtp2_port integer,
  smtp2_user text,
  smtp2_pass text,
  smtp2_from text,
  smtp2_secure text DEFAULT 'false',
  country_block_enabled text DEFAULT 'false',
  blocked_countries text,
  gemini_api_key text,
  clark_enabled text DEFAULT 'true',
  clark_bot_name text DEFAULT 'Clark',
  clark_greeting text,
  clark_company_phone text,
  clark_company_email text,
  clark_company_address text,
  clark_tone_notes text,
  clark_quote_hours text DEFAULT '2',
  clark_custom_faqs text,
  whatsapp text,
  facebook text,
  instagram text,
  twitter text,
  linkedin text,
  meta_title text,
  meta_description text,
  announcement_bar text,
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  customer_number text UNIQUE,
  username text UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  company text,
  notes text,
  password_hash text,
  portal_password text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number text,
  customer_id integer REFERENCES customers(id),
  customer_email text,
  customer_name text,
  status text NOT NULL DEFAULT 'confirmed',
  items json DEFAULT '[]',
  subtotal text,
  tax text,
  total text,
  currency text DEFAULT 'USD',
  tracking_number text,
  estimated_delivery text,
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  order_id integer REFERENCES orders(id),
  customer_id integer REFERENCES customers(id),
  invoice_number text,
  customer_email text,
  customer_name text,
  customer_company text,
  customer_phone text,
  customer_country text,
  exec_name text,
  exec_title text,
  exec_phone text,
  exec_email text,
  currency text DEFAULT 'USD',
  subtotal text DEFAULT '0',
  tax text DEFAULT '0',
  items json DEFAULT '[]',
  total text DEFAULT '0',
  price_includes text,
  production_time text,
  delivery text,
  notes_text text,
  payment_terms text,
  status text NOT NULL DEFAULT 'draft',
  due_date timestamp,
  sent_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
\`;

    await client.query(schema);
    results.push("All 14 tables created (or already existed)");

    // ── Seed admin user ────────────────────────────────────────────────────
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    // IMPORTANT: ADMIN_PASSWORD must be set in the server .env — no default fallback here
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!adminPass) throw new Error("ADMIN_PASSWORD env var is required to seed admin user");
    const crypto = await import("crypto");
    const passwordHash = crypto.createHash("sha256").update(adminPass + "prime_salt_2024").digest("hex");

    await client.query(
      \`INSERT INTO admin_users (username, email, role, password_hash)
       VALUES ($1, 'admin@primepackagingboxes.com', 'superadmin', $2)
       ON CONFLICT (username) DO NOTHING\`,
      [adminUser, passwordHash]
    );
    results.push("Admin user seeded");

    // ── Seed site settings ─────────────────────────────────────────────────
    await client.query(
      \`INSERT INTO site_settings (id, site_name, email, phone,
         whatsapp, facebook, instagram, twitter, linkedin,
         meta_title, meta_description, announcement_bar,
         clark_enabled, clark_bot_name, clark_greeting,
         clark_company_phone, clark_company_email, clark_company_address,
         clark_tone_notes, clark_quote_hours,
         robots_txt)
       VALUES (1,
         ${j(settings.site_name || "Prime Packaging Boxes")},
         ${j(settings.email || "info@primepackagingboxes.com")},
         ${j(settings.phone || "+1 (888) 123-4567")},
         ${j(settings.whatsapp || null)},
         ${j(settings.facebook || null)},
         ${j(settings.instagram || null)},
         ${j(settings.twitter || null)},
         ${j(settings.linkedin || null)},
         ${j(settings.meta_title || null)},
         ${j(settings.meta_description || null)},
         ${j(settings.announcement_bar || null)},
         ${j(settings.clark_enabled || "true")},
         ${j(settings.clark_bot_name || "Clark")},
         ${j(settings.clark_greeting || null)},
         ${j(settings.clark_company_phone || null)},
         ${j(settings.clark_company_email || null)},
         ${j(settings.clark_company_address || null)},
         ${j(settings.clark_tone_notes || null)},
         ${j(settings.clark_quote_hours || "2")},
         E'User-agent: *\\nDisallow: /\\n\\nSitemap: https://primepackagingboxes.com/sitemap.xml'
       )
       ON CONFLICT (id) DO NOTHING\`
    );
    results.push("Site settings seeded");

    // ── Seed categories ────────────────────────────────────────────────────
    // [name, slug, image_url, is_active, sort_order, meta_title, meta_description]
    // Auto-generated by: node scripts/sync-db-to-setup.mjs  (${new Date().toISOString().slice(0,10)})
    const categories: [string, string, string | null, boolean, number, string | null, string | null][] = [
${catArr}
    ];

    let categoriesInserted = 0;
    for (const [name, slug, image_url, is_active, sort_order, meta_title, meta_description] of categories) {
      const r = await client.query(
        \`INSERT INTO categories (name, slug, image_url, is_active, sort_order, meta_title, meta_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING\`,
        [name, slug, image_url, is_active, sort_order, meta_title, meta_description]
      );
      if (r.rowCount && r.rowCount > 0) categoriesInserted++;
    }
    results.push(\`\${categoriesInserted} categories inserted (\${categories.length - categoriesInserted} already existed)\`);

    // ── Seed products ──────────────────────────────────────────────────────
    // [name, slug, cat_slug, description, short_description, image_url, images,
    //  is_active, is_featured, min_order, meta_title, meta_description, sort_order,
    //  regular_price, sale_price, sku, weight, box_length, box_width, box_height,
    //  focus_keyword, tags, attributes]
    // Auto-generated by: node scripts/sync-db-to-setup.mjs  (${new Date().toISOString().slice(0,10)})
    const products: [string, string, string | null, string | null, string | null, string | null, string[], boolean, boolean, number, string | null, string | null, number, string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null, string | null, any][] = [
${prodArr}
    ];

    let productsInserted = 0;
    for (const [name, slug, cat_slug, description, short_description, image_url, images, is_active, is_featured, min_order, meta_title, meta_description, sort_order, regular_price, sale_price, sku, weight, box_length, box_width, box_height, focus_keyword, tags, attributes] of products) {
      const catRes = cat_slug ? await client.query('SELECT id FROM categories WHERE slug = $1 LIMIT 1', [cat_slug]) : { rows: [] };
      const category_id = catRes.rows[0]?.id || null;
      const r = await client.query(
        \`INSERT INTO products
           (name, slug, category_id, description, short_description, image_url, images,
            is_active, is_featured, min_order, meta_title, meta_description, sort_order,
            regular_price, sale_price, sku, weight, box_length, box_width, box_height,
            focus_keyword, tags, attributes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
         ON CONFLICT (slug) DO NOTHING\`,
        [name, slug, category_id, description, short_description, image_url,
         JSON.stringify(images), is_active, is_featured, min_order,
         meta_title, meta_description, sort_order,
         regular_price, sale_price, sku, weight,
         box_length, box_width, box_height,
         focus_keyword, tags, attributes ? JSON.stringify(attributes) : null]
      );
      if (r.rowCount && r.rowCount > 0) productsInserted++;
    }
    results.push(\`\${productsInserted} products inserted (\${products.length - productsInserted} already existed — not overwritten)\`);

    // ── Verify ─────────────────────────────────────────────────────────────
    const tableCheck = await client.query(\`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    \`);
    const catCount = await client.query("SELECT count(*) FROM categories");
    const prodCount = await client.query("SELECT count(*) FROM products");
    const adminCount = await client.query("SELECT count(*) FROM admin_users");

    return res.json({
      success: true,
      steps: results,
      tables: tableCheck.rows.map((r: any) => r.table_name),
      categories: catCount.rows[0].count,
      products: prodCount.rows[0].count,
      admin_users: adminCount.rows[0].count,
      message: "DB setup complete! ${categories.length} categories + ${products.length} products seeded. Visit /api/products to verify.",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

export default router;
`;

// ─────────────────────────────────────────────────────────
// 5. Write updated file
// ─────────────────────────────────────────────────────────
fs.writeFileSync(DB_SETUP_PATH, ts, "utf8");
console.log(`✅  ${DB_SETUP_PATH} updated (${Math.round(ts.length / 1024)}KB)\n`);

// ─────────────────────────────────────────────────────────
// 6. Rebuild API server
// ─────────────────────────────────────────────────────────
console.log("🔨  Building API server...");
try {
  execSync("pnpm --filter @workspace/api-server run build", {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  console.log("✅  API server built successfully\n");
} catch (e) {
  console.error("❌  Build failed:", e.message);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────
// 7. Show git diff summary
// ─────────────────────────────────────────────────────────
try {
  const diff = execSync("git diff --stat HEAD", { cwd: process.cwd() }).toString();
  if (diff.trim()) {
    console.log("📋  Git diff summary:");
    console.log(diff);
  } else {
    console.log("ℹ️   No changes vs HEAD (data may already be up to date)\n");
  }
} catch (_) {}

console.log("═══════════════════════════════════════════════════════════");
console.log("✅  SYNC COMPLETE!");
console.log("═══════════════════════════════════════════════════════════");
console.log("");
console.log("Next steps:");
console.log("  1. git add -A");
console.log('  2. git commit -m "sync: update db seed with latest Replit data"');
console.log("  3. git push origin main");
console.log("  4. On cPanel terminal: cd ~/prime-packaging-boxes && git pull");
console.log("  5. cPanel → Node.js App Manager → Restart");
console.log("  6. Open in browser:");
console.log("     https://primepackagingboxes.com/api/db-setup?key=prime-setup-2024-kawish");
console.log("");
