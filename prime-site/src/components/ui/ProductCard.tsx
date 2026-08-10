import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Package } from "lucide-react";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function resolveImgUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return url.replace("/uploads/", "/api/uploads/");
  return url;
}

export function ProductCard({ product }: ProductCardProps) {
  const raw = product.images?.[0] || product.imageUrl || "";
  const resolved = resolveImgUrl(raw);
  const [imgError, setImgError] = useState(false);
  const hasImage = resolved && !imgError;
  const excerpt = stripHtml(product.shortDescription || product.description || "Custom packaging designed specifically for your brand needs.");

  // Sale badge via price fields if available in the API shape
  const isSale = (product as any).salePrice && (product as any).regularPrice &&
    parseFloat((product as any).salePrice) < parseFloat((product as any).regularPrice);

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm">
      {/* Image */}
      <Link href={`/${product.slug}`} className="block relative overflow-hidden bg-gray-50" style={{ aspectRatio: "4/3" }}>
        {hasImage ? (
          <img
            src={resolved}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-200 select-none bg-gradient-to-br from-gray-50 to-gray-100">
            <Package className="w-14 h-14 mb-2 text-gray-300" />
            <span className="text-xs font-medium text-gray-400">Image Coming Soon</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2f5a]/85 via-[#1a2f5a]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="inline-flex items-center gap-1.5 bg-[#e63329] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg">
            Get a Quote <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.categoryName && (
            <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-[#1a2f5a] shadow-sm border border-white/60 tracking-wide">
              {product.categoryName}
            </span>
          )}
          {isSale && (
            <span className="bg-[#e63329] text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm tracking-wide">
              SALE
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/${product.slug}`} className="font-bold text-[#1a2f5a] mb-1.5 group-hover:text-[#e63329] transition-colors line-clamp-2 text-sm leading-snug">
          {product.name}
        </Link>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1 leading-relaxed">
          {excerpt}
        </p>
        <Link
          href={`/get-quote?product=${encodeURIComponent(product.name)}`}
          className="w-full bg-[#1a2f5a] hover:bg-[#e63329] text-white font-semibold py-2.5 rounded-lg transition-all text-center text-xs flex items-center justify-center gap-1.5"
        >
          Get a Quote <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
