import { useParams } from "wouter";
import { useSEO } from "../lib/useSEO";
import { useGetPage } from "@workspace/api-client-react";
import { BlockRenderer } from "../components/ui/BlockRenderer";
import { Link } from "wouter";
import { InlinePageOverrides } from "../components/ui/InlinePageOverrides";
import { parseInlineDocument } from "../lib/inlineContent";

export default function StaticPage({ slug: slugProp }: { slug?: string } = {}) {
  const params = useParams<{ slug: string }>();
  const slug = slugProp || params.slug || "";

  const { data: page, isLoading, error } = useGetPage(slug);

  useSEO({
    title: page?.metaTitle || (page ? `${page.title} | Prime Packaging Boxes` : (slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '))),
    description: page?.metaDescription || "Learn more about Prime Packaging Boxes.",
    canonical: `https://www.primepackagingboxes.com/${slug}`,
  });

  if (isLoading) {
    return (
      <>
        <div className="container mx-auto px-4 py-20 max-w-4xl animate-pulse">
          <div className="h-12 w-1/2 bg-muted rounded mb-12"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-3/4 bg-muted rounded"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <div className="container mx-auto px-4 py-20 text-center max-w-xl">
          <h1 className="text-2xl font-bold text-[#1a2f5a] mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <Link href="/" className="inline-block bg-[#e63329] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors">Go Home</Link>
        </div>
      </>
    );
  }

  const inline = parseInlineDocument(page.content || "");
  return (
    <InlinePageOverrides overrides={inline.overrides}>
      <BlockRenderer content={inline.baseContent} />
    </InlinePageOverrides>
  );
}
