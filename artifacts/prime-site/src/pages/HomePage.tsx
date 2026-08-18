import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Star, ArrowRight, Zap, Shield, Truck, Palette, MessageSquare, Lock, Recycle,
  Package, Phone, Cookie, Leaf, Gift, ShoppingBag, Package2, Coffee, Shirt,
  Sparkles, CheckCircle,
} from "lucide-react";
import { ProductCard } from "../components/ui/ProductCard";
import { CategoryCard } from "../components/ui/CategoryCard";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { useGetFeaturedProducts, useGetPage, useListCategories, useListProducts } from "@workspace/api-client-react";
import { DEFAULT_OG_IMAGE, useSEO, useSchemaOrg } from "../lib/useSEO";
import { useSettings } from "../lib/useSettings";
import { responsiveImageProps } from "../lib/responsiveImage";
import { InlinePageOverrides } from "../components/ui/InlinePageOverrides";
import { parseInlineDocument } from "../lib/inlineContent";

/* ── Count-up number animation ──────────────────────────────────────────────── */
function CountUp({ to, suffix = "", decimals = 0, delay = 0 }: { to: number; suffix?: string; decimals?: number; delay?: number }) {
  const [val, setVal] = useState(0);
  const elRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = elRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const t = setTimeout(() => {
        const start = performance.now();
        const dur = 1400;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(parseFloat((to * eased).toFixed(decimals)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, delay);
      return () => clearTimeout(t);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, delay, decimals]);
  return <span ref={elRef}>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}{suffix}</span>;
}

/* ── Animated stats strip ───────────────────────────────────────────────────── */
function StatsSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const items = [
    { to: 500, suffix: "+",  decimals: 0, label: "Happy Clients"    },
    { to: 1,   suffix: "M+", decimals: 0, label: "Boxes Shipped"    },
    { to: 4.9, suffix: "★",  decimals: 1, label: "Average Rating"   },
    { to: 2,   suffix: "",   decimals: 0, label: "Countries Served" },
  ];
  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {items.map((s, i) => (
            <div key={s.label} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(18px)", transition: `opacity 0.5s ease ${i * 0.11}s, transform 0.5s ease ${i * 0.11}s` }}>
              <div className="text-3xl md:text-4xl font-extrabold text-[#e63329] tabular-nums leading-none mb-1">
                {visible ? <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals} delay={i * 110} /> : `0${s.suffix}`}
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Hero mosaic — USA brand-relevant premium packaging
const HERO_MOSAIC = [
  { src: "/api/uploads/luxury-chocolate-boxes.webp",               alt: "Luxury Chocolate Boxes"    },
  { src: "/api/uploads/custom-lip-gloss-boxes-with-logo.webp",     alt: "Lip Gloss Boxes"           },
  { src: "/api/uploads/custom-perfume-boxes-with-logo.webp",       alt: "Perfume Boxes"             },
  { src: "/api/uploads/ring-boxes-1.webp",                         alt: "Ring Boxes"                },
  { src: "/api/uploads/luxury-candle-cloche-glass-dome-box.webp",  alt: "Luxury Candle Boxes"       },
  { src: "/api/uploads/custom-magnetic-closure-boxes-with-logo.webp", alt: "Magnetic Closure Boxes" },
];

const STATS = [
  { num: "500+", label: "Happy Clients" },
  { num: "1M+",  label: "Boxes Shipped" },
  { num: "4.9★", label: "Avg Rating" },
  { num: "2",    label: "Countries (US & UK)" },
];

const FEATURES = [
  { icon: Palette, title: "Free Design Support",   desc: "In-house designers create your print-ready artwork at zero cost. Unlimited revisions." },
  { icon: Zap,     title: "7–10 Day Turnaround",   desc: "Industry-leading speed. Rush 3–5 day options available when you need it fast." },
  { icon: Shield,  title: "Quality Guaranteed",    desc: "Every order quality-inspected before it ships. If it's not perfect, we reprint it free." },
  { icon: Truck,   title: "Free US & UK Shipping",  desc: "Free shipping across all 50 US states and the United Kingdom on every order. No minimums." },
];

const INDUSTRIES = [
  { Icon: Sparkles,    label: "Cosmetics & Beauty" },
  { Icon: Cookie,      label: "Food & Beverage" },
  { Icon: Shirt,       label: "Apparel & Fashion" },
  { Icon: Leaf,        label: "Eco & Organic" },
  { Icon: Gift,        label: "Gift & Luxury" },
  { Icon: ShoppingBag, label: "Retail & E-Commerce" },
  { Icon: Package2,    label: "Subscription Boxes" },
  { Icon: Coffee,      label: "Tea & Coffee" },
];

const TRUST_ITEMS = [
  "Free Design",
  "100 Unit MOQ",
  "7–10 Day Turnaround",
  "Free US & UK Shipping",
];

export default function HomePage() {
  useSEO({
    title: "Custom Packaging Boxes | Free Design, Low MOQ, Fast US & UK Shipping",
    description: "Premium custom packaging boxes with free design support, low minimums from 100 units, and 7–10 day turnaround. Trusted by 500+ brands across the USA and UK. Get a free quote today.",
    ogType: "website",
    ogImage: DEFAULT_OG_IMAGE,
    keywords: "custom packaging boxes, custom boxes USA, custom boxes UK, custom mailer boxes, branded packaging, custom box printing, packaging boxes UK, custom packaging UK",
  });

  useSchemaOrg({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Prime Packaging Boxes",
    url: "https://www.primepackagingboxes.com",
     logo: "https://www.primepackagingboxes.com/api/uploads/prime-packaging-logo-transparent.svg",
    contactPoint: [
      { "@type": "ContactPoint", telephone: "+1-818-758-4076", contactType: "customer service", areaServed: "US", availableLanguage: "English" },
      { "@type": "ContactPoint", telephone: "+1-818-758-4076", contactType: "customer service", areaServed: "GB", availableLanguage: "English" },
    ],
    address: { "@type": "PostalAddress", streetAddress: "444 Alaska Avenue Suite", addressLocality: "Torrance", addressRegion: "CA", postalCode: "90503", addressCountry: "US" },
    areaServed: ["US", "GB"],
    sameAs: ["https://www.facebook.com/primepackagingboxes", "https://www.instagram.com/primepackagingboxes/"],
  });

  const { data: featuredProducts, isLoading: isLoadingProducts, isError: featuredError, refetch: refetchFeatured } = useGetFeaturedProducts();
  const { data: showcaseProducts, isLoading: isLoadingShowcase, isError: showcaseError, refetch: refetchShowcase } = useListProducts({
    showcase: "true", limit: 12,
  });
  const { data: categoriesData, isLoading: isLoadingCategories, isError: categoriesError, refetch: refetchCategories } = useListCategories();
  const categories = (categoriesData || []).filter(category => category.isFeatured);
  const { data: settings } = useSettings();
  const { data: homePage } = useGetPage("home");
  const phone = settings?.phone || "818-758-4076";
  const homeInline = parseInlineDocument(homePage?.content || "");

  return (
    <InlinePageOverrides overrides={homeInline.overrides}>

      {/* ── HERO ── */}
      <section className="relative bg-[#0d1f3c] overflow-hidden min-h-[620px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Radial glow — depth & warmth */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[380px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(230,51,41,0.12) 0%, transparent 70%)" }} />

        <div className="container mx-auto px-4 py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Copy */}
            <div>
              <span className="inline-flex items-center gap-2 bg-[#e63329]/15 border border-[#e63329]/30 text-[#ff6b63] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e63329] animate-pulse" />
                #1 Custom Packaging in the USA & UK
              </span>
              <h1 className="font-display text-[2.35rem] sm:text-[2.7rem] md:text-[3.45rem] lg:text-[4rem] font-extrabold text-white leading-[1.04] mb-6 max-w-[680px]">
                Packaging that makes
                <span className="block">your brand <span className="text-[#ff6b63]">unforgettable.</span></span>
              </h1>
              <p className="text-white/85 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
                Premium custom boxes with free design support, 100-unit minimums, and 7–10 day turnaround. Over 500 brands across the USA &amp; UK trust Prime Packaging to elevate their unboxing experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/get-a-quote"
                  className="btn-shimmer inline-flex items-center justify-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-8 py-4 rounded-lg font-bold text-sm transition-all shadow-[0_4px_24px_rgba(230,51,41,0.4)] hover:shadow-[0_4px_32px_rgba(230,51,41,0.5)]">
                  Get a Free Quote <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-lg font-bold text-sm transition-all">
                  Browse All Products
                </Link>
              </div>
              {/* Trust row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_ITEMS.map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-white/70 text-sm font-medium">
                    <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.3" />
                      <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Product Image Grid — desktop */}
            <div className="hidden lg:grid grid-cols-3 grid-rows-2 gap-3">
              {HERO_MOSAIC.slice(0, 6).map((img, i) => (
                <div key={i} className={`rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-xl ${i === 0 ? "row-span-2" : ""}`}>
                  <img
                    {...responsiveImageProps(img.src)}
                    alt={img.alt}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: i === 0 ? "1/2.15" : "1/1" }}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              ))}
            </div>

            {/* Mobile product preview — 3 square images below CTA */}
            <div className="flex lg:hidden gap-2.5 mt-2">
              {HERO_MOSAIC.slice(0, 3).map((img, i) => (
                <div key={i} className="flex-1 rounded-xl overflow-hidden border border-white/15 shadow-lg" style={{ aspectRatio: "1/1" }}>
                  <img {...responsiveImageProps(img.src)} alt={img.alt} width={500} height={500} className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-[#1a2f5a] border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center divide-x divide-white/10">
            {[
              { Icon: Palette, text: "Free Design Support" },
              { Icon: Zap,     text: "7–10 Day Turnaround" },
              { Icon: Shield,  text: "100% Quality Guarantee" },
              { Icon: Truck,   text: "Free US & UK Shipping" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 px-6 py-4">
                <Icon className="w-4 h-4 text-[#e63329] shrink-0" />
                <span className="text-white/80 text-sm font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <StatsSection />

      {/* ── FEATURE CARDS ── */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-2">WHY CHOOSE US</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a]">We're Not Just a Printer — We're Your Packaging Partner</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">From the first sketch to the final delivery, our in-house team handles every step — so you get faster turnarounds, better pricing, and packaging your brand is proud of.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="group bg-gray-50 hover:bg-[#1a2f5a] border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-12 h-12 bg-[#e63329]/10 group-hover:bg-[#e63329]/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-6 h-6 text-[#e63329]" />
                </div>
                <h3 className="font-bold text-[#1a2f5a] group-hover:text-white text-base mb-2 transition-colors">{f.title}</h3>
                <p className="text-gray-500 group-hover:text-white/70 text-sm leading-relaxed transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-12 md:py-20 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-2">MOST POPULAR</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a]">Our Best-Selling Packaging</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1.5 text-[#e63329] font-bold text-sm hover:gap-2.5 transition-all shrink-0">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {isLoadingProducts
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredError ? (
                <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-800">
                  Best-selling products could not be loaded. <button onClick={() => void refetchFeatured()} className="font-bold underline">Try again</button>
                </div>
              ) : (featuredProducts || []).slice(0, 8).map(p => (
                <div key={p.id} data-inline-dynamic="true">
                  <ProductCard product={p} />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGING SHOWCASE ── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-2">PRODUCT SHOWCASE</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a]">Packaging for Every Product & Industry</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">Explore our most popular custom box styles — each fully customizable to your brand, size, and finish.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
             {isLoadingShowcase
               ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />)
                : showcaseError ? (
                  <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-800">
                    Showcase products could not be loaded. <button onClick={() => void refetchShowcase()} className="font-bold underline">Try again</button>
                  </div>
                ) : (showcaseProducts || []).slice(0, 12).map(p => (
               <div key={p.id} data-inline-dynamic="true">
               <Link href={`/${p.slug}`} className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-square shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <img
                   {...responsiveImageProps(p.imageUrl || "/api/uploads/placeholder-product.webp")}
                  alt={p.name}
                   width={500}
                   height={500}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                   decoding="async"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                     t.style.opacity = "0.3";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-white font-bold text-xs block">{p.name}</span>
                  <span className="text-white/70 text-[10px]">View Product →</span>
                </div>
              </Link>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="py-12 md:py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-2">BROWSE BY TYPE</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a]">Shop by Category</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">Find the perfect packaging solution for your specific industry and product type.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {isLoadingCategories
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" style={{ aspectRatio: "4/3" }} />)
               : categoriesError ? (
                 <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-800">
                   Categories could not be loaded. <button onClick={() => void refetchCategories()} className="font-bold underline">Try again</button>
                 </div>
               ) : categories.slice(0, 8).map(c => (
                 <div key={c.id} data-inline-dynamic="true">
                   <CategoryCard category={c} productCount={c.productCount} />
                 </div>
               ))}
          </div>
          {categories.length > 8 && (
            <div className="text-center mt-10">
              <Link href="/products" className="inline-flex items-center gap-2 border-2 border-[#1a2f5a] text-[#1a2f5a] hover:bg-[#1a2f5a] hover:text-white px-8 py-3 rounded-lg font-bold transition-all text-sm">
                View All {categories.length} Categories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-12 md:py-20 bg-[#1a2f5a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-2">SIMPLE PROCESS</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">How It Works</h2>
            <p className="text-white/50 mt-2 max-w-xl mx-auto text-sm">From quote to delivery in as little as 7 business days.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-white/10" />
            {[
              { n: "01", Icon: MessageSquare, title: "Request a Quote",    desc: "Tell us your box type, size, quantity, and deadline. We respond within 2 hours." },
              { n: "02", Icon: Palette,        title: "Free Design Review", desc: "Our designers create a print-ready dieline and 3D mockup at no cost. Unlimited revisions." },
              { n: "03", Icon: CheckCircle,    title: "Approve & Produce",  desc: "Once approved, production starts immediately with full quality control at every stage." },
              { n: "04", Icon: Truck,          title: "Ship to Your Door",  desc: "Free shipping across the USA (all 50 states) and the United Kingdom. Track your order every step of the way." },
            ].map(step => (
              <div key={step.n} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#e63329] text-white flex flex-col items-center justify-center mb-5 shadow-[0_8px_24px_rgba(230,51,41,0.35)]">
                  <step.Icon className="w-7 h-7 mb-1" />
                  <span className="text-xs font-black opacity-60">{step.n}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-8 py-4 rounded-lg font-bold text-sm transition-all shadow-lg">
              Start Your Order <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES — Icon Grid ── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-2">INDUSTRIES SERVED</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a]">We Pack Every Industry</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xl mx-auto">From Shopify startups to nationwide CPG brands — we've packaged it all.</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 mb-10">
            {INDUSTRIES.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-[#e63329]/10 group-hover:border-[#e63329]/20 transition-all duration-200 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-[#e63329] transition-colors" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 group-hover:text-[#1a2f5a] text-center leading-tight transition-colors">{label}</span>
              </div>
            ))}
          </div>
          {/* More industries as pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Electronics", "CBD & Hemp", "Supplements", "Jewelry",
              "Subscription Boxes", "Pharmaceuticals", "Tea & Coffee", "Arts & Crafts",
              "Pet Products", "Sports & Fitness", "Candles & Home", "Bakery & Sweets",
            ].map(ind => (
              <span key={ind} className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3.5 py-2 rounded-full hover:border-[#e63329] hover:text-[#e63329] hover:bg-[#e63329]/5 transition-all cursor-default">
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MATERIALS STRIP ── */}
      <section className="py-12 bg-[#f8f9fc] border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-[#1a2f5a]">Premium Materials & Finishing Options</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Corrugated Board", "Rigid Board", "Kraft Paper",
              "Foil Stamping", "Spot UV", "Embossing",
              "Full CMYK Print", "Soft-Touch Coating", "Magnetic Closures",
              "Window Cutouts", "FSC Certified", "Eco-Friendly Ink",
            ].map(m => (
              <span key={m} className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm hover:border-[#e63329] hover:text-[#e63329] transition-colors cursor-default">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-2">TESTIMONIALS</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a]">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-2 text-sm font-bold text-gray-600">4.9 / 5 from 200+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Jenkins",    company: "Lumina Cosmetics, LA",   quote: "The quality of our custom mailer boxes exceeded our expectations. The print is crisp, and the structural integrity is perfect. Our unboxing experience has never been better!", initials: "SJ" },
              { name: "David Chen",       company: "Roast Coffee Co., NYC",  quote: "Prime Packaging was incredible to work with. Their design team helped us fix a structural issue with our old packaging, and the new boxes assemble twice as fast. Turnaround was only 8 days!", initials: "DC" },
              { name: "Elena Rodriguez", company: "Bloom Botanicals, TX",   quote: "Fast turnaround and excellent communication throughout. The foil stamping on our rigid boxes looks incredibly premium. We've had so many customers comment on the packaging. Highly recommend!", initials: "ER" },
            ].map(t => (
              <div key={t.name} className="bg-white p-7 rounded-2xl border border-gray-100 shadow-md flex flex-col hover:shadow-xl transition-shadow">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic flex-1">"{t.quote}"</p>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a2f5a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-[#1a2f5a] text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE STRIP ── */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { Icon: Lock,    title: "100% Secure Checkout",   desc: "SSL encrypted & safe" },
              { Icon: Recycle, title: "Eco-Friendly Materials",  desc: "FSC certified stocks" },
              { Icon: Palette, title: "Free Design Included",    desc: "In-house design team" },
              { Icon: Package, title: "Free US & UK Shipping",   desc: "All 50 US states + United Kingdom" },
            ].map(g => (
              <div key={g.title} className="flex flex-col items-center group">
                <div className="w-12 h-12 rounded-xl bg-[#e63329]/10 flex items-center justify-center mb-2.5 group-hover:bg-[#e63329]/20 transition-colors">
                  <g.Icon className="w-5.5 h-5.5 text-[#e63329]" style={{ width: "1.375rem", height: "1.375rem" }} />
                </div>
                <div className="font-bold text-[#1a2f5a] text-sm">{g.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{g.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG TEASER ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-1">FROM THE BLOG</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#1a2f5a]">Packaging Tips & Insights</h2>
            </div>
            <Link href="/blog" className="text-[#e63329] font-bold text-sm hover:underline hidden md:block">Read All Articles →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Why Custom Mailer Boxes Are the #1 Marketing Tool",           href: "/blog/why-custom-mailer-boxes-are-top-marketing-tool", tag: "Mailer Boxes" },
              { title: "10 Packaging Finishes That Make Your Box Look Premium",        href: "/blog/packaging-finishes-premium-look",                 tag: "Design Tips" },
              { title: "Eco-Friendly Packaging: How We Help Brands Go Green",         href: "/blog/eco-friendly-packaging-sustainable-options",       tag: "Sustainability" },
            ].map(b => (
              <Link key={b.href} href={b.href} className="group block bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-gray-200 p-6 transition-all hover:shadow-md">
                <span className="inline-block bg-[#e63329]/10 text-[#e63329] text-xs font-bold px-2.5 py-1 rounded-full mb-3">{b.tag}</span>
                <h3 className="font-bold text-[#1a2f5a] text-sm leading-snug group-hover:text-[#e63329] transition-colors">{b.title}</h3>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-3 group-hover:text-[#e63329] transition-colors">
                  Read Article <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ── */}
      <section className="py-20 bg-[#e63329] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Decorative shapes */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#c42a21]/50 blur-3xl" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <CheckCircle className="w-3.5 h-3.5" /> Free Quote in Under 2 Hours
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            Ready to Elevate Your<br />Brand's Packaging?
          </h2>
          <p className="text-white/80 mb-10 max-w-xl mx-auto text-base leading-relaxed">
            Join 500+ brands across the USA &amp; UK that trust Prime Packaging Boxes. Free design support, low minimums, fast turnaround — no commitment needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-a-quote" className="inline-flex items-center justify-center gap-2 bg-white text-[#e63329] hover:bg-gray-50 px-8 py-4 rounded-lg font-bold text-sm transition-all shadow-xl hover:shadow-2xl">
              Get a Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={`tel:${phone}`} className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-bold text-sm transition-all">
              <Phone className="w-4 h-4" /> Call {phone}
            </a>
          </div>
        </div>
      </section>

    </InlinePageOverrides>
  );
}
