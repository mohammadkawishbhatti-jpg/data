import { Router } from "express";
import { db } from "@workspace/db";
import { quotesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SubmitQuoteBody, UpdateQuoteStatusParams, UpdateQuoteStatusBody } from "@workspace/api-zod";
import { sendQuoteEmail, sendEmail } from "../lib/email";
import { requireCapability } from "../middlewares/auth";

const router = Router();

// POST /quotes
router.post("/quotes", async (req, res) => {
  try {
    const data = SubmitQuoteBody.parse(req.body);
    // Auto-set a follow-up for 2 days from now so it appears in Follow Ups
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 2);
    await db.insert(quotesTable).values({
      ...data,
      followUpDate,
      followUpNotes: "New quote submitted — contact customer to confirm requirements.",
    });
    // Send email notification (non-blocking)
    sendQuoteEmail({
      name: data.name,
      email: data.email,
      phone: data.phone ?? undefined,
      company: data.company ?? undefined,
      productType: data.productType ?? "",
      quantity: data.quantity ?? "",
      dimensions: data.dimensions ?? undefined,
      material: data.material ?? undefined,
      printingDetails: data.printingDetails ?? undefined,
      additionalNotes: data.additionalNotes ?? undefined,
    }).catch(err => console.error("[EMAIL] Quote email error:", err));
    res.status(201).json({ success: true, message: "Quote submitted successfully" });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: POST /admin/quotes — create a quote from QuoteBuilderPage
router.post("/admin/quotes", requireCapability("sales"), async (req, res) => {
  try {
    const b = req.body as Record<string, any>;
    // Auto follow-up: 2 days from now
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 2);
    const [row] = await db.insert(quotesTable).values({
      name:             b.clientName   ?? b.name   ?? "",
      email:            b.clientEmail  ?? b.email  ?? "",
      phone:            b.clientPhone  ?? b.phone  ?? "",
      company:          b.company      ?? null,
      productType:      b.productType  ?? b.items?.[0]?.description ?? "",
      quantity:         String(b.quantity ?? b.items?.[0]?.qty ?? ""),
      dimensions:       b.dimensions   ?? null,
      material:         b.material     ?? null,
      printingDetails:  b.printingDetails ?? null,
      additionalNotes:  b.notes        ?? b.additionalNotes ?? null,
      status:           "new" as const,
      followUpDate,
      followUpNotes:    "Admin-created quote — follow up with customer.",
    }).returning();
    res.status(201).json({ ok: true, id: row.id, quoteNumber: `QT-${String(row.id).padStart(4, "0")}` });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: GET /admin/quotes
router.get("/admin/quotes", requireCapability("sales"), async (req, res) => {
  try {
    const rows = await db.select().from(quotesTable).orderBy(desc(quotesTable.createdAt));
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: PATCH /admin/quotes/:id
router.patch("/admin/quotes/:id", requireCapability("sales"), async (req, res) => {
  try {
    const { id } = UpdateQuoteStatusParams.parse(req.params);
    const body: Record<string, any> = {};
    const editableFields = [
      "name", "email", "phone", "company", "productType", "quantity",
      "dimensions", "material", "printingDetails", "additionalNotes", "notes",
    ] as const;
    for (const field of editableFields) {
      if (field in req.body) body[field] = req.body[field];
    }
    if (req.body.status) body.status = req.body.status;
    if ("followUpDate" in req.body) body.followUpDate = req.body.followUpDate;
    if ("followUpNotes" in req.body) body.followUpNotes = req.body.followUpNotes;
    const [row] = await db.update(quotesTable).set(body)
      .where(eq(quotesTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: POST /admin/quotes/:id/send — send the branded quote preview to the customer
router.post("/admin/quotes/:id/send", requireCapability("sales"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: "Invalid quote id" });
    const [quote] = await db.select().from(quotesTable).where(eq(quotesTable.id, id)).limit(1);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    if (!quote.email) return res.status(400).json({ error: "Quote has no customer email" });

    const quoteNumber = `QT-${String(quote.id).padStart(4, "0")}`;
    await sendEmail({
      to: quote.email,
      subject: `Your custom packaging quotation ${quoteNumber} — Prime Packaging Boxes`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
          <div style="background:#1a2f5a;padding:24px 28px;color:#fff">
            <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#ffb800">PRIME PACKAGING BOXES</div>
            <h1 style="margin:10px 0 0;font-size:24px">Your custom packaging quotation</h1>
          </div>
          <div style="padding:26px 28px;color:#374151;line-height:1.6">
            <p style="margin-top:0">Hi ${quote.name || "there"},</p>
            <p>Thank you for your enquiry. Our team has prepared quotation <strong>${quoteNumber}</strong> for your packaging requirements.</p>
            <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
              <div><strong>Product:</strong> ${quote.productType || "Custom packaging"}</div>
              <div><strong>Quantity:</strong> ${quote.quantity || "To be confirmed"}</div>
              ${quote.dimensions ? `<div><strong>Dimensions:</strong> ${quote.dimensions}</div>` : ""}
              ${quote.material ? `<div><strong>Material:</strong> ${quote.material}</div>` : ""}
              ${quote.printingDetails ? `<div><strong>Print / finish:</strong> ${quote.printingDetails}</div>` : ""}
            </div>
            <p>Reply to this email or contact us at <strong>818-758-4076</strong> if you would like to adjust the specification.</p>
            <p style="margin-bottom:0">Prime Packaging Boxes</p>
          </div>
          <div style="background:#f8fafc;padding:14px 28px;color:#6b7280;font-size:12px">444 Alaska Avenue Suite, Torrance, CA 90503, USA</div>
        </div>`,
      text: `Hi ${quote.name || "there"},\n\nThank you for your enquiry. Quotation ${quoteNumber} is ready for ${quote.productType || "custom packaging"}.\n\nReply to this email or call 818-758-4076.\n\nPrime Packaging Boxes`,
    });
    const [updated] = await db.update(quotesTable).set({ status: "quoted" }).where(eq(quotesTable.id, id)).returning();
    res.json({ success: true, quoteNumber, status: updated?.status ?? "quoted" });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e?.message ?? "Failed to send quote" });
  }
});

// Admin: POST /admin/quotes/:id/reply — send email reply to a Clark lead
router.post("/admin/quotes/:id/reply", requireCapability("sales"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) return res.status(400).json({ error: "Invalid quote id" });

    const message: string = req.body?.message?.trim?.() ?? "";
    if (!message) return res.status(400).json({ error: "message is required" });

    const [quote] = await db.select().from(quotesTable).where(eq(quotesTable.id, id)).limit(1);
    if (!quote) return res.status(404).json({ error: "Quote not found" });
    if (quote.source !== "clark") return res.status(400).json({ error: "Reply is only available for Clark AI leads" });

    // Send email to the customer
    const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <div style="background:#1B2B5E;padding:24px">
    <h1 style="color:#fff;margin:0;font-size:20px">📦 Message from Prime Packaging Boxes</h1>
  </div>
  <div style="padding:24px">
    <p style="font-size:15px;color:#374151;margin:0 0 16px">Hi ${quote.name},</p>
    <div style="white-space:pre-wrap;font-size:14px;color:#374151;line-height:1.6;background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:16px;">${message}</div>
    <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">If you have any questions, reply to this email or call us at 818-758-4076.</p>
  </div>
  <div style="background:#f8fafc;padding:12px 24px;font-size:12px;color:#9ca3af;">
    Prime Packaging Boxes · 444 Alaska Avenue Suite, Torrance, CA 90503 USA
  </div>
</div>`;

    await sendEmail({
      to: quote.email,
      subject: `Re: Your Quote Request #${quote.id} — Prime Packaging Boxes`,
      html,
      text: `Hi ${quote.name},\n\n${message}\n\nPrime Packaging Boxes`,
    });

    // Append reply to notes for paper trail
    const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const noteEntry = `[Reply sent ${timestamp}]\n${message}`;
    const existingNotes = quote.notes ?? "";
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n---\n${noteEntry}`
      : noteEntry;

    await db.update(quotesTable).set({ notes: updatedNotes }).where(eq(quotesTable.id, id));

    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e?.message ?? "Failed to send reply" });
  }
});

function fmt(q: any) {
  return {
    id: q.id,
    name: q.name,
    email: q.email,
    phone: q.phone ?? null,
    company: q.company ?? null,
    productType: q.productType,
    quantity: q.quantity,
    dimensions: q.dimensions ?? null,
    material: q.material ?? null,
    printingDetails: q.printingDetails ?? null,
    additionalNotes: q.additionalNotes ?? null,
    status: q.status,
    source: q.source ?? "form",
    clarkSessionId: q.clarkSessionId ?? null,
    clarkTranscript: q.clarkTranscript ?? null,
    message: q.message ?? null,
    notes: q.notes ?? null,
    followUpDone: q.followUpDone ?? false,
    followUpDate: q.followUpDate ?? null,
    followUpNotes: q.followUpNotes ?? null,
    createdAt: q.createdAt?.toISOString?.() ?? q.createdAt,
  };
}

export default router;
