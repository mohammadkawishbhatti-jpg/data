/**
 * Global Styles — Design System for the entire site
 * Colors, Typography, Spacing, Buttons, Forms
 */
import { useState, useEffect } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Palette, Type, Sliders, Save, Loader2, RotateCcw, Check } from "lucide-react";

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

const DEFAULT_STYLES = {
  // Brand Colors
  colorPrimary:   "#1a2f5a",
  colorSecondary: "#e63329",
  colorAccent:    "#f5c518",
  colorBg:        "#ffffff",
  colorText:      "#374151",
  colorMuted:     "#9ca3af",
  colorBorder:    "#e2e8f0",
  colorSuccess:   "#22c55e",
  colorWarning:   "#f59e0b",
  colorDanger:    "#ef4444",
  // Typography
  fontHeading:    "Inter, sans-serif",
  fontBody:       "Inter, sans-serif",
  fontMono:       "JetBrains Mono, monospace",
  sizeBase:       16,
  sizeH1:         48,
  sizeH2:         36,
  sizeH3:         24,
  sizeH4:         20,
  sizeSmall:      14,
  lineHeight:     1.6,
  fontWeightBold: 700,
  // Spacing
  spacingXs:      4,
  spacingSm:      8,
  spacingMd:      16,
  spacingLg:      32,
  spacingXl:      64,
  // Layout
  containerMax:   1200,
  borderRadius:   8,
  borderRadiusLg: 16,
  // Buttons
  btnPrimaryBg:   "#e63329",
  btnPrimaryText: "#ffffff",
  btnSecBg:       "#1a2f5a",
  btnSecText:     "#ffffff",
  btnBorderRadius:8,
  btnPaddingX:    24,
  btnPaddingY:    12,
  // Shadows
  shadowSm:       "0 1px 3px rgba(0,0,0,0.1)",
  shadowMd:       "0 4px 12px rgba(0,0,0,0.1)",
  shadowLg:       "0 8px 30px rgba(0,0,0,0.15)",
};

type Styles = typeof DEFAULT_STYLES;

const FONT_OPTIONS = [
  "Inter, sans-serif",
  "Roboto, sans-serif",
  "Open Sans, sans-serif",
  "Lato, sans-serif",
  "Poppins, sans-serif",
  "Montserrat, sans-serif",
  "Raleway, sans-serif",
  "Playfair Display, serif",
  "Merriweather, serif",
  "Georgia, serif",
  "JetBrains Mono, monospace",
  "Fira Code, monospace",
];

function ColorSwatch({ label, valueKey, styles, onChange }: { label: string; valueKey: keyof Styles; styles: Styles; onChange: (k: keyof Styles, v: any) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <input
          type="color"
          value={styles[valueKey] as string}
          onChange={e => onChange(valueKey, e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-700 mb-0.5">{label}</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={styles[valueKey] as string}
            onChange={e => onChange(valueKey, e.target.value)}
            className="w-28 text-xs font-mono border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]/30"
          />
          <div className="w-6 h-6 rounded border border-gray-200 flex-shrink-0" style={{ background: styles[valueKey] as string }} />
        </div>
      </div>
    </div>
  );
}

function NumField({ label, valueKey, styles, onChange, unit = "px", min = 0, max = 200 }: {
  label: string; valueKey: keyof Styles; styles: Styles; onChange: (k: keyof Styles, v: any) => void; unit?: string; min?: number; max?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range" min={min} max={max}
          value={styles[valueKey] as number}
          onChange={e => onChange(valueKey, +e.target.value)}
          className="flex-1"
        />
        <div className="text-xs font-bold text-gray-700 w-16 text-right">
          {styles[valueKey]}{unit}
        </div>
      </div>
    </div>
  );
}

export default function GlobalStylesPage() {
  const [styles, setStyles] = useState<Styles>(DEFAULT_STYLES);
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "spacing" | "components">("colors");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/settings`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.globalStyles) {
          try { setStyles({ ...DEFAULT_STYLES, ...JSON.parse(d.globalStyles) }); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Styles, val: any) => setStyles(s => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalStyles: JSON.stringify(styles) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  };

  const TABS = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Typography", icon: Type },
    { id: "spacing", label: "Spacing & Layout", icon: Sliders },
    { id: "components", label: "Components", icon: Sliders },
  ] as const;

  return (
    <AdminLayout title="Global Styles">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Design System</h1>
            <p className="text-sm text-gray-500 mt-1">These settings define the visual identity of your entire website.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { if (confirm("Reset all styles to default?")) setStyles(DEFAULT_STYLES); }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#1a2f5a] rounded-lg hover:bg-[#24407a] disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved!" : "Save Styles"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-white text-[#1a2f5a] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-300" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            {/* ── COLORS ── */}
            {activeTab === "colors" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Brand Colors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ColorSwatch label="Primary" valueKey="colorPrimary" styles={styles} onChange={set} />
                    <ColorSwatch label="Secondary" valueKey="colorSecondary" styles={styles} onChange={set} />
                    <ColorSwatch label="Accent" valueKey="colorAccent" styles={styles} onChange={set} />
                    <ColorSwatch label="Background" valueKey="colorBg" styles={styles} onChange={set} />
                    <ColorSwatch label="Text" valueKey="colorText" styles={styles} onChange={set} />
                    <ColorSwatch label="Muted Text" valueKey="colorMuted" styles={styles} onChange={set} />
                    <ColorSwatch label="Border" valueKey="colorBorder" styles={styles} onChange={set} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Status Colors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ColorSwatch label="Success" valueKey="colorSuccess" styles={styles} onChange={set} />
                    <ColorSwatch label="Warning" valueKey="colorWarning" styles={styles} onChange={set} />
                    <ColorSwatch label="Danger" valueKey="colorDanger" styles={styles} onChange={set} />
                  </div>
                </div>
                {/* Preview */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Color Palette Preview</h3>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "Primary", color: styles.colorPrimary },
                      { label: "Secondary", color: styles.colorSecondary },
                      { label: "Accent", color: styles.colorAccent },
                      { label: "Success", color: styles.colorSuccess },
                      { label: "Warning", color: styles.colorWarning },
                      { label: "Danger", color: styles.colorDanger },
                    ].map(c => (
                      <div key={c.label} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-xl shadow-sm border border-black/10" style={{ background: c.color }} />
                        <span className="text-[10px] text-gray-500">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TYPOGRAPHY ── */}
            {activeTab === "typography" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Font Families</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {([["fontHeading","Heading Font"],["fontBody","Body Font"],["fontMono","Mono Font"]] as [keyof Styles, string][]).map(([k,l]) => (
                      <div key={k}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label>
                        <select value={styles[k] as string} onChange={e => set(k, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5a]/30">
                          {FONT_OPTIONS.map(f => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Font Sizes</h3>
                  <div className="space-y-4">
                    <NumField label="Base Size" valueKey="sizeBase" styles={styles} onChange={set} min={12} max={24} />
                    <NumField label="H1" valueKey="sizeH1" styles={styles} onChange={set} min={24} max={96} />
                    <NumField label="H2" valueKey="sizeH2" styles={styles} onChange={set} min={20} max={72} />
                    <NumField label="H3" valueKey="sizeH3" styles={styles} onChange={set} min={16} max={48} />
                    <NumField label="H4" valueKey="sizeH4" styles={styles} onChange={set} min={14} max={36} />
                    <NumField label="Small" valueKey="sizeSmall" styles={styles} onChange={set} min={10} max={18} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Typography Preview</h3>
                  <div className="border border-gray-100 rounded-xl p-6 space-y-3">
                    <div style={{ fontFamily: styles.fontHeading, fontSize: styles.sizeH2, fontWeight: styles.fontWeightBold, color: styles.colorPrimary }}>Heading Example H2</div>
                    <div style={{ fontFamily: styles.fontHeading, fontSize: styles.sizeH3, fontWeight: 600, color: styles.colorPrimary }}>Heading H3 Subheading</div>
                    <p style={{ fontFamily: styles.fontBody, fontSize: styles.sizeBase, lineHeight: styles.lineHeight, color: styles.colorText }}>
                      This is body text at {styles.sizeBase}px. It demonstrates how your paragraphs, descriptions, and content will look across the entire website using the global typography settings.
                    </p>
                    <p style={{ fontFamily: styles.fontBody, fontSize: styles.sizeSmall, color: styles.colorMuted }}>Small / caption text at {styles.sizeSmall}px</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── SPACING ── */}
            {activeTab === "spacing" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Spacing Scale</h3>
                  <div className="space-y-4">
                    <NumField label="XS" valueKey="spacingXs" styles={styles} onChange={set} min={2} max={16} />
                    <NumField label="SM" valueKey="spacingSm" styles={styles} onChange={set} min={4} max={32} />
                    <NumField label="MD" valueKey="spacingMd" styles={styles} onChange={set} min={8} max={64} />
                    <NumField label="LG" valueKey="spacingLg" styles={styles} onChange={set} min={16} max={128} />
                    <NumField label="XL" valueKey="spacingXl" styles={styles} onChange={set} min={32} max={200} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Layout</h3>
                  <div className="space-y-4">
                    <NumField label="Max Container Width" valueKey="containerMax" styles={styles} onChange={set} min={800} max={1920} />
                    <NumField label="Base Border Radius" valueKey="borderRadius" styles={styles} onChange={set} min={0} max={32} />
                    <NumField label="Large Border Radius" valueKey="borderRadiusLg" styles={styles} onChange={set} min={0} max={48} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Spacing Preview</h3>
                  <div className="flex items-end gap-2">
                    {([styles.spacingXs, styles.spacingSm, styles.spacingMd, styles.spacingLg] as number[]).map((s, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="bg-[#1a2f5a] rounded" style={{ width: s, height: s }} />
                        <span className="text-[10px] text-gray-400">{s}px</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── COMPONENTS ── */}
            {activeTab === "components" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Button Styles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ColorSwatch label="Primary Button BG" valueKey="btnPrimaryBg" styles={styles} onChange={set} />
                    <ColorSwatch label="Primary Button Text" valueKey="btnPrimaryText" styles={styles} onChange={set} />
                    <ColorSwatch label="Secondary Button BG" valueKey="btnSecBg" styles={styles} onChange={set} />
                    <ColorSwatch label="Secondary Button Text" valueKey="btnSecText" styles={styles} onChange={set} />
                  </div>
                  <div className="mt-4 space-y-4">
                    <NumField label="Border Radius" valueKey="btnBorderRadius" styles={styles} onChange={set} min={0} max={50} />
                    <NumField label="Padding X" valueKey="btnPaddingX" styles={styles} onChange={set} min={8} max={64} />
                    <NumField label="Padding Y" valueKey="btnPaddingY" styles={styles} onChange={set} min={4} max={32} />
                  </div>
                  {/* Button Preview */}
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <button style={{
                      background: styles.btnPrimaryBg, color: styles.btnPrimaryText,
                      borderRadius: styles.btnBorderRadius, paddingLeft: styles.btnPaddingX, paddingRight: styles.btnPaddingX,
                      paddingTop: styles.btnPaddingY, paddingBottom: styles.btnPaddingY, fontSize: 14, fontWeight: 700,
                    }}>Primary Button</button>
                    <button style={{
                      background: styles.btnSecBg, color: styles.btnSecText,
                      borderRadius: styles.btnBorderRadius, paddingLeft: styles.btnPaddingX, paddingRight: styles.btnPaddingX,
                      paddingTop: styles.btnPaddingY, paddingBottom: styles.btnPaddingY, fontSize: 14, fontWeight: 700,
                    }}>Secondary Button</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
