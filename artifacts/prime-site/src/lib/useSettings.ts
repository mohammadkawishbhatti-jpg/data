/**
 * Shared public settings hook — backed by React Query so the fetch is
 * shared across all components (WhatsApp button, header logo, etc.)
 * and cached for 5 minutes per the global QueryClient defaultOptions.
 */
import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export interface SiteSettingsPublic {
  siteName?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  [key: string]: unknown;
}

async function fetchSettings(signal?: AbortSignal): Promise<SiteSettingsPublic> {
  const r = await fetch(`${BASE}/api/settings`, { signal });
  if (!r.ok) throw new Error("settings fetch failed");
  return r.json();
}

export const SETTINGS_QUERY_KEY = ["public-settings"] as const;

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: ({ signal }) => fetchSettings(signal),
    staleTime: 10 * 60 * 1000,   // 10 min — settings rarely change
    gcTime:    30 * 60 * 1000,
  });
}
