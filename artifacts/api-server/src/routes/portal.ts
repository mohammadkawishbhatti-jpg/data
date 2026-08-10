import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable, ordersTable, invoicesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { createHash } from "crypto";

const router = Router();
const SALT = "prime_customer_salt_2024";

function hashPassword(plain: string) {
  return createHash("sha256").update(plain + SALT).digest("hex");
}

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

    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.username, username.toLowerCase().trim()));

    if (!customer || customer.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

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

// POST /portal/logout
router.post("/portal/logout", (req, res) => {
  const session = (req as any).session;
  if (session) { delete session.customer; }
  res.json({ success: true });
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
