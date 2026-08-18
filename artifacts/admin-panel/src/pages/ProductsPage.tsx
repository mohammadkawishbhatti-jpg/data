import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  useAdminListProducts,
  useDeleteProduct,
  useUpdateProduct,
  useAdminListCategories,
  useGetAdminMe,
  getAdminListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Edit, Trash2, Check, X, Search, ExternalLink, Download, ChevronDown, Star, LayoutGrid, ListChecks } from "lucide-react";
import { useState as useMenuState } from "react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: products = [], isLoading } = useAdminListProducts();
  const { data: categories = [] } = useAdminListCategories();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const { data: admin } = useGetAdminMe({ query: { retry: false, staleTime: 30_000 } as any });
  const isLiveAdmin = Boolean((admin as any)?.role === "superadmin" || (admin as any)?.capabilities?.includes("*") || (admin as any)?.capabilities?.includes("content-approval"));

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useMenuState(false);
  const [exporting, setExporting] = useMenuState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const downloadExport = async (url: string, filename: string) => {
    setExporting(filename);
    setExportOpen(false);
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    } catch (e) { alert("Export failed. Please try again."); }
    finally { setExporting(null); }
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate({ id: deleteId }, {
      onSuccess: (result: any) => {
        queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        setDeleteId(null);
          setNotice(result?.pendingApproval
             ? "Deletion request submitted for an authorized reviewer."
            : "Product deleted successfully.");
      }
    });
  };

  const togglePlacement = (product: any, field: "isFeatured" | "isShowcase") => {
    updateProduct.mutate(
      { id: product.id, data: { [field]: !product[field] } },
        { onSuccess: (result: any) => {
           queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
            setNotice(result?.pendingApproval
               ? "Product change submitted for review."
              : "Product change saved and is now live.");
         } },
    );
  };

  const catMap: Record<number, string> = {};
  categories.forEach((c: any) => { catMap[c.id] = c.name; });

  const filtered = products.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.categoryId?.toString() === filterCat;
    return matchSearch && matchCat;
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every((p: any) => selectedIds.includes(p.id));
  const toggleSelected = (id: number) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const runBulkAction = async (action: string) => {
    if (!selectedIds.length) return;
    setBulkSaving(true);
    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      if (!response.ok) throw new Error("Bulk update failed");
      await queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      setSelectedIds([]);
       const result = await response.json().catch(() => ({}));
       setNotice(result?.pending
         ? "Bulk changes submitted for review."
         : "Bulk changes saved and are now live.");
    } catch {
      alert("Bulk update failed. Please try again.");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input type="search" placeholder="Search products..."
              className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="h-10 border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All categories</option>
            {categories.map((c: any) => <option key={c.id} value={c.id?.toString()}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(o => !o)}
              className="flex items-center gap-2 border border-border hover:bg-muted h-10 px-4 py-2 rounded-md font-medium text-sm"
            >
              <Download className="h-4 w-4" /> Export <ChevronDown className="h-3 w-3" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                {[
                  { label: "Download CSV", url: "/api/admin/export/products.csv", file: "products.csv" },
                  { label: "Download XML", url: "/api/admin/export/products.xml", file: "products.xml" },
                ].map(({ label, url, file }) => (
                  <button key={file}
                    onClick={() => downloadExport(url, file)}
                    disabled={exporting === file}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left disabled:opacity-50">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    {exporting === file ? "Downloading…" : label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setLocation("/products/new")}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm justify-center flex-shrink-0">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {notice && (
        <div role="status" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} className="font-bold text-amber-700 hover:text-amber-950" aria-label="Dismiss notice">×</button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <span className="mr-2 flex items-center gap-2 text-xs font-bold text-primary"><ListChecks className="h-4 w-4" /> {selectedIds.length} selected</span>
          {[
            ["activate", "Activate"], ["deactivate", "Deactivate"],
            ["feature", "Add Best Selling"], ["unfeature", "Remove Best Selling"],
            ["showcase", "Add Showcase"], ["unshowcase", "Remove Showcase"],
          ].map(([action, label]) => (
            <button key={action} disabled={bulkSaving} onClick={() => void runBulkAction(action)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50">
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-muted/20 border-b text-xs text-muted-foreground">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}{search || filterCat ? " (filtered)" : ""}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium w-[56px]">
                  <input type="checkbox" checked={allFilteredSelected}
                    onChange={() => setSelectedIds(allFilteredSelected ? [] : filtered.map((p: any) => p.id))}
                    aria-label="Select all filtered products" />
                </th>
                <th className="px-4 py-3 font-medium w-[56px]">Img</th>
                <th className="px-4 py-3 font-medium">Name / Slug</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-center">Best Selling</th>
                <th className="px-4 py-3 font-medium text-center">Showcase</th>
                <th className="px-4 py-3 font-medium text-center">Active</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading products...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No products found.</td></tr>
              ) : filtered.map((product: any) => (
                <tr key={product.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelected(product.id)}
                      aria-label={`Select ${product.name}`} />
                  </td>
                  <td className="px-4 py-3">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover border" />
                      : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border text-xs text-muted-foreground">—</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{product.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">/{product.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {product.categoryId ? catMap[product.categoryId] || "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                     <button type="button" onClick={() => togglePlacement(product, "isFeatured")} disabled={updateProduct.isPending}
                       title={product.isFeatured ? "Remove from Best Selling" : "Add to Best Selling"}
                       className="rounded-md p-1.5 transition-colors hover:bg-amber-50 disabled:opacity-50">
                       <Star className={`h-4 w-4 mx-auto ${product.isFeatured ? "fill-amber-400 text-amber-500" : "text-muted-foreground/30"}`} />
                     </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                     <button type="button" onClick={() => togglePlacement(product, "isShowcase")} disabled={updateProduct.isPending}
                       title={product.isShowcase ? "Remove from Product Showcase" : "Add to Product Showcase"}
                       className="rounded-md p-1.5 transition-colors hover:bg-primary/10 disabled:opacity-50">
                       <LayoutGrid className={`h-4 w-4 mx-auto ${product.isShowcase ? "text-primary" : "text-muted-foreground/30"}`} />
                     </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.isActive
                      ? <span className="inline-block w-2 h-2 rounded-full bg-green-500 mx-auto" />
                      : <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/${product.slug}`} target="_blank" rel="noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded hover:bg-muted">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button onClick={() => setLocation(`/products/${product.id}/edit`)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded hover:bg-muted">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(product.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
         description={isLiveAdmin ? "This product will be deleted immediately." : "This product will be held for an authorized reviewer before removal."}
         confirmText="Delete Product"
        isDanger={true}
      />
    </AdminLayout>
  );
}
