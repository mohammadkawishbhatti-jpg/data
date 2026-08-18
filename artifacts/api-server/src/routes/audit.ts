import { Router } from "express";
import { db, adminAuditLogsTable, adminAuditSettingsTable } from "@workspace/db";
import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { requireAdministrator, requireCapability } from "../middlewares/auth";
import { pruneAdminAuditLogs } from "../lib/audit";
import { z } from "zod";

const router = Router();

router.get("/admin/audit-logs", requireCapability("superadmin"), async (req, res) => {
  try {
    await pruneAdminAuditLogs();
    const query = req.query as Record<string, string | undefined>;
    const filters = [];
    if (query.username) filters.push(eq(adminAuditLogsTable.username, query.username));
    if (query.action) filters.push(eq(adminAuditLogsTable.action, query.action));
    if (query.entityType) filters.push(eq(adminAuditLogsTable.entityType, query.entityType));
    if (query.search) filters.push(ilike(adminAuditLogsTable.summary, `%${query.search.slice(0, 80)}%`));
    if (query.from) {
      const from = new Date(query.from);
      if (!Number.isNaN(from.getTime())) filters.push(gte(adminAuditLogsTable.createdAt, from));
    }
    if (query.to) {
      const to = new Date(query.to);
      if (!Number.isNaN(to.getTime())) filters.push(lte(adminAuditLogsTable.createdAt, to));
    }
    const rows = await db.select().from(adminAuditLogsTable)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(adminAuditLogsTable.createdAt))
      .limit(Math.min(Math.max(Number(query.limit) || 500, 1), 500));
    res.json(rows.map((row) => ({
      ...row,
      createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    })));
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Unable to load audit logs" });
  }
});

router.get("/admin/audit-logs/export", requireAdministrator, async (req, res) => {
  try {
    await pruneAdminAuditLogs(true);
    const query = req.query as Record<string, string | undefined>;
    const filters = [];
    if (query.username) filters.push(eq(adminAuditLogsTable.username, query.username));
    if (query.action) filters.push(eq(adminAuditLogsTable.action, query.action));
    if (query.entityType) filters.push(eq(adminAuditLogsTable.entityType, query.entityType));
    if (query.from) {
      const from = new Date(query.from);
      if (!Number.isNaN(from.getTime())) filters.push(gte(adminAuditLogsTable.createdAt, from));
    }
    if (query.to) {
      const to = new Date(query.to);
      if (!Number.isNaN(to.getTime())) filters.push(lte(adminAuditLogsTable.createdAt, to));
    }
    const rows = await db.select().from(adminAuditLogsTable)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(adminAuditLogsTable.createdAt))
      .limit(10000);
    const normalized = rows.map(row => ({
      ...row,
      createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    }));
    const format = query.format === "csv" ? "csv" : "json";
    if (format === "json") {
      res.type("application/json").set("Content-Disposition", "attachment; filename=prime-audit-export.json").send(JSON.stringify({
        exportedAt: new Date().toISOString(),
        immutable: true,
        rows: normalized,
      }, null, 2));
      return;
    }
    const columns = ["id", "actorId", "username", "role", "action", "entityType", "entityId", "route", "summary", "metadata", "integrityHash", "createdAt"];
    const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
    const csv = [columns.join(","), ...normalized.map(row => columns.map(column => csvCell((row as any)[column])).join(","))].join("\n");
    res.type("text/csv").set("Content-Disposition", "attachment; filename=prime-audit-export.csv").send(csv);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Unable to export audit logs" });
  }
});

router.get("/admin/audit-settings", requireAdministrator, async (_req, res) => {
  const [settings] = await db.select().from(adminAuditSettingsTable).where(eq(adminAuditSettingsTable.id, 1));
  res.json(settings ?? { id: 1, retentionDays: 30, sensitiveAlertsEnabled: true, sensitiveAlertEmail: null });
});

router.put("/admin/audit-settings", requireAdministrator, async (req, res) => {
  try {
    const body = z.object({
      retentionDays: z.number().int().min(1).max(3650),
      sensitiveAlertsEnabled: z.boolean(),
      sensitiveAlertEmail: z.string().email().nullable().optional(),
    }).parse(req.body);
    const [existing] = await db.select().from(adminAuditSettingsTable).where(eq(adminAuditSettingsTable.id, 1));
    const [settings] = existing
      ? await db.update(adminAuditSettingsTable).set({ ...body, updatedAt: new Date() }).where(eq(adminAuditSettingsTable.id, 1)).returning()
      : await db.insert(adminAuditSettingsTable).values({ id: 1, ...body }).returning();
    res.json(settings);
  } catch (error: any) {
    res.status(error?.name === "ZodError" ? 400 : 500).json({ error: "Unable to save audit settings" });
  }
});

export default router;