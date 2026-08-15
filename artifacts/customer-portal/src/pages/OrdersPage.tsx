import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Package, ChevronRight, AlertCircle, RefreshCw, Search, 
  Clock, CheckCircle2, Truck, ArrowUpRight, Filter, DollarSign
} from 'lucide-react';
import { fetchPortalOrders, Order } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_STEPS = ['confirmed', 'processing', 'production', 'quality_check', 'shipped', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed', 
  processing: 'Processing', 
  production: 'In Production',
  quality_check: 'Quality Check', 
  shipped: 'Shipped', 
  delivered: 'Delivered', 
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  confirmed: { text: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  processing: { text: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  production: { text: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' },
  quality_check: { text: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  shipped: { text: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  delivered: { text: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  cancelled: { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

const CURRENCY: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', PKR: '₨', AED: 'د.إ' };

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? { text: '#475569', bg: '#F8FAFC', border: '#E2E8F0' };
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.text }} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function OrderStepper({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
        <AlertCircle size={14} /> Order Cancelled
      </span>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="w-full mt-4 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
        <span>Order Placed</span>
        <span>In Production</span>
        <span>Out for Delivery</span>
      </div>
      <div className="flex items-center gap-1">
        {STATUS_STEPS.map((s, i) => {
          const isDone = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <React.Fragment key={s}>
              <div 
                className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                  isCurrent 
                    ? 'ring-4 ring-[#E63329]/20 bg-[#E63329] text-white scale-110' 
                    : isDone 
                    ? 'bg-[#0D1F3C] text-white' 
                    : 'bg-slate-200'
                }`}
              />
              {i < STATUS_STEPS.length - 1 && (
                <div 
                  className={`flex-1 h-1 rounded-full transition-all ${
                    i < currentIdx ? 'bg-[#0D1F3C]' : 'bg-slate-200'
                  }`} 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['portal-orders'],
    queryFn: fetchPortalOrders,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    let totalSpent = 0;
    let activeCount = 0;
    let deliveredCount = 0;

    orders.forEach(o => {
      const amt = typeof o.total === 'number' ? o.total : parseFloat(String(o.total || 0));
      if (!isNaN(amt)) totalSpent += amt;
      if (!['delivered', 'cancelled'].includes(o.status)) activeCount++;
      if (o.status === 'delivered') deliveredCount++;
    });

    return { totalSpent, activeCount, deliveredCount, count: orders.length };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = 
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.status?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === 'all') return matchSearch;
      if (statusFilter === 'active') return matchSearch && !['delivered', 'cancelled'].includes(o.status);
      return matchSearch && o.status === statusFilter;
    });
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* ── Page Banner / Stat Widgets ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#0D1F3C]">
            Order Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track active production runs, delivery timelines, and box order history.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin text-[#E63329]' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── Stat Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.count, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Shipments', value: stats.activeCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Delivered', value: stats.deliveredCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Account Value', value: `$${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-[#E63329]', bg: 'bg-rose-50' },
        ].map(card => (
          <div key={card.label} className="portal-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className="font-heading font-extrabold text-2xl text-[#0D1F3C] mt-1">{card.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
              <card.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="portal-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D1F3C] focus:bg-white transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'Active Runs' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#0D1F3C] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders Content ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 portal-card animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="portal-card p-12 text-center">
          <AlertCircle size={44} className="mx-auto text-rose-500 mb-3" />
          <h3 className="font-heading font-bold text-base text-[#0D1F3C]">Failed to Load Orders</h3>
          <p className="text-slate-500 text-xs mt-1 mb-4">Check database connection or try refreshing.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#0D1F3C] text-white text-xs font-bold rounded-xl"
          >
            Retry Fetching
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="portal-card p-16 text-center">
          <Package size={52} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-heading font-bold text-lg text-[#0D1F3C]">No Orders Found</h3>
          <p className="text-slate-500 text-xs mt-1">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search query or filter settings.'
              : 'You do not have any orders recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const sym = CURRENCY[order.currency] ?? order.currency ?? '$';
            const total = typeof order.total === 'number' 
              ? order.total.toFixed(2) 
              : parseFloat(String(order.total || 0)).toFixed(2);

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="portal-card p-5 cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Specs */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0D1F3C] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Package size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-base text-[#0D1F3C]">
                          {order.orderNumber || `#${order.id}`}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • {order.items?.length ?? 1} item(s)
                      </p>
                    </div>
                  </div>

                  {/* Right Price & CTA */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Amount
                      </span>
                      <span className="font-heading font-black text-xl text-[#0D1F3C]">
                        {sym}{total}
                      </span>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-[#E63329] group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>

                {/* Progress Timeline Stepper */}
                <OrderStepper status={order.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
