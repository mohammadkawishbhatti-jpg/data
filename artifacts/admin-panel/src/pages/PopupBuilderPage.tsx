/**
 * Popup Builder — Create, manage and configure popups
 * Types: Modal, Slide-in, Notification Bar, Full Screen
 */
import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Plus, Trash2, Edit2, Eye, EyeOff, Copy, X, Save, Loader2 } from "lucide-react";

interface Popup {
  id: string;
  name: string;
  type: "modal" | "slide-in" | "notification-bar" | "full-screen";
  status: "active" | "inactive" | "draft";
  trigger: "time" | "scroll" | "exit-intent" | "click" | "pageload";
  triggerValue?: number;
  // Content
  heading: string;
  subtext: string;
  buttonText: string;
  buttonLink: string;
  bgColor: string;
  textColor: string;
  // Display
  position?: string;
  width?: number;
  overlay?: boolean;
  showClose?: boolean;
  delay?: number;
  frequency?: string;
  // Targeting
  pages?: string[];
  devices?: string[];
}

const uid = () => Math.random().toString(36).slice(2, 9);

const POPUP_TYPES: { value: Popup["type"]; label: string; icon: string; desc: string }[] = [
  { value: "modal",            label: "Modal",            icon: "⬜", desc: "Center-screen overlay dialog" },
  { value: "slide-in",         label: "Slide In",         icon: "◁",  desc: "Slides in from corner" },
  { value: "notification-bar", label: "Notification Bar", icon: "▬",  desc: "Full-width top/bottom bar" },
  { value: "full-screen",      label: "Full Screen",      icon: "⛶",  desc: "Takes over entire viewport" },
];

const DEFAULT_POPUP: Omit<Popup, "id"> = {
  name: "New Popup",
  type: "modal",
  status: "draft",
  trigger: "time",
  triggerValue: 5,
  heading: "🎁 Special Offer Just for You!",
  subtext: "Get 10% off your first custom packaging order. Use code FIRST10 at checkout.",
  buttonText: "Claim My Discount",
  buttonLink: "/get-quote",
  bgColor: "#1a2f5a",
  textColor: "#ffffff",
  position: "center",
  width: 500,
  overlay: true,
  showClose: true,
  delay: 5,
  frequency: "once",
  pages: ["all"],
  devices: ["desktop", "mobile"],
};

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]/30";
const sel = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]/30";

function PopupPreview({ popup }: { popup: Popup }) {
  if (popup.type === "notification-bar") {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-medium" style={{ background: popup.bgColor, color: popup.textColor }}>
          <span>{popup.heading}</span>
          <div className="flex items-center gap-3">
            <button className="underline text-xs" style={{ color: popup.textColor + "cc" }}>{popup.buttonText}</button>
            {popup.showClose && <span className="text-xs opacity-60">✕</span>}
          </div>
        </div>
      </div>
    );
  }

  if (popup.type === "slide-in") {
    return (
      <div className="flex justify-end">
        <div className="w-48 rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ background: popup.bgColor }}>
          <div className="p-4">
            <div className="font-bold text-sm mb-1" style={{ color: popup.textColor }}>{popup.heading}</div>
            <div className="text-xs opacity-70 mb-3" style={{ color: popup.textColor }}>{popup.subtext}</div>
            <button className="w-full py-1.5 bg-[#e63329] text-white text-xs font-bold rounded-lg">{popup.buttonText}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto rounded-xl shadow-xl overflow-hidden`} style={{ maxWidth: popup.type === "full-screen" ? "100%" : 320, background: popup.bgColor }}>
      {popup.showClose && <div className="flex justify-end p-2"><span className="text-xs opacity-50 cursor-pointer" style={{ color: popup.textColor }}>✕ Close</span></div>}
      <div className="px-6 pb-6 text-center">
        <div className="font-extrabold text-base mb-2" style={{ color: popup.textColor }}>{popup.heading}</div>
        <div className="text-xs opacity-75 mb-4 leading-relaxed" style={{ color: popup.textColor }}>{popup.subtext}</div>
        <button className="px-5 py-2 bg-[#e63329] text-white text-xs font-bold rounded-lg w-full">{popup.buttonText}</button>
      </div>
    </div>
  );
}

export default function PopupBuilderPage() {
  const [popups, setPopups] = useState<Popup[]>([
    {
      id: uid(),
      ...DEFAULT_POPUP,
      name: "Welcome Discount Popup",
      status: "draft",
      trigger: "time",
      triggerValue: 5,
    },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<Popup, "id"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const editPopup = popups.find(p => p.id === editingId);

  const openEditor = (popup: Popup) => {
    setEditingId(popup.id);
    setEditData({ ...popup });
  };

  const closeEditor = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editData) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setPopups(ps => ps.map(p => p.id === editingId ? { ...p, ...editData } : p));
    setSaving(false);
    closeEditor();
  };

  const addPopup = () => {
    const np: Popup = { id: uid(), ...DEFAULT_POPUP, name: "New Popup", status: "draft" };
    setPopups(ps => [...ps, np]);
    openEditor(np);
  };

  const deletePopup = (id: string) => {
    if (!confirm("Delete this popup?")) return;
    setPopups(ps => ps.filter(p => p.id !== id));
  };

  const toggleStatus = (id: string) => {
    setPopups(ps => ps.map(p => p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p));
  };

  const duplicatePopup = (popup: Popup) => {
    setPopups(ps => [...ps, { ...popup, id: uid(), name: popup.name + " (Copy)", status: "draft" }]);
  };

  const set = (key: string, val: any) => setEditData(d => d ? { ...d, [key]: val } : d);

  const STATUS_COLORS: Record<Popup["status"], string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-500",
    draft: "bg-yellow-100 text-yellow-700",
  };

  return (
    <AdminLayout title="Popup Builder">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Popup Builder</h1>
            <p className="text-sm text-gray-500 mt-1">Create targeted popups to boost conversions and capture leads.</p>
          </div>
          <button onClick={addPopup}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2f5a] text-white text-sm font-bold rounded-lg hover:bg-[#24407a]">
            <Plus className="h-4 w-4" /> New Popup
          </button>
        </div>

        {/* Popup types info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {POPUP_TYPES.map(t => (
            <div key={t.value} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-xs font-bold text-gray-700">{t.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Popup list */}
        {popups.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-semibold text-gray-500 mb-2">No popups yet</div>
            <div className="text-sm text-gray-400 mb-4">Create your first popup to start capturing leads and boosting conversions.</div>
            <button onClick={addPopup} className="px-5 py-2 bg-[#1a2f5a] text-white text-sm font-bold rounded-lg">
              Create First Popup
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {popups.map(popup => (
              <div key={popup.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                {/* Type icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-50 border border-gray-200 flex-shrink-0">
                  {POPUP_TYPES.find(t => t.value === popup.type)?.icon || "⬜"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900 text-sm">{popup.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[popup.status]}`}>
                      {popup.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-3">
                    <span className="capitalize">{popup.type.replace("-", " ")}</span>
                    <span>•</span>
                    <span>Trigger: {popup.trigger === "time" ? `${popup.triggerValue}s delay` : popup.trigger.replace("-", " ")}</span>
                    <span>•</span>
                    <span>{popup.frequency || "once"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button onClick={() => { openEditor(popup); setPreviewOpen(true); }}
                    title="Preview"
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => toggleStatus(popup.id)}
                    title={popup.status === "active" ? "Deactivate" : "Activate"}
                    className={`p-2 rounded-lg transition-colors ${popup.status === "active" ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                    {popup.status === "active" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => duplicatePopup(popup)}
                    title="Duplicate"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEditor(popup)}
                    title="Edit"
                    className="p-2 text-gray-400 hover:text-[#1a2f5a] hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deletePopup(popup.id)}
                    title="Delete"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Editor Modal ── */}
        {editingId && editData && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={closeEditor} />
            <div className="relative ml-auto w-full max-w-5xl bg-white flex flex-col shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#1a2f5a]">
                <div className="flex items-center gap-3">
                  <h2 className="text-white font-bold">Edit Popup</h2>
                  <input value={editData.name} onChange={e => set("name", e.target.value)}
                    className="bg-white/10 border border-white/20 text-white text-sm rounded px-3 py-1 focus:outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#e63329] text-white text-sm font-bold rounded-lg">
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                  </button>
                  <button onClick={closeEditor} className="text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex">
                {/* Left: Settings */}
                <div className="w-80 border-r border-gray-200 overflow-y-auto p-5 space-y-5">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Popup Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {POPUP_TYPES.map(t => (
                        <button key={t.value} onClick={() => set("type", t.value)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${editData.type === t.value ? "border-[#1a2f5a] bg-[#1a2f5a]/5 text-[#1a2f5a]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                          <span>{t.icon}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content</label>
                    <div className="space-y-3">
                      <div><label className="text-xs text-gray-600 mb-1 block">Heading</label><input value={editData.heading} onChange={e => set("heading", e.target.value)} className={inp} /></div>
                      <div><label className="text-xs text-gray-600 mb-1 block">Subtext</label><textarea value={editData.subtext} onChange={e => set("subtext", e.target.value)} rows={3} className={inp} /></div>
                      <div><label className="text-xs text-gray-600 mb-1 block">Button Text</label><input value={editData.buttonText} onChange={e => set("buttonText", e.target.value)} className={inp} /></div>
                      <div><label className="text-xs text-gray-600 mb-1 block">Button Link</label><input value={editData.buttonLink} onChange={e => set("buttonLink", e.target.value)} className={inp} /></div>
                    </div>
                  </div>

                  {/* Appearance */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Appearance</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Background</label>
                          <input type="color" value={editData.bgColor} onChange={e => set("bgColor", e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Text Color</label>
                          <input type="color" value={editData.textColor} onChange={e => set("textColor", e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trigger */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Trigger</label>
                    <div className="space-y-2">
                      <select value={editData.trigger} onChange={e => set("trigger", e.target.value)} className={sel}>
                        <option value="pageload">Page Load</option>
                        <option value="time">After Delay</option>
                        <option value="scroll">On Scroll</option>
                        <option value="exit-intent">Exit Intent</option>
                        <option value="click">On Click</option>
                      </select>
                      {editData.trigger === "time" && (
                        <div className="flex items-center gap-2">
                          <input type="number" value={editData.triggerValue || 5} onChange={e => set("triggerValue", +e.target.value)} className={inp + " w-20"} min={0} />
                          <span className="text-xs text-gray-500">seconds delay</span>
                        </div>
                      )}
                      {editData.trigger === "scroll" && (
                        <div className="flex items-center gap-2">
                          <input type="number" value={editData.triggerValue || 30} onChange={e => set("triggerValue", +e.target.value)} className={inp + " w-20"} min={0} max={100} />
                          <span className="text-xs text-gray-500">% scrolled</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Frequency</label>
                    <select value={editData.frequency || "once"} onChange={e => set("frequency", e.target.value)} className={sel}>
                      <option value="always">Always (every visit)</option>
                      <option value="once">Once per user</option>
                      <option value="session">Once per session</option>
                      <option value="daily">Once per day</option>
                      <option value="weekly">Once per week</option>
                    </select>
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Options</label>
                    <div className="space-y-2">
                      {[["overlay", "Show Overlay"], ["showClose", "Show Close Button"]].map(([k, l]) => (
                        <label key={k} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={!!(editData as any)[k]} onChange={e => set(k, e.target.checked)} className="rounded" />
                          <span className="text-xs text-gray-700">{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="flex-1 flex flex-col bg-gray-50">
                  <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Live Preview</span>
                    <span className="text-xs text-gray-400 ml-2">This is how it'll appear to visitors</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                      <PopupPreview popup={{ ...editData, id: editingId! }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
