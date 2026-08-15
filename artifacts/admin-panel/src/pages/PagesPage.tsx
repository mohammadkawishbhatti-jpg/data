import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { 
  useAdminListPages, 
  useCreatePage, 
  useUpdatePage, 
  getAdminListPagesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ExternalLink, Layout as LayoutIcon } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

const slugify = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

/** Maps DB slugs → actual live URLs (some differ from slug due to SmartPage routing) */
const SLUG_TO_URL: Record<string, string> = {
  'about-us':               '/about',
  'contact-us':             '/contact',
  'delivery-policy':        '/delivery-policy',
  'refund-return-policy':   '/refund-return-policy',
  'privacy-policy':         '/privacy-policy',
  'terms-and-conditions':   '/terms-and-conditions',
  'faq':                    '/faq',
  'disclaimer':             '/disclaimer',
  'request-sample':         '/request-sample',
  'returns-claims-support': '/returns-claims-support',
  'sitemap':                '/sitemap',
  'get-quote':              '/get-quote',
};
const pageUrl = (slug: string) => SLUG_TO_URL[slug] ?? `/pages/${slug}`;

export default function PagesPage() {
  const queryClient = useQueryClient();
  const { data: pages = [], isLoading } = useAdminListPages();
  
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = {
    mutate: async ({ id }: { id: number }, opts?: any) => {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/admin$/, "");
      await fetch(`${base}/api/admin/pages/${id}`, { method: "DELETE", credentials: "include" });
      opts?.onSuccess?.();
    }
  };

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { title: "", slug: "", isPublished: true, metaTitle: "", metaDescription: "" }
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value);
    if (!editingId) setValue("slug", slugify(e.target.value), { shouldValidate: true });
  };

  const openAddModal = () => {
    setEditingId(null);
    reset({ title: "", slug: "", isPublished: true, metaTitle: "", metaDescription: "" });
    setModalOpen(true);
  };

  const openEditModal = (page: any) => {
    setEditingId(page.id);
    reset({
      title: page.title || "",
      slug: page.slug || "",
      isPublished: page.isPublished !== false,
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
    });
    setModalOpen(true);
  };

  const onSubmit = handleSubmit((data) => {
    if (editingId) {
      updatePage.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListPagesQueryKey() });
          setModalOpen(false);
        }
      });
    } else {
      createPage.mutate({ data }, {
        onSuccess: (newPage: any) => {
          queryClient.invalidateQueries({ queryKey: getAdminListPagesQueryKey() });
          setModalOpen(false);
        }
      });
    }
  });

  const handleDelete = () => {
    if (!deleteId) return;
    deletePage.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPagesQueryKey() });
        setDeleteId(null);
      }
    });
  };

  const filtered = pages.filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Pages">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="search"
          placeholder="Search pages..."
          className="w-full sm:w-72 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" /> Add Page
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Title & Slug</th>
                <th className="px-4 py-3 font-medium text-center">Published</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No pages found.</td></tr>
              ) : filtered.map((page: any) => (
                <tr key={page.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <LayoutIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">{page.title}</div>
                        <div className="text-xs text-muted-foreground">/{page.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {page.isPublished
                      ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">Published</span>
                      : <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">Draft</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(page.updatedAt || new Date()), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={pageUrl(page.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-primary rounded hover:bg-muted"
                        title={`View live page: ${pageUrl(page.slug)}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => openEditModal(page)}
                        title="Page settings"
                        className="p-1.5 text-muted-foreground hover:text-primary rounded hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(page.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 rounded hover:bg-red-50"
                        title="Delete page"
                      >
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

      {/* Page settings modal (title, slug, SEO, publish) */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Page Settings" : "New Page"} wide>
        <form onSubmit={onSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <input
                {...register("title", { required: true })}
                onChange={handleTitleChange}
                className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Slug *</label>
              <input
                {...register("slug", { required: true })}
                className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SEO Title</label>
              <input
                {...register("metaTitle")}
                placeholder="SEO page title..."
                className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">SEO Description</label>
              <input
                {...register("metaDescription")}
                placeholder="SEO meta description..."
                className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              {...register("isPublished")}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            Published
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {editingId ? "Save Settings" : "Create Page"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Page"
        description="Are you sure you want to delete this page? This cannot be undone."
        confirmText="Delete"
        isDanger
      />
    </AdminLayout>
  );
}
