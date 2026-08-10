// Daily DB backup — cPanel cron job chalata hai
// Cron: 0 0 * * * cd ~/prime-packaging-boxes && node scripts/backup-and-push.mjs
import pg from "../node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/index.js";
import fs from "fs";
import { execSync } from "child_process";

const Pool = pg.Pool;
const DB = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!DB) { console.error("No DATABASE_URL"); process.exit(1); }

const pool = new Pool({ connectionString: DB });

const TABLES = [
  "admin_users","site_settings","categories","products",
  "pages","page_templates","blog_posts","banners",
  "customers","orders","invoices","quotes","leads"
];

const date = new Date().toISOString().split("T")[0];
const backupDir = "backups";
fs.mkdirSync(backupDir, { recursive: true });

const file = `${backupDir}/db-backup-${date}.sql`;
const out = fs.createWriteStream(file);

out.write(`-- Prime Packaging Boxes DB Backup\n`);
out.write(`-- Date: ${new Date().toISOString()}\n\n`);
out.write(`SET client_encoding = 'UTF8';\n\n`);

for (const table of TABLES) {
  try {
    const rows = await pool.query(`SELECT * FROM "${table}"`);
    out.write(`-- ══ ${table} (${rows.rows.length} rows) ══\n`);
    if (!rows.rows.length) { out.write(`-- (empty)\n\n`); continue; }
    out.write(`TRUNCATE TABLE "${table}" CASCADE;\n`);
    const cols = rows.fields.map(f => `"${f.name}"`).join(", ");
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
      out.write(`INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;\n`);
    }
    out.write(`\n`);
  } catch(e) { console.log(`Skip ${table}: ${e.message}`); }
}

out.end();
await new Promise(r => out.on("finish", r));

// latest.sql update
fs.copyFileSync(file, `${backupDir}/latest.sql`);

// 30 se purane delete karo
const files = fs.readdirSync(backupDir)
  .filter(f => f.startsWith("db-backup-"))
  .sort().reverse();
files.slice(30).forEach(f => fs.unlinkSync(`${backupDir}/${f}`));

// GitHub pe push karo
try {
  execSync(`git config user.email "backup@primepackagingboxes.com"`);
  execSync(`git config user.name "DB Backup Bot"`);
  execSync(`git fetch origin db-backups 2>/dev/null || true`);
  execSync(`git checkout -B db-backups origin/db-backups 2>/dev/null || git checkout -b db-backups`);
  execSync(`git add backups/`);
  execSync(`git diff --cached --quiet || git commit -m "DB Backup ${date}"`);
  execSync(`git push origin db-backups`);
  console.log(`✅ Backup pushed: ${file}`);
} catch(e) {
  console.log(`⚠️  Git push failed: ${e.message}`);
  console.log(`✅ Backup saved locally: ${file}`);
}

await pool.end();
