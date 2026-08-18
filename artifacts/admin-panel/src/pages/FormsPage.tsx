import { useEffect, useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { ClipboardList, Loader2, Plus, Save, Trash2 } from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";
type FormField = { key: string; label: string; type: string; required: boolean };
type CustomForm = { id?: number; name: string; slug: string; description?: string; active: boolean; fields: FormField[] };
const emptyForm = (): CustomForm => ({ name: "", slug: "", description: "", active: true, fields: [{ key: "name", label: "Name", type: "text", required: true }, { key: "email", label: "Email", type: "email", required: true }] });

export default function FormsPage() {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [form, setForm] = useState<CustomForm>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/admin/forms`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load forms");
      setForms(await response.json());
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load forms"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    setSaving(true); setError("");
    try {
      const response = await fetch(`${API}/admin/forms${form.id ? `/${form.id}` : ""}`, {
        method: form.id ? "PATCH" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save form");
      setForm(result); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save form"); }
    finally { setSaving(false); }
  };

  const updateField = (index: number, patch: Partial<FormField>) => setForm(current => ({ ...current, fields: current.fields.map((item, i) => i === index ? { ...item, ...patch } : item) }));

  return (
    <AdminLayout title="Form Builder">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Form Builder</h1><p className="text-sm text-muted-foreground mt-1">Create reusable forms with durable submissions. Render a form at <code>/api/forms/your-slug/submissions</code>.</p></div>
        <ClipboardList className="h-8 w-8 text-primary" />
      </div>
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="rounded-xl border bg-card p-4">
          <button onClick={() => setForm(emptyForm())} className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"><Plus className="h-4 w-4" /> New form</button>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : forms.length === 0 ? <p className="text-sm text-muted-foreground">No saved forms yet.</p> : <div className="space-y-2">{forms.map(item => <button key={item.id} onClick={() => setForm(item)} className={`w-full rounded-lg border p-3 text-left hover:bg-muted ${form.id === item.id ? "border-primary bg-primary/5" : ""}`}><p className="font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">/{item.slug} · {item.fields.length} fields</p></button>)}</div>}
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">Form name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border p-2.5 font-normal" /></label>
            <label className="text-sm font-semibold">Slug<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className="mt-1 w-full rounded-lg border p-2.5 font-normal" /></label>
          </div>
          <label className="text-sm font-semibold">Description<textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border p-2.5 font-normal" /></label>
          <div className="flex items-center justify-between"><h2 className="font-bold">Fields</h2><button onClick={() => setForm(current => ({ ...current, fields: [...current.fields, { key: `field_${current.fields.length + 1}`, label: "New field", type: "text", required: false }] }))} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"><Plus className="h-4 w-4" /> Add field</button></div>
          <div className="space-y-3">{form.fields.map((item, index) => <div key={index} className="grid gap-2 md:grid-cols-[1fr_1.4fr_150px_90px_36px] items-end rounded-lg border p-3">
            <label className="text-xs font-semibold">Key<input value={item.key} onChange={e => updateField(index, { key: e.target.value })} className="mt-1 w-full rounded border p-2 text-sm font-normal" /></label>
            <label className="text-xs font-semibold">Label<input value={item.label} onChange={e => updateField(index, { label: e.target.value })} className="mt-1 w-full rounded border p-2 text-sm font-normal" /></label>
            <label className="text-xs font-semibold">Type<select value={item.type} onChange={e => updateField(index, { type: e.target.value })} className="mt-1 w-full rounded border p-2 text-sm font-normal"><option>text</option><option>email</option><option>tel</option><option>textarea</option><option>select</option><option>checkbox</option></select></label>
            <label className="flex items-center gap-2 pb-2 text-xs font-semibold"><input type="checkbox" checked={item.required} onChange={e => updateField(index, { required: e.target.checked })} /> Required</label>
            <button onClick={() => setForm(current => ({ ...current, fields: current.fields.filter((_, i) => i !== index) }))} aria-label={`Remove ${item.label}`} className="mb-1 rounded p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>)}</div>
          <div className="flex items-center gap-3"><button onClick={() => void save()} disabled={saving || !form.name || !form.slug} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save form</button><label className="text-sm"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="mr-2" /> Active</label></div>
        </div>
      </div>
    </AdminLayout>
  );
}