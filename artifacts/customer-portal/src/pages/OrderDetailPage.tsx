import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, Package, Clock, Truck, CheckCircle2, 
  AlertCircle, RefreshCw, Printer, ExternalLink, Phone, ShieldCheck
} from 'lucide-react';
import { fetchPortalOrderById, Order } from '@/lib/api';

const STATUS_STEPS = [
  { id: 'confirmed', label: 'Order Confirmed', desc: 'Order & specifications received' },
  { id: 'processing', label: 'Processing', desc: 'Dieline & artwork prep' },
  { id: 'production', label: 'In Production', desc: 'Printing & die-cutting' },
  { id: 'quality_check', label: 'Quality Check', desc: 'QC inspection & structural testing' },
  { id: 'shipped', label: 'Shipped', desc: 'Handed to courier' },
  { id: 'delivered', label: 'Delivered', desc: 'Successfully delivered' },
];

const CURRENCY: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', PKR: '₨', AED: 'د.إ' };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ['portal-order', id],
    queryFn: () => fetchPortalOrderById(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-xl" />
        <div className="h-64 portal-card bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="portal-card p-12 text-center">
        <AlertCircle size={44} className="mx-auto text-rose-500 mb-3" />
        <h3 className="font-heading font-bold text-lg text-[#0D1F3C]">Order Not Found</h3>
        <p className="text-slate-500 text-xs mt-1 mb-4">Could not load details for order #{id}.</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-[#0D1F3C] text-white text-xs font-bold rounded-xl"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const sym = CURRENCY[order.currency] ?? order.currency ?? '$';
  const total = typeof order.total === 'number' 
    ? order.total.toFixed(2) 
    : parseFloat(String(order.total || 0)).toFixed(2);

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.id === order.status);

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0D1F3C] transition-colors self-start"
        >
          <ArrowLeft size={16} /> Back to All Orders
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer size={15} /> Print Summary
          </button>
          <a
            href="tel:8187584076"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E63329] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            <Phone size={14} /> Contact Manager
          </a>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="portal-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0D1F3C] border border-blue-100 flex items-center justify-center font-bold shrink-0">
              <Package size={24} />
            </div>
            <div>
              <h1 className="font-heading font-black text-2xl text-[#0D1F3C]">
                {order.orderNumber || `#${order.id}`}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
            <span className="font-heading font-black text-2xl text-[#0D1F3C]">
              {sym}{total}
            </span>
          </div>
        </div>

        {/* Live Production Timeline Stepper */}
        <div className="py-8">
          <h3 className="font-heading font-bold text-sm text-[#0D1F3C] mb-6">
            Production & Delivery Timeline
          </h3>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.id} className="flex md:flex-col items-center md:items-start gap-3">
                    <div 
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isCurrent 
                          ? 'bg-[#E63329] text-white ring-4 ring-[#E63329]/20 shadow-lg' 
                          : isPassed 
                          ? 'bg-[#0D1F3C] text-white' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-[#E63329]' : isPassed ? 'text-[#0D1F3C]' : 'text-slate-400'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 hidden md:block leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tracking Details Banner */}
        {order.trackingNumber && (
          <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck size={22} className="text-cyan-700 shrink-0" />
              <div>
                <p className="font-bold text-xs">Tracking Number Issued</p>
                <p className="text-xs font-mono font-bold text-cyan-800">{order.trackingNumber}</p>
              </div>
            </div>
            {order.estimatedDelivery && (
              <div className="text-right text-xs">
                <span className="text-cyan-700 block text-[10px] font-bold uppercase">Estimated Delivery</span>
                <span className="font-bold text-cyan-900">{order.estimatedDelivery}</span>
              </div>
            )}
          </div>
        )}

        {/* Items Spec Table */}
        <div className="mt-8">
          <h3 className="font-heading font-bold text-sm text-[#0D1F3C] mb-4">
            Order Items & Specifications
          </h3>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Item Description</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">
                        {item.name || item.productName || 'Custom Packaging Box'}
                        {item.dimensions && <span className="block text-slate-500 text-[11px] font-normal mt-0.5">Size: {item.dimensions}</span>}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{item.quantity || 100} units</td>
                      <td className="p-4 text-right font-extrabold text-[#0D1F3C]">
                        {sym}{(item.price || item.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 font-bold text-slate-800">Custom Printed Boxes & Packaging Spec</td>
                    <td className="p-4 font-semibold text-slate-700">100+ units</td>
                    <td className="p-4 text-right font-extrabold text-[#0D1F3C]">{sym}{total}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
