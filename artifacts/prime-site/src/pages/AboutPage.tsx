import { Link } from "wouter";
import { useSEO } from "../lib/useSEO";
import {
  Award, Users, Package, Truck, Leaf, ShieldCheck, ArrowRight, CheckCircle,
  MessageSquare, Ruler, ScanSearch, Factory, Palette, Phone, Star,
  Archive, Mail, Gem, Sparkles, Recycle, TrendingUp, Globe, Heart,
  Target, Zap, Clock, DollarSign, ThumbsUp, Shield, FileCheck, Briefcase,
  MapPin, Box, Settings, Layers, Droplet, Wind, Flame, Coffee,
} from "lucide-react";

const TEAM = [
  { name: "James Mitchell", role: "Head of Design",    Icon: Palette,  desc: "10+ years in structural and graphic design for CPG packaging." },
  { name: "Sarah Kim",      role: "Production Manager",Icon: Factory,  desc: "Oversees all quality control and production timelines." },
  { name: "Carlos Rivera",  role: "Sales Director",    Icon: Phone,    desc: "Helps brands find the perfect packaging solution for their needs." },
  { name: "Amy Chen",       role: "Client Success",    Icon: Star,     desc: "Ensures every order meets our quality guarantee before shipping." },
];

const PROCESS_STEPS = [
  { step: "01", Icon: MessageSquare, title: "Consultation",        desc: "Tell us your product, size, quantity, and timeline. Our team reviews your needs and prepares a custom quote within 2 hours." },
  { step: "02", Icon: Ruler,         title: "Design & Dieline",    desc: "Our in-house designers create a structural dieline, print-ready artwork, and a 3D rendered mockup — all included free." },
  { step: "03", Icon: ScanSearch,    title: "Approval & Sampling", desc: "You review and approve the design. Physical samples available before full production for large orders." },
  { step: "04", Icon: Factory,       title: "Production",          desc: "We produce your order with full quality control at every stage — material sourcing, printing, cutting, gluing, and assembly." },
  { step: "05", Icon: Truck,         title: "Shipping",            desc: "Free shipping to all 50 US states. Track your order with real-time updates from our logistics dashboard." },
];

const MATERIALS = [
  { name: "SBS Paperboard",         desc: "Smooth, premium surface for high-resolution print and luxury cosmetic packaging.",    Icon: Archive  },
  { name: "Kraft Board",            desc: "Natural brown finish, 100% recycled options. Ideal for eco-conscious brands.",        Icon: Leaf     },
  { name: "Corrugated Board",       desc: "Double-wall and single-wall options for shipping and mailer boxes.",                  Icon: Mail     },
  { name: "Rigid Chipboard",        desc: "Premium heavyweight board for luxury setup and gift boxes.",                          Icon: Gem      },
  { name: "Mylar / Foil Laminates", desc: "Barrier properties for food, coffee, and supplement pouches.",                       Icon: Sparkles },
  { name: "FSC-Certified Stock",    desc: "All our primary stocks come from FSC-certified, responsibly managed forests.",        Icon: Recycle  },
];

const FINISHING = [
  "Full-Color CMYK Printing", "Pantone Color Matching", "Matte Lamination",
  "Gloss Lamination", "Soft-Touch Coating", "Spot UV", "Foil Stamping (Gold / Silver / Custom)",
  "Embossing & Debossing", "Aqueous Coating", "Pearlescent Finish",
  "Window Patching", "Magnetic Closures", "Ribbon Pulls", "Die-Cut Windows",
  "Metallic Inks", "Varnish Coating", "Textured Finishes", "Custom Inserts",
];

const MILESTONES = [
  { year: "2019", Icon: Heart,       title: "Founded in Torrance, CA",         desc: "Prime Packaging Boxes launched with a mission to give growing brands access to premium packaging at fair prices." },
  { year: "2020", Icon: Users,       title: "First 100 Clients",               desc: "Hit 100 happy clients in our first full year, expanding our product range to include rigid and luxury boxes." },
  { year: "2021", Icon: Globe,       title: "Nationwide Expansion",            desc: "Scaled free shipping to all 50 US states and added rush 3–5 day production for urgent orders." },
  { year: "2022", Icon: Award,       title: "FSC & SFI Certification",         desc: "Achieved FSC and SFI certification, making eco-friendly materials standard across our entire product line." },
  { year: "2023", Icon: TrendingUp,  title: "500+ Brands Served",             desc: "Crossed 500 active brand clients and shipped over 1 million boxes to every corner of the United States." },
  { year: "2024", Icon: Sparkles,    title: "In-House Design Studio",          desc: "Launched our fully-staffed in-house design studio offering free unlimited revisions and 3D mockups on every order." },
];

const VALUES = [
  { Icon: Award,       title: "Premium Quality, Every Time",   desc: "Every order goes through rigorous quality inspection before it ships. If it's not perfect, we reprint it — no questions asked." },
  { Icon: Users,       title: "Free Design Support Included",  desc: "Our in-house structural and graphic designers create your print-ready artwork at zero charge. Unlimited revisions included." },
  { Icon: Truck,       title: "Industry-Leading Speed",        desc: "Standard 7–10 business day turnarounds with rush 3–5 day options. Free shipping to all 50 US states." },
  { Icon: Package,     title: "Low Minimum Orders",            desc: "Order as few as 100 boxes — one of the lowest MOQs in the industry. No wasted inventory, no excessive upfront costs." },
  { Icon: Leaf,        title: "Eco-Friendly Materials",        desc: "All stocks sourced from FSC-certified forests, 100% recyclable. We use soy-based inks and offer kraft at no premium." },
  { Icon: ShieldCheck, title: "Satisfaction Guaranteed",       desc: "We stand behind every single order. If you're not satisfied, we'll reprint or refund — that's our promise." },
];

export default function AboutPage() {
  useSEO({
    title: "About Prime Packaging Boxes | Custom Packaging USA",
    description: "Learn about Prime Packaging Boxes — California's trusted custom packaging manufacturer serving 500+ US brands. Free design, fast turnaround, premium quality.",
    keywords: "about prime packaging, custom packaging company USA, packaging manufacturer California",
  });

  return (
    <>

      {/* ── Hero ── */}
      <section className="bg-[#0d1f3c] pt-16 pb-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.95}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block bg-[#e63329]/15 border border-[#e63329]/30 text-[#ff6b63] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                Our Story — Torrance, CA, USA
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight">
                We're Not Just a Printer.<br />
                <span className="text-[#e63329]">We're Your Packaging Partner.</span>
              </h1>
              <p className="text-lg text-white/65 leading-relaxed mb-8">
                Founded in Torrance, California, Prime Packaging Boxes was built on one belief: every USA brand deserves packaging that's as impressive as the product inside. Premium quality, fast turnaround, free design — every order.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-8 py-4 rounded-lg font-bold text-sm transition-all shadow-lg">
                  Get a Free Quote <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-lg font-bold text-sm transition-all">
                  Contact Our Team
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#e63329]/10 rounded-3xl blur-2xl" />
                <img
                  src="/api/uploads/custom-corrugated-mailer-boxes-with-logo.webp"
                  alt="Custom branded corrugated mailer boxes with logo — Prime Packaging Boxes USA"
                  className="relative rounded-2xl shadow-2xl w-full object-cover max-h-[420px]"
                  loading="eager"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e63329]/10 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#e63329]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1a2f5a] text-sm">500+ USA Brands</div>
                    <div className="text-xs text-gray-500">Trust Prime Packaging</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white -mt-1">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+",  label: "Happy Clients",    desc: "US brands trust us", Icon: Users },
              { value: "1M+",   label: "Boxes Shipped",    desc: "Across all 50 states", Icon: Package },
              { value: "4.9/5", label: "Avg Rating",       desc: "From 200+ reviews", Icon: Star },
              { value: "5+",    label: "Years Experience", desc: "Serving US brands", Icon: Award },
            ].map(s => (
              <div key={s.label} className="group">
                <s.Icon className="w-10 h-10 text-[#e63329] mx-auto mb-3" />
                <div className="text-4xl font-black text-[#e63329] mb-1 group-hover:scale-105 transition-transform">{s.value}</div>
                <div className="text-gray-800 font-bold text-sm">{s.label}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USA Coverage ── */}
      <section className="py-16 bg-[#f8f9fa] border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <MapPin className="w-12 h-12 text-[#e63329] mx-auto mb-4" />
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">NATIONWIDE SERVICE</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2f5a]">Serving All 50 US States</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">Free shipping to every corner of the United States. From our headquarters in Torrance, California, we deliver premium custom packaging coast to coast.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { Icon: MapPin, title: "Torrance, CA Headquarters", desc: "Our main facility handles design, production oversight, and client services for the entire USA." },
              { Icon: Truck, title: "Free Shipping — All 50 States", desc: "Every order ships free via ground freight to Alaska, Hawaii, and the continental United States." },
              { Icon: Globe, title: "Coast-to-Coast Coverage", desc: "We've shipped to brands in New York, Texas, Florida, Washington, Illinois, and every state in between." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <item.Icon className="w-10 h-10 text-[#e63329] mx-auto mb-4" />
                <h3 className="font-bold text-[#1a2f5a] text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MILESTONE TIMELINE ── */}
      <section className="py-12 md:py-20 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">OUR JOURNEY</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2f5a]">5 Years of Growth & Excellence</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">From a small California startup to a nationwide packaging partner — here's how we got here.</p>
          </div>
          <div className="relative">
            {/* Centre line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#e63329]/30 via-[#e63329]/60 to-[#e63329]/30 -translate-x-1/2" />
            <div className="space-y-10">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`relative flex flex-col md:flex-row items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  {/* Card */}
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all p-6 group ${i % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}>
                      <div className={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                        <div className="w-9 h-9 rounded-xl bg-[#e63329]/10 flex items-center justify-center shrink-0 group-hover:bg-[#e63329]/20 transition-colors">
                          <m.Icon className="w-4.5 h-4.5 text-[#e63329]" style={{ width: "1.1rem", height: "1.1rem" }} />
                        </div>
                        <h3 className="font-bold text-[#1a2f5a] text-base">{m.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  {/* Year badge */}
                  <div className="hidden md:flex shrink-0 w-16 h-16 rounded-full bg-[#e63329] text-white font-black text-sm items-center justify-center shadow-[0_4px_20px_rgba(230,51,41,0.35)] z-10 border-4 border-white">
                    {m.year}
                  </div>
                  {/* Mobile year badge */}
                  <div className="flex md:hidden shrink-0 bg-[#e63329] text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md">
                    {m.year}
                  </div>
                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-12 md:py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest mb-3 block">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2f5a] mb-6 leading-tight">
                Built on Craft.<br />Driven by Results.
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
                <p>Prime Packaging Boxes was founded in California with a simple mission: give growing brands access to the same high-quality, custom packaging that large corporations use — without the extreme minimums, lengthy lead times, or prices that used to exclude smaller businesses.</p>
                <p>Today, we serve over 500 brands across all 50 US states — from Shopify sellers launching their first product to established CPG brands scaling nationwide. Every order goes through the same quality checks, the same expert design review, and the same commitment to getting it perfect.</p>
                <p>Our in-house team of structural engineers, graphic designers, and print specialists work under one roof in Torrance, California — which means faster approvals, real-time communication, and packaging that's built right from day one.</p>
              </div>
              <div className="mt-8 space-y-3">
                {[
                  "In-house design team — no outsourcing, no delays",
                  "Direct manufacturer relationships — better pricing for you",
                  "Every order quality-inspected before it ships",
                  "US-based support team — reach us by phone, email, or WhatsApp",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#e63329] shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#1a2f5a] to-[#0d1f3c] rounded-2xl p-10 text-white text-center shadow-xl">
                <div className="text-6xl font-black mb-2">5+</div>
                <div className="text-xl font-bold mb-1">Years of Excellence</div>
                <div className="text-white/60 text-sm mb-8">Trusted by 500+ US brands</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {["FDA Compliant", "FSC Certified", "SFI Certified", "ISO Standards"].map(c => (
                    <div key={c} className="bg-white/10 rounded-lg py-2 px-3 font-semibold text-xs">{c}</div>
                  ))}
                </div>
              </div>
              <div className="bg-[#e63329] rounded-2xl p-6 text-white">
                <div className="text-2xl font-black mb-1">Free Design Support</div>
                <div className="text-white/80 text-sm leading-relaxed">Every order includes unlimited design revisions from our in-house team. Print-ready dielines and 3D mockups at no extra cost.</div>
                <Link href="/get-a-quote" className="inline-flex items-center gap-1.5 bg-white text-[#e63329] hover:bg-gray-100 px-4 py-2 rounded-lg font-bold text-sm mt-4 transition-colors">
                  Start a Project <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section className="py-12 md:py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">OUR PROCESS</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">From Quote to Delivery</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xl mx-auto">A simple, transparent 5-step process designed to deliver perfect packaging every time.</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gray-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {PROCESS_STEPS.map(step => (
                <div key={step.step} className="relative flex flex-col items-center text-center z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#e63329] text-white flex flex-col items-center justify-center mb-4 shadow-lg shadow-red-200">
                    <step.Icon className="w-7 h-7 text-white" />
                    <span className="text-[9px] font-black opacity-70 mt-0.5">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-[#1a2f5a] text-sm mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Prime vs Competitors Table ── */}
      <section className="py-16 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">WHY CHOOSE US</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2f5a]">Prime vs. Competitors</h2>
            <p className="text-gray-500 mt-3 text-sm">See how we stack up against other custom packaging suppliers in the USA.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0d1f3c] text-white">
                    <th className="text-left py-4 px-6 font-bold">Feature</th>
                    <th className="text-center py-4 px-6 font-bold bg-[#e63329]">Prime Packaging</th>
                    <th className="text-center py-4 px-6 font-bold">Typical Competitor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { feature: "Minimum Order Quantity", prime: "100 units", competitor: "500 – 1,000 units" },
                    { feature: "Standard Turnaround", prime: "7–10 business days", competitor: "14–21 business days" },
                    { feature: "Rush Production Available", prime: "Yes (3–5 days)", competitor: "Rarely available" },
                    { feature: "Free Design Support", prime: "Unlimited revisions", competitor: "1–2 revisions or $$$" },
                    { feature: "Free Shipping (USA)", prime: "All 50 states", competitor: "Minimum order required" },
                    { feature: "3D Mockups Included", prime: "Yes, every order", competitor: "Extra fee" },
                    { feature: "Quality Guarantee", prime: "100% satisfaction", competitor: "Limited or none" },
                    { feature: "USA-Based Support", prime: "Torrance, CA team", competitor: "Offshore support" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-700">{row.feature}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 text-[#e63329] font-bold">
                          <CheckCircle className="w-4 h-4" />
                          {row.prime}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-400">{row.competitor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">WHAT SETS US APART</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">Our Core Commitments</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-lg hover:bg-white transition-all group hover:-translate-y-0.5">
                <div className="w-12 h-12 bg-[#e63329]/8 group-hover:bg-[#e63329]/15 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <v.Icon className="w-6 h-6 text-[#e63329]" />
                </div>
                <h3 className="text-base font-bold text-[#1a2f5a] mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Materials & Finishes ── */}
      <section className="py-12 md:py-20 bg-[#f8f9fa] border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-3">MATERIALS</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a] mb-6">Premium Stocks for Every Application</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MATERIALS.map(m => (
                  <div key={m.name} className="flex gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all">
                    <div className="w-8 h-8 rounded-lg bg-[#e63329]/10 flex items-center justify-center shrink-0">
                      <m.Icon className="w-4 h-4 text-[#e63329]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#1a2f5a] text-sm mb-0.5">{m.name}</div>
                      <div className="text-gray-500 text-xs leading-relaxed">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-3">FINISHING OPTIONS</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a] mb-6">Every Finish Available</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">From matte and gloss lamination to premium foil stamping and embossing — we offer every finishing option you need to create packaging that stands out on the shelf.</p>
              <div className="flex flex-wrap gap-2">
                {FINISHING.map((f, idx) => (
                  <span key={idx} className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full hover:border-[#e63329] hover:text-[#e63329] transition-colors cursor-default shadow-sm">
                    <CheckCircle className="w-3 h-3 inline mr-1 text-[#e63329]" /> {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-12 md:py-20 bg-[#0d1f3c]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">THE TEAM</span>
            <h2 className="text-3xl font-extrabold text-white">The People Behind Your Packaging</h2>
            <p className="text-white/50 mt-2 text-sm max-w-lg mx-auto">Our team of packaging specialists is here to guide you from concept to delivery.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/8 hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 bg-[#e63329] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/30">
                  <member.Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white text-base mb-0.5">{member.name}</h3>
                <div className="text-[#e63329] text-xs font-semibold mb-3">{member.role}</div>
                <p className="text-white/50 text-xs leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications & Awards ── */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Shield className="w-12 h-12 text-[#e63329] mx-auto mb-4" />
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">CERTIFICATIONS & AWARDS</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">Built on Quality & Trust</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 max-w-5xl mx-auto">
            {[
              { Icon: ShieldCheck, title: "FSC Certified" },
              { Icon: Leaf, title: "SFI Certified" },
              { Icon: Award, title: "ISO 9001" },
              { Icon: FileCheck, title: "FDA Compliant" },
              { Icon: Recycle, title: "100% Recyclable" },
              { Icon: ThumbsUp, title: "BBB Accredited" },
            ].map(c => (
              <div key={c.title} className="text-center p-5 bg-[#f8f9fa] border border-gray-100 rounded-2xl hover:shadow-md transition-shadow group">
                <c.Icon className="w-10 h-10 text-[#e63329] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-[#1a2f5a] text-sm">{c.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-12 md:py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">TESTIMONIALS</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">What Our Clients Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Jenkins", company: "Lumina Cosmetics, LA",   quote: "The quality of our custom mailer boxes exceeded our expectations. The print is crisp, and the structural integrity is perfect. Our unboxing experience has never been better!", initials: "SJ" },
              { name: "David Chen",    company: "Roast Coffee Co., NYC",  quote: "Prime Packaging was incredible to work with. Their design team helped us fix a structural issue and the new boxes assemble twice as fast. Turnaround was only 8 days!", initials: "DC" },
              { name: "Elena Rodriguez", company: "Bloom Botanicals, TX", quote: "Fast turnaround and excellent communication throughout. The foil stamping on our rigid boxes looks incredibly premium. We've had so many customers comment on the packaging!", initials: "ER" },
            ].map(t => (
              <div key={t.name} className="bg-white p-7 rounded-2xl border border-gray-100 hover:shadow-xl hover:bg-white transition-all flex flex-col">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
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

      {/* ── Why Brands Choose Us (Icon Grid) ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">WHY BRANDS CHOOSE US</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">Our Core Promise to You</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { Icon: Zap, title: "Fast Turnaround", desc: "7–10 business days standard. Rush 3–5 day option available. We never compromise quality for speed." },
              { Icon: Palette, title: "Free Design Support", desc: "Our in-house design team creates your artwork at no extra cost. Up to 3 revision rounds included free." },
              { Icon: Target, title: "100% Satisfaction", desc: "If it's not right, we reprint it — free. Our quality guarantee covers every single order we ship." },
              { Icon: Box, title: "Any Quantity", desc: "Start from 100 units. Scale to millions. We handle MOQs that fit startups and enterprise brands alike." },
              { Icon: DollarSign, title: "Transparent Pricing", desc: "No hidden fees. No setup charges. What you see in the quote is what you pay. Simple, honest pricing for every US brand." },
              { Icon: Briefcase, title: "Expert Guidance", desc: "Our team has worked with 500+ brands. We'll guide you through materials, sizing, finishes, and design best practices." },
            ].map((item, i) => (
              <div key={i} className="bg-[#f8f9fa] border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <item.Icon className="w-10 h-10 text-[#e63329] mb-4" />
                <h3 className="font-bold text-[#1a2f5a] text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-[#1a2f5a] to-[#0d1f3c] relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Work Together?</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Get your free quote today and see why 500+ brands across the USA trust Prime Packaging Boxes with their brand's first impression.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-a-quote" className="inline-flex items-center justify-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl">
              Get a Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-bold transition-all">
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
