import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { MapPin, Phone, Mail, MessageCircle, CheckCircle2, ChevronDown, ArrowRight, Clock, Zap, ThumbsUp, Star, Globe, Truck, Package, DollarSign, Award, Shield, Users, Coffee, Briefcase } from "lucide-react";
import { useSubmitContact } from "@workspace/api-client-react";
import { useSEO } from "../lib/useSEO";
import { useSettings } from "../lib/useSettings";

const BOX_TYPES = [
  "Custom Mailer Boxes", "Luxury Rigid Boxes", "Retail Display Boxes",
  "Folding Cartons", "Subscription Boxes", "Corrugated Shipping Boxes",
  "Custom Die-Cut Boxes", "Not Sure — Need Advice",
];
const QUANTITIES = ["100 – 499", "500 – 999", "1,000 – 4,999", "5,000 – 9,999", "10,000+"];
const TIMELINES = ["ASAP (Rush Order)", "Within 2 weeks", "Within 1 month", "Flexible"];

const FAQ_ITEMS = [
  {
    q: "What is your minimum order quantity?",
    a: "Our minimum order quantity is just 100 units — one of the lowest MOQs in the custom packaging industry. There are no hidden fees for small orders. You pay the same quality and service regardless of your order size."
  },
  {
    q: "How long does production take?",
    a: "Standard production turnaround is 7–10 business days from artwork approval. We also offer rush 3–5 day turnaround for urgent orders. Once your order ships, delivery takes 1–5 business days depending on your location."
  },
  {
    q: "Is design support really free?",
    a: "Yes, completely free. Our in-house graphic and structural design team creates your print-ready dieline and 3D mockup at no charge. Unlimited revisions are included until you're 100% satisfied with the design."
  },
  {
    q: "What file formats do you accept for artwork?",
    a: "We accept PDF, AI, EPS, PNG, JPEG, and PSD files. Vector files (PDF, AI, EPS) at 300 DPI or higher are preferred for best print quality. If you only have a logo or low-res file, our design team can recreate or vectorize it for you."
  },
  {
    q: "Do you offer samples before a full order?",
    a: "Yes. We can produce physical samples before you commit to a full production run. Sample costs are typically offset against your final order. Contact our team for sample pricing and lead times."
  },
];

const US_STATES_SAMPLE = [
  "California", "Texas", "Florida", "New York", "Pennsylvania", "Illinois",
  "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey", "Virginia",
  "Washington", "Arizona", "Massachusetts", "Tennessee", "Indiana", "Missouri",
  "Maryland", "Wisconsin", "Colorado", "Minnesota", "South Carolina", "Alabama",
  "Louisiana", "Kentucky", "Oregon", "Oklahoma", "Connecticut", "Utah",
  "Iowa", "Nevada", "Arkansas", "Mississippi", "Kansas", "New Mexico",
  "Nebraska", "West Virginia", "Idaho", "Hawaii", "New Hampshire", "Maine",
  "Montana", "Rhode Island", "Delaware", "South Dakota", "North Dakota", "Alaska",
  "Vermont", "Wyoming",
];

interface ContactFormValues {
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

export default function ContactPage() {
  useSEO({
    title: "Contact Us | Prime Packaging Boxes — Custom Packaging USA",
    description: "Contact Prime Packaging Boxes for custom packaging quotes, design support, and order inquiries. Call 818-758-4076, email, or live chat. We respond within 2 hours.",
    keywords: "contact prime packaging, custom packaging quote, packaging inquiry USA",
  });

  const { data: settings } = useSettings();
  const phone   = settings?.phone   || "818-758-4076";
  const email   = settings?.email   || "help@primepackagingboxes.com";
  const address = settings?.address || "444 Alaska Avenue Suite\nTorrance, CA 90503, USA";

  const submitContact = useSubmitContact();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormValues>();

  const onSubmit = (data: ContactFormValues) => {
    submitContact.mutate({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone || undefined,
        subject: data.boxType ? `Box Type: ${data.boxType}` : "General Inquiry",
        message: [
          data.company ? `Company: ${data.company}` : "",
          data.quantity ? `Quantity: ${data.quantity}` : "",
          data.timeline ? `Timeline: ${data.timeline}` : "",
          data.projectDetails || "",
        ].filter(Boolean).join("\n"),
      }
    }, {
      onSuccess: () => { setStatus("success"); reset(); },
      onError: () => setStatus("error"),
    });
  };

  const inputClass = (err?: object) =>
    `w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a] focus:border-[#1a2f5a] transition-all ${err ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"}`;

  return (
    <>

      {/* ── Hero ── */}
      <section className="bg-[#0d1f3c] py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c] via-[#1a2f5a] to-[#0d1f3c]" style={{opacity:0.95}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#e63329]/50 bg-[#e63329]/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#e63329] mb-6">
                <span className="w-2 h-2 rounded-full bg-[#e63329] animate-pulse" />
                We Respond Within 2 Hours
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
                Let's Build Something<br />
                <span className="text-[#e63329]">Great Together</span>
              </h1>
              <p className="text-lg text-white/65 mb-8 leading-relaxed">
                Custom packaging quote? Design support? Questions about your USA order? Our team is ready — fast, friendly, and completely free.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={`tel:${phone}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-full text-sm font-semibold transition-all">
                  <Phone className="h-4 w-4 text-[#e63329]" /> {phone}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-full text-sm font-semibold transition-all">
                  <Mail className="h-4 w-4 text-[#e63329]" /> Email 24/7
                </a>
                <a href="https://wa.me/18187584076" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 px-5 py-2.5 rounded-full text-sm font-semibold transition-all">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#e63329]/10 rounded-3xl blur-2xl" />
                <img
                  src="/api/uploads/custom-corrugated-mailer-boxes-with-logo.webp"
                  alt="Custom corrugated mailer boxes with logo — Prime Packaging USA"
                  width={800}
                  height={600}
                  decoding="async"
                  className="relative rounded-2xl shadow-2xl w-full object-cover max-h-[400px]"
                  loading="eager"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-[#e63329]" />
                  <div>
                    <div className="font-bold text-[#1a2f5a] text-sm">2 Hour Response</div>
                    <div className="text-xs text-gray-500">Mon–Fri, 9am–6pm PST</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Contact Method Cards ── */}
      <section className="container mx-auto px-4 -mt-16 mb-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { Icon: Phone, title: "Call Us Anytime", detail: phone, color: "#e63329", href: `tel:${phone}`, desc: "Speak with a packaging expert" },
            { Icon: Mail, title: "Email 24/7", detail: email, color: "#1a2f5a", href: `mailto:${email}`, desc: "Get a quote within 2 hours" },
            { Icon: MessageCircle, title: "WhatsApp Chat", detail: "Live chat support", color: "#25D366", href: "https://wa.me/18187584076", desc: "Instant messaging available" },
          ].map(item => (
            <a key={item.title} href={item.href} target={item.href.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center hover:shadow-2xl hover:-translate-y-1 transition-all group">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                <item.Icon className="w-8 h-8" style={{ color: item.color }} />
              </div>
              <h3 className="font-bold text-[#1a2f5a] text-lg mb-2">{item.title}</h3>
              <p className="font-bold mb-1" style={{ color: item.color }}>{item.detail}</p>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── Contact Form Card ── */}
      <div className="container mx-auto px-4 mb-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-[380px_1fr]">

          {/* Info Panel */}
          <div className="bg-[#1a2f5a] text-white flex flex-col">
            <div className="p-8 md:p-10 flex-1">
              <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
              <p className="text-white/55 text-sm mb-8">We're here to help. Reach us through any of these channels.</p>

              <div className="space-y-6">
                {[
                  { icon: MapPin, color: "#e63329", title: "Our Office", content: address },
                  { icon: Phone, color: "#e63329", title: "Phone", content: phone, href: `tel:${phone}` },
                  { icon: MessageCircle, color: "#25D366", title: "WhatsApp", content: "Chat with us instantly", href: "https://wa.me/18187584076" },
                  { icon: Mail, color: "#e63329", title: "Email", content: email, href: `mailto:${email}` },
                ].map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
                      <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5">{item.title}</h3>
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer"
                          className="text-white/60 hover:text-white text-sm transition-colors whitespace-pre-line">{item.content}</a>
                      ) : (
                        <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="font-bold mb-3 text-xs uppercase tracking-wider text-white/40">Business Hours (PST)</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-white/60">Monday – Friday</span><span className="text-white font-medium">8:00 AM – 6:00 PM</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Saturday</span><span className="text-white font-medium">9:00 AM – 3:00 PM</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Sunday</span><span className="text-white/30">Closed</span></div>
                </div>
              </div>

              {/* Quick guarantees */}
              <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
                {[
                  { text: "Free design support on every order" },
                  { text: "Quote within 2 hours" },
                  { text: "Free shipping all 50 states" },
                  { text: "Unlimited design revisions" },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-white/60 text-xs">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#e63329]/80 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-2 h-2"><polyline points="1.5 5 4 7.5 8.5 2.5"/></svg>
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="h-48 relative">
              <iframe
                src="https://maps.google.com/maps?q=444+Alaska+Avenue+Torrance+CA+90503&output=embed"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              />
            </div>
          </div>

          {/* Form */}
          <div className="p-8 md:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1a2f5a] mb-1">Send Us a Message</h2>
              <p className="text-gray-400 text-sm">Fill in the details below and we'll get back to you within 2 hours.</p>
            </div>

            {status === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="font-medium text-sm">Message sent! We'll be in touch within 2 hours. Thank you!</p>
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
                Error sending message. Please try again or call us directly at {phone}.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input {...register("firstName", { required: "Required" })} placeholder="John" className={inputClass(errors.firstName)} />
                  {errors.firstName && <span className="text-red-500 text-xs mt-1 block">{errors.firstName.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                  <input {...register("lastName", { required: "Required" })} placeholder="Smith" className={inputClass(errors.lastName)} />
                  {errors.lastName && <span className="text-red-500 text-xs mt-1 block">{errors.lastName.message}</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" {...register("email", { required: "Required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })} placeholder="john@company.com" className={inputClass(errors.email)} />
                  {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <input {...register("phone")} placeholder="(555) 000-0000" className={inputClass()} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
                  <input {...register("company")} placeholder="Your Company LLC" className={inputClass()} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Box Type Needed</label>
                  <select {...register("boxType")} className={inputClass()}>
                    <option value="">Select box type</option>
                    {BOX_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estimated Quantity</label>
                  <select {...register("quantity")} className={inputClass()}>
                    <option value="">Select quantity</option>
                    {QUANTITIES.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Timeline</label>
                  <select {...register("timeline")} className={inputClass()}>
                    <option value="">How soon?</option>
                    {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Details</label>
                <textarea
                  {...register("projectDetails")}
                  rows={4}
                  placeholder="Describe your packaging needs — dimensions, materials, finishes, artwork details, or any special requirements..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a] resize-y hover:border-gray-300"
                />
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" id="agree-contact" {...register("agree", { required: true })} className="mt-0.5 h-4 w-4 accent-[#e63329]" />
                <label htmlFor="agree-contact" className="text-sm text-gray-500">
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
                className="w-full inline-flex items-center justify-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white font-bold py-4 rounded-xl transition-all disabled:opacity-60 text-sm shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Sending..." : <><span>Send Message</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Why Contact Us ── */}
      <section className="py-14 bg-[#f8f9fa] border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">WHY CONTACT US</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">What You Get When You Reach Out</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { Icon: Zap, title: "2-Hour Response Time", desc: "Every quote request and inquiry answered within 2 business hours — guaranteed." },
              { Icon: DollarSign, title: "Free Quote — No Commitment", desc: "Get a detailed, transparent quote with zero obligation to purchase." },
              { Icon: Users, title: "Expert Advice", desc: "Talk to real packaging specialists who've worked with 500+ US brands." },
              { Icon: Award, title: "Free Design Support", desc: "Our in-house team will create your dieline and mockup at no extra cost." },
              { Icon: Truck, title: "Free Shipping Quote", desc: "We'll calculate your shipping cost to anywhere in the USA — always free." },
              { Icon: Shield, title: "100% Satisfaction Guarantee", desc: "If we can't meet your needs, we'll tell you upfront. Honest, transparent service." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <item.Icon className="w-10 h-10 text-[#e63329] mb-4" />
                <h3 className="font-bold text-[#1a2f5a] text-base mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Response Time Promise (Table) ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <Clock className="w-12 h-12 text-[#e63329] mx-auto mb-4" />
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">RESPONSE GUARANTEE</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">Our Response Time Promise</h2>
            <p className="text-gray-500 mt-3 text-sm">We know your time is valuable. Here's what you can expect when you contact us.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1a2f5a] text-white">
                    <th className="text-left py-4 px-6 font-bold">Inquiry Type</th>
                    <th className="text-left py-4 px-6 font-bold">Response Time</th>
                    <th className="text-left py-4 px-6 font-bold">What You Get</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { type: "Quote Request", time: "Within 2 hours", details: "Detailed pricing, material options, and timeline" },
                    { type: "General Inquiry", time: "Within 4 hours", details: "Expert guidance and product recommendations" },
                    { type: "Design Question", time: "Same business day", details: "Design review and technical feedback" },
                    { type: "Order Status", time: "Within 1 hour", details: "Real-time production and shipping updates" },
                    { type: "Technical Support", time: "Within 4 hours", details: "File review, artwork feedback, and solutions" },
                    { type: "Sample Request", time: "Within 2 hours", details: "Sample pricing, timelines, and shipping info" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-700">{row.type}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-[#e63329] font-bold text-sm">
                          <Clock className="w-4 h-4" />
                          {row.time}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500">{row.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── US Office Info ── */}
      <section className="py-14 bg-[#f8f9fa] border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <MapPin className="w-12 h-12 text-[#e63329] mb-4" />
              <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-3">OUR HEADQUARTERS</span>
              <h2 className="text-2xl font-extrabold text-[#1a2f5a] mb-4">Visit Our Torrance, CA Facility</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#e63329] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900">Prime Packaging Boxes</div>
                    <div>{address.split("\n")[0]}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#e63329] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900">Business Hours (PST)</div>
                    <div>Monday–Friday: 8:00 AM – 6:00 PM</div>
                    <div>Saturday: 9:00 AM – 3:00 PM</div>
                    <div>Sunday: Closed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#e63329] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900">Main Line</div>
                    <a href={`tel:${phone}`} className="text-[#e63329] hover:underline font-medium">{phone}</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1a2f5a] to-[#0d1f3c] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">100% USA-Based Team</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">Our entire customer service, design, and production oversight team is located right here in Torrance, California. No offshore call centers, no language barriers — just direct access to packaging experts who know the US market inside and out.</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {["US-Based Support", "Local Expertise", "Fast Response", "Direct Communication"].map(b => (
                  <div key={b} className="bg-white/10 rounded-lg py-2 px-3 font-semibold text-center">{b}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Service Coverage — All 50 States ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <Globe className="w-12 h-12 text-[#e63329] mx-auto mb-4" />
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">NATIONWIDE SERVICE</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a]">Serving All 50 US States</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-2xl mx-auto">Free shipping to every corner of the United States. From Alaska to Florida, we've shipped premium custom packaging to brands in all 50 states.</p>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm text-gray-600 text-center">
              {US_STATES_SAMPLE.map(state => (
                <div key={state} className="bg-white rounded-lg py-2 px-3 border border-gray-100 hover:border-[#e63329] hover:text-[#e63329] transition-colors font-medium">
                  {state}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { Icon: Truck, title: "Free Ground Shipping", desc: "Every order ships free via ground freight to all 50 states." },
              { Icon: Package, title: "Expedited Options Available", desc: "Rush 2-day and overnight shipping available for urgent orders." },
              { Icon: Globe, title: "Coast-to-Coast Coverage", desc: "From New York to California, Texas to Alaska — we've got you covered." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <item.Icon className="w-10 h-10 text-[#e63329] mx-auto mb-3" />
                <h3 className="font-bold text-[#1a2f5a] text-base mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-12 bg-[#1a2f5a]">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            {[
              { Icon: Star, value: "4.9/5", label: "Average Rating", desc: "From 200+ reviews" },
              { Icon: Users, value: "500+", label: "Brands Served", desc: "Across the USA" },
              { Icon: Package, value: "1M+", label: "Boxes Shipped", desc: "To all 50 states" },
              { Icon: ThumbsUp, value: "98%", label: "Satisfaction Rate", desc: "Client retention" },
            ].map(item => (
              <div key={item.label}>
                <item.Icon className="w-10 h-10 text-[#e63329] mx-auto mb-3" />
                <div className="text-3xl font-black text-white mb-1">{item.value}</div>
                <div className="font-bold text-white text-sm mb-0.5">{item.label}</div>
                <div className="text-white/50 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-[#e63329] font-bold text-xs uppercase tracking-widest block mb-2">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a]">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Everything you need to know about ordering custom packaging from Prime Packaging Boxes.</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:border-gray-200 transition-colors">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-[#1a2f5a] text-sm pr-4 leading-snug">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#e63329] shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-500 text-sm mb-4">Still have questions? We're happy to help.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`tel:${phone}`} className="inline-flex items-center justify-center gap-2 bg-[#1a2f5a] text-white hover:bg-[#0d1f3c] px-6 py-3 rounded-lg font-bold text-sm transition-all">
                <Phone className="w-4 h-4" /> Call {phone}
              </a>
              <a href="https://wa.me/18187584076" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1db954] px-6 py-3 rounded-lg font-bold text-sm transition-all">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 bg-gradient-to-r from-[#1a2f5a] to-[#0d1f3c] relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Get your free quote in 2 hours or less. No commitment, no pressure — just expert advice and transparent pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-a-quote" className="inline-flex items-center justify-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl">
              Get a Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={`tel:${phone}`} className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-bold transition-all">
              <Phone className="w-4 h-4" /> Call {phone}
            </a>
          </div>
        </div>
      </section>

    </>
  );
}
