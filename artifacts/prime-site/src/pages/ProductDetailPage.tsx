import { useState, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { ChevronRight, ChevronDown, ChevronUp, Star, Printer, Package, Zap, Layers, User, Paperclip, ZoomIn, Ruler, Lightbulb, CheckCircle, X, ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { ProductCard } from "../components/ui/ProductCard";
import { useGetProduct, useSubmitQuote, useListProducts } from "@workspace/api-client-react";
import { TemplateRenderer, usePageTemplate } from "../components/ui/TemplateRenderer";
import { useMemo } from "react";
import { toAbsoluteUrl, useSEO, useSchemaOrg } from "../lib/useSEO";

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_MATERIALS = ["Cardboard","Kraft","Corrugated","Rigid / Chipboard","Eco Kraft","White SBS"];
const PRINTING_OPTIONS = ["CMYK Full Color","PMS / Pantone","No Print / Plain"];
const PRINT_COLOURS = ["1 Color","2 Colors","3 Colors","4 Colors (Full Color)"];
const EXTRA_FINISHES = ["Matt","Gloss","Spot UV","Embossing","Spot UV Coating","Foiling"];
const TECH_DETAILS = [
  ["Interior Options","Kraft, Eco Kraft, White SBS and E Flute Corrugated"],
  ["Paper Thickness","14pt (Glossy), Custom Up to 24pt Uncoated"],
  ["Print Capabilities","Full Color CMYK, Pantone, Inside & Outside Printing"],
  ["Printing Finishes","Gloss/Matte Lamination, Soft Touch, Spot UV, Hot Foil Stamping, Embossing"],
  ["Custom Add-ons","Window cut-outs, Custom Shapes, Die-cuts, Flat Edges"],
  ["Box Sizes","Fully Custom — any Length, Width & Height"],
  ["Minimum Order","100 Boxes (Our MOQ)"],
  ["Turnaround Time","6–8 Business Days after artwork approval"],
];
const HOW_IT_WORKS = [
  { step: "01", title: "Share Your Idea", desc: "Tell us your product dimensions, style, and design vision. Our team reviews your brief same day." },
  { step: "02", title: "Approve Digital Proof", desc: "Our designers create a 3D digital mockup for your approval. Unlimited revisions included — free." },
  { step: "03", title: "We Print & Make", desc: "Once approved, your boxes are printed and manufactured to exact spec in our quality-controlled facility." },
  { step: "04", title: "Delivered Fast", desc: "Shipped directly to your door in 6–8 business days. Rush options available for urgent orders." },
];
const INDUSTRIES = [
  "Cosmetics & Beauty","Food & Beverage","E-Commerce Brands","Cannabis & CBD",
  "Apparel & Fashion","Consumer Electronics","Health & Wellness","Subscription Boxes",
];
const TESTIMONIALS = [
  { name: "Sarah Jenkins", company: "Bloom Beauty Co.", text: "The quality of the mailer boxes exceeded our expectations. The colors were vibrant and the printing was flawless. Our customers love the unboxing experience!" },
  { name: "Mike Chen", company: "FreshBrew Coffee", text: "We've been ordering from Prime Packaging for over a year and they never disappoint. Fast turnaround, great pricing and excellent customer service every time." },
  { name: "Emily Davis", company: "Eden Naturals", text: "First order and already impressed. Same-day response, 3D mockup within 24 hours, and the boxes arrived ahead of schedule. Highly recommend!" },
];
const FAQS = [
  { q: "What is your turnaround time?", a: "Standard production is 6–8 business days after artwork approval. Rush options (3–5 days) are available — contact us to request." },
  { q: "What is your minimum order quantity?", a: "Our MOQ is 100 boxes. We keep minimums low so small brands can access the same quality packaging as large corporations." },
  { q: "What file formats do you accept for artwork?", a: "We accept PDF, AI, PSD, PNG, and JPEG files (300 DPI at print size). If you only have a low-res logo, our design team can vectorize it at no charge." },
  { q: "Can you help me design my box?", a: "Yes — free design support is included with every order. Our structural engineers and graphic designers handle everything from the dieline to the final artwork." },
  { q: "Can I get a sample before ordering?", a: "Yes! We can produce a physical sample before full production so you can approve quality, print, and structure before committing." },
  { q: "Are your materials eco-friendly?", a: "Yes. We use FSC-certified board, soy-based inks, and offer recycled/kraft options. All packaging is 100% recyclable." },
];

// ─── Clean WordPress-exported HTML ────────────────────────────────────────────
function cleanWpHtml(raw: string): string {
  return raw
    // Actual control characters from WooCommerce HTML export
    .replace(/\r\n/g, " ").replace(/\r/g, " ")
    // Literal backslash sequences from CSV export artifact
    .replace(/\\r\\n/g, " ").replace(/\\n/g, " ").replace(/\\r/g, " ")
    // h1 inside body content → h2 (page already has h1)
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>").replace(/<\/h1>/gi, "</h2>")
    // Strip inline style from spans/b/strong so our CSS takes over
    .replace(/(<(?:span|b|strong|em|i))\s+style="[^"]*"/gi, "$1")
    // Unwrap bare <span> and </span> that add nothing
    .replace(/<span>/gi, "").replace(/<\/span>/gi, "")
    // Strip empty tags
    .replace(/<(p|div)[^>]*>\s*<\/\1>/gi, "")
    // Collapse excessive whitespace
    .replace(/\s{3,}/g, " ")
    .trim();
}

// ─── Description renderer ─────────────────────────────────────────────────────
const COLLAPSE_PX = 400;

function DescriptionContent({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const innerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setOverflows(el.scrollHeight > COLLAPSE_PX + 40);
  }, []);

  const cleaned = cleanWpHtml(text);
  const hasHtml = /<[a-zA-Z][^>]*>/.test(cleaned);

  const content = hasHtml ? (
    <div
      ref={innerRef}
      className={`
        product-desc
        [&_h2]:text-[1.35rem] [&_h2]:font-bold [&_h2]:text-[#1a2f5a]
        [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:leading-snug [&_h2]:tracking-tight
        [&_h3]:text-[1.1rem] [&_h3]:font-semibold [&_h3]:text-[#1a2f5a]
        [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:leading-snug
        [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-[#1a2f5a] [&_h4]:mt-4 [&_h4]:mb-1
        [&_p]:text-[0.9375rem] [&_p]:text-gray-600 [&_p]:leading-[1.75] [&_p]:mb-4
        [&_b]:font-semibold [&_b]:text-[#1a2f5a]
        [&_strong]:font-semibold [&_strong]:text-[#1a2f5a]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1
        [&_li]:text-[0.9375rem] [&_li]:text-gray-600 [&_li]:leading-relaxed
        [&_a]:text-[#e63329] [&_a]:no-underline hover:[&_a]:underline
        [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:mb-4
        [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2
        [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold
      `}
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  ) : (
    <div ref={innerRef} className="space-y-4">
      {cleaned.split(/\n{2,}/).filter(Boolean).map((p, i) => (
        <p key={i} className={`text-[0.9375rem] leading-[1.75] ${i === 0 ? "font-semibold text-[#1a2f5a] text-base" : "text-gray-600"}`}>
          {p.replace(/\n/g, " ")}
        </p>
      ))}
    </div>
  );

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: expanded ? "9999px" : `${COLLAPSE_PX}px` }}
      >
        {content}
        {/* Gradient fade — only when collapsed and content overflows */}
        {!expanded && overflows && (
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        )}
      </div>

      {overflows && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-4 flex items-center gap-1.5 text-[#e63329] font-semibold text-sm hover:text-[#c42a21] transition-colors group"
        >
          {expanded ? (
            <><ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" /> Show Less</>
          ) : (
            <><ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" /> Read Full Description</>
          )}
        </button>
      )}
    </div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-[#1a2f5a] text-sm">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-[#e63329] shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{a}</div>}
    </div>
  );
}

// ─── Form fields ──────────────────────────────────────────────────────────────
interface OrderForm {
  style: string; unit: string; length: string; width: string; height: string;
  cardMaterial: string; printing: string; printColour: string; quantity: string;
  finishes: string[]; name: string; email: string; phone: string; zip: string; message: string;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  // Support both /:slug (WP-style) and /products/:slug
  const [matchNew, paramsNew] = useRoute("/:slug");
  const [matchOld, paramsOld] = useRoute("/products/:slug");
  const params = paramsNew || paramsOld;
  const slug = params?.slug || "";
  // Product page template — renders extra blocks (features, CTA, FAQ, etc.) below main content
  const { content: productTemplateRaw } = usePageTemplate("product");
  const productTemplateContent = useMemo(() => {
    if (!productTemplateRaw) return null;
    try {
      const blocks = JSON.parse(productTemplateRaw).filter(
        (b: any) => b.type !== "dynamic_hero" && b.type !== "breadcrumb" && b.type !== "products_grid"
      );
      return blocks.length > 0 ? JSON.stringify(blocks) : null;
    } catch { return null; }
  }, [productTemplateRaw]);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"desc" | "reviews">("desc");
  const [submitted, setSubmitted] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const { data: product, isLoading, isError } = useGetProduct(slug, {
    query: { enabled: !!slug, retry: false, queryKey: ["product", slug] },
  });
  const { data: relatedRaw } = useListProducts(
    { category: product?.categorySlug || "" },
    { query: { enabled: !!product?.categorySlug, retry: false, queryKey: ["catProds", product?.categorySlug] } },
  );
  const submitQuote = useSubmitQuote();

  useSEO({
    title: product ? (product.metaTitle || `${product.name} | Custom Packaging Boxes`) : "Product",
    description: product ? (product.metaDescription || product.shortDescription || (product.description || "").replace(/<[^>]+>/g, " ").substring(0, 160)) : "Custom packaging details",
    ogType: "product",
    ogImage: product?.images?.[0] || product?.imageUrl || undefined,
    keywords: product ? `${product.name}, custom packaging boxes, custom ${product.name?.toLowerCase()}, branded packaging USA` : undefined,
  });

  useSchemaOrg(product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: (product.shortDescription || (product.description || "").replace(/<[^>]+>/g, " ").substring(0, 300)),
    image: product.images?.filter(Boolean).length
      ? product.images.filter(Boolean).map(image => toAbsoluteUrl(image)).filter(Boolean)
      : product.imageUrl ? [toAbsoluteUrl(product.imageUrl)] : undefined,
    url: `https://www.primepackagingboxes.com/${product.slug}`,
    brand: { "@type": "Brand", name: "Prime Packaging Boxes" },
  } : {});

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<OrderForm>({
    defaultValues: { style: "Style 1", unit: "inch", finishes: [] },
  });
  const selectedFinishes = watch("finishes") || [];

  const toggleFinish = (f: string) => {
    const current = selectedFinishes;
    setValue("finishes", current.includes(f) ? current.filter(x => x !== f) : [...current, f]);
  };

  const onSubmit = (data: OrderForm) => {
    const notes = [
      `Box Style: ${data.style}`,
      `Dimensions (${data.unit}): L ${data.length || "?"} × W ${data.width || "?"} × H ${data.height || "?"}`,
      `Card Material: ${data.cardMaterial}`,
      `Printing: ${data.printing}`,
      `Print Colour: ${data.printColour}`,
      `Extra Finishes: ${data.finishes.join(", ") || "None"}`,
      data.zip ? `ZIP: ${data.zip}` : "",
      data.message || "",
    ].filter(Boolean).join("\n");

    submitQuote.mutate({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        productType: product?.name || "",
        quantity: data.quantity || "100",
        additionalNotes: notes,
      },
    }, { onSuccess: () => { setSubmitted(true); setTimeout(() => setSubmitted(false), 7000); } });
  };

  // Loading
  if (isLoading) {
    return (
      <>
        <div className="container mx-auto px-4 py-12 animate-pulse space-y-4">
          <div className="h-3 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-gray-200 rounded" />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4 text-[#1a2f5a]">Product Not Found</h1>
        <Link href="/products" className="bg-[#1a2f5a] text-white px-6 py-3 rounded-md font-medium">Browse Products</Link>
      </div>
    );
  }

  const images = product.images?.filter(Boolean).length ? product.images.filter(Boolean) : (product.imageUrl ? [product.imageUrl] : []);
  const related = relatedRaw?.filter(p => p.id !== product.id).slice(0, 4) || [];

  return (
    <>
      {/* ── Product Hero — exact WP match ── */}
      <div className="bg-[#1a2f5a] pt-6 pb-5 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1">
              {/* Breadcrumb */}
              <div className="flex items-center flex-wrap text-xs text-white/50 gap-1 mb-3">
                <Link href="/" className="hover:text-white/90 transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/shop" className="hover:text-white/90 transition-colors">Shop</Link>
                {product.categoryName && (
                  <>
                    <ChevronRight className="h-3 w-3" />
                    <Link href={`/${product.categorySlug || product.categoryId}`} className="hover:text-white/90 transition-colors">{product.categoryName}</Link>
                  </>
                )}
                <ChevronRight className="h-3 w-3" />
                <span className="text-white/90 font-medium">{product.name}</span>
              </div>
              {/* Custom Packaging badge */}
              <span className="inline-flex items-center gap-1 border border-white/30 text-white/80 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded mb-4">
                + CUSTOM PACKAGING
              </span>
              {/* H1 — yellow like WP original */}
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold mb-3 leading-tight" style={{ color: "#f5c518" }}>{product.name}</h1>
              {/* Short description */}
              <p className="text-white/65 text-sm leading-relaxed max-w-xl">
                {product.shortDescription
                  ? product.shortDescription
                  : <>Premium <strong className="text-white/90 font-semibold">{product.name.toLowerCase()}</strong> with full-color printing, low minimums &amp; fast delivery.</>}
              </p>
            </div>
            {/* 3 info badges — right side, stacked vertically like WP */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              {[
                { Icon: Printer, label: "Printing",      value: "Full Color CMYK" },
                { Icon: Package, label: "Minimum Order",  value: "100 Units Only" },
                { Icon: Zap,     label: "Turnaround",     value: "7–10 Business Days" },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-3 rounded-lg px-4 py-2.5 border border-white/20 bg-white/[0.07] sm:min-w-[170px]">
                  <b.Icon className="w-5 h-5 text-white/70 shrink-0" />
                  <div>
                    <div className="text-white/45 text-[10px] uppercase font-bold tracking-wider leading-none mb-0.5">{b.label}</div>
                    <div className="text-white font-bold text-sm leading-tight">{b.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Bar — separate strip below hero, like WP ── */}
      <div className="bg-[#162547] border-b border-white/[0.06]">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 items-center">
            {[
              { icon: "✓", text: "Free Design Support" },
              { icon: "✓", text: "Eco-Friendly Materials" },
              { icon: "✓", text: "Wholesale Pricing" },
              { icon: "✓", text: "USA Shipping" },
              { icon: "✓", text: "No Hidden Charges" },
            ].map(t => (
              <span key={t.text} className="flex items-center gap-1.5 text-xs text-white/75">
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-[9px] shrink-0">{t.icon}</span>
                {t.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-8 items-start max-w-6xl mx-auto">

          {/* ── Left: Images ── */}
          <div className="flex justify-end">
            {/* Inner wrapper keeps image + thumbnails together, right-aligned */}
            <div className="flex flex-col gap-3 w-full max-w-[500px]">
              {/* Main image */}
              <div className="w-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm relative" style={{ aspectRatio: "1/1" }}>
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[activeImage]}
                      alt={product.name}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setZoomOpen(true)}
                    />
                    <button
                      onClick={() => setZoomOpen(true)}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow border border-gray-200 text-gray-600 hover:text-[#e63329] hover:border-[#e63329] transition-all"
                      title="Zoom image"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-gray-300 select-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                    <span className="text-sm font-medium text-gray-400">Image Coming Soon</span>
                  </div>
                )}
              </div>
              {/* Thumbnails — left-aligned under image */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImage(idx)}
                      className={`w-[72px] h-[72px] rounded-lg overflow-hidden border-2 shrink-0 transition-all bg-white flex items-center justify-center ${activeImage === idx ? "border-[#e63329] shadow-sm" : "border-gray-200 hover:border-gray-400"}`}>
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sticky order form ── */}
          <div className="sticky top-20">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">

              {/* Form Header */}
              <div className="bg-gradient-to-r from-[#1a2f5a] to-[#243d6e] px-6 py-4">
                <h2 className="text-white font-bold text-base">Get an Instant Quote</h2>
                <p className="text-white/60 text-xs mt-0.5">Fill in your specs — we'll reply within 2 hours</p>
              </div>

              <div className="p-5 space-y-5">

                {/* Section: Dimensions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-[#e63329]/10 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5 text-[#e63329]" />
                    </div>
                    <h3 className="text-[#1a2f5a] font-bold text-sm uppercase tracking-wide">Dimensions</h3>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Box Style *</label>
                      <div className="flex flex-wrap gap-2">
                        {["Style 1","Style 2","Style 3","Style 4"].map(s => (
                          <button key={s} type="button" onClick={() => setValue("style", s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${watch("style") === s ? "bg-[#e63329] text-white border-[#e63329] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-[#1a2f5a] hover:text-[#1a2f5a]"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Unit of Measure</label>
                      <div className="flex gap-2">
                        {[
                          { value: "inch", label: "Inch (in)" },
                          { value: "cm",   label: "CM (cm)"   },
                          { value: "mm",   label: "MM (mm)"   },
                        ].map(u => (
                          <button key={u.value} type="button" onClick={() => setValue("unit", u.value)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${watch("unit") === u.value ? "bg-[#1a2f5a] text-white border-[#1a2f5a]" : "bg-white text-gray-500 border-gray-200 hover:border-[#1a2f5a] hover:text-[#1a2f5a]"}`}>
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Length (L) *", field: "length" as const },
                        { label: "Width (W) *",  field: "width"  as const },
                        { label: "Height (H) *", field: "height" as const },
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                          <input {...register(field)} placeholder="0.00"
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a2f5a] transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Section: Printing & Material */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-[#e63329]/10 flex items-center justify-center shrink-0">
                      <Printer className="w-3.5 h-3.5 text-[#e63329]" />
                    </div>
                    <h3 className="text-[#1a2f5a] font-bold text-sm uppercase tracking-wide">Printing &amp; Material</h3>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Material *</label>
                        <select {...register("cardMaterial", { required: true })}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1a2f5a] transition-colors">
                          <option value="">Select material</option>
                          {CARD_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Printing *</label>
                        <select {...register("printing", { required: true })}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1a2f5a] transition-colors">
                          <option value="">Select printing</option>
                          {PRINTING_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Colour</label>
                        <select {...register("printColour")}
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1a2f5a] transition-colors">
                          <option value="">Select colour</option>
                          {PRINT_COLOURS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quantity</label>
                        <input {...register("quantity")} placeholder="e.g. 500"
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a2f5a] transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Finishes</label>
                      <div className="flex flex-wrap gap-2">
                        {EXTRA_FINISHES.map(f => (
                          <button key={f} type="button" onClick={() => toggleFinish(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${selectedFinishes.includes(f) ? "bg-[#1a2f5a] text-white border-[#1a2f5a] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-[#1a2f5a] hover:text-[#1a2f5a]"}`}>
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Artwork File</label>
                      <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#1a2f5a] hover:bg-blue-50/30 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#1a2f5a]/10 flex items-center justify-center shrink-0 transition-colors">
                          <Paperclip className="w-4 h-4 text-gray-400 group-hover:text-[#1a2f5a]" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700">Upload artwork file</div>
                          <div className="text-xs text-gray-400">PDF, AI, PNG, JPEG, PSD · Max 50 MB</div>
                        </div>
                        <input type="file" className="hidden" accept=".pdf,.ai,.png,.jpg,.jpeg,.psd" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Section: Delivery & Rush */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-[#e63329]/10 flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5 text-[#e63329]" />
                    </div>
                    <h3 className="text-[#1a2f5a] font-bold text-sm uppercase tracking-wide">Turnaround</h3>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Standard", sub: "6–8 Business Days", value: "standard" },
                      { label: "Rush", sub: "3–5 Business Days", value: "rush", badge: "+" },
                    ].map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setValue("turnaround" as any, opt.value)}
                        className={`relative flex flex-col items-start px-3 py-2.5 rounded-xl border-2 text-left transition-all ${(watch("turnaround" as any) ?? "standard") === opt.value ? "border-[#e63329] bg-[#e63329]/5" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                        {opt.badge && (
                          <span className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">RUSH</span>
                        )}
                        <span className={`text-xs font-bold ${(watch("turnaround" as any) ?? "standard") === opt.value ? "text-[#e63329]" : "text-[#1a2f5a]"}`}>{opt.label}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust strip */}
                <div className="rounded-xl bg-gradient-to-r from-[#f0f4ff] to-[#fff5f5] border border-[#e8edf8] px-4 py-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: "🎨", title: "Free Design", sub: "Included always" },
                      { icon: "⚡", title: "2hr Reply", sub: "Mon–Fri 9–6" },
                      { icon: "✅", title: "100% Quality", sub: "Or we reprint" },
                    ].map(t => (
                      <div key={t.title}>
                        <div className="text-lg mb-0.5">{t.icon}</div>
                        <div className="text-[11px] font-bold text-[#1a2f5a] leading-tight">{t.title}</div>
                        <div className="text-[10px] text-gray-400 leading-tight">{t.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Section: Personal Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-[#e63329]/10 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-[#e63329]" />
                    </div>
                    <h3 className="text-[#1a2f5a] font-bold text-sm uppercase tracking-wide">Your Details</h3>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {submitted ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-7 h-7 text-green-500" />
                      </div>
                      <h3 className="font-bold text-green-700 text-base mb-1">Quote Request Sent!</h3>
                      <p className="text-gray-500 text-sm">Our team will contact you within 2 hours.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                          <input {...register("name", { required: true })} placeholder="Your Name"
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a2f5a] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                          <input type="email" {...register("email", { required: true })} placeholder="you@email.com"
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a2f5a] transition-colors" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
                          <input {...register("phone")} placeholder="+1 (555) 000-0000"
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a2f5a] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">ZIP Code</label>
                          <input {...register("zip")} placeholder="e.g. 90001"
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a2f5a] transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Additional Notes</label>
                        <textarea {...register("message")} rows={2} placeholder="Any special requirements or questions..."
                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a2f5a] transition-colors resize-none" />
                      </div>

                      <button type="submit" disabled={isSubmitting}
                        className="w-full bg-[#e63329] hover:bg-[#c42a21] text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
                        {isSubmitting
                          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending...</>
                          : <><span>Get My Free Quote</span><span className="text-lg leading-none">→</span></>}
                      </button>

                      <p className="text-center text-[11px] text-gray-400">
                        🔒 Your info is secure · No spam · Reply in &lt; 2 hours
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ── Description / Reviews Tabs ── */}
        <div className="mt-12 border-t border-gray-200 pt-10">
          <div className="flex border-b border-gray-200 mb-6">
            <button onClick={() => setActiveTab("desc")}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "desc" ? "border-[#e63329] text-[#1a2f5a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              Description
            </button>
            <button onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "reviews" ? "border-[#e63329] text-[#1a2f5a]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              Reviews (3)
            </button>
          </div>

          {activeTab === "desc" ? (
            <div className="max-w-4xl">
              {product.description
                ? <DescriptionContent text={product.description} />
                : <p className="text-gray-400 italic">No description available.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <div className="font-bold text-[#1a2f5a] text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.company}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Technical Details ── */}
      <section className="bg-gray-50 border-y border-gray-200 py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-[#e63329] text-xs font-bold uppercase tracking-widest mb-2 text-center">Specifications</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a] text-center mb-8">Technical Details</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <tbody>
                {TECH_DETAILS.map(([label, value], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-5 py-3 font-semibold text-[#1a2f5a] w-44 border-r border-gray-100">{label}</td>
                    <td className="px-5 py-3 text-gray-600">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#e63329] text-xs font-bold uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a] mb-10">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map(s => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#1a2f5a] text-white font-extrabold text-xl flex items-center justify-center mb-4 shadow-md">{s.step}</div>
                <h3 className="font-bold text-[#1a2f5a] text-sm mb-2">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Measure ── */}
      <section className="py-14 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-[#e63329] text-xs font-bold uppercase tracking-widest mb-2">Measurement Guide</p>
              <h2 className="text-2xl font-extrabold text-[#1a2f5a] mb-4">How to Measure Your Box</h2>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                Provide the interior dimensions of your box to ensure your product fits perfectly. The outside dimensions will be slightly larger due to board thickness.
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  ["Length", "The longest dimension of your box opening"],
                  ["Width", "The second longest dimension of your box opening"],
                  ["Height (Depth)", "How tall/deep the box is when assembled"],
                ].map(([term, def]) => (
                  <li key={term} className="flex gap-3">
                    <span className="font-bold text-[#e63329] shrink-0 w-28">{term}:</span>
                    <span className="text-gray-600">{def}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-gray-400 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-500 inline mr-1" /> <strong>Pro Tip:</strong> Add 0.25–0.5 inch to each dimension of your product to ensure easy insertion and prevent a too-tight fit.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="flex items-center justify-center mb-4 w-20 h-20 bg-[#1a2f5a]/5 rounded-2xl mx-auto">
                <Ruler className="w-10 h-10 text-[#1a2f5a]" />
              </div>
              <div className="text-[#1a2f5a] font-bold text-lg mb-2">L × W × H</div>
              <p className="text-gray-400 text-sm">Always measure in this order: Length × Width × Height</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {["Length", "Width", "Height"].map(d => (
                  <div key={d} className="bg-[#1a2f5a]/5 rounded-lg p-2 font-semibold text-[#1a2f5a]">{d}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Packaging For Every Industry ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#e63329] text-xs font-bold uppercase tracking-widest mb-2">Packaging Solutions</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a] mb-8">Packaging For Every Industry</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {INDUSTRIES.map(ind => (
              <Link key={ind} href="/products"
                className="border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-[#1a2f5a] hover:bg-[#1a2f5a] hover:text-white transition-all hover:shadow-md">
                {ind}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#e63329] text-xs font-bold uppercase tracking-widest mb-2">Happy Clients</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a] mb-8">Trusted by US Brands</h2>
          <p className="text-gray-400 text-sm mb-8">Don't just take our word for it — here's what our clients say.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-left shadow-sm">
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1a2f5a] rounded-full flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                  <div>
                    <div className="font-bold text-[#1a2f5a] text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-[#e63329] text-xs font-bold uppercase tracking-widest mb-2 text-center">Got Questions?</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a2f5a] text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-12 bg-gradient-to-r from-[#1a2f5a] to-[#24407a]">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block bg-[#e63329] text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Limited Offer</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">10% Off Your First Custom Order</h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto text-sm">Ready to upgrade your packaging? Get a custom quote today and take advantage of our first customer discount.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/get-a-quote"
              className="bg-[#e63329] hover:bg-[#c42a21] text-white px-7 py-3 rounded-lg font-bold transition-colors shadow-md">
              Get an Instant Quote →
            </Link>
            <Link href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white px-7 py-3 rounded-lg font-bold transition-colors border border-white/20">
              Request Free Samples
            </Link>
          </div>
        </div>
      </section>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-[#1a2f5a] mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Product Page Template Blocks (features, CTA, FAQ, testimonials from Template Editor) ── */}
      {productTemplateContent && (
        <TemplateRenderer content={productTemplateContent} dynamicData={{ product: product as any }} />
      )}

      {/* ── Image Zoom Lightbox ── */}
      {zoomOpen && images.length > 0 && (
        <ZoomLightbox
          images={images}
          activeIndex={activeImage}
          onIndexChange={setActiveImage}
          onClose={() => setZoomOpen(false)}
          productName={product.name}
        />
      )}
    </>
  );
}

// ─── Zoom Lightbox Component ──────────────────────────────────────────────────
function ZoomLightbox({
  images, activeIndex, onIndexChange, onClose, productName,
}: {
  images: string[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  productName: string;
}) {
  const prev = useCallback(() => onIndexChange((activeIndex - 1 + images.length) % images.length), [activeIndex, images.length, onIndexChange]);
  const next = useCallback(() => onIndexChange((activeIndex + 1) % images.length), [activeIndex, images.length, onIndexChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main image */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[activeIndex]}
          alt={productName}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
          draggable={false}
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={e => { e.stopPropagation(); onIndexChange(idx); }}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-white/10 ${
                idx === activeIndex ? "border-white scale-110 shadow-lg" : "border-white/30 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-contain p-0.5" draggable={false} />
            </button>
          ))}
        </div>
      )}

      {/* Caption */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs mt-2 pointer-events-none" style={{ bottom: images.length > 1 ? "76px" : "16px" }}>
        Press <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> to close
        {images.length > 1 && <> · <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">←</kbd> <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">→</kbd> to navigate</>}
      </div>
    </div>
  );
}
