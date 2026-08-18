import { Router } from "express";
import { requireAdministrator, ADMIN_ROLE_LABELS, ROLE_CAPABILITIES } from "../middlewares/auth";

const router = Router();

const ROUTE_MATRIX = [
  ["/", "dashboard"], ["/products", "catalog"], ["/products/:id/edit", "catalog"], ["/categories", "catalog"],
  ["/banners", "catalog"], ["/import-products", "catalog"], ["/quotes", "sales"], ["/quote-builder", "sales"],
  ["/leads", "sales"], ["/support-tickets", "support"], ["/invoices", "invoices"], ["/forms", "forms"],
  ["/pages", "content"], ["/menus", "content"], ["/blog", "content"], ["/media", "media"],
  ["/global-styles", "content"], ["/content-approvals", "content-approval"], ["/customers", "customers"],
  ["/orders", "sales"], ["/follow-ups", "sales"], ["/quote-pipeline", "sales"], ["/users", "superadmin"],
  ["/country-blocker", "superadmin"], ["/database", "superadmin"], ["/security", "superadmin"],
  ["/audit-log", "superadmin"], ["/settings", "superadmin"], ["/clark", "superadmin"],
] as const;

const MUTATION_MATRIX = [
  ["CMS draft create/update", "content", "Approval required before publish"],
  ["CMS revision approve/reject/restore", "content-approval", "Basic Admin and Super Admin"],
  ["CMS revision publish", "content-approval", "Basic Admin and Super Admin"],
  ["Customer invite/access/reset", "customers", "Sensitive action alert"],
  ["Media upload/metadata/delete", "media", "Metadata and quality controls"],
  ["Audit export/settings", "superadmin", "Immutable export; retention controlled"],
  ["Monitoring configuration", "superadmin", "Operational events are append-only"],
] as const;

router.get("/admin/capability-matrix", requireAdministrator, (_req, res) => {
  res.json({
    roles: Object.entries(ROLE_CAPABILITIES).map(([role, capabilities]) => ({
      role,
      roleLabel: ADMIN_ROLE_LABELS[role as keyof typeof ADMIN_ROLE_LABELS],
      capabilities: capabilities.has("*") ? ["*"] : [...capabilities],
    })),
    routes: ROUTE_MATRIX.map(([route, capability]) => ({ route, capability })),
    mutations: MUTATION_MATRIX.map(([mutation, capability, rule]) => ({ mutation, capability, rule })),
  });
});

export default router;