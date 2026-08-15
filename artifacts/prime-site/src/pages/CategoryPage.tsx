import { useParams, Link } from "wouter";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { ProductCard } from "../components/ui/ProductCard";
import { PageHero } from "../components/ui/PageHero";
import { CategorySections } from "../components/ui/CategorySections";
import { TemplateRenderer, usePageTemplate } from "../components/ui/TemplateRenderer";
import { useGetCategory, useListProducts } from "@workspace/api-client-react";
import { useSEO, useSchemaOrg } from "../lib/useSEO";
import { ArrowRight, Package, Phone, ShieldCheck, Zap, Truck } from "lucide-react";

// Fallback packaging images (Unsplash, compressed w=1400 q=50)
const HERO_IMGS = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=50",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=50",
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=50",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1400&q=50",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=50",
];

// Pick a stable fallback image based on slug
function pickHeroImg(slug: string) {
  let n = 0;
  for (let i = 0; i < slug.length; i++) n += slug.charCodeAt(i);
  return HERO_IMGS[n % HERO_IMGS.length];
}

export default function CategoryPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { content: templateContent } = usePageTemplate("category");

  const { data: category, isLoading, isError } = useGetCategory(slug, {
    query: { enabled: !!slug, queryKey: ["category", slug] }
  });

  const { data: productsData, isLoading: isLoadingProducts } = useListProducts(
    { category: slug, limit: 24 } as any,
    { query: { enabled: !!slug, queryKey: ["products", "category", slug] } }
  );

  const products = (productsData as any)?.items || (Array.isArray(productsData) ? productsData : []);

  // Use the saved template only after live category/product data is ready.
  // TemplateRenderer replaces the catalog section with the real products.
  useSEO({
    title: category ? (category.metaTitle || `${category.name} | Custom Packaging Boxes USA`) : "Category",
    description: category
      ? (category.metaDescription || `Custom ${category.name} — free design support, low MOQ from 100 units, fast shipping across all 50 US states.`)
      : "Browse our packaging categories",
    keywords: category ? `${category.name?.toLowerCase()}, custom packaging, branded boxes USA` : undefined,
  });

  useSchemaOrg(category ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} | Prime Packaging Boxes`,
    description: category.metaDescription || `Custom ${category.name} — free design, low minimums.`,
    url: `https://www.primepackagingboxes.com/category/${category.slug}`,
    provider: { "@type": "Organization", name: "Prime Packaging Boxes" },
  } : {});

  if (isLoading) {
    return (
      <>
        <div className="bg-[#1a2f5a] h-[320px] animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </>
    );
  }

  if (isError || !category) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4 text-[#1a2f5a]">Category Not Found</h1>
        <p className="text-gray-500 mb-8">The category you are looking for does not exist.</p>
        <Link href="/products" className="bg-[#1a2f5a] text-white px-6 py-3 rounded-md font-medium inline-block hover:bg-[#e63329] transition-colors">
          Browse All Products
        </Link>
      </div>
    );
  }

  const productCount = (products as any[]).length;
  const bgImage = (category as any).imageUrl || pickHeroImg(slug);

  if (templateContent && !isLoadingProducts) {
    return (
      <TemplateRenderer
        content={templateContent}
        dynamicData={{ category: category as any, products: products as any[] }}
      />
    );
  }

  return (
    <>

      {/* ── Hero ── */}
      <PageHero
        title={category.name}
        subtitle={
          category.description ||
          `Premium custom ${category.name.toLowerCase()} with free design support, 100-unit minimums, and free shipping across all 50 US states.`
        }
        badge="Custom Packaging"
        bgImage={bgImage}
        overlay="dark"
        minHeight={360}
        breadcrumbs={[
          { label: "Home",     href: "/" },
          { label: "Products", href: "/products" },
          { label: category.name },
        ]}
        ctas={[
          { label: "Get a Free Quote", href: "/get-a-quote", variant: "primary" },
          { label: "818-758-4076",     href: "tel:18187584076", variant: "phone" },
        ]}
      />

      {/* ── Trust Bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs">
            {[
              { Icon: ShieldCheck, text: "Quality Guaranteed" },
              { Icon: Zap,         text: "7–10 Day Turnaround" },
              { Icon: Truck,       text: "Free US Shipping" },
              { Icon: Phone,       text: "Free Design Support" },
            ].map(({ Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-gray-500 font-medium">
                <Icon className="w-3.5 h-3.5 text-[#e63329]" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#1a2f5a]">
                {productCount > 0 ? `${category.name} — ${productCount} Products` : category.name}
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">All fully customizable to your brand, size &amp; finish</p>
            </div>
            <Link href="/get-a-quote" className="inline-flex items-center gap-1.5 text-[#e63329] font-bold text-sm hover:gap-2.5 transition-all shrink-0">
              Request Custom Quote <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (products as any[]).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {(products as any[]).map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-2xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-400 text-lg mb-2">Products Coming Soon</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">We're adding products to this category. In the meantime, get a custom quote for exactly what you need.</p>
              <Link href="/get-a-quote" className="inline-flex items-center gap-2 bg-[#e63329] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#c42a21] transition-colors">
                Request a Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 9 Extra Sections ── */}
      <CategorySections categoryName={category.name} />

      {/* ── Final CTA ── */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#1a2f5a] to-[#0d1f3c] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold text-white mb-2">Need a Custom {category.name} Quote?</h3>
              <p className="text-white/60 text-sm max-w-md">
                Free design support, 100-unit minimums, 7–10 day turnaround, and free shipping to all 50 US states.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
              <Link href="/get-a-quote" className="inline-flex items-center justify-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-lg">
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="tel:18187584076" className="inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-bold text-sm transition-all">
                <Phone className="w-4 h-4" /> 818-758-4076
              </a>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
