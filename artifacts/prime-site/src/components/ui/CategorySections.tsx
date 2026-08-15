import { Link } from "wouter";
import {
  CheckCircle, ArrowRight, Phone, Package, Palette, Truck,
  Zap, ShieldCheck, Star, Award, Leaf, Users, Layers,
  Printer, Ruler, Box, Gift, Heart, MessageSquare,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useSettings } from "../../lib/useSettings";

// ─── Why Choose Us ───────────────────────────────────────────────
const WHY_CARDS = [
  { icon: Palette,    color: "#3b82f6", bg: "#eff6ff", title: "Free Custom Design", desc: "Our in-house design team creates your artwork at no charge. Unlimited revisions until you love it." },
  { icon: Truck,      color: "#10b981", bg: "#ecfdf5", title: "Free US & UK Shipping", desc: "Every order ships free across the USA (all 50 states) and the United Kingdom. Full order tracking included." },
  { icon: Zap,        color: "#f97316", bg: "#fff7ed", title: "7–10 Day Turnaround",desc: "From approved artwork to your door — most orders complete within 7 to 10 business days." },
  { icon: ShieldCheck,color: "#e63329", bg: "#fef2f2", title: "Quality Guaranteed", desc: "Every box is inspected before shipping. Not satisfied? We'll reprint or refund — no questions asked." },
  { icon: Award,      color: "#a855f7", bg: "#faf5ff", title: "100-Unit Minimums",  desc: "Start small, scale fast. Premium custom packaging from as low as 100 units per order." },
  { icon: Leaf,       color: "#16a34a", bg: "#f0fdf4", title: "Eco-Friendly Options",desc: "FSC-certified stocks, soy-based inks, and 100% recyclable kraft boards available on all styles." },
];

// ─── Finish Options ───────────────────────────────────────────────
const FINISHES = [
  { label: "Gloss Lamination",      desc: "Bright, vivid colors with a shiny protective coat",   emoji: "✨" },
  { label: "Matte Lamination",      desc: "Soft, premium tactile feel — popular for luxury brands", emoji: "🖤" },
  { label: "Soft-Touch Coating",    desc: "Velvety, ultra-premium feel that customers love",        emoji: "🫧" },
  { label: "Gold / Silver Foiling", desc: "Metallic foil stamping for logos and key design elements", emoji: "🥇" },
  { label: "Spot UV Coating",       desc: "Selective gloss highlights over a matte base for contrast", emoji: "💫" },
  { label: "Embossing / Debossing", desc: "3D raised or sunken effect on logos and text",             emoji: "🔲" },
  { label: "Window Die-Cut",        desc: "Clear PVC window to show your product inside the box",     emoji: "🪟" },
  { label: "Inside Printing",       desc: "Full color or spot print on the interior for unboxing wow", emoji: "🎨" },
];

// ─── Process Steps ────────────────────────────────────────────────
const STEPS = [
  { num: "01", title: "Submit Your Brief",    desc: "Tell us your box size, quantity, material, and design concept. Our team responds within 4 business hours.", icon: MessageSquare },
  { num: "02", title: "Design & Proof",       desc: "Our designer creates your dieline and full-color artwork. We send a digital proof for your approval before printing.", icon: Palette },
  { num: "03", title: "Production & QC",      desc: "Once you approve, we go to print. Every batch undergoes quality inspection before packaging for shipment.", icon: Printer },
  { num: "04", title: "Delivered to Your Door",desc: "Your finished boxes are packed and shipped free to your US address within 7–10 business days of art approval.", icon: Truck },
];

// ─── Material Options ─────────────────────────────────────────────
const MATERIALS = [
  { title: "SBS Paperboard",     desc: "300–400 gsm smooth white board ideal for retail and cosmetic packaging.", color: "#3b82f6" },
  { title: "Kraft Paperboard",   desc: "Natural brown eco-friendly board with excellent print quality.", color: "#92400e" },
  { title: "Corrugated Board",   desc: "Single/double wall fluted board for shipping and heavy-duty use.", color: "#f97316" },
  { title: "Rigid Chipboard",    desc: "1000–2000 gsm luxury board for magnetic closure and gift boxes.", color: "#7c3aed" },
  { title: "Cardboard (350gsm)", desc: "Cost-effective standard board for FMCG and general retail.", color: "#16a34a" },
  { title: "Custom Thickness",   desc: "Specify your exact caliper — we match custom substrate requirements.", color: "#e63329" },
];

// ─── Industries ───────────────────────────────────────────────────
const INDUSTRIES = [
  { icon: "🛍️", label: "Retail & Fashion" },
  { icon: "🍫", label: "Food & Beverage" },
  { icon: "💊", label: "Health & Wellness" },
  { icon: "💄", label: "Beauty & Cosmetics" },
  { icon: "💎", label: "Luxury & Jewelry" },
  { icon: "📦", label: "E-Commerce" },
  { icon: "🎁", label: "Gifts & Events" },
  { icon: "🧴", label: "CBD & Wellness" },
  { icon: "🖥️", label: "Electronics" },
  { icon: "🍕", label: "Food Delivery" },
  { icon: "🌿", label: "Eco Brands" },
  { icon: "🎓", label: "Corporate" },
];

// ─── Testimonials ─────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Jessica T.", role: "Founder, Bloom Beauty Co.",
    text: "The quality blew me away. From the design process to delivery, everything was seamless. My customers keep complimenting the unboxing experience.",
    stars: 5,
  },
  {
    name: "Marcus L.", role: "Operations Manager, NutraPure",
    text: "We needed 500 boxes fast. Prime Packaging delivered in 8 days with zero quality issues. Will be ordering again and recommending to every vendor we know.",
    stars: 5,
  },
  {
    name: "Sarah K.", role: "E-commerce Director, Homewise",
    text: "The free design support saved us thousands. Our designer was responsive, creative, and nailed our brand on the first revision. Can't ask for more.",
    stars: 5,
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#e63329] shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white border-t border-gray-50">
          <p className="text-gray-600 text-sm leading-relaxed mt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────
export function CategorySections({ categoryName, productCount = 0 }: { categoryName: string; productCount?: number }) {
  const { data: settings } = useSettings();
  const phone = settings?.phone || "818-758-4076";
  const cn = categoryName;

  const FAQS = [
    { q: `What is the minimum order quantity for ${cn}?`, a: `Our minimum order quantity for ${cn} is 100 units. This applies to all sizes, styles, and custom designs. There is no maximum — we handle orders from 100 to 500,000+ units.` },
    { q: `How long does it take to produce ${cn}?`, a: `Standard production is 7–10 business days from the date your artwork is approved. Rush production (4–6 days) is available on select styles. Shipping typically adds 2–5 business days depending on your US location.` },
    { q: `Do you provide free design support for ${cn}?`, a: `Yes — every order includes free custom design support by our in-house design team. We create your full dieline, layout, and artwork at no charge. Unlimited revisions are included until you're completely satisfied.` },
    { q: `What materials are available for ${cn}?`, a: `We offer SBS paperboard (300–400 gsm), natural kraft, corrugated (single/double wall), rigid luxury chipboard, and custom thickness options. All materials are available with eco-friendly, FSC-certified variants.` },
    { q: `Can I order a sample before my full run?`, a: `Absolutely. We offer free sample packs on select products — request yours via the Free Samples page. Alternatively, we can produce a pre-production sample (printed proof) for a small charge before your full run begins.` },
    { q: `Do you ship ${cn} to all US states?`, a: `Yes — we offer free shipping to all 50 US states including Alaska and Hawaii. International shipping is available on request. All orders include tracking from our facility to your door.` },
  ];

  return (
    <>

      {/* 1 ── Why Choose Us ─────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-[#e63329]/10 text-[#e63329] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Why Prime Packaging</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Why Brands Choose Us for {cn}</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">Everything you need to launch premium custom packaging — without the premium price tag.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {WHY_CARDS.map(card => (
              <div key={card.title} className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: card.bg }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div className="font-bold text-gray-800 mb-1.5 text-sm">{card.title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 ── How It Works ──────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-[#1a2f5a]/10 text-[#1a2f5a] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Simple Process</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">How to Order {cn}</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">From brief to doorstep in 4 easy steps — no experience needed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200" style={{ zIndex: 0 }} />
            {STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm" style={{ zIndex: 1 }}>
                <div className="w-14 h-14 rounded-2xl bg-[#1a2f5a] flex flex-col items-center justify-center mb-4 shadow-lg">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-[10px] font-black text-[#e63329] tracking-widest mb-1.5">STEP {step.num}</div>
                <div className="font-bold text-gray-800 mb-2 text-sm">{step.title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 ── Print & Finish Options ────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <span className="inline-block bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Finish Options</span>
              <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4 leading-tight">Premium Printing &amp; Finish Options for {cn}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Every finish option is available on all our {cn.toLowerCase()} styles. Mix and match to create a package that perfectly represents your brand.</p>
              <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md">
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-3">
              {FINISHES.map(f => (
                <div key={f.label} className="rounded-xl border border-gray-100 p-4 hover:border-[#e63329]/30 hover:shadow-sm transition-all">
                  <div className="text-2xl mb-2">{f.emoji}</div>
                  <div className="font-bold text-gray-800 text-xs mb-1">{f.label}</div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 ── Material Options ──────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Materials</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Available Materials for {cn}</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">We work with all major paperboard and corrugated substrates. Our team helps you choose the right material for your product and budget.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {MATERIALS.map(m => (
              <div key={m.title} className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-3 hover:shadow-md transition-shadow">
                <div className="w-1 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <div>
                  <div className="font-bold text-gray-800 text-sm mb-1">{m.title}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 ── Industries We Serve ───────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Industries</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Industries We Serve</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">Prime Packaging works with brands across every category — from startups to Fortune 500 companies.</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {INDUSTRIES.map(ind => (
              <div key={ind.label} className="rounded-xl border border-gray-100 p-4 text-center hover:border-[#1a2f5a]/30 hover:shadow-sm transition-all cursor-default">
                <div className="text-2xl mb-2">{ind.icon}</div>
                <div className="text-xs font-semibold text-gray-700 leading-tight">{ind.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 ── What's Included ────────────────────────────────────── */}
      <section className="py-16 bg-[#0d1f3c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-11">
            <h2 className="text-3xl font-extrabold text-white mb-3">What's Included With Every Order</h2>
            <p className="text-white/55 max-w-lg mx-auto text-sm">No hidden fees. No surprise charges. Everything you need is included in your quoted price.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: Palette, label: "Free Custom Design", desc: "Full artwork creation by our design team" },
              { icon: Truck,   label: "Free US & UK Shipping", desc: "Door-to-door delivery, USA & United Kingdom" },
              { icon: Layers,  label: "Structural Dieline", desc: "Professionally engineered box template" },
              { icon: Printer, label: "Print-Ready Files",  desc: "All final files provided in PDF/AI format" },
              { icon: Ruler,   label: "Size Customization", desc: "Any dimension — we cut custom for you" },
              { icon: Box,     label: "Assembly Option",    desc: "Pre-glued/assembled packaging available" },
              { icon: ShieldCheck, label: "Quality Inspection", desc: "Every batch inspected before dispatch" },
              { icon: Gift,    label: "Inside Printing",    desc: "Full-color interior printing on request" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#e63329]/15 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-[#e63329]" />
                </div>
                <div>
                  <div className="text-white font-bold text-xs mb-0.5">{item.label}</div>
                  <p className="text-white/45 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 ── Testimonials ──────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Reviews</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">What Our Customers Say</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">500+ brands across the US trust Prime Packaging for their custom box needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                  <div className="w-9 h-9 rounded-full bg-[#1a2f5a] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-xs">{t.name}</div>
                    <div className="text-gray-400 text-[11px]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 ── FAQ ────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-11">
              <span className="inline-block bg-[#e63329]/10 text-[#e63329] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">FAQ</span>
              <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Frequently Asked Questions</h2>
              <p className="text-gray-500 text-sm">Can't find your answer? <a href="tel:18187584076" className="text-[#e63329] font-semibold hover:underline">Call us free</a> or <Link href="/contact" className="text-[#e63329] font-semibold hover:underline">send a message</Link>.</p>
            </div>
            <div className="space-y-2">
              {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </div>
      </section>

      {/* 9 ── Size & Specification Guide ──────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Specification Guide</span>
              <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4">Built Around Your Product, Not a Standard Shelf Size</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                Every {cn.toLowerCase()} project starts with the product it needs to protect. Share your product dimensions, quantity, and shipping needs and our team will recommend the right footprint, board strength, insert, and opening style.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1a2f5a]">
                <Package className="w-4 h-4 text-[#e63329]" />
                {productCount > 0 ? `${productCount} ready-to-browse ${cn.toLowerCase()} styles` : `Custom ${cn.toLowerCase()} styles available`}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Ruler, title: "Exact dimensions", text: "Inside length, width, and depth are matched to your product for a secure fit and polished presentation." },
                { icon: Layers, title: "Right board strength", text: "Choose a lightweight retail board or reinforced construction for heavier products and shipping." },
                { icon: Box, title: "Protection inside", text: "Add trays, partitions, foam, paper wrap, or custom inserts to keep every item in place." },
                { icon: Palette, title: "Brand-ready finish", text: "Select print coverage, coatings, foil, embossing, windows, and interior details in one brief." },
              ].map(item => (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm">
                    <item.icon className="w-5 h-5 text-[#e63329]" />
                  </div>
                  <h3 className="font-bold text-[#1a2f5a] text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10 ── Quality & Sustainability Standards ─────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Confidence at Every Step</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Quality You Can See, Materials You Can Stand Behind</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
              From the first digital proof to the final carton, your {cn.toLowerCase()} order is reviewed for structure, color, finish, and presentation before it leaves our facility.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: ShieldCheck, title: "Pre-production review", text: "A digital proof confirms sizing, artwork placement, copy, and finishing details before production begins." },
              { icon: CheckCircle, title: "Batch inspection", text: "Production teams check print consistency, die-cuts, folds, glue points, and overall presentation." },
              { icon: Leaf, title: "Responsible options", text: "Ask about FSC-certified stocks, recyclable boards, kraft alternatives, and lower-impact finishing choices." },
              { icon: Award, title: "Ready for retail", text: "We help you create packaging that arrives clean, consistent, and ready for your shelf or fulfillment line." },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <item.icon className="w-6 h-6 text-[#e63329] mb-4" />
                <h3 className="font-bold text-[#1a2f5a] text-sm mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11 ── Project Brief Checklist ────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="lg:w-1/2">
              <span className="inline-block bg-[#e63329]/10 text-[#e63329] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Start With a Better Brief</span>
              <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4">Tell Us What You Want Your {cn} to Do</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                A few practical details help us return a more accurate recommendation and quote. You do not need finished artwork — our design team can take it from here.
              </p>
              <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md">
                Start Your Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="lg:w-1/2 w-full rounded-2xl bg-[#1a2f5a] p-7">
              <h3 className="text-white font-extrabold text-lg mb-5">Helpful details to include</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Product dimensions and weight",
                  "Order quantity and target date",
                  "Preferred material or finish",
                  "Shipping and storage requirements",
                  "Reference artwork or brand files",
                  "Insert, window, or closure needs",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5 text-white/75 text-xs leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 ── Free Sample CTA ────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1a2f5a 0%,#0d1f3c 100%)" }}>
            <div className="flex flex-col md:flex-row items-center gap-8 p-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#e63329] rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-xl">Feel the Quality First</div>
                    <div className="text-white/50 text-xs">Request a free sample pack — shipped to your US address</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-0">
                  {["Actual box samples", "Multiple materials", "Various finishes", "No commitment needed"].map(item => (
                    <div key={item} className="flex items-center gap-2 text-white/70 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />{item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link href="/request-sample"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#1a2f5a] hover:bg-gray-50 px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg">
                  Request Free Samples <ArrowRight className="w-4 h-4" />
                </Link>
                <a href={`tel:${phone}`}
                  className="inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:bg-white/10 px-7 py-3.5 rounded-xl font-bold text-sm transition-all">
                  <Phone className="w-4 h-4" /> {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
