import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, customersTable } from "@workspace/db";
import { eq, desc, or } from "drizzle-orm";
import { z } from "zod";
import { requireCapability } from "../middlewares/auth";

const router = Router();

function fmt(o: any) {
  return { ...o, createdAt: o.createdAt?.toISOString?.() ?? o.createdAt, updatedAt: o.updatedAt?.toISOString?.() ?? o.updatedAt };
}

function generateOrderNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${ymd}-${rand}`;
}

const OrderBody = z.object({
  orderNumber: z.string().optional(),
  customerId: z.number().optional(),
  customerEmail: z.string().optional(),
  customerName: z.string().optional(),
  status: z.string().default("confirmed"),
  items: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    qty: z.number(),
    unitPrice: z.number(),
    total: z.number(),
  })).default([]),
  subtotal: z.string().default("0"),
  tax: z.string().default("0"),
  total: z.string().default("0"),
  currency: z.string().default("USD"),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

// GET /admin/orders
router.get("/admin/orders", requireCapability("sales"), async (req, res) => {
  try {
    const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    res.json(rows.map(fmt));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// POST /admin/orders
router.post("/admin/orders", requireCapability("sales"), async (req, res) => {
  try {
    const body = OrderBody.parse(req.body);
    // If customerId provided, look up customer info
    let customerEmail = body.customerEmail;
    let customerName = body.customerName;
    if (body.customerId && !customerEmail) {
      const [cust] = await db.select().from(customersTable).where(eq(customersTable.id, body.customerId));
      if (cust) { customerEmail = cust.email; customerName = cust.name; }
    }
    const [row] = await db.insert(ordersTable).values({
      ...body,
      orderNumber: body.orderNumber || generateOrderNumber(),
      customerEmail,
      customerName,
    }).returning();
    res.status(201).json(fmt(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: "Bad request" }); }
});

// GET /admin/orders/:id
router.get("/admin/orders/:id", requireCapability("sales"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// PATCH /admin/orders/:id
router.patch("/admin/orders/:id", requireCapability("sales"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = OrderBody.partial().parse(req.body);
    const [row] = await db.update(ordersTable).set({ ...body, updatedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) { req.log.error(e); res.status(400).json({ error: "Bad request" }); }
});

// DELETE /admin/orders/:id
router.delete("/admin/orders/:id", requireCapability("sales"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(ordersTable).where(eq(ordersTable.id, id));
    res.json({ success: true });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// Local requireCustomer guard (matches portal.ts pattern)
function requireCustomer(req: any, res: any, next: any) {
  if (!req.session?.customer) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// PORTAL: GET /portal/orders
// Customer-facing endpoint — finds orders by customerId FK (primary) or customerEmail (fallback)
router.get("/portal/orders", requireCustomer, async (req, res) => {
  try {
    const customer = (req as any).session?.customer;

    // Match by FK first, fall back to email so legacy orders still appear
    const rows = await db.select().from(ordersTable)
      .where(
        or(
          eq(ordersTable.customerId, customer.id),
          eq(ordersTable.customerEmail, customer.email),
        )
      )
      .orderBy(desc(ordersTable.createdAt));
    res.json(rows.map(fmt));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
