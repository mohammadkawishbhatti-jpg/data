import { Router } from "express";
import { db } from "@workspace/db";
import { quotesTable, leadsTable } from "@workspace/db";
import { eq, desc, gte, lt } from "drizzle-orm";
import { requireCapability } from "../middlewares/auth";

const router = Router();

// GET /api/admin/follow-ups?date=YYYY-MM-DD
// Returns combined quotes + leads, optionally filtered by submission date
router.get("/admin/follow-ups", requireCapability("sales"), async (req, res) => {
  try {
    const { date } = req.query as { date?: string };

    let quotesQuery = db.select().from(quotesTable).orderBy(desc(quotesTable.createdAt));
    let leadsQuery  = db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));

    if (date) {
      const from = new Date(date);
      from.setHours(0, 0, 0, 0);
      const to = new Date(date);
      to.setHours(23, 59, 59, 999);
      // @ts-ignore — drizzle where chaining
      quotesQuery = db.select().from(quotesTable)
        .where(eq(quotesTable.createdAt, quotesTable.createdAt)) // placeholder replaced below
        .orderBy(desc(quotesTable.createdAt));
      // Use raw filter after fetch (simpler than fighting TS generics)
    }

    const [rawQuotes, rawLeads] = await Promise.all([
      db.select().from(quotesTable).orderBy(desc(quotesTable.createdAt)),
      db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt)),
    ]);

    const fmtQuote = (q: any) => ({
      id: q.id,
      type: "quote" as const,
      name: q.name,
      email: q.email,
      phone: q.phone ?? null,
      company: q.company ?? null,
      subject: q.productType ?? null,
      message: q.additionalNotes ?? null,
      // Extra detail fields
      productType:     q.productType     ?? null,
      quantity:        q.quantity        ?? null,
      dimensions:      q.dimensions      ?? null,
      material:        q.material        ?? null,
      printingDetails: q.printingDetails ?? null,
      status: q.status,
      followUpDone: q.followUpDone ?? false,
      followUpDate: q.followUpDate?.toISOString?.() ?? q.followUpDate ?? null,
      followUpNotes: q.followUpNotes ?? null,
      createdAt: q.createdAt?.toISOString?.() ?? q.createdAt,
    });

    const fmtLead = (l: any) => ({
      id: l.id,
      type: "lead" as const,
      name: l.name,
      email: l.email,
      phone: l.phone ?? null,
      company: null,
      subject: l.subject ?? null,
      message: l.message,
      status: l.status,
      followUpDone: l.followUpDone ?? false,
      followUpDate: l.followUpDate?.toISOString?.() ?? l.followUpDate ?? null,
      followUpNotes: l.followUpNotes ?? null,
      createdAt: l.createdAt?.toISOString?.() ?? l.createdAt,
    });

    let combined = [
      ...rawQuotes.map(fmtQuote),
      ...rawLeads.map(fmtLead),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Date filter
    if (date) {
      const from = new Date(date); from.setHours(0, 0, 0, 0);
      const to   = new Date(date); to.setHours(23, 59, 59, 999);
      combined = combined.filter(r => {
        const d = new Date(r.createdAt);
        return d >= from && d <= to;
      });
    }

    res.json(combined);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/follow-ups/:type/:id   (type = "quote" | "lead")
router.patch("/admin/follow-ups/:type/:id", requireCapability("sales"), async (req, res) => {
  try {
    const type = String(req.params.type);
    const id = String(req.params.id);
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return res.status(400).json({ error: "Invalid id" });

    const body: Record<string, any> = {};
    if (req.body.followUpDone  !== undefined) body.followUpDone  = req.body.followUpDone;
    if ("followUpDate"  in req.body) body.followUpDate  = req.body.followUpDate;
    if ("followUpNotes" in req.body) body.followUpNotes = req.body.followUpNotes;
    if (req.body.status !== undefined) body.status = req.body.status;

    if (type === "quote") {
      const [row] = await db.update(quotesTable).set(body).where(eq(quotesTable.id, numId)).returning();
      if (!row) return res.status(404).json({ error: "Not found" });
      return res.json({ ok: true, followUpDone: row.followUpDone });
    } else if (type === "lead") {
      const [row] = await db.update(leadsTable).set(body).where(eq(leadsTable.id, numId)).returning();
      if (!row) return res.status(404).json({ error: "Not found" });
      return res.json({ ok: true, followUpDone: row.followUpDone });
    } else {
      return res.status(400).json({ error: "type must be 'quote' or 'lead'" });
    }
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
