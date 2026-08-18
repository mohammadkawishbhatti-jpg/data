import { useState, useMemo } from "react";
import { Search, ArrowRight, Phone, Package, Palette, Truck, Zap, ShieldCheck, Leaf, Award, Star } from "lucide-react";
import { Link } from "wouter";
import { ProductCard } from "../components/ui/ProductCard";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { PageHero } from "../components/ui/PageHero";
import { TemplateRenderer, usePageTemplate } from "../components/ui/TemplateRenderer";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useSEO } from "../lib/useSEO";
import { responsiveImageProps } from "../lib/responsiveImage";

const HERO_BG = "/api/uploads/cardboard-gift-boxes.webp";

export default function ProductsPage() {
  const { content: templateContent } = usePageTemplate("shop");

  useSEO({
    title: "Shop Custom Packaging | Prime Packaging Boxes",
    description: "Browse our complete catalog of custom packaging products — mailer boxes, rigid boxes, kraft boxes, cosmetic packaging, and more. Free design. Free shipping."
  });

  const { data: productsData, isLoading: isLoadingProducts, isError: productsError, refetch: refetchProducts } = useListProducts({ limit: 100 });
  const { data: categoriesData, isError: categoriesError, refetch: refetchCategories } = useListCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | number>("All");

  const categories = (categoriesData as any)?.items || (Array.isArray(categoriesData) ? categoriesData : []);
  const products = (productsData as any)?.items || (Array.isArray(productsData) ? productsData : []);

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <>

      {/* ── Hero ── */}
      <PageHero
        title="All Custom Packaging Products"
        subtitle="Premium custom boxes with free design support, 100-unit minimums, and free shipping across the USA & UK. Browse 65+ product styles."
        badge="500+ Brands Served — USA & UK"
        bgImage={HERO_BG}
        minHeight={320}
        ctas={[
          { label: "Get a Free Quote", href: "/get-a-quote", variant: "primary" },
          { label: "Request Samples",  href: "/request-sample", variant: "outline" },
        ]}
      />

      {/* ── Category Filter + Search ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[96px] z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border shadow-sm ${
                selectedCategory === "All"
                  ? "bg-[#1a2f5a] text-white border-[#1a2f5a] shadow-md"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1a2f5a] hover:text-[#1a2f5a] hover:bg-white hover:shadow-md"
              }`}
            >
              All
            </button>
            {(categories as any[]).map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border shadow-sm ${
                  selectedCategory === cat.id
                    ? "bg-[#1a2f5a] text-white border-[#1a2f5a] shadow-md"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#1a2f5a] hover:text-[#1a2f5a] hover:bg-white hover:shadow-md"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]/30 focus:border-[#1a2f5a] transition-all"
              />
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-xs text-gray-500 hover:text-[#e63329] underline">
                Clear
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {isLoadingProducts ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : productsError ? (
              <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="font-semibold text-red-800">Products could not be loaded.</p>
                <button onClick={() => void refetchProducts()} className="mt-4 rounded-lg bg-[#1a2f5a] px-4 py-2 text-sm font-semibold text-white">Try again</button>
              </div>
            ) : filteredProducts.length > 0 ? (
              (filteredProducts as any[]).map((product: any) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-400 text-sm">Try adjusting your search or category filters.</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="mt-5 text-[#e63329] font-semibold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 1: Why Choose Us ── */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-[#e63329]/10 text-[#e63329] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Why Prime Packaging</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Why 500+ Brands Choose Us</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">Premium custom packaging without the premium price — here's what makes us different.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: Palette,    color:"#3b82f6", bg:"#eff6ff", title:"Free Custom Design",    desc:"Our in-house designers create your artwork at no charge. Unlimited revisions included." },
              { icon: Truck,      color:"#10b981", bg:"#ecfdf5", title:"Free US & UK Shipping",  desc:"Every order ships free across the USA (all 50 states) and the United Kingdom. Full order tracking included." },
              { icon: Zap,        color:"#f97316", bg:"#fff7ed", title:"7–10 Day Turnaround",   desc:"From artwork approval to your door — most orders complete in 7–10 business days." },
              { icon: ShieldCheck,color:"#e63329", bg:"#fef2f2", title:"100% Quality Guarantee",desc:"We inspect every batch before dispatch. Not happy? We reprint or refund." },
              { icon: Award,      color:"#a855f7", bg:"#faf5ff", title:"100-Unit Minimums",      desc:"Start small and scale fast. Premium packaging available from just 100 units." },
              { icon: Leaf,       color:"#16a34a", bg:"#f0fdf4", title:"Eco-Friendly Options",  desc:"FSC-certified materials, soy inks, and recyclable substrates available on all products." },
            ].map(card => (
              <div key={card.title} className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: card.bg }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div className="font-bold text-gray-800 mb-1.5 text-sm">{card.title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2: Featured Categories ── */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-[#1a2f5a]/10 text-[#1a2f5a] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Browse by Category</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">Shop by Packaging Type</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">Over 38 packaging categories — find exactly the style that fits your product and brand.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories as any[]).slice(0, 6).map((cat: any) => ({ slug: cat.slug, img: cat.imageUrl || "", label: cat.name })).map(cat => (
              <Link key={cat.slug} href={`/${cat.slug}`}
                className="group block rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg hover:border-[#e63329]/30 transition-all">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img {...responsiveImageProps(cat.img)} alt={cat.label}
                    width={500} height={500} loading="lazy" decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 group-hover:text-[#e63329] transition-colors">{cat.label}</span>
                  <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#e63329] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="inline-flex items-center gap-2 border-2 border-[#1a2f5a] text-[#1a2f5a] hover:bg-[#1a2f5a] hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition-all">
              View All 38+ Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3: How It Works ── */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Simple Process</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">How Ordering Works</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">From your first message to boxes at your door — here's exactly what to expect.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num:"01", emoji:"📋", title:"Submit Brief",       desc:"Tell us your box dimensions, quantity, material, and design idea. We respond in under 4 hours." },
              { num:"02", emoji:"🎨", title:"Design & Proof",      desc:"Our designer creates a full-color dieline and proof. We revise until you love it — all free." },
              { num:"03", emoji:"🏭", title:"Production & QC",     desc:"We go to print after your approval. Every batch is inspected before being packed for dispatch." },
              { num:"04", emoji:"📦", title:"Delivered Free",      desc:"Your finished boxes arrive at your US address within 7–10 business days of artwork approval." },
            ].map(step => (
              <div key={step.num} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-4xl mb-4">{step.emoji}</div>
                <div className="text-[10px] font-black text-[#e63329] tracking-widest mb-2">STEP {step.num}</div>
                <div className="font-bold text-gray-800 mb-2 text-sm">{step.title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4: Testimonials ── */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-11">
            <span className="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Customer Reviews</span>
            <h2 className="text-3xl font-extrabold text-[#1a2f5a] mb-3">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name:"Jessica T.", role:"Founder, Bloom Beauty Co.", text:"The quality blew me away. My customers keep complimenting the unboxing experience. Will be a lifetime customer.", stars:5 },
              { name:"Marcus L.", role:"Operations Manager, NutraPure", text:"We needed 500 boxes fast. Prime Packaging delivered in 8 days with zero quality issues. Highly recommend.", stars:5 },
              { name:"Sarah K.", role:"E-commerce Director, Homewise", text:"Free design support saved us thousands. Our designer nailed our brand on the first revision. Can't ask for more.", stars:5 },
            ].map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full bg-[#1a2f5a] flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                  <div>
                    <div className="font-bold text-gray-800 text-xs">{t.name}</div>
                    <div className="text-gray-400 text-[11px]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5: CTA Banner ── */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-gradient-to-r from-[#1a2f5a] to-[#0d1f3c] p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Ready to Elevate Your Brand Packaging?</h3>
                <p className="text-white/60 text-sm max-w-md leading-relaxed">Free design, free shipping, 100-unit minimum. Get your custom quote today and receive a response within 4 business hours.</p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link href="/get-a-quote" className="inline-flex items-center justify-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg">
                  Get a Free Quote <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="tel:18187584076" className="inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:bg-white/10 px-7 py-3.5 rounded-xl font-bold text-sm transition-all">
                  <Phone className="w-4 h-4" /> 818-758-4076
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
