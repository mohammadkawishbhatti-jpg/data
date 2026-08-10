import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// GET /admin/users
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const rows = await db.execute(sql`SELECT id, username, email, role, created_at FROM admin_users ORDER BY created_at DESC`);
    res.json(rows.rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/users
router.post("/admin/users", requireAdmin, async (req, res) => {
  try {
    const { username, email, role = "editor", password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    
    // Simple hash using built-in crypto
    const crypto = await import("crypto");
    const hash = crypto.createHash("sha256").update(password + "prime_salt_2024").digest("hex");
    
    const rows = await db.execute(
      sql`INSERT INTO admin_users (username, email, role, password_hash) VALUES (${username}, ${email || null}, ${role}, ${hash}) RETURNING id, username, email, role, created_at`
    );
    res.status(201).json(rows.rows[0]);
  } catch (e: any) {
    if (e?.message?.includes("unique")) return res.status(409).json({ error: "Username already exists" });
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// DELETE /admin/users/:id
router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.execute(sql`DELETE FROM admin_users WHERE id = ${id} AND username != 'admin'`);
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
