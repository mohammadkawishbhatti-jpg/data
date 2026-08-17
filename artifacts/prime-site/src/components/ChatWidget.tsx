import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  ts?: Date;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const GREETING: Message = {
  role: "assistant",
  ts: new Date(),
  content:
    "Hi there! 👋 Welcome to **Prime Packaging Boxes**! I'm Clark, your packaging specialist. How can I help you today?\n\nI can help with pricing, delivery timelines, custom samples, or start a quote for you.",
};

const QUICK_REPLIES = [
  { label: "💰 Prices",        text: "What are your pricing options?" },
  { label: "🚚 Delivery",      text: "What are your delivery times?" },
  { label: "📦 Samples",       text: "Can I get a free sample?" },
  { label: "🎨 Design help",   text: "Do you offer design support?" },
  { label: "📋 Get a quote",   text: "I'd like to get a custom quote." },
  { label: "📍 Track Order",   text: "I want to track my order. Can you help?" },
];

function makeSessionId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fmtTime(d?: Date) {
  if (!d) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/* Bold + line-break renderer */
function Render({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(<strong key={i}>{part.slice(2, -2)}</strong>);
    } else {
      part.split("\n").forEach((line, j, arr) => {
        nodes.push(<span key={`${i}-${j}`}>{line}</span>);
        if (j < arr.length - 1) nodes.push(<br key={`${i}-br-${j}`} />);
      });
    }
  });
  return <>{nodes}</>;
}

/* Typing dots */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      {[0, 150, 300].map(d => (
        <span
          key={d}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>(makeSessionId());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text, ts: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const streamingMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages(prev => [...prev, streamingMsg]);

    abortRef.current = new AbortController();

    try {
      const resp = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId: sessionIdRef.current,
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok || !resp.body) throw new Error("Network error");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      const msgTs = new Date();
      let streamFinished = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.streaming) updated[updated.length - 1] = { ...last, content: fullContent };
                return updated;
              });
            }
            if (data.done) {
              streamFinished = true;
              if (data.interrupted) {
                const interruption = fullContent
                  ? `${fullContent}\n\nClark's response was interrupted. Please try again, or call us at 818-758-4076 or email help@primepackagingboxes.com.`
                  : "Clark's response was interrupted. Please try again, or call us at 818-758-4076 or email help@primepackagingboxes.com.";
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.streaming) updated[updated.length - 1] = { role: "assistant", content: interruption, ts: msgTs };
                  return updated;
                });
              } else {
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.streaming)
                    updated[updated.length - 1] = { role: "assistant", content: fullContent || last.content, ts: msgTs };
                  return updated;
                });
              }
              if (!open) setUnread(u => u + 1);
            }
          } catch { /* skip malformed */ }
        }
      }
      if (!streamFinished) throw new Error("Chat stream ended before completion");
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.streaming)
          updated[updated.length - 1] = {
            role: "assistant",
            content: "I'm having a little trouble right now. Please call us at **818-758-4076** or email **help@primepackagingboxes.com** and we'll help right away! 😊",
            ts: new Date(),
          };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([{ ...GREETING, ts: new Date() }]);
    setInput("");
    setLoading(false);
    sessionIdRef.current = makeSessionId();
  };

  /* Show quick replies only if user hasn't sent any message yet */
  const showQuickReplies = messages.filter(m => m.role === "user").length === 0 && !loading;

  return (
    <>
      {/* ── Chat window ───────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-[88px] right-4 z-50 flex flex-col overflow-hidden"
          style={{
            width: "min(380px, calc(100vw - 24px))",
            height: "min(580px, calc(100vh - 116px))",
            borderRadius: 20,
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1B2B5E 0%, #233574 100%)" }}
          >
            {/* Avatar with online ring */}
            <div className="relative flex-shrink-0">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
                style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" opacity=".3"/>
                  <path d="M20 7H4l8-5 8 5z"/>
                  <rect x="9" y="12" width="6" height="4" rx="1" fill="white" opacity=".8"/>
                </svg>
              </div>
              <span
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                style={{ background: "#4ade80", borderColor: "#1B2B5E" }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Clark</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                Packaging specialist · Typically replies instantly
              </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={resetChat}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                title="New conversation"
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                title="Close"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto py-4 px-3 space-y-3"
            style={{ background: "#f8fafc" }}
          >
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}>
                  {/* Bot avatar (only on assistant messages) */}
                  {!isUser && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 text-white text-xs font-bold"
                      style={{ background: "#1B2B5E", flexShrink: 0 }}
                    >
                      C
                    </div>
                  )}

                  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
                    <div
                      className="px-3.5 py-2.5 text-sm leading-relaxed"
                      style={{
                        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isUser ? "#1B2B5E" : "#ffffff",
                        color: isUser ? "#ffffff" : "#1f2937",
                        border: isUser ? "none" : "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      {msg.streaming && msg.content === ""
                        ? <TypingDots />
                        : <Render text={msg.content} />
                      }
                    </div>
                    {msg.ts && !msg.streaming && (
                      <span className="text-[10px] mt-1 px-1" style={{ color: "#94a3b8" }}>
                        {fmtTime(msg.ts)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Quick reply chips */}
          {showQuickReplies && (
            <div
              className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 flex-shrink-0"
              style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}
            >
              {QUICK_REPLIES.map(qr => (
                <button
                  key={qr.label}
                  onClick={() => sendMessage(qr.text)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={{
                    background: "#fff",
                    border: "1.5px solid #cbd5e1",
                    color: "#334155",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#1B2B5E";
                    e.currentTarget.style.color = "#1B2B5E";
                    e.currentTarget.style.background = "#f0f4ff";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.color = "#334155";
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
            style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your message…"
              disabled={loading}
              className="flex-1 min-w-0 text-sm px-3.5 py-2.5 rounded-2xl outline-none transition-all"
              style={{
                background: "#f1f5f9",
                border: "1.5px solid transparent",
                color: "#111827",
              }}
              onFocus={e => (e.target.style.borderColor = "#1B2B5E")}
              onBlur={e => (e.target.style.borderColor = "transparent")}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: input.trim() && !loading ? "#1B2B5E" : "#e2e8f0",
                color: input.trim() && !loading ? "#fff" : "#94a3b8",
                transform: "scale(1)",
              }}
              onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.background = "#e63329"; }}
              onMouseLeave={e => { if (input.trim() && !loading) e.currentTarget.style.background = "#1B2B5E"; }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div
            className="text-center text-[10px] py-1.5 flex-shrink-0 flex items-center justify-center gap-1"
            style={{ background: "#ffffff", color: "#cbd5e1", borderTop: "1px solid #f1f5f9" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#cbd5e1">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Powered by Prime Packaging Boxes
          </div>
        </div>
      )}

      {/* ── Floating button ───────────────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-[88px] right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          background: open ? "#e63329" : "#1B2B5E",
          boxShadow: "0 8px 24px rgba(27,43,94,0.35)",
        }}
        aria-label="Chat with Clark"
      >
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10"
            style={{ background: "#e63329" }}
          >
            {unread}
          </span>
        )}

        {open ? (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white"/>
            <circle cx="9" cy="11" r="1.2" fill="#1B2B5E"/>
            <circle cx="12" cy="11" r="1.2" fill="#1B2B5E"/>
            <circle cx="15" cy="11" r="1.2" fill="#1B2B5E"/>
          </svg>
        )}

        {/* Pulse ring when closed */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: "#1B2B5E" }}
          />
        )}
      </button>
    </>
  );
}
