import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { 
  Loader2, AlertCircle, ShieldCheck, Eye, EyeOff, 
  CheckCircle2, Lock, User, ArrowRight, Sparkles, KeyRound
} from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState("");
  const [requires2fa, setRequires2fa] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAdminLogin();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit((data) => {
    setErrorMsg("");
    login.mutate({ data } as any, {
      onSuccess: (res: any) => {
        if (res?.requires2fa) setRequires2fa(true);
        else setLocation("/");
      },
      onError: (err: any) => {
        if (err.status === 429) setErrorMsg("Too many attempts. Wait 15 minutes.");
        else if (err.status === 401) setErrorMsg("Invalid username or password.");
        else setErrorMsg("Login failed. Check backend status.");
      },
    });
  });

  const verify2fa = async () => {
    if (otp.length !== 6) return setErrorMsg("Enter 6-digit authentication code.");
    setVerifying(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/admin/security/2fa/verify-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: otp }),
      });
      const json = await res.json();
      if (!res.ok) setErrorMsg(json.error || "Invalid verification code.");
      else setLocation("/");
    } catch { setErrorMsg("Network error during verification."); }
    finally { setVerifying(false); }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#070A12] font-sans overflow-hidden relative selection:bg-rose-500 selection:text-white">
      {/* Dynamic Ambient Glow Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-rose-600/15 via-red-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-amber-500/10 via-blue-900/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── Left Hero Brand Panel (Desktop) ── */}
      <div className="hidden lg:flex lg:w-[55%] relative z-10 flex-col justify-between p-12 lg:p-16 border-r border-white/5 bg-gradient-to-br from-[#0D1F3C]/40 to-[#070A12]/80 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E63329] to-[#C42A21] flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-[#E63329]/40 border border-white/20">
            P
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-lg text-white tracking-widest leading-none">
              PRIME PACKAGING
            </h1>
            <p className="text-xs font-bold text-[#FFB800] uppercase tracking-widest mt-1">
              Admin Workspace
            </p>
          </div>
        </div>

        {/* Central Glass Card */}
        <div className="my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold backdrop-blur-md">
            <Sparkles size={14} className="text-[#FFB800]" /> Secure business management workspace
          </div>

          <h2 className="font-heading font-black text-4xl lg:text-5xl text-white leading-tight">
            Control products, quotes, orders & AI sales desk.
          </h2>

          <p className="text-slate-400 text-base leading-relaxed">
            Secure admin portal for managing product catalogs, live quote estimations, PDF invoice generation, customer accounts, and Clark AI assistant configurations.
          </p>

          {/* Feature List */}
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            {[
              "Complete Product & Dynamic Category Management",
              "Quote estimates and PDF invoice generation",
              "CRM Sales Pipeline, Leads & Customer Accounts",
              "Customer support and sales tools in one place",
            ].map(feat => (
              <div key={feat} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 size={13} />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="flex items-center justify-between text-slate-500 text-xs border-t border-white/10 pt-6">
          <span className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 size={14} /> Secure admin workspace
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
            <Lock size={14} className="text-[#FFB800]" /> Authorized access only
          </span>
        </div>
      </div>

      {/* ── Right Panel — Form Container ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 relative z-10 bg-[#0B0F19]/90 backdrop-blur-xl border-l border-white/5">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#E63329] font-black text-white text-xl flex items-center justify-center">
            P
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-sm text-white">PRIME PACKAGING</h1>
            <p className="text-[10px] text-[#FFB800] uppercase tracking-wider font-bold">Admin Workspace</p>
          </div>
        </div>

        <div className="my-auto max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <img
              src="/api/uploads/prime-packaging-logo.svg"
              alt="Prime Packaging Boxes"
              className="h-9 w-auto max-w-[190px] rounded-md bg-white object-contain mb-5"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#E63329]/15 border border-[#E63329]/30 text-[#E63329] flex items-center justify-center mb-4">
              {requires2fa ? <ShieldCheck size={24} /> : <KeyRound size={24} />}
            </div>
            <h3 className="font-heading font-extrabold text-3xl text-white">
              {requires2fa ? "Two-Factor Auth" : "Admin Sign In"}
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              {requires2fa 
                ? "Enter your 6-digit authenticator security code" 
                : "Sign in to access your administrative control panel"}
            </p>
          </div>

          {/* Alert Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!requires2fa ? (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    {...register("username", { required: true })}
                    autoFocus
                    autoComplete="username"
                    placeholder="Enter admin username"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#141A29] border border-slate-700/80 rounded-xl text-white text-sm font-medium outline-none focus:border-[#E63329] focus:bg-[#1A2338] focus:ring-4 focus:ring-[#E63329]/10 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: true })}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 bg-[#141A29] border border-slate-700/80 rounded-xl text-white text-sm font-medium outline-none focus:border-[#E63329] focus:bg-[#1A2338] focus:ring-4 focus:ring-[#E63329]/10 transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || login.isPending}
                className="w-full py-4 bg-gradient-to-r from-[#E63329] to-[#C42A21] hover:from-[#F43F35] hover:to-[#D43128] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#E63329]/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {(isSubmitting || login.isPending) ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  6-Digit Authenticator PIN
                </label>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full py-4 bg-[#141A29] border border-slate-700 rounded-xl text-center text-2xl tracking-[0.5em] font-mono text-white outline-none focus:border-[#E63329] focus:ring-4 focus:ring-[#E63329]/10"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && verify2fa()}
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Open Google Authenticator / Authy app to fetch your current code.
                </p>
              </div>

              <button
                onClick={verify2fa}
                disabled={verifying || otp.length !== 6}
                className="w-full py-4 bg-[#E63329] hover:bg-[#C42A21] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#E63329]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Security PIN</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                onClick={() => { setRequires2fa(false); setOtp(""); setErrorMsg(""); }}
                className="w-full text-xs font-bold text-slate-400 hover:text-white transition-colors text-center"
              >
                ← Return to Login Form
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-slate-600 text-xs pt-6">
          © 2026 Prime Packaging Boxes USA. Protected System.
        </div>
      </div>
    </div>
  );
}
