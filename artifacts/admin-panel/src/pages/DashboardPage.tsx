import { AdminLayout } from "../components/layout/AdminLayout";
import { useGetAdminStats, useListQuotes, useListLeads, useGetAdminMe } from "@workspace/api-client-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { format, isToday, parseISO } from "date-fns";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Package, FolderOpen, FileText, Mail, BookOpen, ClipboardCheck,
  Loader2, Plus, Settings, Bell, CheckCircle,
  Clock, Zap, TrendingUp, Users, ArrowRight,
  AlertCircle, Database, MessageSquare, Download, Activity,
  Sparkles, Layers, ShieldCheck, ChevronRight, Inbox, Receipt, LifeBuoy
} from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

async function downloadBackup() {
  const res = await fetch(`${API_BASE}/admin/db/export`, { credentials: "include" });
  if (!res.ok) { alert("Backup failed. Try again."); return; }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prime-backup-${new Date().toISOString().split("T")[0]}.sql`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Ultra Heavy Glass Stat Card ─────────────────────────────────────────────
function HeavyStatCard({
  title, value, icon, badge, glowColor, href, trend
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  badge?: string;
  glowColor: "rose" | "emerald" | "indigo" | "amber";
  href?: string;
  trend?: string;
}) {
  const borderGlows = {
    rose: "hover:border-rose-500/40 hover:shadow-rose-500/10",
    emerald: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    indigo: "hover:border-indigo-500/40 hover:shadow-indigo-500/10",
    amber: "hover:border-amber-500/40 hover:shadow-amber-500/10",
  };

  const iconBgs = {
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  const cardContent = (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-200 cursor-pointer ${borderGlows[glowColor]} group`}>
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{title}</span>
          <div className={`p-2.5 rounded-xl border ${iconBgs[glowColor]} shadow-md transition-transform group-hover:scale-110`}>
            {icon}
          </div>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="text-3xl font-black text-white tracking-tight">{value}</div>
            {trend && <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> {trend}
            </div>}
          </div>

          {badge && (
            <span className="text-[11px] font-extrabold px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg shadow-sm animate-pulse">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{cardContent}</Link> : cardContent;
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useGetAdminStats();
  const { data: quotesData } = useListQuotes();
  const { data: leadsData } = useListLeads();
  const { data: admin } = useGetAdminMe({ query: { retry: false, staleTime: 30_000 } as any });

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading Prime Dashboard metrics...</p>
        </div>
      </AdminLayout>
    );
  }

  const apiStats = stats as any;
  const s = {
    products:   apiStats?.totalProducts   ?? 0,
    categories: apiStats?.totalCategories ?? 0,
    quotes:     apiStats?.totalQuotes     ?? 0,
    leads:      apiStats?.totalLeads      ?? 0,
    blogPosts:  apiStats?.totalBlogPosts  ?? 0,
    banners:    apiStats?.banners         ?? 0,
    pages:      apiStats?.pages           ?? 0,
    users:      apiStats?.users           ?? 0,
    newQuotes:  apiStats?.newQuotes       ?? 0,
    newLeads:   apiStats?.newLeads        ?? 0,
    pendingApprovals: apiStats?.pendingApprovals ?? 0,
  };

  const chartData = [
    { name: "Products",   count: s.products },
    { name: "Categories", count: s.categories },
    { name: "Quotes",     count: s.quotes },
    { name: "Leads",      count: s.leads },
    { name: "Blog Posts", count: s.blogPosts },
    { name: "Pages",      count: s.pages },
  ];

  const recentQuotes = (quotesData || []).slice(0, 5);
  const recentLeads = (leadsData || []).slice(0, 5);
  const salesSummary = (apiStats?.salesCommandCenter || {}) as Record<string, number>;
  const showSalesCommandCenter = admin?.role === "sales" || admin?.role === "superadmin";

  const todayQuotes = (quotesData || []).filter(q => {
    try { return isToday(parseISO(q.createdAt || "")); } catch { return false; }
  }).length;

  const todayLeads = (leadsData || []).filter(l => {
    try { return isToday(parseISO(l.createdAt || "")); } catch { return false; }
  }).length;

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-8 pb-8">

        {/* Top Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-white/10 shadow-2xl backdrop-blur-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold mb-3 shadow-md">
                <Sparkles className="h-3.5 w-3.5" /> Prime Packaging Operations Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, Admin 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Your store has <span className="text-white font-bold">{s.products} products</span> listed across <span className="text-white font-bold">{s.categories} categories</span> with real-time PostgreSQL database sync.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/content-approvals">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-bold text-xs border border-amber-400/30 shadow-lg shadow-amber-500/10 transition-all hover:scale-105 active:scale-95">
                  <ClipboardCheck className="h-4 w-4" /> Approvals {s.pendingApprovals > 0 && `(${s.pendingApprovals})`}
                </button>
              </Link>
              <Link href="/products/new">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all hover:scale-105 active:scale-95">
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              </Link>
              <button
                onClick={downloadBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 shadow-md transition-all hover:scale-105"
              >
                <Download className="h-4 w-4 text-emerald-400" /> Export SQL
              </button>
            </div>
          </div>
        </div>

        <Link href="/content-approvals" className="block">
          <section className={`rounded-3xl border p-5 shadow-xl transition-all hover:-translate-y-0.5 ${s.pendingApprovals > 0 ? "border-amber-400/30 bg-gradient-to-r from-amber-950/70 via-slate-900/80 to-rose-950/60" : "border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-cyan-950/50"}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className={`rounded-2xl p-3 ${s.pendingApprovals > 0 ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${s.pendingApprovals > 0 ? "text-amber-300" : "text-emerald-300"}`}>Approval Center</div>
                  <h2 className="mt-1 text-xl font-black text-white">
                    {s.pendingApprovals > 0 ? `${s.pendingApprovals} change${s.pendingApprovals === 1 ? "" : "s"} waiting for review` : "Everything is approved"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">Products, deletes, pages, blogs, and templates are reviewed here before going live.</p>
                </div>
              </div>
              <span className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold ${s.pendingApprovals > 0 ? "bg-amber-400 text-amber-950" : "bg-emerald-400 text-emerald-950"}`}>
                Open Approval Center <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </div>
          </section>
        </Link>

        {showSalesCommandCenter && (
          <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/50 via-slate-900/80 to-cyan-950/50 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
                  <TrendingUp className="h-4 w-4" /> Sales Command Center
                </div>
                <h2 className="mt-1 text-xl font-black text-white">Today’s revenue conversations</h2>
              </div>
              <Link href="/quote-pipeline" className="text-xs font-bold text-emerald-300 hover:text-white">Open sales workspace →</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                { label: "New leads", value: salesSummary.newLeads ?? s.newLeads, href: "/leads", icon: Inbox, tone: "text-cyan-300" },
                { label: "Open quotes", value: salesSummary.openQuotes ?? s.newQuotes, href: "/quote-pipeline", icon: FileText, tone: "text-emerald-300" },
                { label: "Overdue follow-ups", value: salesSummary.overdueFollowUps ?? 0, href: "/follow-ups", icon: Bell, tone: "text-amber-300" },
                { label: "Pending invoices", value: salesSummary.pendingInvoices ?? 0, href: "/invoices", icon: Receipt, tone: "text-violet-300" },
                { label: "Support tickets", value: salesSummary.openSupportTickets ?? 0, href: "/support-tickets", icon: LifeBuoy, tone: "text-rose-300" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.1]">
                    <Icon className={`mb-3 h-5 w-5 ${item.tone}`} />
                    <div className="text-2xl font-black text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] font-semibold text-slate-400">{item.label}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Heavy Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <HeavyStatCard
            title="Total Products"
            value={s.products}
            icon={<Package className="h-5 w-5" />}
            glowColor="rose"
            href="/products"
            trend="+ Live Active"
          />
          <HeavyStatCard
            title="Quotes Received"
            value={s.quotes}
            badge={s.newQuotes > 0 ? `${s.newQuotes} New` : undefined}
            icon={<FileText className="h-5 w-5" />}
            glowColor="emerald"
            href="/quotes"
            trend={todayQuotes > 0 ? `${todayQuotes} Today` : "Realtime Inquiry"}
          />
          <HeavyStatCard
            title="Lead Inquiries"
            value={s.leads}
            badge={s.newLeads > 0 ? `${s.newLeads} New` : undefined}
            icon={<Inbox className="h-5 w-5" />}
            glowColor="indigo"
            href="/leads"
            trend={todayLeads > 0 ? `${todayLeads} Today` : "Customer Inbox"}
          />
          <HeavyStatCard
            title="Categories"
            value={s.categories}
            icon={<FolderOpen className="h-5 w-5" />}
            glowColor="amber"
            href="/categories"
            trend="Active Taxonomy"
          />
        </div>

        {/* Quick Launcher Launcher Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-4 w-4 text-rose-400" /> Quick Operation Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Import Products", icon: Download, href: "/import-products", color: "text-indigo-400" },
              { name: "Clark AI Assistant", icon: MessageSquare, href: "/clark", color: "text-amber-400" },
              { name: "Follow Ups", icon: Bell, href: "/follow-ups", color: "text-cyan-400" },
              { name: "Database Admin", icon: Database, href: "/database", color: "text-violet-400" },
            ].map(tool => {
              const ToolIcon = tool.icon;
              return (
                <Link key={tool.name} href={tool.href}>
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5 hover:border-white/20 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer group shadow-lg">
                    <ToolIcon className={`h-6 w-6 mb-2 ${tool.color} transition-transform group-hover:scale-110`} />
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white text-center">{tool.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Middle Row: Analytics Chart & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Distribution Chart */}
          <div className="lg:col-span-2 rounded-3xl p-6 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-rose-400" /> Data Distribution Overview
                </h3>
                <p className="text-xs text-slate-400">Total catalog and lead entries stored in PostgreSQL</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                DB Synchronized
              </span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right 1 Col: Quick Recent Activity / Quotes */}
          <div className="rounded-3xl p-6 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-rose-400" /> Recent Quotes
              </h3>
              <Link href="/quotes">
                <span className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer">
                  View All <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
              {recentQuotes.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No quote inquiries submitted yet.
                </div>
              ) : (
                recentQuotes.map((q: any) => (
                  <div key={q.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{q.name || q.email}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{q.productName || q.boxType || "Custom Packaging"}</div>
                    </div>
                    <StatusBadge status={q.status || "pending"} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
