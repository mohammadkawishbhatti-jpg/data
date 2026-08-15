import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db";
import { eq, desc, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { createHash } from "crypto";
import { requireAdmin } from "../middlewares/auth";
import { sendEmail } from "../lib/email";

const router = Router();

const SALT = "prime_customer_salt_2024";

function hashPassword(plain: string) {
  return createHash("sha256").update(plain + SALT).digest("hex");
}

function generateCustomerNumber() {
  const ts = Date.now().toString().slice(-6);
  return `CUST-${ts}`;
}

function fmt(c: any) {
  const { passwordHash: _, ...rest } = c;
  return { ...rest, createdAt: c.createdAt?.toISOString?.() ?? c.createdAt };
}

// GET /admin/customers  — supports ?search=<query>&limit=<n>
router.get("/admin/customers", requireAdmin, async (req, res) => {
  try {
    const search = (req.query.search as string | undefined)?.trim();
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    let query = db.select().from(customersTable).orderBy(desc(customersTable.createdAt)).$dynamic();
    if (search) {
      query = query.where(
        or(
          ilike(customersTable.name, `%${search}%`),
          ilike(customersTable.email, `%${search}%`),
          ilike(customersTable.username, `%${search}%`),
        )
      );
    }
    const rows = await query.limit(limit);
    res.json(rows.map(fmt));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// POST /admin/customers  — username + manual password required
router.post("/admin/customers", requireAdmin, async (req, res) => {
  try {
    const body = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      username: z.string().min(3).regex(/^[a-z0-9_.\-]+$/i, "Username may only contain letters, numbers, dots, dashes, or underscores"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      phone: z.string().optional(),
      company: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    const passwordHash = hashPassword(body.password);
    const customerNumber = generateCustomerNumber();

    const [row] = await db.insert(customersTable).values({
      name: body.name,
      email: body.email,
      username: body.username.toLowerCase().trim(),
      phone: body.phone,
      company: body.company,
      notes: body.notes,
      passwordHash,
      portalPassword: body.password,
      customerNumber,
    } as any).returning();

    res.status(201).json(fmt(row));
  } catch (e: any) {
    if (e?.code === "23505") {
      const detail: string = e.detail || "";
      if (detail.includes("username")) return res.status(409).json({ error: "Username already taken" });
      if (detail.includes("email")) return res.status(409).json({ error: "Email already exists" });
      return res.status(409).json({ error: "Duplicate value" });
    }
    if (e?.name === "ZodError") return res.status(400).json({ error: e.errors?.[0]?.message || "Validation error" });
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// GET /admin/customers/:id
router.get("/admin/customers/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// PATCH /admin/customers/:id
router.patch("/admin/customers/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body);
    const [row] = await db.update(customersTable).set(body).where(eq(customersTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// POST /admin/customers/:id/reset-password  — admin types the new password manually
router.post("/admin/customers/:id/reset-password", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password } = z.object({
      password: z.string().min(6, "Password must be at least 6 characters"),
    }).parse(req.body);

    const passwordHash = hashPassword(password);
    const [row] = await db.update(customersTable).set({ passwordHash, portalPassword: password } as any).where(eq(customersTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...fmt(row), success: true });
  } catch (e: any) {
    if (e?.name === "ZodError") return res.status(400).json({ error: e.errors?.[0]?.message || "Validation error" });
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/customers/:id/send-credentials
router.post("/admin/customers/:id/send-credentials", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password } = z.object({ password: z.string().min(1) }).parse(req.body);
    const [row] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });

    await sendEmail({
      to: row.email,
      subject: "Your Prime Packaging Boxes Customer Portal Access",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <div style="background:#1B2B5E;padding:20px;border-radius:8px 8px 0 0;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">Prime Packaging Boxes</h1>
            <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">Customer Portal Access</p>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:28px">
            <p style="color:#374151;font-size:15px">Dear <strong>${row.name}</strong>,</p>
            <p style="color:#6b7280;font-size:14px">Your customer portal account has been created. You can now log in to track your orders.</p>
            <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Login Credentials</p>
              <p style="margin:4px 0;font-size:14px;color:#111827"><strong>Username:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;font-family:monospace">${row.username}</code></p>
              <p style="margin:4px 0;font-size:14px;color:#111827"><strong>Password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;font-family:monospace">${password}</code></p>
              <p style="margin:4px 0;font-size:14px;color:#111827"><strong>Customer #:</strong> ${row.customerNumber}</p>
            </div>
            <p style="margin:20px 0 0"><a href="${process.env.SITE_URL || 'https://primepackagingboxes.com'}/portal/login" style="display:inline-block;background:#1B2B5E;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Login to Customer Portal →</a></p>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">Questions? Call us: 818-758-4076 | help@primepackagingboxes.com</p>
          </div>
        </div>`,
    });

    res.json({ success: true });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Failed to send email" }); }
});

// GET /admin/customers/by-email/:email
router.get("/admin/customers/by-email/:email", requireAdmin, async (req, res) => {
  try {
    const email = decodeURIComponent(String(req.params.email)).toLowerCase();
    const [c] = await db.select().from(customersTable).where(eq(customersTable.email, email)).limit(1);
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json({ id: c.id, name: c.name, email: c.email, username: c.username, phone: c.phone, company: c.company, customerNumber: c.customerNumber, portalPassword: c.portalPassword });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// DELETE /admin/customers/:id
router.delete("/admin/customers/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(customersTable).where(eq(customersTable.id, id));
    res.json({ success: true });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
