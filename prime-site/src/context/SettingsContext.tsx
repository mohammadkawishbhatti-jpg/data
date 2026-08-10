import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
}

const DEFAULTS: SiteSettings = {
  phone: "818-758-4076",
  email: "help@primepackagingboxes.com",
  address: "444 Alaska Avenue Suite, Torrance, CA 90503, USA",
  whatsapp: "18187584076",
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
