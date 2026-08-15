import { useState, useEffect } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Shield, Plus, X, Globe, Loader2, Save } from "lucide-react";
import { useGetAdminSettings, useUpdateSettings, getGetAdminSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "KP", name: "North Korea", flag: "🇰🇵" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "SY", name: "Syria", flag: "🇸🇾" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲" },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "LY", name: "Libya", flag: "🇱🇾" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "SO", name: "Somalia", flag: "🇸🇴" },
  { code: "SD", name: "Sudan", flag: "🇸🇩" },
  { code: "SS", name: "South Sudan", flag: "🇸🇸" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "PS", name: "Palestine", flag: "🇵🇸" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GB", name: "UK", flag: "🇬🇧" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
];
// dedupe
const UNIQUE_COUNTRIES = COUNTRIES.filter((c, i, arr) => arr.findIndex(x => x.code === c.code) === i);

export default function CountryBlockerPage() {
  const queryClient = useQueryClient();
  const { data: settings } = useGetAdminSettings();
  const updateSettings = useUpdateSettings();

  const [enabled, setEnabled] = useState(false);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [addCode, setAddCode] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      const s = settings as any;
      setEnabled(s.countryBlockEnabled === "true");
      try { setBlocked(JSON.parse(s.blockedCountries || "[]")); } catch { setBlocked([]); }
    }
  }, [settings]);

  const addCountry = (code: string) => {
    const c = code.trim().toUpperCase();
    if (c.length === 2 && !blocked.includes(c)) setBlocked(b => [...b, c]);
    setAddCode("");
    setCustomCode("");
  };

  const removeCountry = (code: string) => setBlocked(b => b.filter(x => x !== code));

  const save = async () => {
    setSaving(true);
    updateSettings.mutate({
      data: {
        countryBlockEnabled: enabled ? "true" : "false",
        blockedCountries: JSON.stringify(blocked),
      } as any
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setSaving(false);
      },
      onError: () => setSaving(false),
    });
  };

  const getCountryName = (code: string) => UNIQUE_COUNTRIES.find(c => c.code === code)?.name || code;
  const getFlag = (code: string) => UNIQUE_COUNTRIES.find(c => c.code === code)?.flag || "🌐";

  return (
    <AdminLayout title="Country Blocker">
      <div className="max-w-3xl space-y-6">
        {/* Plugin Card */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-6 border-b bg-muted/10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Country Blocker</h2>
              <p className="text-sm text-muted-foreground">Block visitors from specific countries. Uses visitor IP to detect location via ipapi.co</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{enabled ? "Enabled" : "Disabled"}</span>
              <button
                onClick={() => setEnabled(e => !e)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {!enabled && (
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-amber-700 text-sm flex items-center gap-2">
              ⚠️ Country blocking is currently disabled. Enable it above to start blocking visitors.
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Quick add from list */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Add country to blocklist</label>
              <div className="flex gap-2">
                <select value={addCode} onChange={e => setAddCode(e.target.value)}
                  className="flex-1 h-10 border border-border rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">— Select a country —</option>
                  {UNIQUE_COUNTRIES.filter(c => !blocked.includes(c.code)).map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                  ))}
                </select>
                <button onClick={() => addCode && addCountry(addCode)} disabled={!addCode}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 rounded-lg text-sm font-medium disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Block
                </button>
              </div>
            </div>

            {/* Custom ISO code */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Add custom ISO country code</label>
              <div className="flex gap-2">
                <input value={customCode} onChange={e => setCustomCode(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="e.g. BD"
                  maxLength={2}
                  className="w-32 h-10 border border-border rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono uppercase" />
                <button onClick={() => customCode.length === 2 && addCountry(customCode)} disabled={customCode.length !== 2}
                  className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium border border-border hover:bg-muted/10 disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Add
                </button>
                <p className="self-center text-xs text-muted-foreground">Use 2-letter ISO 3166-1 alpha-2 codes</p>
              </div>
            </div>

            {/* Blocked countries list */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <span>Blocked Countries</span>
                <span className="text-xs bg-muted rounded-full px-2 py-0.5 font-normal">{blocked.length}</span>
              </label>
              {blocked.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-xl py-8 text-center text-muted-foreground">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No countries blocked yet</p>
                  <p className="text-xs mt-1">Add countries above to restrict access</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {blocked.map(code => (
                    <div key={code} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-1.5 text-sm">
                      <span>{getFlag(code)}</span>
                      <span className="font-medium">{getCountryName(code)}</span>
                      <span className="text-xs text-red-500 font-mono">({code})</span>
                      <button onClick={() => removeCountry(code)} className="hover:text-red-900 ml-1">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-muted/5 flex items-center justify-between">
            {saved && <span className="text-sm text-green-600 font-medium">✓ Settings saved</span>}
            {!saved && <span className="text-xs text-muted-foreground">Changes are applied immediately once saved</span>}
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 rounded-lg text-sm font-semibold disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 space-y-2">
          <p className="font-semibold">ℹ️ How it works</p>
          <ul className="list-disc pl-4 space-y-1 text-xs">
            <li>Visitor IP is looked up via <strong>ipapi.co</strong> (free, no API key needed)</li>
            <li>Private/local IPs (LAN, localhost) are always allowed</li>
            <li>Country data is cached in memory for the session to reduce API calls</li>
            <li>Admin panel paths (<code>/admin</code>) are never blocked regardless of settings</li>
            <li>Blocked visitors see a 403 "Access Restricted" page</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
