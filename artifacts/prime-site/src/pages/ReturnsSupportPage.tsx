import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "../lib/useSEO";
import {
  ShieldAlert, RefreshCcw, Camera, Mail, Phone, Clock,
  CheckCircle, XCircle, FileText, Send, Wrench, Search,
  MapPin, ShieldCheck, AlertTriangle, ArrowRight, MessageSquare
} from "lucide-react";

export default function ReturnsSupportPage() {
  useSEO({ title: "Returns & Claims Support | Prime Packaging Boxes", description: "Our 100% Satisfaction Guarantee. Learn about our returns process, claims, and dedicated USA support." });

  const [form, setForm] = useState({ orderNumber: "", email: "", issue: "", details: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketReference, setTicketReference] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.orderNumber.trim() || !form.email.trim() || !form.issue.trim() || form.details.trim().length < 10) {
      setError("Please complete all fields and provide at least 10 characters of detail.");
      return;
    }
    setIsSubmitting(true);
    fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Returns Claim — ${form.orderNumber.trim()}`,
        email: form.email.trim(),
        subject: `Returns Claim — ${form.issue.trim()} — ${form.orderNumber.trim()}`,
        priority: "high",
        message: [`Order Number: ${form.orderNumber.trim()}`, `Issue Type: ${form.issue.trim()}`, "", form.details.trim()].join("\n"),
      }),
    }).then(async response => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to submit claim");
      setTicketReference(result.referenceNumber || "");
      setSubmitted(true);
    }).catch((submissionError) => {
      setError(submissionError instanceof Error ? submissionError.message : "We could not submit your claim. Please try again.");
    }).finally(() => setIsSubmitting(false));
  };

  return (
    <>
      {/* 1. HERO SECTION */}
      <section className="bg-[#0d1f3c] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.9}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#e63329]/20 text-[#ff6b63] border border-[#e63329]/50 font-bold px-4 py-2 rounded-full mb-6 text-sm tracking-wide">
                <ShieldAlert className="w-4 h-4" /> Returns & Claims Center — USA
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                We Make It Right.<br /> <span className="text-[#e63329]">Guaranteed.</span>
              </h1>
              <p className="text-white/80 text-lg mb-8">
                If your packaging isn't exactly as approved, we fix it fast. Hassle-free resolutions handled by our Torrance, CA support team for all USA brands.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Free Reprint","Fast Resolution","USA Support","No Restocking Fee"].map((t, i) => (
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
                  src="/api/uploads/custom-corrugated-mailer-boxes-with-logo.webp"
                  alt="Custom branded mailer boxes — quality guaranteed by Prime Packaging USA"
                  width={800}
                  height={600}
                  decoding="async"
                  className="relative rounded-2xl shadow-2xl w-full object-cover max-h-[380px]"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR GUARANTEE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-[#f8f9fa] border border-gray-200 rounded-3xl p-10 md:p-14 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ShieldCheck className="w-64 h-64 text-[#1a2f5a]" />
            </div>
            <ShieldCheck className="w-16 h-16 text-[#e63329] mx-auto mb-6 relative z-10" />
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4 relative z-10">100% Satisfaction Guarantee</h2>
            <p className="text-gray-600 text-lg relative z-10 leading-relaxed">
              We stand behind our manufacturing. If your custom boxes arrive with a manufacturing defect, print error, or structural failure that deviates from your approved proof, we will reprint the order at our expense or issue a full refund.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CLAIMS PROCESS */}
      <section className="py-20 bg-[#f8f9fa] border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">3-Step Claims Process</h2>
            <p className="text-gray-600">Fast resolutions to keep your business moving.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Submit Details", icon: FileText, desc: "Fill out the claims form with your order number and issue description." },
              { step: 2, title: "Send Photos", icon: Camera, desc: "Email us clear photos showing the defect on the affected boxes." },
              { step: 3, title: "Fast Resolution", icon: RefreshCcw, desc: "We review within 24 hours and process your reprint or refund." }
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl text-center border border-gray-200 shadow-sm relative">
                <div className="w-12 h-12 bg-[#1a2f5a] text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl absolute -top-6 left-1/2 -translate-x-1/2 border-4 border-[#f8f9fa]">
                  {s.step}
                </div>
                <s.icon className="w-10 h-10 text-[#e63329] mx-auto mb-4 mt-4" />
                <h3 className="font-bold text-[#0d1f3c] text-xl mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TIMELINE TABLE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">Resolution Timelines</h2>
            <p className="text-gray-600">We work quickly to get you the packaging you need.</p>
          </div>
          <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1a2f5a] text-white">
                  <th className="p-5 font-bold">Issue Type</th>
                  <th className="p-5 font-bold border-l border-white/10">Action Taken</th>
                  <th className="p-5 font-bold border-l border-white/10">Resolution Time</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100">
                  <td className="p-5 font-bold text-[#0d1f3c]">Print Defect</td>
                  <td className="p-5 border-l border-gray-100">Expedited Reprint</td>
                  <td className="p-5 border-l border-gray-100 text-[#e63329] font-bold">5 Business Days</td>
                </tr>
                <tr className="border-b border-gray-100 bg-[#f8f9fa]">
                  <td className="p-5 font-bold text-[#0d1f3c]">Structural Failure</td>
                  <td className="p-5 border-l border-gray-100">Expedited Reprint</td>
                  <td className="p-5 border-l border-gray-100 text-[#e63329] font-bold">5 Business Days</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-5 font-bold text-[#0d1f3c]">Transit Damage</td>
                  <td className="p-5 border-l border-gray-100">Insurance Claim & Reprint</td>
                  <td className="p-5 border-l border-gray-100 text-[#e63329] font-bold">7 Business Days</td>
                </tr>
                <tr className="bg-[#f8f9fa]">
                  <td className="p-5 font-bold text-[#0d1f3c]">Refund Request</td>
                  <td className="p-5 border-l border-gray-100">Credit to Original Method</td>
                  <td className="p-5 border-l border-gray-100 text-[#e63329] font-bold">3-5 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. WHATS COVERED & 6. NOT COVERED */}
      <section className="py-20 bg-[#f8f9fa] border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Covered */}
            <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-extrabold text-[#0d1f3c] mb-6 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" /> What's Covered
              </h3>
              <ul className="space-y-4">
                {[
                  "Wrong dimensions compared to approved dieline",
                  "Major color shifts outside of 10% tolerance",
                  "Incorrect material or finish applied",
                  "Boxes damaged during transit",
                  "Text or logos cut off due to die-cutting errors"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Covered */}
            <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-extrabold text-[#0d1f3c] mb-6 flex items-center gap-3">
                <XCircle className="w-8 h-8 text-[#e63329]" /> What's Not Covered
              </h3>
              <ul className="space-y-4">
                {[
                  "Typos or spelling errors present in the approved proof",
                  "Low-resolution imagery supplied by the customer",
                  "Changes requested after production has started",
                  "Color differences from uncalibrated monitors",
                  "Issues reported later than 30 days after delivery"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-[#e63329] shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 7. PHOTO GUIDE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">How to Take Claim Photos</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">Clear photos help us process your claim faster. Please provide the following 3 angles.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: "The Issue", desc: "A close-up clearly showing the defect or damage.", icon: Camera },
              { title: "The Whole Box", desc: "A zoomed-out shot showing the entire assembled box.", icon: Search },
              { title: "The Batch", desc: "A photo showing multiple affected units together.", icon: Send }
            ].map((p, i) => (
              <div key={i} className="bg-[#f8f9fa] p-6 rounded-2xl border border-gray-100">
                <p.icon className="w-8 h-8 text-[#1a2f5a] mx-auto mb-4" />
                <h3 className="font-bold text-[#0d1f3c] mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. QUALITY CONTROL */}
      <section className="py-20 bg-[#1a2f5a] text-white">
        <div className="container mx-auto px-4 text-center">
          <Wrench className="w-12 h-12 text-[#e63329] mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold mb-4">Our USA Quality Control</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-12">We work hard to prevent issues before they happen with our 5-point inspection.</p>
          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {[
              "1. Pre-Flight File Check",
              "2. Color Calibration Check",
              "3. Die-Cut Alignment Test",
              "4. Glue & Fold Verification",
              "5. Secure Packing Protocol"
            ].map((step, i) => (
              <div key={i} className="bg-white/10 px-6 py-3 rounded-full font-bold border border-white/20">
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. USA INFO & 10. SUPPORT CHANNELS */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-[#e63329]/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-[#e63329]" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">USA-Based Support</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                All claims and returns are processed directly through our headquarters in Torrance, CA. You won't be dealing with overseas call centers—you'll speak directly with our packaging experts who can authorize reprints immediately. Serving all 50 US states with priority care.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <Phone className="w-6 h-6 text-[#1a2f5a]" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Call Us</div>
                    <div className="font-bold text-[#0d1f3c]">818-758-4076</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <Mail className="w-6 h-6 text-[#1a2f5a]" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Email Us</div>
                    <div className="font-bold text-[#0d1f3c]">help@primepackagingboxes.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CLAIMS FORM */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100" id="claim-form">
              <h3 className="text-2xl font-bold text-[#0d1f3c] mb-6">Start a Claim</h3>
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-[#0d1f3c] mb-2">Claim Submitted</h4>
                  <p className="text-gray-600 mb-2">Our team will review your details and contact you within 24 hours.</p>
                  {ticketReference && <p className="text-sm font-bold text-[#1a2f5a] mb-6">Ticket reference: {ticketReference}</p>}
                  {!ticketReference && <div className="mb-6" />}
                  <button onClick={() => setSubmitted(false)} className="text-[#e63329] font-bold">Submit another claim</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                    <div>
                      <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Order Number *</label>
                      <input required type="text" name="orderNumber" value={form.orderNumber} onChange={e => setForm(f => ({ ...f, orderNumber: e.target.value }))} placeholder="e.g. PPB-12345" className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Email Address *</label>
                      <input required type="email" name="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Issue Type *</label>
                      <select required name="issue" value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition bg-white">
                        <option value="">Select an issue</option>
                        <option>Print Defect</option>
                        <option>Structural Issue</option>
                        <option>Damage in Transit</option>
                        <option>Wrong Dimensions</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Details *</label>
                      <textarea required name="details" value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} rows={4} placeholder="Describe the issue and how many units are affected." className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition resize-none"></textarea>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-[#1a2f5a] hover:bg-[#0d1f3c] text-white font-black text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {isSubmitting ? "Submitting…" : <><Send className="w-5 h-5" /> Submit Claim</>}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Please email photos to help@primepackagingboxes.com after submitting.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c]">Returns FAQ</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Do I need to ship the defective boxes back?", a: "Usually, no. Clear photos are typically enough for us to approve a reprint. If we do need them back for QC testing, we will provide a prepaid shipping label." },
              { q: "Will I be charged for a reprint?", a: "Absolutely not. If the error is ours, the reprint and the expedited shipping are 100% free." },
              { q: "How long do I have to report an issue?", a: "Please report any defects or damages within 30 days of receiving your order." },
              { q: "What if I accidentally approved a proof with a typo?", a: "Unfortunately, we cannot offer free reprints for customer-approved errors. However, we will offer a heavily discounted rate to help you get the corrected boxes." }
            ].map((faq, i) => (
              <div key={i} className="bg-[#f8f9fa] p-6 rounded-xl border border-gray-100">
                <h3 className="font-bold text-[#1a2f5a] mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. CTA SECTION */}
      <section className="py-24 bg-[#0d1f3c]">
        <div className="container mx-auto px-4 text-center">
          <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold text-white mb-6">Need Immediate Assistance?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
            Our support team is available Monday through Friday to help you with any issues. We pride ourselves on fast, fair resolutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:818-758-4076" className="inline-flex items-center gap-3 bg-[#e63329] hover:bg-red-700 text-white font-black text-lg px-8 py-4 rounded-xl transition-all shadow-xl">
              Call 818-758-4076
            </a>
            <a href="mailto:help@primepackagingboxes.com" className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white font-black text-lg px-8 py-4 rounded-xl transition-all border border-white/20">
              Email Support
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
