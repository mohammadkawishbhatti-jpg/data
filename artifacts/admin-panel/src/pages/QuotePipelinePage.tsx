import { useState, useCallback } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  DndContext, DragOverlay, useDroppable, useDraggable,
  PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  useListQuotes, getListQuotesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2, Phone, Mail, Package, Hash, Calendar,
  GripVertical, X, ChevronRight, TrendingUp, Users,
  CheckCircle2, XCircle, MessageSquare, Clock
} from "lucide-react";
import { format } from "date-fns";
import { Modal } from "../components/ui/Modal";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

// ── Pipeline stages ────────────────────────────────────────────────────────────
const STAGES = [
  { id: "new",        label: "New",         color: "bg-slate-100  border-slate-300  text-slate-700",  dot: "bg-slate-400",   header: "bg-slate-50" },
  { id: "contacted",  label: "Contacted",   color: "bg-blue-50    border-blue-300   text-blue-700",   dot: "bg-blue-500",    header: "bg-blue-50"  },
  { id: "quoted",     label: "Quote Sent",  color: "bg-violet-50  border-violet-300 text-violet-700", dot: "bg-violet-500",  header: "bg-violet-50"},
  { id: "negotiating",label: "Negotiating", color: "bg-amber-50   border-amber-300  text-amber-700",  dot: "bg-amber-500",   header: "bg-amber-50" },
  { id: "won",        label: "Won ✓",       color: "bg-green-50   border-green-300  text-green-700",  dot: "bg-green-500",   header: "bg-green-50" },
  { id: "lost",       label: "Lost",        color: "bg-red-50     border-red-300    text-red-600",    dot: "bg-red-400",     header: "bg-red-50"   },
] as const;

type StageId = typeof STAGES[number]["id"];

interface Quote {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  productType?: string | null;
  quantity?: string | null;
  dimensions?: string | null;
  material?: string | null;
  printingDetails?: string | null;
  additionalNotes?: string | null;
  status: string;
  followUpDate?: string | null;
  followUpNotes?: string | null;
  notes?: string | null;
  createdAt: string;
}

// ── Draggable Card ─────────────────────────────────────────────────────────────
function QuoteCard({ quote, onClick, overlay = false }: { quote: Quote; onClick?: () => void; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: quote.id });
  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-border shadow-sm transition-shadow select-none
        ${isDragging && !overlay ? "opacity-30" : ""}
        ${overlay ? "shadow-xl rotate-1 scale-105" : "hover:shadow-md cursor-pointer"}
      `}
    >
      <div className="flex items-start gap-2 p-3">
        {/* Drag handle */}
        <div {...listeners} {...attributes} className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground shrink-0">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-start justify-between gap-1 mb-1.5">
            <p className="font-semibold text-sm leading-tight truncate">{quote.name}</p>
            <span className="text-[10px] text-muted-foreground shrink-0">#{quote.id}</span>
          </div>

          {quote.company && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{quote.company}</span>
            </div>
          )}
          {quote.productType && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
              <Package className="w-3 h-3 shrink-0" />
              <span className="truncate">{quote.productType}</span>
            </div>
          )}
          {quote.quantity && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1.5">
              <Hash className="w-3 h-3 shrink-0" />
              <span>Qty: {quote.quantity}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(quote.createdAt), "MMM d, yyyy")}
            </span>
            {quote.followUpDate && (
              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {format(new Date(quote.followUpDate), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Droppable Column ───────────────────────────────────────────────────────────
function Column({ stage, quotes, onCardClick }: {
  stage: typeof STAGES[number];
  quotes: Quote[];
  onCardClick: (q: Quote) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className={`rounded-t-xl border border-b-0 px-3 py-2.5 flex items-center justify-between ${stage.header} border-border`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
          <span className="text-sm font-bold">{stage.label}</span>
        </div>
        <span className="text-xs font-semibold bg-white/70 border border-border px-1.5 py-0.5 rounded-full">
          {quotes.length}
        </span>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[480px] rounded-b-xl border border-border bg-muted/20 p-2 space-y-2 transition-colors
          ${isOver ? "bg-primary/5 border-primary/40" : ""}
        `}
      >
        {quotes.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-lg">
            Drop here
          </div>
        )}
        {quotes.map(q => (
          <QuoteCard key={q.id} quote={q} onClick={() => onCardClick(q)} />
        ))}
      </div>
    </div>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
function QuoteDetailModal({ quote, onClose, onStatusChange }: {
  quote: Quote;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [notes, setNotes] = useState(quote.notes || "");
  const [followUpDate, setFollowUpDate] = useState(quote.followUpDate ? quote.followUpDate.slice(0, 10) : "");
  const [followUpNotes, setFollowUpNotes] = useState(quote.followUpNotes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveDetails = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/admin/quotes/${quote.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, followUpDate: followUpDate || null, followUpNotes }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const stage = STAGES.find(s => s.id === quote.status) ?? STAGES[0];

  return (
    <Modal isOpen onClose={onClose} title={`Quote #${quote.id} — ${quote.name}`}>
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">

        {/* Contact info */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Mail,      label: "Email",   val: quote.email },
            { icon: Phone,     label: "Phone",   val: quote.phone },
            { icon: Building2, label: "Company", val: quote.company },
            { icon: Package,   label: "Product", val: quote.productType },
            { icon: Hash,      label: "Qty",     val: quote.quantity },
            { icon: Calendar,  label: "Date",    val: format(new Date(quote.createdAt), "MMM d, yyyy") },
          ].filter(r => r.val).map(row => (
            <div key={row.label} className="flex items-start gap-2">
              <row.icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">{row.label}</p>
                <p className="text-sm font-medium">{row.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Box specs */}
        {(quote.dimensions || quote.material || quote.printingDetails) && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            {quote.dimensions && <p><span className="text-muted-foreground text-xs">Dimensions:</span> {quote.dimensions}</p>}
            {quote.material && <p><span className="text-muted-foreground text-xs">Material:</span> {quote.material}</p>}
            {quote.printingDetails && <p><span className="text-muted-foreground text-xs">Printing:</span> {quote.printingDetails}</p>}
          </div>
        )}

        {/* Additional notes from customer */}
        {quote.additionalNotes && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Customer Notes</p>
            <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">{quote.additionalNotes}</p>
          </div>
        )}

        {/* Stage changer */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Move to Stage</p>
          <div className="flex flex-wrap gap-2">
            {STAGES.map(s => (
              <button
                key={s.id}
                onClick={() => onStatusChange(quote.id, s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                  ${s.id === quote.status
                    ? `${s.color} border-current`
                    : "bg-muted hover:bg-muted/80 border-border text-muted-foreground"
                  }`}
              >
                {s.id === quote.status && "✓ "}{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Internal notes */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> Internal Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes visible only to admin team…"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Follow-up */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Follow-up Notes</label>
            <input
              type="text"
              value={followUpNotes}
              onChange={e => setFollowUpNotes(e.target.value)}
              placeholder="What to discuss…"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={saveDetails}
            disabled={saving}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save Notes & Follow-up"}
          </button>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function QuotePipelinePage() {
  const queryClient = useQueryClient();
  const { data: rawQuotes = [], isLoading } = useListQuotes();
  const quotes = rawQuotes as Quote[];

  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);

  // Optimistic local status override
  const [overrides, setOverrides] = useState<Record<number, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getStatus = useCallback((q: Quote) => overrides[q.id] ?? q.status, [overrides]);

  const handleDragStart = (e: DragStartEvent) => setActiveId(Number(e.active.id));

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const quoteId = Number(active.id);
    const newStatus = String(over.id) as StageId;
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote || getStatus(quote) === newStatus) return;

    // Optimistic update
    setOverrides(prev => ({ ...prev, [quoteId]: newStatus }));

    try {
      await fetch(`${API}/admin/quotes/${quoteId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
    } catch {
      // Revert on failure
      setOverrides(prev => { const n = { ...prev }; delete n[quoteId]; return n; });
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setOverrides(prev => ({ ...prev, [id]: status }));
    setDetailQuote(prev => prev ? { ...prev, status } : null);
    await fetch(`${API}/admin/quotes/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
  };

  const activeQuote = activeId ? quotes.find(q => q.id === activeId) : null;

  // Stats
  const total   = quotes.length;
  const won     = quotes.filter(q => getStatus(q) === "won").length;
  const newCount = quotes.filter(q => getStatus(q) === "new").length;
  const pending = quotes.filter(q => !["won","lost"].includes(getStatus(q))).length;

  return (
    <AdminLayout title="Quote Pipeline">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quote Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Drag cards between stages to update status</p>
          </div>
          <a href="/quotes" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
            List View <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Users,        label: "Total Quotes",   val: total,    color: "text-slate-700"  },
            { icon: Clock,        label: "New (unread)",   val: newCount, color: "text-blue-600"   },
            { icon: TrendingUp,   label: "In Pipeline",    val: pending,  color: "text-amber-600"  },
            { icon: CheckCircle2, label: "Won",            val: won,      color: "text-green-600"  },
          ].map(s => (
            <div key={s.label} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Kanban board */}
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {STAGES.map(stage => (
                <Column
                  key={stage.id}
                  stage={stage}
                  quotes={quotes.filter(q => getStatus(q) === stage.id)}
                  onCardClick={setDetailQuote}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
              {activeQuote && <QuoteCard quote={activeQuote} overlay />}
            </DragOverlay>
          </DndContext>
        )}

        {/* Detail modal */}
        {detailQuote && (
          <QuoteDetailModal
            quote={{ ...detailQuote, status: getStatus(detailQuote) }}
            onClose={() => setDetailQuote(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </AdminLayout>
  );
}
