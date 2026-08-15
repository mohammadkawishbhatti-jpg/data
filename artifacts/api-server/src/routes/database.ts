import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { exec } from "child_process";
import { promisify } from "util";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

const execAsync = promisify(exec);
const router = Router();
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.admin) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// ── GET /admin/db/stats ──────────────────────────────────────────────────────
router.get("/admin/db/stats", requireAdmin, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        relname        AS table_name,
        n_live_tup     AS row_count,
        pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
        pg_total_relation_size(relid) AS size_bytes
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
    `);

    const dbSizeResult = await db.execute(sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size,
             pg_database_size(current_database()) AS db_size_bytes
    `);

    const pgVersionResult = await db.execute(sql`SELECT version() AS ver`);

    const dbSizeRow = (dbSizeResult as any).rows?.[0] ?? (dbSizeResult as any)[0];
    const pgVersion = (pgVersionResult as any).rows?.[0] ?? (pgVersionResult as any)[0];

    const tables = (result as any).rows ?? result;
    res.json({
      tables,
      totalSize: (dbSizeRow as any).db_size,
      totalSizeBytes: Number((dbSizeRow as any).db_size_bytes),
      pgVersion: ((pgVersion as any).ver as string).split(" ").slice(0, 2).join(" "),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /admin/db/export — pg_dump as SQL download ──────────────────────────
router.get("/admin/db/export", requireAdmin, async (req, res) => {
  const tmpFile = path.join(os.tmpdir(), `prime-db-backup-${Date.now()}.sql`);
  try {
    const dbUrl = process.env.DATABASE_URL!;
    await execAsync(`pg_dump "${dbUrl}" --no-owner --no-acl -f "${tmpFile}"`);

    const stat = fs.statSync(tmpFile);
    const date = new Date().toISOString().split("T")[0];

    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", `attachment; filename="prime-packaging-db-${date}.sql"`);
    res.setHeader("Content-Length", stat.size);

    const stream = fs.createReadStream(tmpFile);
    stream.pipe(res);
    stream.on("end", () => { try { fs.unlinkSync(tmpFile); } catch {} });
    stream.on("error", () => { try { fs.unlinkSync(tmpFile); } catch {} });
  } catch (e: any) {
    try { fs.unlinkSync(tmpFile); } catch {}
    res.status(500).json({ error: "DB export failed. Check server logs." });
  }
});

// ── POST /admin/db/import — upload .sql and restore ─────────────────────────
router.post("/admin/db/import", requireAdmin, upload.single("sqlFile"), async (req: any, res) => {
  if (!req.file) return res.status(400).json({ error: "No SQL file uploaded." });

  const tmpFile = req.file.path;
  try {
    const dbUrl = process.env.DATABASE_URL!;

    // Drop all tables first, then restore
    await execAsync(`psql "${dbUrl}" -c "
      DO \\$\\$ DECLARE r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END \\$\\$;
    "`);

    await execAsync(`psql "${dbUrl}" -f "${tmpFile}"`);

    fs.unlinkSync(tmpFile);
    res.json({ success: true, message: "Database restored successfully. All data replaced." });
  } catch (e: any) {
    try { fs.unlinkSync(tmpFile); } catch {}
    res.status(500).json({ error: "DB import failed. Check server logs." });
  }
});

// ── POST /admin/db/truncate-table — clear one table ─────────────────────────
router.post("/admin/db/truncate-table", requireAdmin, async (req, res) => {
  const { tableName } = req.body;
  const allowed = ["quotes", "leads", "orders", "invoices", "customers", "blog_posts", "banners"];
  if (!allowed.includes(tableName)) {
    return res.status(400).json({ error: "Table not allowed to truncate." });
  }
  try {
    // allowlist already validated above — safe to interpolate table name
    await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`));
    res.json({ success: true, message: `Table '${tableName}' cleared.` });
  } catch (e: any) {
    req.log?.error(e);
    res.status(500).json({ error: "Failed to truncate table." });
  }
});

export default router;
