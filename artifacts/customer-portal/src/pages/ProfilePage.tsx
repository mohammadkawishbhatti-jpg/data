import React from 'react';
import { 
  User, Building2, Mail, Phone, ShieldCheck, 
  Sparkles, Award, MapPin, ExternalLink, Headset, Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { customer } = useAuth();

  const initials = (customer?.name ?? 'Customer')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#0D1F3C]">
          Account Profile & Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your company credentials, primary contact details, and account executive information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Account Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main User Card */}
          <div className="portal-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0D1F3C] to-[#1A2F5A] text-[#FFB800] font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-black text-2xl text-[#0D1F3C]">
                    {customer?.name || 'Valued Client'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ACTIVE
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-semibold mt-1">
                  Customer ID: <strong className="text-[#0D1F3C]">{customer?.customerNumber || `#CUST-${customer?.id}`}</strong>
                </p>
              </div>
            </div>

            {/* Field Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer?.name || '—'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer?.email || '—'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer?.phone || '—'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Company Name</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer?.company || 'Boutique / Independent Retailer'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div className="portal-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#0D1F3C]">Security & Access</h3>
                <p className="text-slate-500 text-xs">Portal authentication credentials.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Lock size={16} className="text-slate-400" />
                <span>Password Protected Account</span>
              </div>
              <span className="text-[#E63329] font-bold hover:underline cursor-pointer">
                Request Password Reset
              </span>
            </div>
          </div>
        </div>

        {/* Right Column — Account Executive Card */}
        <div className="space-y-6">
          <div className="portal-card p-6 bg-gradient-to-br from-[#0D1F3C] to-[#162B4D] text-white border-0 shadow-xl">
            <div className="flex items-center gap-2 text-[#FFB800] font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles size={14} /> Dedicated Account Manager
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white font-black text-xl flex items-center justify-center border border-white/20 shrink-0">
                KB
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-lg text-white">Kawish Bhatti</h4>
                <p className="text-xs text-slate-300">Senior Packaging Specialist</p>
                <p className="text-[10px] text-[#FFB800] font-semibold mt-0.5">Prime Packaging Boxes USA</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-700/80 pt-4 text-xs">
              <a
                href="tel:8187584076"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >
                <Phone size={16} className="text-[#FFB800]" />
                <span>Direct Line: 818-758-4076</span>
              </a>

              <a
                href="mailto:help@primepackagingboxes.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >
                <Mail size={16} className="text-[#FFB800]" />
                <span>help@primepackagingboxes.com</span>
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 text-[11px] text-slate-300 leading-relaxed">
              💬 Have questions regarding custom die-line templates, box samples, or shipping schedules? Your account executive is available Mon-Fri 8am-6pm PST.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
