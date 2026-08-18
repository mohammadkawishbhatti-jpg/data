import { Router } from "express";
import { desc, gte } from "drizzle-orm";
import { db, monitoringEventsTable } from "@workspace/db";
import { requireAdministrator } from "../middlewares/auth";
import { recordMonitoringEvent } from "../lib/monitoring";

const router = Router();

router.get("/admin/monitoring", requireAdministrator, async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const events = await db.select().from(monitoringEventsTable)
      .where(gte(monitoringEventsTable.createdAt, since))
      .orderBy(desc(monitoringEventsTable.createdAt))
      .limit(500);
    const byType = events.reduce<Record<string, number>>((counts, event) => {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
      return counts;
    }, {});
    res.json({
      window: "24h",
      totals: {
        events: events.length,
        critical: events.filter(event => event.severity === "critical").length,
        warnings: events.filter(event => event.severity === "warning").length,
      },
      byType,
      events: events.map(event => ({
        ...event,
        createdAt: event.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Unable to load monitoring data" });
  }
});

// Browser apps use this endpoint for uncaught runtime errors. It deliberately
// accepts only a short, sanitized event and never stores stack secrets.
router.post("/monitoring/frontend-error", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message : "Frontend runtime error";
  // Chrome extensions can inject the M_ID error into the page and repeatedly
  // report it as if it were an application exception. It is not actionable
  // application telemetry, so acknowledge it without filling the monitoring DB.
  if (/reading ['"]?M_ID['"]?/i.test(message)) {
    return res.status(202).json({ accepted: true, ignored: "browser-extension-noise" });
  }
  await recordMonitoringEvent({
    eventType: "frontend_error",
    severity: "critical",
    route: typeof req.body?.route === "string" ? req.body.route : null,
    message,
    metadata: {
      name: req.body?.name,
      browser: req.body?.browser,
      component: req.body?.component,
    },
  });
  res.status(202).json({ accepted: true });
});

export default router;