import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Package, Truck, CheckCircle, Clock, XCircle, LogOut, ChevronDown, ChevronUp,
  User, LayoutDashboard, HeadphonesIcon, Copy, Eye, EyeOff, Phone, Mail,
  Building2, Hash, Calendar, ShieldCheck, Star, ArrowRight, MessageCircle,
  TrendingUp, AlertCircle
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

const STATUS_STEPS = ["confirmed","processing","production","quality_check","shipped","delivered"];
const STATUS_LABELS: Record<string,string> = {
  confirmed:"Confirmed", processing:"Processing", production:"In Production",
  quality_check:"Quality Check", shipped:"Shipped", delivered:"Delivered", cancelled:"Cancelled"
};
const STATUS_ICONS: Record<string,any> = {
  confirmed: Clock, processing: Package, production: Package,
  quality_check: CheckCircle, shipped: Truck, delivered: CheckCircle, cancelled: XCircle,
};
const SYMS: Record<string,string> = { USD:"$", GBP:"£", EUR:"€", PKR:"₨", AED:"د.إ" };

function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-2.5 text-sm font-semibold">
        <XCircle className="h-4 w-4" /> Order Cancelled
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-1">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const Icon = STATUS_ICONS[step] || Clock;
        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? "bg-[#1B2B5E] text-white" : "bg-gray-100 text-gray-400"} ${active ? "ring-2 ring-[#FFB800] ring-offset-2" : ""}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[9px] font-bold text-center mt-1.5 max-w-[60px] leading-tight ${done ? "text-[#1B2B5E]" : "text-gray-400"}`}>{STATUS_LABELS[step]}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 w-8 flex-shrink-0 mt-[-14px] ${i < currentIdx ? "bg-[#1B2B5E]" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const sym = SYMS[order.currency] || "$";
  const statusColor: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-yellow-100 text-yellow-700",
    production: "bg-orange-100 text-orange-700",
    quality_check: "bg-purple-100 text-purple-700",
    shipped: "bg-cyan-100 text-cyan-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#1B2B5E] text-sm">{order.orderNumber}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString("en-US", { day:"2-digit", month:"short", year:"numeric" })}
              {order.estimatedDelivery && <span className="ml-2 text-[#1B2B5E] font-medium">· Est: {order.estimatedDelivery}</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-black text-[#1B2B5E]">{sym}{Number(order.total||0).toFixed(2)}</div>
            <div className="text-[10px] text-gray-400 uppercase">{order.currency}</div>
          </div>
        </div>
        <StatusTimeline status={order.status} />
        {order.trackingNumber && (
          <div className="mt-3 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span><strong>Tracking:</strong> <span className="font-mono">{order.trackingNumber}</span></span>
          </div>
        )}
        <button onClick={() => setExpanded(!expanded)} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#1B2B5E] hover:text-[#e63329] transition-colors">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? "Hide" : "View"} Items ({(order.items||[]).length})
        </button>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="px-5 py-2.5 text-left">Item</th>
                <th className="px-5 py-2.5 text-right">Qty</th>
                <th className="px-5 py-2.5 text-right">Unit Price</th>
                <th className="px-5 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items||[]).map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.description && <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">{item.qty}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{sym}{Number(item.unitPrice||0).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-bold text-[#1B2B5E]">{sym}{Number(item.total||0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#1B2B5E]">
                <td colSpan={3} className="px-5 py-3 text-white font-bold text-xs uppercase tracking-wider">Order Total</td>
                <td className="px-5 py-3 text-right font-black text-[#FFB800] text-base">{sym}{Number(order.total||0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button onClick={copy} className="ml-2 text-gray-400 hover:text-[#1B2B5E] transition-colors" title="Copy">
      {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function PortalDashboardPage() {
  const [, setLocation] = useLocation();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview"|"orders"|"profile"|"support">("overview");
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [meR, ordR] = await Promise.all([
          fetch(`${API}/portal/me`, { credentials: "include" }),
          fetch(`${API}/portal/orders`, { credentials: "include" }),
        ]);
        if (!meR.ok) { setLocation("/portal"); return; }
        if (!mounted) return;
        setCustomer(await meR.json());
        setOrders(ordR.ok ? await ordR.json() : []);
      } catch { if (mounted) setError("Could not load your account."); }
      finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    await fetch(`${API}/portal/logout`, { method: "POST", credentials: "include" });
    setLocation("/portal");
  };

  const initials = customer?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2) || "?";
  const activeOrders = orders.filter(o => !["delivered","cancelled"].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "profile", label: "My Profile", icon: User },
    { id: "support", label: "Support", icon: HeadphonesIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1B2B5E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <header className="bg-[#1B2B5E] shadow-lg sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-white font-black text-sm sm:text-base tracking-tight">PRIME PACKAGING BOXES</a>
            <span className="hidden sm:block text-white/20">|</span>
            <span className="hidden sm:block bg-[#FFB800]/15 border border-[#FFB800]/30 text-[#FFB800] text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">Customer Portal</span>
          </div>
          <div className="flex items-center gap-3">
            {customer && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FFB800] rounded-full flex items-center justify-center text-[#1B2B5E] font-black text-xs">{initials}</div>
                <span className="text-white/80 text-sm font-medium">{customer.name?.split(" ")[0]}</span>
              </div>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Profile Banner ── */}
      {customer && (
        <div className="bg-gradient-to-r from-[#0d1b3e] to-[#1B2B5E] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-16 h-16 bg-[#FFB800] rounded-2xl flex items-center justify-center text-[#1B2B5E] font-black text-2xl shadow-lg flex-shrink-0">{initials}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black">Welcome back, {customer.name?.split(" ")[0]}!</h1>
                  <span className="bg-green-400/20 border border-green-400/30 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-white/60">
                  <span className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" />{customer.customerNumber}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{customer.email}</span>
                  {customer.company && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{customer.company}</span>}
                  {customer.createdAt && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Member since {new Date(customer.createdAt).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</span>}
                </div>
              </div>
              {/* Stats */}
              <div className="flex gap-4 sm:gap-6 flex-shrink-0">
                {[
                  { label: "Total Orders", value: orders.length, color: "text-white" },
                  { label: "Active", value: activeOrders.length, color: "text-[#FFB800]" },
                  { label: "Delivered", value: deliveredOrders.length, color: "text-green-300" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-white/40 uppercase font-semibold mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-[#1B2B5E] text-[#1B2B5E]"
                      : "border-transparent text-gray-500 hover:text-[#1B2B5E] hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                  {tab.id === "orders" && orders.length > 0 && (
                    <span className="bg-[#1B2B5E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{orders.length}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: orders.length, icon: Package, color: "bg-blue-50 text-blue-600 border-blue-100" },
                { label: "Active Orders", value: activeOrders.length, icon: TrendingUp, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
                { label: "Delivered", value: deliveredOrders.length, icon: CheckCircle, color: "bg-green-50 text-green-600 border-green-100" },
                { label: "Total Spent", value: `$${totalSpent.toFixed(0)}`, icon: Star, color: "bg-purple-50 text-purple-600 border-purple-100" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${s.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-black text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Credentials Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#1B2B5E] to-[#2a3f7a] px-6 py-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#FFB800]" />
                <h2 className="text-white font-bold text-base">Your Account Credentials</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Customer Number", value: customer?.customerNumber, icon: Hash, copyable: true },
                  { label: "Login Email", value: showEmail ? customer?.email : "••••••••@••••.com", icon: Mail, copyable: false, toggle: true },
                  { label: "Company", value: customer?.company || "—", icon: Building2, copyable: false },
                  { label: "Phone", value: customer?.phone || "—", icon: Phone, copyable: false },
                  { label: "Member Since", value: customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-US",{day:"2-digit",month:"long",year:"numeric"}) : "—", icon: Calendar, copyable: false },
                  { label: "Account Status", value: "Active & Verified", icon: CheckCircle, copyable: false, isStatus: true },
                ].map(field => {
                  const Icon = field.icon;
                  return (
                    <div key={field.label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="w-8 h-8 bg-[#1B2B5E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-[#1B2B5E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">{field.label}</div>
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-semibold truncate ${field.isStatus ? "text-green-600" : "text-gray-900"}`}>{field.value}</span>
                          {field.copyable && field.value && <CopyButton text={field.value} />}
                          {field.toggle && (
                            <button onClick={() => setShowEmail(!showEmail)} className="ml-1 text-gray-400 hover:text-[#1B2B5E] transition-colors">
                              {showEmail ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 pb-4">
                <p className="text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  🔒 To reset your password, contact us at <strong>help@primepackagingboxes.com</strong> or call <strong>818-758-4076</strong>
                </p>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                {orders.length > 3 && (
                  <button onClick={() => setActiveTab("orders")} className="text-sm font-semibold text-[#1B2B5E] hover:text-[#e63329] transition-colors flex items-center gap-1">
                    View All <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {orders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                  <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No orders yet</p>
                  <p className="text-gray-400 text-sm mt-1 mb-5">Your orders will appear here once placed.</p>
                  <a href="/get-quote" className="inline-flex items-center gap-2 bg-[#1B2B5E] text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-[#15235a] transition-colors">Get a Free Quote <ArrowRight className="h-4 w-4" /></a>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0,3).map(o => <OrderCard key={o.id} order={o} />)}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Get a Quote", icon: "📋", href: "/get-quote", color: "bg-[#1B2B5E] text-white hover:bg-[#15235a]" },
                { label: "Free Sample", icon: "📦", href: "/request-sample", color: "bg-[#e63329] text-white hover:bg-[#c42a21]" },
                { label: "Contact Us", icon: "📞", href: "/contact", color: "bg-white border-2 border-[#1B2B5E] text-[#1B2B5E] hover:bg-[#1B2B5E] hover:text-white" },
                { label: "View Products", icon: "🎁", href: "/products", color: "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50" },
              ].map(a => (
                <a key={a.label} href={a.href} className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm ${a.color}`}>
                  <span>{a.icon}</span> {a.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ─── ORDERS TAB ─── */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Orders <span className="text-gray-400 font-normal text-base">({orders.length})</span></h2>
              <a href="/get-quote" className="inline-flex items-center gap-2 bg-[#1B2B5E] text-white font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-[#15235a] transition-colors">
                New Order <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            {orders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
                <Package className="h-14 w-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold text-lg">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1 mb-6">Get started with a free custom quote — response within 2 hours.</p>
                <a href="/get-quote" className="inline-flex items-center gap-2 bg-[#1B2B5E] text-white font-bold px-8 py-3.5 rounded-lg hover:bg-[#15235a] transition-colors">Get a Free Quote <ArrowRight className="h-4 w-4" /></a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(o => <OrderCard key={o.id} order={o} />)}
              </div>
            )}
          </div>
        )}

        {/* ─── PROFILE TAB ─── */}
        {activeTab === "profile" && customer && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900">My Profile</h2>

            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1B2B5E] to-[#2a3f7a] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow">{initials}</div>
              <div>
                <div className="text-xl font-black text-gray-900">{customer.name}</div>
                <div className="text-sm text-gray-500 mt-0.5">{customer.email}</div>
                <span className="mt-2 inline-block bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">✓ Verified Customer</span>
              </div>
            </div>

            {/* Full credentials */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[#1B2B5E] flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Account Information</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: "Full Name", value: customer.name, icon: User },
                  { label: "Email Address", value: customer.email, icon: Mail, sensitive: true },
                  { label: "Customer Number", value: customer.customerNumber, icon: Hash, mono: true, copy: true },
                  { label: "Phone", value: customer.phone || "Not provided", icon: Phone },
                  { label: "Company", value: customer.company || "Not provided", icon: Building2 },
                  { label: "Member Since", value: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-US",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "—", icon: Calendar },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 bg-[#1B2B5E]/8 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-[#1B2B5E]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">{f.label}</div>
                        <div className={`text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1 ${f.mono ? "font-mono" : ""}`}>
                          {f.value}
                          {f.copy && <CopyButton text={f.value} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Password */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-800 mb-1">Change Password</div>
                  <p className="text-sm text-amber-700">To update your password, contact our team and we'll send you a new one instantly.</p>
                  <div className="flex gap-3 mt-3">
                    <a href="mailto:help@primepackagingboxes.com" className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">Email Us</a>
                    <a href="tel:18187584076" className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">Call Us</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SUPPORT TAB ─── */}
        {activeTab === "support" && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-900">Get Support</h2>

            {/* Contact cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Phone, label: "Call Us", value: "818-758-4076", sub: "Mon–Fri · 9AM–6PM PST", href: "tel:18187584076", color: "bg-[#1B2B5E] text-white", btn: "Call Now" },
                { icon: Mail, label: "Email Us", value: "help@primepackagingboxes.com", sub: "Response within 2 hours", href: "mailto:help@primepackagingboxes.com", color: "bg-[#e63329] text-white", btn: "Send Email" },
                { icon: MessageCircle, label: "WhatsApp", value: "+1 818-758-4076", sub: "Chat with us instantly", href: "https://wa.me/18187584076", color: "bg-[#25D366] text-white", btn: "Open Chat" },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
                    <div className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-gray-900 mb-1">{c.label}</div>
                    <div className="text-xs text-[#1B2B5E] font-semibold mb-0.5">{c.value}</div>
                    <div className="text-xs text-gray-400 mb-4">{c.sub}</div>
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                      className={`inline-block w-full py-2.5 rounded-lg text-sm font-bold transition-all ${c.color} hover:opacity-90`}>
                      {c.btn}
                    </a>
                  </div>
                );
              })}
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-[#1B2B5E]">Frequently Asked Questions</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { q: "How do I track my order?", a: "Your order tracking number appears in the order details when your shipment is dispatched. You can also call us with your order number." },
                  { q: "How do I reorder the same product?", a: "Simply contact us with your previous order number and we'll set up an identical order with current pricing." },
                  { q: "What are your payment terms?", a: "We require a 50% deposit to start production with the remaining 50% due before shipment." },
                  { q: "How do I request changes to an active order?", a: "Contact us immediately — changes can be made before production starts. Call 818-758-4076 for urgent changes." },
                  { q: "How do I reset my portal password?", a: "Email help@primepackagingboxes.com from your registered email address and we'll send you new credentials within 1 hour." },
                ].map((faq, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="font-semibold text-gray-900 text-sm mb-1">{faq.q}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Office info */}
            <div className="bg-[#1B2B5E] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Prime Packaging Boxes</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-white/70">
                <div>📍 444 Alaska Ave, Torrance CA 90503</div>
                <div>📞 818-758-4076</div>
                <div>✉️ help@primepackagingboxes.com</div>
                <div>🕒 Mon–Fri · 9AM–6PM PST</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-center text-xs text-gray-400 pt-6 border-t border-gray-200">
          © 2025 Prime Packaging Boxes · <a href="/privacy-policy" className="hover:underline">Privacy Policy</a> · <a href="/terms-conditions" className="hover:underline">Terms</a>
        </div>
      </div>
    </div>
  );
}
