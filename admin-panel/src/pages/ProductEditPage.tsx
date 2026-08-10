import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  useAdminListCategories,
  useCreateProduct,
  useUpdateProduct,
  useAdminListProducts,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { RichTextEditor } from "../components/ui/RichTextEditor";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Save, Eye, Image as ImageIcon, X, Plus, ChevronDown, ChevronUp, Search, Upload, FolderOpen } from "lucide-react";
import { MediaPickerModal } from "../components/ui/MediaPickerModal";

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

async function uploadImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${API_BASE}/api/admin/media/upload`, { method: "POST", body: fd, credentials: "include" });
  if (!r.ok) throw new Error("Upload failed");
  const data = await r.json();
  return data.url;
}

const slugify = (t: string) => t.toString().toLowerCase().trim().replace(/\s+/g,"-").replace(/[^\w-]+/g,"").replace(/--+/g,"-");

function calcSeoScore(data: any): number {
  let score = 0;
  const kw = (data.focusKeyword || "").toLowerCase();
  if (kw) {
    score += 10;
    if ((data.name || "").toLowerCase().includes(kw)) score += 15;
    if ((data.metaTitle || "").toLowerCase().includes(kw)) score += 15;
    if ((data.metaDescription || "").toLowerCase().includes(kw)) score += 15;
    if ((data.description || "").toLowerCase().includes(kw)) score += 10;
    if ((data.slug || "").toLowerCase().includes(kw)) score += 10;
  }
  if ((data.metaTitle || "").length > 10) score += 10;
  if ((data.metaDescription || "").length > 50) score += 10;
  if (data.imageUrl) score += 5;
  return Math.min(100, score);
}

function SeoScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "#00b900" : score >= 50 ? "#ff7400" : "#d00";
  const label = score >= 80 ? "Good" : score >= 50 ? "Fair" : "Needs Improvement";
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>{score}</div>
      </div>
      <div>
        <div className="text-sm font-semibold" style={{ color }}>{label}</div>
        <div className="text-xs text-gray-500">SEO Score</div>
      </div>
    </div>
  );
}

const PRODUCT_DATA_TABS = ["General","Inventory","Shipping","Attributes","Advanced"];

export default function ProductEditPage() {
  const params = useParams<{id: string}>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isNew = !params.id || params.id === "new";
  const editId = isNew ? null : Number(params.id);

  const { data: products = [] } = useAdminListProducts();
  const { data: categories = [] } = useAdminListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [activeTab, setActiveTab] = useState("General");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"image" | "gallery">("image");
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const galleryUploadRef = useRef<HTMLInputElement>(null);
  const [attrRows, setAttrRows] = useState<Array<{name:string,value:string}>>([{name:"",value:""}]);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(true);
  const [codeMode, setCodeMode] = useState(false);
  const [codeValue, setCodeValue] = useState("");

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      name:"", slug:"", shortDescription:"", description:"", categoryId:"",
      imageUrl:"", isFeatured:false, isActive:true, minOrder:100, sortOrder:0,
      metaTitle:"", metaDescription:"", focusKeyword:"",
      regularPrice:"", salePrice:"", sku:"", weight:"",
      boxLength:"", boxWidth:"", boxHeight:"",
      status:"publish",
    },
  });

  const watchedData = watch();
  const seoScore = calcSeoScore(watchedData);

  // Load existing product
  useEffect(() => {
    if (!isNew && editId && products.length > 0) {
      const p = products.find((x: any) => x.id === editId);
      if (p) {
        const extraImgs = (p.images || []).filter((u: string) => u !== p.imageUrl);
        setGalleryUrls(extraImgs);
        setAttrRows(((p as any).attributes && (p as any).attributes.length > 0) ? (p as any).attributes : [{name:"",value:""}]);
        reset({
          name: p.name || "",
          slug: p.slug || "",
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          categoryId: p.categoryId?.toString() || "",
          imageUrl: p.imageUrl || "",
          isFeatured: p.isFeatured || false,
          isActive: p.isActive !== false,
          minOrder: p.minOrder || 100,
          sortOrder: p.sortOrder || 0,
          metaTitle: p.metaTitle || "",
          metaDescription: p.metaDescription || "",
          focusKeyword: (p as any).focusKeyword || "",
          regularPrice: (p as any).regularPrice || "",
          salePrice: (p as any).salePrice || "",
          sku: (p as any).sku || "",
          weight: (p as any).weight || "",
          boxLength: (p as any).boxLength || "",
          boxWidth: (p as any).boxWidth || "",
          boxHeight: (p as any).boxHeight || "",
          status: p.isActive ? "publish" : "draft",
        });
        setCodeValue(p.description || "");
      }
    }
  }, [products, editId, isNew]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value);
    if (isNew) setValue("slug", slugify(e.target.value));
  };

  const addGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      setGalleryUrls(prev => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true);
    const imgs = data.imageUrl ? [data.imageUrl, ...galleryUrls] : galleryUrls;
    const cleanAttrs = attrRows.filter(a => a.name && a.value);
    const payload: any = {
      name: data.name, slug: data.slug,
      shortDescription: data.shortDescription, description: data.description,
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      imageUrl: data.imageUrl || undefined, images: imgs,
      isFeatured: data.isFeatured, isActive: data.status !== "draft",
      minOrder: Number(data.minOrder), sortOrder: Number(data.sortOrder),
      metaTitle: data.metaTitle || undefined, metaDescription: data.metaDescription || undefined,
      focusKeyword: data.focusKeyword || undefined,
      regularPrice: data.regularPrice || undefined, salePrice: data.salePrice || undefined,
      sku: data.sku || undefined, weight: data.weight || undefined,
      boxLength: data.boxLength || undefined, boxWidth: data.boxWidth || undefined,
      boxHeight: data.boxHeight || undefined,
      attributes: cleanAttrs,
    };
    try {
      if (isNew) {
        await createProduct.mutateAsync({ data: payload });
      } else {
        await updateProduct.mutateAsync({ id: editId!, data: payload });
      }
      queryClient.invalidateQueries();
      setLocation("/products");
    } finally {
      setSaving(false);
    }
  });

  const metaTitle = watch("metaTitle");
  const metaDesc = watch("metaDescription");
  const focusKw = watch("focusKeyword");

  return (
    <AdminLayout title={isNew ? "Add New Product" : "Edit Product"}>
      <form onSubmit={onSubmit}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button type="button" onClick={() => setLocation("/products")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> All Products
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { setValue("status","draft"); onSubmit(); }}
              className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors">
              Save Draft
            </button>
            {!isNew && (
              <a href={`/${watch("slug")}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                <Eye className="h-3.5 w-3.5" /> Preview
              </a>
            )}
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : isNew ? "Publish" : "Update"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Title */}
            <div className="bg-card border rounded-xl p-5 shadow-sm">
              <input
                {...register("name", { required: true, onChange: handleNameChange })}
                placeholder="Product name"
                className="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-border pb-2 mb-3 focus:outline-none focus:border-primary placeholder:text-muted-foreground/40"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Permalink:</span>
                <span className="text-foreground font-mono">/{watch("slug")}</span>
                <input {...register("slug", { required: true })}
                  className="text-xs font-mono border border-border rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary bg-muted/30 ml-1" />
              </div>
            </div>

            {/* Description editor */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b">
                <span className="text-sm font-medium text-foreground mr-2">Description</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setCodeMode(false)}
                    className={`px-3 py-1 text-xs rounded-t border ${!codeMode ? "bg-background border-border border-b-background font-semibold" : "bg-muted/50 border-transparent text-muted-foreground"}`}>
                    Visual
                  </button>
                  <button type="button" onClick={() => setCodeMode(true)}
                    className={`px-3 py-1 text-xs rounded-t border ${codeMode ? "bg-background border-border border-b-background font-semibold" : "bg-muted/50 border-transparent text-muted-foreground"}`}>
                    Code
                  </button>
                </div>
              </div>
              <div className="p-4">
                {codeMode ? (
                  <Controller name="description" control={control} render={({ field }) => (
                    <textarea
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      className="w-full font-mono text-xs border rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary bg-muted/20"
                      rows={20}
                      placeholder="Enter HTML content..."
                    />
                  )} />
                ) : (
                  <Controller name="description" control={control} render={({ field }) => (
                    <RichTextEditor value={field.value || ""} onChange={field.onChange} minHeight="280px" />
                  )} />
                )}
              </div>
            </div>

            {/* Product Data Tabs */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-0 border-b bg-muted/30 px-4 pt-3">
                <span className="text-sm font-semibold text-foreground mr-4">Product data —</span>
                <select {...register("status")} className="text-sm border border-border rounded px-2 py-1 bg-background focus:outline-none mr-6">
                  <option value="publish">Simple product</option>
                  <option value="draft">Draft</option>
                </select>
                <div className="flex gap-0 ml-auto">
                  {PRODUCT_DATA_TABS.map(tab => (
                    <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5">
                {activeTab === "General" && (
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Regular price ($)</label>
                      <input {...register("regularPrice")} placeholder="e.g. 0.99" className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sale price ($)</label>
                      <input {...register("salePrice")} placeholder="e.g. 0.49" className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Min. Order Quantity</label>
                      <input type="number" {...register("minOrder")} className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sort Order</label>
                      <input type="number" {...register("sortOrder")} className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer col-span-2">
                      <input type="checkbox" {...register("isFeatured")} className="h-4 w-4 rounded border-input text-primary" />
                      Featured Product
                    </label>
                  </div>
                )}
                {activeTab === "Inventory" && (
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">SKU</label>
                      <input {...register("sku")} placeholder="e.g. PPB-001" className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer h-9">
                        <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-input text-primary" />
                        Product Active / In Stock
                      </label>
                    </div>
                  </div>
                )}
                {activeTab === "Shipping" && (
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Weight (oz)</label>
                      <input {...register("weight")} placeholder="e.g. 12oz" className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground pt-2">Dimensions (cm)</div>
                    <div>
                      <label className="text-xs text-muted-foreground">Length</label>
                      <input {...register("boxLength")} placeholder="L" className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Width</label>
                      <input {...register("boxWidth")} placeholder="W" className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Height</label>
                      <input {...register("boxHeight")} placeholder="H" className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                )}
                {activeTab === "Attributes" && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Add custom attributes like Material, Finish, Style, etc.</p>
                    <div className="space-y-2">
                      {attrRows.map((row, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input value={row.name} onChange={e => setAttrRows(prev => prev.map((r,j)=>j===i?{...r,name:e.target.value}:r))}
                            placeholder="Name (e.g. Material)" className="flex-1 h-8 border border-border rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                          <input value={row.value} onChange={e => setAttrRows(prev => prev.map((r,j)=>j===i?{...r,value:e.target.value}:r))}
                            placeholder="Value (e.g. Kraft Paper)" className="flex-1 h-8 border border-border rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                          <button type="button" onClick={() => setAttrRows(prev => prev.filter((_,j)=>j!==i))} className="p-1 text-red-500 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setAttrRows(prev => [...prev, {name:"",value:""}])}
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <Plus className="h-3 w-3" /> Add attribute
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "Advanced" && (
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 text-sm text-muted-foreground">Advanced product settings</div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sort Order</label>
                      <input type="number" {...register("sortOrder")} className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Short Description */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b">
                <span className="text-sm font-medium">Product short description</span>
              </div>
              <div className="p-4">
                <Controller name="shortDescription" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value || ""} onChange={field.onChange} minHeight="120px" placeholder="Short product description shown in listings..." />
                )} />
              </div>
            </div>

            {/* Rank Math SEO */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <button type="button" onClick={() => setSeoOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">R</span>
                  </div>
                  <span className="font-semibold text-sm">Rank Math SEO</span>
                  <SeoScoreBadge score={seoScore} />
                </div>
                {seoOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {seoOpen && (
                <div className="px-5 pb-5 border-t">
                  <div className="mt-4 space-y-4">
                    {/* Focus Keyword */}
                    <div>
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-orange-500" /> Focus Keyword
                      </label>
                      <input {...register("focusKeyword")} placeholder="e.g. custom clothing boxes"
                        className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400" />
                    </div>
                    {/* SEO checks */}
                    {focusKw && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
                        <p className="font-semibold text-sm mb-2">SEO Analysis</p>
                        {[
                          { label: "Focus keyword in title", ok: watchedData.name?.toLowerCase().includes(focusKw.toLowerCase()) },
                          { label: "Focus keyword in meta title", ok: metaTitle?.toLowerCase().includes(focusKw.toLowerCase()) },
                          { label: "Focus keyword in meta description", ok: metaDesc?.toLowerCase().includes(focusKw.toLowerCase()) },
                          { label: "Focus keyword in URL", ok: watchedData.slug?.toLowerCase().includes(focusKw.toLowerCase()) },
                          { label: "Focus keyword in description", ok: watchedData.description?.toLowerCase().includes(focusKw.toLowerCase()) },
                          { label: "Meta title set", ok: (metaTitle || "").length > 10 },
                          { label: "Meta description set (50+ chars)", ok: (metaDesc || "").length >= 50 },
                          { label: "Product image set", ok: !!watchedData.imageUrl },
                        ].map(({label,ok}) => (
                          <div key={label} className={`flex items-center gap-2 ${ok ? "text-green-700" : "text-red-600"}`}>
                            <span>{ok ? "✓" : "✗"}</span> {label}
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">SEO Title <span className="text-muted-foreground font-normal">({(metaTitle||"").length}/60)</span></label>
                      <input {...register("metaTitle")} placeholder={`${watch("name")} | Prime Packaging Boxes`}
                        className="mt-1 w-full h-9 border border-border rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      <p className="text-xs text-muted-foreground mt-0.5">Google typically shows 50–60 characters</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Meta Description <span className="text-muted-foreground font-normal">({(metaDesc||"").length}/160)</span></label>
                      <textarea {...register("metaDescription")} rows={3} placeholder="Custom packaging boxes manufactured to your exact specs..."
                        className="mt-1 w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      <p className="text-xs text-muted-foreground mt-0.5">Google typically shows 150–160 characters</p>
                    </div>
                    {/* SERP preview */}
                    {(metaTitle || watch("name")) && (
                      <div className="border rounded-lg p-3 bg-white">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">SERP Preview</p>
                        <div className="text-[#1a0dab] text-base font-medium truncate leading-snug">
                          {metaTitle || `${watch("name")} | Prime Packaging Boxes`}
                        </div>
                        <div className="text-[#006621] text-xs">primepackagingboxes.com/{watch("slug")}</div>
                        <div className="text-[#545454] text-xs mt-0.5 line-clamp-2">
                          {metaDesc || "Custom packaging boxes manufactured to your exact specifications."}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">
            {/* Publish */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
                <span className="text-sm font-semibold">Publish</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <select {...register("status")} className="border border-border rounded px-2 py-1 text-xs focus:outline-none">
                    <option value="publish">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Visibility:</span>
                  <span className="font-medium">Public</span>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button type="submit" disabled={saving}
                    className="w-full py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
                    {saving ? "Saving…" : isNew ? "Publish" : "Update"}
                  </button>
                  <button type="button" onClick={() => { setValue("status","draft"); onSubmit(); }}
                    className="w-full py-2 border rounded-md text-sm hover:bg-muted transition-colors">
                    Save Draft
                  </button>
                  {!isNew && (
                    <a href={`/${watch("slug")}`} target="_blank" rel="noreferrer"
                      className="w-full py-2 border rounded-md text-sm text-center hover:bg-muted transition-colors flex items-center justify-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Product Image */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b">
                <span className="text-sm font-semibold">Product image</span>
              </div>
              <div className="p-4">
                {watch("imageUrl") ? (
                  <div className="relative group">
                    <img src={watch("imageUrl")} alt="Product" className="w-full rounded-lg border object-cover aspect-square" />
                    <button type="button" onClick={() => setValue("imageUrl", "")}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No image set</p>
                  </div>
                )}
                <div className="mt-3 space-y-2">
                  {/* Upload + Library buttons */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button type="button" onClick={() => uploadRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center justify-center gap-1.5 h-8 border border-border rounded text-xs font-medium hover:bg-muted/40 transition-colors">
                      {uploading ? <span className="animate-spin">⏳</span> : <Upload className="h-3 w-3" />}
                      Upload Image
                    </button>
                    <button type="button" onClick={() => { setMediaTarget("image"); setMediaOpen(true); }}
                      className="flex items-center justify-center gap-1.5 h-8 border border-border rounded text-xs font-medium hover:bg-muted/40 transition-colors">
                      <FolderOpen className="h-3 w-3" /> Media Library
                    </button>
                  </div>
                  <input ref={uploadRef} type="file" accept="image/*" className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      setUploading(true);
                      try { const url = await uploadImageFile(file); setValue("imageUrl", url); }
                      catch { alert("Upload failed"); }
                      finally { setUploading(false); e.target.value = ""; }
                    }} />
                  <input {...register("imageUrl")} placeholder="or paste image URL..."
                    className="w-full h-8 border border-border rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            </div>

            {/* Product Gallery */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b">
                <span className="text-sm font-semibold">Product gallery</span>
              </div>
              <div className="p-4">
                {galleryUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {galleryUrls.map((url, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={url} alt="" className="w-full h-full object-cover rounded border" />
                        <button type="button" onClick={() => setGalleryUrls(prev => prev.filter((_,j)=>j!==i))}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-1 mb-1">
                  <button type="button" onClick={() => { setMediaTarget("gallery"); setMediaOpen(true); }}
                    className="flex items-center gap-1 px-2 h-7 border border-border rounded text-xs hover:bg-muted/40">
                    <FolderOpen className="h-3 w-3" /> Library
                  </button>
                  <button type="button" onClick={() => galleryUploadRef.current?.click()}
                    className="flex items-center gap-1 px-2 h-7 border border-border rounded text-xs hover:bg-muted/40">
                    <Upload className="h-3 w-3" /> Upload
                  </button>
                  <input ref={galleryUploadRef} type="file" accept="image/*" className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      try { const url = await uploadImageFile(file); setGalleryUrls(p => [...p, url]); }
                      catch { alert("Upload failed"); }
                      finally { e.target.value = ""; }
                    }} />
                </div>
                <div className="flex gap-1">
                  <input value={newGalleryUrl} onChange={e => setNewGalleryUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addGalleryUrl())}
                    placeholder="Paste gallery image URL..." className="flex-1 h-7 border border-border rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button type="button" onClick={addGalleryUrl}
                    className="px-2 h-7 bg-muted border border-border rounded text-xs hover:bg-muted/80 transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b">
                <span className="text-sm font-semibold">Product categories</span>
              </div>
              <div className="p-4 max-h-52 overflow-y-auto space-y-1.5">
                {categories.map((cat: any) => {
                  const currentId = watch("categoryId");
                  const isChecked = currentId === cat.id?.toString();
                  return (
                    <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                      <input type="radio" value={cat.id?.toString()} {...register("categoryId")}
                        className="h-3.5 w-3.5 text-primary" />
                      {cat.name}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </form>
      {mediaOpen && (
        <MediaPickerModal
          onSelect={url => {
            if (mediaTarget === "image") setValue("imageUrl", url);
            else setGalleryUrls(p => [...p, url]);
            setMediaOpen(false);
          }}
          onClose={() => setMediaOpen(false)}
        />
      )}
    </AdminLayout>
  );
}
