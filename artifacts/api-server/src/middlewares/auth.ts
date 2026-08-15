import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const admin = (req as any).session?.admin;
  if (!admin) { res.status(401).json({ error: "Not authenticated" }); return; }
  next();
}

/**
 * Session-authenticated mutations must come from the same browser origin.
 * This prevents a third-party site from using a credentialed cross-origin
 * request to change admin content.
 */
export function requireSameOrigin(req: Request, res: Response, next: NextFunction): void {
  const requestOrigin = req.get("origin");
  const referer = req.get("referer");
  const requestHost = req.get("x-forwarded-host")?.split(",")[0].trim() || req.get("host");

  if (!requestOrigin && !referer) {
    res.status(403).json({ error: "Origin verification required" });
    return;
  }

  try {
    const source = new URL(requestOrigin || referer!);
    if (source.host !== requestHost) {
      res.status(403).json({ error: "Cross-origin mutation rejected" });
      return;
    }
  } catch {
    res.status(403).json({ error: "Invalid request origin" });
    return;
  }

  next();
}
