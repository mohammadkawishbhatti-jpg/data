import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable, customersTable, siteSettingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { requireAdmin } from "../middlewares/auth";
import { sendEmail } from "../lib/email";

const router = Router();
const SALT = "prime_customer_salt_2024";

function hashPassword(plain: string) {
  return createHash("sha256").update(plain + SALT).digest("hex");
}

function generatePassword(): string {
  // 8-char alphanumeric password
  return randomBytes(6).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).padEnd(8, "x");
}

function usernameFromEmail(email: string): string {
  return email.toLowerCase().split("@")[0].replace(/[^a-z0-9._-]/g, "").slice(0, 30) || "customer";
}

function fmt(i: any) {
  return {
    ...i,
    createdAt: i.createdAt?.toISOString?.() ?? i.createdAt,
    updatedAt: i.updatedAt?.toISOString?.() ?? i.updatedAt,
    sentAt: i.sentAt?.toISOString?.() ?? i.sentAt,
  };
}

function generateInvoiceNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${rand}`;
}

const InvoiceBody = z.object({
  invoiceNumber: z.string().optional(),
  customerId: z.number().optional().nullable(),
  orderId: z.number().optional().nullable(),
  customerEmail: z.string().optional(),
  customerName: z.string().optional(),
  customerCompany: z.string().optional(),
  customerPhone: z.string().optional(),
  customerCountry: z.string().optional(),
  execName: z.string().optional(),
  execTitle: z.string().optional(),
  execPhone: z.string().optional(),
  execEmail: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    material: z.string().optional(),
    lamination: z.string().optional(),
    printing: z.string().optional(),
    size: z.string().optional(),
    finishing: z.string().optional(),
    packing: z.string().optional(),
    qty: z.number(),
    unitPrice: z.number(),
    discount: z.number().optional(),
    total: z.number(),
  })).default([]),
  subtotal: z.string().default("0"),
  tax: z.string().default("0"),
  total: z.string().default("0"),
  currency: z.string().default("USD"),
  priceIncludes: z.string().optional(),
  productionTime: z.string().optional(),
  delivery: z.string().optional(),
  notesText: z.string().optional(),
  paymentTerms: z.string().optional(),
  status: z.string().default("draft"),
  dueDate: z.string().optional(),
});

// GET /admin/invoices
router.get("/admin/invoices", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt));
    res.json(rows.map(fmt));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// POST /admin/invoices
router.post("/admin/invoices", requireAdmin, async (req, res) => {
  try {
    const body = InvoiceBody.parse(req.body);
    let { customerEmail, customerName, customerCompany, customerPhone, customerId } = body;

    // Fill customer info from linked customer record if only ID supplied
    if (customerId && !customerEmail) {
      const [c] = await db.select().from(customersTable).where(eq(customersTable.id, customerId));
      if (c) {
        customerEmail = c.email;
        customerName = c.name;
        customerCompany = c.company ?? undefined;
        customerPhone = c.phone ?? undefined;
      }
    }

    // Auto-create customer portal account for new emails
    let portalUsername: string | undefined;
    let portalPassword: string | undefined;
    let resolvedCustomerId = customerId ?? null;

    if (customerEmail) {
      const [existing] = await db.select().from(customersTable).where(eq(customersTable.email, customerEmail));
      if (existing) {
        // Existing customer — link them
        resolvedCustomerId = existing.id;
        portalUsername = existing.username ?? undefined;
        // Retrieve stored plain password if it exists
        if ((existing as any).portalPassword) {
          portalPassword = (existing as any).portalPassword;
        }
      } else {
        // New email — auto-create a portal account
        const baseUsername = usernameFromEmail(customerEmail);
        const plainPwd = generatePassword();
        const hash = hashPassword(plainPwd);

        // Ensure username uniqueness
        let username = baseUsername;
        const [conflict] = await db.select({ id: customersTable.id }).from(customersTable).where(eq(customersTable.username, username));
        if (conflict) username = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;

        const customerNumber = `CUST-${Date.now().toString().slice(-6)}`;
        const [newCust] = await db.insert(customersTable).values({
          name: customerName || customerEmail.split("@")[0],
          email: customerEmail,
          username,
          passwordHash: hash,
          company: customerCompany ?? null,
          phone: customerPhone ?? null,
          customerNumber,
          portalPassword: plainPwd,
        } as any).returning();

        resolvedCustomerId = newCust.id;
        portalUsername = username;
        portalPassword = plainPwd;
      }
    }

    const dueDateVal = body.dueDate ? new Date(body.dueDate) : undefined;

    const [row] = await db.insert(invoicesTable).values({
      invoiceNumber: body.invoiceNumber || generateInvoiceNumber(),
      customerId: resolvedCustomerId,
      orderId: body.orderId ?? null,
      customerEmail,
      customerName,
      customerCompany,
      customerPhone,
      customerCountry: body.customerCountry,
      execName: body.execName,
      execTitle: body.execTitle,
      execPhone: body.execPhone,
      execEmail: body.execEmail,
      currency: body.currency,
      subtotal: body.subtotal,
      tax: body.tax,
      total: body.total,
      items: body.items,
      priceIncludes: body.priceIncludes,
      productionTime: body.productionTime,
      delivery: body.delivery,
      notesText: body.notesText,
      paymentTerms: body.paymentTerms,
      status: body.status,
      dueDate: dueDateVal,
    }).returning();

    res.status(201).json({
      ...fmt(row),
      portalUsername,
      portalPassword,
      portalAccountCreated: !!(portalPassword && customerId == null && !req.body.customerId),
    });
  } catch (e) { req.log.error(e); res.status(400).json({ error: "Bad request", detail: String(e) }); }
});

// GET /admin/invoices/:id
router.get("/admin/invoices/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

// PATCH /admin/invoices/:id
router.patch("/admin/invoices/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = InvoiceBody.partial().parse(req.body);

    const dueDateVal = body.dueDate ? new Date(body.dueDate) : undefined;

    // Auto-create portal account if email is new
    let portalUsername: string | undefined;
    let portalPassword: string | undefined;

    if (body.customerEmail) {
      const [existing] = await db.select().from(customersTable).where(eq(customersTable.email, body.customerEmail));
      if (existing) {
        portalUsername = existing.username ?? undefined;
        if ((existing as any).portalPassword) portalPassword = (existing as any).portalPassword;
      } else if (body.customerEmail) {
        const baseUsername = usernameFromEmail(body.customerEmail);
        const plainPwd = generatePassword();
        const hash = hashPassword(plainPwd);
        let username = baseUsername;
        const [conflict] = await db.select({ id: customersTable.id }).from(customersTable).where(eq(customersTable.username, username));
        if (conflict) username = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
        const customerNumber = `CUST-${Date.now().toString().slice(-6)}`;
        const [newCust] = await db.insert(customersTable).values({
          name: body.customerName || body.customerEmail.split("@")[0],
          email: body.customerEmail,
          username,
          passwordHash: hash,
          company: body.customerCompany ?? null,
          phone: body.customerPhone ?? null,
          customerNumber,
          portalPassword: plainPwd,
        } as any).returning();
        portalUsername = username;
        portalPassword = plainPwd;
        body.customerId = newCust.id;
      }
    }

    const [row] = await db.update(invoicesTable).set({
      ...(body.invoiceNumber !== undefined && { invoiceNumber: body.invoiceNumber }),
      ...(body.customerId !== undefined && { customerId: body.customerId }),
      ...(body.orderId !== undefined && { orderId: body.orderId }),
      ...(body.customerEmail !== undefined && { customerEmail: body.customerEmail }),
      ...(body.customerName !== undefined && { customerName: body.customerName }),
      ...(body.customerCompany !== undefined && { customerCompany: body.customerCompany }),
      ...(body.customerPhone !== undefined && { customerPhone: body.customerPhone }),
      ...(body.customerCountry !== undefined && { customerCountry: body.customerCountry }),
      ...(body.execName !== undefined && { execName: body.execName }),
      ...(body.execTitle !== undefined && { execTitle: body.execTitle }),
      ...(body.execPhone !== undefined && { execPhone: body.execPhone }),
      ...(body.execEmail !== undefined && { execEmail: body.execEmail }),
      ...(body.currency !== undefined && { currency: body.currency }),
      ...(body.subtotal !== undefined && { subtotal: body.subtotal }),
      ...(body.tax !== undefined && { tax: body.tax }),
      ...(body.total !== undefined && { total: body.total }),
      ...(body.items !== undefined && { items: body.items }),
      ...(body.priceIncludes !== undefined && { priceIncludes: body.priceIncludes }),
      ...(body.productionTime !== undefined && { productionTime: body.productionTime }),
      ...(body.delivery !== undefined && { delivery: body.delivery }),
      ...(body.notesText !== undefined && { notesText: body.notesText }),
      ...(body.paymentTerms !== undefined && { paymentTerms: body.paymentTerms }),
      ...(body.status !== undefined && { status: body.status }),
      ...(dueDateVal !== undefined && { dueDate: dueDateVal }),
      updatedAt: new Date(),
    }).where(eq(invoicesTable.id, id)).returning();

    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...fmt(row), portalUsername, portalPassword });
  } catch (e) { req.log.error(e); res.status(400).json({ error: "Bad request", detail: String(e) }); }
});

// POST /admin/invoices/:id/send
router.post("/admin/invoices/:id/send", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id));
    if (!inv) return res.status(404).json({ error: "Not found" });
    if (!inv.customerEmail) return res.status(400).json({ error: "No customer email on invoice" });

    // Load company contact from site settings (falls back to defaults if not set)
    const [s] = await db.select({ phone: siteSettingsTable.phone, email: siteSettingsTable.email, address: siteSettingsTable.address }).from(siteSettingsTable).limit(1);
    const companyPhone   = s?.phone   || "818-758-4076";
    const companyEmail   = s?.email   || "help@primepackagingboxes.com";
    const companyAddress = s?.address || "444 Alaska Avenue Suite, Torrance, CA 90503 USA";

    const sym = ({ USD:"$", GBP:"£", EUR:"€", PKR:"₨", AED:"د.إ" } as any)[inv.currency ?? "USD"] ?? "$";
    const itemsHtml = (inv.items ?? []).map((it: any, i: number) => `
      <tr style="border-bottom:1px solid #f3f4f6;background:${i%2===0?"#fff":"#f9fafb"}">
        <td style="padding:10px 12px;color:#9ca3af;font-size:12px;font-weight:700">${String(i+1).padStart(2,"0")}</td>
        <td style="padding:10px 12px">
          <p style="font-size:14px;font-weight:700;color:#111827;margin:0">${it.name||"—"}</p>
          ${it.description?`<p style="font-size:12px;color:#6b7280;margin:4px 0 0">${it.description}</p>`:""}
        </td>
        <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600">${(it.qty||0).toLocaleString()}</td>
        <td style="padding:10px 12px;text-align:right;font-size:13px">${sym}${Number(it.unitPrice||0).toFixed(2)}</td>
        <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:700;color:#1B2B5E">${sym}${Number(it.total||0).toFixed(2)}</td>
      </tr>`).join("");

    await sendEmail({
      to: inv.customerEmail,
      subject: `Invoice ${inv.invoiceNumber} from Prime Packaging Boxes`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:#1B2B5E;padding:20px 24px;display:flex;align-items:center;justify-content:space-between">
          <p style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:2px">PRIME PACKAGING BOXES</p>
          <p style="color:#FFB800;font-size:14px;font-weight:700;margin:0">INVOICE</p>
        </div>
        <div style="padding:24px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr>
              <td style="padding-bottom:16px;vertical-align:top">
                <p style="color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Bill To</p>
                <p style="font-size:16px;font-weight:700;color:#111827;margin:0">${inv.customerName||"—"}</p>
                ${inv.customerCompany?`<p style="font-size:13px;color:#6b7280;margin:4px 0">${inv.customerCompany}</p>`:""}
                <p style="font-size:13px;color:#6b7280;margin:4px 0">${inv.customerEmail}</p>
              </td>
              <td style="padding-bottom:16px;vertical-align:top;text-align:right">
                <p style="color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Invoice Details</p>
                <p style="font-size:13px;color:#374151;margin:4px 0">Invoice: ${inv.invoiceNumber}</p>
                <p style="font-size:13px;color:#374151;margin:4px 0">Date: ${new Date(inv.createdAt).toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"})}</p>
                ${inv.dueDate?`<p style="font-size:13px;color:#374151;margin:4px 0">Due: ${new Date(inv.dueDate).toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"})}</p>`:""}
              </td>
            </tr>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <thead><tr style="background:#1B2B5E">
              <th style="padding:10px 12px;text-align:left;color:#fff;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase">#</th>
              <th style="padding:10px 12px;text-align:left;color:#fff;font-size:11px">Item</th>
              <th style="padding:10px 12px;text-align:right;color:#fff;font-size:11px">Qty</th>
              <th style="padding:10px 12px;text-align:right;color:#fff;font-size:11px">Unit</th>
              <th style="padding:10px 12px;text-align:right;color:#fff;font-size:11px">Total</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
            <div style="background:#1B2B5E;padding:14px 24px;border-radius:6px;text-align:center">
              <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 4px">Total (${inv.currency})</p>
              <p style="color:#FFD700;font-size:22px;font-weight:900;margin:0">${sym}${Number(inv.total).toFixed(2)}</p>
            </div>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;border-top:1px solid #f3f4f6;padding-top:16px;margin:0">Questions? ${companyPhone} | ${companyEmail} | ${companyAddress}</p>
        </div>
      </div>`,
    });

    await db.update(invoicesTable).set({ status: "sent", sentAt: new Date(), updatedAt: new Date() }).where(eq(invoicesTable.id, id));
    res.json({ success: true });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Failed to send invoice" }); }
});

// Lookup customer by email for invoice autofill
router.get("/admin/customers/by-email/:email", requireAdmin, async (req, res) => {
  try {
    const [row] = await db.select().from(customersTable).where(eq(customersTable.email, String(req.params.email)));
    if (!row) return res.status(404).json({ error: "Customer not found" });
    const { passwordHash: _, ...rest } = row as any;
    res.json({ ...rest, createdAt: row.createdAt?.toISOString?.() ?? row.createdAt });
  } catch (e) { req.log.error(e); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
