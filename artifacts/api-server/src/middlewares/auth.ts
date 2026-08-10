import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const admin = (req as any).session?.admin;
  if (!admin) { res.status(401).json({ error: "Not authenticated" }); return; }
  next();
}
