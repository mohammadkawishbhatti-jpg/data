import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Receipt, Download, Printer, Search, RefreshCw, 
  AlertCircle, CheckCircle2, DollarSign, ExternalLink
} from 'lucide-react';
import { fetchPortalInvoices, Invoice } from '@/lib/api';

const CURRENCY: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', PKR: '₨', AED: 'د.إ' };

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: invoices = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['portal-invoices'],
    queryFn: fetchPortalInvoices,
  });

  const stats = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    invoices.forEach(inv => {
      const amt = typeof inv.total === 'number' ? inv.total : parseFloat(String(inv.total || 0));
      if (!isNaN(amt)) {
        totalBilled += amt;
        if (inv.status === 'paid') totalPaid += amt;
        else totalUnpaid += amt;
      }
    });

    return { count: invoices.length, totalBilled, totalPaid, totalUnpaid };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      if (statusFilter === 'all') return matchSearch;
      return matchSearch && inv.status === statusFilter;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handlePrint = (inv: Invoice) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#0D1F3C]">
            Invoices & Billing
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Download PDF tax invoices, review payments, and check order receipts.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin text-[#E63329]' : ''} />
          <span>Refresh Invoices</span>
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Billed Amount', value: `$${stats.totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Paid & Cleared', value: `$${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Outstanding Balance', value: `$${stats.totalUnpaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Toolbar */}
      <div className="portal-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D1F3C] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'sent', label: 'Sent / Pending' },
            { id: 'paid', label: 'Paid' },
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

      {/* Content Table / List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 portal-card animate-pulse bg-slate-100" />)}
        </div>
      ) : isError ? (
        <div className="portal-card p-12 text-center">
          <AlertCircle size={44} className="mx-auto text-rose-500 mb-3" />
          <h3 className="font-heading font-bold text-base text-[#0D1F3C]">Failed to Load Invoices</h3>
          <p className="text-slate-500 text-xs mt-1 mb-4">Try refreshing or check connection.</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-[#0D1F3C] text-white text-xs font-bold rounded-xl">
            Retry
          </button>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="portal-card p-16 text-center">
          <Receipt size={52} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-heading font-bold text-lg text-[#0D1F3C]">No Invoices Found</h3>
          <p className="text-slate-500 text-xs mt-1">Invoices generated for your orders will be listed here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map(inv => {
            const sym = CURRENCY[inv.currency] ?? inv.currency ?? '$';
            const total = typeof inv.total === 'number' 
              ? inv.total.toFixed(2) 
              : parseFloat(String(inv.total || 0)).toFixed(2);

            const isPaid = inv.status === 'paid';

            return (
              <div key={inv.id} className="portal-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    <Receipt size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-extrabold text-base text-[#0D1F3C]">
                        {inv.invoiceNumber || `#INV-${inv.id}`}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                        isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.status || 'Sent'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Issued on {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {inv.execName ? ` • Account Rep: ${inv.execName}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Billed</span>
                    <span className="font-heading font-black text-xl text-[#0D1F3C]">
                      {sym}{total}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePrint(inv)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-[#0D1F3C] hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    <Printer size={15} />
                    <span>Print Invoice</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
