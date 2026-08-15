/**
 * SlugPage — resolves /:slug to product, category, or blog post
 * Uses a single /api/resolve/:slug call instead of 3 parallel requests (faster)
 */
import { lazy, Suspense } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import NotFoundPage from "./NotFoundPage";

const ProductDetailPage = lazy(() => import("./ProductDetailPage"));
const CategoryPage      = lazy(() => import("./CategoryPage"));
const BlogPostPage      = lazy(() => import("./BlogPostPage"));

const Spinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#e63329] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function SlugPage() {
  const { slug = "" } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery<{ type: string; slug: string }>({
    queryKey: ["resolve", slug],
    queryFn: async () => {
      const r = await fetch(`/api/resolve/${encodeURIComponent(slug)}`);
      return r.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading || !data) return <Spinner />;

  return (
    <Suspense fallback={<Spinner />}>
      {data.type === "product"  && <ProductDetailPage />}
      {data.type === "category" && <CategoryPage />}
      {data.type === "blogPost" && <BlogPostPage />}
      {data.type === "notFound" && <NotFoundPage />}
    </Suspense>
  );
}
