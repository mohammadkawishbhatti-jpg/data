import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const DISMISSED_PREFIX = "prime-promotion-dismissed:";

function getDismissKey(signature: string) {
  return `${DISMISSED_PREFIX}${encodeURIComponent(signature)}`;
}

export function PromotionPopup() {
  const settings = useSettings();
  const [open, setOpen] = useState(false);

  const content = useMemo(() => ({
    enabled: settings.popupEnabled !== "false",
    badge: settings.popupBadge?.trim() || "Limited-time offer",
    title: settings.popupTitle?.trim() || "Make your next unboxing unforgettable",
    message: settings.popupMessage?.trim() || "Get free design support and a fast custom packaging quote from our team.",
    buttonText: settings.popupButtonText?.trim() || "Get a free quote",
    buttonUrl: settings.popupButtonUrl?.trim() || "/get-a-quote",
    imageUrl: settings.popupImageUrl?.trim() || "",
  }), [settings]);

  const signature = `${content.badge}|${content.title}|${content.message}|${content.buttonText}|${content.buttonUrl}|${content.imageUrl}`;

  useEffect(() => {
    if (!content.enabled || !content.title || typeof window === "undefined") return;
    const key = getDismissKey(signature);
    try {
      if (window.localStorage.getItem(key) === "1") return;
    } catch {
      // Private browsing can block localStorage; the popup still works for this visit.
    }
    const timer = window.setTimeout(() => setOpen(true), 1400);
    return () => window.clearTimeout(timer);
  }, [content.enabled, content.title, signature]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(getDismissKey(signature), "1");
    } catch {
      // Ignore storage restrictions after closing the modal.
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#07152c]/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-popup-title"
        aria-describedby="promotion-popup-message"
        className="relative grid w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_90px_rgba(7,21,44,0.35)] md:grid-cols-[0.85fr_1.15fr]"
      >
        {content.imageUrl && (
          <div className="hidden min-h-[300px] bg-[#eaf0f8] md:block">
            <img src={content.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className={`relative p-7 sm:p-9 ${content.imageUrl ? "md:col-start-2" : "md:col-span-2"}`}>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close promotion"
            autoFocus
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#1B2B5E] focus:outline-none focus:ring-2 focus:ring-[#e63329]"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e63329]/10 text-[#e63329]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="mb-3 inline-flex rounded-full bg-[#e63329]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e63329]">
            {content.badge}
          </div>
          <h2 id="promotion-popup-title" className="max-w-md text-2xl font-extrabold leading-tight text-[#1B2B5E] sm:text-3xl">
            {content.title}
          </h2>
          <p id="promotion-popup-message" className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            {content.message}
          </p>
          <a
            href={content.buttonUrl}
            onClick={dismiss}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#e63329] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(230,51,41,0.25)] transition hover:bg-[#c42a21] focus:outline-none focus:ring-2 focus:ring-[#1B2B5E] focus:ring-offset-2"
          >
            {content.buttonText}
            <ArrowRight className="h-4 w-4" />
          </a>
          <button type="button" onClick={dismiss} className="ml-4 text-xs font-semibold text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}