import { useSEO } from "../lib/useSEO";
import { Link } from "wouter";
import { FileText, ArrowRight, CheckCircle, Scale, Shield, CreditCard, Paintbrush, Truck, RotateCcw, AlertTriangle, MapPin, Phone, Clock, FileWarning } from "lucide-react";

export default function TermsPage() {
  useSEO({
    title: "Terms & Conditions | Prime Packaging Boxes",
    description: "Read the Terms and Conditions for Prime Packaging Boxes. Understand our ordering process, payment terms, and policies.",
    canonical: "/terms-and-conditions"
  });

  const legalSections = [
    { icon: <CheckCircle />, title: "1. Acceptance of Terms", content: "By accessing primepackagingboxes.com or placing an order, you agree to be bound by these Terms and Conditions. These terms govern your use of our services, website, and all custom packaging products provided by Prime Packaging Boxes, located in Torrance, CA." },
    { icon: <FileText />, title: "2. Quotes & Orders", content: "All pricing quotes are valid for 30 days. An order is only confirmed once we receive your signed digital proof approval and the required deposit. We reserve the right to decline or cancel orders if artwork violates our content policies." },
    { icon: <CreditCard />, title: "3. Payment Terms", content: "A 50% deposit is required before production begins. The remaining 50% balance must be paid prior to shipment. We accept major credit cards, ACH, and wire transfers. All prices are in USD. Custom tooling or die costs (if applicable) are non-refundable." },
    { icon: <Paintbrush />, title: "4. Design & Intellectual Property", content: "You retain ownership of all artwork you submit. By submitting files, you guarantee you hold the appropriate copyrights or licenses. You grant us a limited license to use the artwork solely for manufacturing your order. Free design support includes up to 3 revisions." },
    { icon: <Truck />, title: "5. Production & Shipping", content: "Standard production takes 7-10 business days post-approval. Free ground shipping applies to all 50 US states. Transit times are estimates. We are not liable for delays caused by extreme weather, carriers, or customs." },
    { icon: <RotateCcw />, title: "6. Returns & Reprints", content: "Custom packaging is non-refundable unless there is a verifiable manufacturing defect, dimensional error >1/8\", or color variance >10%. Claims must be submitted with photos within 7 days of delivery. Refer to our Refund Policy for details." },
    { icon: <Shield />, title: "7. Warranties", content: "We warrant that products will conform to the approved digital proof. We disclaim all other warranties, express or implied, including merchantability or fitness for a particular purpose." },
    { icon: <AlertTriangle />, title: "8. Limitation of Liability", content: "In no event shall Prime Packaging Boxes be liable for any indirect, punitive, or consequential damages arising from the use of our products. Our total maximum liability is strictly limited to the purchase price of the specific order." },
    { icon: <FileWarning />, title: "9. Indemnification", content: "You agree to indemnify and hold harmless Prime Packaging Boxes from any claims, damages, or expenses (including legal fees) arising from your breach of these Terms or related to the artwork you supplied." },
    { icon: <Scale />, title: "10. Governing Law", content: "These terms shall be governed by the laws of the State of California, USA, without regard to its conflict of law provisions. Any legal action shall be resolved exclusively in the state or federal courts located in Los Angeles County, CA." }
  ];

  return (
    <>
      {/* 1. HERO */}
      <section className="relative bg-[#0d1f3c] overflow-hidden min-h-[320px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.9}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <div className="w-16 h-16 bg-[#e63329]/15 border border-[#e63329]/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Scale className="w-8 h-8 text-[#e63329]" />
          </div>
          <span className="inline-block bg-[#e63329]/15 border border-[#e63329]/30 text-[#ff6b63] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Legal — California, USA</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">Terms & Conditions</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-2">Please read these terms carefully before placing an order with Prime Packaging Boxes.</p>
          <p className="text-white/40 text-sm">Last Updated: January 1, 2025</p>
        </div>
      </section>

      {/* 2. QUICK SUMMARY TABLE */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Quick Summary</h2>
            <p className="text-gray-600">The most important rules at a glance.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#1a2f5a] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Category</th>
                  <th className="px-6 py-4 text-left font-bold">Policy Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Quote Validity</td>
                  <td className="px-6 py-4 text-gray-600">Quotes expire after 30 days.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Payment Structure</td>
                  <td className="px-6 py-4 text-gray-600">50% upfront deposit to begin, 50% prior to shipping.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Cancellations</td>
                  <td className="px-6 py-4 text-gray-600">Not permitted after production begins.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Quality Tolerance</td>
                  <td className="px-6 py-4 text-gray-600">±10% color variance, ±1/8" dimensional variance.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. LEGAL SECTIONS GRID */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-10 text-center">Detailed Terms</h2>
          <div className="space-y-6">
            {legalSections.map((sec, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-[#e63329]">{sec.icon}</div>
                  <h3 className="text-xl font-bold text-[#1a2f5a]">{sec.title}</h3>
                </div>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed pl-10">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. KEY DATES & NUMBERS */}
      <section className="py-16 bg-[#1a2f5a] text-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-extrabold text-center mb-10">Key Numbers to Remember</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "30", label: "Days Quote is Valid", icon: <Clock className="mx-auto mb-2 text-[#e63329]" /> },
              { val: "50%", label: "Required Deposit", icon: <CreditCard className="mx-auto mb-2 text-[#e63329]" /> },
              { val: "3", label: "Free Design Revisions", icon: <Paintbrush className="mx-auto mb-2 text-[#e63329]" /> },
              { val: "7", label: "Days to Report Defects", icon: <AlertTriangle className="mx-auto mb-2 text-[#e63329]" /> }
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                {stat.icon}
                <div className="text-3xl font-black text-white mb-2">{stat.val}</div>
                <div className="text-xs font-bold text-white/60 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. JURISDICTION */}
      <section className="py-16 bg-white border-b border-gray-100 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <MapPin className="w-12 h-12 text-[#1a2f5a] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#1a2f5a] mb-4">Governed by California Law</h2>
          <p className="text-gray-600 mb-6">
            Prime Packaging Boxes is proudly based in Torrance, CA, USA. Any disputes arising from these Terms will be handled in accordance with California State law.
          </p>
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-500 font-bold border border-gray-200">
            Jurisdiction: Los Angeles County, CA
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-8 text-center">Terms FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Can I cancel my order?", a: "Orders can only be cancelled before production begins. Once your digital proof is approved and production starts, cancellations are not permitted." },
              { q: "Do you offer Net-30 terms?", a: "Net-30 terms are only available for established enterprise clients with a purchasing history of 6+ months, subject to credit approval." },
              { q: "Who owns the dieline structure?", a: "While you own your artwork, Prime Packaging Boxes retains the intellectual property rights to custom structural dielines engineered by our team, unless exclusively purchased." }
            ].map((faq, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl bg-white overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-bold text-[#1a2f5a] transition-colors list-none">
                  {faq.q}
                  <span className="text-[#e63329] group-open:rotate-45 transition-transform ml-4">+</span>
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CONTACT LEGAL */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Phone className="w-10 h-10 text-[#e63329] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#1a2f5a] mb-4">Questions about our Terms?</h2>
          <p className="text-gray-600 mb-8">Our support team is available during US business hours to clarify any legal or process questions.</p>
          <div className="text-lg font-bold text-[#1a2f5a] mb-2">Call: 818-758-4076</div>
          <div className="text-gray-500 text-sm">Mon-Fri, 9am - 6pm PST</div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-20 bg-[#0d1f3c] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Build Your Brand?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
            Agreeable terms, premium quality, and reliable USA-based manufacturing.
          </p>
          <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] text-white hover:bg-white hover:text-[#e63329] px-8 py-4 rounded-lg font-extrabold text-lg transition-all shadow-lg">
            Start Your Project <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}