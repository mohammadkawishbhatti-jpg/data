import { useState, useRef, useCallback } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  Upload, FileText, CheckCircle2, XCircle, AlertCircle,
  Package, FolderOpen, RefreshCw, ChevronDown, ChevronUp, Info, Trash2
} from "lucide-react";

interface ImportStats {
  categoriesCreated: number;
  categoriesSkipped: number;
  productsCreated: number;
  productsUpdated: number;
  productsSkipped: number;
  productsDeleted?: number;
  errors: string[];
}

interface ImportResult {
  ok: boolean;
  message: string;
  stats: ImportStats;
}

export default function ImportProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileType = (f: File): "xml" | "csv" | null => {
    if (f.name.endsWith(".xml")) return "xml";
    if (f.name.endsWith(".csv")) return "csv";
    return null;
  };

  const handleFile = (f: File) => {
    if (!fileType(f)) {
      setError("Please upload a .xml (WordPress WXR) or .csv (WooCommerce export) file.");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const isCsv = file.name.endsWith(".csv");
      const endpoint = isCsv
        ? `/api/admin/import/csv${replaceMode ? "?mode=replace" : ""}`
        : "/api/admin/import/wordpress";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setShowErrors(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <AdminLayout title="Import from WordPress">
      <div className="max-w-3xl mx-auto space-y-6 py-2">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WordPress Product Import</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a WordPress WXR <strong>.xml</strong> or WooCommerce product <strong>.csv</strong> export to bulk-import products and categories.
          </p>
        </div>

        {/* How to export guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-1">
            <p className="font-semibold">Two ways to export from WooCommerce:</p>
            <div className="space-y-2 text-blue-700">
              <div>
                <p className="font-semibold text-blue-800">Option A — XML (WXR):</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-2">
                  <li>WordPress admin → <strong>Tools → Export</strong></li>
                  <li>Select <strong>"Products"</strong> → <strong>"Download Export File"</strong></li>
                  <li>Upload the <code>.xml</code> file here</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-blue-800">Option B — CSV (WooCommerce):</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-2">
                  <li>WordPress admin → <strong>Products → All Products</strong></li>
                  <li>Click <strong>"Export"</strong> at the top</li>
                  <li>Export <strong>all columns</strong> → Download <code>.csv</code></li>
                  <li>Upload the <code>.csv</code> file here</li>
                </ol>
              </div>
            </div>
            <p className="text-blue-600 text-xs mt-2">
              ✅ Existing products are <strong>updated</strong> — new products are added, existing ones get fresh content.
            </p>
          </div>
        </div>

        {/* Drop zone */}
        {!result && (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none
              ${dragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : file
                  ? "border-green-400 bg-green-50"
                  : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xml,.csv,text/xml,application/xml,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 text-base">{file.name}</p>
                  <p className="text-xs text-green-600 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Click to change file</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-primary/10" : "bg-muted"}`}>
                  <Upload className={`w-7 h-7 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="font-semibold text-base">
                    {dragging ? "Drop your file here" : "Drag & drop your WordPress export file"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse — accepts <strong>.xml</strong> or <strong>.csv</strong> up to 50 MB</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Import Failed</p>
              <p className="text-red-600 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Replace mode toggle — only for CSV */}
        {file && file.name.endsWith(".csv") && !result && (
          <div className={`flex items-start gap-3 rounded-xl p-4 border transition-colors ${replaceMode ? "bg-red-50 border-red-300" : "bg-muted/30 border-border"}`}>
            <button
              onClick={() => setReplaceMode(r => !r)}
              className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors mt-0.5 ${replaceMode ? "bg-red-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${replaceMode ? "translate-x-5" : "translate-x-1"}`} />
            </button>
            <div>
              <p className={`text-sm font-semibold ${replaceMode ? "text-red-700" : "text-foreground"}`}>
                {replaceMode ? "⚠️ Replace Mode ON" : "Replace All Products"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {replaceMode
                  ? "All existing products will be DELETED before import. This cannot be undone."
                  : "OFF — existing products will be updated, new ones added. Safe mode."}
              </p>
            </div>
          </div>
        )}

        {/* Import button */}
        {file && !result && (
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-all text-sm shadow-sm"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Importing…</>
              ) : (
                <><Upload className="w-4 h-4" /> Start Import</>
              )}
            </button>
            <button
              onClick={reset}
              disabled={loading}
              className="flex items-center gap-2 border border-border hover:bg-muted text-sm font-medium px-4 py-2.5 rounded-lg transition-all disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Progress indicator */}
        {loading && (
          <div className="bg-muted rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span className="font-semibold text-sm">Processing your WordPress export…</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Parsing XML · Matching categories · Upserting products · Resolving images
            </p>
            <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {/* Success result */}
        {result && (
          <div className="space-y-4">
            {/* Summary banner */}
            <div className={`flex items-start gap-3 rounded-xl p-5 border ${result.stats.errors.length === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
              {result.stats.errors.length === 0
                ? <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                : <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
              }
              <div>
                <p className={`font-bold text-base ${result.stats.errors.length === 0 ? "text-green-800" : "text-yellow-800"}`}>
                  {result.stats.errors.length === 0 ? "Import Successful!" : "Import Completed with Warnings"}
                </p>
                <p className={`text-sm mt-0.5 ${result.stats.errors.length === 0 ? "text-green-700" : "text-yellow-700"}`}>
                  {result.message}
                </p>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: Package,    label: "Products Created",    value: result.stats.productsCreated,      color: "text-green-600",  bg: "bg-green-50  border-green-200" },
                { icon: RefreshCw,  label: "Products Updated",    value: result.stats.productsUpdated,      color: "text-blue-600",   bg: "bg-blue-50   border-blue-200" },
                { icon: Trash2,     label: "Products Deleted",    value: result.stats.productsDeleted ?? 0, color: "text-red-600",    bg: "bg-red-50    border-red-200",   hide: !result.stats.productsDeleted },
                { icon: XCircle,    label: "Errors / Skipped",    value: result.stats.productsSkipped,      color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
                { icon: FolderOpen, label: "Categories Created",  value: result.stats.categoriesCreated,    color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
                { icon: FolderOpen, label: "Categories Skipped",  value: result.stats.categoriesSkipped,    color: "text-gray-500",   bg: "bg-gray-50   border-gray-200" },
                { icon: AlertCircle,label: "Errors",              value: result.stats.errors.length,        color: "text-red-600",    bg: "bg-red-50    border-red-200" },
              ].filter((s: any) => !s.hide).map(s => (
                <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  </div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Error details toggle */}
            {result.stats.errors.length > 0 && (
              <div className="border border-orange-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 text-sm font-semibold text-orange-800 hover:bg-orange-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {result.stats.errors.length} Import Error{result.stats.errors.length !== 1 ? "s" : ""}
                  </span>
                  {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showErrors && (
                  <div className="bg-white p-4 max-h-60 overflow-y-auto">
                    {result.stats.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5 border-b border-orange-50 last:border-0">
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700 font-mono">{err}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={reset}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm transition-all"
              >
                <Upload className="w-4 h-4" /> Import Another File
              </button>
              <a
                href="/products"
                className="flex items-center gap-2 border border-border hover:bg-muted text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
              >
                <Package className="w-4 h-4" /> View Products
              </a>
            </div>
          </div>
        )}

        {/* What gets imported */}
        {!result && (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">What gets imported from WXR</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Products
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Name & slug",
                    "Full description (HTML)",
                    "Short description",
                    "Regular price & sale price",
                    "SKU",
                    "Weight & dimensions (L × W × H)",
                    "Featured image URL",
                    "Gallery image URLs",
                    "Featured product flag",
                    "Yoast SEO title & meta description",
                    "Active/inactive status",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" /> Categories
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Category name",
                    "Category slug",
                    "Description",
                    "Auto-linked to products",
                    "Skips existing (no duplicates)",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-500" /> Not Imported
                  </p>
                  <ul className="space-y-1">
                    {["Actual image files (URLs only)", "Product variations", "Orders or customers"].map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
