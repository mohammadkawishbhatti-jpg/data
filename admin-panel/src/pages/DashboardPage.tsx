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
  AlertCircle, Database, MessageSquare, Download,
} from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

async function downloadBackup() {
  const res = await fetch(`${API_BASE}/admin/db/export`, { credentials: "include" });
  if (!res.ok) { alert("Backup failed. Try again."); return; }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prime-packaging-backup-${new Date().toISOString().split("T")[0]}.sql`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title, value, icon, badge, badgeColor = "bg-blue-100 text-blue-700", href,
}: {
  title: string; value: number | string;
  icon: React.ReactNode; badge?: string; badgeColor?: string; href?: string;
}) {
  const inner = (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className="p-2 bg-gray-50 rounded-xl text-gray-600">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        {badge && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
  return href ? <Link href={href}><a className="block">{inner}</a></Link> : inner;
}

// ── Quick Action Button ───────────────────────────────────────────────────────
function QuickAction({ icon, label, href, color }: { icon: React.ReactNode; label: string; href: string; color: string }) {
  return (
    <Link href={href}>
      <a className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${color} hover:scale-105 transition-transform cursor-pointer`}>
        <div className="p-2.5 rounded-xl bg-white shadow-sm">{icon}</div>
        <span className="text-xs font-semibold text-center leading-tight">{label}</span>
      </a>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: quotesData = [], isLoading: quotesLoading } = useListQuotes();
  const { data: leadsData = [],  isLoading: leadsLoading  } = useListLeads();

  const loading = statsLoading || quotesLoading || leadsLoading;

  // Today's follow-ups
  const todayFollowUpQuotes = quotesData.filter(
    q => !q.followUpDone && q.followUpDate && isToday(parseISO(q.followUpDate))
  );
  const todayFollowUpLeads = leadsData.filter(
    l => !l.followUpDone && l.followUpDate && isToday(parseISO(l.followUpDate))
  );
  const todayFollowUps = [...todayFollowUpQuotes, ...todayFollowUpLeads];

  // Recent activity: merge quotes + leads, sort by date, take 8
  const activity = [
    ...quotesData.map(q => ({ ...q, _type: "quote" as const })),
    ...leadsData.map(l =>  ({ ...l, _type: "lead"  as const })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const smtpConfigured = (stats as any)?.smtpConfigured ?? false;
  const monthlyTrend   = (stats as any)?.monthlyTrend   ?? [];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── TOP STAT CARDS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Products"   value={stats?.totalProducts   ?? 0} icon={<Package   className="h-4 w-4"/>} href="/products" />
            <StatCard title="Categories" value={stats?.totalCategories ?? 0} icon={<FolderOpen className="h-4 w-4"/>} href="/categories" />
            <StatCard
              title="Quotes" value={stats?.totalQuotes ?? 0}
              icon={<FileText className="h-4 w-4"/>}
              badge={stats?.newQuotes ? `${stats.newQuotes} new` : undefined}
              badgeColor="bg-orange-100 text-orange-700"
              href="/quotes"
            />
            <StatCard
              title="Leads" value={stats?.totalLeads ?? 0}
              icon={<Mail className="h-4 w-4"/>}
              badge={stats?.newLeads ? `${stats.newLeads} new` : undefined}
              badgeColor="bg-blue-100 text-blue-700"
              href="/leads"
            />
            <StatCard
              title="Follow-ups Today" value={todayFollowUps.length}
              icon={<Bell className="h-4 w-4"/>}
              badge={todayFollowUps.length > 0 ? "Due" : undefined}
              badgeColor="bg-red-100 text-red-700"
              href="/follow-ups"
            />
            <StatCard title="Blog Posts" value={stats?.totalBlogPosts ?? 0} icon={<BookOpen className="h-4 w-4"/>} href="/blog" />
          </div>

          {/* ── ROW 2: Chart + Quick Actions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Monthly Trend Chart */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Monthly Trend</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Quotes & Leads — last 6 months</p>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-300" />
              </div>
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyTrend} barSize={16} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 13 }}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Bar dataKey="quotes" name="Quotes" fill="#e63329" radius={[6,6,0,0]} />
                    <Bar dataKey="leads"  name="Leads"  fill="#1a2f5a" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[220px] text-gray-300">
                  <TrendingUp className="h-12 w-12 mb-2" />
                  <p className="text-sm">No data yet — submit a quote or lead to see trends</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="h-4 w-4 text-yellow-500" />
                <h2 className="font-bold text-gray-900 text-base">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon={<Plus className="h-5 w-5 text-blue-600"/>}    label="New Product"    href="/products/new"    color="border-blue-100 text-blue-700 bg-blue-50/50" />
                <QuickAction icon={<FileText className="h-5 w-5 text-orange-500"/>} label="View Quotes" href="/quotes"          color="border-orange-100 text-orange-700 bg-orange-50/50" />
                <QuickAction icon={<Mail className="h-5 w-5 text-purple-500"/>}  label="View Leads"    href="/leads"           color="border-purple-100 text-purple-700 bg-purple-50/50" />
                <QuickAction icon={<Bell className="h-5 w-5 text-red-500"/>}     label="Follow-ups"    href="/follow-ups"      color="border-red-100 text-red-700 bg-red-50/50" />
                <QuickAction icon={<BookOpen className="h-5 w-5 text-green-600"/>} label="New Blog"    href="/blog/new"        color="border-green-100 text-green-700 bg-green-50/50" />
                <QuickAction icon={<Settings className="h-5 w-5 text-gray-500"/>} label="Settings"    href="/settings"        color="border-gray-100 text-gray-700 bg-gray-50/50" />
              </div>

              {/* Backup Download */}
              <div className="mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={downloadBackup}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a2f5a] hover:bg-[#0d1f3c] text-white transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <Database className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold leading-tight">Download DB Backup</div>
                      <div className="text-xs text-white/60 mt-0.5">Full .sql export — all data</div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* System Status */}
              <div className="mt-5 pt-4 border-t border-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">System Status</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Database className="h-3.5 w-3.5"/>Database
                    </span>
                    <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
                      <CheckCircle className="h-3.5 w-3.5"/>Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3.5 w-3.5"/>Email (SMTP)
                    </span>
                    {smtpConfigured ? (
                      <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
                        <CheckCircle className="h-3.5 w-3.5"/>Configured
                      </span>
                    ) : (
                      <Link href="/settings">
                        <a className="flex items-center gap-1 text-orange-500 font-semibold text-xs hover:underline">
                          <AlertCircle className="h-3.5 w-3.5"/>Setup needed
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 3: Today's Follow-ups + Activity Feed ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Today's Follow-ups */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-500" />
                  <h2 className="font-bold text-gray-900 text-base">Today's Follow-ups</h2>
                  {todayFollowUps.length > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
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
              <div className="divide-y divide-gray-50">
                {todayFollowUps.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-gray-300">
                    <CheckCircle className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium text-gray-400">All caught up!</p>
                    <p className="text-xs text-gray-300">No follow-ups due today</p>
                  </div>
                ) : (
                  todayFollowUps.slice(0, 5).map((item: any) => (
                    <div key={`${item._type}-${item.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${item._type === "quote" ? "bg-orange-50" : "bg-purple-50"}`}>
                        {item._type === "quote"
                          ? <FileText className="h-4 w-4 text-orange-500" />
                          : <MessageSquare className="h-4 w-4 text-purple-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 truncate">
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
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <h2 className="font-bold text-gray-900 text-base">Recent Activity</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {activity.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-gray-300">
                    <Users className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium text-gray-400">No activity yet</p>
                  </div>
                ) : (
                  activity.map((item: any) => (
                    <div key={`${item._type}-${item.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item._type === "quote" ? "bg-orange-400" : "bg-blue-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-gray-400"> — </span>
                          <span className="text-gray-500">
                            {item._type === "quote"
                              ? `New quote: ${item.productType}`
                              : `Contact: ${item.subject || "General Inquiry"}`
                            }
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}</p>
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
