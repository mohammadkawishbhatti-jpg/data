import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { ChevronDown, Clock3, Loader2, RefreshCw, Search, ShieldCheck } from "lucide-react";

type AuditLog = {
  id: number;
  username: string;
  role: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  route: string;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (username) params.set("username", username);
    if (action) params.set("action", action);
    if (entityType) params.set("entityType", entityType);
    try {
      const response = await fetch(`/api/admin/audit-logs?${params}`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load audit history");
      setLogs(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load audit history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadLogs(), 250);
    return () => window.clearTimeout(timer);
  }, [search, username, action, entityType]);

  const usernames = useMemo(() => [...new Set(logs.map(log => log.username))].sort(), [logs]);
  const actions = useMemo(() => [...new Set(logs.map(log => log.action))].sort(), [logs]);
  const entityTypes = useMemo(() => [...new Set(logs.map(log => log.entityType))].sort(), [logs]);
  const selectedUserLogs = username ? logs.filter(log => log.username === username) : logs;

  return (
    <AdminLayout title="Audit Log">
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/15 p-2 text-primary"><ShieldCheck className="h-5 w-5" /></div>
            <div className="min-w-0">
              <h1 className="font-bold">Super Admin activity history</h1>
              <p className="mt-1 text-sm text-muted-foreground">Every successful admin mutation is recorded with the user, action, target and time. Logs are automatically deleted after 7 days.</p>
            </div>
            <button type="button" onClick={() => void loadLogs()} className="ml-auto shrink-0 rounded-lg border border-primary/20 bg-background p-2 text-primary hover:bg-primary/10" title="Refresh audit log" aria-label="Refresh audit log">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Search activity</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search activity..." className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <select value={username} onChange={event => setUsername(event.target.value)} aria-label="Filter by user" className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">All users</option>
            {usernames.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={action} onChange={event => setAction(event.target.value)} aria-label="Filter by action" className="h-10 rounded-lg border border-input bg-background px-3 text-sm capitalize outline-none focus:ring-2 focus:ring-ring">
            <option value="">All actions</option>
            {actions.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={entityType} onChange={event => setEntityType(event.target.value)} aria-label="Filter by area" className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">All areas</option>
            {entityTypes.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visible events</p><p className="mt-1 text-2xl font-bold">{logs.length}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected user</p><p className="mt-1 truncate text-lg font-bold">{username || "All users"}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User events</p><p className="mt-1 text-2xl font-bold">{selectedUserLogs.length}</p></div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading activity…</div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-destructive"><p>{error}</p><button type="button" onClick={() => void loadLogs()} className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 font-semibold hover:bg-destructive/10"><RefreshCw className="h-4 w-4" /> Try again</button></div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No activity matches these filters in the current 7-day window.</div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <details key={log.id} className="group">
                  <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-muted p-2"><Clock3 className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="min-w-0">
                        <p className="font-semibold">{log.summary}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{log.route}{log.entityId ? ` · target #${log.entityId}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-left sm:text-right">
                      <div><p className="text-sm font-semibold">{log.username}</p><p className="text-xs capitalize text-muted-foreground">{log.role} · {new Date(log.createdAt).toLocaleString()}</p></div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </div>
                  </summary>
                  <div className="border-t bg-muted/20 px-4 py-4 sm:pl-16">
                    <div className="grid gap-3 text-xs sm:grid-cols-3">
                      <div><span className="font-semibold text-muted-foreground">Action</span><p className="mt-1 capitalize">{log.action}</p></div>
                      <div><span className="font-semibold text-muted-foreground">Area</span><p className="mt-1">{log.entityType}{log.entityId ? ` #${log.entityId}` : ""}</p></div>
                      <div><span className="font-semibold text-muted-foreground">Timestamp</span><p className="mt-1">{new Date(log.createdAt).toISOString()}</p></div>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">Request details</p>
                        <pre className="max-h-48 overflow-auto rounded-lg border bg-background p-3 font-mono text-[11px] leading-5">{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}