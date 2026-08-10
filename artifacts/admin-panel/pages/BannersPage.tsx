import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { 
  useAdminListBanners, 
  useCreateBanner, 
  useUpdateBanner, 
  useDeleteBanner,
  getAdminListBannersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useForm } from "react-hook-form";

export default function BannersPage() {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useAdminListBanners();
  
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      linkText: "",
      isActive: true,
      sortOrder: 0
    }
  });

  const openAddModal = () => {
    setEditingId(null);
    reset({
      title: "", subtitle: "", imageUrl: "", 
      linkUrl: "", linkText: "", isActive: true, sortOrder: 0
    });
    setModalOpen(true);
  };

  const openEditModal = (banner: any) => {
    setEditingId(banner.id);
    reset({
      ...banner,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      linkText: banner.linkText || "",
    });
    setModalOpen(true);
  };

  const onSubmit = handleSubmit((data) => {
    const payload = {
      ...data,
      sortOrder: Number(data.sortOrder),
    };

    if (editingId) {
      updateBanner.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListBannersQueryKey() });
          setModalOpen(false);
        }
      });
    } else {
      createBanner.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListBannersQueryKey() });
          setModalOpen(false);
        }
      });
    }
  });

  const confirmDelete = () => {
    if (deleteId) {
      deleteBanner.mutate({ id: deleteId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListBannersQueryKey() });
          setDeleteId(null);
        }
      });
    }
  };

  return (
    <AdminLayout title="Banners">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium tracking-tight">Manage Homepage Banners</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium w-[120px]">Image</th>
                <th className="px-4 py-3 font-medium">Title & Subtitle</th>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3 font-medium text-center">Active</th>
                <th className="px-4 py-3 font-medium text-center">Sort</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No banners found.</td></tr>
              ) : (
                banners.map(banner => (
                  <tr key={banner.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={banner.title} className="w-24 h-12 rounded object-cover border" />
                      ) : (
                        <div className="w-24 h-12 rounded bg-muted flex items-center justify-center border text-xs text-muted-foreground">No img</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{banner.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{banner.subtitle}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {banner.link ? (
                        <div className="truncate max-w-[150px]">{banner.link}</div>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {banner.isActive ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{banner.sortOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(banner)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(banner.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Banner" : "Add Banner"}>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title *</label>
            <input {...register("title", { required: true })} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Subtitle</label>
            <input {...register("subtitle")} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Image URL *</label>
            <input {...register("imageUrl", { required: true })} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Link URL</label>
              <input {...register("linkUrl")} placeholder="/products/example" className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Link Text</label>
              <input {...register("linkText")} placeholder="Shop Now" className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
          </div>

          <div className="space-y-1.5 w-1/2">
            <label className="text-sm font-medium">Sort Order</label>
            <input type="number" {...register("sortOrder")} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" {...register("isActive")} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {editingId ? "Save Changes" : "Create Banner"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        title="Delete Banner"
        description="Are you sure you want to delete this banner?"
        isDanger={true}
        confirmText="Delete"
      />
    </AdminLayout>
  );
}
