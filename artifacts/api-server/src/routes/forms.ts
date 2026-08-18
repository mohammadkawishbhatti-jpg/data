import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { customFormsTable, db, formSubmissionsTable } from "@workspace/db";
import { requireCapability } from "../middlewares/auth";

const router = Router();
const field = z.object({
  key: z.string().trim().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().trim().min(1).max(120),
  type: z.enum(["text", "email", "tel", "textarea", "select", "checkbox"]),
  required: z.boolean().optional(),
});
const formInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  fields: z.array(field).max(50),
  active: z.boolean().optional(),
});

router.get("/admin/forms", requireCapability("forms"), async (_req, res) => {
  res.json(await db.select().from(customFormsTable).orderBy(desc(customFormsTable.updatedAt)));
});

router.post("/admin/forms", requireCapability("forms"), async (req, res) => {
  const parsed = formInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid form" }); return; }
  try {
    const [form] = await db.insert(customFormsTable).values(parsed.data).returning();
    res.status(201).json(form);
  } catch (error: any) {
    if (error?.code === "23505") { res.status(409).json({ error: "Form slug already exists" }); return; }
    res.status(500).json({ error: "Unable to save form" });
  }
});

router.patch("/admin/forms/:id", requireCapability("forms"), async (req, res) => {
  const parsed = formInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid form update" }); return; }
  const [form] = await db.update(customFormsTable).set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(customFormsTable.id, Number(req.params.id))).returning();
  if (!form) { res.status(404).json({ error: "Form not found" }); return; }
  res.json(form);
});

router.get("/admin/forms/:id/submissions", requireCapability("forms"), async (req, res) => {
  res.json(await db.select().from(formSubmissionsTable)
    .where(eq(formSubmissionsTable.formId, Number(req.params.id)))
    .orderBy(desc(formSubmissionsTable.createdAt)).limit(500));
});

router.post("/forms/:slug/submissions", async (req, res) => {
  const [form] = await db.select().from(customFormsTable)
    .where(eq(customFormsTable.slug, String(req.params.slug))).limit(1);
  if (!form || !form.active) { res.status(404).json({ error: "Form not found" }); return; }
  const data = (req.body?.data && typeof req.body.data === "object") ? req.body.data : req.body;
  const missing = form.fields.filter((item) => item.required && !String((data as any)?.[item.key] ?? "").trim());
  if (missing.length) { res.status(400).json({ error: `Required field: ${missing[0].label}` }); return; }
  const [submission] = await db.insert(formSubmissionsTable).values({
    formId: form.id, data, email: typeof (data as any)?.email === "string" ? (data as any).email : null,
    source: req.get("referer") || null,
  }).returning({ id: formSubmissionsTable.id, createdAt: formSubmissionsTable.createdAt });
  res.status(201).json({ success: true, submission });
});

export default router;