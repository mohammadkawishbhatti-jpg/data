import { useState, useMemo } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  getListClarkConversationsQueryKey,
  useListClarkConversations,
  type ClarkConversation,
} from "@workspace/api-client-react";
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
function ConvCard({ conversation }: { conversation: ClarkConversation }) {
  const [open, setOpen] = useState(false);
  const quote = conversation.quote;
  const msgs = msgCount(conversation.transcript);
  const date = conversation.lastActivity ? new Date(conversation.lastActivity) : null;
  const displayName = quote?.name || "Anonymous visitor";
  const displayEmail = quote?.email || "Email not provided";

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/5 transition-colors text-left">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B2B5E] to-[#e63329] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">{displayName[0]?.toUpperCase() ?? "?"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{displayName}</span>
            <StatusBadge status={quote?.status ?? "chat"} />
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
              quote ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}>
              {quote ? "Quote created" : "Chat only"}
            </span>
            {date && isToday(date) && (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">Today</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{displayEmail}</span>
            {quote?.productType && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{quote.productType}</span>}
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{msgs} messages</span>
            {date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(date, "MMM d, yyyy · h:mm a")}</span>}
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t px-4 py-4 space-y-4 bg-muted/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {[
              { label: "Quote ID", value: quote ? `#${quote.id}` : "Not created" },
              { label: "Box style", value: quote?.productType || "—" },
              { label: "Quantity", value: quote?.quantity || "—" },
              { label: "Dimensions", value: quote?.dimensions || "—" },
              { label: "Material", value: quote?.material || "—" },
              { label: "Print / finish", value: quote?.printingDetails || "—" },
            ].map(f => (
              <div key={f.label} className="bg-white border rounded-lg p-2.5">
                <div className="text-muted-foreground mb-0.5">{f.label}</div>
                <div className="font-medium">{f.value}</div>
              </div>
            ))}
          </div>

          {(conversation.ip || conversation.country || conversation.city) && (
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-400 uppercase tracking-wide mr-1">Visitor</span>
              {conversation.ip && (
                <span className="flex items-center gap-1">
                  <Monitor className="h-3 w-3 text-slate-400" />
                  <span className="font-mono">{conversation.ip}</span>
                </span>
              )}
              {conversation.country && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-slate-400" />
                  {conversation.country}
                </span>
              )}
              {conversation.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {conversation.city}
                </span>
              )}
            </div>
          )}

          {quote?.additionalNotes && (
            <div className="rounded-xl border bg-white px-3 py-2 text-xs">
              <div className="mb-1 font-semibold uppercase tracking-wide text-muted-foreground">Customer details captured</div>
              <p className="whitespace-pre-wrap text-slate-700">{quote.additionalNotes}</p>
            </div>
          )}

          {conversation.transcript
            ? <Transcript transcript={conversation.transcript} />
            : <p className="text-sm text-muted-foreground italic">No transcript saved yet.</p>
          }
        </div>
      )}
    </div>
  );
}

/* ── main page ─────────────────────────────────────────────────── */
export default function ClarkPage() {
  const { data: conversations = [], isLoading } = useListClarkConversations({
    query: {
      queryKey: getListClarkConversationsQueryKey(),
      refetchInterval: 30_000,
    },
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const quoteLeads = conversations.filter(conversation => Boolean(conversation.quote));
  const today  = conversations.filter(conversation => isToday(new Date(conversation.lastActivity)));
  const week   = conversations.filter(conversation => isThisWeek(new Date(conversation.lastActivity)));
  const newOnes = quoteLeads.filter(conversation => conversation.quote?.status === "new");

  const filtered = useMemo(() => {
    let list = [...conversations];
    if (statusFilter === "chat-only") list = list.filter(conversation => !conversation.quote);
    else if (statusFilter === "quote") list = list.filter(conversation => Boolean(conversation.quote));
    else if (statusFilter !== "all") {
      list = list.filter(conversation => conversation.quote?.status === statusFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(conversation => {
        const quote = conversation.quote;
        return Boolean(
          quote?.name?.toLowerCase().includes(s) ||
          quote?.email?.toLowerCase().includes(s) ||
          quote?.productType?.toLowerCase().includes(s) ||
          conversation.transcript.toLowerCase().includes(s)
        );
      });
    }
    return list.sort((a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }, [conversations, statusFilter, search]);

  return (
    <AdminLayout title="Clark AI Conversations">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Hash,         label: "Total Conversations", value: conversations.length, color: "from-[#1B2B5E] to-[#2d4a9e]" },
          { icon: Users,        label: "Quote Leads",     value: quoteLeads.length,    color: "from-emerald-500 to-teal-500" },
          { icon: Users,        label: "New (unhandled)", value: newOnes.length,    color: "from-amber-500 to-orange-500" },
          { icon: MessageSquare,label: "This Week",        value: week.length,       color: "from-purple-500 to-indigo-500" },
          { icon: Bot,          label: "Today",            value: today.length,      color: "from-sky-500 to-blue-500" },
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
          <option value="chat-only">Chat only</option>
          <option value="quote">Quote created</option>
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
            {conversations.length === 0
              ? "No Clark conversations yet — they'll appear here once customers start chatting."
              : "No conversations match your filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(conversation => <ConvCard key={conversation.id} conversation={conversation} />)}
        </div>
      )}
    </AdminLayout>
  );
}
