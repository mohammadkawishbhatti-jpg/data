import { useState } from "react";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

export default function PortalLoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await fetch(`${API}/portal/login`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.toLowerCase().trim(), password }),
      });
      if (!r.ok) {
        const d = await r.json();
        setError(d.error || "Invalid credentials");
        return;
      }
      setLocation("/portal");
    } catch {
      setError("Connection error. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b3e] via-[#1B2B5E] to-[#0d1b3e] flex flex-col items-center justify-center px-4">

      {/* Background dots */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Logo */}
      <div className="relative mb-8 text-center">
        <a href="/" className="inline-block">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 bg-[#e63329] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">P</span>
            </div>
            <div className="text-white font-black text-xl tracking-tight">PRIME PACKAGING BOXES</div>
          </div>
          <div className="text-[#FFB800] text-xs font-bold tracking-[0.25em] uppercase mt-1">Customer Portal</div>
        </a>
      </div>

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-[#1B2B5E] to-[#2a3f7a] px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Sign In</h1>
              <p className="text-white/50 text-xs">Track orders &amp; manage your account</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Username</label>
            <input
              type="text"
              required
              autoFocus
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_username"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B2B5E] focus:ring-2 focus:ring-[#1B2B5E]/10 transition-colors bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B2B5E] focus:ring-2 focus:ring-[#1B2B5E]/10 transition-colors bg-gray-50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B2B5E] text-white font-bold py-3.5 rounded-xl hover:bg-[#15235a] disabled:opacity-60 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#1B2B5E]/30"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign In to Portal
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Don't have access?{" "}
            <a href="/contact" className="text-[#1B2B5E] font-semibold hover:underline">Contact us</a>
          </p>
        </form>
      </div>

      <div className="relative mt-8 text-center space-y-1">
        <p className="text-white/40 text-xs">
          Need help? Call{" "}
          <a href="tel:8187584076" className="text-white/70 hover:text-white font-semibold transition-colors">818-758-4076</a>
        </p>
        <p className="text-white/25 text-[10px]">
          © {new Date().getFullYear()} Prime Packaging Boxes — Torrance, CA
        </p>
      </div>
    </div>
  );
}
