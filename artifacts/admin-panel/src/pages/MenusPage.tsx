import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Modal } from "../components/ui/Modal";
import {
  getAdminGetMenuQueryKey,
  useAdminGetMenu,
  useAdminUpdateMenu,
  type MenuItem,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Menu as MenuIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  ArrowDown,
  ArrowUp,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";

type MenuForm = {
  label: string;
  href: string;
  parentId: string;
  group: string;
  order: number;
  isVisible: boolean;
  openInNewTab: boolean;
};

const emptyForm: MenuForm = {
  label: "",
  href: "",
  parentId: "",
  group: "",
  order: 10,
  isVisible: true,
  openInNewTab: false,
};

function resequence(items: MenuItem[]) {
  return items.map((item, index) => ({ ...item, order: (index + 1) * 10 }));
}

export default function MenusPage() {
  const queryClient = useQueryClient();
  const { data: menu, isLoading, isError } = useAdminGetMenu("primary");
  const updateMenu = useAdminUpdateMenu();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ products: true });
  const [saveMessage, setSaveMessage] = useState("");

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<MenuForm>({
    defaultValues: emptyForm,
  });

  useEffect(() => {
    if (menu) {
      setItems([...menu.items].sort((a, b) => a.order - b.order));
    }
  }, [menu]);

  const topLevelItems = useMemo(
    () => items.filter(item => !item.parentId).sort((a, b) => a.order - b.order),
    [items],
  );

  const topLevelOptions = topLevelItems.filter(item => item.id !== editingId);

  const childrenFor = (parentId: string) =>
    items.filter(item => item.parentId === parentId).sort((a, b) => a.order - b.order);

  const openAdd = (parentId = "") => {
    setEditingId(null);
    reset({
      ...emptyForm,
      parentId,
      order: parentId ? (childrenFor(parentId).length + 1) * 10 : (topLevelItems.length + 1) * 10,
    });
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    reset({
      label: item.label,
      href: item.href,
      parentId: item.parentId ?? "",
      group: item.group ?? "",
      order: item.order,
      isVisible: item.isVisible,
      openInNewTab: item.openInNewTab,
    });
    setModalOpen(true);
  };

  const onSubmit = handleSubmit((data) => {
    const updated: MenuItem = {
      id: editingId ?? `menu-item-${Date.now()}`,
      label: data.label.trim(),
      href: data.href.trim(),
      parentId: data.parentId || null,
      group: data.group.trim() || null,
      order: Number(data.order) || 10,
      isVisible: data.isVisible,
      openInNewTab: data.openInNewTab,
    };
    setItems(current => {
      const withoutCurrent = current.filter(item => item.id !== updated.id);
      return [...withoutCurrent, updated].sort((a, b) => a.order - b.order);
    });
    setModalOpen(false);
    setSaveMessage("Unsaved changes");
  });

  const removeItem = (id: string) => {
    const descendants = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of items) {
        if (item.parentId && descendants.has(item.parentId) && !descendants.has(item.id)) {
          descendants.add(item.id);
          changed = true;
        }
      }
    }
    setItems(current => current.filter(item => !descendants.has(item.id)));
    setSaveMessage("Unsaved changes");
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setItems(current => {
      const item = current.find(candidate => candidate.id === id);
      if (!item) return current;
      const siblings = current
        .filter(candidate => (candidate.parentId ?? null) === (item.parentId ?? null))
        .sort((a, b) => a.order - b.order);
      const index = siblings.findIndex(candidate => candidate.id === id);
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= siblings.length) return current;
      [siblings[index], siblings[targetIndex]] = [siblings[targetIndex], siblings[index]];
      const orders = new Map(resequence(siblings).map(candidate => [candidate.id, candidate.order]));
      setSaveMessage("Unsaved changes");
      return current.map(candidate => orders.has(candidate.id) ? { ...candidate, order: orders.get(candidate.id)! } : candidate);
    });
  };

  const saveMenu = () => {
    if (!menu) return;
    updateMenu.mutate({
      location: "primary",
      data: {
        name: menu.name || "Primary navigation",
        items: items.map((item, index) => ({ ...item, order: item.order || (index + 1) * 10 })),
        isActive: menu.isActive,
      },
    }, {
      onSuccess: (saved) => {
        setItems([...saved.items].sort((a, b) => a.order - b.order));
        setSaveMessage("Saved — the public header will use these changes now.");
        queryClient.invalidateQueries({ queryKey: getAdminGetMenuQueryKey("primary") });
      },
      onError: () => setSaveMessage("Could not save the menu. Please try again."),
    });
  };

  const renderItem = (item: MenuItem, depth = 0) => {
    const children = childrenFor(item.id);
    const isExpanded = expanded[item.id] !== false;
    return (
      <div key={item.id}>
        <div className={`group flex items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3 transition-colors hover:bg-slate-50 ${depth > 0 ? "ml-8 border-l-2 border-l-slate-200 bg-slate-50/70" : ""}`}>
          <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#112b4b]/[0.07] text-[#112b4b]">
            {children.length > 0 ? (
              <button type="button" onClick={() => setExpanded(current => ({ ...current, [item.id]: !isExpanded }))} aria-label={isExpanded ? "Collapse submenu" : "Expand submenu"}>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : <MenuIcon className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`truncate text-sm font-bold ${item.isVisible ? "text-slate-800" : "text-slate-400 line-through"}`}>{item.label}</span>
              {item.parentId && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">submenu</span>}
              {item.group && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">{item.group}</span>}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              <span className="truncate">{item.href}</span>
              {item.openInNewTab && <ExternalLink className="h-3 w-3 shrink-0" />}
            </div>
          </div>
          <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 sm:inline-flex">#{item.order}</span>
          {item.isVisible ? <Eye className="hidden h-4 w-4 text-emerald-500 sm:block" /> : <EyeOff className="hidden h-4 w-4 text-slate-300 sm:block" />}
          <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
            <button type="button" onClick={() => moveItem(item.id, -1)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800" title="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => moveItem(item.id, 1)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800" title="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
            {!item.parentId && <button type="button" onClick={() => openAdd(item.id)} className="rounded p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" title="Add submenu item"><Plus className="h-3.5 w-3.5" /></button>}
            <button type="button" onClick={() => openEdit(item)} className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit menu item"><Pencil className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => removeItem(item.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Remove menu item"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        {isExpanded && children.map(child => renderItem(child, depth + 1))}
      </div>
    );
  };

  return (
    <AdminLayout title="Menus">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-600">
            <MenuIcon className="h-3.5 w-3.5" /> WordPress-style navigation
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Menu Manager</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Add, remove, rename, reorder and nest links in the public header. Changes are saved to the primary menu and appear after the next refresh.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => openAdd()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-muted">
            <Plus className="h-4 w-4" /> Add menu item
          </button>
          <button type="button" onClick={saveMenu} disabled={!menu || updateMenu.isPending || saveMessage.startsWith("Saved")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50">
            <Save className="h-4 w-4" /> {updateMenu.isPending ? "Saving..." : "Save Menu"}
          </button>
        </div>
      </div>

      {saveMessage && <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${saveMessage.startsWith("Could") ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"}`}>{saveMessage}</div>}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
          <div>
            <h2 className="font-extrabold text-foreground">{menu?.name || "Primary navigation"}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Header menu · {items.length} item{items.length === 1 ? "" : "s"}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">Live location: primary</span>
        </div>
        {isLoading ? (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">Loading menu…</div>
        ) : isError ? (
          <div className="px-5 py-16 text-center text-sm text-red-600">Could not load the menu. Check your admin session and try again.</div>
        ) : topLevelItems.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">No menu items yet. Add your first link.</div>
        ) : topLevelItems.map(item => renderItem(item))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit menu item" : "Add menu item"} wide>
        <form onSubmit={onSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Navigation label *</label>
              <input {...register("label", { required: true })} placeholder="e.g. Services" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Link URL *</label>
              <input {...register("href", { required: true })} placeholder="/services or https://example.com" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Parent menu</label>
              <select {...register("parentId")} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-rose-400">
                <option value="">Top-level menu</option>
                {topLevelOptions.map(parent => <option key={parent.id} value={parent.id}>{parent.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Mega-menu group</label>
              <input {...register("group")} placeholder="e.g. By industry" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Order</label>
              <input type="number" {...register("order", { valueAsNumber: true })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" {...register("isVisible")} className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500" /> Visible on site</label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" {...register("openInNewTab")} className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500" /> Open in new tab</label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /> Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-extrabold text-white hover:bg-rose-600 disabled:opacity-50">{editingId ? "Update item" : "Add item"}</button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}