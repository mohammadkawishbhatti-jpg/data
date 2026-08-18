import { useEffect, useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Loader2, ShieldCheck, XCircle } from "lucide-react";

type MonitoringData = {
  totals: { events: number; critical: number; warnings: number };
  byType: Record<string, number>;
  events: Array<{ id: number; eventType: string; severity: string; route?: string; message?: string; statusCode?: number; durationMs?: number; createdAt: string }>;
};

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [matrix, setMatrix] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [monitoring, capability] = await Promise.all([
        fetch("/api/admin/monitoring", { credentials: "include" }),
        fetch("/api/admin/capability-matrix", { credentials: "include" }),
      ]);
      if (!monitoring.ok || !capability.ok) throw new Error("Unable to load monitoring data");
      setData(await monitoring.json());
      setMatrix(await capability.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load monitoring data");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  return (
    <AdminLayout title="Monitoring & Capability Matrix">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-xl font-bold">Production monitoring</h1><p className="mt-1 text-sm text-muted-foreground">API latency, failed mutations, email failures, auth spikes, media failures, and browser runtime errors.</p></div>
          <button type="button" onClick={() => void load()} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted/20">Refresh</button>
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading monitoring…</div> : data && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-card p-5"><Activity className="h-5 w-5 text-primary" /><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Events · 24h</p><p className="mt-1 text-3xl font-black">{data.totals.events}</p></div>
              <div className="rounded-2xl border bg-card p-5"><AlertTriangle className="h-5 w-5 text-amber-600" /><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Warnings · 24h</p><p className="mt-1 text-3xl font-black">{data.totals.warnings}</p></div>
              <div className="rounded-2xl border bg-card p-5"><XCircle className="h-5 w-5 text-red-600" /><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Critical · 24h</p><p className="mt-1 text-3xl font-black">{data.totals.critical}</p></div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="rounded-2xl border bg-card p-5"><h2 className="font-bold">Event types</h2><div className="mt-4 space-y-3">{Object.entries(data.byType).map(([type, count]) => <div key={type} className="flex items-center justify-between gap-3 text-sm"><span className="truncate">{type.replace(/_/g, " ")}</span><strong>{count}</strong></div>)}</div></div>
              <div className="overflow-hidden rounded-2xl border bg-card"><div className="border-b p-5"><h2 className="font-bold">Recent operational events</h2></div><div className="max-h-[440px] divide-y overflow-auto">{data.events.length === 0 ? <p className="p-8 text-sm text-muted-foreground">No events in the last 24 hours.</p> : data.events.map(event => <div key={event.id} className="flex gap-3 p-4"><div className="mt-0.5">{event.severity === "critical" ? <XCircle className="h-4 w-4 text-red-600" /> : event.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}</div><div className="min-w-0 flex-1"><p className="font-semibold">{event.message || event.eventType}</p><p className="mt-1 text-xs text-muted-foreground">{event.eventType} · {event.route || "browser"}{event.statusCode ? ` · HTTP ${event.statusCode}` : ""}{event.durationMs ? ` · ${event.durationMs}ms` : ""}</p><p className="mt-1 text-[11px] text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p></div></div>)}</div></div>
            </div>
          </>
        )}

        {matrix && <div className="space-y-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="font-bold">Capability test matrix</h2><p className="mt-1 text-sm text-muted-foreground">Every guarded admin route and sensitive mutation has an explicit required capability. Automated API checks should assert unauthenticated 401, unauthorized 403, and permitted role 2xx behavior.</p></div></div></div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border bg-card"><div className="border-b p-5"><h2 className="font-bold">Role capabilities</h2></div><div className="divide-y">{matrix.roles.map((role: any) => <div key={role.role} className="p-4"><div className="flex items-center justify-between"><strong>{role.roleLabel}</strong><span className="text-xs text-muted-foreground">{role.role}</span></div><div className="mt-2 flex flex-wrap gap-1">{role.capabilities.map((capability: string) => <span key={capability} className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold">{capability}</span>)}</div></div>)}</div></div>
            <div className="overflow-hidden rounded-2xl border bg-card"><div className="border-b p-5"><h2 className="font-bold">Mutation rules</h2></div><div className="divide-y">{matrix.mutations.map((item: any) => <div key={item.mutation} className="p-4"><div className="flex items-center gap-2 font-semibold text-sm"><LockIcon /> {item.mutation}</div><p className="mt-1 text-xs text-muted-foreground">Required: <strong>{item.capability}</strong> · {item.rule}</p></div>)}</div></div>
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card"><div className="border-b p-5"><h2 className="font-bold">Guarded route matrix</h2></div><div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">{matrix.routes.map((item: any) => <div key={item.route} className="flex items-center justify-between gap-3 rounded-lg bg-muted/20 px-3 py-2 text-xs"><code>{item.route}</code><span className="font-semibold text-primary">{item.capability}</span></div>)}</div></div>
        </div>}
      </div>
    </AdminLayout>
  );
}

function LockIcon() {
  return <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px]">●</span>;
}