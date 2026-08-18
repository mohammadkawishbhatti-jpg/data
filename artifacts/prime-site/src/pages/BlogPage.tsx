import { Link } from "wouter";
import { useSEO } from "../lib/useSEO";
import { ArrowRight, Clock, Tag } from "lucide-react";

const STATIC_POSTS = [
  {
    title: "Why Custom Mailer Boxes Are the #1 Marketing Tool for E-Commerce Brands",
    href: "/blog/why-custom-mailer-boxes-are-top-marketing-tool",
    tag: "Mailer Boxes",
    date: "Dec 12, 2024",
    readTime: "5 min read",
    excerpt: "Discover how a custom mailer box turns every delivery into a marketing moment — and why 500+ brands are investing in branded packaging.",
    featured: true,
    img: "/api/uploads/corrugated-mailer-boxes.webp",
  },
  {
    title: "10 Packaging Finishes That Make Your Box Look Premium",
    href: "/blog/packaging-finishes-premium-look",
    tag: "Design Tips",
    date: "Nov 28, 2024",
    readTime: "4 min read",
    excerpt: "From soft-touch coating to foil stamping — learn which finishes elevate your brand and when to use each one.",
    img: "/api/uploads/luxury-chocolate-boxes.webp",
  },
  {
    title: "Eco-Friendly Packaging: How We Help Brands Go Green Without Breaking the Budget",
    href: "/blog/eco-friendly-packaging-sustainable-options",
    tag: "Sustainability",
    date: "Nov 14, 2024",
    readTime: "6 min read",
    excerpt: "FSC-certified stocks, soy-based inks, and recyclable kraft boards — here's our full eco-friendly lineup and how to use it.",
    img: "/api/uploads/custom-kraft-boxes-wholesale.webp",
  },
  {
    title: "How to Choose the Right Box Material for Your Product",
    href: "/blog/how-to-choose-box-material",
    tag: "Materials",
    date: "Oct 30, 2024",
    readTime: "5 min read",
    excerpt: "SBS, kraft, corrugated, rigid chipboard — each material has its sweet spot. This guide helps you pick the right one for your product type.",
    img: "/api/uploads/custom-kraft-boxes-with-logo.webp",
  },
  {
    title: "Low MOQ Packaging: How to Order Just 100 Boxes Without Sacrificing Quality",
    href: "/blog/low-moq-custom-boxes",
    tag: "Small Brands",
    date: "Oct 15, 2024",
    readTime: "4 min read",
    excerpt: "Think you need thousands of boxes to get premium packaging? Think again. Here's how our low-MOQ model works and what you get at 100 units.",
    img: "/api/uploads/custom-cake-boxes.webp",
  },
  {
    title: "The Ultimate Guide to Unboxing Experience Design",
    href: "/blog/unboxing-experience-design-guide",
    tag: "Strategy",
    date: "Sep 22, 2024",
    readTime: "7 min read",
    excerpt: "A great unboxing experience builds loyalty, drives social shares, and turns first-time buyers into repeat customers. Here's how to design one.",
    img: "/api/uploads/printed-magnetic-closure-boxes-bulk.webp",
  },
];

const TAG_COLORS: Record<string, string> = {
  "Mailer Boxes":  "bg-blue-50 text-blue-700 border-blue-100",
  "Design Tips":   "bg-purple-50 text-purple-700 border-purple-100",
  "Sustainability":"bg-green-50 text-green-700 border-green-100",
  "Materials":     "bg-amber-50 text-amber-700 border-amber-100",
  "Small Brands":  "bg-pink-50 text-pink-700 border-pink-100",
  "Strategy":      "bg-indigo-50 text-indigo-700 border-indigo-100",
};

function tagClass(tag: string) {
  return TAG_COLORS[tag] || "bg-[#e63329]/10 text-[#e63329] border-[#e63329]/20";
}

import { TemplateRenderer, usePageTemplate } from "../components/ui/TemplateRenderer";

export default function BlogPage() {
  const { content: templateContent } = usePageTemplate("blog");

  useSEO({
    title: "Packaging Blog & Resources | Prime Packaging Boxes",
    description: "Insights, tips, and news about custom packaging, branding, and unboxing experiences.",
    canonical: "/blog",
  });

  const [featured, ...rest] = STATIC_POSTS;

  if (templateContent) {
    return <TemplateRenderer content={templateContent} />;
  }
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-[#0d1f3c] pt-16 pb-24 text-white relative overflow-hidden">
        <img src="/api/uploads/custom-kraft-boxes-with-logo.webp" alt="" aria-hidden="true" width={1600} height={900} className="absolute inset-0 w-full h-full object-cover" style={{opacity:0.18}} loading="eager" fetchPriority="high" decoding="async" onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
        <div className="absolute inset-0" style={{background:"linear-gradient(135deg,#0d1f3c 0%,rgba(13,31,60,0.85) 100%)"}} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block bg-[#e63329]/15 border border-[#e63329]/30 text-[#ff6b63] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            From the Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Packaging Insights &amp; Tips
          </h1>
          <p className="text-white/65 max-w-xl mx-auto text-base leading-relaxed">
            Expert advice on custom packaging design, materials, sustainability, and brand strategy from our team at Prime Packaging Boxes.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none"><path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40Z" fill="white" /></svg>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Featured post */}
          <div className="mb-14">
            <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-4">Featured Article</span>
            <Link href={featured.href} className="group grid grid-cols-1 lg:grid-cols-5 gap-0 bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl overflow-hidden transition-all">
              <div className="lg:col-span-3 relative overflow-hidden bg-gray-100 min-h-[240px]">
                <img
                  src={featured.img}
                  alt={featured.title}
                  width={900}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                  loading="lazy"
                  decoding="async"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a2f5a]/10" />
              </div>
              <div className="lg:col-span-2 p-8 flex flex-col justify-center">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border w-fit mb-4 ${tagClass(featured.tag)}`}>
                  <Tag className="w-3 h-3" /> {featured.tag}
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#1a2f5a] leading-tight mb-3 group-hover:text-[#e63329] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{featured.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readTime}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#e63329] font-bold text-xs group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Grid of remaining posts */}
          <div>
            <span className="text-[#e63329] text-xs font-bold uppercase tracking-widest block mb-6">More Articles</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rest.map(post => (
                <Link key={post.href} href={post.href} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl overflow-hidden transition-all hover:-translate-y-1">
                  <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
                    <img
                      src={post.img}
                      alt={post.title}
                      width={800}
                      height={450}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit mb-3 ${tagClass(post.tag)}`}>
                      {post.tag}
                    </span>
                    <h3 className="font-bold text-[#1a2f5a] text-sm leading-snug mb-2 group-hover:text-[#e63329] transition-colors flex-1">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {post.readTime}</span>
                      </div>
                      <span className="text-[#e63329] text-xs font-bold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-r from-[#1a2f5a] to-[#0d1f3c] rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold text-white mb-2">Ready to Upgrade Your Packaging?</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">Get a free custom quote in 2 hours — free design included.</p>
              <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-8 py-3.5 rounded-lg font-bold text-sm transition-all shadow-lg">
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-10 md:py-16 bg-[#f8f9ff] border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <span className="inline-block bg-[#e63329]/10 text-[#e63329] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Stay Informed</span>
          <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Get Packaging Tips in Your Inbox</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">Join 2,000+ brand owners getting weekly packaging tips, trend reports, and exclusive deals — no spam, ever.</p>
          <form onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-5">
            <input type="email" placeholder="Enter your email address" required className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a2f5a] transition-colors" />
            <button type="submit" className="bg-[#e63329] hover:bg-[#c42a21] text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all whitespace-nowrap">Subscribe Free</button>
          </form>
          <p className="text-xs text-gray-400">✓ Free forever · ✓ Unsubscribe anytime · ✓ No spam</p>
        </div>
      </section>

      {/* ── TOPICS WE COVER ── */}
      <section className="py-10 md:py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-[#1a2f5a]">Topics We Cover</h2>
            <p className="text-gray-500 text-sm mt-2">Expert knowledge across every aspect of custom packaging</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {[
              { emoji: "📦", label: "Box Styles" },
              { emoji: "🎨", label: "Print & Design" },
              { emoji: "🌿", label: "Eco Packaging" },
              { emoji: "🏭", label: "Manufacturing" },
              { emoji: "🚚", label: "Shipping Tips" },
              { emoji: "💡", label: "Brand Strategy" },
            ].map(t => (
              <div key={t.label} className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-[#1a2f5a] hover:text-white group transition-all cursor-pointer">
                <span className="text-3xl block mb-2">{t.emoji}</span>
                <span className="text-xs font-bold text-gray-700 group-hover:text-white transition-colors">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY READ ── */}
      <section className="py-10 md:py-14 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto items-center">
            <div>
              <span className="inline-block bg-[#1a2f5a]/8 text-[#1a2f5a] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Expert Insights</span>
              <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-4 leading-tight">Written by Packaging Professionals</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Every article is written or reviewed by our team of packaging engineers and print specialists with 10+ years of experience in the industry.</p>
              <div className="space-y-3">
                {["Practical tips you can use immediately", "Industry trends before they go mainstream", "Cost-saving strategies for every budget", "Real case studies from our customers"].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "50+", label: "Articles Published", color: "bg-[#1a2f5a] text-white" },
                { num: "10K+", label: "Monthly Readers", color: "bg-[#e63329] text-white" },
                { num: "4.9★", label: "Reader Rating", color: "bg-yellow-400 text-[#1a2f5a]" },
                { num: "Weekly", label: "New Content", color: "bg-green-500 text-white" },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-2xl p-6 text-center`}>
                  <div className="text-2xl font-black">{s.num}</div>
                  <div className="text-xs font-medium opacity-80 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
