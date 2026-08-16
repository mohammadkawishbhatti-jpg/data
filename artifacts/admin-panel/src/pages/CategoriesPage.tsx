import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { 
  useAdminListCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory,
  useAdminListProducts,
  getAdminListCategoriesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Check, X, ExternalLink, Download } from "lucide-react";
import { Link } from "wouter";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useForm } from "react-hook-form";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useAdminListCategories();
  const { data: products = [] } = useAdminListProducts();
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const downloadExport = async (url: string, filename: string) => {
    setExporting(filename);
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

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      metaTitle: "",
      metaDescription: ""
    }
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value);
    if (!editingId) {
      setValue("slug", slugify(e.target.value), { shouldValidate: true });
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    reset({
      name: "", slug: "", description: "", 
      imageUrl: "", isActive: true, isFeatured: false,
      sortOrder: 0, metaTitle: "", metaDescription: ""
    });
    setModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingId(category.id);
    reset({
      ...category,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      isFeatured: category.isFeatured === true,
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
    });
    setModalOpen(true);
  };

  const onSubmit = handleSubmit((data) => {
    const payload = {
      ...data,
      sortOrder: Number(data.sortOrder),
    };

    if (editingId) {
      updateCategory.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
          setModalOpen(false);
        }
      });
    } else {
      createCategory.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
          setModalOpen(false);
        }
      });
    }
  });

  const confirmDelete = () => {
    if (deleteId) {
      deleteCategory.mutate({ id: deleteId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() });
          setDeleteId(null);
        }
      });
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );
  const selectedHomepageCategoryCount = categories.filter((category: any) => category.isFeatured).length;
  const toggleFeatured = (category: any) => {
    updateCategory.mutate(
      { id: category.id, data: { isFeatured: !category.isFeatured } as any },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() }) },
    );
  };

  return (
    <AdminLayout title="Categories">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input 
          type="search" 
          placeholder="Search categories..." 
          className="w-full sm:w-72 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${selectedHomepageCategoryCount >= 8 ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"}`}>
          {Math.min(selectedHomepageCategoryCount, 8)} / 8 homepage slots
        </span>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                const m = document.getElementById("cat-export-dd");
                if (m) m.classList.toggle("hidden");
              }}
              className="flex items-center gap-2 border border-border hover:bg-muted h-10 px-4 py-2 rounded-md font-medium text-sm"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <div id="cat-export-dd" className="hidden absolute right-0 mt-1 w-44 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden">
              {[
                { label: "Download CSV", url: "/api/admin/export/categories.csv", file: "categories.csv" },
                { label: "Download XML", url: "/api/admin/export/categories.xml", file: "categories.xml" },
              ].map(({ label, url, file }) => (
                <button key={file}
                  onClick={() => { document.getElementById("cat-export-dd")?.classList.add("hidden"); downloadExport(url, file); }}
                  disabled={exporting === file}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left disabled:opacity-50">
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  {exporting === file ? "Downloading…" : label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={openAddModal}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm justify-center">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium w-[60px]">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium text-center">Products</th>
                <th className="px-4 py-3 font-medium text-center">Featured</th>
                <th className="px-4 py-3 font-medium text-center">Active</th>
                <th className="px-4 py-3 font-medium text-center">Sort</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No categories found.</td></tr>
              ) : (
                filteredCategories.map(category => {
                  const productCount = products.filter(p => p.categoryId === category.id).length;
                  return (
                    <tr key={category.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.name} className="w-10 h-10 rounded object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border text-xs text-muted-foreground">No img</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{category.name}</div>
                        <div className="text-xs text-muted-foreground">{category.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-muted rounded-full">
                          {productCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(category)}
                          disabled={updateCategory.isPending || (!category.isFeatured && selectedHomepageCategoryCount >= 8)}
                          title={category.isFeatured ? "Remove from homepage Shop by Category" : "Add to homepage Shop by Category"}
                          className="rounded-md p-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {category.isFeatured
                            ? <Check className="h-4 w-4 text-green-600 mx-auto" />
                            : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {category.isActive ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{category.sortOrder}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/categories/${category.id}/edit`} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button onClick={() => setDeleteId(category.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Category" : "Add Category"}>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name *</label>
              <input {...register("name", { required: true })} onChange={handleNameChange} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Slug *</label>
              <input {...register("slug", { required: true })} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea {...register("description")} rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Image URL</label>
            <input {...register("imageUrl")} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>

          <div className="space-y-1.5 w-1/2">
            <label className="text-sm font-medium">Sort Order</label>
            <input type="number" {...register("sortOrder")} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Meta Title</label>
              <input {...register("metaTitle")} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Meta Description</label>
              <input {...register("metaDescription")} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" {...register("isActive")} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" {...register("isFeatured")} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
              Featured on homepage
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {editingId ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? Any associated products will be left uncategorized."
        isDanger={true}
        confirmText="Delete"
      />
    </AdminLayout>
  );
}
