import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SubmitContactBody, UpdateLeadStatusParams, UpdateLeadStatusBody } from "@workspace/api-zod";
import { sendContactEmail } from "../lib/email";
import { requireCapability } from "../middlewares/auth";

const router = Router();

// POST /contact
router.post("/contact", async (req, res) => {
  try {
    const data = SubmitContactBody.parse(req.body);
    await db.insert(leadsTable).values(data);
    // Send email notification (non-blocking)
    sendContactEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    }).catch(err => console.error("[EMAIL] Contact email error:", err));
    res.status(201).json({ success: true, message: "Message sent successfully" });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: GET /admin/leads
router.get("/admin/leads", requireCapability("sales"), async (req, res) => {
  try {
    const rows = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: PATCH /admin/leads/:id
router.patch("/admin/leads/:id", requireCapability("sales"), async (req, res) => {
  try {
    const { id } = UpdateLeadStatusParams.parse(req.params);
    const body: Record<string, any> = {};
    if (req.body.status !== undefined) body.status = req.body.status;
    if (req.body.followUpDone !== undefined) body.followUpDone = req.body.followUpDone;
    if ("followUpDate" in req.body) body.followUpDate = req.body.followUpDate;
    if ("followUpNotes" in req.body) body.followUpNotes = req.body.followUpNotes;
    const [row] = await db.update(leadsTable).set(body)
      .where(eq(leadsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

function fmt(l: any) {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone ?? null,
    subject: l.subject ?? null,
    message: l.message,
    status: l.status,
    followUpDone: l.followUpDone ?? false,
    followUpDate: l.followUpDate?.toISOString?.() ?? l.followUpDate ?? null,
    followUpNotes: l.followUpNotes ?? null,
    createdAt: l.createdAt?.toISOString?.() ?? l.createdAt,
  };
}

export default router;
