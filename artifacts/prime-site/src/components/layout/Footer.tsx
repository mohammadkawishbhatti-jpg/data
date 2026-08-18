import { useState, memo } from "react";
import { Link } from "wouter";
import { useSettings } from "../../context/SettingsContext";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, ArrowRight, Send, CheckCircle } from "lucide-react";
import { responsiveImageProps } from "../../lib/responsiveImage";

const PRODUCTS_COL = [
  { label: "Custom Mailer Boxes",    slug: "mailer-boxes" },
  { label: "Rigid & Luxury Boxes",   slug: "rigid-boxes" },
  { label: "Display Boxes",          slug: "display-boxes" },
  { label: "Soap Boxes",             slug: "soap-boxes" },
  { label: "Candle Boxes",           slug: "candle-boxes" },
  { label: "CBD Boxes",              slug: "cbd-boxes" },
  { label: "Food & Bakery Boxes",    slug: "food-boxes" },
  { label: "Custom Kraft Boxes",     slug: "custom-kraft-boxes" },
  { label: "Jewelry Boxes",          slug: "jewelry-boxes" },
  { label: "Corrugated Shipping",    slug: "shipping-boxes" },
  { label: "Cosmetic Boxes",         slug: "cosmetic-boxes" },
  { label: "Custom Mylar Bags",      slug: "custom-mylar-bags" },
];

const COMPANY_COL = [
  { label: "About Us",          href: "/about" },
  { label: "Blog",              href: "/blog" },
  { label: "Contact Us",        href: "/contact" },
  { label: "Get a Quote",       href: "/get-a-quote" },
  { label: "Product Catalogue", href: "/prime-packaging-product-catalogue.pdf", external: true },
  { label: "Request a Sample",  href: "/request-sample" },
  { label: "Returns & Claims",  href: "/returns-claims-support" },
  { label: "Delivery Policy",   href: "/delivery-policy" },
  { label: "Refund Policy",     href: "/refund-return-policy" },
  { label: "Privacy Policy",    href: "/privacy-policy" },
  { label: "Terms & Conditions",href: "/terms-and-conditions" },
  { label: "Disclaimer",        href: "/disclaimer" },
  { label: "Sitemap",           href: "/sitemap" },
];

const GUARANTEES = [
  "Free Design Support",
  "100 Unit Minimum Order",
  "7–10 Day Turnaround",
  "Free US & UK Shipping",
  "100% Satisfaction Guarantee",
  "FSC Certified Materials",
];

const PRODUCT_SHOWCASE = [
  { img: "/api/uploads/custom-cake-boxes.webp",                   alt: "Cake Boxes" },
  { img: "/api/uploads/luxury-chocolate-boxes.webp",              alt: "Chocolate Boxes" },
  { img: "/api/uploads/corrugated-mailer-boxes.webp",             alt: "Mailer Boxes" },
  { img: "/api/uploads/custom-kraft-boxes-with-logo.webp",        alt: "Kraft Boxes" },
  { img: "/api/uploads/printed-magnetic-closure-boxes-bulk.webp", alt: "Magnetic Boxes" },
  { img: "/api/uploads/custom-cream-jars-wholesale.webp",         alt: "Cosmetic Boxes" },
];

function _Footer() {
  const { phone, email: contactEmail, address } = useSettings();
  const telLink = `tel:${phone.replace(/\D/g, "")}`;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer>

      {/* ── PRODUCT IMAGE STRIP ── */}
      <div className="bg-[#0d1f3c] border-b border-white/8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest shrink-0 hidden md:block">Popular</span>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide flex-1">
              {PRODUCT_SHOWCASE.map((p) => (
                <div key={p.alt} className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <img {...responsiveImageProps(p.img)} alt={p.alt} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    width={64} height={64} loading="lazy" decoding="async"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
                </div>
              ))}
            </div>
            <Link href="/shop" className="shrink-0 hidden md:flex items-center gap-1.5 text-xs font-bold text-[#e63329] hover:text-red-400 transition-colors">
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── GUARANTEE BAR ── */}
      <div className="bg-[#1a2f5a] border-b border-white/8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {GUARANTEES.map(g => (
              <span key={g} className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
                <CheckCircle className="w-3 h-3 text-green-400 shrink-0" />
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <div className="bg-[#e63329]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-extrabold text-lg mb-1">Get Packaging Tips &amp; Exclusive Deals</h3>
              <p className="text-white/75 text-sm">Join 2,000+ brand owners. No spam — only valuable packaging insights.</p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-6 py-3 text-white font-bold text-sm shrink-0">
                <CheckCircle className="w-4 h-4" /> You're subscribed — thank you!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 shrink-0 w-full md:w-auto">
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address" required
                  className="bg-white/15 border border-white/30 text-white placeholder-white/55 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white w-full md:w-72 transition-colors"
                />
                <button type="submit"
                  className="bg-white text-[#e63329] hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shrink-0 transition-colors shadow-md">
                  <Send className="w-3.5 h-3.5" /> Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER BODY ── */}
      <div className="bg-[#0d1f3c] text-white">
        <div className="container mx-auto px-4 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand column */}
            <div className="space-y-5">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-xl bg-[#e63329] flex items-center justify-center font-black text-xl text-white shadow-[0_4px_14px_rgba(230,51,41,0.35)] group-hover:shadow-[0_4px_20px_rgba(230,51,41,0.5)] transition-shadow shrink-0">P</div>
                <div>
                  <div className="text-white font-extrabold text-[13px] tracking-[0.04em] leading-tight">PRIME PACKAGING BOXES</div>
                  <div className="text-white/35 text-[9px] tracking-[0.22em] uppercase mt-0.5">Next Level Packaging</div>
                </div>
              </Link>

              <p className="text-white/55 text-sm leading-relaxed">
                Premium custom packaging designed to elevate your brand. Free design support, low 100-unit minimums, and 7–10 day turnaround — proudly serving 500+ US brands from Torrance, CA.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2">
                {[
                  { href: "https://www.facebook.com/PrimePackagingBoxes", Icon: Facebook, label: "Facebook" },
                  { href: "https://www.instagram.com/primepackagingboxes", Icon: Instagram, label: "Instagram" },
                  { href: "https://twitter.com/PrimePackaging", Icon: Twitter, label: "Twitter" },
                  { href: "https://www.linkedin.com/company/prime-packaging-boxes", Icon: Linkedin, label: "LinkedIn" },
                ].map(({ href, Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/8 hover:bg-[#e63329] flex items-center justify-center transition-all hover:scale-110 hover:shadow-md">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-1.5">
                {["FDA", "FSC", "SFI", "ISO", "Eco-Ink"].map(b => (
                  <span key={b} className="bg-white/8 border border-white/10 text-white/55 text-[10px] font-semibold px-2.5 py-1 rounded-md">{b}</span>
                ))}
              </div>
            </div>

            {/* Products column */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-[0.12em] mb-5 pb-2 border-b border-white/10">Products</h4>
              <ul className="space-y-2">
                {PRODUCTS_COL.map(item => (
                  <li key={item.slug}>
                    <Link href={`/${item.slug}`}
                      className="text-white/55 hover:text-white text-sm transition-colors flex items-center gap-1.5 group py-px">
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-[#e63329] transition-all shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/products"
                    className="inline-flex items-center gap-1.5 text-[#e63329] hover:text-red-400 text-sm font-bold mt-2 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" /> View All Products
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-[0.12em] mb-5 pb-2 border-b border-white/10">Company</h4>
              <ul className="space-y-2">
                {COMPANY_COL.map(item => (
                  <li key={item.href}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-white/55 hover:text-white text-sm transition-colors flex items-center gap-1.5 group py-px">
                        <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-[#e63329] transition-all shrink-0" />
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href}
                        className="text-white/55 hover:text-white text-sm transition-colors flex items-center gap-1.5 group py-px">
                        <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-[#e63329] transition-all shrink-0" />
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + CTA column */}
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-[0.12em] mb-5 pb-2 border-b border-white/10">Get in Touch</h4>

              <ul className="space-y-4 mb-6">
                <li>
                  <a href={telLink}
                    className="flex items-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-[#e63329]/15 border border-[#e63329]/20 flex items-center justify-center shrink-0 group-hover:bg-[#e63329] transition-all">
                      <Phone className="w-3.5 h-3.5 text-[#e63329] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wide font-semibold">Call Us</div>
                      <div className="text-white/80 text-sm font-bold hover:text-white transition-colors">{phone}</div>
                    </div>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contactEmail}`}
                    className="flex items-start gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-[#e63329]/15 border border-[#e63329]/20 flex items-center justify-center shrink-0 group-hover:bg-[#e63329] transition-all">
                      <Mail className="w-3.5 h-3.5 text-[#e63329] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wide font-semibold">Email Us</div>
                      <div className="text-white/80 text-sm break-all group-hover:text-white transition-colors">{contactEmail}</div>
                    </div>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#e63329]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wide font-semibold">Our Office</div>
                    <div className="text-white/65 text-sm leading-snug mt-0.5">{address || "444 Alaska Avenue Suite, Torrance, CA 90503, USA"}</div>
                  </div>
                </li>
              </ul>

              {/* Hours */}
              <div className="bg-white/6 rounded-xl p-3.5 mb-4 border border-white/8">
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-semibold mb-1">Business Hours</div>
                <div className="text-white/70 text-xs">Mon – Fri: 8:00 AM – 6:00 PM PST</div>
                <div className="text-white/40 text-xs mt-0.5">Response within 2 hours</div>
              </div>

              <Link href="/get-a-quote"
                className="w-full flex items-center justify-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(230,51,41,0.3)] hover:shadow-[0_4px_20px_rgba(230,51,41,0.4)]">
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="border-t border-white/8">
          <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/35">
            <div className="flex items-center gap-1.5">
              <span>© {new Date().getFullYear()} Prime Packaging Boxes Inc. All rights reserved. Torrance, California.</span>
            </div>
            <div className="flex items-center gap-5 flex-wrap justify-center">
              {[
                { label: "Privacy Policy",    href: "/privacy-policy" },
                { label: "Terms",             href: "/terms-and-conditions" },
                { label: "Refund Policy",     href: "/refund-return-policy" },
                { label: "Delivery Policy",   href: "/delivery-policy" },
                { label: "Sitemap",           href: "/sitemap" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// memo: Footer has no external props — never re-renders on parent state changes
export const Footer = memo(_Footer);
