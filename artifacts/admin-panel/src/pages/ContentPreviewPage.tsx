import { useEffect, useState, type ReactNode } from "react";
import { useRoute } from "wouter";
import { Loader2, ShieldCheck } from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

function prettyValue(value: unknown) {
  if (value === undefined) return "—";
  if (value === null || value === "") return "Empty";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function diffPayloads(before: Record<string, unknown>, after: Record<string, unknown>) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys]
    .filter(key => key !== "operation")
    .map(key => {
      const oldValue = prettyValue(before[key]);
      const newValue = prettyValue(after[key]);
      const state = before[key] === undefined ? "added" : after[key] === undefined ? "removed" : oldValue !== newValue ? "changed" : "same";
      return { key, oldValue, newValue, state };
    })
    .filter(item => item.state !== "same");
}

type PreviewChange = ReturnType<typeof diffPayloads>[number];

function changeTone(change?: PreviewChange) {
  if (!change) return null;
  if (change.state === "added") {
    return {
      border: "border-emerald-300",
      background: "bg-emerald-50/70",
      badge: "bg-emerald-200 text-emerald-900",
      label: "Added",
    };
  }
  if (change.state === "removed") {
    return {
      border: "border-red-300",
      background: "bg-red-50/70",
      badge: "bg-red-200 text-red-900",
      label: "Removed",
    };
  }
  return {
    border: "border-amber-300",
    background: "bg-amber-50/75",
    badge: "bg-amber-200 text-amber-950",
    label: "Changed",
  };
}

function fieldLabel(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, character => character.toUpperCase());
}

function InlineChange({ change, children, className = "" }: { change?: PreviewChange; children: ReactNode; className?: string }) {
  const tone = changeTone(change);
  if (!tone) return <>{children}</>;
  const label = fieldLabel(change?.key ?? "");

  return (
    <div className={`relative rounded-2xl border-2 ${tone.border} ${tone.background} p-2.5 ${className}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${tone.badge}`}>
          {tone.label}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function flattenTemplateValue(value: unknown, prefix = "content"): Record<string, unknown> {
  if (Array.isArray(value)) {
    return value.reduce<Record<string, unknown>>((result, item, index) => ({
      ...result,
      ...flattenTemplateValue(item, `${prefix}[${index}]`),
    }), {});
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((result, [key, child]) => ({
      ...result,
      ...flattenTemplateValue(child, `${prefix}.${key}`),
    }), {});
  }
  return { [prefix]: value };
}

function parseTemplateContent(content: unknown): unknown {
  if (typeof content !== "string") return content;
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

function templateLabel(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, character => character.toUpperCase());
}

function TemplatePreview({
  content,
  changes,
  templateType,
}: {
  content: unknown;
  changes: PreviewChange[];
  templateType: string;
}) {
  const parsed = parseTemplateContent(content);
  if (typeof parsed === "string") {
    return (
      <InlineChange change={changes.find(change => change.key === "content")} className="mt-6">
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: parsed }} />
      </InlineChange>
    );
  }

  const blocks = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as any).blocks)
      ? (parsed as any).blocks
      : [];
  const changeForPath = (path: string) => changes.find(change => change.key === path || change.key.startsWith(`${path}.`) || change.key.startsWith(`${path}[`));

  if (!blocks.length) {
    return (
      <InlineChange change={changes.find(change => change.key === "content")} className="mt-6">
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          This {templateType} template has no rendered blocks yet.
        </div>
      </InlineChange>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {blocks.map((block: any, index: number) => {
        const path = `content[${index}]`;
        const data = block?.data && typeof block.data === "object" ? block.data : {};
        const blockChange = changeForPath(path);
        const heading = data.heading || data.title || `${templateLabel(String(block?.type || "content"))} block`;
        const subheading = data.subheading || data.text || data.description;
        const items = Array.isArray(data.items) ? data.items : [];
        return (
          <InlineChange key={`${path}-${block?.id || block?.type || "block"}`} change={blockChange} className="overflow-hidden p-0">
            <div className={`p-6 ${block?.type === "cta" ? "bg-[#1a2f5a] text-white" : block?.type === "hero" || block?.type === "dynamic_hero" ? "bg-gradient-to-br from-[#12264d] to-[#244477] text-white" : "bg-white"}`}>
              <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${block?.type === "cta" || block?.type === "hero" || block?.type === "dynamic_hero" ? "text-white/60" : "text-rose-600"}`}>
                Block {index + 1} · {templateLabel(String(block?.type || "content"))}
              </p>
              <h2 className={`mt-2 text-2xl font-black ${block?.type === "cta" || block?.type === "hero" || block?.type === "dynamic_hero" ? "text-white" : "text-slate-900"}`}>{String(heading)}</h2>
              {subheading && <p className={`mt-2 max-w-2xl text-sm ${block?.type === "cta" || block?.type === "hero" || block?.type === "dynamic_hero" ? "text-white/75" : "text-slate-600"}`}>{String(subheading)}</p>}
              {items.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {items.slice(0, 8).map((item: any, itemIndex: number) => {
                    const itemPath = `${path}.data.items[${itemIndex}]`;
                    const itemText = typeof item === "string" ? item : item?.title || item?.text || JSON.stringify(item);
                    return (
                      <InlineChange key={itemPath} change={changeForPath(itemPath)} className="border-slate-200 bg-slate-50/90 p-3">
                        <p className="text-sm font-semibold text-slate-800">{String(itemText)}</p>
                      </InlineChange>
                    );
                  })}
                </div>
              )}
              {(data.buttonText || data.buttonLink) && (
                <span className="mt-5 inline-flex rounded-lg bg-[#e63329] px-4 py-2 text-xs font-bold text-white">
                  {String(data.buttonText || "Call to action")}
                </span>
              )}
            </div>
          </InlineChange>
        );
      })}
    </div>
  );
}

export default function ContentPreviewPage() {
  const [, params] = useRoute("/preview/:token");
  const [revision, setRevision] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.token) return;
    fetch(`${API}/content-preview/${params.token}`, { credentials: "omit" })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Preview unavailable");
        setRevision(body);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Preview unavailable"));
  }, [params?.token]);

  if (error) return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-2xl font-bold">Preview unavailable</h1><p className="mt-2 text-slate-300">{error}</p></div></main>;
  if (!revision) return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white"><Loader2 className="h-6 w-6 animate-spin" /></main>;

  const payload = revision.payload || {};
  const basePayload = revision.basePayload || {};
  const changes = diffPayloads(basePayload, payload);
  const changeFor = (...keys: string[]) => changes.find(change => keys.includes(change.key));
  const isTemplate = revision.entityType === "template";
  const isProduct = revision.entityType === "product";
  const isCategory = revision.entityType === "category";
  const isBanner = revision.entityType === "banner";
  const html = String(payload.content || "");
  const templateBefore = parseTemplateContent(basePayload.content);
  const templateAfter = parseTemplateContent(payload.content);
  const templateChanges = isTemplate
    ? diffPayloads(flattenTemplateValue(templateBefore), flattenTemplateValue(templateAfter))
    : [];
  const productImages = [
    ...(Array.isArray(payload.images) ? payload.images : []),
    payload.imageUrl,
  ]
    .filter((url): url is string => typeof url === "string" && url.length > 0)
    .map((url) => url.startsWith("/uploads/") ? `/api/uploads/${url.slice("/uploads/".length)}` : url)
    .filter((url, index, urls) => urls.indexOf(url) === index);
  const productDescription = String(payload.description || "");
  const productShortDescription = String(payload.shortDescription || "");
  const isProductDeletion = isProduct && payload.operation === "delete";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="border-b bg-slate-950 px-6 py-3 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Private content preview</span>
          <span className="text-xs text-slate-300">{revision.entityLabel} · {revision.status}</span>
        </div>
      </div>
      <article className="document-preview mx-auto max-w-5xl px-6 py-12">
        {(changes.length > 0 || payload.operation === "delete") && (
          <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/90 p-5 text-slate-900 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-amber-950">Highlighted changes</h2>
                <p className="mt-1 text-xs text-amber-900/70">Exact Before/After values are listed here; the rendered preview below marks each changed field inline.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="rounded-full bg-amber-200 px-2 py-1 text-amber-950">Changed</span>
                <span className="rounded-full bg-emerald-200 px-2 py-1 text-emerald-900">Added</span>
                <span className="rounded-full bg-red-200 px-2 py-1 text-red-900">Removed</span>
              </div>
            </div>
            {payload.operation === "delete" && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800">
                Delete request pending approval.
              </div>
            )}
            <div className="mt-4 space-y-2">
              {changes.length === 0 ? (
                <p className="rounded-lg bg-white/70 px-3 py-2 text-xs text-amber-900">No field-level changes found.</p>
              ) : changes.map(change => (
                <div key={change.key} className={`rounded-lg border p-3 ${change.state === "added" ? "border-emerald-200 bg-emerald-50" : change.state === "removed" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-100/70"}`}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{change.key}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${change.state === "added" ? "bg-emerald-200 text-emerald-900" : change.state === "removed" ? "bg-red-200 text-red-900" : "bg-amber-200 text-amber-950"}`}>{change.state}</span>
                  </div>
                  <div className="grid gap-2 text-xs md:grid-cols-2">
                    <div className="min-w-0 rounded-md border border-slate-200 bg-white/75 p-2">
                      <p className="mb-1 font-bold uppercase tracking-wider text-slate-400">Before</p>
                      <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-red-800">{change.oldValue}</pre>
                    </div>
                    <div className="min-w-0 rounded-md border border-slate-200 bg-white/75 p-2">
                      <p className="mb-1 font-bold uppercase tracking-wider text-slate-400">After</p>
                      <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-emerald-800">{change.newValue}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {isProduct ? (
          <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">
            <div className="bg-gradient-to-br from-[#12264d] via-[#1a2f5a] to-[#244477] px-6 py-10 text-white sm:px-10">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white/80">Product preview</span>
                {payload.categoryName && <span className="text-white/60">/ {String(payload.categoryName)}</span>}
              </div>
              <InlineChange change={changeFor("name")} className="max-w-4xl">
                <h1 className="text-4xl font-black tracking-tight text-[#f5c518] sm:text-5xl">{String(payload.name || revision.entityLabel)}</h1>
              </InlineChange>
              {productShortDescription && (
                <InlineChange change={changeFor("shortDescription")} className="mt-5 max-w-3xl">
                  <div className="prose prose-invert text-white/75" dangerouslySetInnerHTML={{ __html: productShortDescription }} />
                </InlineChange>
              )}
            </div>

            {isProductDeletion && (
              <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-semibold text-red-800 sm:px-10">
                Delete request pending — this product will be removed after an authorized reviewer approves this revision.
              </div>
            )}

            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                {productImages.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {productImages.slice(0, 6).map((image, index) => (
                      <InlineChange key={`${image}-${index}`} change={index === 0 ? changeFor("imageUrl", "images") : changeFor("images")} className={index === 0 ? "sm:col-span-2" : ""}>
                        <div className="overflow-hidden rounded-xl border bg-slate-50">
                        <img src={image} alt={`${String(payload.name || revision.entityLabel)} preview ${index + 1}`} className="aspect-[4/3] h-full w-full object-cover" />
                        </div>
                      </InlineChange>
                    ))}
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">No product image</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <InlineChange change={changeFor("minOrder")}>
                    <div className="rounded-xl border bg-slate-50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Minimum order</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{String(payload.minOrder || "—")} units</p>
                    </div>
                  </InlineChange>
                  <InlineChange change={changeFor("isActive")}>
                    <div className="rounded-xl border bg-slate-50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visibility</p>
                      <p className={`mt-1 text-lg font-black ${payload.isActive ? "text-emerald-600" : "text-slate-500"}`}>{payload.isActive ? "Active" : "Draft"}</p>
                    </div>
                  </InlineChange>
                </div>
                {productDescription ? (
                  <InlineChange change={changeFor("description")}>
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: productDescription }} />
                  </InlineChange>
                ) : (
                  <p className="text-sm text-slate-500">No full product description was added in this revision.</p>
                )}
                {(payload.metaTitle || payload.metaDescription) && (
                  <InlineChange change={changeFor("metaTitle", "metaDescription")} className="mt-8 border-indigo-200 bg-indigo-50/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">SEO preview</p>
                    {payload.metaTitle && <p className="mt-2 font-semibold text-indigo-900">{String(payload.metaTitle)}</p>}
                    {payload.metaDescription && <p className="mt-1 text-sm text-indigo-800/75">{String(payload.metaDescription)}</p>}
                  </InlineChange>
                )}
              </div>
            </div>
          </div>
        ) : isCategory ? (
          <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">
            <div className="bg-gradient-to-br from-[#12264d] to-[#244477] px-6 py-10 text-white sm:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Category preview</p>
              <InlineChange change={changeFor("name")} className="mt-3">
                <h1 className="text-4xl font-black tracking-tight text-[#f5c518]">{String(payload.name || revision.entityLabel)}</h1>
              </InlineChange>
              <InlineChange change={changeFor("slug")} className="mt-2">
                <p className="text-white/65">/{String(payload.slug || "")}</p>
              </InlineChange>
            </div>
            {payload.operation === "delete" && (
              <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-sm font-semibold text-red-800">
                Delete request pending — this category will be removed after an authorized reviewer approves this revision.
              </div>
            )}
            <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <InlineChange change={changeFor("imageUrl")}>
                {payload.imageUrl ? <img src={String(payload.imageUrl)} alt={String(payload.name || revision.entityLabel)} className="aspect-[4/3] w-full rounded-xl border object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">No category image</div>}
              </InlineChange>
              <div>
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <InlineChange change={changeFor("isActive")}><div className="rounded-xl border bg-slate-50 p-2.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visibility</p><p className="mt-1 text-lg font-black">{payload.isActive ? "Active" : "Draft"}</p></div></InlineChange>
                  <InlineChange change={changeFor("isFeatured")}><div className="rounded-xl border bg-slate-50 p-2.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Homepage feature</p><p className="mt-1 text-lg font-black">{payload.isFeatured ? "Featured" : "Standard"}</p></div></InlineChange>
                </div>
                {payload.description ? <InlineChange change={changeFor("description")}><div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: String(payload.description) }} /></InlineChange> : <p className="text-sm text-slate-500">No category description was added.</p>}
              </div>
            </div>
          </div>
        ) : isBanner ? (
          <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">
             {payload.imageUrl && <InlineChange change={changeFor("imageUrl")}><img src={String(payload.imageUrl)} alt={String(payload.title || revision.entityLabel)} className="max-h-[420px] w-full object-cover" /></InlineChange>}
            <div className="p-6 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Banner preview</p>
               <InlineChange change={changeFor("title")} className="mt-3"><h1 className="text-4xl font-black tracking-tight">{String(payload.title || revision.entityLabel)}</h1></InlineChange>
               {payload.subtitle && <InlineChange change={changeFor("subtitle")} className="mt-3"><p className="text-lg text-slate-500">{String(payload.subtitle)}</p></InlineChange>}
               {payload.link && <InlineChange change={changeFor("link")} className="mt-6"><p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Link: {String(payload.link)}</p></InlineChange>}
               <InlineChange change={changeFor("isActive", "sortOrder")} className="mt-4"><p className="text-sm font-semibold text-slate-500">{payload.isActive ? "Active banner" : "Inactive banner"} · Sort order {String(payload.sortOrder ?? 0)}</p></InlineChange>
              {payload.operation === "delete" && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">Delete request pending — this banner will be removed only after approval.</div>}
            </div>
          </div>
        ) : isTemplate ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">{revision.entityLabel}</h1>
            <p className="mt-2 text-sm text-slate-500">Rendered template preview — changed blocks are marked inline.</p>
            <TemplatePreview content={payload.content} changes={templateChanges} templateType={String(payload.type || revision.entityLabel)} />
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-rose-600">{revision.entityType === "blog" ? "Blog preview" : "Page preview"}</p>
             <InlineChange change={changeFor("title")}><h1 className="text-4xl font-black tracking-tight">{String(payload.title || revision.entityLabel)}</h1></InlineChange>
             {payload.excerpt && <InlineChange change={changeFor("excerpt")} className="mt-4"><p className="text-lg text-slate-500">{String(payload.excerpt)}</p></InlineChange>}
             <InlineChange change={changeFor("content")} className="mt-8"><div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} /></InlineChange>
          </div>
        )}
      </article>
    </main>
  );
}