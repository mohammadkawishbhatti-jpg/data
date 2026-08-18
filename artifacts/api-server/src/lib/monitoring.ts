import type { NextFunction, Request, Response } from "express";
import { db, monitoringEventsTable } from "@workspace/db";

const SENSITIVE_KEYS = /password|secret|token|api.?key|smtp|cookie|authorization/i;

function sanitizeMetadata(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return Object.fromEntries(Object.entries(input as Record<string, unknown>)
    .filter(([key]) => !SENSITIVE_KEYS.test(key))
    .slice(0, 20)
    .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 500) : value]));
}

export async function recordMonitoringEvent(input: {
  eventType: string;
  severity?: string;
  route?: string | null;
  method?: string | null;
  statusCode?: number | null;
  durationMs?: number | null;
  message?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(monitoringEventsTable).values({
      eventType: input.eventType,
      severity: input.severity ?? "info",
      route: input.route ?? null,
      method: input.method ?? null,
      statusCode: input.statusCode ?? null,
      durationMs: input.durationMs ?? null,
      message: input.message?.slice(0, 1000) ?? null,
      metadata: sanitizeMetadata(input.metadata),
    });
  } catch {
    // Monitoring must not break the request it observes.
  }
}

export function monitoringMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startedAt = Date.now();
  res.once("finish", () => {
    if (!req.path.startsWith("/api/")) return;
    const durationMs = Date.now() - startedAt;
    const statusCode = res.statusCode;
    if (durationMs >= 1000) {
      void recordMonitoringEvent({
        eventType: "api_latency",
        severity: durationMs >= 3000 ? "critical" : "warning",
        route: req.path,
        method: req.method,
        statusCode,
        durationMs,
        message: `API request took ${durationMs}ms`,
      });
    }
    if (statusCode >= 400) {
      const authSpike = statusCode === 401 || statusCode === 403;
      void recordMonitoringEvent({
        eventType: authSpike ? "auth_spike" : (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) ? "mutation_failure" : "api_error"),
        severity: statusCode >= 500 ? "critical" : "warning",
        route: req.path,
        method: req.method,
        statusCode,
        durationMs,
        message: `Request returned ${statusCode}`,
      });
    }
  });
  next();
}