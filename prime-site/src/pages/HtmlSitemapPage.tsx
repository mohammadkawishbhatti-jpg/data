import { useSEO } from "../lib/useSEO";
import { useListProducts, useListCategories, useListBlogPosts } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function HtmlSitemapPage() {
  useSEO({ title: "Sitemap | Prime Packaging Boxes", description: "Complete sitemap of Prime Packaging Boxes — all products, categories, blog posts, and pages.", canonical: "/sitemap" });
  const { data: products = [] } = useListProducts();
  const { data: categories = [] } = useListCategories();
  const { data: posts = [] } = useListBlogPosts();

  const staticPages = [
    { name: "Home", href: "/" },
    { name: "Shop All Products", href: "/products" },
    { name: "Get a Free Quote", href: "/get-quote" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Request Free Samples", href: "/request-sample" },
  ];
  const policyPages = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Delivery Policy", href: "/delivery-policy" },
    { name: "Refund & Return Policy", href: "/refund-return-policy" },
    { name: "Returns & Claims Support", href: "/returns-claims-support" },
    { name: "Disclaimer", href: "/disclaimer" },
  ];

  return (
    <>
      <div className="bg-[#1a2f5a] text-white py-14">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Sitemap</h1>
          <p className="text-blue-200">Complete index of all pages on primepackagingboxes.com</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-14 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div>
          <h2 className="text-lg font-bold text-[#1a2f5a] border-b pb-2 mb-4">Main Pages</h2>
          <ul className="space-y-2">
            {staticPages.map(p=><li key={p.href}><Link href={p.href} className="text-sm text-gray-700 hover:text-[#e63329] hover:underline flex items-center gap-1"><span className="text-gray-400">›</span>{p.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1a2f5a] border-b pb-2 mb-4">Policies & Legal</h2>
          <ul className="space-y-2">
            {policyPages.map(p=><li key={p.href}><Link href={p.href} className="text-sm text-gray-700 hover:text-[#e63329] hover:underline flex items-center gap-1"><span className="text-gray-400">›</span>{p.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1a2f5a] border-b pb-2 mb-4">Categories ({(categories as any[]).length})</h2>
          <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
            {(categories as any[]).map((c:any)=><li key={c.slug}><Link href={`/${c.slug}`} className="text-sm text-gray-700 hover:text-[#e63329] hover:underline flex items-center gap-1"><span className="text-gray-400">›</span>{c.name}</Link></li>)}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-[#1a2f5a] border-b pb-2 mb-4">Products ({(products as any[]).length})</h2>
          <div className="columns-2 gap-4">
            {(products as any[]).map((p:any)=><div key={p.slug} className="mb-1.5 break-inside-avoid"><Link href={`/${p.slug}`} className="text-sm text-gray-700 hover:text-[#e63329] hover:underline flex items-center gap-1"><span className="text-gray-400">›</span>{p.name}</Link></div>)}
          </div>
        </div>
        {(posts as any[]).length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#1a2f5a] border-b pb-2 mb-4">Blog Posts ({(posts as any[]).length})</h2>
            <ul className="space-y-1.5">
              {(posts as any[]).map((p:any)=><li key={p.slug}><Link href={`/blog/${p.slug}`} className="text-sm text-gray-700 hover:text-[#e63329] hover:underline flex items-center gap-1"><span className="text-gray-400">›</span>{p.title}</Link></li>)}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
