import { useSEO } from "../lib/useSEO";
import { TemplateRenderer, usePageTemplate } from "../components/ui/TemplateRenderer";
import { SkeletonCard } from "../components/ui/SkeletonCard";

export default function ShopPage() {
  useSEO({
    title: "Shop All Custom Packaging Boxes | Prime Packaging Boxes",
    description: "Browse our full range of custom packaging boxes, bags, and packaging solutions. Low MOQ, fast turnaround, worldwide shipping.",
    canonical: "/products",
  });

  const { content, loading } = usePageTemplate("shop");

  return (
    <>
      {loading ? (
        <div>
          <div className="h-64 bg-gray-200 animate-pulse" />
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      ) : content ? (
        <TemplateRenderer content={content} />
      ) : (
        <div className="py-16 px-4 text-center bg-[#1a2f5a] text-white">
          <h1 className="text-4xl font-bold">Shop All Products</h1>
          <p className="mt-4 text-white/70">Premium custom packaging for every need.</p>
        </div>
      )}
    </>
  );
}
