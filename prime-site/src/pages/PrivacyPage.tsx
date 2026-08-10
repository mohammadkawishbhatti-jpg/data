import { useSEO } from "../lib/useSEO";
import { Link } from "wouter";
import { Shield, Lock, Eye, ArrowRight, Database, Cookie, Share2, UserCheck, Smartphone, MapPin, Server, Trash2, Mail, CreditCard, Box, HelpCircle, Bell } from "lucide-react";

export default function PrivacyPage() {
  useSEO({
    title: "Privacy Policy | Prime Packaging Boxes",
    description: "Learn how Prime Packaging Boxes protects your privacy, secures your data, and complies with CCPA regulations.",
    canonical: "/privacy-policy"
  });

  return (
    <>
      {/* 1. HERO */}
      <section className="relative bg-[#0d1f3c] overflow-hidden min-h-[320px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.9}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <div className="w-16 h-16 bg-[#e63329]/15 border border-[#e63329]/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-[#e63329]" />
          </div>
          <span className="inline-block bg-[#e63329]/15 border border-[#e63329]/30 text-[#ff6b63] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Security & Trust — CCPA Compliant</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">Privacy Policy</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-2">Your trust is our priority. We never sell your personal data — ever.</p>
          <p className="text-white/40 text-sm">Last Updated: January 1, 2025</p>
        </div>
      </section>

      {/* 2. PRIVACY AT A GLANCE TABLE */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Privacy at a Glance</h2>
            <p className="text-gray-600">A quick summary of how we handle your information.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[#1a2f5a] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">What We Collect</th>
                  <th className="px-6 py-4 text-left font-bold">Why We Need It</th>
                  <th className="px-6 py-4 text-left font-bold">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Contact Details</td>
                  <td className="px-6 py-4 text-gray-600">To send quotes and order updates</td>
                  <td className="px-6 py-4 text-gray-500">Until account deletion requested</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Shipping Address</td>
                  <td className="px-6 py-4 text-gray-600">To deliver your custom boxes</td>
                  <td className="px-6 py-4 text-gray-500">7 years (Tax compliance)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Payment Info</td>
                  <td className="px-6 py-4 text-gray-600">To process transactions securely</td>
                  <td className="px-6 py-4 text-gray-500">Never stored on our servers</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#1a2f5a]">Website Cookies</td>
                  <td className="px-6 py-4 text-gray-600">Site functionality & analytics</td>
                  <td className="px-6 py-4 text-gray-500">Varies (Session to 1 year)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. DATA WE COLLECT GRID */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Data We Collect</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <UserCheck />, title: "Identity Data", desc: "Name, email, and company details you provide." },
              { icon: <Box />, title: "Order Data", desc: "Packaging specs, uploaded artwork, and history." },
              { icon: <CreditCard />, title: "Financial Data", desc: "Securely processed tokens via Stripe/PayPal." },
              { icon: <MapPin />, title: "Location Data", desc: "Shipping and billing addresses across the US." },
              { icon: <Smartphone />, title: "Device Info", desc: "Browser type, OS, to ensure site compatibility." },
              { icon: <Cookie />, title: "Cookie Data", desc: "Session IDs and basic usage analytics." }
            ].map((c, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  {c.icon}
                </div>
                <h3 className="font-bold text-[#1a2f5a] mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW WE USE DATA */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">How We Use Your Data</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Fulfill Orders", icon: <Box /> },
              { title: "Process Payments", icon: <CreditCard /> },
              { title: "Provide Support", icon: <Mail /> },
              { title: "Send Updates", icon: <Bell /> },
              { title: "Improve Security", icon: <Lock /> },
              { title: "Site Analytics", icon: <Eye /> },
              { title: "Prevent Fraud", icon: <Shield /> },
              { title: "Marketing (Opt-in)", icon: <Share2 /> }
            ].map((u, i) => (
              <div key={i} className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-[#e63329] flex justify-center mb-3">{u.icon}</div>
                <div className="text-sm font-bold text-[#1a2f5a]">{u.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DATA SECURITY */}
      <section className="py-16 bg-[#1a2f5a] text-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <Server className="w-16 h-16 text-[#e63329] mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold mb-6">Enterprise-Grade Security</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            All data transmitted to and from primepackagingboxes.com is encrypted using 256-bit SSL protocols. We utilize robust firewalls and restrict internal access strictly to personnel requiring the data to fulfill your USA packaging orders.
          </p>
          <div className="flex justify-center gap-4">
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg font-bold text-sm border border-white/20"><Lock className="w-4 h-4" /> SSL Encrypted</span>
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg font-bold text-sm border border-white/20"><Shield className="w-4 h-4" /> PCI Compliant</span>
          </div>
        </div>
      </section>

      {/* 6. YOUR RIGHTS (CCPA) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">Compliance</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">Your CCPA Privacy Rights</h2>
            <p className="text-gray-600 mt-3">As a California-based company, we extend these robust privacy rights to all 50 states.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Right to know what data is collected",
              "Right to request data deletion",
              "Right to opt-out of marketing",
              "Right to correct inaccurate data",
              "Right to non-discrimination",
              "Right to data portability"
            ].map((right, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-bold text-[#1a2f5a] text-sm">{right}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-8 text-center">Privacy FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Do you sell my information?", a: "No. We never sell, rent, or trade your personal information to third parties." },
              { q: "How long do you keep my artwork?", a: "We keep your digital assets securely stored for easy reordering. You can request artwork deletion at any time." },
              { q: "Are my credit card details safe?", a: "Yes. We do not store full credit card numbers. Payments are processed securely via PCI-compliant gateways like Stripe." }
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

      {/* 8. CONTACT PRIVACY */}
      <section className="py-16 bg-white border-b border-gray-100 text-center">
        <div className="container mx-auto px-4">
          <Mail className="w-10 h-10 text-[#e63329] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-[#1a2f5a] mb-3">Privacy Inquiries</h2>
          <p className="text-gray-600 mb-6">To exercise your data rights or ask questions, email our Data Officer.</p>
          <a href="mailto:privacy@primepackagingboxes.com" className="text-xl font-bold text-[#1a2f5a] hover:text-[#e63329] underline">
            privacy@primepackagingboxes.com
          </a>
        </div>
      </section>

      {/* 9. CTA */}
      <section className="py-20 bg-[#0d1f3c] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Secure & Confidential Ordering</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8 text-lg">
            Your ideas, your artwork, and your data are safe with us.
          </p>
          <Link href="/get-quote" className="inline-flex items-center gap-2 bg-[#e63329] text-white hover:bg-white hover:text-[#e63329] px-8 py-4 rounded-lg font-extrabold text-lg transition-all shadow-lg">
            Start Your Custom Order <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}