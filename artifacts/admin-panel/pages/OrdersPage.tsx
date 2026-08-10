import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Plus, Eye, Search, User, Link, CheckCircle } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { format } from "date-fns";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

const STATUSES = ["confirmed","processing","production","quality_check","shipped","delivered","cancelled"];
const STATUS_COLORS: Record<string,string> = {
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  production: "bg-orange-100 text-orange-700",
  quality_check: "bg-purple-100 text-purple-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string,string> = {
  confirmed: "Confirmed", processing: "Processing", production: "In Production",
  quality_check: "Quality Check", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled"
};

const EMPTY_ITEM = { name: "", qty: 1, unitPrice: 0, total: 0, description: "" };
const SYMS: Record<string,string> = { USD: "$", GBP: "£", EUR: "€", PKR: "₨", AED: "د.إ" };

/* ── Customer search dropdown ───────────────────────────────────── */
function CustomerPicker({
  value,
  onSelect,
  placeholder = "Search by name or username…",
}: {
  value: { id: number; name: string; email: string } | null;
  onSelect: (c: { id: number; name: string; email: string } | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (q: string) => {
    setQuery(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setFetching(true);
      try {
        const r = await fetch(`${API}/admin/customers?search=${encodeURIComponent(q)}&limit=8`, { credentials: "include" });
        const data = await r.json();
        const list = Array.isArray(data) ? data : (data.customers ?? []);
        setResults(list);
        setOpen(true);
      } finally { setFetching(false); }
    }, 250);
  };

  if (value) {
    return (
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-primary/5 border-primary/30">
        <User className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate">{value.name}</p>
          <p className="text-xs text-muted-foreground truncate">{value.email}</p>
        </div>
        <button type="button" onClick={() => { onSelect(null); setQuery(""); }} className="text-xs text-muted-foreground hover:text-destructive px-2 py-0.5 rounded hover:bg-red-50 transition-colors flex-shrink-0">Clear</button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder={placeholder}
        />
        {fetching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {results.map((c: any) => (
            <button key={c.id} type="button"
              onClick={() => { onSelect({ id: c.id, name: c.name, email: c.email }); setQuery(""); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/5 text-left transition-colors">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{c.name?.[0]?.toUpperCase() || "?"}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && !fetching && results.length === 0 && query.trim() && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg px-3 py-3 text-sm text-muted-foreground text-center">No customers found for "{query}"</div>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Customer picker state for create form
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string; email: string } | null>(null);

  // "Link to customer" state for view modal
  const [linkCustomer, setLinkCustomer] = useState<{ id: number; name: string; email: string } | null>(null);
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  const [form, setForm] = useState({
    customerEmail: "", customerName: "", status: "confirmed",
    currency: "USD", notes: "", trackingNumber: "", estimatedDelivery: "",
    items: [{ ...EMPTY_ITEM }],
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/orders`, { credentials: "include" });
      if (!r.ok) { setOrders([]); return; }
      const data = await r.json();
      setOrders(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };
  if (!loaded) { load(); setLoaded(true); }

  const TABS = ["All", ...STATUSES.map(s => STATUS_LABELS[s])];
  const filtered = activeTab === "All" ? orders : orders.filter(o => STATUS_LABELS[o.status] === activeTab);

  const total = (items: any[]) => items.reduce((s, i) => s + (Number(i.qty) * Number(i.unitPrice)), 0);

  const setItem = (i: number, key: string, val: any) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: val };
    if (key === "qty" || key === "unitPrice") items[i].total = Number(items[i].qty) * Number(items[i].unitPrice);
    setForm(f => ({ ...f, items }));
  };

  // When a customer is selected in the create form, auto-fill name/email
  const handleCustomerSelect = (c: { id: number; name: string; email: string } | null) => {
    setSelectedCustomer(c);
    if (c) setForm(f => ({ ...f, customerEmail: c.email, customerName: c.name }));
    else setForm(f => ({ ...f, customerEmail: "", customerName: "" }));
  };

  const handleCreate = async (e: any) => {
    e.preventDefault(); setSaving(true);
    try {
      const t = total(form.items);
      const body = {
        ...form,
        customerId: selectedCustomer?.id ?? undefined,
        subtotal: String(t), tax: "0", total: String(t),
        items: form.items.map(i => ({ ...i, qty: Number(i.qty), unitPrice: Number(i.unitPrice), total: Number(i.qty) * Number(i.unitPrice) })),
      };
      const r = await fetch(`${API}/admin/orders`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) { alert("Error creating order"); return; }
      setShowCreate(false);
      setSelectedCustomer(null);
      setForm({ customerEmail: "", customerName: "", status: "confirmed", currency: "USD", notes: "", trackingNumber: "", estimatedDelivery: "", items: [{ ...EMPTY_ITEM }] });
      load();
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`${API}/admin/orders/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setViewOrder((o: any) => o ? { ...o, status } : o);
    load();
  };

  const handleLinkCustomer = async () => {
    if (!viewOrder || !linkCustomer) return;
    setLinkSaving(true);
    try {
      const r = await fetch(`${API}/admin/orders/${viewOrder.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: linkCustomer.id,
          customerEmail: linkCustomer.email,
          customerName: linkCustomer.name,
        }),
      });
      if (r.ok) {
        const updated = await r.json();
        setViewOrder(updated);
        setLinkSuccess(true);
        setShowLinkPanel(false);
        setTimeout(() => setLinkSuccess(false), 3000);
        load();
      }
    } finally { setLinkSaving(false); }
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manually create and track customer orders</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Create Order
        </button>
      </div>

      <div className="mb-4 border-b flex gap-4 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 whitespace-nowrap text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order #</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Linked</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Items</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                : filtered.length === 0
                  ? <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No orders found.</td></tr>
                  : filtered.map(o => (
                    <tr key={o.id} className="hover:bg-muted/5 cursor-pointer" onClick={() => { setViewOrder(o); setShowLinkPanel(false); setLinkCustomer(null); setLinkSuccess(false); }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{o.orderNumber || `#${o.id}`}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.customerName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{o.customerEmail || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        {o.customerId
                          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Linked</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full">Unlinked</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-700"}`}>{STATUS_LABELS[o.status] || o.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{(o.items || []).length} item(s)</td>
                      <td className="px-4 py-3 font-semibold">{SYMS[o.currency] || "$"}{Number(o.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{format(new Date(o.createdAt), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1 text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Order Modal ──────────────────────────────── */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setSelectedCustomer(null); }} title="Create New Order" wide>
        <form onSubmit={handleCreate} className="pt-4 space-y-5">

          {/* Customer picker */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Link to Customer Account</label>
            <CustomerPicker value={selectedCustomer} onSelect={handleCustomerSelect} />
            <p className="text-xs text-muted-foreground mt-1.5">Search for an existing customer to link this order to their portal account.</p>
          </div>

          {/* Manual email/name fallback (shown when no customer selected) */}
          {!selectedCustomer && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Email</label>
                <input value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="customer@email.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Name</label>
                <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="Full name" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-background">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-background">
                {["USD","GBP","EUR","PKR","AED"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tracking Number</label>
              <input value={form.trackingNumber} onChange={e => setForm(f => ({ ...f, trackingNumber: e.target.value }))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. Delivery</label>
              <input value={form.estimatedDelivery} onChange={e => setForm(f => ({ ...f, estimatedDelivery: e.target.value }))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. 5-7 working days" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Line Items</label>
            <div className="mt-2 space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="border rounded-lg p-3 grid grid-cols-5 gap-2 text-sm">
                  <input value={item.name} onChange={e => setItem(i, "name", e.target.value)} className="col-span-2 border rounded px-2 py-1 text-sm" placeholder="Item name" />
                  <input type="number" value={item.qty} onChange={e => setItem(i, "qty", e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Qty" />
                  <input type="number" step="0.01" value={item.unitPrice} onChange={e => setItem(i, "unitPrice", e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Unit price" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} className="text-red-500 text-xs hover:text-red-700">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }))}
                className="w-full border-dashed border-2 rounded-lg py-2 text-sm text-muted-foreground hover:text-primary hover:border-primary">
                + Add Item
              </button>
            </div>
            <p className="mt-2 text-right font-semibold">{SYMS[form.currency] || "$"}{total(form.items).toFixed(2)} total</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Internal notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowCreate(false); setSelectedCustomer(null); }} className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted/20">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View / Edit Order Modal ─────────────────────────── */}
      <Modal isOpen={!!viewOrder} onClose={() => { setViewOrder(null); setShowLinkPanel(false); setLinkCustomer(null); }} title={`Order ${viewOrder?.orderNumber || `#${viewOrder?.id}`}`} wide>
        {viewOrder && (
          <div className="pt-4 space-y-5 text-sm">

            {/* Customer info + link banner */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-xs">Customer</p>
                <p className="font-medium">{viewOrder.customerName || "—"}</p>
                <p className="text-xs text-muted-foreground">{viewOrder.customerEmail || ""}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Order Date</p>
                <p>{format(new Date(viewOrder.createdAt), "MMMM d, yyyy")}</p>
              </div>
              {viewOrder.trackingNumber && (
                <div>
                  <p className="text-muted-foreground text-xs">Tracking</p>
                  <p className="font-mono">{viewOrder.trackingNumber}</p>
                </div>
              )}
              {viewOrder.estimatedDelivery && (
                <div>
                  <p className="text-muted-foreground text-xs">Est. Delivery</p>
                  <p>{viewOrder.estimatedDelivery}</p>
                </div>
              )}
            </div>

            {/* Portal link status */}
            {linkSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm font-semibold">
                <CheckCircle className="h-4 w-4" /> Order successfully linked — customer can now see it in their portal.
              </div>
            )}

            <div className="border rounded-xl overflow-hidden">
              <div className="bg-muted/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Portal Account</span>
                  {viewOrder.customerId
                    ? <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Linked</span>
                    : <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Not linked</span>
                  }
                </div>
                <button
                  type="button"
                  onClick={() => { setShowLinkPanel(!showLinkPanel); setLinkCustomer(null); }}
                  className="text-xs font-semibold text-primary hover:underline">
                  {viewOrder.customerId ? "Re-link" : "Link to customer"}
                </button>
              </div>

              {!showLinkPanel && viewOrder.customerId && (
                <div className="px-4 py-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-0.5">Customer account</p>
                  <p className="font-medium">{viewOrder.customerName}</p>
                  <p className="text-xs text-muted-foreground">{viewOrder.customerEmail}</p>
                </div>
              )}

              {!showLinkPanel && !viewOrder.customerId && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  This order is not linked to a customer account. The customer cannot see it in their portal yet.
                </div>
              )}

              {showLinkPanel && (
                <div className="px-4 py-4 space-y-3 border-t">
                  <p className="text-xs text-muted-foreground">Search for the customer to link this order to their portal account:</p>
                  <CustomerPicker value={linkCustomer} onSelect={setLinkCustomer} />
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => { setShowLinkPanel(false); setLinkCustomer(null); }} className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted/20">Cancel</button>
                    <button type="button" onClick={handleLinkCustomer} disabled={!linkCustomer || linkSaving}
                      className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                      {linkSaving ? "Linking…" : "Save Link"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status change */}
            <div>
              <p className="text-muted-foreground text-xs mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => handleStatusChange(viewOrder.id, s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${viewOrder.status === s ? STATUS_COLORS[s] + " ring-2 ring-offset-1 ring-current" : "bg-muted/30 text-muted-foreground hover:bg-muted/60"}`}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Items table */}
            <div>
              <p className="text-muted-foreground text-xs mb-2">Items</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/10 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(viewOrder.items || []).map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium">{it.name}</td>
                        <td className="px-3 py-2 text-right">{it.qty}</td>
                        <td className="px-3 py-2 text-right">{SYMS[viewOrder.currency] || "$"}{Number(it.unitPrice || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{SYMS[viewOrder.currency] || "$"}{Number(it.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-primary/10 px-3 py-2 text-right font-bold">
                  Total: {SYMS[viewOrder.currency] || "$"}{Number(viewOrder.total || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {viewOrder.notes && (
              <div>
                <p className="text-muted-foreground text-xs">Notes</p>
                <p className="mt-1 bg-muted/10 rounded-lg p-3">{viewOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
