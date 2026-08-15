import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import DOMPurify from "dompurify";

// Safe HTML renderer — strips scripts/event-handlers before rendering
function safeHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "javascript"],
  });
}
// CSS is admin-only input — allow style tags as-is (trusted source)
function safeCss(raw: string | null | undefined): string {
  return raw || "";
}
// Block javascript: and data: URLs in href/src attributes
function safeUrl(raw: string | null | undefined): string {
  if (!raw) return "#";
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:text/html") || trimmed.startsWith("vbscript:")) return "#";
  return raw;
}

// ── Interactive sub-components for Puck blocks ─────────────────────────────

function PuckCountdown({ targetDate, labelDays, labelHours, labelMins, labelSecs, numberColor, labelColor, boxBg, boxRadius }: any) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const end = new Date(targetDate).getTime();
    const tick = () => setDiff(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = [{ v: days, l: labelDays || "Days" }, { v: hours, l: labelHours || "Hours" }, { v: mins, l: labelMins || "Mins" }, { v: secs, l: labelSecs || "Secs" }];
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      {parts.map(({ v, l }) => (
        <div key={l} style={{ background: boxBg || "#fff", borderRadius: boxRadius ?? 10, padding: "16px 20px", minWidth: 72, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: numberColor || "#1a2f5a", lineHeight: 1 }}>{pad(v)}</div>
          <div style={{ fontSize: 11, color: labelColor || "#64748b", fontWeight: 600, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function PuckAccordion({ heading, items, openFirst, iconColor, borderColor, headingColor, answerColor, headingBg }: any) {
  const [open, setOpen] = useState<number | null>(openFirst ? 0 : null);
  return (
    <div>
      {heading && <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1a2f5a", textAlign: "center", marginBottom: 32 }}>{heading}</h2>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(items || []).map((item: any, i: number) => (
          <div key={i} style={{ border: `1px solid ${borderColor || "#e2e8f0"}`, borderRadius: 10, overflow: "hidden" }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: open === i ? (headingBg || "#f8fafc") : "#fff", cursor: "pointer", border: "none", textAlign: "left" }}>
              <span style={{ fontWeight: 600, color: headingColor || "#1a2f5a", fontSize: 15 }}>{item.question}</span>
              <span style={{ color: iconColor || "#f97316", fontSize: 20, flexShrink: 0, marginLeft: 12, lineHeight: 1 }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div style={{ padding: "14px 20px", color: answerColor || "#64748b", fontSize: 14, lineHeight: 1.7, borderTop: `1px solid ${borderColor || "#e2e8f0"}` }}>{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PuckTabs({ tabs, accentColor, tabBg, activeBg, tabRadius, zoneContent }: any) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
        {(tabs || []).map((tab: any, i: number) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ padding: "8px 18px", borderRadius: tabRadius ?? 6, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", background: active === i ? (activeBg || accentColor || "#1a2f5a") : (tabBg || "#f1f5f9"), color: active === i ? "#fff" : (accentColor || "#1a2f5a"), transition: "all 0.2s" }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "20px 0" }}>{zoneContent(`tab-${active}`)}</div>
    </div>
  );
}

interface Block {
  id: string;
  type: string;
  data: Record<string, any>;
  hidden?: boolean;
  columns?: any[];
}

function HeroBlock({ d }: { d: any }) {
  return (
    <div className="py-20 px-4 text-center" style={{ background: d.bgColor || "#1a2f5a", color: d.textColor || "#ffffff" }}>
      <div className="max-w-3xl mx-auto">
        {d.heading && <h1 className="text-4xl md:text-5xl font-bold mb-4">{d.heading}</h1>}
        {d.subheading && <p className="text-lg opacity-80 mb-8">{d.subheading}</p>}
        {d.buttonText && d.buttonLink && (
          <Link href={safeUrl(d.buttonLink)} className="inline-block bg-[#e63329] text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">{d.buttonText}</Link>
        )}
      </div>
    </div>
  );
}

function TextBlock({ d }: { d: any }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className={`prose max-w-none ${d.align === "center" ? "text-center" : d.align === "right" ? "text-right" : ""}`} dangerouslySetInnerHTML={{ __html: safeHtml(d.content) }} />
    </div>
  );
}

function ImageTextBlock({ d }: { d: any }) {
  const reversed = d.imagePosition === "left";
  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className={`grid md:grid-cols-2 gap-10 items-center ${reversed ? "direction-rtl" : ""}`}>
        <div className={reversed ? "order-2" : ""}>
          <h2 className="text-3xl font-bold text-[#1a2f5a] mb-4">{d.heading}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{d.text}</p>
          {d.buttonText && d.buttonLink && (
            <Link href={safeUrl(d.buttonLink)} className="inline-block bg-[#1a2f5a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1a2f5a]/90 transition-colors">{d.buttonText}</Link>
          )}
        </div>
        <div className={reversed ? "order-1" : ""}>
          {d.imageUrl ? (
            <img src={d.imageUrl} alt={d.heading} className="w-full rounded-xl shadow-lg" loading="lazy" decoding="async" />
          ) : (
            <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-4xl">🖼️</div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturesBlock({ d }: { d: any }) {
  return (
    <div className="bg-gray-50 py-14">
      <div className="max-w-6xl mx-auto px-4">
        {d.heading && <h2 className="text-3xl font-bold text-[#1a2f5a] text-center mb-10">{d.heading}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(d.items || []).map((item: any, i: number) => (
            <div key={i} className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-[#1a2f5a] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CtaBlock({ d }: { d: any }) {
  return (
    <div className="py-14 text-center px-4" style={{ background: d.bgColor || "#e63329" }}>
      <div className="max-w-3xl mx-auto text-white">
        <h2 className="text-3xl font-bold mb-3">{d.heading}</h2>
        {d.text && <p className="text-white/80 mb-7">{d.text}</p>}
        {d.buttonText && d.buttonLink && (
          <Link href={safeUrl(d.buttonLink)} className="inline-block bg-white text-[#e63329] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">{d.buttonText}</Link>
        )}
      </div>
    </div>
  );
}

function FaqBlock({ d }: { d: any }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      {d.heading && <h2 className="text-3xl font-bold text-[#1a2f5a] text-center mb-10">{d.heading}</h2>}
      <div className="space-y-4">
        {(d.items || []).map((item: any, i: number) => (
          <details key={i} className="border rounded-xl overflow-hidden group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#1a2f5a] hover:bg-gray-50">
              {item.question}
              <span className="text-xl">+</span>
            </summary>
            <div className="px-5 py-4 text-gray-600 border-t bg-gray-50">{item.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

function StatsBlock({ d }: { d: any }) {
  return (
    <div className="bg-[#1a2f5a] text-white py-12">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {(d.items || []).map((item: any, i: number) => (
          <div key={i}>
            <div className="text-4xl font-extrabold text-[#e63329] mb-1">{item.number}</div>
            <div className="text-sm text-blue-200 uppercase tracking-wide">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsBlock({ d }: { d: any }) {
  return (
    <div className="bg-gray-50 py-14">
      <div className="max-w-6xl mx-auto px-4">
        {d.heading && <h2 className="text-3xl font-bold text-[#1a2f5a] text-center mb-10">{d.heading}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(d.items || []).map((item: any, i: number) => (
            <div key={i} className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex text-yellow-400 mb-3">{"★".repeat(item.rating || 5)}</div>
              <p className="text-gray-700 italic mb-4">"{item.text}"</p>
              <div className="font-semibold text-[#1a2f5a]">{item.name}</div>
              {item.company && <div className="text-sm text-gray-500">{item.company}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColumnsBlock({ d }: { d: any }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml(d.col1) }} />
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml(d.col2) }} />
      </div>
    </div>
  );
}

/** Renders a single block inline — used for nested section columns */
function InlineBlock({ block }: { block: Block }) {
  const d = block.data;
  if (block.hidden) return null;
  switch (block.type) {
    case "hero": case "hero_banner": return <HeroBlock d={d} />;
    case "text": case "text_block": return <TextBlock d={d} />;
    case "image_text": return <ImageTextBlock d={d} />;
    case "features":   return <FeaturesBlock d={d} />;
    case "cta": case "cta_banner": return <CtaBlock d={d} />;
    case "faq":          return <FaqBlock d={d} />;
    case "stats":        return <StatsBlock d={d} />;
    case "testimonials": return <TestimonialsBlock d={d} />;
    case "columns":      return <ColumnsBlock d={d} />;
    case "heading": {
      const Tag = (d.tag || d.headingTag || "h2") as React.ElementType;
      return <div style={{ textAlign: d.align || "left", padding: "12px 0" }}><Tag className="font-extrabold text-[#1a2f5a]" style={{ color: d.color || undefined }}>{d.heading || d.text || ""}</Tag></div>;
    }
    case "image": return d.url || d.src ? <img src={d.url || d.src} alt={d.alt || ""} className="w-full rounded-xl" loading="lazy" decoding="async" /> : null;
    case "button": return d.link ? <Link href={safeUrl(d.link)} className="inline-block bg-[#e63329] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors my-2">{d.text || "Learn More"}</Link> : null;
    case "spacer": return <div style={{ height: d.height || 24 }} />;
    case "divider": return <hr style={{ borderColor: d.color || "#e2e8f0", margin: "12px 0" }} />;
    default: return null;
  }
}

// ─── Puck JSON renderer (no @puckeditor/core dependency) ─────────────────

function renderPuckItem(item: any, zones: Record<string, any[]>): React.ReactNode {
  const p = item.props || {};
  const id = p.id || item.type;
  const zoneContent = (zone: string) =>
    (zones[`${id}:${zone}`] || []).map((child: any) => renderPuckItem(child, zones));

  switch (item.type) {

    // ── Layout ────────────────────────────────────────────────────────────

    case "Hero":
      return (
        <div key={id} style={{ background: p.bgImage ? `url(${p.bgImage}) center/cover no-repeat` : p.background, color: p.textColor, paddingTop: p.paddingTop ?? 80, paddingBottom: p.paddingBottom ?? 80, minHeight: p.minHeight || undefined, display: "flex", alignItems: "center", position: "relative" }}>
          {p.bgImage && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />}
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: p.align ?? "center", position: "relative", width: "100%" }}>
            <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 20px", color: p.textColor }}>{p.heading}</h1>
            {p.subheading && <p style={{ fontSize: 18, lineHeight: 1.7, opacity: 0.88, marginBottom: 36, maxWidth: 680, ...(p.align === "center" ? { margin: "0 auto 36px" } : {}) }}>{p.subheading}</p>}
            <div style={{ display: "flex", gap: 16, justifyContent: p.align === "center" ? "center" : "flex-start", flexWrap: "wrap" }}>
              {p.ctaText  && <a href={safeUrl(p.ctaUrl)}  style={{ background: "#f97316", color: "#fff", padding: "14px 32px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 16 }}>{p.ctaText}</a>}
              {p.ctaText2 && <a href={safeUrl(p.ctaUrl2)} style={{ background: "transparent", color: p.textColor, padding: "14px 32px", borderRadius: 8, fontWeight: 600, textDecoration: "none", fontSize: 16, border: `2px solid ${p.textColor}` }}>{p.ctaText2}</a>}
            </div>
          </div>
        </div>
      );

    case "Section":
      return (
        <div key={id} style={{ background: p.bgImage ? `url(${p.bgImage}) center/${p.bgSize ?? "cover"} no-repeat` : p.background, paddingTop: p.paddingTop ?? 60, paddingBottom: p.paddingBottom ?? 60, position: "relative", width: "100%" }}>
          {p.bgOverlay && <div style={{ position: "absolute", inset: 0, background: p.bgOverlay, pointerEvents: "none" }} />}
          {p.customCss && <style dangerouslySetInnerHTML={{ __html: p.customCss }} />}
          <div style={{ maxWidth: p.maxWidth ?? "1200px", margin: "0 auto", padding: "0 20px", position: "relative" }}>
            {zoneContent("content")}
          </div>
        </div>
      );

    case "Container":
      return (
        <div key={id} style={{ display: "flex", justifyContent: p.align ?? "center" }}>
          {p.customCss && <style dangerouslySetInnerHTML={{ __html: p.customCss }} />}
          <div style={{ background: p.background ?? "#f8fafc", border: `${p.borderWidth ?? 1}px solid ${p.borderColor ?? "#e2e8f0"}`, borderRadius: p.borderRadius ?? 12, boxShadow: p.shadow ?? "none", paddingTop: p.paddingTop ?? 32, paddingBottom: p.paddingBottom ?? 32, paddingLeft: p.paddingH ?? 32, paddingRight: p.paddingH ?? 32, maxWidth: p.maxWidth ?? "100%", width: "100%", boxSizing: "border-box" as any }}>
            {zoneContent("content")}
          </div>
        </div>
      );

    case "Columns": {
      const count  = p.layout?.count ?? 2;
      const widths = (p.layout?.widths ?? Array(count).fill(1)).slice(0, count);
      const gridCols = widths.map((w: number) => `${w}fr`).join(" ");
      return (
        <div key={id} style={{ display: "grid", gridTemplateColumns: gridCols, gap: p.gap ?? 24, alignItems: p.alignItems ?? "flex-start" }}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i}>{zoneContent(`col-${i + 1}`)}</div>
          ))}
        </div>
      );
    }

    case "TwoColumns": {
      const splits: Record<string, string> = { "1fr 1fr": "1fr 1fr", "3fr 2fr": "3fr 2fr", "2fr 3fr": "2fr 3fr", "2fr 1fr": "2fr 1fr", "1fr 2fr": "1fr 2fr" };
      return (
        <div key={id} style={{ display: "grid", gridTemplateColumns: splits[p.split] ?? "1fr 1fr", gap: p.gap ?? 32, alignItems: p.alignItems ?? "flex-start" }}>
          <div>{zoneContent("col-1")}</div>
          <div>{zoneContent("col-2")}</div>
        </div>
      );
    }

    case "ThreeColumns":
      return (
        <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: p.gap ?? 24, alignItems: p.alignItems ?? "flex-start" }}>
          <div>{zoneContent("col-1")}</div>
          <div>{zoneContent("col-2")}</div>
          <div>{zoneContent("col-3")}</div>
        </div>
      );

    // ── Basic ──────────────────────────────────────────────────────────────

    case "Heading": {
      const Tag = (p.tag ?? "h2") as any;
      return <Tag key={id} style={{ fontSize: p.fontSize, fontWeight: p.fontWeight, color: p.color, textAlign: p.align, lineHeight: p.lineHeight ?? 1.2, letterSpacing: p.letterSpacing ?? 0, margin: `0 0 ${p.marginBottom ?? 16}px`, textTransform: p.textTransform ?? "none", textShadow: p.textShadow || "none" }}>{p.text}</Tag>;
    }

    case "Paragraph":
      return <p key={id} style={{ fontSize: p.fontSize ?? 16, color: p.color, textAlign: p.align, lineHeight: p.lineHeight ?? 1.7, fontWeight: p.fontWeight ?? "400", maxWidth: p.maxWidth ?? "100%", margin: `0 auto ${p.marginBottom ?? 16}px`, ...(p.align === "left" ? { marginLeft: 0 } : {}) }}>{p.text}</p>;

    case "List":
      return (
        <ul key={id} style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: p.gap ?? 12 }}>
          {(p.items ?? []).map((item: any, i: number) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: p.iconColor ?? "#16a34a", fontSize: (p.fontSize ?? 15) + 2, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              {item.link
                ? <a href={safeUrl(item.link)} style={{ color: p.textColor ?? "#374151", fontSize: p.fontSize ?? 15, fontWeight: p.fontWeight ?? "400", textDecoration: "underline" }}>{item.text}</a>
                : <span style={{ color: p.textColor ?? "#374151", fontSize: p.fontSize ?? 15, fontWeight: p.fontWeight ?? "400" }}>{item.text}</span>}
            </li>
          ))}
        </ul>
      );

    case "Button": {
      const padMap: Record<string, string> = { sm: "8px 18px", md: "12px 28px", lg: "16px 40px", xl: "20px 52px" };
      const fsMap: Record<string, number>  = { sm: 13, md: 15, lg: 17, xl: 19 };
      const pad = padMap[p.size ?? "md"] ?? "12px 28px";
      const fs  = fsMap[p.size ?? "md"]  ?? 15;
      return (
        <div key={id} style={{ display: "flex", justifyContent: p.align ?? "flex-start" }}>
          <a href={safeUrl(p.href)} target={p.target ?? "_self"} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: p.background, color: p.color, padding: pad, borderRadius: p.borderRadius ?? 8, fontWeight: 700, textDecoration: "none", fontSize: fs, width: p.fullWidth === "100%" ? "100%" : undefined, textAlign: "center", border: `2px solid ${p.borderColor ?? "transparent"}`, boxShadow: p.shadow ?? "none", boxSizing: "border-box" as any }}>
            {p.icon && <span style={{ fontSize: fs + 2 }}>{p.icon}</span>}{p.text}
          </a>
        </div>
      );
    }

    case "Icon": {
      const content = (
        <div style={{ display: "flex", justifyContent: p.align ?? "center" }}>
          <div style={{ fontSize: p.size ?? 48, lineHeight: 1, background: p.bgSize ? (p.bgColor ?? "transparent") : "transparent", width: p.bgSize || undefined, height: p.bgSize || undefined, borderRadius: p.radius ?? 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{p.icon ?? "⭐"}</div>
        </div>
      );
      return p.href ? <a key={id} href={safeUrl(p.href)} style={{ textDecoration: "none" }}>{content}</a> : <div key={id}>{content}</div>;
    }

    case "Divider":
      return (
        <div key={id} style={{ display: "flex", justifyContent: p.align ?? "center", padding: `${p.margin ?? 24}px 0` }}>
          <div style={{ width: `${p.width ?? 100}%`, borderTop: `${p.thickness ?? 1}px ${p.style ?? "solid"} ${p.color ?? "#e2e8f0"}` }} />
        </div>
      );

    case "Spacer":
      return <div key={id} style={{ height: p.height ?? 40 }} />;

    // ── Media ─────────────────────────────────────────────────────────────

    case "Image": {
      const img = <img src={p.src} alt={p.alt ?? ""} style={{ width: p.width ?? "100%", borderRadius: p.borderRadius ?? 0, display: "block", boxShadow: p.shadow ?? "none" }} loading="lazy" decoding="async" />;
      return (
        <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: p.align ?? "center" }}>
          {p.href ? <a href={safeUrl(p.href)} target={p.target ?? "_self"}>{img}</a> : img}
          {p.caption && <p style={{ fontSize: 13, color: "#64748b", marginTop: 8, textAlign: "center" }}>{p.caption}</p>}
        </div>
      );
    }

    case "Video": {
      const rawUrl = p.url ?? "";
      const embedUrl = rawUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/").replace("vimeo.com/", "player.vimeo.com/video/");
      return (
        <div key={id}>
          {p.title && <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1a2f5a", textAlign: "center", marginBottom: 16 }}>{p.title}</h3>}
          <div style={{ position: "relative", paddingBottom: p.aspectRatio ?? "56.25%", borderRadius: p.borderRadius ?? 8, overflow: "hidden", background: "#000", boxShadow: p.shadow ?? "none" }}>
            <iframe src={embedUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} frameBorder={0} allowFullScreen />
          </div>
        </div>
      );
    }

    case "Gallery":
      return (
        <div key={id} style={{ display: "grid", gridTemplateColumns: `repeat(${p.columns ?? 3}, 1fr)`, gap: p.gap ?? 12 }}>
          {(p.images ?? []).map((img: any, i: number) => (
            <div key={i} style={{ aspectRatio: p.aspectRatio === "auto" ? undefined : (p.aspectRatio ?? "4/3"), overflow: "hidden", borderRadius: p.borderRadius ?? 8 }}>
              <img src={img.src} alt={img.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      );

    case "Map": {
      const isUrl = (p.address ?? "").startsWith("http");
      const src = isUrl ? p.address : `https://maps.google.com/maps?q=${encodeURIComponent(p.address ?? "")}&z=${p.zoom ?? 14}&output=embed`;
      return (
        <div key={id} style={{ borderRadius: p.borderRadius ?? 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <iframe src={src} width="100%" height={p.height ?? 400} style={{ border: "none", display: "block" }} allowFullScreen loading="lazy" />
        </div>
      );
    }

    // ── Elements ──────────────────────────────────────────────────────────

    case "Counter":
      return (
        <div key={id} style={{ background: p.background ?? "transparent", borderRadius: p.borderRadius ?? 0, padding: p.padding ?? 20, textAlign: p.align ?? "center" }}>
          <div style={{ fontSize: p.fontSize ?? 56, fontWeight: 800, color: p.numberColor ?? "#f97316", lineHeight: 1 }}>{p.prefix}{p.number}{p.suffix}</div>
          {p.label && <div style={{ fontSize: 14, color: p.labelColor ?? "#64748b", fontWeight: 600, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.label}</div>}
        </div>
      );

    case "ProgressBar":
      return (
        <div key={id} style={{ display: "flex", flexDirection: "column", gap: p.gap ?? 16 }}>
          {(p.items ?? []).map((item: any, i: number) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: p.labelColor ?? "#374151" }}>{item.label}</span>
                {p.showPercent !== "no" && <span style={{ fontSize: 13, color: item.color ?? "#1a2f5a", fontWeight: 700 }}>{item.value}%</span>}
              </div>
              <div style={{ background: p.trackColor ?? "#e2e8f0", borderRadius: p.borderRadius ?? 6, height: p.barHeight ?? 12, overflow: "hidden" }}>
                <div style={{ width: `${item.value}%`, height: "100%", background: item.color ?? "#1a2f5a", borderRadius: p.borderRadius ?? 6 }} />
              </div>
            </div>
          ))}
        </div>
      );

    case "AlertBox": {
      const PRESETS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
        success: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", icon: "✅" },
        info:    { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "ℹ️" },
        warning: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", icon: "⚠️" },
        danger:  { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", icon: "❌" },
        custom:  { bg: p.bgColor ?? "#eff6ff", text: p.textColor ?? "#1e40af", border: p.borderColor ?? "#bfdbfe", icon: p.icon || "💡" },
      };
      const pr = PRESETS[p.type ?? "info"] ?? PRESETS.info;
      return (
        <div key={id} style={{ background: pr.bg, color: pr.text, border: `1px solid ${pr.border}`, borderRadius: p.borderRadius ?? 10, padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon || pr.icon}</span>
            <div>
              {p.title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.title}</div>}
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{p.message}</div>
            </div>
          </div>
        </div>
      );
    }

    case "Badge":
      return (
        <div key={id} style={{ display: "flex", justifyContent: p.align ?? "flex-start" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: p.background ?? "#fef3c7", color: p.color ?? "#92400e", fontSize: p.fontSize ?? 13, fontWeight: 700, padding: "4px 12px", borderRadius: p.borderRadius ?? 20, letterSpacing: "0.03em" }}>
            {p.icon && <span>{p.icon}</span>}{p.text}
          </span>
        </div>
      );

    case "CountdownTimer":
      return (
        <div key={id} style={{ textAlign: "center" }}>
          {p.heading && <h3 style={{ fontSize: 28, fontWeight: 800, color: p.textColor ?? "#1a2f5a", marginBottom: 8 }}>{p.heading}</h3>}
          {p.subtext && <p style={{ color: "#64748b", marginBottom: 24 }}>{p.subtext}</p>}
          <PuckCountdown targetDate={p.targetDate} labelDays={p.labelDays} labelHours={p.labelHours} labelMins={p.labelMins} labelSecs={p.labelSecs} numberColor={p.numberColor} labelColor={p.labelColor} boxBg={p.boxBg} boxRadius={p.boxRadius} />
        </div>
      );

    case "RawHtml":
      return <div key={id} className="prose prose-headings:text-[#1a2f5a] prose-headings:font-bold max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml(p.html) }} />;

    // ── Interactive ───────────────────────────────────────────────────────

    case "Accordion":
      return <PuckAccordion key={id} heading={p.heading} items={p.items} openFirst={p.openFirst} iconColor={p.iconColor} borderColor={p.borderColor} headingColor={p.headingColor} answerColor={p.answerColor} headingBg={p.headingBg} />;

    case "Tabs":
      return <PuckTabs key={id} tabs={p.tabs} accentColor={p.accentColor} tabBg={p.tabBg} activeBg={p.activeBg} tabRadius={p.tabRadius} zoneContent={zoneContent} />;

    case "FlipBox":
      return (
        <div key={id} style={{ height: p.height ?? 260, perspective: 1000 }} className="puck-flip">
          <style>{`.puck-flip:hover .puck-flip-inner{transform:rotateY(180deg)}.puck-flip-inner{transition:transform .6s;transform-style:preserve-3d;position:relative;width:100%;height:100%}.puck-flip-face{position:absolute;inset:0;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;border-radius:${p.borderRadius ?? 12}px}.puck-flip-back{transform:rotateY(180deg)}`}</style>
          <div className="puck-flip-inner">
            <div className="puck-flip-face" style={{ background: p.frontBg ?? "#1a2f5a", color: p.frontColor ?? "#fff" }}>
              {p.frontIcon && <div style={{ fontSize: 40, marginBottom: 12 }}>{p.frontIcon}</div>}
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{p.frontTitle}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85 }}>{p.frontText}</p>
            </div>
            <div className="puck-flip-face puck-flip-back" style={{ background: p.backBg ?? "#f97316", color: p.backColor ?? "#fff" }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{p.backTitle}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20, opacity: 0.9 }}>{p.backText}</p>
              {p.backBtnText && <a href={safeUrl(p.backBtnUrl)} style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", color: p.backColor ?? "#fff", border: `2px solid ${p.backColor ?? "#fff"}`, padding: "8px 20px", borderRadius: 6, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>{p.backBtnText}</a>}
            </div>
          </div>
        </div>
      );

    // ── Social Proof ──────────────────────────────────────────────────────

    case "Testimonial":
      return (
        <div key={id} style={{ background: p.background ?? "#fff", border: `1px solid ${p.borderColor ?? "#e2e8f0"}`, borderRadius: 12, padding: "28px 24px", height: "100%", boxSizing: "border-box" as any, boxShadow: p.shadow ?? "none" }}>
          {p.rating !== "0" && <div style={{ marginBottom: 12, fontSize: 16, color: "#f59e0b" }}>{"★".repeat(Number(p.rating ?? 5))}</div>}
          <p style={{ fontSize: 15, lineHeight: 1.75, color: p.quoteColor ?? "#374151", marginBottom: 20, fontStyle: "italic" }}>"{p.quote}"</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {p.avatar && <img src={p.avatar} alt={p.author} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />}
            <div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>{p.author}</div>
              {p.company && <div style={{ color: "#64748b", fontSize: 13, marginTop: 1 }}>{p.company}</div>}
            </div>
          </div>
        </div>
      );

    case "StarRating": {
      const full = Math.floor(p.rating ?? 5);
      const frac = (p.rating ?? 5) - full;
      return (
        <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: p.align ?? "center", gap: 6 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: p.maxStars ?? 5 }).map((_, i) => {
              const pct = i < full ? 100 : i === full && frac > 0 ? Math.round(frac * 100) : 0;
              return (
                <span key={i} style={{ fontSize: p.fontSize ?? 28, position: "relative", color: p.emptyColor ?? "#e2e8f0" }}>★
                  <span style={{ position: "absolute", top: 0, left: 0, overflow: "hidden", width: `${pct}%`, color: p.starColor ?? "#f59e0b" }}>★</span>
                </span>
              );
            })}
          </div>
          {p.label && <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{p.label}</div>}
        </div>
      );
    }

    case "SocialIcons": {
      const EMOJIS: Record<string, string> = { facebook: "f", instagram: "📸", twitter: "𝕏", linkedin: "in", youtube: "▶", pinterest: "P", tiktok: "♪", whatsapp: "💬", email: "✉", phone: "📞" };
      const COLORS: Record<string, string> = { facebook: "#1877f2", instagram: "#e1306c", twitter: "#1da1f2", linkedin: "#0a66c2", youtube: "#ff0000", pinterest: "#bd081c", tiktok: "#010101", whatsapp: "#25d366", email: "#6366f1", phone: "#16a34a" };
      return (
        <div key={id} style={{ display: "flex", gap: p.gap ?? 10, justifyContent: p.align ?? "center", flexWrap: "wrap" }}>
          {(p.icons ?? []).map((item: any, i: number) => {
            const bg = p.style === "icon" ? "transparent" : p.style === "circle" ? (p.bgColor || COLORS[item.platform]) : "transparent";
            const border = p.style === "outline" ? `2px solid ${p.bgColor || COLORS[item.platform]}` : "none";
            const color  = p.style === "icon" ? (p.bgColor || COLORS[item.platform]) : (p.iconColor ?? "#fff");
            return (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                style={{ width: p.size ?? 36, height: p.size ?? 36, borderRadius: p.borderRadius ?? 50, background: bg, border, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: (p.size ?? 36) * 0.45, fontWeight: 900, textDecoration: "none", boxSizing: "border-box" as any }}>
                {EMOJIS[item.platform] || "🔗"}
              </a>
            );
          })}
        </div>
      );
    }

    case "IconList":
      return (
        <div key={id} style={{ display: p.layout === "grid" ? "grid" : "flex", gridTemplateColumns: "1fr 1fr", flexDirection: "column" as any, gap: p.gap ?? 24 }}>
          {(p.items ?? []).map((item: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: p.iconSize ?? 44, height: p.iconSize ?? 44, background: p.iconBg ?? "#dbeafe", borderRadius: p.iconRadius ?? 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: (p.iconSize ?? 44) * 0.55 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: p.titleColor ?? "#1a2f5a", fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: p.textColor ?? "#64748b", lineHeight: 1.6 }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      );

    // ── Section blocks ────────────────────────────────────────────────────

    case "CallToAction":
      return (
        <div key={id} style={{ background: p.background ?? "#f97316", color: p.textColor ?? "#fff", padding: "60px 24px", textAlign: p.align ?? "center", borderRadius: p.borderRadius ?? 0 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, color: p.textColor ?? "#fff" }}>{p.heading}</h2>
          {p.subtext && <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32 }}>{p.subtext}</p>}
          <div style={{ display: "flex", gap: 14, justifyContent: p.align === "center" ? "center" : "flex-start", flexWrap: "wrap" }}>
            {p.buttonText  && <a href={safeUrl(p.buttonUrl)}  style={{ display: "inline-block", background: p.buttonBg ?? "#fff", color: p.buttonColor ?? (p.background ?? "#f97316"), padding: "14px 36px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 16 }}>{p.buttonText}</a>}
            {p.buttonText2 && <a href={safeUrl(p.buttonUrl2)} style={{ display: "inline-block", background: "transparent", color: p.textColor ?? "#fff", padding: "14px 36px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 16, border: `2px solid ${p.textColor ?? "#fff"}` }}>{p.buttonText2}</a>}
          </div>
        </div>
      );

    case "TrustBar":
      return (
        <div key={id} style={{ background: p.background ?? "#f8fafc", padding: `${p.padding ?? 18}px 24px` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "10px 0" }}>
            {(p.items ?? []).map((item: any, i: number) => (
              <span key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: p.textColor ?? "#1a2f5a", fontWeight: 600, fontSize: p.fontSize ?? 14, padding: "0 20px" }}>
                  <span style={{ fontSize: (p.fontSize ?? 14) + 4 }}>{item.icon}</span><span>{item.label}</span>
                </div>
                {p.separator !== "none" && i < (p.items?.length ?? 0) - 1 && <span style={{ color: p.textColor ?? "#1a2f5a", opacity: 0.3, fontSize: 16 }}>{p.separator === "pipe" ? "|" : "·"}</span>}
              </span>
            ))}
          </div>
        </div>
      );

    case "IconBox":
      return (
        <div key={id} style={{ background: p.background ?? "#f8fafc", color: p.textColor ?? "#1e293b", padding: p.padding ?? 32, borderRadius: p.borderRadius ?? 12, textAlign: p.align ?? "center", height: "100%", boxSizing: "border-box" as any, boxShadow: p.shadow ?? "none", border: `1px solid ${p.border ?? "#e2e8f0"}` }}>
          <div style={{ width: p.iconSize ?? 64, height: p.iconSize ?? 64, borderRadius: (p.iconSize ?? 64) * 0.25, background: p.iconBackground ?? "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: (p.iconSize ?? 64) * 0.45, margin: p.align === "center" ? "0 auto 20px" : "0 0 20px" }}>{p.icon}</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: p.textColor ?? "#1e293b" }}>{p.title}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.78, margin: "0 0 16px" }}>{p.description}</p>
          {p.link && <a href={safeUrl(p.link)} style={{ color: "#2563eb", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>{p.linkText || "Learn more →"}</a>}
        </div>
      );

    case "FeaturesGrid":
      return (
        <div key={id} style={{ background: p.background ?? "#f8fafc", padding: "60px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {p.heading    && <h2 style={{ fontSize: 32, fontWeight: 800, color: "#1a2f5a", textAlign: "center", marginBottom: p.subheading ? 12 : 40 }}>{p.heading}</h2>}
            {p.subheading && <p style={{ textAlign: "center", color: "#64748b", maxWidth: 600, margin: "0 auto 40px", fontSize: 16, lineHeight: 1.7 }}>{p.subheading}</p>}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.columns ?? 4}, 1fr)`, gap: 20 }}>
              {(p.items ?? []).map((item: any, i: number) => (
                <div key={i} style={{ background: p.cardBg ?? "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "28px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, background: p.iconBg ?? "#dbeafe", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>{item.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a2f5a", marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "PricingTable":
      return (
        <div key={id} style={{ background: p.background ?? "#f8fafc", padding: "60px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {p.heading    && <h2 style={{ fontSize: 32, fontWeight: 800, color: "#1a2f5a", textAlign: "center", marginBottom: p.subheading ? 12 : 40 }}>{p.heading}</h2>}
            {p.subheading && <p style={{ textAlign: "center", color: "#64748b", marginBottom: 40 }}>{p.subheading}</p>}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${(p.plans ?? []).length}, 1fr)`, gap: 20, alignItems: "start" }}>
              {(p.plans ?? []).map((plan: any, i: number) => {
                const featured = plan.featured === "yes";
                const features = (plan.features || "").split("\n").filter(Boolean);
                return (
                  <div key={i} style={{ background: featured ? (p.accentColor ?? "#1a2f5a") : "#fff", color: featured ? "#fff" : "#1e293b", borderRadius: 16, padding: "32px 24px", boxShadow: featured ? "0 12px 40px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.08)", border: featured ? "none" : "1px solid #e2e8f0", position: "relative", transform: featured ? "scale(1.04)" : "none" }}>
                    {plan.badge && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#f97316", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20 }}>{plan.badge}</div>}
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
                    <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{plan.price}<span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7 }}>{plan.period}</span></div>
                    <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 24 }}>{plan.description}</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {features.map((f: string, fi: number) => <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}><span style={{ color: featured ? "#fff" : "#16a34a" }}>✓</span>{f}</li>)}
                    </ul>
                    <a href={safeUrl(plan.btnUrl)} style={{ display: "block", textAlign: "center", background: featured ? "#fff" : (p.accentColor ?? "#1a2f5a"), color: featured ? (p.accentColor ?? "#1a2f5a") : "#fff", padding: "12px 0", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>{plan.btnText}</a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );

    case "Stats":
      return (
        <div key={id} style={{ background: p.background ?? "#1a2f5a", padding: "52px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {p.heading && <h2 style={{ textAlign: "center", color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 40 }}>{p.heading}</h2>}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.columns ?? 4}, 1fr)`, gap: 0 }}>
              {(p.items ?? []).map((item: any, i: number) => (
                <div key={i} style={{ textAlign: "center", padding: 20, borderRight: p.dividers !== "no" && i < (p.items?.length ?? 0) - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                  {item.icon && <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>}
                  <div style={{ fontSize: 44, fontWeight: 800, color: p.textColor ?? "#f97316", lineHeight: 1 }}>{item.value}<span style={{ fontSize: 24 }}>{item.suffix}</span></div>
                  <div style={{ fontSize: 13, color: p.labelColor ?? "rgba(255,255,255,0.8)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function BlockRenderer({ content }: { content: string }) {
  let parsed: any;
  try { parsed = JSON.parse(content || "[]"); }
  catch {
    // Not JSON — raw HTML (e.g. manually entered)
    return <div className="prose max-w-4xl mx-auto px-4 py-12" dangerouslySetInnerHTML={{ __html: safeHtml(content) }} />;
  }

  // ── GrapesJS format: { gjs: { html: "...", css: "..." } }
  if (parsed?.gjs && typeof parsed.gjs.html === "string") {
    return (
      <>
        {parsed.gjs.css && <style dangerouslySetInnerHTML={{ __html: parsed.gjs.css }} />}
        <style dangerouslySetInnerHTML={{ __html: `
/* ── GrapesJS mobile overrides ── */
@media (max-width: 767px) {
  /* Reduce large section padding */
  .gjs-content section { padding-top: 36px !important; padding-bottom: 36px !important; }

  /* Flex rows: force wrap so items stack on narrow screens */
  .gjs-content [style*="display:flex"],
  .gjs-content [style*="display: flex"] {
    flex-wrap: wrap !important;
  }
  /* Each flex child: min 200px forces wrap to 1-col on 375px screens */
  .gjs-content [style*="display:flex"] > *,
  .gjs-content [style*="display: flex"] > * {
    min-width: min(200px, 100%) !important;
    flex-shrink: 1 !important;
  }

  /* Grid: 2-col → stack to 1-col on mobile */
  .gjs-content [style*="grid-template-columns:1fr 1fr;"],
  .gjs-content [style*="grid-template-columns: 1fr 1fr;"],
  .gjs-content [style*="grid-template-columns:repeat(2"],
  .gjs-content [style*="grid-template-columns: repeat(2"] {
    grid-template-columns: 1fr !important;
  }
  /* 3-col → 2-col on mobile */
  .gjs-content [style*="grid-template-columns: 1fr 1fr 1fr"],
  .gjs-content [style*="grid-template-columns:1fr 1fr 1fr"],
  .gjs-content [style*="grid-template-columns: repeat(3"],
  .gjs-content [style*="grid-template-columns:repeat(3"] {
    grid-template-columns: 1fr 1fr !important;
  }
  /* 4-col → 2-col on mobile (e.g. stats bar repeat(4,1fr)) */
  .gjs-content [style*="grid-template-columns:repeat(4"],
  .gjs-content [style*="grid-template-columns: repeat(4"] {
    grid-template-columns: 1fr 1fr !important;
  }

  /* Tables: horizontal scroll */
  .gjs-content table { display: block; overflow-x: auto; white-space: nowrap; }

  /* Images: constrain */
  .gjs-content img { max-width: 100% !important; }

  /* Reduce huge font sizes */
  .gjs-content [style*="font-size: 5"],
  .gjs-content [style*="font-size:5"] { font-size: clamp(28px, 8vw, 52px) !important; }
}
        ` }} />
        <div className="gjs-content" dangerouslySetInnerHTML={{ __html: safeHtml(parsed.gjs.html) }} />
      </>
    );
  }

  // ── Puck JSON format: { content: [...], root: {}, zones: {} }
  if (!Array.isArray(parsed) && Array.isArray(parsed.content) && parsed.root !== undefined) {
    const zones: Record<string, any[]> = parsed.zones ?? {};
    return <>{parsed.content.map((item: any) => renderPuckItem(item, zones))}</>;
  }

  // ── Legacy block format: [{id, type, data}]
  let blocks: Block[] = [];
  if (Array.isArray(parsed)) blocks = parsed;
  else return <div className="prose max-w-4xl mx-auto px-4 py-12" dangerouslySetInnerHTML={{ __html: safeHtml(content) }} />;

  return (
    <>
      {blocks.filter(b => !b.hidden).map(block => {
        const d = block.data;
        switch (block.type) {
          /* ── Core content ───────────────────────────────── */
          case "hero":
          case "hero_banner":
            return <HeroBlock key={block.id} d={d} />;
          case "text":
          case "text_block":
            return <TextBlock key={block.id} d={d} />;
          case "image_text": return <ImageTextBlock key={block.id} d={d} />;
          case "features":   return <FeaturesBlock key={block.id} d={d} />;
          case "cta":
          case "cta_banner":
            return <CtaBlock key={block.id} d={d} />;
          case "faq": return <FaqBlock key={block.id} d={d} />;
          case "stats": return <StatsBlock key={block.id} d={d} />;
          case "testimonials": return <TestimonialsBlock key={block.id} d={d} />;
          case "columns": return <ColumnsBlock key={block.id} d={d} />;

          /* ── Heading ────────────────────────────────────── */
          case "heading": {
            const Tag = (d.tag || d.headingTag || "h2") as React.ElementType;
            return (
              <div key={block.id} className="max-w-4xl mx-auto px-4 py-6" style={{ textAlign: d.align || "left" }}>
                <Tag className="font-extrabold text-[#1a2f5a]" style={{ fontSize: d.fontSize ? `${d.fontSize}px` : undefined, color: d.color || undefined }}>
                  {d.heading || d.text || ""}
                </Tag>
              </div>
            );
          }

          /* ── Image ──────────────────────────────────────── */
          case "image":
            return d.url || d.src ? (
              <div key={block.id} className="max-w-4xl mx-auto px-4 py-6" style={{ textAlign: d.align || "center" }}>
                <img src={d.url || d.src} alt={d.alt || ""} className="inline-block max-w-full rounded-xl" loading="lazy" decoding="async" />
              </div>
            ) : null;

          /* ── Button ─────────────────────────────────────── */
          case "button":
            return d.link ? (
              <div key={block.id} className="max-w-4xl mx-auto px-4 py-4" style={{ textAlign: d.align || "center" }}>
                <Link href={safeUrl(d.link)} className="inline-block bg-[#e63329] text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                  {d.text || "Learn More"}
                </Link>
              </div>
            ) : null;

          /* ── Contact / Quote form ───────────────────────── */
          case "contact_form":
          case "form":
            return (
              <div key={block.id} className="max-w-3xl mx-auto px-4 py-10">
                {d.heading && <h2 className="text-2xl font-bold text-[#1a2f5a] mb-2">{d.heading}</h2>}
                {d.subtext && <p className="text-gray-500 mb-6 text-sm">{d.subtext}</p>}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="First Name *" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]" />
                    <input placeholder="Last Name *" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="Email Address *" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]" />
                    <input placeholder="Phone Number" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]" />
                  </div>
                  <textarea rows={4} placeholder="Tell us about your packaging project..." className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a] resize-y" />
                  <button className="w-full bg-[#e63329] text-white font-bold py-3.5 rounded-lg hover:bg-red-700 transition-colors">
                    {d.submitText || "Send Message →"}
                  </button>
                </div>
              </div>
            );

          /* ── Section / Container (recursive) ───────────── */
          case "section": {
            const cols: any[] = d.cols || [];
            return (
              <div key={block.id} style={{
                background: d.bgImage ? `url(${d.bgImage}) center/cover no-repeat` : (d.bgColor || "#fff"),
                paddingTop: d.pt ?? 60, paddingBottom: d.pb ?? 60, position: "relative",
              }}>
                {d.bgImage && d.bgOverlay > 0 && (
                  <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${d.bgOverlay / 100})`, pointerEvents: "none" }} />
                )}
                <div className={`relative ${d.fullWidth ? "px-6" : "max-w-6xl mx-auto px-6"}`}>
                  <div style={{ display: "flex", gap: (d.gap ?? 24) + "px", alignItems: d.verticalAlign === "center" ? "center" : d.verticalAlign === "bottom" ? "flex-end" : "flex-start" }}>
                    {cols.map((col: any, ci: number) => (
                      <div key={ci} style={{ flex: col.flex || 1, minWidth: 0 }}>
                        {(col.blocks || []).map((b: Block) => (
                          <InlineBlock key={b.id} block={b} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          /* ── Spacer ─────────────────────────────────────── */
          case "spacer":
            return <div key={block.id} style={{ height: d.height || 40 }} />;

          /* ── Divider ────────────────────────────────────── */
          case "divider":
            return (
              <div key={block.id} style={{ paddingTop: d.gapY || 16, paddingBottom: d.gapY || 16 }}>
                <div style={{ borderTop: `${d.weight || 1}px ${d.style || "solid"} ${d.color || "#e2e8f0"}`, width: `${d.width || 100}%`, margin: "0 auto" }} />
              </div>
            );

          default: return null;
        }
      })}
    </>
  );
}
