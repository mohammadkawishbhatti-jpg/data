import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";

// Simple in-memory cache — refreshed every 60s
let cachedEnabled = false;
let cachedCountries: string[] = [];
let lastFetch = 0;

async function refreshCache() {
  try {
    const [s] = await db.select({
      countryBlockEnabled: siteSettingsTable.countryBlockEnabled,
      blockedCountries: siteSettingsTable.blockedCountries,
    }).from(siteSettingsTable).limit(1);
    cachedEnabled = s?.countryBlockEnabled === "true";
    cachedCountries = s?.blockedCountries ? JSON.parse(s.blockedCountries) : [];
  } catch {}
  lastFetch = Date.now();
}

// Lightweight IP → country lookup via free external API (cached per session)
const ipCache: Record<string, string> = {};

async function getCountryFromIp(ip: string): Promise<string | null> {
  if (ipCache[ip]) return ipCache[ip];
  // Skip private IPs
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1|localhost)/i.test(ip)) return null;
  try {
    const res = await fetch(`https://ipapi.co/${ip}/country/`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const country = (await res.text()).trim();
      if (/^[A-Z]{2}$/.test(country)) {
        ipCache[ip] = country;
        return country;
      }
    }
  } catch {}
  return null;
}

export function countryBlockMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip admin paths
  if (req.path.startsWith("/admin") || req.path.startsWith("/api/admin")) return next();

  // Refresh cache every 60s
  if (Date.now() - lastFetch > 60_000) {
    refreshCache().catch(() => {});
  }

  if (!cachedEnabled || cachedCountries.length === 0) return next();

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "";

  getCountryFromIp(ip).then(country => {
    if (country && cachedCountries.includes(country)) {
      res.status(403).send(`
        <!DOCTYPE html>
        <html><head><title>Access Restricted</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:80px;background:#0a1628;color:#fff">
          <h1 style="font-size:3em">🚫</h1>
          <h2>Access Restricted</h2>
          <p>This website is not available in your region.</p>
        </body></html>
      `);
    } else {
      next();
    }
  }).catch(() => next());
}
