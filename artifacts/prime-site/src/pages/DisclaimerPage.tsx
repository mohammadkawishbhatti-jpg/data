import { useSEO } from "../lib/useSEO";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Scale, ShieldAlert, Monitor, Droplet, Copyright, Briefcase, RefreshCcw, HandCoins, Info, HelpCircle } from "lucide-react";

export default function DisclaimerPage() {
  useSEO({
    title: "Disclaimer | Prime Packaging Boxes",
    description: "Legal disclaimer for Prime Packaging Boxes regarding product accuracy, colors, intellectual property, and liability limitations.",
    canonical: "/disclaimer"
  });

  return (
    <>
      {/* 1. HERO */}
      <section className="relative bg-[#0d1f3c] overflow-hidden min-h-[320px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.9}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <div className="w-16 h-16 bg-yellow-400/15 border border-yellow-400/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          <span className="inline-block bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Legal Notice — California, USA</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">Site Disclaimer</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-2">Important information about the use of our website and custom packaging services.</p>
          <p className="text-white/40 text-sm">Last Updated: January 1, 2025</p>
        </div>
      </section>

      {/* 2. QUICK SUMMARY CARD */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
            <div className="flex gap-4">
              <Info className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-800 font-bold text-lg mb-2">Summary</h3>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  The information on this website is for general reference. Actual physical products may vary slightly from 3D digital mockups. Colors on screens differ from physical printing. We rely on customer accuracy for supplied artwork and hold no liability for copyright infringement claims on user-uploaded designs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DETAILS GRID */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-10 text-center">Specific Disclaimers</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* General */}
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
              <Scale className="w-8 h-8 text-[#1a2f5a] mb-4" />
              <h3 className="font-bold text-[#1a2f5a] text-lg mb-2">General Information</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                All content provided on primepackagingboxes.com is for informational purposes only. We make no representations as to the absolute completeness of any information on this site.
              </p>
            </div>

            {/* Colors */}
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
              <Droplet className="w-8 h-8 text-[#1a2f5a] mb-4" />
              <h3 className="font-bold text-[#1a2f5a] text-lg mb-2">Color Accuracy</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Colors viewed on monitors (RGB) will differ from physical ink printing (CMYK/Pantone). We are not liable for standard color variations within the ±10% industry tolerance limit.
              </p>
            </div>

            {/* Mockups */}
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
              <Monitor className="w-8 h-8 text-[#1a2f5a] mb-4" />
              <h3 className="font-bold text-[#1a2f5a] text-lg mb-2">3D Digital Mockups</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Digital 3D renders provided during the proofing stage are approximations. They may not perfectly capture the exact texture, gloss, or structural rigidity of the final cardboard product.
              </p>
            </div>

            {/* IP */}
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
              <Copyright className="w-8 h-8 text-[#1a2f5a] mb-4" />
              <h3 className="font-bold text-[#1a2f5a] text-lg mb-2">Intellectual Property</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                By uploading logos or artwork, you affirm that you possess the legal right to use them. Prime Packaging Boxes accepts no liability for trademark or copyright disputes arising from client-provided files.
              </p>
            </div>

            {/* Liability */}
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-[#1a2f5a] mb-4" />
              <h3 className="font-bold text-[#1a2f5a] text-lg mb-2">Limitation of Liability</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                In no event will we be liable for indirect, incidental, or consequential damages resulting from the use or inability to use our packaging products, including lost business revenue.
              </p>
            </div>

            {/* Timelines */}
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
              <Briefcase className="w-8 h-8 text-[#1a2f5a] mb-4" />
              <h3 className="font-bold text-[#1a2f5a] text-lg mb-2">Production Timelines</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Any stated turnaround times (e.g., 7-10 days) are estimates and not guaranteed delivery dates. We are not responsible for delays out of our immediate control, such as carrier delays.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THIRD PARTY LINKS */}
      <section className="py-16 bg-[#1a2f5a] text-white text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold mb-4">Third-Party Links</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Our site may contain links to external websites (such as shipping carriers or payment gateways). We do not guarantee the accuracy or safety of third-party domains and advise users to read their respective privacy policies.
          </p>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-8 text-center">Disclaimer FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Can I guarantee exact color matching?", a: "Due to the nature of physical printing, absolute exact color matching to a backlit screen is physically impossible. We recommend ordering a physical sample for strict color requirements." },
              { q: "Are quotes legally binding?", a: "Quotes are estimates valid for 30 days. They do not constitute a legally binding contract until a deposit is paid and a proof is signed." },
              { q: "Does this disclaimer apply to all US states?", a: "Yes, this disclaimer applies to all orders shipped within the 50 US states, governed under the laws of California." }
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

      {/* 6. CTA */}
      <section className="py-20 bg-[#0d1f3c] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Clear Communication. Premium Results.</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
            We believe in transparency at every step of the custom packaging process.
          </p>
          <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] text-white hover:bg-white hover:text-[#e63329] px-8 py-4 rounded-lg font-extrabold text-lg transition-all shadow-lg">
            Get Your Free Quote <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}