import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, contentRevisionsTable } from "@workspace/db";
import {
  type ContentEntityType,
  applyContentRevision,
  createContentRevision,
  getPreviewRevision,
  getRevision,
  listContentRevisions,
  rejectContentRevision,
} from "../lib/content-revisions";
import { canAdminAccess, getAdminRole, requireCapability } from "../middlewares/auth";

const router = Router();

function fmt(revision: any) {
  return {
    id: revision.id,
    entityType: revision.entityType,
    entityId: revision.entityId,
    entityLabel: revision.entityLabel,
    payload: revision.payload,
    status: revision.status,
    createdById: revision.createdById ?? null,
    createdByUsername: revision.createdByUsername ?? null,
    createdByRole: revision.createdByRole ?? null,
    approvedById: revision.approvedById ?? null,
    approvedByUsername: revision.approvedByUsername ?? null,
    approvedAt: revision.approvedAt?.toISOString?.() ?? revision.approvedAt ?? null,
    publishedAt: revision.publishedAt?.toISOString?.() ?? revision.publishedAt ?? null,
    rejectionReason: revision.rejectionReason ?? null,
    previewToken: revision.previewToken,
    previewExpiresAt: revision.previewExpiresAt?.toISOString?.() ?? revision.previewExpiresAt,
    basePayload: revision.basePayload ?? null,
    createdAt: revision.createdAt?.toISOString?.() ?? revision.createdAt,
  };
}

function canAccessRevision(req: any, revision: any): boolean {
  if (canAdminAccess(req, "content-approval")) return true;
  const admin = req.session?.admin;
  return Boolean(
    (admin?.id != null && revision.createdById === Number(admin.id)) ||
    (admin?.username && revision.createdByUsername === admin.username),
  );
}

// Editors can see their own revisions. Basic Admin and Super Admin can review
// the complete queue and approve, reject, restore, or publish revisions.
router.get("/admin/content-revisions", requireCapability("content"), async (req, res) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const entityType = typeof req.query.entityType === "string" ? req.query.entityType : undefined;
      const admin = (req as any).session.admin;
       const canReviewAll = canAdminAccess(req, "content-approval");
      const rows = await listContentRevisions({
        status,
        entityType,
         ...(!canReviewAll ? {
          createdById: Number.isInteger(Number(admin?.id)) ? Number(admin.id) : undefined,
          createdByUsername: String(admin?.username || ""),
        } : {}),
      });
    res.setHeader("Cache-Control", "no-store");
    res.json(rows.map(fmt));
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Unable to load content revisions" });
  }
});

router.get("/admin/content-revisions/:id", requireCapability("content"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid revision id" });
  const revision = await getRevision(id);
  if (!revision) return res.status(404).json({ error: "Revision not found" });
  if (!canAccessRevision(req, revision)) return res.status(404).json({ error: "Revision not found" });
  res.json(fmt(revision));
});

router.post("/admin/content-revisions/:id/approve", requireCapability("content-approval"), async (req, res) => {
  try {
    const revision = await applyContentRevision({
      revisionId: Number(req.params.id),
      req,
      forcePublish: false,
    });
    res.json(fmt(revision));
  } catch (error) {
    req.log.error(error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to approve revision" });
  }
});

router.post("/admin/content-revisions/:id/publish", requireCapability("content-approval"), async (req, res) => {
  try {
    const revision = await applyContentRevision({
      revisionId: Number(req.params.id),
      req,
      forcePublish: true,
    });
    res.json(fmt(revision));
  } catch (error) {
    req.log.error(error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to publish revision" });
  }
});

router.post("/admin/content-revisions/:id/reject", requireCapability("content-approval"), async (req, res) => {
  try {
    const revision = await rejectContentRevision({
      revisionId: Number(req.params.id),
      req,
      reason: typeof req.body?.reason === "string" ? req.body.reason : undefined,
    });
    res.json(fmt(revision));
  } catch (error) {
    req.log.error(error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to reject revision" });
  }
});

// Restoring is intentionally another draft, never a direct overwrite. This
// keeps the complete approval chain auditable even for old versions.
router.post("/admin/content-revisions/:id/restore", requireCapability("content"), async (req, res) => {
  try {
    const source = await getRevision(Number(req.params.id));
    if (!source) return res.status(404).json({ error: "Revision not found" });
    if (!canAccessRevision(req, source)) return res.status(404).json({ error: "Revision not found" });
    const revision = await createContentRevision({
      entityType: source.entityType as ContentEntityType,
      entityId: source.entityId,
      entityLabel: source.entityLabel,
      payload: source.payload,
      req,
    });
    res.status(202).json(fmt(revision));
  } catch (error) {
    req.log.error(error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to restore revision" });
  }
});

// Token-protected preview endpoint. The token is the permission; unpublished
// content is never exposed by the normal public CMS endpoints.
router.get("/content-preview/:token", async (req, res) => {
  const revision = await getPreviewRevision(String(req.params.token));
  if (!revision) return res.status(404).json({ error: "Preview expired or unavailable" });
  res.setHeader("Cache-Control", "no-store");
  res.json(fmt(revision));
});

export default router;