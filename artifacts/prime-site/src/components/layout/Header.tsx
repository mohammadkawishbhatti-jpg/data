import { useState, useRef, useEffect, memo } from "react";
import { Link, useLocation } from "wouter";
import { useSettings } from "../../context/SettingsContext";
import {
  Menu, X, Phone, Mail, ChevronDown, ArrowRight, Package,
  Flame, Star, Palette, Truck, Zap, CheckCircle2, Leaf, Award, User,
} from "lucide-react";

/* ─── Mega-menu data ─────────────────────────────────────────── */
const BY_INDUSTRY = [
  { label: "Apparel Boxes",    slug: "apparel-boxes" },
  { label: "Bakery Boxes",     slug: "bakery-boxes" },
  { label: "Bottle Boxes",     slug: "bottle-boxes" },
  { label: "Candle Boxes",     slug: "candle-boxes" },
  { label: "CBD Boxes",        slug: "cbd-boxes" },
  { label: "Cereal Boxes",     slug: "cereal-boxes" },
  { label: "Coffee Packaging", slug: "coffee-packaging" },
  { label: "Display Boxes",    slug: "display-boxes" },
  { label: "Food Boxes",       slug: "food-boxes" },
  { label: "Mailer Boxes",     slug: "mailer-boxes" },
  { label: "Medicine Boxes",   slug: "medicine-boxes" },
  { label: "Retail Boxes",     slug: "retail-boxes" },
  { label: "Shipping Boxes",   slug: "shipping-boxes" },
  { label: "Soap Boxes",       slug: "soap-boxes" },
  { label: "Gable Boxes",      slug: "gable-boxes" },
  { label: "Product Boxes",    slug: "product-boxes" },
];

const HOT_SELLING = [
  { label: "Christmas Boxes",   slug: "christmas-boxes" },
  { label: "Custom Paper Bags", slug: "custom-paper-bags" },
  { label: "Jewelry Boxes",     slug: "jewelry-boxes" },
  { label: "Pillow Boxes",      slug: "pillow-boxes" },
  { label: "Pizza Boxes",       slug: "pizza-boxes" },
  { label: "Tea Packaging",     slug: "tea-packaging" },
  { label: "Trays & Sleeves",   slug: "trays-and-sleeves" },
  { label: "Window Packaging",  slug: "window-packaging" },
  { label: "Stationery Boxes",  slug: "stationery-boxes" },
  { label: "Cigarette Boxes",   slug: "cigarette-boxes" },
];

const BOX_BY_STYLE = [
  { label: "Cardboard Boxes",    slug: "cardboard-boxes" },
  { label: "Corrugated Boxes",   slug: "corrugated-boxes" },
  { label: "Custom Kraft Boxes", slug: "custom-kraft-boxes" },
  { label: "Eco-Friendly Boxes", slug: "eco-friendly-boxes" },
  { label: "Cosmetic Boxes",     slug: "cosmetic-boxes" },
  { label: "Chocolate Boxes",    slug: "chocolate-boxes" },
  { label: "Labels & Stickers",  slug: "labels-and-stickers" },
  { label: "Custom Mylar Bags",  slug: "custom-mylar-bags" },
  { label: "Rigid Boxes",        slug: "rigid-boxes" },
  { label: "Gift Boxes",         slug: "gift-boxes" },
];

const FEATURED_IN_MENU = [
  { img: "/api/uploads/custom-cake-boxes.webp",                   label: "Cake Boxes",         slug: "custom-cake-boxes" },
  { img: "/api/uploads/luxury-chocolate-boxes.webp",              label: "Chocolate Boxes",    slug: "luxury-chocolate-boxes" },
  { img: "/api/uploads/custom-kraft-boxes-wholesale.webp",        label: "Kraft Boxes",        slug: "custom-kraft-boxes" },
  { img: "/api/uploads/printed-magnetic-closure-boxes-bulk.webp", label: "Magnetic Boxes",     slug: "custom-magnetic-closure-boxes" },
];

/* ─── Marquee items ──────────────────────────────────────────── */
const TICKER: { Icon: React.ElementType; text: string }[] = [
  { Icon: Truck,        text: "Free Shipping — USA & UK" },
  { Icon: Zap,          text: "7–10 Day Turnaround" },
  { Icon: Palette,      text: "Free Design Support" },
  { Icon: Package,      text: "100 Unit Minimum" },
  { Icon: CheckCircle2, text: "100% Quality Guarantee" },
  { Icon: Leaf,         text: "FSC Certified Materials" },
  { Icon: Award,        text: "500+ Happy Brands" },
  { Icon: Star,         text: "4.9 Star Rating" },
];

function _Header() {
  const { phone, email } = useSettings();
  const telLink = `tel:${phone.replace(/\D/g, "")}`;
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProdOpen, setMobileProdOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openDrop  = () => { if (timerRef.current) clearTimeout(timerRef.current); setDropOpen(true); };
  const closeDrop = () => { timerRef.current = setTimeout(() => setDropOpen(false), 140); };
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const closeAll = () => { setMobileOpen(false); setMobileProdOpen(false); setDropOpen(false); };
  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50">

      {/* ── TOP BAR ── */}
      <div className="bg-[#0d1f3c] text-white overflow-hidden relative" style={{ height: "28px" }}>
        <div className="flex items-center h-full">
          <div
            className="flex gap-0 whitespace-nowrap"
            style={{ animation: "ticker 36s linear infinite" }}
          >
            {[...TICKER, ...TICKER].map(({ Icon, text }, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-white/80 px-5">
                <Icon className="w-3 h-3 text-white/60 shrink-0" />
                {text}
                <span className="text-white/20 ml-4">|</span>
              </span>
            ))}
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full hidden lg:flex items-center gap-5 pl-8 pr-5 border-l border-white/10"
          style={{ backgroundImage: "linear-gradient(to right, transparent, #0d1f3c 20%)", background: "#0d1f3c" }}>
          <a href={telLink} className="flex items-center gap-1.5 text-[10.5px] font-bold text-white/70 hover:text-white transition-colors">
            <Phone className="w-3 h-3" /> {phone}
          </a>
          <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-[10.5px] text-white/60 hover:text-white transition-colors">
            <Mail className="w-3 h-3" /> {email}
          </a>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <div className={`transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-[0_2px_24px_rgba(0,0,0,0.11)]" : "bg-white shadow-[0_1px_0_#e5e7eb]"}`}>
        <div className="container mx-auto px-4 h-[68px] flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" onClick={closeAll} className="shrink-0 flex items-center">
            <img
              src="https://www.primepackagingboxes.com/wp-content/uploads/2026/04/PRIME-PACKAGING-BOXES-3.svg"
              alt="Prime Packaging Boxes"
              className="h-[52px] w-auto"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                const d = document.createElement("div");
                d.innerHTML = `<div style="display:flex;align-items:center;gap:8px"><div style="background:#e63329;color:white;font-weight:900;font-size:17px;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(230,51,41,0.35)">P</div><div><div style="font-weight:800;font-size:12px;color:#1a2f5a;letter-spacing:0.06em;line-height:1.2">PRIME PACKAGING<br/>BOXES</div><div style="font-size:8px;color:#aaa;letter-spacing:0.18em;text-transform:uppercase;margin-top:1px">Next Level Packaging</div></div></div>`;
                t.parentElement?.appendChild(d.firstElementChild!);
              }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            <NavLink href="/" label="Home" active={isActive("/")} onClick={closeAll} />
            <NavLink href="/faq" label="FAQ" active={isActive("/faq")} onClick={closeAll} />

            {/* Products mega-menu */}
            <div ref={dropRef} className="relative" onMouseEnter={openDrop} onMouseLeave={closeDrop}>
              <button
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg font-semibold text-sm transition-colors ${dropOpen ? "text-[#e63329] bg-[#e63329]/6" : "text-gray-700 hover:text-[#e63329] hover:bg-gray-50"}`}
              >
                Products
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropOpen ? "rotate-180 text-[#e63329]" : ""}`} />
              </button>

              {dropOpen && (
                <div
                  className="fixed z-[9999]"
                  style={{
                    top: "96px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "min(1080px, calc(100vw - 32px))",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.07)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    animation: "megaFadeIn 0.18s ease-out",
                  }}
                  onMouseEnter={openDrop}
                  onMouseLeave={closeDrop}
                >
                  {/* Top bar */}
                  <div className="bg-[#0d1f3c] px-7 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-[#e63329] rounded-md flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-white font-bold text-sm tracking-wide">All Custom Packaging Products</span>
                    </div>
                    <Link href="/products" onClick={closeAll}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#FFB800] hover:text-yellow-300 transition-colors">
                      View All Products <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Body — CSS grid: 3 equal link cols + 1 featured col */}
                  <div className="bg-white" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 260px" }}>

                    {/* Col 1 — By Industry */}
                    <div style={{ padding: "20px 16px 20px 20px", borderRight: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #eff6ff" }}>
                        <div style={{ width: 24, height: 24, background: "#eff6ff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Package size={13} color="#3b82f6" />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "#3b82f6" }}>By Industry</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 8px" }}>
                        {BY_INDUSTRY.map(item => (
                          <Link key={item.slug} href={`/${item.slug}`} onClick={closeAll}
                            style={{ display: "block", padding: "5px 8px", borderRadius: 6, fontSize: 12, color: "#4b5563", textDecoration: "none", transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                            onMouseEnter={e => { (e.target as HTMLElement).style.background = "#fef2f2"; (e.target as HTMLElement).style.color = "#e63329"; }}
                            onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; (e.target as HTMLElement).style.color = "#4b5563"; }}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Col 2 — Hot Selling */}
                    <div style={{ padding: "20px 16px", borderRight: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #fff7ed" }}>
                        <div style={{ width: 24, height: 24, background: "#fff7ed", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Flame size={13} color="#f97316" />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "#f97316" }}>Hot Selling</span>
                      </div>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {HOT_SELLING.map(item => (
                          <li key={item.slug}>
                            <Link href={`/${item.slug}`} onClick={closeAll}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: 6, fontSize: 12.5, color: "#4b5563", textDecoration: "none", transition: "background 0.15s, color 0.15s" }}
                              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fef2f2"; el.style.color = "#e63329"; const arrow = el.querySelector("svg") as SVGElement | null; if (arrow) { arrow.style.opacity = "1"; arrow.style.color = "#e63329"; } }}
                              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#4b5563"; const arrow = el.querySelector("svg") as SVGElement | null; if (arrow) { arrow.style.opacity = "0"; } }}>
                              <span>{item.label}</span>
                              <ArrowRight size={11} color="#e63329" style={{ opacity: 0, flexShrink: 0, transition: "opacity 0.15s" }} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Col 3 — By Style */}
                    <div style={{ padding: "20px 16px", borderRight: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #faf5ff" }}>
                        <div style={{ width: 24, height: 24, background: "#faf5ff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Palette size={13} color="#a855f7" />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "#a855f7" }}>By Style / Material</span>
                      </div>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {BOX_BY_STYLE.map(item => (
                          <li key={item.slug}>
                            <Link href={`/${item.slug}`} onClick={closeAll}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: 6, fontSize: 12.5, color: "#4b5563", textDecoration: "none", transition: "background 0.15s, color 0.15s" }}
                              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#fef2f2"; el.style.color = "#e63329"; const arrow = el.querySelector("svg") as SVGElement | null; if (arrow) { arrow.style.opacity = "1"; } }}
                              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#4b5563"; const arrow = el.querySelector("svg") as SVGElement | null; if (arrow) { arrow.style.opacity = "0"; } }}>
                              <span>{item.label}</span>
                              <ArrowRight size={11} color="#e63329" style={{ opacity: 0, flexShrink: 0, transition: "opacity 0.15s" }} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Col 4 — Featured + Promo */}
                    <div style={{ padding: "20px 16px", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #fefce8" }}>
                        <div style={{ width: 24, height: 24, background: "#fefce8", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Star size={13} color="#eab308" fill="#eab308" />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "#ca8a04" }}>Featured</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {FEATURED_IN_MENU.map(f => (
                          <Link key={f.slug} href={`/${f.slug}`} onClick={closeAll}
                            style={{ display: "block", background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", textDecoration: "none", transition: "box-shadow 0.2s, border-color 0.2s" }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 4px 16px rgba(230,51,41,0.15)"; el.style.borderColor = "rgba(230,51,41,0.4)"; }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.borderColor = "#e5e7eb"; }}>
                            <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "#f3f4f6" }}>
                              <img src={f.img} alt={f.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                                onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.07)"; }}
                                onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
                                onError={e => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
                            </div>
                            <div style={{ padding: "7px 8px", fontSize: 11, fontWeight: 600, color: "#374151" }}>{f.label}</div>
                          </Link>
                        ))}
                      </div>
                      {/* Promo */}
                      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(26,47,90,0.15)", marginTop: "auto" }}>
                        <div style={{ background: "#1a2f5a", padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ width: 28, height: 28, background: "#e63329", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Palette size={13} color="#fff" />
                          </div>
                          <div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>Free Design Support</div>
                            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10.5, marginTop: 3, lineHeight: 1.5 }}>In-house designers, unlimited revisions, no charge.</div>
                          </div>
                        </div>
                        <Link href="/get-a-quote" onClick={closeAll}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#e63329", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "9px 0", textDecoration: "none", transition: "background 0.15s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#c42a21"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#e63329"; }}>
                          Get a Free Quote <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            <NavLink href="/blog"    label="Blog"    active={isActive("/blog")}    onClick={closeAll} />
            <NavLink href="/about"   label="About"   active={isActive("/about")}   onClick={closeAll} />
            <NavLink href="/contact" label="Contact" active={isActive("/contact")} onClick={closeAll} />
          </nav>

          {/* Desktop CTA group */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a href="/customer-portal/"
              className="flex items-center gap-1.5 text-xs font-bold text-[#1a2f5a] bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:text-[#e63329] transition-all px-3 py-1.5 rounded-lg">
              <User className="w-3.5 h-3.5" /> Customer Portal
            </a>
            <Link href="/request-sample" onClick={closeAll}
              className="text-xs font-bold text-gray-500 hover:text-[#e63329] transition-colors px-3 py-1.5">
              Free Samples
            </Link>
            <a href={telLink}
              className="flex items-center gap-1.5 text-sm font-bold text-[#1a2f5a] hover:text-[#e63329] transition-colors">
              <Phone className="w-4 h-4" /> {phone}
            </a>
            <Link href="/get-a-quote" onClick={closeAll}
              className="bg-[#e63329] hover:bg-[#c42a21] text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-[0_4px_14px_rgba(230,51,41,0.35)] hover:shadow-[0_4px_20px_rgba(230,51,41,0.45)] flex items-center gap-1.5">
              Get a Quote <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#1a2f5a] hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-2xl max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col divide-y divide-gray-100">
            <Link href="/" onClick={closeAll} className="px-5 py-4 font-semibold text-gray-800 hover:text-[#e63329] flex items-center justify-between">
              Home
            </Link>
            <div>
              <button onClick={() => setMobileProdOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 font-semibold text-gray-800 hover:text-[#e63329]">
                Products
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileProdOpen ? "rotate-180 text-[#e63329]" : "text-gray-400"}`} />
              </button>
              {mobileProdOpen && (
                <div className="bg-gray-50 px-5 pb-5 pt-1">
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { heading: "By Industry", items: BY_INDUSTRY },
                      { heading: "Hot Selling", items: HOT_SELLING },
                      { heading: "By Style", items: BOX_BY_STYLE },
                    ].map(section => (
                      <div key={section.heading}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{section.heading}</div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                          {section.items.map(item => (
                            <Link key={item.slug} href={`/${item.slug}`} onClick={closeAll}
                              className="text-sm text-gray-600 hover:text-[#e63329] py-0.5">
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/products" onClick={closeAll}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-[#e63329]">
                    <ArrowRight className="w-4 h-4" /> View All Products
                  </Link>
                </div>
              )}
            </div>
            <Link href="/faq"     onClick={closeAll} className="px-5 py-4 font-semibold text-gray-800 hover:text-[#e63329]">FAQ</Link>
            <Link href="/blog"    onClick={closeAll} className="px-5 py-4 font-semibold text-gray-800 hover:text-[#e63329]">Blog</Link>
            <Link href="/about"   onClick={closeAll} className="px-5 py-4 font-semibold text-gray-800 hover:text-[#e63329]">About</Link>
            <Link href="/contact" onClick={closeAll} className="px-5 py-4 font-semibold text-gray-800 hover:text-[#e63329]">Contact</Link>
            <Link href="/request-sample" onClick={closeAll} className="px-5 py-4 font-semibold text-gray-800 hover:text-[#e63329]">Free Samples</Link>
            <a href="/customer-portal/" onClick={closeAll} className="px-5 py-4 font-semibold text-blue-600 hover:text-[#e63329] flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Portal
            </a>
            <div className="p-5 flex flex-col gap-3 bg-gray-50">
              <a href={telLink}
                className="flex items-center justify-center gap-2 border-2 border-[#1a2f5a] text-[#1a2f5a] py-3 rounded-xl font-bold text-sm hover:bg-[#1a2f5a] hover:text-white transition-all">
                <Phone className="w-4 h-4" /> {phone}
              </a>
              <Link href="/get-a-quote" onClick={closeAll}
                className="bg-[#e63329] hover:bg-[#c42a21] text-white py-3 rounded-xl font-bold text-center text-sm shadow-md flex items-center justify-center gap-2 transition-all">
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .group-hover\\:scale-108:hover img { transform: scale(1.08); }
      `}</style>
    </header>
  );
}

function NavLink({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      className={`nav-link-ul px-3.5 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 ${active ? "text-[#e63329] bg-[#e63329]/6" : "text-gray-700 hover:text-[#e63329] hover:bg-gray-50"}`}>
      {label}
    </Link>
  );
}

// memo: Header has no external props — never re-renders on parent state changes
export const Header = memo(_Header);
