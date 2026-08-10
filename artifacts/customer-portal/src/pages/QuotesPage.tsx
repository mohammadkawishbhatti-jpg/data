import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Plus, Search, RefreshCw, AlertCircle, 
  ExternalLink, CheckCircle2, Clock, Phone, Sparkles
} from 'lucide-react';
import { fetchPortalQuotes, Quote } from '@/lib/api';

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: quotes = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['portal-quotes'],
    queryFn: fetchPortalQuotes,
  });

  const stats = useMemo(() => {
    let newCount = 0;
    let quotedCount = 0;
    quotes.forEach(q => {
      if (q.status === 'new' || q.status === 'pending') newCount++;
      if (q.status === 'quoted' || q.status === 'approved') quotedCount++;
    });
    return { count: quotes.length, newCount, quotedCount };
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchSearch =
        q.productType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id?.toString().includes(searchTerm);
      if (statusFilter === 'all') return matchSearch;
      return matchSearch && q.status === statusFilter;
    });
  }, [quotes, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#0D1F3C]">
            Quotes & Estimates
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review custom pricing proposals, material specifications, and turnaround estimates.
          </p>
        </div>

        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E63329] hover:bg-[#C42A21] text-white text-xs font-bold rounded-xl shadow-md shadow-[#E63329]/20 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Request New Quote</span>
        </a>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Quotes Submitted', value: stats.count, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Review', value: stats.newCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Ready / Quoted', value: stats.quotedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
            placeholder="Search product type..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D1F3C] focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#0D1F3C] px-3 py-2 bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin text-[#E63329]' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 portal-card animate-pulse bg-slate-100" />)}
        </div>
      ) : isError ? (
        <div className="portal-card p-12 text-center">
          <AlertCircle size={44} className="mx-auto text-rose-500 mb-3" />
          <h3 className="font-heading font-bold text-base text-[#0D1F3C]">Failed to Load Quotes</h3>
          <p className="text-slate-500 text-xs mt-1 mb-4">Try refreshing or check server status.</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-[#0D1F3C] text-white text-xs font-bold rounded-xl">
            Retry
          </button>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="portal-card p-16 text-center">
          <FileText size={52} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-heading font-bold text-lg text-[#0D1F3C]">No Quotes Found</h3>
          <p className="text-slate-500 text-xs mt-1 mb-5">Submit a custom quote request for boxes or packaging.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E63329] text-white font-bold text-xs rounded-xl"
          >
            + Request Custom Quote
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map(quote => (
            <div key={quote.id} className="portal-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-[#0D1F3C]">
                      {quote.productType || 'Custom Packaging Quote'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted on {new Date(quote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                  <Clock size={13} /> {quote.status?.toUpperCase() || 'NEW'}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Quantity</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{quote.quantity || '—'} units</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Dimensions</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{quote.dimensions || 'Custom Sizing'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Material Spec</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{quote.material || 'Premium Cardboard/Corrugated'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Printing</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{quote.printingDetails || 'Full Color CMYK'}</span>
                </div>
              </div>

              {quote.additionalNotes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60 mt-1">
                  <strong>Notes:</strong> {quote.additionalNotes}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">
                  ⚡ Official quote sent within 2 hours by email.
                </span>
                <a
                  href="tel:8187584076"
                  className="font-bold text-[#E63329] hover:underline flex items-center gap-1"
                >
                  <Phone size={13} /> Call Sales Desk
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
