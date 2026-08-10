import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "../lib/useSEO";
import { useSettings } from "../lib/useSettings";
import {
  Search, ChevronDown, Package, Palette, CreditCard, Truck,
  Settings, HelpCircle, MessageCircle, Phone, Mail, Clock,
  ShieldCheck, Box, Zap, Award, PenTool, Layers, CheckCircle,
  ArrowRight, MapPin, Scissors, FileCheck, ThumbsUp, LifeBuoy
} from "lucide-react";

const FAQ_CATEGORIES = [
  {
    id: "ordering",
    icon: Package,
    label: "Ordering & Process",
    items: [
      { q: "What is the minimum order quantity (MOQ)?", a: "Our minimum order quantity is 100 boxes. This allows us to maintain premium quality while keeping costs low. We serve businesses across all 50 US states with these flexible minimums." },
      { q: "How do I place an order?", a: "Click 'Get a Quote', submit your dimensions, material, and artwork details. Our Torrance, CA team reviews your request within 24 hours and sends a detailed quote. Once approved, production begins." },
      { q: "Can I order a sample before placing a bulk order?", a: "Yes! We encourage samples before bulk orders. Visit our Request a Sample page to order a custom printed sample. Sample costs are fully credited toward your bulk order." },
      { q: "How long does the ordering process take?", a: "Standard turnaround is 7–10 business days after artwork approval. We also offer 3-5 day rush production for USA brands needing fast delivery." },
      { q: "Can I reorder my previous design easily?", a: "Absolutely. We keep your approved artwork securely on file. Just reference your past order number and we will process the reorder 20% faster." },
      { q: "What if I need to cancel my order?", a: "Cancellations are accepted within 24 hours of confirmation. Once production begins at our USA facility, changes may incur additional charges." }
    ]
  },
  {
    id: "design",
    icon: Palette,
    label: "Design & Artwork",
    items: [
      { q: "Do you offer free design support?", a: "Yes, our USA-based design team offers complimentary layout and print-readiness checks with every order." },
      { q: "What file formats are accepted?", a: "We accept high-resolution (300 DPI) AI, PSD, PDF, and TIFF files. All artwork must be in CMYK color mode." },
      { q: "Do you provide dieline templates?", a: "Yes. Once you confirm box dimensions, we provide an exact blank dieline template tailored for your packaging." },
      { q: "What is a dieline?", a: "A dieline is a flat 2D blueprint showing all cut, fold, and glue lines to ensure your artwork aligns perfectly on the assembled box." },
      { q: "Will I see a proof before printing?", a: "Always. We provide a digital 3D and 2D proof for your approval before full production begins." },
      { q: "Can you color match my brand?", a: "We use CMYK printing and offer Pantone (PMS) matching for precise USA brand consistency at a small additional fee." }
    ]
  },
  {
    id: "materials",
    icon: Layers,
    label: "Materials & Printing",
    items: [
      { q: "What materials do you offer?", a: "We provide premium Cardboard, Corrugated, Rigid, and eco-friendly Kraft materials, sourced from top suppliers." },
      { q: "What finishes are available?", a: "Choose from Matte, Gloss, Soft-Touch, Spot UV, Foil Stamping, and Embossing to make your packaging stand out." },
      { q: "Are your materials eco-friendly?", a: "Yes, our Kraft boxes are made from recycled content, and we use soy-based inks for all our sustainable packaging lines." },
      { q: "Cardboard vs Corrugated?", a: "Cardboard is thinner for retail display; Corrugated has fluting for shipping strength. We manufacture both in our US facilities." },
      { q: "Can you print inside the box?", a: "Yes! Full inside printing or spot interior printing is available to maximize the unboxing experience." },
      { q: "How thick is the cardstock?", a: "We offer 14pt, 18pt, and 24pt standard cardstock, plus heavy-duty corrugated board up to double-wall thickness." }
    ]
  },
  {
    id: "pricing",
    icon: CreditCard,
    label: "Pricing & Payment",
    items: [
      { q: "How is pricing calculated?", a: "Pricing is based on dimensions, material, quantity, and print options. Volume discounts apply automatically." },
      { q: "Do you offer volume discounts?", a: "Yes, significant price breaks occur at 500, 1,000, and 5,000+ units for our USA corporate clients." },
      { q: "What payment methods are accepted?", a: "We accept all major Credit Cards, ACH, and wire transfers. Net-30 terms are available for approved established US brands." },
      { q: "Are there setup or plate fees?", a: "Our digital printing process requires zero plate fees! Offset runs may have one-time setup costs." },
      { q: "Do you price match?", a: "We offer highly competitive pricing and will try to match written quotes from other US-based manufacturers." },
      { q: "Is shipping included in the price?", a: "Standard shipping across all 50 US states is always free. Expedited shipping is calculated at checkout." }
    ]
  },
  {
    id: "shipping",
    icon: Truck,
    label: "Shipping & Delivery",
    items: [
      { q: "Do you offer free shipping?", a: "Yes! We proudly offer free standard shipping to all 50 US states on bulk orders." },
      { q: "What is the typical lead time?", a: "7-10 business days for standard production and delivery. We are known for our reliable shipping timelines." },
      { q: "Do you ship internationally?", a: "While we primarily serve USA brands from our Torrance, CA hub, we can arrange international freight upon request." },
      { q: "What if my order is damaged in transit?", a: "Contact us immediately with photos. We fully guarantee our shipments and will reprint damaged items for free." },
      { q: "Can I track my order?", a: "Yes, a tracking link is provided as soon as your packaging leaves our facility." },
      { q: "Can you ship to multiple locations?", a: "Yes, we offer split shipments to multiple US distribution centers or fulfillment houses." }
    ]
  },
  {
    id: "returns",
    icon: ShieldCheck,
    label: "Returns & Quality",
    items: [
      { q: "What is your return policy?", a: "If your custom boxes have manufacturing defects or print errors, we will reprint them or issue a refund." },
      { q: "What happens if dimensions are wrong?", a: "If the final product differs from the approved dieline, we take full responsibility and replace the order." },
      { q: "How do I file a claim?", a: "Use our Returns & Support page to submit details and photos. We typically resolve claims within 3-5 business days." },
      { q: "Can I return boxes if I changed my mind?", a: "Because packaging is custom-manufactured for your brand, we cannot accept returns for non-defective items." },
      { q: "How do you handle color mismatches?", a: "We adhere to strict printing tolerances. If the color severely deviates from the approved proof, we will correct it." },
      { q: "Is my satisfaction guaranteed?", a: "Yes. Our Torrance, CA team stands behind our 100% Quality Guarantee for every single order." }
    ]
  }
];

export default function FaqPage() {
  const { data: settings } = useSettings();
  const phone = settings?.phone || "818-758-4076";
  const email = settings?.email || "help@primepackagingboxes.com";
  useSEO({ title: "FAQ & Support | Prime Packaging Boxes", description: "Frequently asked questions about ordering custom packaging, materials, shipping, and pricing in the USA." });
  const [activeCategory, setActiveCategory] = useState("ordering");
  const [query, setQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleFaq = (idx: string) => {
    setOpenItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredCategories = FAQ_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.q.toLowerCase().includes(query.toLowerCase()) || 
      item.a.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <>
      {/* 1. HERO SECTION */}
      <section className="bg-[#0d1f3c] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c] opacity-90" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,#ffffff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <LifeBuoy className="w-4 h-4 text-[#e63329]" /> Support Center — USA
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Got Questions? <span className="text-[#e63329]">We Have Answers.</span>
              </h1>
              <p className="text-white/70 text-lg mb-6">Everything you need to know about custom packaging. Serving USA brands in all 50 states.</p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#e63329]"
                />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#e63329]/10 rounded-3xl blur-2xl" />
                <img
                  src="/api/uploads/custom-clothing-boxes-with-logo.webp"
                  alt="Custom branded clothing boxes with logo — Prime Packaging Boxes USA"
                  className="relative rounded-2xl shadow-2xl w-full object-cover max-h-[380px]"
                  loading="eager"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                  <HelpCircle className="w-8 h-8 text-[#e63329]" />
                  <div>
                    <div className="font-bold text-[#1a2f5a] text-sm">36+ Questions</div>
                    <div className="text-xs text-gray-500">Answered In Detail</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { icon: <Package className="w-5 h-5 text-[#e63329]" />, val: "100 Unit", label: "Min Order" },
              { icon: <Clock className="w-5 h-5 text-[#e63329]" />, val: "7-10 Day", label: "Production" },
              { icon: <Palette className="w-5 h-5 text-[#e63329]" />, val: "Free", label: "Design Support" },
              { icon: <Truck className="w-5 h-5 text-[#e63329]" />, val: "Free", label: "US Shipping" },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 border border-white/15 rounded-xl p-4 flex items-center gap-3">
                {s.icon}
                <div>
                  <div className="text-white font-extrabold text-lg leading-none">{s.val}</div>
                  <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 2. QUICK STATS */}
      <section className="py-12 bg-[#1a2f5a] border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Box, val: "100 Unit", label: "Minimum Order" },
              { icon: Clock, val: "7-10 Day", label: "Fast Turnaround" },
              { icon: PenTool, val: "Free", label: "Design Support" },
              { icon: Truck, val: "Free", label: "USA Shipping" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <stat.icon className="w-8 h-8 text-[#e63329] mb-3" />
                <div className="text-2xl font-black text-white">{stat.val}</div>
                <div className="text-white/60 text-sm font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ORDERING PROCESS VISUAL */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0d1f3c] mb-4">How Ordering Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A streamlined process designed for USA businesses to get premium packaging fast.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Request Quote", desc: "Share your dimensions and material preferences.", icon: FileCheck },
              { step: "02", title: "Approve Proof", desc: "Review the 3D digital mockup of your design.", icon: ThumbsUp },
              { step: "03", title: "Production", desc: "We print and manufacture your boxes.", icon: Settings },
              { step: "04", title: "Delivery", desc: "Free shipping to anywhere in the 50 US states.", icon: MapPin }
            ].map((s, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-20 h-20 mx-auto bg-[#f8f9fa] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#1a2f5a] transition-colors duration-300 border border-gray-100">
                  <s.icon className="w-8 h-8 text-[#e63329]" />
                </div>
                <div className="absolute top-10 left-[60%] w-full h-[2px] bg-gray-100 hidden md:block" />
                <h3 className="text-lg font-bold text-[#0d1f3c] mb-2"><span className="text-[#e63329] mr-2">{s.step}</span>{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR BOX TYPES */}
      <section className="py-20 bg-[#f8f9fa] border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">Popular Box Styles</h2>
            <p className="text-gray-600">Explore the top choices preferred by our USA clients.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Mailer Boxes", "Rigid Gift Boxes", "Folding Cartons", "Cosmetic Boxes",
              "Candle Boxes", "Apparel Boxes", "Bakery Boxes", "Display Boxes"
            ].map((box, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col items-center text-center group cursor-pointer">
                <Package className="w-10 h-10 text-[#1a2f5a] group-hover:text-[#e63329] mb-4 transition-colors" />
                <h3 className="font-bold text-[#0d1f3c]">{box}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMPARISON TABLE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">Standard vs Rush Orders</h2>
            <p className="text-gray-600">Choose the timeline that fits your launch schedule.</p>
          </div>
          <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a2f5a] text-white">
                  <th className="p-5 font-bold text-lg">Feature</th>
                  <th className="p-5 font-bold text-lg border-l border-white/10">Standard Order</th>
                  <th className="p-5 font-bold text-lg border-l border-white/10 bg-[#e63329]">Rush Order</th>
                </tr>
              </thead>
              <tbody className="bg-white text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="p-5 font-semibold text-[#0d1f3c]">Turnaround Time</td>
                  <td className="p-5 border-l border-gray-100">7-10 Business Days</td>
                  <td className="p-5 border-l border-gray-100 font-bold text-[#e63329]">3-5 Business Days</td>
                </tr>
                <tr className="border-b border-gray-100 bg-[#f8f9fa]">
                  <td className="p-5 font-semibold text-[#0d1f3c]">Shipping</td>
                  <td className="p-5 border-l border-gray-100">Free to 50 US States</td>
                  <td className="p-5 border-l border-gray-100">Expedited Included</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-5 font-semibold text-[#0d1f3c]">Design Support</td>
                  <td className="p-5 border-l border-gray-100">Included</td>
                  <td className="p-5 border-l border-gray-100">Priority Included</td>
                </tr>
                <tr>
                  <td className="p-5 font-semibold text-[#0d1f3c]">Pricing</td>
                  <td className="p-5 border-l border-gray-100">Standard Rates</td>
                  <td className="p-5 border-l border-gray-100">+25% Rush Fee</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. MATERIAL GUIDE TABLE */}
      <section className="py-20 bg-[#f8f9fa] border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">Packaging Material Guide</h2>
            <p className="text-gray-600">Select the best foundation for your brand.</p>
          </div>
          <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-[#1a2f5a] text-white">
                  <th className="p-5 font-bold">Material Type</th>
                  <th className="p-5 font-bold border-l border-white/10">Best Used For</th>
                  <th className="p-5 font-bold border-l border-white/10">Thickness Options</th>
                  <th className="p-5 font-bold border-l border-white/10">Available Finishes</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#0d1f3c] flex items-center gap-3"><Layers className="w-5 h-5 text-[#e63329]" /> Premium Cardboard</td>
                  <td className="p-5 border-l border-gray-100">Cosmetics, Retail, Pharmaceuticals</td>
                  <td className="p-5 border-l border-gray-100">14pt, 18pt, 24pt</td>
                  <td className="p-5 border-l border-gray-100">Matte, Gloss, Soft-Touch, Foil</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#0d1f3c] flex items-center gap-3"><Box className="w-5 h-5 text-[#e63329]" /> Corrugated Board</td>
                  <td className="p-5 border-l border-gray-100">Shipping, E-commerce Mailers</td>
                  <td className="p-5 border-l border-gray-100">E-Flute, B-Flute</td>
                  <td className="p-5 border-l border-gray-100">Matte, Gloss</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#0d1f3c] flex items-center gap-3"><Award className="w-5 h-5 text-[#e63329]" /> Rigid Chipboard</td>
                  <td className="p-5 border-l border-gray-100">Luxury Gifts, Electronics, Jewelry</td>
                  <td className="p-5 border-l border-gray-100">1.5mm - 3mm</td>
                  <td className="p-5 border-l border-gray-100">Textured Paper, Foil, Emboss</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#0d1f3c] flex items-center gap-3"><Scissors className="w-5 h-5 text-[#e63329]" /> Eco-Friendly Kraft</td>
                  <td className="p-5 border-l border-gray-100">Organic Brands, Bakery, Soaps</td>
                  <td className="p-5 border-l border-gray-100">18pt, E-Flute</td>
                  <td className="p-5 border-l border-gray-100">No finish (Natural look)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section className="py-24 bg-white" id="faq-accordion">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Tabs */}
            <div className="w-full lg:w-1/3">
              <div className="sticky top-24 bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100">
                <h3 className="font-extrabold text-[#0d1f3c] text-xl mb-6">Categories</h3>
                <div className="space-y-2">
                  {FAQ_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setQuery(""); }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeCategory === cat.id && query === "" ? "bg-[#1a2f5a] text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-[#0d1f3c]"}`}
                    >
                      <cat.icon className={`w-5 h-5 ${activeCategory === cat.id && query === "" ? "text-[#e63329]" : "text-gray-400"}`} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Accordion Content */}
            <div className="w-full lg:w-2/3">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-20 bg-[#f8f9fa] rounded-2xl border border-gray-100">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#0d1f3c] mb-2">No answers found</h3>
                  <p className="text-gray-500">We couldn't find anything matching your search.</p>
                  <button onClick={() => setQuery("")} className="mt-4 text-[#e63329] font-bold hover:underline">Clear Search</button>
                </div>
              ) : (
                <div className="space-y-8">
                  {(query ? filteredCategories : filteredCategories.filter(c => c.id === activeCategory)).map(category => (
                    <div key={category.id} className="animate-in fade-in duration-300">
                      <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-[#1a2f5a]/10">
                        <category.icon className="w-6 h-6 text-[#e63329]" />
                        <h2 className="text-2xl font-extrabold text-[#0d1f3c]">{category.label}</h2>
                      </div>
                      <div className="space-y-3">
                        {category.items.map((item, idx) => {
                          const id = `${category.id}-${idx}`;
                          const isOpen = openItems[id];
                          return (
                            <div key={idx} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                              <button 
                                onClick={() => toggleFaq(id)}
                                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                              >
                                <span className={`font-bold pr-4 ${isOpen ? "text-[#e63329]" : "text-[#0d1f3c]"}`}>{item.q}</span>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                              </button>
                              {isOpen && (
                                <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                                  {item.a}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. USA MENTION BLOCK */}
      <section className="py-20 bg-[#1a2f5a]">
        <div className="container mx-auto px-4 text-center">
          <MapPin className="w-16 h-16 text-[#e63329] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Proudly Serving All 50 US States</h2>
          <p className="text-white/80 max-w-3xl mx-auto text-lg leading-relaxed">
            From our headquarters in Torrance, CA, we design, manufacture, and ship premium packaging to USA brands nationwide. We understand the local market and deliver unmatched quality with reliable domestic transit times.
          </p>
        </div>
      </section>

      {/* 9. CONTACT CARDS */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">Still Need Help?</h2>
            <p className="text-gray-600">Our USA-based support team is standing by.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-6 h-6 text-[#e63329]" />
              </div>
              <h3 className="font-bold text-[#0d1f3c] text-lg mb-2">Call Us</h3>
              <p className="text-gray-500 mb-4 text-sm">Mon-Fri, 9am - 6pm PST</p>
              <a href={`tel:${phone}`} className="text-xl font-black text-[#1a2f5a] hover:text-[#e63329] transition">{phone}</a>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-6 h-6 text-[#e63329]" />
              </div>
              <h3 className="font-bold text-[#0d1f3c] text-lg mb-2">Email Us</h3>
              <p className="text-gray-500 mb-4 text-sm">Replies within 1 business day</p>
              <a href={`mailto:${email}`} className="text-lg font-black text-[#1a2f5a] hover:text-[#e63329] transition">{email}</a>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-6 h-6 text-[#e63329]" />
              </div>
              <h3 className="font-bold text-[#0d1f3c] text-lg mb-2">Live Chat</h3>
              <p className="text-gray-500 mb-4 text-sm">Available on our website</p>
              <button className="text-lg font-black text-[#1a2f5a] hover:text-[#e63329] transition">Start Chat</button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CTA SECTION */}
      <section className="py-24 bg-[#0d1f3c] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
          <Package className="w-96 h-96 text-white rotate-12" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to Start Your Project?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
            Join thousands of USA brands who trust Prime Packaging Boxes for their custom packaging needs. Get your free, no-obligation quote today.
          </p>
          <Link href="/get-a-quote" className="inline-flex items-center gap-3 bg-[#e63329] hover:bg-red-700 text-white font-black text-lg px-10 py-5 rounded-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(230,51,41,0.3)]">
            Get a Free Quote <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </>
  );
}
