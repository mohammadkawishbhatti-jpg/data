import { useState, useRef } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import {
  Database, Download, Upload, Trash2, RefreshCw,
  Loader2, CheckCircle2, AlertCircle, Table2,
  HardDrive, Server, FileCode2, AlertTriangle,
} from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, credentials: "include" });
  if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || "Failed"); }
  return res;
}

interface DbStats {
  tables: { table_name: string; row_count: number; total_size: string; size_bytes: number }[];
  totalSize: string;
  totalSizeBytes: number;
  pgVersion: string;
}

// ── Table icons by name ───────────────────────────────────────────────────────
const TABLE_LABELS: Record<string, { label: string; color: string }> = {
  products:       { label: "Products",       color: "bg-blue-50 text-blue-700 border-blue-200" },
  categories:     { label: "Categories",     color: "bg-purple-50 text-purple-700 border-purple-200" },
  pages:          { label: "Pages",          color: "bg-green-50 text-green-700 border-green-200" },
  quotes:         { label: "Quotes",         color: "bg-orange-50 text-orange-700 border-orange-200" },
  leads:          { label: "Leads",          color: "bg-pink-50 text-pink-700 border-pink-200" },
  orders:         { label: "Orders",         color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  customers:      { label: "Customers",      color: "bg-teal-50 text-teal-700 border-teal-200" },
  blog_posts:     { label: "Blog Posts",     color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  banners:        { label: "Banners",        color: "bg-red-50 text-red-700 border-red-200" },
  admin_users:    { label: "Admin Users",    color: "bg-gray-50 text-gray-700 border-gray-200" },
  site_settings:  { label: "Site Settings",  color: "bg-slate-50 text-slate-700 border-slate-200" },
  invoices:       { label: "Invoices",       color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  page_templates: { label: "Page Templates", color: "bg-violet-50 text-violet-700 border-violet-200" },
};

const TRUNCATABLE = ["quotes", "leads", "orders", "invoices", "customers", "blog_posts", "banners"];

export default function DatabasePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [truncating, setTruncating] = useState<string | null>(null);
  const [confirmTable, setConfirmTable] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { data: stats, isLoading, refetch } = useQuery<DbStats>({
    queryKey: ["db-stats"],
    queryFn: async () => {
      const res = await apiFetch("/admin/db/stats");
      return res.json();
    },
    staleTime: 30_000,
  });

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setMsg(null);
    try {
      const res = await apiFetch("/admin/db/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prime-packaging-db-${new Date().toISOString().split("T")[0]}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg({ type: "ok", text: "✅ Database exported successfully!" });
    } catch (e: any) {
      setMsg({ type: "err", text: "Export failed: " + e.message });
    }
  };

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".sql")) {
      setMsg({ type: "err", text: "Only .sql files are allowed." });
      return;
    }
    setPendingFile(file);
    setConfirmRestore(true);
  };

  const doImport = async () => {
    if (!pendingFile) return;
    setImporting(true); setMsg(null); setConfirmRestore(false);
    try {
      const form = new FormData();
      form.append("sqlFile", pendingFile);
      const res = await fetch(`${API}/admin/db/import`, {
        method: "POST", credentials: "include", body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMsg({ type: "ok", text: "✅ " + json.message });
      refetch();
    } catch (e: any) {
      setMsg({ type: "err", text: "Import failed: " + e.message });
    } finally {
      setImporting(false); setPendingFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ── Truncate ───────────────────────────────────────────────────────────────
  const doTruncate = async (tableName: string) => {
    setTruncating(tableName); setMsg(null); setConfirmTable(null);
    try {
      const res = await apiFetch("/admin/db/truncate-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName }),
      });
      const json = await res.json();
      setMsg({ type: "ok", text: "✅ " + json.message });
      refetch();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setTruncating(null);
    }
  };

  const totalRows = stats?.tables.reduce((s, t) => s + Number(t.row_count), 0) ?? 0;

  return (
    <AdminLayout title="Database Manager">
      <div className="space-y-6 max-w-4xl">

        {/* ── Status message ── */}
        {msg && (
          <div className={`flex items-start gap-2 text-sm p-4 rounded-xl ${msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="ml-auto text-current opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Database className="h-5 w-5 text-blue-600" />, label: "Total Size", value: stats?.totalSize ?? "—", bg: "bg-blue-50" },
            { icon: <Table2 className="h-5 w-5 text-purple-600" />, label: "Tables",     value: stats?.tables.length ?? "—", bg: "bg-purple-50" },
            { icon: <HardDrive className="h-5 w-5 text-green-600"/>, label: "Total Rows", value: totalRows.toLocaleString(), bg: "bg-green-50" },
            { icon: <Server className="h-5 w-5 text-gray-600" />,   label: "Engine",     value: stats?.pgVersion ?? "—",    bg: "bg-gray-50" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
              <div className="text-xl font-black text-gray-900 leading-tight">{isLoading ? <Loader2 className="h-4 w-4 animate-spin text-gray-300" /> : s.value}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Export / Import ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Backup & Restore</h2>
          <p className="text-sm text-gray-400 mb-5">Export full database as .sql file — import to restore on any server.</p>
          <div className="flex flex-wrap gap-3">

            <button onClick={handleExport}
              className="inline-flex items-center gap-2 bg-[#1a2f5a] hover:bg-[#0d1f3c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <Download className="h-4 w-4" />
              Download Backup (.sql)
            </button>

            <button onClick={() => fileRef.current?.click()} disabled={importing}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? "Restoring…" : "Restore from .sql"}
            </button>
            <input ref={fileRef} type="file" accept=".sql" className="hidden" onChange={handleFileSelect} />

            <button onClick={() => refetch()}
              className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Table list ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Table2 className="h-4 w-4 text-gray-400" />
            <h2 className="font-bold text-gray-900">All Tables</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-gray-300" /></div>
            ) : (
              stats?.tables.map(t => {
                const meta = TABLE_LABELS[t.table_name] ?? { label: t.table_name, color: "bg-gray-50 text-gray-600 border-gray-200" };
                const canTruncate = TRUNCATABLE.includes(t.table_name);
                return (
                  <div key={t.table_name} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color} min-w-[120px] text-center`}>
                      {meta.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-400 font-mono">{t.table_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{Number(t.row_count).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">rows</div>
                    </div>
                    <div className="text-right w-16">
                      <div className="text-sm font-semibold text-gray-600">{t.total_size}</div>
                    </div>
                    {canTruncate && (
                      <button onClick={() => setConfirmTable(t.table_name)}
                        disabled={truncating === t.table_name}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Clear all rows">
                        {truncating === t.table_name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    )}
                    {!canTruncate && <div className="w-9" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Info box ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
          <FileCode2 className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">New Replit pe migrate kaise karein?</p>
            <ol className="space-y-0.5 text-blue-600 list-decimal pl-4">
              <li>Yahan se <strong>Download Backup</strong> click karo</li>
              <li>Naye Replit pe <code className="bg-blue-100 px-1 rounded">DATABASE_URL</code> aur <code className="bg-blue-100 px-1 rounded">SESSION_SECRET</code> secrets set karo</li>
              <li>Admin Panel → Database → <strong>Restore from .sql</strong> upload karo</li>
              <li>Sab data — products, categories, pages, settings — wapas aa jaye ga</li>
            </ol>
          </div>
        </div>

      </div>

      {/* ── Confirm: Truncate table ── */}
      {confirmTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-100 rounded-xl"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
              <h3 className="font-bold text-gray-900">Clear Table?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              All rows in <strong className="font-mono">{confirmTable}</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => doTruncate(confirmTable)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                Yes, Clear It
              </button>
              <button onClick={() => setConfirmTable(null)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm: Restore ── */}
      {confirmRestore && pendingFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-100 rounded-xl"><AlertTriangle className="h-5 w-5 text-orange-600" /></div>
              <h3 className="font-bold text-gray-900">Restore Database?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              File: <strong className="font-mono text-xs">{pendingFile.name}</strong>
            </p>
            <p className="text-sm text-red-600 font-semibold mb-5">
              ⚠️ Current database will be completely replaced. Make a backup first!
            </p>
            <div className="flex gap-3">
              <button onClick={doImport}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                Yes, Restore
              </button>
              <button onClick={() => { setConfirmRestore(false); setPendingFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
