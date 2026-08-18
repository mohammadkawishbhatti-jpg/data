import type { NextFunction, Request, Response } from "express";
import { db } from "@workspace/db";
import { adminAuditLogsTable, adminAuditSettingsTable } from "@workspace/db";
import { desc, eq, lt } from "drizzle-orm";
import crypto from "node:crypto";
import { sendEmail } from "./email";

let lastPrunedAt = 0;

function safeMetadata(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  const blocked = /password|secret|token|api.?key|smtp|gemini|credential|authorization|cookie/i;
  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>)
      .filter(([key]) => !blocked.test(key))
      .map(([key, value]) => [key, Array.isArray(value) ? `[${value.length} items]` : typeof value === "object" && value !== null ? "[object]" : value])
      .slice(0, 24),
  );
}

export async function pruneAdminAuditLogs(force = false): Promise<void> {
  if (!force && Date.now() - lastPrunedAt < 60 * 60 * 1000) return;
  lastPrunedAt = Date.now();
  const [settings] = await db.select().from(adminAuditSettingsTable)
    .where(eq(adminAuditSettingsTable.id, 1));
  const retentionDays = Math.min(Math.max(settings?.retentionDays ?? 30, 1), 3650);
  await db.delete(adminAuditLogsTable).where(
    lt(adminAuditLogsTable.createdAt, new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)),
  );
}

export async function recordAdminAudit(input: {
  adminUserId?: number | null;
  username: string;
  role: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  route: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await pruneAdminAuditLogs();
    const [previous] = await db.select({ integrityHash: adminAuditLogsTable.integrityHash })
      .from(adminAuditLogsTable).orderBy(desc(adminAuditLogsTable.id)).limit(1);
    const safe = safeMetadata(input.metadata);
    const createdAt = new Date();
    const integrityHash = crypto.createHash("sha256").update(JSON.stringify({
      previous: previous?.integrityHash ?? null,
      actorId: input.adminUserId ?? null,
      username: input.username,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      route: input.route,
      summary: input.summary,
      metadata: safe,
      createdAt: createdAt.toISOString(),
    })).digest("hex");
    await db.insert(adminAuditLogsTable).values({
      adminUserId: input.adminUserId ?? null,
      actorId: input.adminUserId == null ? null : String(input.adminUserId),
      username: input.username,
      role: input.role,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      route: input.route,
      summary: input.summary,
      metadata: safe,
      integrityHash,
      createdAt,
    });

    const sensitive = /delete|password|reset|invite|access|security|role|export/i.test(`${input.action} ${input.route} ${input.entityType}`);
    const [settings] = await db.select().from(adminAuditSettingsTable).where(eq(adminAuditSettingsTable.id, 1));
    if (sensitive && settings?.sensitiveAlertsEnabled && settings.sensitiveAlertEmail) {
      void sendEmail({
        to: settings.sensitiveAlertEmail,
        subject: `Prime Admin sensitive action: ${input.action}`,
        html: `<p>A sensitive admin action was recorded.</p><p><strong>Actor:</strong> ${input.username} (${input.adminUserId ?? "unknown"})</p><p><strong>Action:</strong> ${input.action}</p><p><strong>Route:</strong> ${input.route}</p><p><strong>Time:</strong> ${createdAt.toISOString()}</p>`,
      }).catch(() => undefined);
    }
  } catch {
    // Audit logging must never break the business mutation that triggered it.
  }
}

function mutationAction(method: string): string {
  if (method === "POST") return "create";
  if (method === "PUT" || method === "PATCH") return "update";
  if (method === "DELETE") return "delete";
  return method.toLowerCase();
}

function auditPathParts(req: Request): { entityType: string; entityId: string | null; action: string } {
  const path = req.originalUrl.split("?")[0];
  const parts = path.split("/").filter(Boolean);
  const adminIndex = parts.indexOf("admin");
  const resource = adminIndex >= 0 ? parts.slice(adminIndex + 1) : parts;
  const entityType = resource[0] || "admin";
  const entityId = resource[1] && /^\d+$/.test(resource[1]) ? resource[1] : null;
  const routeAction = resource[2];
  const action = ["approve", "publish", "reject", "restore"].includes(routeAction)
    ? routeAction
    : mutationAction(req.method);
  return { entityType, entityId, action };
}

export function adminAuditMiddleware(req: Request, res: Response, next: NextFunction): void {
  const isAdminMutation =
    req.path.startsWith("/api/admin/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    !req.path.endsWith("/login") &&
    !req.path.endsWith("/logout");

  if (isAdminMutation) {
    res.once("finish", () => {
      const admin = (req as any).session?.admin;
      if (!admin || res.statusCode < 200 || res.statusCode >= 300) return;
      const { entityType, entityId, action } = auditPathParts(req);
      void recordAdminAudit({
        adminUserId: admin.id ?? null,
        username: String(admin.username),
        role: String(admin.role),
        action,
        entityType,
        entityId,
        route: req.path,
        summary: `${action[0].toUpperCase()}${action.slice(1)} ${entityType}${entityId ? ` #${entityId}` : ""}`,
        metadata: safeMetadata(req.body),
      });
    });
  }
  next();
}
