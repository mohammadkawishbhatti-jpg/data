import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  useAdminListProducts,
  useDeleteProduct,
  useAdminListCategories,
  getAdminListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Edit, Trash2, Check, X, Search, ExternalLink } from "lucide-react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: products = [], isLoading } = useAdminListProducts();
  const { data: categories = [] } = useAdminListCategories();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        setDeleteId(null);
      }
    });
  };

  const catMap: Record<number, string> = {};
  categories.forEach((c: any) => { catMap[c.id] = c.name; });

  const filtered = products.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.categoryId?.toString() === filterCat;
    return matchSearch && matchCat;
  });

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
        <button onClick={() => setLocation("/products/new")}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm w-full sm:w-auto justify-center flex-shrink-0">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-muted/20 border-b text-xs text-muted-foreground">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}{search || filterCat ? " (filtered)" : ""}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium w-[56px]">Img</th>
                <th className="px-4 py-3 font-medium">Name / Slug</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-center">Featured</th>
                <th className="px-4 py-3 font-medium text-center">Active</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading products...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No products found.</td></tr>
              ) : filtered.map((product: any) => (
                <tr key={product.id} className="hover:bg-muted/5 transition-colors">
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
                    {product.isFeatured
                      ? <Check className="h-4 w-4 text-green-600 mx-auto" />
                      : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
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
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
    </AdminLayout>
  );
}
