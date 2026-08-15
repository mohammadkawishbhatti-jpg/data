import { useState, useEffect } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  Shield, ShieldCheck, ShieldOff, Key, Loader2, CheckCircle2,
  AlertCircle, Eye, EyeOff, Smartphone, Lock,
} from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...opts.headers },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

// ── 2FA Section ───────────────────────────────────────────────────────────────
function TwoFactorSection() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<"idle" | "setup" | "confirm" | "disable">("idle");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/admin/security/2fa/status").then(d => setEnabled(d.enabled)).catch(() => setEnabled(false));
  }, []);

  const startSetup = async () => {
    setLoading(true); setMsg(null);
    try {
      const d = await apiFetch("/admin/security/2fa/setup", { method: "POST" });
      setQrUrl(d.qrDataUrl); setSecret(d.secret); setStep("setup");
    } catch (e: any) { setMsg({ type: "err", text: e.message }); }
    finally { setLoading(false); }
  };

  const confirm = async () => {
    if (token.length !== 6) return setMsg({ type: "err", text: "Enter 6-digit code." });
    setLoading(true); setMsg(null);
    try {
      await apiFetch("/admin/security/2fa/confirm", { method: "POST", body: JSON.stringify({ token }) });
      setEnabled(true); setStep("idle"); setToken("");
      setMsg({ type: "ok", text: "✅ 2FA enabled! Your account is now protected." });
    } catch (e: any) { setMsg({ type: "err", text: e.message }); }
    finally { setLoading(false); }
  };

  const disable = async () => {
    if (token.length !== 6) return setMsg({ type: "err", text: "Enter 6-digit code to confirm disable." });
    setLoading(true); setMsg(null);
    try {
      await apiFetch("/admin/security/2fa/disable", { method: "POST", body: JSON.stringify({ token }) });
      setEnabled(false); setStep("idle"); setToken("");
      setMsg({ type: "ok", text: "2FA disabled." });
    } catch (e: any) { setMsg({ type: "err", text: e.message }); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <Smartphone className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Two-Factor Authentication (2FA)</h2>
          <p className="text-sm text-gray-400">Google Authenticator / Authy — TOTP</p>
        </div>
        {enabled === true && (
          <span className="ml-auto flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Enabled
          </span>
        )}
        {enabled === false && (
          <span className="ml-auto flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200">
            <ShieldOff className="h-3.5 w-3.5" /> Not Enabled
          </span>
        )}
      </div>

      {msg && (
        <div className={`flex items-start gap-2 text-sm p-3 rounded-lg mb-4 ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
          {msg.text}
        </div>
      )}

      {/* IDLE — show action buttons */}
      {step === "idle" && !enabled && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            2FA adds an extra layer of security. After enabling, you'll need your phone's authenticator app every time you log in.
          </p>
          <button onClick={startSetup} disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Enable 2FA
          </button>
        </div>
      )}

      {step === "idle" && enabled && (
        <div>
          <p className="text-sm text-gray-500 mb-4">2FA is active. To disable, enter your current authenticator code below.</p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Authenticator Code</label>
              <input value={token} onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`${inputCls} font-mono tracking-widest text-center text-lg`} placeholder="000000" maxLength={6} />
            </div>
            <button onClick={() => { setStep("disable"); disable(); }} disabled={loading || token.length !== 6}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
              Disable 2FA
            </button>
          </div>
        </div>
      )}

      {/* SETUP STEP 1 — show QR */}
      {step === "setup" && (
        <div className="space-y-5">
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-1.5">
            <p className="font-semibold">Step 1 — Scan QR in your app</p>
            <p>Open <strong>Google Authenticator</strong> or <strong>Authy</strong> → tap "+" → "Scan QR code"</p>
          </div>
          {qrUrl && (
            <div className="flex justify-center">
              <img src={qrUrl} alt="2FA QR Code" className="w-48 h-48 rounded-xl border-4 border-white shadow-lg" />
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 break-all">
            <span className="font-semibold text-gray-700">Manual entry key: </span>{secret}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Step 2 — Enter the 6-digit code to verify</p>
            <input value={token} onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${inputCls} font-mono tracking-widest text-center text-2xl`} placeholder="000000" maxLength={6} autoFocus />
          </div>
          <div className="flex gap-3">
            <button onClick={confirm} disabled={loading || token.length !== 6}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verify & Enable
            </button>
            <button onClick={() => { setStep("idle"); setToken(""); setMsg(null); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Password Change Section ───────────────────────────────────────────────────
function PasswordSection() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const inputCls = "flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const submit = async () => {
    setMsg(null);
    if (!form.current || !form.next) return setMsg({ type: "err", text: "All fields required." });
    if (form.next.length < 8) return setMsg({ type: "err", text: "New password must be at least 8 characters." });
    if (form.next !== form.confirm) return setMsg({ type: "err", text: "Passwords don't match." });
    setLoading(true);
    try {
      await apiFetch("/admin/security/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      setForm({ current: "", next: "", confirm: "" });
      setMsg({ type: "ok", text: "✅ Password changed successfully. Use the new password next time you log in." });
    } catch (e: any) { setMsg({ type: "err", text: e.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-purple-50 rounded-xl">
          <Key className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-400">Update your admin account password</p>
        </div>
      </div>

      {msg && (
        <div className={`flex items-start gap-2 text-sm p-3 rounded-lg mb-4 ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          {msg.text}
        </div>
      )}

      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Current Password</label>
          <div className="flex gap-2">
            <input type={showCurrent ? "text" : "password"} value={form.current}
              onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
              className={inputCls} placeholder="••••••••" autoComplete="current-password" />
            <button type="button" onClick={() => setShowCurrent(v => !v)} className="px-3 text-gray-400 hover:text-gray-600 border rounded-md">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
          <div className="flex gap-2">
            <input type={showNew ? "text" : "password"} value={form.next}
              onChange={e => setForm(f => ({ ...f, next: e.target.value }))}
              className={inputCls} placeholder="Min 8 characters" autoComplete="new-password" />
            <button type="button" onClick={() => setShowNew(v => !v)} className="px-3 text-gray-400 hover:text-gray-600 border rounded-md">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Confirm New Password</label>
          <input type="password" value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            placeholder="••••••••" autoComplete="new-password" />
        </div>
        <button onClick={submit} disabled={loading}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Update Password
        </button>
      </div>
    </div>
  );
}

// ── Security Tips ─────────────────────────────────────────────────────────────
function SecurityTips() {
  const tips = [
    { ok: true,  text: "Login rate limiting active — 10 attempts per 15 min max" },
    { ok: true,  text: "Session auto-logout after 30 min of inactivity" },
    { ok: true,  text: "Passwords stored as SHA-256 hashed — never plain text" },
    { ok: true,  text: "Admin panel secured — /admin routes blocked from Google" },
    { ok: false, text: "Change default password (admin123) — do this now!" },
    { ok: false, text: "Enable 2FA above for maximum account security" },
  ];
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-green-50 rounded-xl">
          <Shield className="h-5 w-5 text-green-600" />
        </div>
        <h2 className="font-bold text-gray-900">Security Checklist</h2>
      </div>
      <div className="space-y-3">
        {tips.map((t, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${t.ok ? "bg-green-100" : "bg-orange-100"}`}>
              {t.ok
                ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                : <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
              }
            </div>
            <p className={`text-sm ${t.ok ? "text-gray-600" : "text-orange-700 font-semibold"}`}>{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <AdminLayout title="Security">
      <div className="space-y-6 max-w-2xl">
        <SecurityTips />
        <TwoFactorSection />
        <PasswordSection />
      </div>
    </AdminLayout>
  );
}
