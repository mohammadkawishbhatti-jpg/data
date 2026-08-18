import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable, ordersTable, invoicesTable } from "@workspace/db";
import { eq, desc, or } from "drizzle-orm";
import { z } from "zod";
import crypto from "node:crypto";
import { hashPassword, verifyPassword } from "../lib/security";
import { sendEmail } from "../lib/email";

const router = Router();
function requireCustomer(req: any, res: any, next: any) {
  if (!req.session?.customer) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// POST /portal/login  — username + password
router.post("/portal/login", async (req, res) => {
  try {
    const { username, password } = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }).parse(req.body);

    const identifier = username.toLowerCase().trim();
    const [customer] = await db
      .select()
      .from(customersTable)
      .where(or(
        eq(customersTable.username, identifier),
        eq(customersTable.email, identifier),
        eq(customersTable.customerNumber, identifier.toUpperCase()),
      ));

    const verification = customer ? await verifyPassword(customer.passwordHash, password) : { valid: false, needsUpgrade: false };
    if (!customer || !verification.valid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    if (customer.status === "invited") return res.status(403).json({ error: "Activate your portal account using the invitation link first." });
    if (customer.status !== "active") return res.status(403).json({ error: "This portal account is currently disabled. Contact support." });
    if (verification.needsUpgrade) {
      await db.update(customersTable).set({ passwordHash: await hashPassword(password) }).where(eq(customersTable.id, customer.id));
    }
    await db.update(customersTable).set({ lastLoginAt: new Date() }).where(eq(customersTable.id, customer.id));

    // Regenerate session on login to prevent session fixation
    await new Promise<void>((resolve, reject) => {
      (req as any).session.regenerate((err: any) => err ? reject(err) : resolve());
    });

    (req as any).session.customer = {
      id: customer.id,
      username: customer.username,
      email: customer.email,
      name: customer.name,
      customerNumber: customer.customerNumber,
    };

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        username: customer.username,
        email: customer.email,
        customerNumber: customer.customerNumber,
        company: customer.company,
      },
    });
  } catch (e) {
    res.status(400).json({ error: "Bad request" });
  }
});

function tokenHash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Requesting a reset never reveals whether an account exists.
router.post("/portal/password-reset/request", async (req, res) => {
  try {
    const { identifier } = z.object({ identifier: z.string().min(1) }).parse(req.body);
    const normalized = identifier.toLowerCase().trim();
    const [customer] = await db.select().from(customersTable).where(or(
      eq(customersTable.email, normalized),
      eq(customersTable.username, normalized),
      eq(customersTable.customerNumber, normalized.toUpperCase()),
    ));
    if (customer && customer.status !== "disabled") {
      const token = crypto.randomBytes(32).toString("hex");
      await db.update(customersTable).set({
        passwordResetTokenHash: tokenHash(token),
        passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        updatedAt: new Date(),
      }).where(eq(customersTable.id, customer.id));
      const base = process.env.SITE_URL || "https://primepackagingboxes.com";
      await sendEmail({
        to: customer.email,
        subject: "Reset your Prime Packaging Boxes portal password",
        html: `<p>Hello ${customer.name},</p><p>Use the secure link below to reset your customer portal password. It expires in one hour.</p><p><a href="${base}/customer-portal/?reset=${token}">Reset portal password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      });
    }
    res.json({ success: true, message: "If an account matches, a reset link has been sent." });
  } catch {
    res.status(400).json({ error: "Invalid reset request" });
  }
});

router.post("/portal/password-reset/confirm", async (req, res) => {
  try {
    const { token, password } = z.object({
      token: z.string().min(32),
      password: z.string().min(8),
    }).parse(req.body);
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.passwordResetTokenHash, tokenHash(token)));
    if (!customer || !customer.passwordResetExpiresAt || customer.passwordResetExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "This reset link is invalid or expired." });
    }
    await db.update(customersTable).set({
      passwordHash: await hashPassword(password),
      portalPassword: null,
      status: "active",
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      activatedAt: customer.activatedAt ?? new Date(),
      updatedAt: new Date(),
    }).where(eq(customersTable.id, customer.id));
    res.json({ success: true, message: "Password updated. You can now sign in." });
  } catch (error: any) {
    res.status(error?.name === "ZodError" ? 400 : 500).json({ error: "Unable to reset password" });
  }
});

router.post("/portal/activate", async (req, res) => {
  try {
    const { token, password } = z.object({
      token: z.string().min(32),
      password: z.string().min(8),
    }).parse(req.body);
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.invitationTokenHash, tokenHash(token)));
    if (!customer || customer.status !== "invited" || !customer.invitationExpiresAt || customer.invitationExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "This invitation is invalid or expired." });
    }
    await db.update(customersTable).set({
      passwordHash: await hashPassword(password),
      portalPassword: null,
      status: "active",
      invitationTokenHash: null,
      invitationExpiresAt: null,
      activatedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(customersTable.id, customer.id));
    res.json({ success: true, message: "Account activated. You can now sign in." });
  } catch (error: any) {
    res.status(error?.name === "ZodError" ? 400 : 500).json({ error: "Unable to activate account" });
  }
});

// POST /portal/logout — destroy session to prevent session fixation / replay
router.post("/portal/logout", (req, res) => {
  (req as any).session.destroy((err: any) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
    } else {
      res.json({ success: true });
    }
  });
});

// GET /portal/me
router.get("/portal/me", requireCustomer, async (req, res) => {
  try {
    const { id } = (req as any).session.customer;
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!customer) return res.status(404).json({ error: "Not found" });
    const { passwordHash: _, ...rest } = customer;
    res.json({ ...rest, createdAt: customer.createdAt?.toISOString?.() ?? customer.createdAt });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /portal/orders  — query by customer_id (correct FK link)
router.get("/portal/orders", requireCustomer, async (req, res) => {
  try {
    const { id } = (req as any).session.customer;
    const rows = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.customerId, id))
      .orderBy(desc(ordersTable.createdAt));
    res.json(
      rows.map(o => ({
        ...o,
        createdAt: o.createdAt?.toISOString?.() ?? o.createdAt,
        updatedAt: o.updatedAt?.toISOString?.() ?? o.updatedAt,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /portal/quotes  — matched by customer email
import { quotesTable } from "@workspace/db";

router.get("/portal/quotes", requireCustomer, async (req, res) => {
  try {
    const { id } = (req as any).session.customer;
    // Get the customer's email
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!customer) return res.status(404).json({ error: "Not found" });

    const rows = await db
      .select()
      .from(quotesTable)
      .where(eq(quotesTable.email, customer.email))
      .orderBy(desc(quotesTable.createdAt));

    res.json(
      rows.map(q => ({
        id: q.id,
        status: q.status,
        productType: q.productType,
        quantity: q.quantity,
        dimensions: q.dimensions,
        material: q.material,
        printingDetails: q.printingDetails,
        additionalNotes: q.additionalNotes,
        createdAt: q.createdAt?.toISOString?.() ?? q.createdAt,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /portal/invoices — customer ke invoices
router.get("/portal/invoices", requireCustomer, async (req, res) => {
  try {
    const { id } = (req as any).session.customer;
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!customer) return res.status(404).json({ error: "Not found" });

    const rows = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.customerId, id))
      .orderBy(desc(invoicesTable.createdAt));

    res.json(
      rows.map(inv => ({
        id:            inv.id,
        invoiceNumber: inv.invoiceNumber,
        status:        inv.status,
        total:         inv.total,
        currency:      inv.currency ?? "GBP",
        dueDate:       inv.dueDate?.toISOString?.() ?? null,
        sentAt:        inv.sentAt?.toISOString?.() ?? null,
        orderId:       inv.orderId ?? null,
        createdAt:     inv.createdAt?.toISOString?.() ?? inv.createdAt,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
