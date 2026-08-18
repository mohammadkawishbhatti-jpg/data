import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  announcementBar?: string;
  popupEnabled?: string;
  popupBadge?: string;
  popupTitle?: string;
  popupMessage?: string;
  popupButtonText?: string;
  popupButtonUrl?: string;
  popupImageUrl?: string;
  tawkEnabled?: string;
  tawkPropertyId?: string;
  tawkHandoffLabel?: string;
}

const DEFAULTS: SiteSettings = {
  phone: "818-758-4076",
  email: "help@primepackagingboxes.com",
  address: "444 Alaska Avenue Suite, Torrance, CA 90503, USA",
  whatsapp: "18187584076",
  announcementBar: "",
  popupEnabled: "true",
  popupBadge: "Limited-time offer",
  popupTitle: "Make your next unboxing unforgettable",
  popupMessage: "Get free design support and a fast custom packaging quote from our team.",
  popupButtonText: "Get a free quote",
  popupButtonUrl: "/get-a-quote",
  popupImageUrl: "",
  tawkEnabled: "false",
  tawkPropertyId: "",
  tawkHandoffLabel: "Talk to a real person",
};

const SettingsContext = createContext<SiteSettings>(DEFAULTS);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    fetch(`${BASE}/api/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setSettings({
            phone: data.phone || DEFAULTS.phone,
            email: data.email || DEFAULTS.email,
            address: data.address || DEFAULTS.address,
            whatsapp: data.whatsapp || DEFAULTS.whatsapp,
            announcementBar: data.announcementBar || DEFAULTS.announcementBar,
            popupEnabled: data.popupEnabled ?? DEFAULTS.popupEnabled,
            popupBadge: data.popupBadge || DEFAULTS.popupBadge,
            popupTitle: data.popupTitle || DEFAULTS.popupTitle,
            popupMessage: data.popupMessage || DEFAULTS.popupMessage,
            popupButtonText: data.popupButtonText || DEFAULTS.popupButtonText,
            popupButtonUrl: data.popupButtonUrl || DEFAULTS.popupButtonUrl,
            popupImageUrl: data.popupImageUrl || DEFAULTS.popupImageUrl,
            tawkEnabled: data.tawkEnabled ?? DEFAULTS.tawkEnabled,
            tawkPropertyId: data.tawkPropertyId || DEFAULTS.tawkPropertyId,
            tawkHandoffLabel: data.tawkHandoffLabel || DEFAULTS.tawkHandoffLabel,
          });
        }
      })
      .catch(() => {/* keep defaults */});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
