import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAdministrator } from "../middlewares/auth";
import { hashPassword } from "../lib/security";

const router = Router();

// GET /admin/users
router.get("/admin/users", requireAdministrator, async (req, res) => {
  try {
    const rows = await db.execute(sql`SELECT id, username, email, role, created_at FROM admin_users ORDER BY created_at DESC`);
    res.json(rows.rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/users
router.post("/admin/users", requireAdministrator, async (req, res) => {
  try {
    const { username, email, role = "editor", password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    const allowedRoles = ["superadmin", "editor", "sales", "admin"];
    if (!allowedRoles.includes(String(role))) {
      return res.status(400).json({ error: "Role must be superadmin, editor, sales, or admin" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    
    const hash = await hashPassword(password);
    
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

// PATCH /admin/users/:id — Super Admin-only credential update.
// Passwords are hashed immediately and are never returned to the client.
router.patch("/admin/users/:id", requireAdministrator, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid user id" });

    const requestedUsername = req.body?.username;
    const requestedPassword = req.body?.password;
    const username = requestedUsername == null ? undefined : String(requestedUsername).trim();
    const password = requestedPassword == null ? undefined : String(requestedPassword);

    if (username !== undefined && !/^[a-zA-Z0-9._-]{3,64}$/.test(username)) {
      return res.status(400).json({ error: "Username must be 3-64 characters and use only letters, numbers, dots, underscores, or hyphens" });
    }
    if (password !== undefined && password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (username === undefined && password === undefined) {
      return res.status(400).json({ error: "Username or password is required" });
    }

    const existing = await db.execute(sql`SELECT id, username FROM admin_users WHERE id = ${id} LIMIT 1`);
    if (!existing.rows[0]) return res.status(404).json({ error: "User not found" });

    const passwordHash = password === undefined ? undefined : await hashPassword(password);
    let rows;
    if (username !== undefined && passwordHash !== undefined) {
      rows = await db.execute(sql`UPDATE admin_users SET username = ${username}, password_hash = ${passwordHash} WHERE id = ${id} RETURNING id, username, email, role, created_at`);
    } else if (username !== undefined) {
      rows = await db.execute(sql`UPDATE admin_users SET username = ${username} WHERE id = ${id} RETURNING id, username, email, role, created_at`);
    } else {
      rows = await db.execute(sql`UPDATE admin_users SET password_hash = ${passwordHash!} WHERE id = ${id} RETURNING id, username, email, role, created_at`);
    }
    const sessionAdmin = (req as any).session?.admin;
    if (username !== undefined && sessionAdmin && String(sessionAdmin.id) === String(id)) {
      sessionAdmin.username = username;
    }
    res.json(rows.rows[0]);
  } catch (e: any) {
    if (e?.message?.includes("unique")) return res.status(409).json({ error: "Username already exists" });
    req.log.error(e);
    res.status(400).json({ error: "Unable to update user credentials" });
  }
});

// DELETE /admin/users/:id
router.delete("/admin/users/:id", requireAdministrator, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const target = await db.execute(sql`SELECT role, username FROM admin_users WHERE id = ${id} LIMIT 1`);
    const user = target.rows[0] as { role?: string; username?: string } | undefined;
    if (!user) return res.status(404).json({ error: "User not found" });
    if (String(user.role).toLowerCase() === "superadmin" || user.username === "admin") {
      return res.status(403).json({ error: "Super Admin accounts cannot be deleted here" });
    }
    await db.execute(sql`DELETE FROM admin_users WHERE id = ${id}`);
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
