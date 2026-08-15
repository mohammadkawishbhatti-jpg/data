import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRoute, useLocation } from "wouter";
import { AdminLayout } from "../components/layout/AdminLayout";
import { RichTextEditor } from "../components/ui/RichTextEditor";
import {
  useAdminListBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  getAdminListBlogPostsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye, EyeOff, Save, ArrowLeft, Image as ImageIcon, X } from "lucide-react";
import { Link } from "wouter";
import { MediaPickerModal } from "../components/ui/MediaPickerModal";

const slugify = (t: string) =>
  t.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");

interface BlogForm {
  title: string; slug: string; excerpt: string; content: string;
  imageUrl: string; author: string; status: string;
  metaTitle: string; metaDescription: string; focusKeyword: string; tags: string;
}

export default function BlogEditPage() {
  const [, setLocation] = useLocation();
  const [matchNew] = useRoute("/blog/new");
  const [matchEdit, params] = useRoute("/blog/:id/edit");
  const isNew = !!matchNew;
  const editId = matchEdit ? Number(params?.id) : null;
  const queryClient = useQueryClient();
  const [mediaPicker, setMediaPicker] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"featured" | null>(null);

  const { data: posts = [] } = useAdminListBlogPosts();
  const post = posts.find((p: any) => p.id === editId);

  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();

  const { register, handleSubmit, reset, setValue, control, watch, formState: { isSubmitting, errors } } = useForm<BlogForm>({
    defaultValues: { title: "", slug: "", excerpt: "", content: "", imageUrl: "", author: "Prime Packaging Team", status: "draft", metaTitle: "", metaDescription: "", focusKeyword: "", tags: "" },
  });

  const watched = watch();

  useEffect(() => {
    if (!isNew && post) {
      reset({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: (post as any).excerpt || "",
        content: (post as any).content || "",
        imageUrl: (post as any).imageUrl || "",
        author: (post as any).author || "Prime Packaging Team",
        status: post.status || "draft",
        metaTitle: (post as any).metaTitle || "",
        metaDescription: (post as any).metaDescription || "",
        focusKeyword: (post as any).focusKeyword || "",
        tags: (post as any).tags || "",
      });
    }
  }, [post, isNew, reset]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value);
    if (isNew) setValue("slug", slugify(e.target.value));
  };

  const onSubmit = handleSubmit((data) => {
    const key = getAdminListBlogPostsQueryKey();
    const payload = { ...data } as any;
    if (editId) {
      updatePost.mutate({ id: editId, data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: key }); setLocation("/blog"); }
      });
    } else {
      createPost.mutate({ data: payload }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: key }); setLocation("/blog"); }
      });
    }
  });

  const openMediaPicker = (target: "featured") => {
    setMediaTarget(target);
    setMediaPicker(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTarget === "featured") setValue("imageUrl", url);
    setMediaPicker(false);
    setMediaTarget(null);
  };

  // SEO score
  const seoScore = (() => {
    let s = 0;
    const kw = (watched.focusKeyword || "").toLowerCase();
    if (kw) {
      s += 10;
      if ((watched.title || "").toLowerCase().includes(kw)) s += 15;
      if ((watched.metaTitle || "").toLowerCase().includes(kw)) s += 15;
      if ((watched.metaDescription || "").toLowerCase().includes(kw)) s += 15;
      if ((watched.content || "").toLowerCase().includes(kw)) s += 10;
      if ((watched.slug || "").toLowerCase().includes(kw)) s += 10;
    }
    if ((watched.metaTitle || "").length > 10) s += 10;
    if ((watched.metaDescription || "").length > 50) s += 10;
    if (watched.imageUrl) s += 5;
    return Math.min(100, s);
  })();
  const seoColor = seoScore >= 80 ? "#00b900" : seoScore >= 50 ? "#ff7400" : "#d00";
  const seoLabel = seoScore >= 80 ? "Good" : seoScore >= 50 ? "Fair" : "Needs Work";

  if (!isNew && !post && posts.length > 0) {
    return <AdminLayout title="Post Not Found"><div className="py-20 text-center text-muted-foreground">Post not found. <Link href="/blog" className="text-primary underline">Back to Blog</Link></div></AdminLayout>;
  }

  return (
    <AdminLayout title={isNew ? "New Blog Post" : "Edit Post"}>
      <form onSubmit={onSubmit}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <Link href="/blog" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Posts
          </Link>
          <div className="flex items-center gap-3">
            <select {...register("status")} className="h-9 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 rounded-lg text-sm font-semibold disabled:opacity-60">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isNew ? "Publish Post" : "Update Post"}
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Title */}
            <div className="bg-card border rounded-xl shadow-sm p-5">
              <input {...register("title", { required: true })} onChange={handleTitleChange}
                placeholder="Post Title"
                className="w-full text-2xl font-bold border-none outline-none bg-transparent placeholder:text-muted-foreground/50 mb-3"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3 mt-2">
                <span className="font-medium">Permalink:</span>
                <span className="text-primary">primepackagingboxes.com/blog/</span>
                <input {...register("slug")} className="flex-1 border border-border rounded px-2 py-0.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              {errors.title && <p className="text-xs text-destructive mt-1">Title is required</p>}
            </div>

            {/* Content */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/10 flex items-center justify-between">
                <span className="font-semibold text-sm">Content</span>
              </div>
              <div className="p-4">
                <Controller name="content" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange} minHeight="400px" />
                )} />
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-card border rounded-xl shadow-sm p-5">
              <label className="text-sm font-semibold mb-2 block">Excerpt <span className="text-xs text-muted-foreground font-normal">(shown on blog listing)</span></label>
              <textarea {...register("excerpt")} rows={3}
                placeholder="Brief summary shown on the blog listing page..."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
            </div>

            {/* Rank Math SEO */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-muted/10 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">🔍 Rank Math SEO</span>
                  <div className="flex items-center gap-1.5 ml-2">
                    <div className="relative w-10 h-10">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={seoColor} strokeWidth="3"
                          strokeDasharray={`${seoScore} ${100 - seoScore}`} strokeLinecap={"round" as const} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: seoColor }}>{seoScore}</div>
                    </div>
                    <span className="text-xs font-medium" style={{ color: seoColor }}>{seoLabel}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Focus Keyword</label>
                  <input {...register("focusKeyword")} placeholder="e.g. custom mailer boxes"
                    className="w-full h-9 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">SEO Title</label>
                  <input {...register("metaTitle")} placeholder={`${watched.title || "Post Title"} | Prime Packaging Boxes`}
                    className="w-full h-9 border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{(watched.metaTitle || "").length}/60</span>
                    {(watched.metaTitle || "").length > 60 && <span className="text-xs text-destructive">Too long</span>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Meta Description</label>
                  <textarea {...register("metaDescription")} rows={3} placeholder="Describe this post in 120–160 characters..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-background" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{(watched.metaDescription || "").length}/160</span>
                    {(watched.metaDescription || "").length > 160 && <span className="text-xs text-destructive">Too long</span>}
                  </div>
                </div>
                {/* SERP preview */}
                {(watched.metaTitle || watched.title) && (
                  <div className="border border-border rounded-lg p-3 bg-white">
                    <div className="text-xs text-muted-foreground mb-1">SERP Preview</div>
                    <div className="text-[#1a0dab] text-sm font-medium truncate">{watched.metaTitle || watched.title} | Prime Packaging Boxes</div>
                    <div className="text-[#006621] text-xs">primepackagingboxes.com/blog/{watched.slug}</div>
                    <div className="text-[#545454] text-xs mt-0.5 line-clamp-2">{watched.metaDescription || watched.excerpt || "No description set."}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full xl:w-80 space-y-5 flex-shrink-0">
            {/* Publish box */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/10 font-semibold text-sm">Publish</div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20">Status</span>
                  <select {...register("status")} className="flex-1 h-8 border border-border rounded px-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20">Author</span>
                  <input {...register("author")} className="flex-1 h-8 border border-border rounded px-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="pt-2 border-t flex gap-2">
                  <Link href="/blog" className="flex-1 text-center text-sm border border-border rounded-lg py-2 hover:bg-muted/10 transition-colors">Cancel</Link>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 text-sm rounded-lg py-2 font-medium disabled:opacity-60">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isNew ? "Publish" : "Update"}
                  </button>
                </div>
                {!isNew && post && (
                  <a href={`/blog/${watched.slug}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-1 text-xs text-primary hover:underline mt-1">
                    <Eye className="h-3 w-3" /> View Post
                  </a>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/10 font-semibold text-sm">Featured Image</div>
              <div className="p-4">
                {watched.imageUrl ? (
                  <div className="relative group">
                    <img src={watched.imageUrl} alt="Featured" className="w-full rounded-lg object-cover max-h-48" />
                    <button type="button" onClick={() => setValue("imageUrl", "")}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => openMediaPicker("featured")}
                    className="w-full border-2 border-dashed border-border rounded-lg py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm font-medium">Set Featured Image</span>
                    <span className="text-xs">Click to upload or pick from library</span>
                  </button>
                )}
                {watched.imageUrl && (
                  <button type="button" onClick={() => openMediaPicker("featured")}
                    className="mt-2 w-full text-xs text-primary hover:underline text-center">
                    Change image
                  </button>
                )}
                <div className="mt-2">
                  <input {...register("imageUrl")} placeholder="Or paste image URL..."
                    className="w-full h-8 border border-border rounded px-2 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/10 font-semibold text-sm">Tags</div>
              <div className="p-4">
                <input {...register("tags")} placeholder="custom boxes, packaging, mailers..."
                  className="w-full h-9 border border-border rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {mediaPicker && (
        <MediaPickerModal onSelect={handleMediaSelect} onClose={() => setMediaPicker(false)} />
      )}
    </AdminLayout>
  );
}
