import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Users, ShieldCheck, Edit3 } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useForm } from "react-hook-form";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/admin$/, "");
const api = (path: string, opts?: RequestInit) =>
  fetch(`${API_BASE}/api${path}`, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });

interface AdminUser { id: number; username: string; email: string; role: string; created_at: string; }

function useAdminUsers() {
  return useQuery<AdminUser[]>({ queryKey: ["admin-users"], queryFn: async () => { const r = await api("/admin/users"); if (!r.ok) throw new Error("Failed"); return r.json(); } });
}
function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (data: any) => { const r = await api("/admin/users", { method: "POST", body: JSON.stringify(data) }); if (!r.ok) { const e = await r.json(); throw new Error(e.error || "Failed"); } return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }) });
}
function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (id: number) => { const r = await api(`/admin/users/${id}`, { method: "DELETE" }); if (!r.ok) throw new Error("Failed"); return r.json(); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }) });
}

const ROLE_BADGE: Record<string, string> = {
  administrator: "bg-red-100 text-red-800 border-red-200",
  editor: "bg-blue-100 text-blue-800 border-blue-200",
  author: "bg-green-100 text-green-800 border-green-200",
};

export default function UsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { username: "", email: "", role: "editor", password: "", confirm: "" }
  });

  const onSubmit = handleSubmit(async (data: any) => {
    setError("");
    if (data.password !== data.confirm) { setError("Passwords do not match"); return; }
    try {
      await createUser.mutateAsync({ username: data.username, email: data.email, role: data.role, password: data.password });
      setModalOpen(false);
      reset();
    } catch (e: any) { setError(e.message || "Failed to create user"); }
  });

  return (
    <AdminLayout title="Users">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">{users.length} user{users.length !== 1 ? "s" : ""}</span>
        </div>
        <button onClick={() => { setError(""); reset(); setModalOpen(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" /> Add New User
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/10 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No users found.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-muted/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{u.username}</div>
                      {u.username === "admin" && <div className="text-xs text-muted-foreground">Super Admin</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_BADGE[u.role] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    <ShieldCheck className="h-3 w-3" /> {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.username !== "admin" && (
                    <button onClick={() => setDeleteId(u.id)} className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New User">
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium">Username *</label>
              <input {...register("username", { required: true })} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium">Email</label>
              <input type="email" {...register("email")} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium">Password *</label>
              <input type="password" {...register("password", { required: true, minLength: 6 })} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium">Confirm Password *</label>
              <input type="password" {...register("confirm", { required: true })} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-medium">Role</label>
              <select {...register("role")} className="w-full h-9 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="editor">Editor — can manage products, categories, blog</option>
                <option value="author">Author — can manage blog only</option>
                <option value="administrator">Administrator — full access</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              Create User
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => { deleteUser.mutate(deleteId!); setDeleteId(null); }}
        title="Delete User" description="Are you sure you want to delete this user? This cannot be undone." confirmText="Delete" isDanger={true} />
    </AdminLayout>
  );
}
