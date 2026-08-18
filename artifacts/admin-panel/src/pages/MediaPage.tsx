import { useState, useRef, useCallback, useEffect } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Upload, ImageIcon, Loader2, Trash2, Copy, Check, Grid3X3, List, Search, CheckCircle2, XCircle, X } from "lucide-react";

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

interface MediaFile {
  filename: string;
  url: string;
  originalName?: string;
  size: number;
  sizeBytes?: number;
  mimeType?: string;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  variants?: Record<string, string>;
  warnings?: string[];
  optimizationStatus?: string;
  createdAt: string;
}

interface UploadItem {
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
}

const fmt = (b: number) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b / 1024).toFixed(1)}KB` : `${(b / 1048576).toFixed(1)}MB`;
const isImg = (f: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f);

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [altText, setAltText] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/media`, { credentials: "include" });
      if (r.ok) setFiles(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (fileArr: File[]) => {
    const items: UploadItem[] = fileArr.map(f => ({ name: f.name, status: "pending", progress: 0 }));
    setUploadItems(items);
    setShowUploadPanel(true);

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      setUploadItems(prev => prev.map((x, idx) => idx === i ? { ...x, status: "uploading", progress: 5 } : x));
      try {
        await new Promise<void>((resolve, reject) => {
          const fd = new FormData();
          fd.append("file", file);
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `${API_BASE}/api/admin/media/upload`);
          xhr.withCredentials = true;
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 95) + 5;
              setUploadItems(prev => prev.map((x, idx) => idx === i ? { ...x, progress: Math.min(pct, 99) } : x));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadItems(prev => prev.map((x, idx) => idx === i ? { ...x, status: "done", progress: 100 } : x));
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.ontimeout = () => reject(new Error("Timeout"));
          xhr.timeout = 120000; // 2 min timeout per file
          xhr.send(fd);
        });
      } catch (err: any) {
        setUploadItems(prev => prev.map((x, idx) => idx === i ? { ...x, status: "error", progress: 0 } : x));
      }
    }
    await fetchFiles();
  };

  const handleSaveMetadata = async () => {
    if (!selected) return;
    setSavingAlt(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/media/${encodeURIComponent(selected.filename)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText }),
      });
      if (response.ok) {
        setFiles(files => files.map(file => file.filename === selected.filename ? { ...file, altText } : file));
        setSelected(file => file ? { ...file, altText } : file);
      }
    } finally { setSavingAlt(false); }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm("Delete this file permanently?")) return;
    await fetch(`${API_BASE}/api/admin/media/${encodeURIComponent(filename)}`, { method: "DELETE", credentials: "include" });
    setFiles(f => f.filter(x => x.filename !== filename));
    if (selected?.filename === filename) setSelected(null);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(`${API_BASE}${url}`);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = files.filter(f => f.filename.toLowerCase().includes(search.toLowerCase()));
  const doneCount = uploadItems.filter(x => x.status === "done").length;
  const errorCount = uploadItems.filter(x => x.status === "error").length;
  const totalCount = uploadItems.length;
  const allFinished = totalCount > 0 && uploadItems.every(x => x.status === "done" || x.status === "error");

  return (
    <AdminLayout title="Media Library">

      {/* Upload Progress Panel */}
      {showUploadPanel && (
        <div className="mb-6 border rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              {allFinished
                ? errorCount === 0 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
                : <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
              <span className="font-semibold text-sm">
                {allFinished
                  ? errorCount === 0 ? `✅ Upload complete! ${doneCount} file${doneCount !== 1 ? "s" : ""} uploaded.`
                    : `Upload finished — ${doneCount} success, ${errorCount} failed`
                  : `Uploading ${doneCount}/${totalCount}...`}
              </span>
            </div>
            {allFinished && <button onClick={() => setShowUploadPanel(false)}><X className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>}
          </div>
          {!allFinished && (
            <div className="h-1.5 bg-gray-100">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }} />
            </div>
          )}
          <div className="divide-y max-h-60 overflow-y-auto">
            {uploadItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-5 shrink-0 flex items-center justify-center">
                  {item.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {item.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                  {item.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {item.status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-gray-200" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-medium truncate text-gray-700">{item.name}</span>
                    <span className={`text-xs font-semibold shrink-0 ${item.status === "done" ? "text-green-600" : item.status === "error" ? "text-red-600" : item.status === "uploading" ? "text-blue-600" : "text-gray-400"}`}>
                      {item.status === "done" ? "Done" : item.status === "error" ? "Failed" : item.status === "uploading" ? `${item.progress}%` : "Waiting"}
                    </span>
                  </div>
                  <div className={`h-1 rounded-full overflow-hidden ${item.status === "done" ? "bg-green-100" : item.status === "error" ? "bg-red-100" : "bg-gray-100"}`}>
                    <div className={`h-full rounded-full transition-all duration-200 ${item.status === "done" ? "bg-green-500 w-full" : item.status === "error" ? "bg-red-400 w-full" : "bg-blue-500"}`}
                      style={item.status === "uploading" ? { width: `${item.progress}%` } : undefined} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="search" placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted/10"}`}><Grid3X3 className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted/10"}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
        <div>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 rounded-md font-medium text-sm">
            <Upload className="h-4 w-4" /> Upload Files
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.svg" multiple className="hidden"
            onChange={e => { const picked = Array.from(e.target.files ?? []); e.target.value = ""; if (picked.length) handleUpload(picked); }} />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* Drop Zone */}
          <div className="mb-4 border-2 border-dashed border-border rounded-xl py-6 flex items-center justify-center gap-3 text-muted-foreground cursor-pointer hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const picked = Array.from(e.dataTransfer.files ?? []); if (picked.length) handleUpload(picked); }}
            onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-5 w-5" />
            <span className="text-sm font-medium">Drop files here or click to upload · JPG, PNG, GIF, WebP, SVG · Max 10MB each</span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <span>{files.length} file{files.length !== 1 ? "s" : ""}</span>
            {filtered.length !== files.length && <span>· {filtered.length} matching search</span>}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
              <ImageIcon className="h-12 w-12" />
              <p className="font-medium">{files.length === 0 ? "No media files yet" : "No files match your search"}</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map(f => (
                <div key={f.filename}
                  className={`group border rounded-xl overflow-hidden cursor-pointer transition-all ${selected?.filename === f.filename ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/50"}`}
                  onClick={() => { const next = selected?.filename === f.filename ? null : f; setSelected(next); setAltText(next?.altText ?? ""); }}>
                  <div className="aspect-square bg-muted/20 overflow-hidden">
                    {isImg(f.filename)
                      ? <img src={`${API_BASE}${f.url}`} alt={f.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>}
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="truncate text-xs font-medium">{f.filename}</p>
                    <p className="text-xs text-muted-foreground">{fmt(f.size)}{f.width && f.height ? ` · ${f.width}×${f.height}` : ""}</p>
                    {f.warnings?.length ? <p className="truncate text-[10px] font-semibold text-amber-700">Quality warning</p> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium w-16">Preview</th>
                    <th className="px-4 py-3 text-left font-medium">Filename</th>
                    <th className="px-4 py-3 text-left font-medium">Size</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(f => (
                    <tr key={f.filename} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        {isImg(f.filename)
                          ? <img src={`${API_BASE}${f.url}`} alt={f.filename} className="w-10 h-10 rounded object-cover" />
                          : <div className="w-10 h-10 rounded bg-muted/20 flex items-center justify-center text-xs">{f.filename.split(".").pop()?.toUpperCase()}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium truncate max-w-xs">{f.filename}</div>
                        <div className="text-xs text-muted-foreground truncate">{API_BASE}{f.url}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(f.size)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => copyUrl(f.url)} className="p-1 text-muted-foreground hover:text-primary" title="Copy URL">
                            {copied === f.url ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <button onClick={() => handleDelete(f.filename)} className="p-1 text-muted-foreground hover:text-destructive" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {selected && view === "grid" && (
          <div className="w-64 flex-shrink-0">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden sticky top-4">
              <div className="aspect-square bg-muted/20 overflow-hidden">
                {isImg(selected.filename)
                  ? <img src={`${API_BASE}${selected.url}`} alt={selected.filename} className="w-full h-full object-contain" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-12 w-12 text-muted-foreground" /></div>}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold break-all">{selected.filename}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fmt(selected.size)}</p>
                   {selected.width && selected.height && <p className="text-xs text-muted-foreground">{selected.width} × {selected.height}px</p>}
                   <p className="text-xs text-muted-foreground">Optimization: <strong>{selected.optimizationStatus || "legacy"}</strong></p>
                   {selected.warnings?.map(warning => <p key={warning} className="mt-1 text-[11px] font-semibold text-amber-700">{warning}</p>)}
                  <p className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
                 <div>
                   <label className="text-xs font-medium text-muted-foreground">Alt text</label>
                   <textarea value={altText} onChange={event => setAltText(event.target.value)} rows={2} maxLength={300} placeholder="Describe this image for accessibility and SEO" className="mt-1 w-full resize-none rounded border border-border bg-background px-2 py-1.5 text-xs" />
                   <button type="button" disabled={savingAlt} onClick={() => void handleSaveMetadata()} className="mt-1 w-full rounded border border-primary px-2 py-1.5 text-xs font-semibold text-primary disabled:opacity-50">{savingAlt ? "Saving…" : "Save alt text"}</button>
                 </div>
                 {selected.variants && Object.keys(selected.variants).length > 0 && (
                   <div>
                     <p className="text-xs font-medium text-muted-foreground mb-1">Responsive variants</p>
                     <div className="flex flex-wrap gap-1">{Object.entries(selected.variants).map(([key, url]) => <a key={key} href={`${API_BASE}${url}`} target="_blank" rel="noreferrer" className="rounded bg-muted/20 px-2 py-1 text-[10px] font-semibold hover:bg-muted/40">{key}</a>)}</div>
                   </div>
                 )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">File URL</p>
                  <div className="flex gap-1">
                    <input readOnly value={`${API_BASE}${selected.url}`} className="flex-1 text-xs border border-border rounded px-2 py-1 bg-muted/10 focus:outline-none" />
                    <button onClick={() => copyUrl(selected.url)} className="p-1.5 border border-border rounded hover:bg-muted/10">
                      {copied === selected.url ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <a href={`${API_BASE}${selected.url}`} target="_blank" rel="noreferrer"
                    className="flex-1 text-center text-xs border border-border rounded-lg py-1.5 hover:bg-muted/10">View</a>
                  <button onClick={() => handleDelete(selected.filename)}
                    className="flex-1 text-center text-xs border border-destructive text-destructive rounded-lg py-1.5 hover:bg-destructive hover:text-white transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
