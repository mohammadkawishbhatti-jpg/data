import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { 
  useAdminListBlogPosts, 
  useDeleteBlogPost,
  getAdminListBlogPostsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { format } from "date-fns";
import { StatusBadge } from "../components/ui/StatusBadge";

export default function BlogPage() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useAdminListBlogPosts();
  const deletePost = useDeleteBlogPost();

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const confirmDelete = () => {
    if (!deleteId) return;
    deletePost.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListBlogPostsQueryKey() });
        setDeleteId(null);
      }
    });
  };

  const filtered = posts.filter((p: any) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const published = posts.filter((p: any) => p.status === "published").length;
  const drafts = posts.filter((p: any) => p.status === "draft").length;

  return (
    <AdminLayout title="Blog Posts">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "All Posts", count: posts.length, key: "all" },
          { label: "Published", count: published, key: "published" },
          { label: "Drafts", count: drafts, key: "draft" },
        ].map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`text-left p-4 rounded-xl border shadow-sm transition-all ${statusFilter === s.key ? "border-primary bg-primary/5" : "bg-card hover:border-primary/50"}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <input type="search" placeholder="Search posts..." className="w-full sm:w-72 h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={search} onChange={e => setSearch(e.target.value)} />
        <Link href="/blog/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 rounded-md font-medium text-sm w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" /> Add New Post
        </Link>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
              <tr>
                <th className="px-4 py-3 font-medium w-12"></th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No posts found.</td></tr>
              ) : filtered.map((post: any) => (
                <tr key={post.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground text-xs">📝</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{post.title}</div>
                    <div className="text-xs text-muted-foreground">{post.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{post.author || "-"}</td>
                  <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {post.createdAt ? format(new Date(post.createdAt), "MMM d, yyyy") : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {post.status === "published" && (
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded" title="View">
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                      <Link href={`/blog/${post.id}/edit`}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => setDeleteId(post.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded" title="Delete">
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
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        isDanger
      />
    </AdminLayout>
  );
}
