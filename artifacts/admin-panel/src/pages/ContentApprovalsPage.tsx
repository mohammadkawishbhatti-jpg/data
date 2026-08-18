import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Check, Eye, GitCompare, History, Loader2, Package, RotateCcw, Send, Trash2, X } from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

type Revision = {
  id: number;
  entityType: string;
  entityId: number;
  entityLabel: string;
  payload: Record<string, unknown>;
  status: string;
  createdById: number | null;
  createdByUsername: string | null;
  createdByRole: string | null;
  approvedByUsername: string | null;
  rejectionReason: string | null;
  previewToken: string;
  createdAt: string;
};

function prettyPayload(payload: Record<string, unknown>) {
  return JSON.stringify(payload, null, 2);
}

function prettyValue(value: unknown) {
  if (value === undefined) return "—";
  if (value === null || value === "") return "Empty";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function diffPayloads(before: Record<string, unknown>, after: Record<string, unknown>) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys]
    .map(key => {
      const oldValue = prettyValue(before[key]);
      const newValue = prettyValue(after[key]);
      const state = before[key] === undefined ? "added" : after[key] === undefined ? "removed" : oldValue !== newValue ? "changed" : "same";
      return { key, oldValue, newValue, state };
    })
    .filter(item => item.state !== "same");
}

export default function ContentApprovalsPage() {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("pending");
  const [entityType, setEntityType] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [compareId, setCompareId] = useState<number | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (entityType !== "all") params.set("entityType", entityType);
      const response = await fetch(`${API}/admin/content-revisions?${params}`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load revision history");
      setRevisions(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load revision history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    fetch(`${API}/admin/me`, { credentials: "include" })
      .then(response => response.ok ? response.json() : null)
      .then(admin => setCanApprove(Boolean(admin?.capabilities?.includes("*") || admin?.capabilities?.includes("content-approval"))))
      .catch(() => undefined);
  }, [status, entityType]);

  const selected = revisions.find(revision => revision.id === selectedId) ?? null;
  const compare = revisions.find(revision => revision.id === compareId) ?? null;
  const sameEntity = useMemo(
    () => selected ? revisions.filter(revision => revision.entityType === selected.entityType && revision.entityId === selected.entityId && revision.id !== selected.id) : [],
    [revisions, selected],
  );

  const mutate = async (id: number, action: "approve" | "publish" | "reject" | "restore") => {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`${API}/admin/content-revisions/${id}/${action}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify({ reason: "Needs revision before approval" }) : undefined,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Unable to ${action} revision`);
      await load();
      if (action !== "restore") setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${action} revision`);
    } finally {
      setBusyId(null);
    }
  };

  const previewUrl = (revision: Revision) =>
    `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/preview/${revision.previewToken}`;

  return (
    <AdminLayout title="Approval Center">
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/15 p-2 text-primary"><History className="h-5 w-5" /></div>
            <div>
                 <h1 className="font-bold">Approval Center</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                   Product, category, banner, page, blog, and template changes stay private until an authorized reviewer approves them. Super Admin and Basic Admin can review this queue; Editors can review their own submissions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select value={status} onChange={event => setStatus(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
            <option value="pending">Pending approval</option>
            <option value="approved">Approved</option>
            <option value="published">Published versions</option>
            <option value="rejected">Rejected</option>
            <option value="all">All revisions</option>
          </select>
           <select value={entityType} onChange={event => setEntityType(event.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
            <option value="all">All content types</option>
             <option value="product">Products</option>
             <option value="category">Categories</option>
             <option value="banner">Banners</option>
            <option value="page">Pages</option>
            <option value="blog">Blog posts</option>
            <option value="template">Templates</option>
          </select>
          <button type="button" onClick={() => void load()} className="h-10 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-muted/20">Refresh</button>
           {!canApprove && <span className="text-xs font-semibold text-amber-700">Review access only — an authorized reviewer must approve changes</span>}
        </div>

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="overflow-hidden rounded-2xl border bg-card">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading revision history…</div>
          ) : revisions.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No revisions match this filter.</div>
          ) : (
            <div className="divide-y">
              {revisions.map(revision => (
                <div key={revision.id} className={`flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between ${selectedId === revision.id ? "bg-primary/5" : ""}`}>
                  <button type="button" onClick={() => setSelectedId(selectedId === revision.id ? null : revision.id)} className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="flex items-center gap-2 font-semibold">
                         {revision.entityType === "product" ? <Package className="h-4 w-4 text-primary" /> : <History className="h-4 w-4 text-muted-foreground" />}
                         {revision.entityLabel}
                       </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">{revision.entityType}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${revision.status === "pending" ? "bg-amber-100 text-amber-800" : revision.status === "rejected" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{revision.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Revision #{revision.id} · {revision.createdByUsername || "Admin"} · {new Date(revision.createdAt).toLocaleString()}
                    </p>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <a href={previewUrl(revision)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-muted/20"><Eye className="h-3.5 w-3.5" /> Preview</a>
                    <button type="button" onClick={() => { setSelectedId(revision.id); setCompareId(null); }} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-muted/20"><GitCompare className="h-3.5 w-3.5" /> Compare</button>
                      {canApprove && revision.status === "pending" && (
                      <>
                         <button type="button" disabled={busyId === revision.id} onClick={() => void mutate(revision.id, "approve")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> {revision.payload?.operation === "delete" ? "Approve delete" : "Approve"}</button>
                        <button type="button" disabled={busyId === revision.id} onClick={() => void mutate(revision.id, "reject")} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><X className="h-3.5 w-3.5" /> Reject</button>
                      </>
                    )}
                    {canApprove && revision.status !== "rejected" && revision.status !== "published" && (
                      <button type="button" disabled={busyId === revision.id} onClick={() => void mutate(revision.id, "publish")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"><Send className="h-3.5 w-3.5" /> Publish</button>
                    )}
                  </div>
                  {selectedId === revision.id && (
                    <div className="basis-full rounded-xl border bg-background p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Revision details</p>
                        <div className="flex flex-wrap gap-2">
                          <select value={compareId ?? ""} onChange={event => setCompareId(event.target.value ? Number(event.target.value) : null)} className="h-8 rounded-md border bg-background px-2 text-xs">
                            <option value="">Compare with…</option>
                            {sameEntity.map(other => <option key={other.id} value={other.id}>Revision #{other.id} · {other.status}</option>)}
                          </select>
                          <button type="button" onClick={() => void mutate(revision.id, "restore")} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold hover:bg-muted/20"><RotateCcw className="h-3 w-3" /> Restore as draft</button>
                        </div>
                      </div>
                      {compare ? (
                         <>
                           <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                             <div className="flex flex-wrap items-center justify-between gap-2">
                               <div>
                                 <p className="text-sm font-bold text-amber-950">Highlighted changes</p>
                                 <p className="mt-1 text-xs text-amber-900/70">Comparing Revision #{compare.id} with Revision #{revision.id}</p>
                               </div>
                               <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                                 <span className="rounded-full bg-amber-200 px-2 py-1 text-amber-950">Changed</span>
                                 <span className="rounded-full bg-emerald-200 px-2 py-1 text-emerald-900">Added</span>
                                 <span className="rounded-full bg-red-200 px-2 py-1 text-red-900">Removed</span>
                               </div>
                             </div>
                             <div className="mt-3 space-y-2">
                               {diffPayloads(compare.payload, revision.payload).length === 0 ? (
                                 <p className="rounded-lg bg-white/70 px-3 py-2 text-xs text-amber-900">No field-level changes found.</p>
                               ) : diffPayloads(compare.payload, revision.payload).map(change => (
                                 <div key={change.key} className={`rounded-lg border p-3 ${change.state === "added" ? "border-emerald-200 bg-emerald-50" : change.state === "removed" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-100/70"}`}>
                                   <div className="mb-2 flex flex-wrap items-center gap-2">
                                     <span className="font-mono text-xs font-bold text-slate-900">{change.key}</span>
                                     <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${change.state === "added" ? "bg-emerald-200 text-emerald-900" : change.state === "removed" ? "bg-red-200 text-red-900" : "bg-amber-200 text-amber-950"}`}>{change.state}</span>
                                   </div>
                                   <div className="grid gap-2 text-xs md:grid-cols-2">
                                     <div className="min-w-0 rounded-md border border-slate-200 bg-white/75 p-2">
                                       <p className="mb-1 font-bold uppercase tracking-wider text-slate-400">Before</p>
                                       <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-red-800">{change.oldValue}</pre>
                                     </div>
                                     <div className="min-w-0 rounded-md border border-slate-200 bg-white/75 p-2">
                                       <p className="mb-1 font-bold uppercase tracking-wider text-slate-400">After</p>
                                       <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-emerald-800">{change.newValue}</pre>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                           <div className="mt-3 grid gap-3 lg:grid-cols-2">
                             <div>
                               <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Previous revision</p>
                               <pre className="max-h-80 overflow-auto rounded-lg bg-muted/20 p-3 text-[11px] leading-5">{prettyPayload(compare.payload)}</pre>
                             </div>
                             <div>
                               <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary">Selected revision</p>
                               <pre className="max-h-80 overflow-auto rounded-lg bg-primary/5 p-3 text-[11px] leading-5">{prettyPayload(revision.payload)}</pre>
                             </div>
                           </div>
                         </>
                      ) : (
                        <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-muted/20 p-3 text-[11px] leading-5">{prettyPayload(revision.payload)}</pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}