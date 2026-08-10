import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  useAdminListCategories,
  useCreateCategory,
  useUpdateCategory,
  getAdminListCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Save, ArrowLeft, ExternalLink, Image as ImageIcon, Upload, FolderOpen } from "lucide-react";
import { RichTextEditor } from "../components/ui/RichTextEditor";
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

const slugify = (t: string) =>
  t.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");

export default function CategoryEditPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const isNew = !params.id || params.id === "new";
  const id = isNew ? null : parseInt(params.id!, 10);

  // Load from list (no individual getter exists)
  const { data: categories = [], isLoading } = useAdminListCategories();
  const category = categories.find((c: any) => c.id === id) ?? null;

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const { register, handleSubmit, reset, watch, setValue, control, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: "", slug: "", description: "", imageUrl: "",
      isActive: true, sortOrder: 0,
      metaTitle: "", metaDescription: "", focusKeyword: "",
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: (category as any).name || "",
        slug: (category as any).slug || "",
        description: (category as any).description || "",
        imageUrl: (category as any).imageUrl || "",
        isActive: (category as any).isActive !== false,
        sortOrder: (category as any).sortOrder || 0,
        metaTitle: (category as any).metaTitle || "",
        metaDescription: (category as any).metaDescription || "",
        focusKeyword: (category as any).focusKeyword || "",
      });
    }
  }, [category, reset]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value);
    if (isNew) setValue("slug", slugify(e.target.value));
  };

  const onSubmit = handleSubmit((data) => {
    const payload = { ...data, sortOrder: Number(data.sortOrder) };
    if (isNew) {
      createCategory.mutate({ data: payload as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
          navigate("/categories");
        },
      });
    } else {
      updateCategory.mutate({ id: id!, data: payload as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
          navigate("/categories");
        },
      });
    }
  });

  const watched = watch();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  if (!isNew && isLoading) {
    return (
      <AdminLayout title="Edit Category">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isNew ? "Add Category" : `Edit: ${watched.name || "Category"}`}>
      <form onSubmit={onSubmit}>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <button type="button" onClick={() => navigate("/categories")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Categories
          </button>
          <div className="flex items-center gap-2">
            {!isNew && watched.slug && (
              <a href={`/product-category/${watched.slug}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                <ExternalLink className="h-3.5 w-3.5" /> View on Site
              </a>
            )}
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-50 shadow">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving…" : isNew ? "Create Category" : "Update Category"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── Left Column ── */}
          <div className="space-y-5">

            {/* Name & Slug */}
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide border-b pb-2">Category Info</h3>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category Name *</label>
                <input {...register("name", { required: true })} onChange={handleNameChange}
                  className="w-full h-10 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Mailer Boxes" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">URL Slug</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                  <span className="bg-muted px-3 py-2.5 text-xs text-muted-foreground border-r border-border whitespace-nowrap">/product-category/</span>
                  <input {...register("slug", { required: true })}
                    className="flex-1 h-10 px-3 text-sm focus:outline-none font-mono" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Description</h3>
                <span className="text-xs text-muted-foreground">Shows below product grid on category page</span>
              </div>
              <Controller name="description" control={control} render={({ field }) => (
                <RichTextEditor value={field.value || ""} onChange={field.onChange} minHeight="300px" />
              )} />
            </div>

            {/* SEO Section */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-muted/10 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">🔍 Rank Math SEO</span>
                  {(() => {
                    let score = 0;
                    const kw = (watched.focusKeyword || "").toLowerCase();
                    if (kw) {
                      score += 10;
                      if ((watched.name || "").toLowerCase().includes(kw)) score += 15;
                      if ((watched.metaTitle || "").toLowerCase().includes(kw)) score += 15;
                      if ((watched.metaDescription || "").toLowerCase().includes(kw)) score += 15;
                      if ((watched.description || "").toLowerCase().includes(kw)) score += 10;
                      if ((watched.slug || "").toLowerCase().includes(kw)) score += 10;
                    }
                    if ((watched.metaTitle || "").length > 10) score += 10;
                    if ((watched.metaDescription || "").length > 50) score += 10;
                    if (watched.imageUrl) score += 5;
                    score = Math.min(100, score);
                    const color = score >= 80 ? "#00b900" : score >= 50 ? "#ff7400" : "#d00";
                    return (
                      <div className="flex items-center gap-1.5 ml-2">
                        <div className="relative w-10 h-10">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
                              strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round"/>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>{score}</div>
                        </div>
                        <span className="text-xs font-medium" style={{ color }}>{score >= 80 ? "Good" : score >= 50 ? "Fair" : "Needs Work"}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Focus Keyword</label>
                  <input {...register("focusKeyword")} placeholder="e.g. custom mailer boxes"
                    className="w-full h-9 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">SEO Title</label>
                  <input {...register("metaTitle")} placeholder={`${watched.name || "Category"} | Prime Packaging Boxes`}
                    className="w-full h-9 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{(watched.metaTitle || "").length}/60 chars</span>
                    {(watched.metaTitle || "").length > 60 && <span className="text-xs text-red-500">Too long</span>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Meta Description</label>
                  <textarea {...register("metaDescription")} rows={3} placeholder="Describe this category in 120–160 characters..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{(watched.metaDescription || "").length}/160 chars</span>
                    {(watched.metaDescription || "").length > 160 && <span className="text-xs text-red-500">Too long</span>}
                  </div>
                </div>
                {/* SERP preview */}
                {(watched.metaTitle || watched.name) && (
                  <div className="border border-border rounded-lg p-3 bg-white">
                    <div className="text-xs text-muted-foreground mb-1">SERP Preview</div>
                    <div className="text-[#1a0dab] text-sm font-medium truncate">{watched.metaTitle || watched.name} | Prime Packaging Boxes</div>
                    <div className="text-[#006621] text-xs">primepackagingboxes.com/product-category/{watched.slug}</div>
                    <div className="text-[#545454] text-xs mt-0.5 line-clamp-2">{watched.metaDescription || "No description set."}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-5">

            {/* Publish */}
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide border-b pb-2">Publish</h3>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                <span className="font-medium">Active (visible on site)</span>
              </label>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort Order</label>
                <input type="number" {...register("sortOrder")}
                  className="w-full h-8 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            {/* Category Image */}
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide border-b pb-2">Category Image</h3>
              {watched.imageUrl ? (
                <div className="relative group rounded-lg overflow-hidden border border-border">
                  <img src={watched.imageUrl} alt="Category" className="w-full h-44 object-cover" />
                  <button type="button" onClick={() => setValue("imageUrl", "")}
                    className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold">✕</button>
                </div>
              ) : (
                <div className="h-44 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/20">
                  <ImageIcon className="h-10 w-10 opacity-40" />
                  <span className="text-xs">Paste an image URL below</span>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL</label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button type="button" onClick={() => uploadRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center justify-center gap-1.5 h-8 border border-border rounded text-xs font-medium hover:bg-muted/40 transition-colors">
                    {uploading ? <span className="animate-spin text-xs">⏳</span> : <Upload className="h-3 w-3" />}
                    Upload Image
                  </button>
                  <button type="button" onClick={() => setMediaOpen(true)}
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
                <input {...register("imageUrl")} placeholder="or paste URL..."
                  className="w-full h-8 border border-border rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            {/* Category info card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">Category URL</p>
              <code className="text-xs text-blue-600 break-all">/category/{watched.slug || "slug"}</code>
              {!isNew && watched.slug && (
                <a href={`/category/${watched.slug}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-700 mt-2 hover:underline font-medium">
                  <ExternalLink className="h-3 w-3" /> View on site
                </a>
              )}
            </div>
          </div>
        </div>
      </form>
      {mediaOpen && (
        <MediaPickerModal
          onSelect={url => { setValue("imageUrl", url); setMediaOpen(false); }}
          onClose={() => setMediaOpen(false)}
        />
      )}
    </AdminLayout>
  );
}
