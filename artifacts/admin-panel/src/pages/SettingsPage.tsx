import { useEffect, useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { 
  useGetAdminSettings, 
  useUpdateSettings, 
  getGetAdminSettingsQueryKey,
  useAdminListProducts,
  useAdminListCategories,
  useUpdateProduct,
  useUpdateCategory,
  getAdminListProductsQueryKey,
  getAdminListCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle2, Mail, Eye, EyeOff, Map, Shield, Globe, Palette, Bot, LayoutGrid, Star, Trash2, Plus, Save } from "lucide-react";

type Tab = "general" | "homepage" | "branding" | "contact" | "social" | "seo" | "smtp" | "sitemap" | "robots" | "clark";

const DEFAULT_TICKER_ITEMS = [
  "Free Shipping — USA & UK",
  "7–10 Day Turnaround",
  "Free Design Support",
  "100 Unit Minimum",
  "100% Quality Guarantee",
  "FSC Certified Materials",
];

function LogoPreview({ register, fieldName }: { register: any; fieldName: string }) {
  const [url, setUrl] = useState("");
  return (
    <div className="mt-3">
      <input type="hidden" {...register(fieldName, { onChange: (e: any) => setUrl(e.target.value) })} />
      {url && (
        <div className="mt-2 p-3 border border-border rounded-lg bg-muted/10 flex items-center gap-3">
          <img src={url} alt="Logo preview" className="max-h-12 max-w-[160px] object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
          <span className="text-xs text-muted-foreground">Preview</span>
        </div>
      )}
    </div>
  );
}

function FaviconPreview({ register, fieldName }: { register: any; fieldName: string }) {
  const [url, setUrl] = useState("");
  return (
    <div className="mt-3">
      <input type="hidden" {...register(fieldName, { onChange: (e: any) => setUrl(e.target.value) })} />
      {url && (
        <div className="mt-2 p-3 border border-border rounded-lg bg-muted/10 inline-flex items-center gap-3">
          <img src={url} alt="Favicon preview" className="w-8 h-8 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
          <span className="text-xs text-muted-foreground">32×32 preview</span>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetAdminSettings();
  const updateSettings = useUpdateSettings();
  const { data: homepageProducts = [], isLoading: productsLoading } = useAdminListProducts();
  const { data: homepageCategories = [], isLoading: categoriesLoading } = useAdminListCategories();
  const updateProduct = useUpdateProduct();
  const updateCategory = useUpdateCategory();
  const [tab, setTab] = useState<Tab>("general");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [showSmtp2Pass, setShowSmtp2Pass] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [clarkFaqs, setClarkFaqs] = useState<Array<{ q: string; a: string }>>([]);
  const [newFaq, setNewFaq] = useState({ q: "", a: "" });
  const [tickerItems, setTickerItems] = useState<string[]>(DEFAULT_TICKER_ITEMS);

  // Sitemap toggles
  const [sitemap, setSitemap] = useState({ homepage: true, products: true, categories: true, blog: true, pages: true });
  // Robots.txt
  const [robotsTxt, setRobotsTxt] = useState("");

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      siteName: "", logoUrl: "", faviconUrl: "",
      contactEmail: "", contactPhone: "", contactAddress: "",
      whatsappNumber: "", facebookUrl: "", instagramUrl: "", twitterUrl: "", linkedinUrl: "",
      announcementText: "", metaTitle: "", metaDescription: "",
      smtpHost: "", smtpPort: "", smtpUser: "", smtpPass: "", smtpFrom: "", smtpTo: "", smtpSecure: "false",
      smtp2Host: "", smtp2Port: "", smtp2User: "", smtp2Pass: "", smtp2From: "", smtp2Secure: "false",
      geminiApiKey: "",
      clarkEnabled: "true",
      clarkBotName: "Clark",
      clarkGreeting: "",
      clarkCompanyPhone: "",
      clarkCompanyEmail: "",
      clarkCompanyAddress: "",
      clarkToneNotes: "",
      clarkQuoteHours: "2",
    }
  });

  useEffect(() => {
    if (settings) {
      const s = settings as any;
      reset({
        siteName: s.siteName || "Prime Packaging Boxes",
        logoUrl: s.logoUrl || "",
        faviconUrl: s.faviconUrl || "",
        contactEmail: s.email || "", contactPhone: s.phone || "",
        contactAddress: s.address || "", whatsappNumber: s.whatsapp || "",
        facebookUrl: s.facebook || "", instagramUrl: s.instagram || "",
        twitterUrl: s.twitter || "", linkedinUrl: s.linkedin || "",
        announcementText: s.announcementBar || "",
        metaTitle: s.metaTitle || "", metaDescription: s.metaDescription || "",
        smtpHost: s.smtpHost || "", smtpPort: s.smtpPort ? String(s.smtpPort) : "",
        smtpUser: s.smtpUser || "", smtpPass: s.smtpPass || "",
        smtpFrom: s.smtpFrom || "", smtpTo: s.smtpTo || "",
        smtpSecure: s.smtpSecure || "false",
        smtp2Host: s.smtp2Host || "", smtp2Port: s.smtp2Port ? String(s.smtp2Port) : "",
        smtp2User: s.smtp2User || "", smtp2Pass: s.smtp2Pass || "",
        smtp2From: s.smtp2From || "", smtp2Secure: s.smtp2Secure || "false",
        geminiApiKey: s.geminiApiKey || "",
        clarkEnabled: s.clarkEnabled ?? "true",
        clarkBotName: s.clarkBotName || "Clark",
        clarkGreeting: s.clarkGreeting || "",
        clarkCompanyPhone: s.clarkCompanyPhone || "",
        clarkCompanyEmail: s.clarkCompanyEmail || "",
        clarkCompanyAddress: s.clarkCompanyAddress || "",
        clarkToneNotes: s.clarkToneNotes || "",
        clarkQuoteHours: s.clarkQuoteHours || "2",
      });
      // Load custom FAQs
      try {
        if (s.clarkCustomFaqs) setClarkFaqs(JSON.parse(s.clarkCustomFaqs));
      } catch {}
      try { if (s.sitemapSettings) setSitemap({ ...sitemap, ...JSON.parse(s.sitemapSettings) }); } catch {}
      try {
        const parsed = JSON.parse(s.announcementBar || "");
        if (Array.isArray(parsed) && parsed.every((item: unknown) => typeof item === "string")) {
          setTickerItems(parsed);
        }
      } catch {
        // Keep the editable defaults for older plain-text announcement values.
      }
      setRobotsTxt(s.robotsTxt || `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /admin\nDisallow: /api/\nDisallow: /api\nDisallow: /customer-portal/\nDisallow: /customer-portal\n\nSitemap: https://www.primepackagingboxes.com/sitemap.xml`);
    }
  }, [settings, reset]);

  const onSubmit = handleSubmit((data) => {
    const payload: any = {
      siteName: data.siteName,
      phone: data.contactPhone, email: data.contactEmail,
      address: data.contactAddress, whatsapp: data.whatsappNumber,
      facebook: data.facebookUrl, instagram: data.instagramUrl,
      twitter: data.twitterUrl, linkedin: data.linkedinUrl,
      metaTitle: data.metaTitle, metaDescription: data.metaDescription,
      logoUrl: data.logoUrl, faviconUrl: data.faviconUrl,
      smtpHost: data.smtpHost, smtpPort: data.smtpPort,
      smtpUser: data.smtpUser, smtpPass: data.smtpPass,
      smtpFrom: data.smtpFrom, smtpTo: data.smtpTo, smtpSecure: data.smtpSecure,
      smtp2Host: data.smtp2Host, smtp2Port: data.smtp2Port,
      smtp2User: data.smtp2User, smtp2Pass: data.smtp2Pass,
      smtp2From: data.smtp2From, smtp2Secure: data.smtp2Secure,
      geminiApiKey: data.geminiApiKey,
      clarkEnabled: data.clarkEnabled,
      clarkBotName: data.clarkBotName,
      clarkGreeting: data.clarkGreeting,
      clarkCompanyPhone: data.clarkCompanyPhone,
      clarkCompanyEmail: data.clarkCompanyEmail,
      clarkCompanyAddress: data.clarkCompanyAddress,
      clarkToneNotes: data.clarkToneNotes,
      clarkQuoteHours: data.clarkQuoteHours,
      clarkCustomFaqs: JSON.stringify(clarkFaqs),
    };
    saveSettings(payload);
  });

  const saveSettings = (extra: any = {}) => {
    updateSettings.mutate({ data: extra }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  const saveSitemap = () => saveSettings({ sitemapSettings: JSON.stringify(sitemap) });
  const saveRobots = () => saveSettings({ robotsTxt });
  const saveHomepageControls = () => saveSettings({
    announcementBar: JSON.stringify(tickerItems.map(item => item.trim()).filter(Boolean)),
  });
  const resetRobots = () => setRobotsTxt(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /admin\nDisallow: /api/\nDisallow: /api\nDisallow: /customer-portal/\nDisallow: /customer-portal\n\nSitemap: https://www.primepackagingboxes.com/sitemap.xml`);

  const toggleHomepageProduct = (product: any, field: "isFeatured" | "isShowcase") => {
    updateProduct.mutate(
      { id: product.id, data: { [field]: !product[field] } as any },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() }) },
    );
  };

  const toggleHomepageCategory = (category: any) => {
    updateCategory.mutate(
      { id: category.id, data: { isFeatured: !category.isFeatured } as any },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getAdminListCategoriesQueryKey() }) },
    );
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "general", label: "General", icon: Globe },
    { id: "homepage", label: "Homepage Controls", icon: LayoutGrid },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "social", label: "Social", icon: Globe },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "smtp", label: "Email / SMTP", icon: Mail },
    { id: "sitemap", label: "Sitemap", icon: Map },
    { id: "robots", label: "Robots.txt", icon: Shield },
    { id: "clark", label: "Clark AI", icon: Bot },
  ];

  const field = "w-full h-10 rounded-md border border-input px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none bg-background";
  const label = "text-sm font-medium block mb-1";

  if (isLoading) {
    return <AdminLayout title="Settings"><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 bg-muted/20 rounded-xl p-1 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {saved && (
          <div className="mb-4 flex items-center gap-2 text-green-600 font-medium text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <CheckCircle2 className="h-4 w-4" /> Settings saved successfully
          </div>
        )}

        {/* General */}
        {tab === "general" && (
          <form onSubmit={onSubmit} className="bg-card border rounded-xl shadow-sm divide-y">
            <div className="p-6 space-y-4">
              <h3 className="text-base font-semibold">General Settings</h3>
              <div><label className={label}>Site Name</label><input {...register("siteName")} className={field} /></div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                The scrolling header announcements and homepage product/category selections are managed together in <button type="button" onClick={() => setTab("homepage")} className="font-bold text-primary hover:underline">Homepage Controls</button>.
              </div>
            </div>
            <div className="p-6 bg-muted/5 flex justify-end">
              <button type="submit" disabled={isSubmitting || updateSettings.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-sm font-medium disabled:opacity-50">
                {(isSubmitting || updateSettings.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} Save Settings
              </button>
            </div>
          </form>
        )}

        {/* Homepage Controls */}
        {tab === "homepage" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Homepage Controls</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Manage the moving announcement rail and choose exactly which products and categories appear on the homepage.</p>
                </div>
                <button type="button" onClick={saveHomepageControls} disabled={updateSettings.isPending} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Homepage Settings
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Scrolling announcement bar</h4>
                    <p className="text-xs text-muted-foreground">These items run in the blue rail above the main header.</p>
                  </div>
                  <button type="button" onClick={() => setTickerItems(items => [...items, "New announcement"])} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"><Plus className="h-3.5 w-3.5" /> Add item</button>
                </div>
                <div className="space-y-2">
                  {tickerItems.map((item, index) => (
                    <div key={`${index}-${item}`} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-bold text-muted-foreground">{index + 1}</span>
                      <input value={item} onChange={e => setTickerItems(items => items.map((value, i) => i === index ? e.target.value : value))} className={field} />
                      <button type="button" onClick={() => setTickerItems(items => items.filter((_, i) => i !== index))} className="rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label={`Remove announcement ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <div className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /><h3 className="font-semibold">Most Popular / Best Selling</h3></div>
                  <p className="mt-1 text-xs text-muted-foreground">Checked products appear in “Our Best-Selling Packaging”.</p>
                </div>
                <div className="max-h-[430px] space-y-1 overflow-y-auto p-3">
                  {productsLoading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : homepageProducts.map((product: any) => (
                    <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50">
                      <input type="checkbox" checked={!!product.isFeatured} onChange={() => toggleHomepageProduct(product, "isFeatured")} disabled={updateProduct.isPending} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</span>
                      {product.categoryName && <span className="hidden text-[10px] text-muted-foreground sm:inline">{product.categoryName}</span>}
                    </label>
                  )) }
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <div className="flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-primary" /><h3 className="font-semibold">Product Showcase</h3></div>
                  <p className="mt-1 text-xs text-muted-foreground">Checked products appear in “Packaging for Every Product & Industry”.</p>
                </div>
                <div className="max-h-[430px] space-y-1 overflow-y-auto p-3">
                  {productsLoading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : homepageProducts.map((product: any) => (
                    <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50">
                      <input type="checkbox" checked={!!product.isShowcase} onChange={() => toggleHomepageProduct(product, "isShowcase")} disabled={updateProduct.isPending} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{product.name}</span>
                      {product.categoryName && <span className="hidden text-[10px] text-muted-foreground sm:inline">{product.categoryName}</span>}
                    </label>
                  )) }
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5">
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /><h3 className="font-semibold">Browse by Type / Shop by Category</h3></div>
                <p className="mt-1 text-xs text-muted-foreground">Checked categories appear in the homepage category grid. Changes save instantly.</p>
              </div>
              <div className="grid max-h-[430px] grid-cols-1 gap-1 overflow-y-auto p-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoriesLoading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : homepageCategories.map((category: any) => (
                  <label key={category.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50">
                    <input type="checkbox" checked={!!category.isFeatured} onChange={() => toggleHomepageCategory(category)} disabled={updateCategory.isPending} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span>
                    <span className="text-[10px] text-muted-foreground">{category.productCount ?? 0}</span>
                  </label>
                )) }
              </div>
            </div>
          </div>
        )}

        {/* Branding */}
        {tab === "branding" && (
          <form onSubmit={onSubmit} className="bg-card border rounded-xl shadow-sm divide-y">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Branding</h3>
                  <p className="text-xs text-muted-foreground">Logo and favicon for your storefront</p>
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className={label}>Logo URL</label>
                <input {...register("logoUrl")} placeholder="https://your-cdn.com/logo.png" className={field} />
                <p className="text-xs text-muted-foreground mt-1">Paste a direct image URL — ideally a transparent PNG or SVG, ~200×60 px.</p>
                {/* Preview */}
                <LogoPreview register={register} fieldName="logoUrl" />
              </div>

              {/* Favicon */}
              <div>
                <label className={label}>Favicon URL</label>
                <input {...register("faviconUrl")} placeholder="https://your-cdn.com/favicon.png" className={field} />
                <p className="text-xs text-muted-foreground mt-1">Square image, 32×32 or 64×64 px PNG/ICO. Leave blank to keep the default admin icon.</p>
                <FaviconPreview register={register} fieldName="faviconUrl" />
              </div>
            </div>
            <div className="p-6 bg-muted/5 flex justify-end">
              <button type="submit" disabled={isSubmitting || updateSettings.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-sm font-medium disabled:opacity-50">
                {(isSubmitting || updateSettings.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} Save Branding
              </button>
            </div>
          </form>
        )}

        {/* Contact */}
        {tab === "contact" && (
          <form onSubmit={onSubmit} className="bg-card border rounded-xl shadow-sm divide-y">
            <div className="p-6 space-y-4">
              <h3 className="text-base font-semibold">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={label}>Email Address</label><input {...register("contactEmail")} className={field} /></div>
                <div><label className={label}>Phone Number</label><input {...register("contactPhone")} className={field} /></div>
                <div><label className={label}>WhatsApp Number</label><input {...register("whatsappNumber")} className={field} /></div>
                <div className="md:col-span-2"><label className={label}>Physical Address</label><textarea {...register("contactAddress")} rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none bg-background" /></div>
              </div>
            </div>
            <div className="p-6 bg-muted/5 flex justify-end">
              <button type="submit" disabled={isSubmitting || updateSettings.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-sm font-medium disabled:opacity-50">
                {(isSubmitting || updateSettings.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} Save Contact Info
              </button>
            </div>
          </form>
        )}

        {/* Social */}
        {tab === "social" && (
          <form onSubmit={onSubmit} className="bg-card border rounded-xl shadow-sm divide-y">
            <div className="p-6 space-y-4">
              <h3 className="text-base font-semibold">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={label}>Facebook URL</label><input {...register("facebookUrl")} className={field} /></div>
                <div><label className={label}>Instagram URL</label><input {...register("instagramUrl")} className={field} /></div>
                <div><label className={label}>Twitter / X URL</label><input {...register("twitterUrl")} className={field} /></div>
                <div><label className={label}>LinkedIn URL</label><input {...register("linkedinUrl")} className={field} /></div>
              </div>
            </div>
            <div className="p-6 bg-muted/5 flex justify-end">
              <button type="submit" disabled={isSubmitting || updateSettings.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-sm font-medium disabled:opacity-50">
                {(isSubmitting || updateSettings.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} Save Social Links
              </button>
            </div>
          </form>
        )}

        {/* SEO */}
        {tab === "seo" && (
          <form onSubmit={onSubmit} className="bg-card border rounded-xl shadow-sm divide-y">
            <div className="p-6 space-y-4">
              <h3 className="text-base font-semibold">Global SEO Defaults</h3>
              <div><label className={label}>Global Meta Title</label><input {...register("metaTitle")} className={field} /></div>
              <div><label className={label}>Global Meta Description</label><textarea {...register("metaDescription")} rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none bg-background" /></div>
            </div>
            <div className="p-6 bg-muted/5 flex justify-end">
              <button type="submit" disabled={isSubmitting || updateSettings.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-sm font-medium disabled:opacity-50">
                {(isSubmitting || updateSettings.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} Save SEO
              </button>
            </div>
          </form>
        )}

        {/* SMTP */}
        {tab === "smtp" && (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Primary SMTP */}
            <div className="bg-card border rounded-xl shadow-sm divide-y">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="text-base font-semibold">Primary SMTP</h3>
                  <span className="text-xs text-muted-foreground ml-1">— e.g. Gmail</span>
                </div>
                <p className="text-sm text-muted-foreground">Used first for all outgoing emails (quotes, contact forms). Gmail: host <code className="bg-muted px-1 rounded">smtp.gmail.com</code>, port <code className="bg-muted px-1 rounded">587</code>, use an <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-primary underline">App Password</a>.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={label}>SMTP Host</label><input {...register("smtpHost")} placeholder="smtp.gmail.com" className={field} /></div>
                  <div><label className={label}>SMTP Port</label><input {...register("smtpPort")} placeholder="587" type="number" className={field} /></div>
                  <div><label className={label}>Username / Email</label><input {...register("smtpUser")} placeholder="you@gmail.com" className={field} /></div>
                  <div>
                    <label className={label}>Password / App Password</label>
                    <div className="relative">
                      <input {...register("smtpPass")} type={showSmtpPass ? "text" : "password"} placeholder="••••••••" className={`${field} pr-10`} />
                      <button type="button" onClick={() => setShowSmtpPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showSmtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div><label className={label}>From Email</label><input {...register("smtpFrom")} placeholder="noreply@primepackagingboxes.com" className={field} /></div>
                  <div><label className={label}>Deliver All Emails To</label><input {...register("smtpTo")} placeholder="sales@primepackagingboxes.co.uk" className={field} /></div>
                  <div className="md:col-span-2">
                    <label className={label}>Encryption</label>
                    <select {...register("smtpSecure")} className={field}>
                      <option value="false">STARTTLS — port 587 (Gmail, cPanel default)</option>
                      <option value="true">SSL/TLS — port 465</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary / Fallback SMTP */}
            <div className="bg-card border rounded-xl shadow-sm divide-y">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <h3 className="text-base font-semibold">Secondary SMTP (Fallback)</h3>
                  <span className="text-xs text-muted-foreground ml-1">— e.g. cPanel Webmail</span>
                </div>
                <p className="text-sm text-muted-foreground">Used automatically if Primary fails. cPanel: host <code className="bg-muted px-1 rounded">mail.yourdomain.com</code>, port <code className="bg-muted px-1 rounded">587</code>, use your cPanel email password. Leave blank to disable fallback.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={label}>SMTP Host</label><input {...register("smtp2Host")} placeholder="mail.primepackagingboxes.co.uk" className={field} /></div>
                  <div><label className={label}>SMTP Port</label><input {...register("smtp2Port")} placeholder="587" type="number" className={field} /></div>
                  <div><label className={label}>Username / Email</label><input {...register("smtp2User")} placeholder="info@primepackagingboxes.co.uk" className={field} /></div>
                  <div>
                    <label className={label}>Password</label>
                    <div className="relative">
                      <input {...register("smtp2Pass")} type={showSmtp2Pass ? "text" : "password"} placeholder="••••••••" className={`${field} pr-10`} />
                      <button type="button" onClick={() => setShowSmtp2Pass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showSmtp2Pass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div><label className={label}>From Email</label><input {...register("smtp2From")} placeholder="info@primepackagingboxes.co.uk" className={field} /></div>
                  <div className="md:col-span-2">
                    <label className={label}>Encryption</label>
                    <select {...register("smtp2Secure")} className={field}>
                      <option value="false">STARTTLS — port 587</option>
                      <option value="true">SSL/TLS — port 465</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Email + Save */}
            <div className="bg-card border rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">Test Email</p>
                <p className="text-xs text-muted-foreground mt-0.5">Save settings first, then send a test to verify delivery. Primary is tried first; fallback kicks in if it fails.</p>
                {testEmailResult && (
                  <p className={`text-xs mt-1 font-medium ${testEmailResult.ok ? "text-green-600" : "text-red-500"}`}>{testEmailResult.msg}</p>
                )}
              </div>
              <div className="flex gap-3 shrink-0">
                <button type="button" disabled={testEmailSending}
                  onClick={async () => {
                    setTestEmailSending(true); setTestEmailResult(null);
                    try {
                      const r = await fetch("/api/admin/smtp-test", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
                      const j = await r.json();
                      setTestEmailResult({ ok: r.ok, msg: r.ok ? `✓ Sent via ${j.via} (${j.host})` : (j.error || "Failed") });
                    } catch { setTestEmailResult({ ok: false, msg: "Network error" }); }
                    finally { setTestEmailSending(false); }
                  }}
                  className="flex items-center gap-2 border border-input bg-background hover:bg-muted h-10 px-4 rounded-lg text-sm font-medium disabled:opacity-50">
                  {testEmailSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send Test
                </button>
                <button type="submit" disabled={isSubmitting || updateSettings.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-sm font-medium disabled:opacity-50">
                  {(isSubmitting || updateSettings.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : "Save SMTP Settings"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Sitemap */}
        {tab === "sitemap" && (
          <div className="space-y-5">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <Map className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">XML Sitemap</h3>
                  <p className="text-xs text-muted-foreground">Available at: <a href="/sitemap.xml" target="_blank" className="text-primary hover:underline">/sitemap.xml</a></p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">Enable or disable which content types appear in your XML sitemap. Search engines use this to discover your pages.</p>
                {[
                  { key: "homepage", label: "Homepage", desc: "The main homepage URL" },
                  { key: "products", label: "Products", desc: "All active product pages" },
                  { key: "categories", label: "Categories", desc: "All active category pages" },
                  { key: "blog", label: "Blog Posts", desc: "All published blog posts" },
                  { key: "pages", label: "Static Pages", desc: "About, Contact, Get Quote, Shop pages" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setSitemap(s => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(sitemap as any)[item.key] ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${(sitemap as any)[item.key] ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t bg-muted/5 flex justify-between items-center">
                <a href="/sitemap.xml" target="_blank" className="text-sm text-primary hover:underline">Preview sitemap →</a>
                <button onClick={saveSitemap} disabled={updateSettings.isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 rounded-lg text-sm font-medium disabled:opacity-50">
                  {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save Sitemap Settings
                </button>
              </div>
            </div>

            {/* Sitemap preview */}
            <div className="bg-card border rounded-xl shadow-sm p-5">
              <h4 className="font-semibold text-sm mb-2">Active sections</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sitemap).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">✓ {k}</span>
                ))}
                {Object.entries(sitemap).filter(([, v]) => !v).map(([k]) => (
                  <span key={k} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">✗ {k}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clark AI */}
        {tab === "clark" && (
          <form onSubmit={onSubmit} className="space-y-5">

            {/* Enable / Disable */}
            <div className="bg-card border rounded-xl shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B2B5E] to-[#e63329] flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Clark AI Chatbot</p>
                  <p className="text-xs text-muted-foreground">Show / hide the chat bubble on your website</p>
                </div>
              </div>
              <select {...register("clarkEnabled")} className="h-9 rounded-lg border border-input px-3 text-sm focus:outline-none bg-background">
                <option value="true">✅ Enabled</option>
                <option value="false">🔴 Disabled</option>
              </select>
            </div>

            {/* API Key */}
            <div className="bg-card border rounded-xl shadow-sm divide-y">
              <div className="px-5 py-4">
                <h3 className="font-semibold text-sm mb-3">Groq API Key</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 mb-3">
                  <strong>Free key:</strong> Get one at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline">console.groq.com/keys</a> → Create API Key. Free tier: 14,400 requests/day.
                </div>
                <div className="relative">
                  <input {...register("geminiApiKey")} type={showSmtpPass ? "text" : "password"} placeholder="gsk_..." className={`${field} pr-10`} />
                  <button type="button" onClick={() => setShowSmtpPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSmtpPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Leave blank to use the server environment variable.</p>
              </div>
            </div>

            {/* Bot Identity */}
            <div className="bg-card border rounded-xl shadow-sm divide-y">
              <div className="px-5 py-4 space-y-4">
                <h3 className="font-semibold text-sm">Bot Identity & Contact Info</h3>
                <p className="text-xs text-muted-foreground -mt-2">These replace the hardcoded values in Clark's system prompt — every chat will use the values you set here.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Bot Name</label>
                    <input {...register("clarkBotName")} placeholder="Clark" className={field} />
                    <p className="text-xs text-muted-foreground mt-1">e.g. "Alex", "Max" — default is Clark</p>
                  </div>
                  <div>
                    <label className={label}>Quote Delivery Hours</label>
                    <input {...register("clarkQuoteHours")} placeholder="2" type="number" min="1" max="48" className={field} />
                    <p className="text-xs text-muted-foreground mt-1">Clark tells customers "quote within X hours"</p>
                  </div>
                  <div>
                    <label className={label}>Company Phone</label>
                    <input {...register("clarkCompanyPhone")} placeholder="818-758-4076" className={field} />
                  </div>
                  <div>
                    <label className={label}>Company Email</label>
                    <input {...register("clarkCompanyEmail")} placeholder="help@primepackagingboxes.com" className={field} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={label}>Company Address</label>
                    <input {...register("clarkCompanyAddress")} placeholder="444 Alaska Avenue Suite, Torrance, CA 90503 USA" className={field} />
                  </div>
                </div>
              </div>
            </div>

            {/* Greeting & Tone */}
            <div className="bg-card border rounded-xl shadow-sm divide-y">
              <div className="px-5 py-4 space-y-4">
                <h3 className="font-semibold text-sm">Greeting & Personality</h3>
                <div>
                  <label className={label}>First Greeting Message</label>
                  <textarea {...register("clarkGreeting")} rows={3}
                    placeholder={`Hi there! 👋 Welcome to Prime Packaging Boxes! How can we help you today? I'm Clark, your packaging assistant…`}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none bg-background" />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to use the default greeting.</p>
                </div>
                <div>
                  <label className={label}>Tone / Personality Notes</label>
                  <textarea {...register("clarkToneNotes")} rows={3}
                    placeholder="e.g. Always end messages with an emoji. Use British spelling. Be extra enthusiastic about eco-friendly boxes."
                    className="w-full rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none bg-background" />
                  <p className="text-xs text-muted-foreground mt-1">Added as extra instructions to Clark's prompt. Keep it brief.</p>
                </div>
              </div>
            </div>

            {/* Custom FAQs */}
            <div className="bg-card border rounded-xl shadow-sm divide-y">
              <div className="px-5 py-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">Custom FAQ Answers</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Add specific Q&A pairs — Clark will answer these exactly as written.</p>
                </div>
                {clarkFaqs.length > 0 && (
                  <div className="space-y-2">
                    {clarkFaqs.map((faq, i) => (
                      <div key={i} className="flex gap-2 items-start bg-muted/10 border rounded-lg p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-muted-foreground">Q: {faq.q}</p>
                          <p className="text-xs text-foreground mt-0.5">A: {faq.a}</p>
                        </div>
                        <button type="button" onClick={() => setClarkFaqs(f => f.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600 text-xs flex-shrink-0 px-1">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border rounded-lg p-3 space-y-2 bg-muted/5">
                  <p className="text-xs font-medium text-muted-foreground">Add new FAQ</p>
                  <input value={newFaq.q} onChange={e => setNewFaq(f => ({ ...f, q: e.target.value }))}
                    placeholder="Question (e.g. Do you ship to Canada?)" className={`${field} text-xs h-8`} />
                  <textarea value={newFaq.a} onChange={e => setNewFaq(f => ({ ...f, a: e.target.value }))}
                    placeholder="Answer (e.g. Yes! We ship internationally. Call 818-758-4076 for rates.)"
                    rows={2} className="w-full rounded-md border border-input px-3 py-1.5 text-xs focus:ring-2 focus:ring-ring focus:outline-none resize-none bg-background" />
                  <button type="button"
                    onClick={() => {
                      if (!newFaq.q.trim() || !newFaq.a.trim()) return;
                      setClarkFaqs(f => [...f, { q: newFaq.q.trim(), a: newFaq.a.trim() }]);
                      setNewFaq({ q: "", a: "" });
                    }}
                    className="h-8 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-50">
                    + Add FAQ
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting || updateSettings.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-sm font-medium disabled:opacity-50">
                {(isSubmitting || updateSettings.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} Save Clark Settings
              </button>
            </div>
          </form>
        )}

        {/* Robots.txt */}
        {tab === "robots" && (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">robots.txt</h3>
                <p className="text-xs text-muted-foreground">Served at: <a href="/api/robots.txt" target="_blank" className="text-primary hover:underline">/robots.txt</a> and <a href="/api/robots.txt" target="_blank" className="text-primary hover:underline">/api/robots.txt</a></p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Control which pages search engine crawlers can visit. The default blocks admin and API paths. 
                Use this to disallow specific directories or restrict certain bots.
              </p>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">robots.txt content</label>
                  <button type="button" onClick={resetRobots} className="text-xs text-muted-foreground hover:text-primary">Reset to default</button>
                </div>
                <textarea
                  value={robotsTxt}
                  onChange={e => setRobotsTxt(e.target.value)}
                  rows={14}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-muted/5"
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                ⚠️ Changes take effect immediately. Be careful — blocking important paths can hurt your SEO. Always keep <code>Allow: /</code> unless you have a specific reason to restrict it.
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-muted/5 flex justify-between items-center">
              <a href="/api/robots.txt" target="_blank" className="text-sm text-primary hover:underline">Preview robots.txt →</a>
              <button onClick={saveRobots} disabled={updateSettings.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 rounded-lg text-sm font-medium disabled:opacity-50">
                {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save robots.txt
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
