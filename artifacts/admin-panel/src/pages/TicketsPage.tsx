import { useEffect, useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Loader2, MessageSquare, RefreshCcw, Send, X } from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

type Ticket = {
  id: number;
  referenceNumber: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/admin/support-tickets`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load support tickets");
      setTickets(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (ticket: Ticket) => {
    setSelected(ticket);
    const response = await fetch(`${API}/admin/support-tickets/${ticket.id}`, { credentials: "include" });
    const result = await response.json();
    if (response.ok) setMessages(result.messages || []);
  };

  useEffect(() => { void loadTickets(); }, []);

  const sendReply = async () => {
    if (!selected || reply.trim().length < 1) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API}/admin/support-tickets/${selected.id}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send reply");
      setMessages((current) => [...current, result]);
      setReply("");
      await loadTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reply");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(`${API}/admin/support-tickets/${selected.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Unable to update ticket");
      const updated = await response.json();
      setSelected(updated);
      setTickets((current) => current.map((ticket) => ticket.id === updated.id ? updated : ticket));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update ticket");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Support Tickets">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">Customer claims and support conversations with email replies.</p>
        </div>
        <button data-testid="button-refresh-tickets" onClick={() => void loadTickets()} className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-muted">
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      </div>
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? <div className="p-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div> : tickets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No support tickets yet.</div>
          ) : (
            <div className="divide-y">
              {tickets.map((ticket) => (
                <button data-testid={`ticket-row-${ticket.id}`} key={ticket.id} onClick={() => void openTicket(ticket)} className={`w-full text-left p-4 hover:bg-muted/50 ${selected?.id === ticket.id ? "bg-muted" : ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{ticket.referenceNumber}</span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{ticket.status}</span>
                  </div>
                  <p className="mt-1 font-medium truncate">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{ticket.name} · {ticket.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border bg-card min-h-[520px]">
          {!selected ? (
            <div className="h-full min-h-[520px] flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <MessageSquare className="h-8 w-8 mb-3" />
              Select a ticket to view the conversation.
            </div>
          ) : (
            <div className="flex h-full min-h-[520px] flex-col">
              <div className="flex items-start justify-between gap-3 border-b p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{selected.referenceNumber}</p>
                  <h2 className="mt-1 font-bold">{selected.subject}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{selected.name} · {selected.email}</p>
                </div>
                <button data-testid="button-close-ticket" onClick={() => setSelected(null)} aria-label="Close ticket"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex gap-2 border-b p-4">
                {["open", "pending", "resolved", "closed"].map((status) => (
                  <button data-testid={`button-ticket-status-${status}`} key={status} disabled={saving} onClick={() => void setStatus(status)} className={`rounded-full px-3 py-1 text-xs font-semibold ${selected.status === status ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}>{status}</button>
                ))}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {messages.map((message) => (
                  <div key={message.id} className={`rounded-lg p-3 text-sm ${message.senderType === "admin" ? "ml-8 bg-primary/10" : "mr-8 bg-muted"}`}>
                    <p className="mb-1 text-xs font-bold text-muted-foreground">{message.senderType === "admin" ? "Admin reply" : "Customer message"}</p>
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                ))}
              </div>
              <div className="border-t p-4">
                <textarea data-testid="textarea-ticket-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={4} placeholder="Write a reply. It will be emailed to the customer." className="w-full resize-none rounded-lg border bg-background p-3 text-sm" />
                <button data-testid="button-send-ticket-reply" onClick={() => void sendReply()} disabled={saving || !reply.trim()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send email reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}