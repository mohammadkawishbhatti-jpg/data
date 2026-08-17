import { Router } from "express";
import { db, adminAuditLogsTable } from "@workspace/db";
import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { requireCapability } from "../middlewares/auth";
import { pruneAdminAuditLogs } from "../lib/audit";

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

export default router;