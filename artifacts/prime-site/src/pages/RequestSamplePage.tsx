import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "../lib/useSEO";
import { useSubmitContact } from "@workspace/api-client-react";
import {
  Package, Box, Truck, MapPin, CheckCircle, Clock, Search,
  Award, ShieldCheck, ArrowRight, Zap, Droplet, Star, User,
  FileCheck, Scissors, PenTool, Layers, Check, Loader2
} from "lucide-react";

export default function RequestSamplePage() {
  useSEO({ title: "Request a Free Sample Kit | Prime Packaging Boxes", description: "Get a free sample kit delivered to any of the 50 US states. Feel the premium materials and finishes before you order." });

  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", address: "", boxType: "Mailer Boxes" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const submitContact = useSubmitContact();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    submitContact.mutate({
      data: {
        name: `${form.name}${form.company ? ` (${form.company})` : ""}`,
        email: form.email,
        phone: form.phone || undefined,
        subject: `Free Sample Kit Request — ${form.boxType}`,
        message: `Sample Kit Request\n\nBox Type Interest: ${form.boxType}\nShipping Address: ${form.address}\nCompany: ${form.company}`,
      }
    }, {
      onSuccess: () => setSubmitted(true),
      onError: () => setError("Something went wrong. Please try again or email us directly."),
    });
  };

  return (
    <>
      {/* 1. HERO SECTION */}
      <section className="bg-[#0d1f3c] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.95}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#e63329] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <Box className="w-4 h-4" /> 100% Free Sample Kit — All 50 US States
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Feel The Quality <span className="text-[#e63329]">Before You Commit.</span>
              </h1>
              <p className="text-white/80 text-lg mb-8">
                Request our premium sample kit — materials, print quality, and finishes firsthand. Shipped free to any of the 50 US states. Zero obligation.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Free Shipping","Zero Obligation","3-5 Day Delivery","Real Box Samples"].map((t, i) => (
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
                  src="/api/uploads/custom-cardboard-gift-boxes-with-logo.webp"
                  alt="Custom branded cardboard gift boxes with logo — Prime Packaging sample kit"
                  className="relative rounded-2xl shadow-2xl w-full object-cover max-h-[400px]"
                  loading="eager"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                  <Package className="w-8 h-8 text-[#e63329]" />
                  <div>
                    <div className="font-bold text-[#1a2f5a] text-sm">Free Sample Kit</div>
                    <div className="text-xs text-gray-500">Ships to all 50 States</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHATS INCLUDED */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">What's Inside Your Kit?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need to make the right packaging decision for your USA brand.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Box Samples", desc: "Fully assembled mailer, folding, and rigid boxes.", icon: Box },
              { title: "Material Swatches", desc: "Cardstock, kraft, and corrugated board options.", icon: Layers },
              { title: "Finish Samples", desc: "Feel matte, gloss, soft-touch, and foil finishes.", icon: Droplet },
              { title: "Design Guide", desc: "A printed guide to help you prepare your artwork.", icon: PenTool }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition text-center group">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#e63329] transition-colors">
                  <item.icon className="w-8 h-8 text-[#e63329] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#0d1f3c] mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY SAMPLE FIRST */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">Why Order a Sample?</h2>
            <p className="text-gray-600">Smart brands test before they invest.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Feel the Thickness", desc: "Compare 14pt vs 18pt vs 24pt cardstock in your hands.", icon: Layers },
              { title: "Check the Fit", desc: "Make sure your actual product fits perfectly inside.", icon: Scissors },
              { title: "Approve Print Quality", desc: "See our CMYK color vibrancy and crisp text resolution.", icon: Zap },
              { title: "Test Durability", desc: "Crush-test our corrugated materials for shipping safety.", icon: ShieldCheck },
              { title: "Compare Finishes", desc: "Decide between Matte or Gloss lamination.", icon: Droplet },
              { title: "Zero Risk", desc: "It's 100% free with no commitment required.", icon: Award }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start p-4">
                <div className="bg-[#f8f9fa] p-4 rounded-xl shrink-0 border border-gray-100">
                  <feature.icon className="w-6 h-6 text-[#1a2f5a]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0d1f3c] mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SAMPLE TYPES TABLE */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">Available Samples</h2>
            <p className="text-gray-600">We send a variety of boxes tailored to your industry.</p>
          </div>
          <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1a2f5a] text-white">
                  <th className="p-5 font-bold">Box Type</th>
                  <th className="p-5 font-bold border-l border-white/10">Material Base</th>
                  <th className="p-5 font-bold border-l border-white/10">Standard Finish</th>
                  <th className="p-5 font-bold border-l border-white/10">Ideal For</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#0d1f3c]">Mailer Box</td>
                  <td className="p-5 border-l border-gray-100">E-Flute Corrugated</td>
                  <td className="p-5 border-l border-gray-100">Matte Laminate</td>
                  <td className="p-5 border-l border-gray-100">E-commerce, Subscriptions</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#0d1f3c]">Folding Carton</td>
                  <td className="p-5 border-l border-gray-100">18pt Cardboard</td>
                  <td className="p-5 border-l border-gray-100">Gloss or Soft-Touch</td>
                  <td className="p-5 border-l border-gray-100">Retail, Cosmetics, Pharma</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#0d1f3c]">Rigid Gift Box</td>
                  <td className="p-5 border-l border-gray-100">2mm Chipboard</td>
                  <td className="p-5 border-l border-gray-100">Textured Paper, Foil</td>
                  <td className="p-5 border-l border-gray-100">Luxury Items, Jewelry</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-5 font-bold text-[#0d1f3c]">Kraft Box</td>
                  <td className="p-5 border-l border-gray-100">Recycled Kraft</td>
                  <td className="p-5 border-l border-gray-100">Uncoated</td>
                  <td className="p-5 border-l border-gray-100">Organic Brands, Apparel</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. KIT CONTENTS VISUAL */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-[#1a2f5a] rounded-3xl p-10 md:p-16 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
              <Box className="w-96 h-96" />
            </div>
            <h2 className="text-3xl font-extrabold mb-8 relative z-10">Your Sample Kit Includes:</h2>
            <ul className="space-y-4 relative z-10 text-lg">
              {[
                "Fully printed Mailer Box sample",
                "Fully printed Folding Carton sample",
                "Color chart showing CMYK fidelity",
                "Material swatch book (14pt, 18pt, 24pt, Kraft)",
                "Finishing card (Spot UV, Foil, Emboss)",
                "Exclusive discount code for your first bulk order"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#e63329] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-20 bg-[#f8f9fa] border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">How It Works</h2>
            <p className="text-gray-600">A seamless process from request to unboxing.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Submit Form", icon: FileCheck },
              { step: 2, title: "We Pack It", icon: Box },
              { step: 3, title: "Ships Free", icon: Truck },
              { step: 4, title: "You Decide", icon: Check }
            ].map((s, i) => (
              <div key={i} className="flex-1 bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm relative">
                {i !== 3 && <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-px bg-gray-300 z-0" />}
                <div className="w-14 h-14 bg-[#1a2f5a] text-white rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 text-xl font-bold">
                  {s.step}
                </div>
                <s.icon className="w-8 h-8 text-[#e63329] mx-auto mb-3" />
                <h3 className="font-bold text-[#0d1f3c]">{s.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TIMELINE SECTION */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Clock className="w-12 h-12 text-[#e63329] mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-8">Delivery Timelines</h2>
          <div className="flex flex-col md:flex-row justify-center gap-6 max-w-3xl mx-auto">
            <div className="flex-1 bg-[#f8f9fa] p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-[#1a2f5a] mb-2">Sample Kits</h3>
              <p className="text-3xl font-black text-[#e63329] mb-2">3-5 Days</p>
              <p className="text-gray-500 text-sm">Arrives quickly via USPS/UPS.</p>
            </div>
            <div className="flex-1 bg-[#f8f9fa] p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-[#1a2f5a] mb-2">Full Bulk Orders</h3>
              <p className="text-3xl font-black text-[#e63329] mb-2">7-10 Days</p>
              <p className="text-gray-500 text-sm">Standard production turnaround.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. USA DELIVERY INFO */}
      <section className="py-16 bg-[#1a2f5a]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/3 flex justify-center">
            <MapPin className="w-40 h-40 text-white/10" />
          </div>
          <div className="w-full md:w-2/3 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white mb-4">Fast USA Delivery</h2>
            <p className="text-white/80 text-lg">
              We ship our sample kits directly from our Torrance, CA facility. Whether you're in New York, Texas, or right here in California, you'll receive your kit in days, not weeks. Proudly serving brands across all 50 US states.
            </p>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c] mb-4">What USA Brands Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Getting the sample kit made all the difference. We could feel the rigidity of the 24pt board and knew it was right for our skincare line.", author: "Sarah Jenkins", brand: "Glow Beauty, TX" },
              { quote: "The print quality on the sample mailers was stunning. It gave us the confidence to place a 10,000 unit order immediately.", author: "Mike Rodriguez", brand: "TechFix, NY" },
              { quote: "I loved seeing the foil finishes in person. Prime Packaging shipped the kit to my office in Chicago in just 3 days.", author: "Emily Chen", brand: "Luxe Candles, IL" }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 mb-4" />
                <p className="text-gray-600 italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a2f5a] rounded-full flex items-center justify-center text-white font-bold"><User className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-[#0d1f3c]">{t.author}</h4>
                    <p className="text-xs text-gray-500">{t.brand}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ (SAMPLES ONLY) */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0d1f3c]">Sample Kit FAQ</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Is the sample kit really free?", a: "Yes, the kit is 100% free, including shipping to any US address." },
              { q: "Can I get a custom sample printed with my design?", a: "This free kit includes pre-printed examples of our work. If you need a custom printed sample of your specific design, we offer those for a small fee which is credited back if you place a bulk order." },
              { q: "How long does shipping take?", a: "Kits are dispatched within 24 hours from California and typically arrive in 3-5 business days." },
              { q: "Do you ship samples internationally?", a: "Currently, our free sample kits are only available to businesses within the 50 US states." }
            ].map((faq, i) => (
              <div key={i} className="bg-[#f8f9fa] p-6 rounded-xl border border-gray-100">
                <h3 className="font-bold text-[#1a2f5a] mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. REQUEST FORM */}
      <section className="py-24 bg-[#f8f9fa] border-t border-gray-200" id="request-form">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-[#1a2f5a] p-8 text-center">
              <h2 className="text-3xl font-extrabold text-white mb-2">Request Your Free Kit</h2>
              <p className="text-white/80">Fill out the details below. We'll ship it within 24 hours.</p>
            </div>
            
            {submitted ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#0d1f3c] mb-4">Request Received!</h3>
                <p className="text-gray-600 mb-8">Your sample kit is being prepared and will ship out shortly to your provided US address.</p>
                <button onClick={() => setSubmitted(false)} className="text-[#e63329] font-bold hover:underline">Submit another request</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Full Name *</label>
                    <input required type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Company / Brand *</label>
                    <input required type="text" name="company" value={form.company} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Email Address *</label>
                    <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Primary Interest</label>
                  <select name="boxType" value={form.boxType} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition bg-white">
                    <option>Mailer Boxes</option>
                    <option>Folding Cartons</option>
                    <option>Rigid Gift Boxes</option>
                    <option>Not Sure Yet</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-[#0d1f3c] mb-2">Full Shipping Address (US Only) *</label>
                  <textarea required rows={3} name="address" value={form.address} onChange={handleChange} placeholder="Street, City, State, ZIP" className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#e63329] focus:ring-1 focus:ring-[#e63329] outline-none transition resize-none"></textarea>
                </div>

                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <button type="submit" disabled={submitContact.isPending} className="w-full bg-[#e63329] hover:bg-red-700 disabled:opacity-60 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  {submitContact.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-6 h-6" />}
                  {submitContact.isPending ? "Submitting..." : "Get My Free Sample Kit"}
                </button>
                <p className="text-center text-xs text-gray-500 mt-4"><ShieldCheck className="w-3 h-3 inline mr-1" /> Your information is secure.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 12. CTA SECTION */}
      <section className="py-24 bg-[#0d1f3c]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6">Ready to skip the sample and order?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
            If you already know what you want, jump straight to getting a custom quote for your packaging.
          </p>
          <Link href="/get-a-quote" className="inline-flex items-center gap-3 bg-white text-[#0d1f3c] hover:bg-gray-100 font-black text-lg px-10 py-5 rounded-xl transition-all shadow-xl">
            Get a Free Quote <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </>
  );
}
