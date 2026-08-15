import { useState, useEffect } from "react";
import { Link } from "wouter";
import DOMPurify from "dompurify";

function safeHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "javascript"],
  });
}
function safeUrl(raw: string | null | undefined): string {
  if (!raw) return "#";
  const t = raw.trim().toLowerCase();
  if (t.startsWith("javascript:") || t.startsWith("data:text/html") || t.startsWith("vbscript:")) return "#";
  return raw;
}
import { useListProducts, useListBlogPosts } from "@workspace/api-client-react";
import { ProductCard } from "./ProductCard";

interface Block {
  id: string;
  type: string;
  data: Record<string, any>;
  hidden?: boolean;
}

interface DynamicData {
  category?: { name: string; slug: string; description?: string | null; imageUrl?: string | null };
  product?: { name: string; slug: string; description?: string | null; imageUrl?: string | null };
  products?: any[];
  posts?: any[];
}

// Substitute {{variable}} placeholders with actual dynamic data
function interpolate(str: string, data: DynamicData): string {
  if (!str) return str;
  return str
    .replace(/\{\{category\.name\}\}/gi, data.category?.name || "")
    .replace(/\{\{category\.description\}\}/gi, data.category?.description || "")
    .replace(/\{\{category\.image\}\}/gi, data.category?.imageUrl || "")
    .replace(/\{\{product\.name\}\}/gi, data.product?.name || "")
    .replace(/\{\{product\.description\}\}/gi, data.product?.description || "")
    .replace(/\{\{product\.image\}\}/gi, data.product?.imageUrl || "");
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── Block components ────────────────────────────────────────────────────

function DynamicHeroBlock({ d, dynamicData }: { d: any; dynamicData: DynamicData }) {
  const entity = d.mode === "product" ? dynamicData.product : dynamicData.category;
  const title = d.useTitle ? entity?.name : d.heading;
  const desc = d.useDescription ? entity?.description : d.subheading;
  const bgImage = d.useImage ? entity?.imageUrl : d.bgImage;

  return (
    <div className="relative min-h-[280px] flex items-center py-16 px-4 text-white"
      style={{
        background: d.bgColor || "#1a2f5a",
        ...(bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
      }}>
      {bgImage && <div className="absolute inset-0 bg-[#1a2f5a]/80" />}
      <div className="relative max-w-5xl mx-auto w-full">
        <nav className="text-sm text-white/60 mb-4">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/products" className="hover:text-white">Products</Link>
          {title && <><span className="mx-2">›</span><span className="text-white">{title}</span></>}
        </nav>
        {title && <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{title}</h1>}
        {desc && (
          <p className="text-white/70 text-lg mb-6 max-w-xl line-clamp-3">
            {desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300)}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {d.buttonText && d.buttonLink && (
            <Link href={safeUrl(d.buttonLink)} className="bg-[#e63329] text-white px-7 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
              {d.buttonText} →
            </Link>
          )}
          <a href="tel:8187584076" className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
            📞 818-758-4076
          </a>
        </div>
      </div>
    </div>
  );
}

function TrustBarBlock({ d }: { d: any }) {
  return (
    <div className="bg-gray-50 border-y border-gray-100 py-3 px-4">
      <div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-center items-center">
        {(d.items || []).map((item: string, i: number) => (
          <span key={i} className="text-sm text-gray-600 font-medium whitespace-nowrap">{item}</span>
        ))}
      </div>
    </div>
  );
}

function ProductsGridBlock({ d, dynamicData }: { d: any; dynamicData: DynamicData }) {
  const categorySlug = dynamicData.category?.slug;
  const { data: products = [], isLoading } = useListProducts({
    ...(categorySlug ? { category: categorySlug } : {}),
    limit: d.limit || 20,
  });

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const filtered = products.filter((p: any) => {
    const matchS = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchS;
  });

  return (
    <div className="py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {d.heading && <h2 className="text-3xl font-bold text-[#1a2f5a] mb-6">{d.heading}</h2>}
        {(d.showSearch || d.showCategoryFilter) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {d.showSearch && (
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 min-w-[200px] h-10 border border-gray-200 rounded-lg px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]" />
            )}
          </div>
        )}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
            </div>
            <p>No products found.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-2 gap-5 ${d.columns === 4 ? "md:grid-cols-4" : d.columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {filtered.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function BlogGridBlock({ d }: { d: any }) {
  const { data: posts = [], isLoading } = useListBlogPosts({ limit: d.limit || 9 });

  return (
    <div className="py-14 px-4">
      <div className="max-w-6xl mx-auto">
        {d.heading && <h2 className="text-3xl font-bold text-[#1a2f5a] text-center mb-10">{d.heading}</h2>}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${d.columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {posts.map((post: any) => (
              <Link key={post.id} href={`/${post.slug}`} className="group">
                <div className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title}
                      onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "https://placehold.co/800x400/1a2f5a/ffffff?text=Prime+Packaging"; }}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-[#1a2f5a] to-[#162445] flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg></div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-2">{post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</p>
                    <h3 className="font-bold text-[#1a2f5a] mb-2 group-hover:text-[#e63329] transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>
                    <div className="mt-3 text-[#e63329] text-sm font-medium">Read More →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HeroBlock({ d }: { d: any }) {
  return (
    <div className="py-20 px-4 text-center relative"
      style={{
        background: d.bgColor || "#1a2f5a",
        ...(d.bgImage ? { backgroundImage: `url(${d.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
      }}>
      {d.bgImage && <div className="absolute inset-0" style={{ background: `${d.bgColor || "#1a2f5a"}cc` }} />}
      <div className="relative max-w-3xl mx-auto text-white">
        {d.heading && <h1 className="text-4xl md:text-5xl font-bold mb-4">{d.heading}</h1>}
        {d.subheading && <p className="text-lg text-white/80 mb-8">{d.subheading}</p>}
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
      <div className={`prose max-w-none ${d.align === "center" ? "text-center" : d.align === "right" ? "text-right" : ""}`}
        dangerouslySetInnerHTML={{ __html: safeHtml(d.content) }} />
    </div>
  );
}

function ImageTextBlock({ d }: { d: any }) {
  const reversed = d.imagePosition === "left";
  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className={`grid md:grid-cols-2 gap-10 items-center`}>
        {reversed ? (
          <>
            <div>{d.imageUrl ? <img src={d.imageUrl} alt={d.heading} className="w-full rounded-xl shadow-lg" /> : <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-4xl">🖼️</div>}</div>
            <div>
              <h2 className="text-3xl font-bold text-[#1a2f5a] mb-4">{d.heading}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{d.text}</p>
              {d.buttonText && d.buttonLink && <Link href={safeUrl(d.buttonLink)} className="inline-block bg-[#1a2f5a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1a2f5a]/90">{d.buttonText}</Link>}
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-3xl font-bold text-[#1a2f5a] mb-4">{d.heading}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{d.text}</p>
              {d.buttonText && d.buttonLink && <Link href={safeUrl(d.buttonLink)} className="inline-block bg-[#1a2f5a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1a2f5a]/90">{d.buttonText}</Link>}
            </div>
            <div>{d.imageUrl ? <img src={d.imageUrl} alt={d.heading} className="w-full rounded-xl shadow-lg" /> : <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-4xl">🖼️</div>}</div>
          </>
        )}
      </div>
    </div>
  );
}

const EMOJI_ICON_MAP: Record<string, string> = {
  "🎨": "palette", "📦": "package", "⚡": "zap", "🚚": "truck",
  "🌿": "leaf", "✅": "check-circle", "💡": "lightbulb", "🔒": "lock",
  "💰": "dollar-sign", "🤝": "handshake", "🎯": "target", "📐": "ruler",
  "🏆": "award", "⭐": "star", "🌍": "globe", "✈️": "plane",
  "📱": "smartphone", "🛒": "shopping-cart", "🖨️": "printer", "📋": "clipboard",
};
function FeatureIcon({ icon }: { icon: string }) {
  const name = EMOJI_ICON_MAP[icon?.trim()];
  const colors = ["#e63329","#1a2f5a","#f59e0b","#10b981","#6366f1","#f97316"];
  const color = colors[Object.keys(EMOJI_ICON_MAP).indexOf(icon?.trim()) % colors.length] || "#1a2f5a";
  if (name) {
    return (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: color + "18" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          {name === "palette"       && <><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></>}
          {name === "package"       && <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></>}
          {name === "zap"           && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}
          {name === "truck"         && <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>}
          {name === "leaf"          && <path d="M17 8C8 10 5.9 16.17 3.82 22L5.71 22C6.67 16 9.67 13.5 14 13.5h3V8z"/>}
          {name === "check-circle"  && <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}
          {name === "lightbulb"     && <><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8A6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></>}
          {name === "lock"          && <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
          {name === "dollar-sign"   && <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>}
          {name === "award"         && <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>}
          {name === "star"          && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}
          {name === "ruler"         && <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="15 8 19 12 15 16"/></>}
          {name === "printer"       && <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>}
          {name === "shopping-cart" && <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>}
        </svg>
      </div>
    );
  }
  return <div className="w-12 h-12 rounded-xl bg-[#1a2f5a]/8 flex items-center justify-center mb-3 text-2xl">{icon}</div>;
}

function FeaturesBlock({ d }: { d: any }) {
  const cols = d.items?.length === 4 ? "md:grid-cols-4" : d.items?.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <div className="bg-gray-50 py-14">
      <div className="max-w-6xl mx-auto px-4">
        {d.heading && <h2 className="text-3xl font-bold text-[#1a2f5a] text-center mb-10">{d.heading}</h2>}
        <div className={`grid ${cols} gap-6`}>
          {(d.items || []).map((item: any, i: number) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <FeatureIcon icon={item.icon} />
              <h3 className="font-bold text-[#1a2f5a] text-base mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
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
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      {d.heading && <h2 className="text-3xl font-bold text-[#1a2f5a] text-center mb-10">{d.heading}</h2>}
      <div className="space-y-3">
        {(d.items || []).map((item: any, i: number) => (
          <div key={i} className="border rounded-xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[#1a2f5a] hover:bg-gray-50 text-left">
              {item.question}
              <span className="text-xl ml-3 flex-shrink-0">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-5 py-4 text-gray-600 border-t bg-gray-50">{item.answer}</div>}
          </div>
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

function SpacerBlock({ d }: { d: any }) {
  return <div style={{ height: d.height || 48 }} />;
}

function HtmlBlock({ d }: { d: any }) {
  return <div dangerouslySetInnerHTML={{ __html: safeHtml(d.code) }} />;
}

function VideoBlock({ d }: { d: any }) {
  const getEmbedUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
    return url;
  };
  if (!d.url) return null;
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {d.title && <h2 className="text-2xl font-bold text-[#1a2f5a] text-center mb-6">{d.title}</h2>}
      <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
        <iframe src={getEmbedUrl(d.url)} title={d.title} className="w-full h-full" allowFullScreen />
      </div>
    </div>
  );
}

function BreadcrumbBlock({ dynamicData }: { dynamicData: DynamicData }) {
  const entity = dynamicData.category || dynamicData.product;
  return (
    <div className="bg-white border-b py-3 px-4">
      <nav className="max-w-6xl mx-auto flex items-center gap-2 text-sm">
        <Link href="/" className="text-[#1a2f5a] hover:underline">Home</Link>
        <span className="text-gray-300">›</span>
        <Link href="/products" className="text-[#1a2f5a] hover:underline">Products</Link>
        {entity?.name && (
          <>
            <span className="text-gray-300">›</span>
            <span className="text-gray-500">{entity.name}</span>
          </>
        )}
      </nav>
    </div>
  );
}

// ─── Interactive sub-components for Puck blocks ─────────────────────────────

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

// ─── Puck JSON renderer (no @puckeditor/core dependency) ─────────────────

function renderPuckItem(item: any, zones: Record<string, any[]>, dynamicData: DynamicData): React.ReactNode {
  const p = item.props || {};
  const id = p.id || item.type;
  const zoneContent = (zone: string) =>
    (zones[`${id}:${zone}`] || []).map((child: any) => renderPuckItem(child, zones, dynamicData));

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
        <div key={id} style={{ background: p.bgImage ? `url(${p.bgImage}) center/${p.bgSize ?? "cover"} no-repeat` : p.background, paddingTop: p.paddingTop ?? 60, paddingBottom: p.paddingBottom ?? 60, width: "100%", position: "relative" }}>
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
      const img = <img src={p.src} alt={p.alt ?? ""} style={{ width: p.width ?? "100%", borderRadius: p.borderRadius ?? 0, display: "block", boxShadow: p.shadow ?? "none" }} />;
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
              <img src={img.src} alt={img.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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
              <a key={i} href={safeUrl(item.url)} target="_blank" rel="noopener noreferrer"
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

    // ── Template dynamic blocks — delegate to live renderers ───────────────

    case "DynamicHero":
      return <DynamicHeroBlock key={id} d={{ mode: p.mode, bgColor: p.bgColor, buttonText: p.buttonText, buttonLink: p.buttonLink, useTitle: p.useTitle !== "no", useDescription: p.useDescription !== "no", useImage: p.useImage !== "no" }} dynamicData={dynamicData} />;

    case "ProductsGrid":
      return <ProductsGridBlock key={id} d={{ heading: p.heading, showSearch: p.showSearch === "yes", showCategoryFilter: p.showCategoryFilter === "yes", limit: p.limit, columns: p.columns }} dynamicData={dynamicData} />;

    case "BlogGrid":
      return <BlogGridBlock key={id} d={{ heading: p.heading, limit: p.limit, columns: p.columns }} />;

    default:
      return null;
  }
}

// ─── Main TemplateRenderer ────────────────────────────────────────────────

interface TemplateRendererProps {
  content: string;
  dynamicData?: DynamicData;
}

export function TemplateRenderer({ content, dynamicData = {} }: TemplateRendererProps) {
  const { data: liveProducts = [] } = useListProducts(
    { limit: 100 },
    { query: { enabled: !dynamicData.products, queryKey: ["template-renderer-products", dynamicData.category?.slug ?? "all"] } },
  );
  const { data: livePosts = [] } = useListBlogPosts(
    { limit: 12 },
    { query: { enabled: !dynamicData.posts, queryKey: ["template-renderer-posts"] } },
  );
  const resolvedData: DynamicData = {
    ...dynamicData,
    products: dynamicData.products ?? liveProducts,
    posts: dynamicData.posts ?? livePosts,
  };

  let parsed: any = content;
  if (typeof parsed === "string") {
    try {
      const p = JSON.parse(parsed);
      if (p) parsed = p;
    } catch {}
  }
  if (typeof parsed === "string" && (parsed.trim().startsWith("{") || parsed.trim().startsWith("["))) {
    try {
      const p = JSON.parse(parsed);
      if (p) parsed = p;
    } catch {}
  }

  // If parsed is still a raw string (e.g. plain HTML), render safe HTML directly
  if (typeof parsed === "string") {
    const htmlWithData = interpolate(parsed, resolvedData);
    return (
      <div className="grapes-template-wrapper w-full">
        <div dangerouslySetInnerHTML={{ __html: safeHtml(htmlWithData) }} />
      </div>
    );
  }

  // ── GrapesJS JSON format: { gjs: { html, css } }
  if (parsed?.gjs) {
    let rawHtml = parsed.gjs.html || "";
    const rawCss = parsed.gjs.css || "";
    const products = resolvedData.products || [];
    const posts = resolvedData.posts || [];

    // Render real dynamic product grid HTML with rich inline styles
    const productsGridHtml = products.length > 0
      ? `<section style="background: #ffffff; padding: 32px 0 48px 0; border-radius: 16px; margin-bottom: 32px;">
          <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
              <div>
                <h2 style="font-size: 24px; font-weight: 900; color: #1a2f5a; margin: 0 0 4px; font-family: Outfit, Inter, sans-serif;">
                  {{category.name}} Catalog — ${products.length} Products
                </h2>
                <p style="font-size: 13px; color: #64748b; margin: 0;">All custom manufactured to your exact size, style &amp; brand specifications.</p>
              </div>
              <a href="/get-a-quote" style="background: #e63329; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 800; font-size: 13px; text-decoration: none; box-shadow: 0 4px 12px rgba(230,51,41,0.25);">
                Request Custom Quote →
              </a>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px;">
              ${products.map((p: any) => `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); display: flex; flex-direction: column;">
                  <a href="/${p.slug}" style="display: block; height: 180px; background: #f8fafc; overflow: hidden; position: relative; text-decoration: none;">
                    <img src="${p.imageUrl || '/api/uploads/clothing-boxes.webp'}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                    <span style="position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,0.92); color: #1a2f5a; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">${dynamicData.category?.name || p.categoryName || 'Custom Box'}</span>
                  </a>
                  <div style="padding: 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                      <h3 style="font-size: 16px; font-weight: 800; color: #1a2f5a; margin: 0 0 8px; line-height: 1.3;">
                        <a href="/${p.slug}" style="color: #1a2f5a; text-decoration: none;">${p.name}</a>
                      </h3>
                      <p style="font-size: 12px; color: #64748b; margin: 0 0 16px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${(p.description || 'Custom printed packaging box in premium coated board with full-color printing.').replace(/<[^>]+>/g, '')}
                      </p>
                    </div>
                    <div style="padding-top: 12px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
                      <span style="font-size: 11px; font-weight: 700; color: #e63329;">Min. ${p.minQuantity || 100} Units</span>
                      <a href="/${p.slug}" style="background: #1a2f5a; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                        Get a Quote →
                      </a>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>`
      : '';

    // Replace dynamic products grid container or static catalog section in HTML
    if (products.length > 0) {
      if (rawHtml.includes('<!-- 3. REAL PRODUCTS CATALOG GRID -->')) {
        rawHtml = rawHtml.replace(/<!-- 3\. REAL PRODUCTS CATALOG GRID -->[\s\S]*?<\/section>/gi, productsGridHtml);
      } else if (rawHtml.includes('<!-- 3. PRODUCTS GRID -->')) {
        rawHtml = rawHtml.replace(/<!-- 3\. PRODUCTS GRID -->[\s\S]*?<\/section>/gi, productsGridHtml);
      }
    }

    if (posts.length > 0) {
      const featured = posts[0];
      const rest = posts.slice(1);
      const postCard = (post: any, featuredCard = false) => {
        const title = escapeHtml(post.title);
        const slug = safeUrl(`/${post.slug || "#"}`);
        const excerpt = escapeHtml(post.excerpt || "Packaging insights from Prime Packaging Boxes.");
        const image = escapeHtml(post.imageUrl || "/api/uploads/printed-magnetic-closure-boxes-bulk.webp");
        const date = post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "";
        if (featuredCard) {
          return `<a href="${slug}" style="display:grid;grid-template-columns:1.25fr 1fr;gap:0;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;text-decoration:none;">
            <img src="${image}" alt="${title}" style="width:100%;height:260px;object-fit:cover;" />
            <div style="padding:28px;display:flex;flex-direction:column;justify-content:center;">
              <div style="color:#e63329;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;">Featured Article</div>
              <h2 style="font-size:22px;line-height:1.25;color:#1a2f5a;margin:0 0 10px;">${title}</h2>
              <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 14px;">${excerpt}</p>
              <span style="font-size:11px;color:#94a3b8;">${date}</span>
            </div>
          </a>`;
        }
        return `<a href="${slug}" style="display:block;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;text-decoration:none;">
          <img src="${image}" alt="${title}" style="width:100%;height:170px;object-fit:cover;" />
          <div style="padding:18px;">
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">${date}</div>
            <h3 style="font-size:15px;line-height:1.35;color:#1a2f5a;margin:0 0 8px;">${title}</h3>
            <p style="font-size:12px;line-height:1.55;color:#64748b;margin:0;">${excerpt}</p>
          </div>
        </a>`;
      };
      rawHtml = rawHtml.replace(
        /<!-- FEATURED ARTICLE -->[\s\S]*?<\/section>/i,
        `<!-- FEATURED ARTICLE --><section style="background:#fff;padding:48px 24px;"><div style="max-width:1100px;margin:0 auto;">${postCard(featured, true)}</div></section>`,
      );
      rawHtml = rawHtml.replace(
        /<!-- MORE ARTICLES -->[\s\S]*?<\/section>/i,
        `<!-- MORE ARTICLES --><section style="background:#f8fafc;padding:48px 24px;"><div style="max-width:1100px;margin:0 auto;"><h2 style="font-size:24px;color:#1a2f5a;margin:0 0 24px;">More Articles</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">${rest.map((post: any) => postCard(post)).join("")}</div></div></section>`,
      );
    }

    const htmlWithData = interpolate(rawHtml, resolvedData);

    return (
      <div className="grapes-template-wrapper w-full">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap" />
        {rawCss && <style dangerouslySetInnerHTML={{ __html: rawCss }} />}
        <div dangerouslySetInnerHTML={{ __html: htmlWithData }} />
      </div>
    );
  }

  // ── Puck JSON format: { content: [...], root: {}, zones: {} }
  if (!Array.isArray(parsed) && Array.isArray(parsed.content) && parsed.root !== undefined) {
    const zones: Record<string, any[]> = parsed.zones ?? {};
    return (
      <>
        {parsed.content.map((item: any) => renderPuckItem(item, zones, resolvedData))}
      </>
    );
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
          case "dynamic_hero": return <DynamicHeroBlock key={block.id} d={d} dynamicData={resolvedData} />;
          case "hero": return <HeroBlock key={block.id} d={d} />;
          case "trust_bar": return <TrustBarBlock key={block.id} d={d} />;
          case "products_grid": return <ProductsGridBlock key={block.id} d={d} dynamicData={resolvedData} />;
          case "blog_grid": return <BlogGridBlock key={block.id} d={d} />;
          case "text": return <TextBlock key={block.id} d={d} />;
          case "image_text": return <ImageTextBlock key={block.id} d={d} />;
          case "features": return <FeaturesBlock key={block.id} d={d} />;
          case "cta": return <CtaBlock key={block.id} d={d} />;
          case "faq": return <FaqBlock key={block.id} d={d} />;
          case "stats": return <StatsBlock key={block.id} d={d} />;
          case "testimonials": return <TestimonialsBlock key={block.id} d={d} />;
          case "columns": return <ColumnsBlock key={block.id} d={d} />;
          case "spacer": return <SpacerBlock key={block.id} d={d} />;
          case "html": return <HtmlBlock key={block.id} d={d} />;
          case "video": return <VideoBlock key={block.id} d={d} />;
          case "breadcrumb": return <BreadcrumbBlock key={block.id} dynamicData={resolvedData} />;
          default: return null;
        }
      })}
    </>
  );
}

// ─── Hook: load template from API with live builder sync & auto-refetch ─────
export function usePageTemplate(type: string) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadTemplate = () => {
      fetch(`/api/templates/${type}?t=${Date.now()}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (active && data?.content) {
            setContent(data.content);
          }
        })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
    };

    loadTemplate();

    // Listen for instant broadcast updates when Admin Builder saves template
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `template_updated_${type}` || e.key === 'template_updated_all') {
        loadTemplate();
      }
    };
    window.addEventListener("storage", handleStorage);

    // Poll every 2 seconds to guarantee live connection between Page Builder & Public Page
    const interval = setInterval(loadTemplate, 2000);

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [type]);

  return { content, loading };
}
