import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Check, ShieldCheck, Clock, Zap, Star, User, Package, MessageSquare } from "lucide-react";
import { useSubmitQuote } from "@workspace/api-client-react";
import { useSEO } from "../lib/useSEO";
import { useSettings } from "../lib/useSettings";

const BOX_TYPES = [
  "Custom Mailer Boxes",
  "Luxury Rigid Boxes",
  "Retail Display Boxes",
  "Folding Cartons",
  "Subscription Boxes",
  "Corrugated Shipping Boxes",
  "Custom Die-Cut Boxes",
  "Not Sure — Need Advice",
];

const QUANTITIES = ["100 – 499", "500 – 999", "1,000 – 4,999", "5,000 – 9,999", "10,000+"];
const TIMELINES = ["ASAP (Rush Order)", "Within 2 weeks", "Within 1 month", "Flexible"];

interface QuoteFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  boxType: string;
  quantity: string;
  timeline: string;
  projectDetails: string;
  agree: boolean;
}

const STEPS = [
  { n: 1, icon: User,           label: "Your Info",     desc: "Contact details" },
  { n: 2, icon: Package,        label: "Packaging",     desc: "Box type & quantity" },
  { n: 3, icon: MessageSquare,  label: "Project Notes", desc: "Additional details" },
];

export default function QuotePage() {
  const { data: settings } = useSettings();
  const phone = settings?.phone || "818-758-4076";
  const email = settings?.email || "help@primepackagingboxes.com";
  useSEO({ title: "Get a Free Quote | Prime Packaging Boxes", description: "Request a custom packaging quote. Free design support included. Fast turnaround, competitive pricing." });

  const submitQuote = useSubmitQuote();
  const [isSuccess, setIsSuccess] = useState(false);
  const [prefilledProduct, setPrefilledProduct] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("product") || "";
    setPrefilledProduct(p);
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<QuoteFormValues>();

  const onSubmit = (data: QuoteFormValues) => {
    submitQuote.mutate({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone || undefined,
        company: data.company || undefined,
        productType: data.boxType,
        quantity: data.quantity || "100",
        additionalNotes: [
          data.timeline ? `Timeline: ${data.timeline}` : "",
          prefilledProduct ? `Product interest: ${prefilledProduct}` : "",
          data.projectDetails || "",
        ].filter(Boolean).join("\n"),
      }
    }, {
      onSuccess: () => {
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const inputClass = (err?: object) =>
    `w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]/30 focus:border-[#1a2f5a] transition-all ${err ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"}`;

  return (
    <>
      {/* Hero */}
      <div className="bg-[#1a2f5a] pt-14 pb-28 text-center text-white relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1584464491033-f628bccf4870?auto=format&fit=crop&w=1400&q=50" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{opacity:0.14}} loading="eager" decoding="async" onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
        <div className="absolute inset-0" style={{background:"linear-gradient(135deg,#1a2f5a 0%,rgba(13,31,60,0.9) 100%)"}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-block bg-[#e63329]/20 text-[#ff8a85] text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            Get Started Today
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Get a Free Custom Quote</h1>
          <p className="text-xl text-white/75 max-w-2xl mx-auto mb-6">
            Tell us about your packaging needs and our team will get back to you within 2 hours.
          </p>
          <div className="flex items-center justify-center gap-1 text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            <span className="text-white/70 text-sm ml-2">Trusted by 500+ US brands</span>
          </div>

          {/* 3-step progress indicator */}
          <div className="flex items-center justify-center gap-0 mt-10 max-w-lg mx-auto">
            {STEPS.map((s, idx) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center mb-1.5 shadow-sm">
                    <s.icon className="w-4.5 h-4.5 text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
                  </div>
                  <div className="text-white text-xs font-bold">{s.label}</div>
                  <div className="text-white/45 text-[10px]">{s.desc}</div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="h-px w-8 bg-white/20 mb-5 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="container mx-auto px-4 -mt-20 mb-20 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row max-w-6xl mx-auto">

          {/* Form */}
          <div className="flex-1 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-[#1a2f5a] mb-8">Your Packaging Details</h2>

            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <Check className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-[#1a2f5a] mb-4">Request Received!</h2>
                <p className="text-lg text-gray-500 max-w-md mx-auto mb-8">
                  Thank you for considering Prime Packaging Boxes. Our packaging specialists are reviewing your requirements and will email you a quote within 2 hours.
                </p>
                <button
                  onClick={() => { setIsSuccess(false); reset(); }}
                  className="bg-[#1a2f5a] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#e63329] transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* Section 1: Contact Info */}
                <div className="border-l-4 border-[#e63329] pl-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-[#e63329] text-white text-xs font-black flex items-center justify-center shadow-sm">1</div>
                    <h3 className="font-bold text-[#1a2f5a] text-base">Your Contact Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">First Name <span className="text-red-500">*</span></label>
                        <input {...register("firstName", { required: "Required" })} placeholder="John" className={inputClass(errors.firstName)} />
                        {errors.firstName && <span className="text-red-500 text-xs mt-1 block">{errors.firstName.message}</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Last Name <span className="text-red-500">*</span></label>
                        <input {...register("lastName", { required: "Required" })} placeholder="Smith" className={inputClass(errors.lastName)} />
                        {errors.lastName && <span className="text-red-500 text-xs mt-1 block">{errors.lastName.message}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email Address <span className="text-red-500">*</span></label>
                        <input type="email" {...register("email", { required: "Required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })} placeholder="john@company.com" className={inputClass(errors.email)} />
                        {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number</label>
                        <input {...register("phone")} placeholder="(555) 000-0000" className={inputClass()} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Company Name</label>
                      <input {...register("company")} placeholder="Your Company LLC" className={inputClass()} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Packaging Details */}
                <div className="border-l-4 border-[#1a2f5a] pl-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-[#1a2f5a] text-white text-xs font-black flex items-center justify-center shadow-sm">2</div>
                    <h3 className="font-bold text-[#1a2f5a] text-base">Packaging Requirements</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Box Type Needed <span className="text-red-500">*</span></label>
                        <select {...register("boxType", { required: "Required" })} defaultValue={prefilledProduct ? "Not Sure — Need Advice" : ""} className={inputClass(errors.boxType)}>
                          <option value="">Select box type</option>
                          {BOX_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        {errors.boxType && <span className="text-red-500 text-xs mt-1 block">{errors.boxType.message}</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Estimated Quantity <span className="text-red-500">*</span></label>
                        <select {...register("quantity", { required: "Required" })} className={inputClass(errors.quantity)}>
                          <option value="">Select quantity</option>
                          {QUANTITIES.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                        {errors.quantity && <span className="text-red-500 text-xs mt-1 block">{errors.quantity.message}</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Timeline</label>
                      <select {...register("timeline")} className={inputClass()}>
                        <option value="">How soon do you need this?</option>
                        {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Project Notes */}
                <div className="border-l-4 border-gray-300 pl-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-gray-400 text-white text-xs font-black flex items-center justify-center shadow-sm">3</div>
                    <h3 className="font-bold text-[#1a2f5a] text-base">Project Details <span className="text-gray-400 text-xs font-normal">(optional)</span></h3>
                  </div>
                  <textarea
                    {...register("projectDetails")}
                    rows={4}
                    placeholder="Describe your packaging needs — dimensions, materials, finishes, artwork details, or any special requirements..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]/30 focus:border-[#1a2f5a] resize-y hover:border-gray-300 transition-all"
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="agree-quote" {...register("agree", { required: true })} className="mt-0.5 h-4 w-4 accent-[#e63329]" />
                  <label htmlFor="agree-quote" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/privacy-policy" className="text-[#e63329] hover:underline font-medium">Privacy Policy</Link>{" "}
                    and{" "}
                    <Link href="/terms-and-conditions" className="text-[#e63329] hover:underline font-medium">Terms & Conditions</Link>
                  </label>
                </div>
                {errors.agree && <p className="text-red-500 text-xs -mt-3">You must agree to continue.</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#e63329] hover:bg-[#c42a21] text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 shadow-[0_4px_20px_rgba(230,51,41,0.35)] hover:shadow-[0_4px_28px_rgba(230,51,41,0.45)] text-base"
                >
                  {isSubmitting ? "Sending Request…" : "Get My Free Quote →"}
                </button>
              </form>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="bg-[#f8fafc] w-full lg:w-[380px] p-8 md:p-10 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#1a2f5a] mb-6">Why Prime Packaging?</h3>
              <div className="space-y-6">
                {[
                  { icon: ShieldCheck, color: "text-[#1a2f5a]", bg: "bg-[#1a2f5a]/10", title: "Premium Quality",      desc: "Rigorous quality checks ensure your boxes look exactly as promised, every single time." },
                  { icon: Zap,         color: "text-[#e63329]",  bg: "bg-[#e63329]/10", title: "Free Design Support", desc: "Our in-house designers help perfect your packaging vision at zero extra cost." },
                  { icon: Clock,       color: "text-[#1a2f5a]",  bg: "bg-[#1a2f5a]/10", title: "Fast Turnaround",     desc: "Standard 7–10 day production and 3–5 day rush options for urgent orders." },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`shrink-0 w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center`}>
                      <f.icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1a2f5a] text-sm mb-0.5">{f.title}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 text-center">
                {[["500+", "US Brands"], ["1M+", "Boxes Shipped"], ["4.9/5", "Avg Rating"], ["2 hr", "Response Time"]].map(([val, lbl]) => (
                  <div key={lbl} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-black text-[#e63329]">{val}</div>
                    <div className="text-xs text-gray-500 mt-1">{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="mt-6 bg-[#1a2f5a]/5 rounded-xl p-4 border border-[#1a2f5a]/10">
                <div className="text-xs font-bold text-[#1a2f5a] uppercase tracking-wide mb-3">Our Certifications</div>
                <div className="flex flex-wrap gap-1.5">
                  {["FDA Compliant", "FSC Certified", "SFI Certified", "ISO Standards", "Eco-Friendly Ink"].map(c => (
                    <span key={c} className="bg-white border border-gray-200 text-gray-600 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">✓ {c}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm mb-3 font-medium">Prefer to talk? Speak with a specialist:</p>
              <a href={`tel:${phone}`} className="text-2xl font-extrabold text-[#1a2f5a] hover:text-[#e63329] transition-colors block">
                {phone}
              </a>
              <a href={`mailto:${email}`} className="text-sm text-gray-400 hover:text-[#e63329] transition-colors mt-1 block">
                {email}
              </a>
              <div className="mt-3 text-xs text-gray-400 bg-gray-100 rounded-lg px-3 py-2">
                Mon–Fri · 8 AM – 6 PM PST · Response within 2 hours
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHAT HAPPENS NEXT ── */}
      <section className="py-10 md:py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#1a2f5a]/8 text-[#1a2f5a] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Our Process</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">What Happens After You Submit</h2>
          </div>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "📋", title: "We Review", desc: "Our specialist reviews your requirements within 2 hours and prepares a tailored quote." },
              { step: "02", icon: "💬", title: "We Call You", desc: "A dedicated account manager contacts you to confirm specs and answer any questions." },
              { step: "03", icon: "🎨", title: "Design Proof", desc: "Our designers create a free digital proof of your packaging for your approval." },
              { step: "04", icon: "🚀", title: "We Produce", desc: "Upon approval and deposit, production starts. 7–10 days to your door." },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < 3 && <div className="hidden sm:block absolute top-6 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#1a2f5a]/30 to-transparent" />}
                <div className="w-12 h-12 bg-[#1a2f5a] text-white rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 relative z-10">{s.step}</div>
                <span className="text-3xl block mb-2">{s.icon}</span>
                <h3 className="font-extrabold text-[#1a2f5a] text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING GUIDE ── */}
      <section className="py-10 md:py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#e63329]/10 text-[#e63329] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Pricing Guide</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">What Affects Your Price?</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">Understanding these factors helps you get the best value for your packaging order.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: "📐", factor: "Box Size & Style", impact: "Larger boxes and complex die-cuts cost more. Simple mailers are most economical.", badge: "Major Factor" },
              { icon: "🔢", factor: "Order Quantity", impact: "The more you order, the lower the per-unit cost. 500+ units offers best pricing.", badge: "Major Factor" },
              { icon: "🎨", factor: "Print Colors", impact: "Full CMYK print vs single color. Spot colors and white ink add to cost.", badge: "Medium Factor" },
              { icon: "✨", factor: "Finish Type", impact: "Matte/gloss lamination, foil stamping, embossing all add premium appeal.", badge: "Medium Factor" },
              { icon: "📄", factor: "Material Weight", impact: "Heavier cardstock means more durability. 14pt–24pt options available.", badge: "Minor Factor" },
              { icon: "⚡", factor: "Turnaround Time", impact: "Rush 3–5 day production costs ~20% more than standard 7–10 day.", badge: "Minor Factor" },
            ].map(p => (
              <div key={p.factor} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-[10px] font-bold bg-[#1a2f5a]/8 text-[#1a2f5a] px-2 py-0.5 rounded-full">{p.badge}</span>
                </div>
                <h3 className="font-extrabold text-[#1a2f5a] text-sm mb-2">{p.factor}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{p.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE FAQ ── */}
      <section className="py-10 md:py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-[#1a2f5a]">Quote FAQs</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How quickly will I receive my quote?", a: "We aim to respond to all quote requests within 2 business hours during Mon–Fri 8AM–6PM PST. Complex orders may take up to 4 hours." },
              { q: "Is the quote binding?", a: "Our quotes are valid for 30 days. Prices are locked once you confirm and pay the 50% deposit." },
              { q: "Can I get a sample before ordering?", a: "Absolutely! Request a free sample pack to check quality, material weight, and print quality before committing to a full order." },
              { q: "What's the minimum order quantity?", a: "Our standard MOQ is 100 units for most box styles. Some specialty products may require 250+ units." },
              { q: "Do you offer rush production?", a: "Yes! Rush 3–5 business day production is available at an additional 15–20% surcharge depending on box type." },
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="font-bold text-[#1a2f5a] text-sm mb-2">Q: {faq.q}</div>
                <div className="text-sm text-gray-600 leading-relaxed">A: {faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
