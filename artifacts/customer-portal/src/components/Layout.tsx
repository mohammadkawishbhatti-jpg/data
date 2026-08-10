import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, FileText, Receipt, User, LogOut, ExternalLink, 
  Menu, X, Phone, ShieldCheck, ChevronRight, HelpCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/orders',   icon: Package,   label: 'My Orders', badge: null },
  { to: '/quotes',   icon: FileText,  label: 'Quotes & Estimates', badge: null },
  { to: '/invoices', icon: Receipt,   label: 'Invoices & Billing', badge: null },
  { to: '/profile',  icon: User,      label: 'Account Profile', badge: null },
];

export default function Layout() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials = (customer?.name ?? 'Customer')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0D1F3C] text-white border-r border-[#1E293B] shrink-0 z-30 shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1E3A8A]/40 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E63329] to-[#C42A21] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-[#E63329]/30 shrink-0">
            P
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base tracking-wider leading-none text-white">
              PRIME PACKAGING
            </h1>
            <p className="text-[11px] font-semibold text-[#FFB800] uppercase tracking-widest mt-1">
              Customer Portal
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-[#1E3A8A]/30 bg-[#162B4D]/60 mx-4 my-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFB800] to-[#FFA000] text-[#0D1F3C] font-black text-sm flex items-center justify-center shrink-0 shadow-md">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-white truncate">{customer?.name ?? 'Valued Customer'}</p>
            <p className="text-xs text-slate-400 truncate">{customer?.company || customer?.email}</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 mb-2">
            Main Menu
          </div>
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E63329] text-white font-bold shadow-lg shadow-[#E63329]/25 translate-x-1'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-white/80" />}
              </NavLink>
            );
          })}

          <div className="pt-6 pb-2">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 mb-2">
              Quick Links
            </div>
            <a
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={16} className="text-slate-400" />
              <span>Back to Main Website</span>
            </a>
          </div>
        </nav>

        {/* Account Manager Support Banner */}
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-br from-[#162B4D] to-[#0D1F3C] border border-blue-500/20 text-xs">
          <div className="flex items-center gap-2 text-[#FFB800] font-bold mb-1">
            <Sparkles size={14} /> Account Support
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed mb-2.5">
            Need urgent quote changes or custom box specs?
          </p>
          <a
            href="tel:8187584076"
            className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl text-[11px] transition-colors"
          >
            <Phone size={13} className="text-[#FFB800]" /> Call 818-758-4076
          </a>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-[#1E3A8A]/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-rose-300 hover:text-white hover:bg-rose-600/30 border border-rose-500/20 transition-all"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs shrink-0">
          {/* Mobile menu toggle & brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E63329] font-black text-white text-xs flex items-center justify-center">
                P
              </div>
              <span className="font-heading font-extrabold text-sm text-[#0D1F3C]">
                PRIME PORTAL
              </span>
            </div>
          </div>

          {/* Desktop Breadcrumbs / Welcome */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck size={14} /> Verified Account
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-600 font-medium">
              Welcome back, <strong className="text-[#0D1F3C]">{customer?.name}</strong>
            </span>
          </div>

          {/* Header Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="tel:8187584076"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#0D1F3C] bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Phone size={14} className="text-[#E63329]" />
              <span>818-758-4076</span>
            </a>
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#E63329] hover:bg-[#C42A21] px-4 py-2 rounded-xl transition-all shadow-md shadow-[#E63329]/20"
            >
              <span>+ New Order Quote</span>
            </a>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 w-full max-w-xs bg-[#0D1F3C] text-white p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E63329] font-black text-white flex items-center justify-center">
                    P
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-sm text-white">PRIME PORTAL</h2>
                    <p className="text-[10px] text-[#FFB800] uppercase tracking-wider font-bold">Customer Portal</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="py-4">
                <p className="text-xs font-bold text-white">{customer?.name}</p>
                <p className="text-[11px] text-slate-400">{customer?.email}</p>
              </div>

              <nav className="space-y-1.5 mt-2">
                {navItems.map(({ to, icon: Icon, label }) => {
                  const isActive = location.pathname.startsWith(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                        isActive ? 'bg-[#E63329] text-white' : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-700">
              <a
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                <ExternalLink size={14} /> Main Website
              </a>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-rose-500/20 text-rose-300 font-bold py-2.5 rounded-xl text-xs border border-rose-500/30"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
