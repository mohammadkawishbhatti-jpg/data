import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  customersTable,
  supportTicketMessagesTable,
  supportTicketsTable,
} from "@workspace/db";
import { requireCapability } from "../middlewares/auth";
import { sendEmail } from "../lib/email";

const router = Router();

function ticketNumber() {
  return `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

const ticketBody = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(240),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(10).max(10000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

async function notifyTicketOwner(ticket: { referenceNumber: string; name: string; email: string; subject: string; message: string }) {
  const [settings] = await db.select().from((await import("@workspace/db")).siteSettingsTable).limit(1);
  const adminEmail = settings?.adminEmail || settings?.smtpTo || settings?.email;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `[${ticket.referenceNumber}] New support ticket — ${ticket.subject}`,
      text: `New support ticket ${ticket.referenceNumber}\n\nFrom: ${ticket.name} <${ticket.email}>\nSubject: ${ticket.subject}\n\n${ticket.message}`,
      html: `<div style="font-family:Arial,sans-serif"><h2>New support ticket ${ticket.referenceNumber}</h2><p><b>From:</b> ${ticket.name} &lt;${ticket.email}&gt;</p><p><b>Subject:</b> ${ticket.subject}</p><p>${ticket.message.replace(/\n/g, "<br>")}</p></div>`,
    }).catch(() => undefined);
  }
  await sendEmail({
    to: ticket.email,
    subject: `We received your support request ${ticket.referenceNumber}`,
    text: `Thanks ${ticket.name}. Your support request ${ticket.referenceNumber} has been received. Our team will reply shortly.`,
    html: `<div style="font-family:Arial,sans-serif"><h2>Support request received</h2><p>Thanks ${ticket.name}, we received <b>${ticket.referenceNumber}</b>.</p><p>Our team will reply to this email as soon as possible.</p></div>`,
  }).catch(() => undefined);
}

router.post("/support/tickets", async (req, res): Promise<void> => {
  const parsed = ticketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid ticket details" });
    return;
  }
  try {
    const [customer] = await db.select({ id: customersTable.id })
      .from(customersTable)
      .where(eq(customersTable.email, parsed.data.email.toLowerCase()))
      .limit(1);
    const referenceNumber = ticketNumber();
    const [ticket] = await db.insert(supportTicketsTable).values({
      referenceNumber,
      customerId: customer?.id,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      subject: parsed.data.subject,
      priority: parsed.data.priority,
    }).returning();
    await db.insert(supportTicketMessagesTable).values({
      ticketId: ticket.id,
      senderType: "customer",
      senderName: parsed.data.name,
      message: parsed.data.message,
    });
    await notifyTicketOwner({ ...parsed.data, referenceNumber });
    res.status(201).json({ success: true, referenceNumber, ticketId: ticket.id });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Unable to create support ticket" });
  }
});

router.get("/admin/support-tickets", requireCapability("support"), async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(supportTicketsTable).orderBy(desc(supportTicketsTable.updatedAt));
    res.json(rows);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Unable to load support tickets" });
  }
});

router.get("/admin/support-tickets/:id", requireCapability("support"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, id)).limit(1);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  const messages = await db.select().from(supportTicketMessagesTable)
    .where(eq(supportTicketMessagesTable.ticketId, id))
    .orderBy(supportTicketMessagesTable.createdAt);
  res.json({ ticket, messages });
});

router.patch("/admin/support-tickets/:id", requireCapability("support"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const body = z.object({
    status: z.enum(["new", "open", "pending", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    assignedTo: z.string().max(120).nullable().optional(),
  }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid ticket update" });
    return;
  }
  const [ticket] = await db.update(supportTicketsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(supportTicketsTable.id, id))
    .returning();
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(ticket);
});

router.post("/admin/support-tickets/:id/messages", requireCapability("support"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const message = z.string().trim().min(1).max(10000).safeParse(req.body?.message);
  if (!message.success) {
    res.status(400).json({ error: "Reply message is required" });
    return;
  }
  const [ticket] = await db.select().from(supportTicketsTable).where(eq(supportTicketsTable.id, id)).limit(1);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  const [row] = await db.insert(supportTicketMessagesTable).values({
    ticketId: id,
    senderType: "admin",
    senderName: (req as any).session.admin.username,
    message: message.data,
  }).returning();
  await db.update(supportTicketsTable).set({ status: "pending", updatedAt: new Date() }).where(eq(supportTicketsTable.id, id));
  await sendEmail({
    to: ticket.email,
    subject: `Reply to support request ${ticket.referenceNumber}`,
    text: message.data,
    html: `<div style="font-family:Arial,sans-serif"><h2>Reply to ${ticket.referenceNumber}</h2><p>${message.data.replace(/\n/g, "<br>")}</p><hr><p style="color:#64748b">Prime Packaging Boxes Support</p></div>`,
  }).catch(() => undefined);
  res.status(201).json(row);
});

export default router;