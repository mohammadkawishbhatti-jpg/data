// Export all DB tables as SQL INSERT statements
// Run: node scripts/export-db.mjs
import pg from "pg";
import fs from "fs";

const { Pool } = pg;
const DB = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: DB, ssl: { rejectUnauthorized: false } });

const TABLES = [
  "admin_users","site_settings","categories","products",
  "pages","page_templates","blog_posts","banners",
  "customers","orders","invoices","quotes","leads","session"
];

const out = fs.createWriteStream("/tmp/prime_packaging_backup.sql");
out.write("-- Prime Packaging Boxes — Full DB Backup\n");
out.write("-- Generated: " + new Date().toISOString() + "\n\n");
out.write("SET client_encoding = 'UTF8';\n\n");

for (const table of TABLES) {
  try {
    // Schema
    const cols = await pool.query(
      `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema='public' AND table_name=$1
       ORDER BY ordinal_position`, [table]
    );
    if (cols.rows.length === 0) { console.log(`  skip (not found): ${table}`); continue; }

    out.write(`-- Table: ${table}\n`);
    out.write(`TRUNCATE TABLE "${table}" CASCADE;\n`);

    // Data
    const rows = await pool.query(`SELECT * FROM "${table}"`);
    if (rows.rows.length === 0) { out.write(`-- (no data)\n\n`); continue; }

    const colNames = rows.fields.map(f => `"${f.name}"`).join(", ");
    for (const row of rows.rows) {
      const vals = rows.fields.map(f => {
        const v = row[f.name];
        if (v === null || v === undefined) return "NULL";
        if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
        if (typeof v === "number") return String(v);
        if (v instanceof Date) return `'${v.toISOString()}'`;
        if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g,"''")}'`;
        return `'${String(v).replace(/'/g,"''")}'`;
      }).join(", ");
      out.write(`INSERT INTO "${table}" (${colNames}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`);
    }
    out.write("\n");
    console.log(`  ✅ ${table}: ${rows.rows.length} rows`);
  } catch(e) {
    console.log(`  ⚠️  ${table}: ${e.message}`);
  }
}

out.end();
await new Promise(r => out.on("finish", r));
const size = fs.statSync("/tmp/prime_packaging_backup.sql").size;
console.log(`\n✅ Done! File: /tmp/prime_packaging_backup.sql (${(size/1024).toFixed(1)} KB)`);
await pool.end();
