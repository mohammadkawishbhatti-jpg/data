import { useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "../components/layout/AdminLayout";
import { 
  useListQuotes,
  useUpdateQuoteStatus,
  getListQuotesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Calendar, FileEdit, Bot, ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { StatusBadge } from "../components/ui/StatusBadge";
import { format } from "date-fns";

/* ── Chat transcript viewer ────────────────────────────────────── */
function ClarkTranscript({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false);

  let messages: Array<{ role: string; content: string }> = [];
  try { messages = JSON.parse(transcript); } catch { return null; }
  if (!messages.length) return null;

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-800">Clark Chat Transcript</span>
          <span className="text-xs text-indigo-500 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-indigo-500" /> : <ChevronDown className="h-4 w-4 text-indigo-500" />}
      </button>

      {open && (
        <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 space-y-3">
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-[#1B2B5E] text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                }`}>
                  {!isUser && (
                    <div className="flex items-center gap-1 mb-1">
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
      )}
    </div>
  );
}

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

const TABS = ["All", "New", "In Progress", "Quoted", "Won", "Lost", "Clark AI"];

export default function QuotesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All");
  const [viewQuote, setViewQuote] = useState<any | null>(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpMsg, setFollowUpMsg] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyStatus, setReplyStatus] = useState<"idle"|"sent"|"error">("idle");
  const [replyError, setReplyError] = useState("");

  // Use the listQuotes hook
  const { data: quotes = [], isLoading } = useListQuotes();

  const updateStatus = useUpdateQuoteStatus();

  const filteredQuotes = activeTab === "All"
    ? quotes
    : activeTab === "Clark AI"
    ? quotes.filter((q: any) => q.source === "clark")
    : quotes.filter(q => q.status.toLowerCase() === activeTab.toLowerCase());

  const handleStatusChange = (newStatus: string) => {
    if (!viewQuote) return;
    updateStatus.mutate({ id: viewQuote.id, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        setViewQuote({ ...viewQuote, status: newStatus });
      }
    });
  };

  const openQuote = (q: any) => {
    setViewQuote(q);
    setFollowUpDate(q.followUpDate ? q.followUpDate.slice(0,10) : "");
    setFollowUpNotes(q.followUpNotes || "");
    setFollowUpMsg("");
    setReplyText("");
    setReplyStatus("idle");
    setReplyError("");
  };

  const sendReply = async () => {
    if (!viewQuote || !replyText.trim()) return;
    setSendingReply(true); setReplyStatus("idle"); setReplyError("");
    try {
      const r = await fetch(`${API}/admin/quotes/${viewQuote.id}/reply`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (r.ok) {
        setReplyStatus("sent");
        setReplyText("");
        // Refresh to pick up updated notes
        queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        setTimeout(() => setReplyStatus("idle"), 4000);
      } else {
        const data = await r.json();
        setReplyStatus("error");
        setReplyError(data.error ?? "Failed to send");
      }
    } catch {
      setReplyStatus("error");
      setReplyError("Network error");
    } finally { setSendingReply(false); }
  };

  const saveFollowUp = async () => {
    if (!viewQuote) return;
    setSavingFollowUp(true); setFollowUpMsg("");
    try {
      const r = await fetch(`${API}/admin/quotes/${viewQuote.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: followUpDate || null, followUpNotes }),
      });
      if (r.ok) {
        const updated = await r.json();
        setViewQuote({ ...viewQuote, followUpDate: updated.followUpDate, followUpNotes: updated.followUpNotes });
        queryClient.invalidateQueries({ queryKey: getListQuotesQueryKey() });
        setFollowUpMsg("✓ Saved");
        setTimeout(() => setFollowUpMsg(""), 2000);
      } else { setFollowUpMsg("❌ Error saving"); }
    } finally { setSavingFollowUp(false); }
  };

  return (
    <AdminLayout title="Quotes">
      <div className="mb-6 flex items-end justify-between border-b">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <Link href="/quote-builder" className="mb-2 inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <FileEdit className="h-4 w-4" /> Build Quote
        </Link>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filteredQuotes.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No quotes found for this filter.</td></tr>
              ) : (
                filteredQuotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-muted/5 transition-colors cursor-pointer" onClick={() => openQuote(quote)}>
                    <td className="px-4 py-3 text-muted-foreground">#{quote.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {quote.name}
                        {(quote as any).source === "clark" && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-1.5 py-0.5 leading-none">
                            <Bot className="w-2.5 h-2.5" /> Clark
                          </span>
                        )}
                      </div>
                      {quote.company && <div className="text-xs text-muted-foreground font-normal">{quote.company}</div>}
                    </td>
                    <td className="px-4 py-3">{quote.email}</td>
                    <td className="px-4 py-3">{quote.productType}</td>
                    <td className="px-4 py-3">{quote.quantity}</td>
                    <td className="px-4 py-3"><StatusBadge status={quote.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {format(new Date(String(quote.createdAt)), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!viewQuote} onClose={() => setViewQuote(null)} title={`Quote Request #${viewQuote?.id}`}>
        {viewQuote && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between bg-muted/20 p-4 rounded-lg border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                <StatusBadge status={viewQuote.status} />
              </div>
              <div>
                <label className="text-sm font-medium mr-2">Update to:</label>
                <select 
                  className="h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none bg-background"
                  value={viewQuote.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updateStatus.isPending}
                >
                  <option value="new">New</option>
                  <option value="in progress">In Progress</option>
                  <option value="quoted">Quoted</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Customer</p>
                <p className="font-medium">{viewQuote.name}</p>
                {viewQuote.company && <p>{viewQuote.company}</p>}
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Contact</p>
                <p><a href={`mailto:${viewQuote.email}`} className="text-primary hover:underline">{viewQuote.email}</a></p>
                <p>{viewQuote.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Product Details</p>
                <p className="font-medium">{viewQuote.productType}</p>
                <p>Quantity: {viewQuote.quantity}</p>
                {viewQuote.dimensions && <p>Size: {viewQuote.dimensions}</p>}
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Submitted On</p>
                <p>{format(new Date(viewQuote.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </div>

            {/* Clark transcript — shown instead of generic message for Clark leads */}
            {viewQuote.source === "clark" && viewQuote.clarkTranscript ? (
              <ClarkTranscript transcript={viewQuote.clarkTranscript} />
            ) : viewQuote.message ? (
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Additional Message</p>
                <div className="bg-muted/10 p-4 rounded-md border text-sm whitespace-pre-wrap">
                  {viewQuote.message}
                </div>
              </div>
            ) : null}

            {/* Reply to customer — Clark leads only */}
            {viewQuote.source === "clark" && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/10 px-4 py-3 flex items-center gap-2 border-b">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Reply to Customer</span>
                  <span className="text-xs text-muted-foreground ml-1">→ sends email to {viewQuote.email}</span>
                </div>
                <div className="p-4 space-y-3">
                  {replyStatus === "sent" && (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> Email sent to {viewQuote.email}
                    </div>
                  )}
                  {replyStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" /> {replyError}
                    </div>
                  )}
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={4}
                    placeholder={`Write your reply to ${viewQuote.name}…`}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Reply will be logged in the notes as a paper trail.</p>
                    <button
                      type="button"
                      onClick={sendReply}
                      disabled={sendingReply || !replyText.trim()}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {sendingReply ? "Sending…" : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm">Follow-Up</p>
                {followUpMsg && <span className={`text-xs ml-auto font-medium px-2 py-0.5 rounded ${followUpMsg.startsWith("✓") ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>{followUpMsg}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Follow-Up Date</label>
                  <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Notes</label>
                  <textarea value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="What to follow up on..." />
                </div>
              </div>
              <button onClick={saveFollowUp} disabled={savingFollowUp} className="mt-2 flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/20 disabled:opacity-50">
                <FileEdit className="h-3.5 w-3.5" /> {savingFollowUp ? "Saving..." : "Save Follow-Up"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
