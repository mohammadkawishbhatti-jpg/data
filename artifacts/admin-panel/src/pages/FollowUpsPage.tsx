import { useState, useCallback } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  Mail, Phone, Building2, Package, MessageSquare,
  CheckCircle2, Circle, Calendar, ChevronLeft, ChevronRight,
  Filter, RefreshCw, FileText, Tag, Clock, Search, X
} from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

// ── Types ──────────────────────────────────────────────────────────────────────
interface FollowUpItem {
  id: number;
  type: "quote" | "lead";
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject?: string | null;
  message?: string | null;
  // Quote detail fields
  productType?: string | null;
  quantity?: string | null;
  dimensions?: string | null;
  material?: string | null;
  printingDetails?: string | null;
  status: string;
  followUpDone: boolean;
  followUpDate?: string | null;
  followUpNotes?: string | null;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function dateLabel(d: Date) {
  if (isToday(d))     return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE, MMM d yyyy");
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const STATUS_COLORS: Record<string, string> = {
  new:         "bg-blue-100 text-blue-700",
  contacted:   "bg-indigo-100 text-indigo-700",
  "in progress":"bg-amber-100 text-amber-700",
  quoted:      "bg-violet-100 text-violet-700",
  won:         "bg-green-100 text-green-700",
  lost:        "bg-red-100 text-red-600",
};

// ── Follow-Up Card ─────────────────────────────────────────────────────────────
function FollowUpCard({
  item, onToggleDone, onSaveNotes,
}: {
  item: FollowUpItem;
  onToggleDone: (item: FollowUpItem) => void;
  onSaveNotes: (item: FollowUpItem, notes: string, date: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(item.followUpNotes || "");
  const [fuDate, setFuDate] = useState(item.followUpDate ? item.followUpDate.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await onSaveNotes(item, notes, fuDate);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const statusColor = STATUS_COLORS[item.status?.toLowerCase()] ?? "bg-gray-100 text-gray-600";

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm
      ${item.followUpDone ? "opacity-60 border-green-200" : "border-border hover:shadow-md"}`}>

      {/* Main row */}
      <div className="flex items-start gap-3 p-4">

        {/* Done checkbox */}
        <button
          onClick={() => onToggleDone(item)}
          title={item.followUpDone ? "Mark as pending" : "Mark as done"}
          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
        >
          {item.followUpDone
            ? <CheckCircle2 className="w-6 h-6 text-green-500" />
            : <Circle className="w-6 h-6 text-gray-300 hover:text-primary" />
          }
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`font-bold text-sm ${item.followUpDone ? "line-through text-muted-foreground" : ""}`}>
              {item.name}
            </span>

            {/* Type badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
              ${item.type === "quote" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
              {item.type === "quote" ? <FileText className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
              {item.type === "quote" ? "Quote Request" : "Contact Lead"}
            </span>

            {/* Status badge */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColor}`}>
              {item.status}
            </span>

            {item.followUpDone && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
            )}
          </div>

          {/* Contact details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            <a href={`mailto:${item.email}`}
              className="flex items-center gap-1 hover:text-primary font-medium transition-colors">
              <Mail className="w-3 h-3" />
              {item.email}
            </a>
            {item.phone && (
              <a href={`tel:${item.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                <Phone className="w-3 h-3" /> {item.phone}
              </a>
            )}
            {item.company && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {item.company}
              </span>
            )}
            {item.subject && (
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" /> {item.subject}
              </span>
            )}
          </div>

          {/* Quote detail pills */}
          {item.type === "quote" && (item.quantity || item.dimensions || item.material || item.printingDetails) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.quantity && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                  <Tag className="w-2.5 h-2.5" /> Qty: {item.quantity}
                </span>
              )}
              {item.dimensions && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                  📐 {item.dimensions}
                </span>
              )}
              {item.material && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                  🧱 {item.material}
                </span>
              )}
              {item.printingDetails && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                  🖨 {item.printingDetails}
                </span>
              )}
            </div>
          )}

          {/* Message preview */}
          {item.message && (
            <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-1 italic">
              "{item.message}"
            </p>
          )}
        </div>

        {/* Right: date + expand */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground">
            {format(parseISO(item.createdAt), "h:mm a")}
          </span>
          {item.followUpDate && (
            <span className="text-[11px] text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              {format(parseISO(item.followUpDate), "MMM d")}
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 hover:bg-muted transition-colors"
          >
            {expanded ? "Less" : "Notes ↓"}
          </button>
        </div>
      </div>

      {/* Expanded notes panel */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Schedule Follow-up
              </label>
              <input
                type="date"
                value={fuDate}
                onChange={e => setFuDate(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Internal Note
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Called, sent pricing PDF…"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save"}
            </button>
            <button
              onClick={() => onToggleDone(item)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors
                ${item.followUpDone
                  ? "border-orange-300 text-orange-700 hover:bg-orange-50"
                  : "border-green-300 text-green-700 hover:bg-green-50"
                }`}
            >
              {item.followUpDone
                ? <><Circle className="w-3.5 h-3.5" /> Reopen</>
                : <><CheckCircle2 className="w-3.5 h-3.5" /> Mark Done</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function FollowUpsPage() {
  const qc = useQueryClient();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(""); // "" = all
  const [filterDone, setFilterDone]     = useState<"all" | "pending" | "done">("all");
  const [filterType, setFilterType]     = useState<"all" | "quote" | "lead">("all");
  const [search, setSearch]             = useState("");

  const queryKey = ["follow-ups", selectedDate];

  const { data: items = [], isLoading, refetch } = useQuery<FollowUpItem[]>({
    queryKey,
    queryFn: async () => {
      const url = selectedDate
        ? `${API}/admin/follow-ups?date=${selectedDate}`
        : `${API}/admin/follow-ups`;
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
  });

  const patchItem = useCallback(async (item: FollowUpItem, body: Record<string, unknown>) => {
    await fetch(`${API}/admin/follow-ups/${item.type}/${item.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    qc.invalidateQueries({ queryKey });
  }, [qc, queryKey]);

  const toggleDone = (item: FollowUpItem) =>
    patchItem(item, { followUpDone: !item.followUpDone });

  const saveNotes = (item: FollowUpItem, notes: string, date: string) =>
    patchItem(item, { followUpNotes: notes, followUpDate: date || null });

  // Navigate dates
  const changeDate = (delta: number) => {
    const base = selectedDate ? new Date(selectedDate) : today;
    base.setDate(base.getDate() + delta);
    setSelectedDate(toInputDate(base));
  };

  // Filtered list
  const filtered = items.filter(item => {
    if (filterDone === "pending" && item.followUpDone)  return false;
    if (filterDone === "done"    && !item.followUpDone) return false;
    if (filterType !== "all" && item.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q)
        || item.email.toLowerCase().includes(q)
        || (item.company ?? "").toLowerCase().includes(q)
        || (item.subject ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const pending = items.filter(i => !i.followUpDone).length;
  const done    = items.filter(i =>  i.followUpDone).length;
  const quotes  = items.filter(i => i.type === "quote").length;
  const leads   = items.filter(i => i.type === "lead").length;

  const dateDisplay = selectedDate
    ? dateLabel(new Date(selectedDate + "T00:00:00"))
    : "All Time";

  return (
    <AdminLayout title="Follow Ups">
      <div className="space-y-5 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Follow Ups</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              All form submissions — quotes &amp; contact leads — in one place
            </p>
          </div>
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 border border-border rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Date navigator */}
        <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => changeDate(-1)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="border border-border rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10"
              />
            </div>

            <button onClick={() => changeDate(1)}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            {[
              { label: "Today",     val: toInputDate(today) },
              { label: "Yesterday", val: toInputDate(new Date(Date.now() - 86400000)) },
              { label: "All",       val: "" },
            ].map(b => (
              <button
                key={b.label}
                onClick={() => setSelectedDate(b.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                  ${selectedDate === b.val ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="ml-auto text-sm font-bold text-muted-foreground">
            📅 {dateDisplay}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total",         val: items.length, color: "text-slate-700",  icon: Filter },
            { label: "Pending",       val: pending,      color: "text-amber-600",  icon: Circle },
            { label: "Done",          val: done,         color: "text-green-600",  icon: CheckCircle2 },
            { label: "Quotes / Leads",val: `${quotes} / ${leads}`, color: "text-violet-700", icon: Tag },
          ].map(s => (
            <div key={s.label} className="bg-white border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-0.5">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[11px] text-muted-foreground">{s.label}</span>
              </div>
              <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, company…"
              className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex rounded-xl border border-border overflow-hidden text-xs font-semibold">
            {(["all", "pending", "done"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterDone(f)}
                className={`px-3 py-2 capitalize transition-colors
                  ${filterDone === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex rounded-xl border border-border overflow-hidden text-xs font-semibold">
            {(["all", "quote", "lead"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-2 capitalize transition-colors
                  ${filterType === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {f === "all" ? "All Types" : f === "quote" ? "Quotes" : "Leads"}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-700">
              {items.length === 0
                ? "No submissions yet for this date"
                : "All caught up!"}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {items.length === 0
                ? "Try selecting a different date or choose 'All'"
                : "No submissions match your current filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium">
              Showing {filtered.length} of {items.length} submissions
            </p>
            {filtered.map(item => (
              <FollowUpCard
                key={`${item.type}-${item.id}`}
                item={item}
                onToggleDone={toggleDone}
                onSaveNotes={saveNotes}
              />
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
