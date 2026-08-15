import { useSEO } from "../lib/useSEO";
import { Link } from "wouter";
import { Truck, Clock, Globe, MapPin, Package, Shield, Zap, CheckCircle, ArrowRight, Phone, Calendar, Search, Map, HelpCircle, Box, FileCheck, Plane, AlertTriangle, ShieldCheck } from "lucide-react";

export default function DeliveryPolicyPage() {
  useSEO({
    title: "Delivery Policy | Prime Packaging Boxes",
    description: "Learn about Prime Packaging Boxes delivery policy — free US shipping to all 50 states, fast 7-10 day production, rush options, and live tracking.",
    canonical: "/delivery-policy"
  });

  return (
    <>
      {/* 1. HERO */}
      <section className="relative bg-[#0d1f3c] overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.9}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block bg-[#e63329]/15 border border-[#e63329]/30 text-[#ff6b63] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                Delivery Policy — All 50 US States
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                Fast. Reliable.<br />
                <span className="text-[#e63329]">Free Shipping Across the USA</span>
              </h1>
              <p className="text-white/70 text-lg mb-8">
                Serving USA brands from our Torrance, CA facility. Real-time tracking and uncompromised quality on every order.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Free US Shipping","7–10 Day Production","Rush 3–5 Day Available","Real-Time Tracking"].map((t, i) => (
                  <span key={i} className="flex items-center gap-2 bg-white/10 text-white/90 text-sm font-semibold px-4 py-2 rounded-full border border-white/15">
                    <CheckCircle className="w-4 h-4 text-green-400" /> {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#e63329]/10 rounded-3xl blur-2xl" />
                <img
                  src="/api/uploads/corrugated-mailer-boxes-wholesale.webp"
                  alt="Custom corrugated mailer boxes shipped free across USA"
                  className="relative rounded-2xl shadow-2xl w-full object-cover max-h-[380px]"
                  loading="eager"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                  <Truck className="w-8 h-8 text-[#e63329]" />
                  <div>
                    <div className="font-bold text-[#1a2f5a] text-sm">Free Shipping</div>
                    <div className="text-xs text-gray-500">All 50 US States</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Truck className="w-6 h-6 text-[#e63329] mx-auto mb-3" />, val: "Free", label: "US Shipping" },
              { icon: <Clock className="w-6 h-6 text-[#e63329] mx-auto mb-3" />, val: "7–10 Days", label: "Standard Production" },
              { icon: <Zap className="w-6 h-6 text-[#e63329] mx-auto mb-3" />, val: "3–5 Days", label: "Rush Available" },
              { icon: <MapPin className="w-6 h-6 text-[#e63329] mx-auto mb-3" />, val: "50 States", label: "Serving All US States" },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                {s.icon}
                <div className="text-3xl font-black text-[#1a2f5a] mb-1">{s.val}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SHIPPING ZONES TABLE */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">US Shipping Zones & Transit Times</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Estimated transit times via our carrier network across the United States after production is completed.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[#1a2f5a] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Region</th>
                  <th className="px-6 py-4 text-left font-bold">Carrier</th>
                  <th className="px-6 py-4 text-left font-bold">Transit Time</th>
                  <th className="px-6 py-4 text-left font-bold">Shipping Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { region: "West Coast (CA, OR, WA)", carrier: "FedEx / UPS", time: "1–2 Business Days", cost: "FREE" },
                  { region: "Southwest (AZ, NV, NM, TX)", carrier: "FedEx / UPS", time: "2–3 Business Days", cost: "FREE" },
                  { region: "Midwest (IL, OH, MI, MN)", carrier: "FedEx / UPS", time: "3–4 Business Days", cost: "FREE" },
                  { region: "Northeast (NY, MA, PA, FL)", carrier: "FedEx / UPS", time: "4–5 Business Days", cost: "FREE" },
                  { region: "Alaska & Hawaii", carrier: "USPS / FedEx", time: "5–7 Business Days", cost: "Quoted" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1a2f5a]">{row.region}</td>
                    <td className="px-6 py-4 text-gray-600">{row.carrier}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{row.time}</td>
                    <td className="px-6 py-4">
                      <span className={row.cost === "FREE" ? "bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs" : "bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full text-xs"}>
                        {row.cost}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. FREE SHIPPING SECTION */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4">100% Free Shipping Across All 50 States</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            We believe custom packaging shouldn't come with hidden fees. That's why we offer absolutely free ground shipping to all 50 US states on every single order. No hidden minimums, no surprise charges at checkout.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <CheckCircle className="w-5 h-5" />, title: "No Minimums", desc: "Free shipping applies to all standard volume orders." },
              { icon: <Map className="w-5 h-5" />, title: "Coast to Coast", desc: "From California to Maine, we cover the shipping costs." },
              { icon: <ShieldCheck className="w-5 h-5" />, title: "Fully Insured", desc: "Every shipment is insured against transit damage." }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl">
                <div className="text-[#e63329] mb-3">{f.icon}</div>
                <h3 className="font-bold text-[#1a2f5a] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RUSH ORDER OPTIONS */}
      <section className="py-16 bg-[#1a2f5a] text-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="inline-block bg-[#e63329] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Need it faster?</span>
              <h2 className="text-3xl font-extrabold mb-4">Rush Order Fulfillment</h2>
              <p className="text-white/80 leading-relaxed mb-6">
                Deadline approaching? Our Rush Order service drops production time from 7-10 days to just 3-5 business days. Perfect for product launches, events, or last-minute restocking.
              </p>
              <ul className="space-y-4">
                {[
                  "Prioritized front-of-the-line production",
                  "Dedicated quality control specialist",
                  "Expedited overnight shipping available upon request",
                  "Subject to facility capacity and order size"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-[#e63329] flex-shrink-0" />
                    <span className="text-white/90 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/3 bg-white text-[#1a2f5a] p-8 rounded-2xl text-center shadow-xl">
              <Clock className="w-12 h-12 text-[#e63329] mx-auto mb-4" />
              <h3 className="font-extrabold text-2xl mb-2">3–5 Days</h3>
              <p className="text-gray-500 text-sm mb-6">Production Time</p>
              <Link href="/contact" className="inline-block bg-[#1a2f5a] text-white font-bold px-6 py-3 rounded-lg w-full hover:bg-[#0d1f3c] transition-colors">
                Request a Rush Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR CARRIERS */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Trusted Carrier Network</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">We partner with the most reliable logistics providers in the USA to ensure your boxes arrive safely and on time.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "FedEx", icon: <Truck className="w-8 h-8" />, desc: "Primary carrier for vast majority of our domestic ground shipments." },
              { title: "UPS", icon: <Box className="w-8 h-8" />, desc: "Used for specific US regions and expedited overnight requirements." },
              { title: "DHL", icon: <Globe className="w-8 h-8" />, desc: "Our preferred partner for any international shipping requests." }
            ].map((c, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-[#1a2f5a]/5 text-[#1a2f5a] rounded-xl flex items-center justify-center mx-auto mb-4">
                  {c.icon}
                </div>
                <h3 className="font-extrabold text-[#1a2f5a] text-xl mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ORDER TRACKING */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4">Real-Time Order Tracking</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            From the moment your boxes leave our Torrance, CA facility, you'll know exactly where they are. We provide automated tracking updates directly to your inbox.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-[#1a2f5a] flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-[#e63329]" /> Live Status Updates
              </h3>
              <p className="text-gray-500 text-sm">Receive email and SMS notifications at every major transit checkpoint until your packages arrive at your door.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-[#1a2f5a] flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-[#e63329]" /> Dedicated Support
              </h3>
              <p className="text-gray-500 text-sm">If an exception occurs during transit, our USA-based support team proactively steps in to resolve it with the carrier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRODUCTION TIMELINE */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Standard Production Timeline</h2>
            <p className="text-gray-600">The journey from approval to your loading dock.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { day: "Day 1", icon: <FileCheck className="w-6 h-6" />, title: "Artwork Approved", desc: "Production begins the moment your final proof is approved." },
              { day: "Day 2-3", icon: <Box className="w-6 h-6" />, title: "Printing & Cutting", desc: "Your custom designs are printed and structural cutting is performed." },
              { day: "Day 4-7", icon: <Zap className="w-6 h-6" />, title: "Finishing & Assembly", desc: "Coatings, foil stamping, and gluing processes take place." },
              { day: "Day 8-10", icon: <Shield className="w-6 h-6" />, title: "QC & Dispatch", desc: "Rigorous quality check before handing off to the carrier." }
            ].map((step, i) => (
              <div key={i} className="relative p-6 border border-gray-200 rounded-2xl bg-gray-50">
                <div className="text-sm font-black text-[#e63329] uppercase tracking-widest mb-4">{step.day}</div>
                <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-[#1a2f5a] mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-[#1a2f5a] mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. INTERNATIONAL SHIPPING */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Plane className="w-12 h-12 text-[#1a2f5a] mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4">International Delivery</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            While our primary focus is serving USA brands, we do fulfill international orders. International shipping is subject to custom quotes, varying transit times, and local customs duties which are the responsibility of the buyer.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#1a2f5a] font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Request International Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 10. PACKAGING PROTECTION */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4">We Protect Your Boxes</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                What good is custom packaging if it arrives damaged? We take extra precautions to ensure your order arrives in pristine condition.
              </p>
              <ul className="space-y-4">
                {[
                  "Double-walled corrugated master cartons",
                  "Custom foam void-fill inserts to prevent shifting",
                  "Edge protectors on heavy palletized shipments",
                  "Weather-resistant shrink wrapping for freight"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-[#e63329] flex-shrink-0" />
                    <span className="text-gray-800 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/2 bg-[#1a2f5a] text-white p-10 rounded-3xl text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Damaged in Transit?</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                If your order is damaged by the carrier, take photos immediately and contact us within 48 hours. We handle the carrier claim and will arrange for a swift resolution.
              </p>
              <Link href="/refund-return-policy" className="inline-flex items-center justify-center text-sm font-bold text-yellow-400 hover:text-yellow-300">
                View Refund Policy <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <HelpCircle className="w-8 h-8 text-[#e63329] mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">Delivery FAQ</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Is shipping really free to all 50 states?", a: "Yes. We cover all ground shipping costs to any commercial or residential address in the 50 US states." },
              { q: "Do you ship to P.O. Boxes?", a: "Due to the size of packaging shipments, we require a physical street address. Carriers like FedEx and UPS do not deliver bulk freight to P.O. Boxes." },
              { q: "Can I split my shipment to multiple locations?", a: "Yes, we can drop-ship your order to multiple fulfillment centers. Additional shipping fees apply for split shipments." },
              { q: "What if my delivery is delayed?", a: "While rare, weather or carrier logistics can cause delays. We monitor all shipments and will notify you proactively if we detect a significant delay." },
              { q: "Are custom duties included for international orders?", a: "No. For orders outside the USA, the buyer is responsible for all customs, duties, and import taxes levied by the destination country." },
              { q: "Do you offer blind shipping?", a: "Yes. If you are an agency or reseller, we can blind-ship directly to your client without any Prime Packaging Boxes branding on the master cartons." }
            ].map((faq, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl bg-white overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-bold text-[#1a2f5a] hover:bg-gray-50 transition-colors list-none">
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

      {/* 12. CTA */}
      <section className="py-20 bg-[#0d1f3c] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready for Seamless Delivery?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
            Experience the peace of mind that comes with free US shipping, rigid quality control, and on-time delivery.
          </p>
          <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] text-white hover:bg-white hover:text-[#e63329] px-8 py-4 rounded-lg font-extrabold text-lg transition-all shadow-lg">
            Start Your Custom Order <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}