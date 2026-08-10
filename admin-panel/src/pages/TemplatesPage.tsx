import { AdminLayout } from "../components/layout/AdminLayout";
import { Eye, Layout, Package, ShoppingBag, BookOpen, Edit3 } from "lucide-react";
import { useLocation } from "wouter";

const TEMPLATES = [
  {
    type: "category",
    name: "Category Page Template",
    desc: "Shared layout for all product category pages (e.g. Mailer Boxes, Gift Boxes). The category name, description, and products grid are dynamic.",
    icon: Layout,
    color: "from-blue-500 to-indigo-600",
    preview: "/product-category/mailer-boxes",
    blocks: ["Dynamic Hero", "Trust Bar", "Products Grid", "CTA Banner"],
  },
  {
    type: "product",
    name: "Product Page Template",
    desc: "Shared content sections for all individual product pages. The product hero and quote form are always present; these sections appear below them.",
    icon: Package,
    color: "from-purple-500 to-pink-600",
    preview: "/mailer-boxes",
    blocks: ["Dynamic Hero", "Features Grid", "CTA Banner"],
  },
  {
    type: "shop",
    name: "Shop / Products Listing",
    desc: "The main shop page showing all products. Includes search, category filter, and all products grid.",
    icon: ShoppingBag,
    color: "from-orange-500 to-red-600",
    preview: "/products",
    blocks: ["Hero Banner", "Trust Bar", "Products Grid", "CTA Banner"],
  },
  {
    type: "blog",
    name: "Blog Listing Page",
    desc: "The blog index page showing all published posts in a grid layout.",
    icon: BookOpen,
    color: "from-green-500 to-teal-600",
    preview: "/blog",
    blocks: ["Hero Banner", "Blog Grid", "CTA Banner"],
  },
];

export default function TemplatesPage() {
  const [, nav] = useLocation();
  return (
    <AdminLayout title="Page Templates">
      <div className="mb-6">
        <p className="text-muted-foreground text-sm">
          Overview of shared page templates. Each template controls the layout for all pages of that type.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TEMPLATES.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.type} className="bg-card border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className={`bg-gradient-to-br ${t.color} p-6 text-white`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg">{t.name}</h3>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{t.desc}</p>
              </div>

              {/* Sections preview */}
              <div className="p-4 border-b">
                <p className="text-xs font-medium text-muted-foreground mb-2">Default sections:</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.blocks.map(b => (
                    <span key={b} className="text-xs bg-muted/30 border border-border px-2 py-1 rounded-md font-medium">{b}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center gap-3">
                <button
                  onClick={() => nav(`/builder/template/${t.type}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Edit3 className="h-4 w-4" /> Edit Template
                </button>
                <a
                  href={t.preview}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 h-9 px-3 border border-border rounded-lg text-sm hover:bg-muted/10 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" /> Preview
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
