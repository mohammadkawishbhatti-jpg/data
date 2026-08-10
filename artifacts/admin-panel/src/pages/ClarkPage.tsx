import { useState, useMemo } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useListQuotes } from "@workspace/api-client-react";
import {
  Bot, MessageSquare, Users, Search,
  ChevronDown, ChevronUp, Calendar, Mail, Package, Hash,
  Globe, MapPin, Monitor
} from "lucide-react";
import { format, isToday, isThisWeek } from "date-fns";

/* ── helpers ───────────────────────────────────────────────────── */
function msgCount(transcript: string | null | undefined): number {
  if (!transcript) return 0;
  try { return JSON.parse(transcript).length; } catch { return 0; }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    "in progress": "bg-yellow-100 text-yellow-700",
    quoted: "bg-purple-100 text-purple-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

/* ── transcript bubbles ────────────────────────────────────────── */
function Transcript({ transcript }: { transcript: string }) {
  let messages: Array<{ role: string; content: string }> = [];
  try { messages = JSON.parse(transcript); } catch {
    return <p className="text-xs text-muted-foreground">Invalid transcript</p>;
  }
  return (
    <div className="max-h-80 overflow-y-auto space-y-2 bg-gray-50 rounded-xl p-3">
      {messages.map((msg, i) => {
        const isUser = msg.role === "user";
        return (
          <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
              isUser
                ? "bg-[#1B2B5E] text-white rounded-br-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
            }`}>
              {!isUser && (
                <div className="flex items-center gap-1 mb-0.5">
                  <Bot className="h-3 w-3 text-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Clark</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── conversation card ─────────────────────────────────────────── */
function ConvCard({ quote }: { quote: any }) {
  const [open, setOpen] = useState(false);
  const msgs = msgCount(quote.clarkTranscript);
  const date = quote.createdAt ? new Date(quote.createdAt) : null;

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/5 transition-colors text-left">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B2B5E] to-[#e63329] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{quote.name?.[0]?.toUpperCase() ?? "?"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{quote.name}</span>
            <StatusBadge status={quote.status} />
            {date && isToday(date) && (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">Today</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{quote.email}</span>
            {quote.productType && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{quote.productType}</span>}
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{msgs} messages</span>
            {date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(date, "MMM d, yyyy · h:mm a")}</span>}
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t px-4 py-4 space-y-4 bg-muted/5">
          {/* Visitor info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label: "Quote ID",   value: `#${quote.id}` },
              { label: "Quantity",   value: quote.quantity  || "—" },
              { label: "Dimensions", value: quote.dimensions || "—" },
              { label: "Material",   value: quote.material  || "—" },
            ].map(f => (
              <div key={f.label} className="bg-white border rounded-lg p-2.5">
                <div className="text-muted-foreground mb-0.5">{f.label}</div>
                <div className="font-medium">{f.value}</div>
              </div>
            ))}
          </div>

          {/* IP / Location strip */}
          {(quote.clarkIp || quote.clarkCountry || quote.clarkCity) && (
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-400 uppercase tracking-wide mr-1">Visitor</span>
              {quote.clarkIp && (
                <span className="flex items-center gap-1">
                  <Monitor className="h-3 w-3 text-slate-400" />
                  <span className="font-mono">{quote.clarkIp}</span>
                </span>
              )}
              {quote.clarkCountry && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-slate-400" />
                  {quote.clarkCountry}
                </span>
              )}
              {quote.clarkCity && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {quote.clarkCity}
                </span>
              )}
            </div>
          )}

          {quote.clarkTranscript
            ? <Transcript transcript={quote.clarkTranscript} />
            : <p className="text-sm text-muted-foreground italic">No transcript saved yet.</p>
          }
        </div>
      )}
    </div>
  );
}

/* ── main page ─────────────────────────────────────────────────── */
export default function ClarkPage() {
  const { data: allQuotes = [], isLoading } = useListQuotes();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const clarkLeads = useMemo(
    () => (allQuotes as any[]).filter(q => q.source === "clark"),
    [allQuotes]
  );

  const today  = clarkLeads.filter(q => q.createdAt && isToday(new Date(q.createdAt)));
  const week   = clarkLeads.filter(q => q.createdAt && isThisWeek(new Date(q.createdAt)));
  const newOnes = clarkLeads.filter(q => q.status === "new");

  const filtered = useMemo(() => {
    let list = clarkLeads;
    if (statusFilter !== "all") list = list.filter(q => q.status === statusFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(q =>
        q.name?.toLowerCase().includes(s) ||
        q.email?.toLowerCase().includes(s) ||
        q.productType?.toLowerCase().includes(s)
      );
    }
    return list.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [clarkLeads, statusFilter, search]);

  return (
    <AdminLayout title="Clark AI Conversations">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Hash,         label: "Total Leads",     value: clarkLeads.length, color: "from-[#1B2B5E] to-[#2d4a9e]" },
          { icon: Users,        label: "New (unhandled)", value: newOnes.length,    color: "from-amber-500 to-orange-500" },
          { icon: MessageSquare,label: "This Week",        value: week.length,       color: "from-purple-500 to-indigo-500" },
          { icon: Bot,          label: "Today",            value: today.length,      color: "from-emerald-500 to-teal-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-none">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name, email, or product…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-input px-3 text-sm focus:outline-none bg-background">
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="in progress">In Progress</option>
          <option value="quoted">Quoted</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} conversation{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed rounded-2xl">
          <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {clarkLeads.length === 0
              ? "No Clark conversations yet — they'll appear here once customers start chatting."
              : "No conversations match your filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q: any) => <ConvCard key={q.id} quote={q} />)}
        </div>
      )}
    </AdminLayout>
  );
}
