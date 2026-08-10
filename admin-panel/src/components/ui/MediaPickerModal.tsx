import { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload, ImageIcon, Loader2, Trash2, Copy, Check } from "lucide-react";

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export function MediaPickerModal({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [pasteUrl, setPasteUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/media`, { credentials: "include" });
      if (r.ok) setFiles(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const r = await fetch(`${API_BASE}/api/admin/media/upload`, { method: "POST", credentials: "include", body: form });
      if (r.ok) { await fetchFiles(); setTab("library"); }
    } finally { setUploading(false); }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm("Delete this file?")) return;
    await fetch(`${API_BASE}/api/admin/media/${encodeURIComponent(filename)}`, { method: "DELETE", credentials: "include" });
    setFiles(f => f.filter(x => x.filename !== filename));
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(`${API_BASE}${url}`);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmt = (b: number) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b / 1024).toFixed(1)}KB` : `${(b / 1048576).toFixed(1)}MB`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold">Media Library</h2>
          <div className="flex items-center gap-3">
            <div className="flex bg-muted rounded-lg p-1 text-sm">
              <button type="button" onClick={() => setTab("library")} className={`px-3 py-1 rounded-md transition-colors ${tab === "library" ? "bg-background shadow font-medium" : "text-muted-foreground"}`}>Library</button>
              <button type="button" onClick={() => setTab("upload")} className={`px-3 py-1 rounded-md transition-colors ${tab === "upload" ? "bg-background shadow font-medium" : "text-muted-foreground"}`}>Upload</button>
            </div>
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "upload" ? (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-border rounded-xl py-16 flex flex-col items-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
              >
                {uploading ? (
                  <><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-muted-foreground">Uploading...</p></>
                ) : (
                  <><Upload className="h-10 w-10 text-muted-foreground" /><p className="font-medium">Drop a file here or click to browse</p><p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP, SVG, PDF — max 10MB</p></>
                )}
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.svg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              </div>
              {/* Paste URL */}
              <div className="border rounded-xl p-4">
                <label className="text-sm font-medium mb-2 block">Or paste an image URL</label>
                <div className="flex gap-2">
                  <input value={pasteUrl} onChange={e => setPasteUrl(e.target.value)} placeholder="https://..." className="flex-1 h-9 border border-border rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button type="button" onClick={() => { if (pasteUrl) { onSelect(pasteUrl); setPasteUrl(""); } }} disabled={!pasteUrl} className="px-4 h-9 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90">Use URL</button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
              <ImageIcon className="h-12 w-12" />
              <p className="font-medium">No media files yet</p>
              <button type="button" onClick={() => setTab("upload")} className="text-primary text-sm hover:underline">Upload your first file</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {files.map(f => (
                <div key={f.filename} className="group border rounded-xl overflow-hidden hover:border-primary cursor-pointer transition-colors">
                  <div className="aspect-square bg-muted/20 relative overflow-hidden" onClick={() => onSelect(`${API_BASE}${f.url}`)}>
                    {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.filename) ? (
                      <img src={`${API_BASE}${f.url}`} alt={f.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                    )}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-primary px-2 py-1 rounded">Select</span>
                    </div>
                  </div>
                  <div className="px-2 py-1.5 text-xs">
                    <p className="truncate font-medium text-foreground">{f.filename}</p>
                    <p className="text-muted-foreground">{fmt(f.size)}</p>
                    <div className="flex gap-1 mt-1">
                      <button type="button" onClick={() => copyUrl(f.url)} className="flex items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors">
                        {copied === f.url ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <button type="button" onClick={() => handleDelete(f.filename)} className="flex items-center gap-0.5 text-muted-foreground hover:text-destructive transition-colors ml-auto">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
