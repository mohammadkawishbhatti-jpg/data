import { AdminLayout } from "../components/layout/AdminLayout";
import { useGetAdminStats, useListQuotes, useListLeads } from "@workspace/api-client-react";
import { StatusBadge } from "../components/ui/StatusBadge";
import { format, isToday, parseISO } from "date-fns";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Package, FolderOpen, FileText, Mail, BookOpen,
  Loader2, Plus, Settings, Bell, CheckCircle,
  Clock, Zap, TrendingUp, Users, ArrowRight,
  AlertCircle, Database, MessageSquare, Download, Activity,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

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

// ── Gradient Stat Card ─────────────────────────────────────────────────────
function StatCard({
  title, value, icon, badge, gradient, href,
}: {
  title: string; value: number | string;
  icon: React.ReactNode; badge?: string; gradient: string; href?: string;
}) {
  const inner = (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -right-1 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{title}</span>
          <div className="p-2 bg-white/15 rounded-xl">
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-black text-white">{value}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-1 bg-white/20 text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}><a className="block">{inner}</a></Link> : inner;
}

// ── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({ icon, label, href, color }: {
  icon: React.ReactNode; label: string; href: string; color: string;
}) {
  return (
    <Link href={href}>
      <a className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${color} hover:scale-105 hover:shadow-md transition-all duration-150 cursor-pointer`}>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-white/10 shadow-sm">{icon}</div>
        <span className="text-xs font-semibold text-center leading-tight">{label}</span>
      </a>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: quotesData = [], isLoading: quotesLoading } = useListQuotes();
  const { data: leadsData  = [], isLoading: leadsLoading  } = useListLeads();
  const { theme } = useTheme();

  const loading = statsLoading || quotesLoading || leadsLoading;

  const todayFollowUpQuotes = quotesData.filter(
    (q: any) => !q.followUpDone && q.followUpDate && isToday(parseISO(q.followUpDate))
  );
  const todayFollowUpLeads = leadsData.filter(
    (l: any) => !l.followUpDone && l.followUpDate && isToday(parseISO(l.followUpDate))
  );
  const todayFollowUps = [...todayFollowUpQuotes, ...todayFollowUpLeads];

  const activity = [
    ...quotesData.map((q: any) => ({ ...q, _type: "quote" as const })),
    ...leadsData.map( (l: any) => ({ ...l, _type: "lead"  as const })),
  ]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const smtpConfigured = (stats as any)?.smtpConfigured ?? false;
  const monthlyTrend   = (stats as any)?.monthlyTrend   ?? [];

  // Greeting based on hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const isDark = theme === "dark";
  const cardBg     = isDark ? "bg-[#1e2130] border border-[#2a2d3e]" : "bg-white border border-gray-100";
  const cardTitle  = isDark ? "text-white" : "text-gray-900";
  const cardSub    = isDark ? "text-gray-400" : "text-gray-500";
  const divider    = isDark ? "divide-[#2a2d3e]" : "divide-gray-50";
  const rowHover   = isDark ? "hover:bg-white/5" : "hover:bg-gray-50";
  const chartColor = isDark ? "#2a2d3e" : "#f1f5f9";
  const axisColor  = isDark ? "#6b7280" : "#94a3b8";

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Welcome Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className={`text-2xl font-black ${cardTitle}`}>
                {greeting}, Admin 👋
              </h2>
              <p className={`text-sm mt-0.5 ${cardSub}`}>
                {format(new Date(), "EEEE, MMMM d, yyyy")} · Here's what's happening today
              </p>
            </div>
            {todayFollowUps.length > 0 && (
              <Link href="/follow-ups">
                <a className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                  <Bell className="h-4 w-4" />
                  {todayFollowUps.length} Follow-up{todayFollowUps.length > 1 ? "s" : ""} due
                </a>
              </Link>
            )}
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Products"   value={stats?.totalProducts   ?? 0}
              icon={<Package    className="h-4 w-4 text-white"/>}
              gradient="bg-gradient-to-br from-[#e63329] to-[#c0251c]"  href="/products"
            />
            <StatCard
              title="Categories" value={stats?.totalCategories ?? 0}
              icon={<FolderOpen className="h-4 w-4 text-white"/>}
              gradient="bg-gradient-to-br from-[#1a2f5a] to-[#0d1f3c]"  href="/categories"
            />
            <StatCard
              title="Quotes"     value={stats?.totalQuotes     ?? 0}
              icon={<FileText   className="h-4 w-4 text-white"/>}
              badge={undefined}
              gradient="bg-gradient-to-br from-orange-500 to-orange-700"  href="/quotes"
            />
            <StatCard
              title="Leads"      value={stats?.totalLeads      ?? 0}
              icon={<Mail       className="h-4 w-4 text-white"/>}
              badge={undefined}
              gradient="bg-gradient-to-br from-violet-500 to-violet-700"  href="/leads"
            />
            <StatCard
              title="Follow-ups" value={todayFollowUps.length}
              icon={<Bell       className="h-4 w-4 text-white"/>}
              badge={todayFollowUps.length > 0 ? "Due today" : undefined}
              gradient={todayFollowUps.length > 0
                ? "bg-gradient-to-br from-rose-500 to-rose-700"
                : "bg-gradient-to-br from-slate-500 to-slate-700"}
              href="/follow-ups"
            />
            <StatCard
              title="Blog Posts" value={stats?.totalBlogPosts  ?? 0}
              icon={<BookOpen   className="h-4 w-4 text-white"/>}
              gradient="bg-gradient-to-br from-teal-500 to-teal-700"  href="/blog"
            />
          </div>

          {/* ── Row 2: Chart + Quick Actions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Monthly Trend Chart */}
            <div className={`lg:col-span-2 ${cardBg} rounded-2xl shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className={`font-bold text-base ${cardTitle}`}>Monthly Trend</h2>
                  <p className={`text-xs mt-0.5 ${cardSub}`}>Quotes & Leads — last 6 months</p>
                </div>
                <div className={`p-2 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                  <TrendingUp className={`h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                </div>
              </div>
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyTrend} barSize={14} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColor} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        background: isDark ? "#1e2130" : "#fff",
                        color: isDark ? "#f1f5f9" : "#111",
                        fontSize: 12,
                      }}
                      cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Bar dataKey="quotes" name="Quotes" fill="#e63329" radius={[6,6,0,0]} />
                    <Bar dataKey="leads"  name="Leads"  fill="#7c3aed" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={`flex flex-col items-center justify-center h-[220px] ${cardSub}`}>
                  <Activity className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No data yet</p>
                  <p className="text-xs opacity-60 mt-1">Submit a quote or lead to see trends</p>
                </div>
              )}
            </div>

            {/* Quick Actions + System Status */}
            <div className={`${cardBg} rounded-2xl shadow-sm p-5 flex flex-col gap-4`}>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <h2 className={`font-bold text-sm ${cardTitle}`}>Quick Actions</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <QuickAction
                  icon={<Plus      className="h-4 w-4 text-blue-600"/>}
                  label="New Product"  href="/products/new"
                  color={isDark ? "border-blue-800/50 text-blue-300 bg-blue-950/30 hover:bg-blue-950/50" : "border-blue-100 text-blue-700 bg-blue-50/50"}
                />
                <QuickAction
                  icon={<FileText  className="h-4 w-4 text-orange-500"/>}
                  label="Quotes"       href="/quotes"
                  color={isDark ? "border-orange-800/50 text-orange-300 bg-orange-950/30 hover:bg-orange-950/50" : "border-orange-100 text-orange-700 bg-orange-50/50"}
                />
                <QuickAction
                  icon={<Mail      className="h-4 w-4 text-violet-500"/>}
                  label="Leads"        href="/leads"
                  color={isDark ? "border-violet-800/50 text-violet-300 bg-violet-950/30 hover:bg-violet-950/50" : "border-violet-100 text-violet-700 bg-violet-50/50"}
                />
                <QuickAction
                  icon={<Bell      className="h-4 w-4 text-red-500"/>}
                  label="Follow-ups"   href="/follow-ups"
                  color={isDark ? "border-red-800/50 text-red-300 bg-red-950/30 hover:bg-red-950/50" : "border-red-100 text-red-700 bg-red-50/50"}
                />
                <QuickAction
                  icon={<BookOpen  className="h-4 w-4 text-teal-500"/>}
                  label="New Blog"     href="/blog/new"
                  color={isDark ? "border-teal-800/50 text-teal-300 bg-teal-950/30 hover:bg-teal-950/50" : "border-teal-100 text-teal-700 bg-teal-50/50"}
                />
                <QuickAction
                  icon={<Settings  className="h-4 w-4 text-gray-500"/>}
                  label="Settings"     href="/settings"
                  color={isDark ? "border-gray-700/50 text-gray-400 bg-gray-800/30 hover:bg-gray-800/50" : "border-gray-100 text-gray-700 bg-gray-50/50"}
                />
              </div>

              {/* DB Backup */}
              <button
                onClick={downloadBackup}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#1a2f5a] to-[#0d1f3c] hover:from-[#0d1f3c] hover:to-[#081628] text-white transition-colors group"
              >
                <div className="p-1.5 bg-white/10 rounded-lg flex-shrink-0">
                  <Database className="h-3.5 w-3.5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs font-bold">Download DB Backup</div>
                  <div className="text-[10px] text-white/50">Full .sql export</div>
                </div>
                <Download className="h-3.5 w-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
              </button>

              {/* System Status */}
              <div className={`pt-3 border-t ${isDark ? "border-[#2a2d3e]" : "border-gray-100"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${cardSub}`}>System</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 ${cardSub}`}>
                      <Database className="h-3 w-3"/>Database
                    </span>
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 ${cardSub}`}>
                      <Mail className="h-3 w-3"/>SMTP
                    </span>
                    {smtpConfigured ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle className="h-3 w-3"/>OK
                      </span>
                    ) : (
                      <Link href="/settings">
                        <a className="flex items-center gap-1 text-amber-500 font-semibold hover:underline">
                          <AlertCircle className="h-3 w-3"/>Setup
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 3: Follow-ups + Activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Today's Follow-ups */}
            <div className={`${cardBg} rounded-2xl shadow-sm overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${isDark ? "border-[#2a2d3e]" : "border-gray-50"} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/10 rounded-lg">
                    <Bell className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <h2 className={`font-bold text-sm ${cardTitle}`}>Today's Follow-ups</h2>
                  {todayFollowUps.length > 0 && (
                    <span className="bg-red-500/15 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {todayFollowUps.length}
                    </span>
                  )}
                </div>
                <Link href="/follow-ups">
                  <a className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                    View all <ArrowRight className="h-3 w-3"/>
                  </a>
                </Link>
              </div>
              <div className={`divide-y ${divider}`}>
                {todayFollowUps.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className={`text-sm font-semibold ${cardTitle}`}>All caught up!</p>
                    <p className={`text-xs ${cardSub}`}>No follow-ups due today</p>
                  </div>
                ) : (
                  todayFollowUps.slice(0, 5).map((item: any) => (
                    <div key={`${item._type}-${item.id}`} className={`px-5 py-3 flex items-center gap-3 ${rowHover} transition-colors`}>
                      <div className={`p-2 rounded-lg ${item._type === "quote" ? "bg-orange-500/10" : "bg-violet-500/10"}`}>
                        {item._type === "quote"
                          ? <FileText    className="h-4 w-4 text-orange-500" />
                          : <MessageSquare className="h-4 w-4 text-violet-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${cardTitle}`}>{item.name}</p>
                        <p className={`text-xs truncate ${cardSub}`}>
                          {item._type === "quote" ? item.productType : (item.subject || "Contact Lead")}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className={`${cardBg} rounded-2xl shadow-sm overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${isDark ? "border-[#2a2d3e]" : "border-gray-50"} flex items-center gap-2`}>
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <h2 className={`font-bold text-sm ${cardTitle}`}>Recent Activity</h2>
              </div>
              <div className={`divide-y ${divider}`}>
                {activity.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className={`p-3 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                      <Users className={`h-6 w-6 ${cardSub}`} />
                    </div>
                    <p className={`text-sm font-semibold ${cardTitle}`}>No activity yet</p>
                  </div>
                ) : (
                  activity.map((item: any) => (
                    <div key={`${item._type}-${item.id}`} className={`px-5 py-3 flex items-center gap-3 ${rowHover} transition-colors`}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item._type === "quote" ? "bg-orange-400" : "bg-violet-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs truncate ${cardTitle}`}>
                          <span className="font-semibold">{item.name}</span>
                          <span className={cardSub}> — </span>
                          <span className={cardSub}>
                            {item._type === "quote"
                              ? `Quote: ${item.productType}`
                              : `Lead: ${item.subject || "General"}`
                            }
                          </span>
                        </p>
                        <p className={`text-[11px] mt-0.5 ${cardSub}`}>
                          {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}
