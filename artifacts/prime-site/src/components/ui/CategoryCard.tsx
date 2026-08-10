import { Link } from "wouter";
import { ArrowRight, Package } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  productCount?: number;
}

interface CategoryCardProps {
  category: Category;
  productCount?: number;
}

export function CategoryCard({ category, productCount }: CategoryCardProps) {
  const count = productCount ?? category.productCount ?? 0;

  return (
    <Link
      href={`/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-[#1a2f5a] shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block"
      style={{ aspectRatio: "4/3" }}
    >
      {/* Background image */}
      {category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt={category.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          style={{ transform: "scale(1)" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2f5a] to-[#0d1f3c] flex items-center justify-center">
          <Package className="w-12 h-12 text-white/15" />
        </div>
      )}

      {/* Gradient overlay — stronger on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f3c]/95 via-[#1a2f5a]/50 to-transparent transition-opacity duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#e63329]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Product count badge */}
      {count > 0 && (
        <div className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {count} styles
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-2 drop-shadow-sm">{category.name}</h3>
        <div className="flex items-center gap-1.5 text-white/70 group-hover:text-white text-xs font-semibold transition-all duration-200">
          <span>Shop Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  );
}
