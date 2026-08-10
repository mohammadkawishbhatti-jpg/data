import { useSEO } from "../lib/useSEO";
import { Link } from "wouter";
import { ShieldCheck, CheckCircle, XCircle, Clock, ArrowRight, Phone, RefreshCcw, AlertTriangle, FileText, Target, Award, Search, Truck, Zap, ThumbsUp, MapPin } from "lucide-react";

export default function RefundPolicyPage() {
  useSEO({
    title: "Refund & Return Policy | Prime Packaging Boxes",
    description: "100% satisfaction guarantee. Manufacturing defects, printing errors or damaged orders get a free reprint or full refund.",
    canonical: "/refund-return-policy"
  });

  return (
    <>
      {/* 1. HERO */}
      <section className="relative bg-[#0d1f3c] overflow-hidden min-h-[380px] md:min-h-[440px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.9}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <span className="inline-block bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            100% Satisfaction Guarantee
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            100% Satisfaction <br />
            <span className="text-[#e63329]">Or We Make It Right</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Manufacturing defect? Printing error? Damaged in transit? We reprint or refund — no questions asked. Your satisfaction is our absolute priority.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Free Reprint on Defects", "Full Refund Option", "1 Business Day Response", "No Restocking Fees"].map((t, i) => (
              <span key={i} className="flex items-center gap-2 bg-white/10 text-white/90 text-sm font-semibold px-4 py-2 rounded-full border border-white/15">
                <CheckCircle className="w-4 h-4 text-green-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. GUARANTEE BANNER */}
      <section className="bg-green-600 py-6 border-b border-green-700">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white font-bold md:text-lg flex flex-col md:flex-row items-center justify-center gap-3">
            <ShieldCheck className="w-6 h-6 flex-shrink-0" />
            <span>If the product doesn't match your approved proof, we will reprint it at zero cost or issue a full refund. Full stop.</span>
          </p>
        </div>
      </section>

      {/* 3. REFUND VS REPRINT TABLE */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Reprint vs Refund</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">When a claim is approved, the choice is yours. Here is what to expect.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <RefreshCcw className="w-10 h-10 text-blue-600" />
                <h3 className="text-2xl font-black text-[#1a2f5a]">Full Reprint</h3>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-2 text-gray-700 text-sm"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Prioritized front-of-the-line production</li>
                <li className="flex items-start gap-2 text-gray-700 text-sm"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> Exact match to your original specifications</li>
                <li className="flex items-start gap-2 text-gray-700 text-sm"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" /> 100% free expedited shipping included</li>
              </ul>
              <div className="bg-blue-50 text-blue-800 text-sm font-bold p-3 rounded-lg text-center">Resolution: 5–7 Business Days</div>
            </div>
            <div className="bg-white p-8 rounded-2xl border-2 border-green-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <Target className="w-10 h-10 text-green-600" />
                <h3 className="text-2xl font-black text-[#1a2f5a]">Full Refund</h3>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-2 text-gray-700 text-sm"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> Refunded directly to original payment method</li>
                <li className="flex items-start gap-2 text-gray-700 text-sm"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> No hidden restocking fees</li>
                <li className="flex items-start gap-2 text-gray-700 text-sm"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> Transparent process with no hassle</li>
              </ul>
              <div className="bg-green-50 text-green-800 text-sm font-bold p-3 rounded-lg text-center">Resolution: 3–5 Business Days</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT QUALIFIES */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">What Qualifies for a Claim</h2>
            <p className="text-gray-600">If any of these issues occur, you are fully covered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Visible printing defects or smudging",
              "Wrong dimensions (outside 1/8\" tolerance)",
              "Color variance exceeding industry ±10%",
              "Structural issues (won't fold/close)",
              "Wrong product type or material used",
              "Items visibly damaged during transit"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="font-bold text-green-900 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHAT DOES NOT QUALIFY */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">What Is Not Covered</h2>
            <p className="text-gray-600">The following scenarios are outside the scope of our guarantee.</p>
          </div>
          <div className="space-y-4">
            {[
              { title: "Customer Artwork Errors", desc: "Typos, spelling mistakes, or layout issues that were present in the digital proof you approved." },
              { title: "Change of Mind", desc: "Deciding you want a different size, style, or design after production has already commenced." },
              { title: "Normal Color Variation", desc: "Slight color shifts between screen displays and the final printed product that fall within the standard ±10% tolerance." }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-white border border-red-100 rounded-2xl">
                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-[#1a2f5a] mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CLAIMS PROCESS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Hassle-Free Claim Process</h2>
            <p className="text-gray-600">We make resolving issues as fast as possible.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            {[
              { step: "1", icon: <Search className="w-6 h-6" />, title: "Document Issue", desc: "Take clear photos of the defect or damage." },
              { step: "2", icon: <Phone className="w-6 h-6" />, title: "Contact Us", desc: "Email support within 7 days of delivery." },
              { step: "3", icon: <FileText className="w-6 h-6" />, title: "Quick Review", desc: "We evaluate your photos within 1 business day." },
              { step: "4", icon: <ThumbsUp className="w-6 h-6" />, title: "Resolution", desc: "We process your free reprint or full refund." }
            ].map((s, i) => (
              <div key={i} className="relative z-10 text-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-[#1a2f5a] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {s.step}
                </div>
                <div className="text-[#e63329] flex justify-center mb-3">{s.icon}</div>
                <h3 className="font-bold text-[#1a2f5a] mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TIMELINE TABLE */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-extrabold text-[#1a2f5a] mb-6 text-center">Resolution Timelines</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#1a2f5a] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Action Type</th>
                  <th className="px-6 py-4 text-left font-bold">Estimated Timeframe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Claim Initial Review</td>
                  <td className="px-6 py-4 text-gray-600">1 Business Day</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Processing a Refund</td>
                  <td className="px-6 py-4 text-gray-600">3–5 Business Days (depending on bank)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Manufacturing a Reprint</td>
                  <td className="px-6 py-4 text-gray-600">5–7 Business Days (Priority Queue)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Shipping Reprints</td>
                  <td className="px-6 py-4 text-gray-600">Standard Transit Time (Expedited options available)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. QC CHECKPOINTS */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4">Our Quality Standards</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We rarely have to issue refunds because we catch issues before they leave the facility. Every order undergoes 5 strict quality checkpoints.
              </p>
              <ul className="space-y-4">
                {[
                  "Digital Pre-Press File Verification",
                  "Material Strength & Caliper Test",
                  "First-Article Print Color Calibration",
                  "Die-Cut Precision Measurement",
                  "Final Assembly & Count Audit"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#e63329]" />
                    <span className="text-gray-800 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/2 bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center">
              <AlertTriangle className="w-12 h-12 text-[#1a2f5a] mx-auto mb-4" />
              <h3 className="font-extrabold text-[#1a2f5a] text-xl mb-2">Order Protection Included</h3>
              <p className="text-sm text-gray-600 mb-4">
                We utilize double-walled master cartons and heavy-duty foam inserts to ensure your custom boxes survive the transit journey to your facility.
              </p>
              <div className="inline-flex items-center gap-2 bg-[#1a2f5a] text-white px-4 py-2 rounded-lg font-bold text-sm">
                <ShieldCheck className="w-4 h-4" /> Transit Insured
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. USA SUPPORT INFO */}
      <section className="py-16 bg-[#1a2f5a] text-white text-center">
        <div className="container mx-auto px-4">
          <MapPin className="w-12 h-12 text-[#e63329] mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold mb-4">USA-Based Support</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
            No endless phone trees. No overseas call centers. Our support and quality control team is based right here in Torrance, CA, ensuring you get rapid responses during US business hours.
          </p>
          <div className="inline-flex items-center gap-3 bg-white text-[#1a2f5a] px-6 py-3 rounded-xl font-bold">
            <Phone className="w-5 h-5 text-[#e63329]" /> Call us: 818-758-4076
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-8 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How long do I have to report an issue?", a: "You have 7 days from the date of delivery to report any quality issues or transit damage." },
              { q: "Do I need to return the defective products?", a: "Usually no. Clear photographs of the defect are typically enough. We'll let you know if a physical sample needs to be mailed back." },
              { q: "What if only part of my order is damaged?", a: "We handle partial claims as well. We will reprint or refund the specific portion of the order that is defective." },
              { q: "Can I change my artwork for a reprint?", a: "Reprints must use the exact same artwork and specifications as the original order. Alterations are treated as a new order." },
              { q: "Are custom samples refundable?", a: "Custom prototype samples are non-refundable as they cover setup and labor costs, but their cost is credited toward your bulk production order." }
            ].map((faq, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-bold text-[#1a2f5a] transition-colors list-none">
                  {faq.q}
                  <span className="text-[#e63329] group-open:rotate-45 transition-transform ml-4">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-200 pt-4 bg-white">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CTA */}
      <section className="py-20 bg-[#0d1f3c] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Order With Complete Confidence</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
            Join thousands of USA brands who trust Prime Packaging Boxes. Your quality is guaranteed.
          </p>
          <Link href="/get-quote" className="inline-flex items-center gap-2 bg-[#e63329] text-white hover:bg-white hover:text-[#e63329] px-8 py-4 rounded-lg font-extrabold text-lg transition-all shadow-lg">
            Get Your Free Quote <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}