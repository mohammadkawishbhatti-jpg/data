import type { Request, Response, NextFunction } from "express";

export type AdminRole = "superadmin" | "editor" | "sales" | "admin";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Super Admin",
  editor: "Editor",
  sales: "Sales",
  admin: "Basic Admin",
};

export const ROLE_CAPABILITIES: Record<AdminRole, Set<string>> = {
  superadmin: new Set(["*"]),
  editor: new Set(["dashboard", "catalog", "content", "media", "forms", "exports"]),
  sales: new Set(["dashboard", "sales", "customers", "support", "invoices"]),
  // Basic Admin can manage the commercial/content workspaces and the approval
  // queue, but cannot enter system Settings or other security-sensitive areas.
  admin: new Set(["dashboard", "catalog", "content", "content-approval", "media", "forms", "exports"]),
};

function normalizeRole(value: unknown): AdminRole {
  const role = String(value ?? "").toLowerCase();
  if (role === "superadmin") return "superadmin";
  if (role === "administrator" || role === "owner") return "superadmin";
  if (role === "editor" || role === "sales" || role === "admin") return role;
  return "admin";
}

export function getAdminRole(req: Request): AdminRole {
  return normalizeRole((req as any).session?.admin?.role);
}

export function getAdminCapabilities(req: Request): string[] {
  const role = getAdminRole(req);
  return role === "superadmin" ? ["*"] : [...ROLE_CAPABILITIES[role]];
}

export function canAdminAccess(req: Request, capability: string): boolean {
  const role = getAdminRole(req);
  return role === "superadmin" || ROLE_CAPABILITIES[role].has(capability);
}

/** Super Admin and Basic Admin may publish their own catalog/CMS edits live. */
export function canEditContentLive(req: Request): boolean {
  return canAdminAccess(req, "content-approval");
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const admin = (req as any).session?.admin;
  if (!admin) { res.status(401).json({ error: "Not authenticated" }); return; }
  next();
}

export function requireAdministrator(req: Request, res: Response, next: NextFunction): void {
  const admin = (req as any).session?.admin;
  if (!admin) { res.status(401).json({ error: "Not authenticated" }); return; }
  const role = getAdminRole(req);
  if (role !== "superadmin") {
    res.status(403).json({ error: "Administrator permission required" });
    return;
  }
  next();
}

export function requireCapability(capability: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!(req as any).session?.admin) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (!canAdminAccess(req, capability)) {
      res.status(403).json({ error: `Permission required: ${capability}` });
      return;
    }
    next();
  };
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
