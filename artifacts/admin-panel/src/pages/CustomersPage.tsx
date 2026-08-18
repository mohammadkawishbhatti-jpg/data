import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Users, Plus, RefreshCw, Send, Trash2, Eye, EyeOff, Copy, KeyRound, UserCheck, Ban } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { format } from "date-fns";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/customers`, { credentials: "include" });
      if (r.ok) setCustomers(await r.json());
      else setCustomers([]);
    } finally { setLoading(false); }
  };
  return { customers, loading, load };
}

const EMPTY_FORM = { name: "", email: "", username: "", password: "", phone: "", company: "", notes: "" };

export default function CustomersPage() {
  const { customers, loading, load } = useCustomers();
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Reset-password modal state
  const [showResetPw, setShowResetPw] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const [sendingCreds, setSendingCreds] = useState(false);
  const [copied, setCopied] = useState<string>("");

  if (!loaded) { load(); setLoaded(true); }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const r = await fetch(`${API}/admin/customers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const err = await r.json();
        setFormError(err.error || "Failed to create customer");
        return;
      }
      setShowAdd(false);
      setForm(EMPTY_FORM);
      setFormError("");
      load();
    } finally { setSaving(false); }
  };

  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    setResetSaving(true);
    setResetError("");
    setResetSuccess("");
    try {
      const r = await fetch(`${API}/admin/customers/${viewCustomer.id}/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!r.ok) {
        const err = await r.json();
        setResetError(err.error || "Failed to reset password");
        return;
      }
      setResetSuccess("Password updated successfully!");
      setViewCustomer((prev: any) => prev ? { ...prev, status: "active", portalPassword: undefined } : null);
      setNewPassword("");
      setTimeout(() => { setShowResetPw(false); setResetSuccess(""); load(); }, 1500);
    } finally { setResetSaving(false); }
  };

  const handleInvite = async (customer: any) => {
    const response = await fetch(`${API}/admin/customers/${customer.id}/invite`, {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      alert(`✓ Invitation sent to ${customer.email}. It expires in 72 hours.`);
      load();
    } else {
      const body = await response.json().catch(() => ({}));
      alert(body.error || "Failed to send invitation.");
    }
  };

  const handleAccess = async (customer: any) => {
    const nextStatus = customer.status === "disabled" ? "active" : "disabled";
    const response = await fetch(`${API}/admin/customers/${customer.id}/access`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) {
      const updated = await response.json();
      setViewCustomer(updated);
      load();
    }
  };

  const handleSendCreds = async (customer: any, password: string) => {
    if (!password) return alert("Enter a password above first, then send credentials.");
    setSendingCreds(true);
    try {
      const r = await fetch(`${API}/admin/customers/${customer.id}/send-credentials`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (r.ok) alert(`✓ Credentials sent to ${customer.email}`);
      else alert("Failed to send email. Check SMTP settings.");
    } finally { setSendingCreds(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    await fetch(`${API}/admin/customers/${id}`, { method: "DELETE", credentials: "include" });
    setViewCustomer(null);
    load();
  };

  return (
    <AdminLayout title="Customers">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage customer portal accounts</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setFormError(""); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Customer
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-left">Customer #</th>
                <th className="px-4 py-3 font-medium text-left">Name</th>
                <th className="px-4 py-3 font-medium text-left">Username</th>
                <th className="px-4 py-3 font-medium text-left">Email</th>
                <th className="px-4 py-3 font-medium text-left">Phone</th>
                <th className="px-4 py-3 font-medium text-left">Company</th>
                <th className="px-4 py-3 font-medium text-left">Access</th>
                <th className="px-4 py-3 font-medium text-left">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : customers.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No customers yet. Add your first customer.</p>
                </td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="hover:bg-muted/5 cursor-pointer" onClick={() => { setViewCustomer(c); setShowPassword(false); }}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.customerNumber || "—"}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{c.username || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.company || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : c.status === "invited" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>{c.status || "active"}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{format(new Date(c.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1 text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Customer Modal ── */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setFormError(""); }} title="Add New Customer">
        <form onSubmit={handleAdd} className="space-y-4 pt-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="John Smith" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="john@company.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username *</label>
              <input required value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="johnsmith123"
                pattern="[a-zA-Z0-9_.\-]+" title="Letters, numbers, dots, dashes, underscores only" />
              <p className="text-[10px] text-muted-foreground mt-1">Used to log into the customer portal</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password (optional)</label>
              <input type="password" minLength={form.password ? 6 : undefined} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="Leave blank to email invitation" />
              <p className="text-[10px] text-muted-foreground mt-1">Blank creates an invited account with a 72-hour activation link.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="+1 000 000 0000" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</label>
              <input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="Company Ltd." />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Internal Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Notes visible only to admins..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowAdd(false); setFormError(""); }}
              className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted/20">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View Customer Modal ── */}
      <Modal isOpen={!!viewCustomer && !showResetPw} onClose={() => setViewCustomer(null)} title={`Customer: ${viewCustomer?.name}`}>
        {viewCustomer && (
          <div className="pt-4 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wide mb-0.5">Customer #</p>
                <p className="font-mono font-medium">{viewCustomer.customerNumber || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wide mb-0.5">Username</p>
                <div className="flex items-center gap-1.5">
                  <p className="font-mono font-bold text-blue-600">{viewCustomer.username || "—"}</p>
                  {viewCustomer.username && (
                    <button onClick={() => copyText(viewCustomer.username, "username")} className="text-muted-foreground hover:text-primary">
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                  {copied === "username" && <span className="text-green-600 text-xs font-medium">Copied!</span>}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wide mb-0.5">Portal Access</p>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold uppercase ${viewCustomer.status === "active" ? "bg-emerald-100 text-emerald-700" : viewCustomer.status === "invited" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>{viewCustomer.status || "active"}</span>
                {viewCustomer.invitationExpiresAt && <p className="mt-1 text-[11px] text-muted-foreground">Invitation expires {format(new Date(viewCustomer.invitationExpiresAt), "MMM d, yyyy h:mm a")}</p>}
              </div>

              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wide mb-0.5">Email</p>
                <p className="font-medium text-xs">{viewCustomer.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wide mb-0.5">Phone</p>
                <p>{viewCustomer.phone || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wide mb-0.5">Company</p>
                <p>{viewCustomer.company || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wide mb-0.5">Created</p>
                <p className="text-xs">{format(new Date(viewCustomer.createdAt), "MMMM d, yyyy")}</p>
              </div>
              {viewCustomer.notes && (
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wide mb-0.5">Notes</p>
                  <p className="text-sm bg-muted/10 rounded-lg px-3 py-2">{viewCustomer.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => void handleInvite(viewCustomer)}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-muted/20"
                >
                  <Send className="h-3.5 w-3.5" /> Send Invitation
                </button>
                <button
                  onClick={() => void handleAccess(viewCustomer)}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-muted/20"
                >
                  {viewCustomer.status === "disabled" ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                  {viewCustomer.status === "disabled" ? "Enable Portal" : "Disable Portal"}
                </button>
                <button
                  onClick={() => { setShowResetPw(true); setNewPassword(""); setResetError(""); setResetSuccess(""); }}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-muted/20"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Set New Password
                </button>
                <button
                  onClick={() => handleDelete(viewCustomer.id)}
                  className="flex items-center gap-2 text-red-600 border border-red-200 rounded-lg px-3 py-2 text-sm hover:bg-red-50 ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reset Password Modal ── */}
      <Modal isOpen={showResetPw} onClose={() => { setShowResetPw(false); setResetError(""); setResetSuccess(""); }} title={`Set Password — ${viewCustomer?.name}`}>
        <form onSubmit={handleResetPassword} className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter a new password for <strong>{viewCustomer?.name}</strong>.
            Username: <code className="bg-muted/20 px-1.5 py-0.5 rounded font-mono text-blue-600">{viewCustomer?.username}</code>
          </p>

          {resetError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{resetError}</div>}
          {resetSuccess && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-semibold">{resetSuccess}</div>}

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Password *</label>
            <input
              required
              type="text"
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Enter new password (min 6 chars)"
              autoFocus
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Security note:</p>
            <p>The new password is stored securely and will not be displayed or emailed by the admin panel.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setShowResetPw(false); setResetError(""); setResetSuccess(""); }}
              className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-muted/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { handleSendCreds(viewCustomer, newPassword); }}
              disabled={!newPassword || sendingCreds}
              className="flex items-center gap-2 border border-primary/30 text-primary rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/5 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" /> {sendingCreds ? "Sending..." : "Email to Customer"}
            </button>
            <button
              type="submit"
              disabled={resetSaving}
              className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {resetSaving ? "Saving..." : "Save Password"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
