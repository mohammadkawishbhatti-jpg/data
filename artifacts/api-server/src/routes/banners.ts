import { Router } from "express";
import { db } from "@workspace/db";
import { bannersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateBannerBody,
  UpdateBannerBody,
  UpdateBannerParams,
  DeleteBannerParams,
} from "@workspace/api-zod";
import { canEditContentLive, requireCapability } from "../middlewares/auth";
import {
  createContentRevision,
  revisionPayloadFromBanner,
} from "../lib/content-revisions";

const router = Router();

// GET /banners
router.get("/banners", async (req, res) => {
  try {
    const rows = await db.select().from(bannersTable)
      .where(eq(bannersTable.isActive, true))
      .orderBy(bannersTable.sortOrder);
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: GET /admin/banners
router.get("/admin/banners", requireCapability("catalog"), async (req, res) => {
  try {
    const rows = await db.select().from(bannersTable).orderBy(bannersTable.sortOrder);
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: POST /admin/banners
router.post("/admin/banners", requireCapability("catalog"), async (req, res) => {
  try {
    const data = CreateBannerBody.parse(req.body);
    if (!canEditContentLive(req)) {
      const revision = await createContentRevision({
        entityType: "banner",
        entityId: 0,
        entityLabel: data.title,
        payload: revisionPayloadFromBanner(data, {}, "create"),
        req,
      });
      return res.status(202).json({
        pendingApproval: true,
        revisionId: revision.id,
        banner: fmt({ id: 0, ...data }),
      });
    }
    const [row] = await db.insert(bannersTable).values(data).returning();
    res.status(201).json({ pendingApproval: false, ...fmt(row) });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: PUT /admin/banners/:id
router.put("/admin/banners/:id", requireCapability("catalog"), async (req, res) => {
  try {
    const { id } = UpdateBannerParams.parse(req.params);
    const data = UpdateBannerBody.parse(req.body);
    const [existing] = await db.select().from(bannersTable).where(eq(bannersTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (!canEditContentLive(req)) {
      const revision = await createContentRevision({
        entityType: "banner",
        entityId: id,
        entityLabel: String((data as any).title ?? existing.title),
        payload: revisionPayloadFromBanner(existing, data),
        req,
      });
      return res.status(202).json({
        pendingApproval: true,
        revisionId: revision.id,
        banner: fmt({ ...existing, ...data }),
      });
    }
    const [row] = await db.update(bannersTable).set(data)
      .where(eq(bannersTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ pendingApproval: false, ...fmt(row) });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: DELETE /admin/banners/:id
router.delete("/admin/banners/:id", requireCapability("catalog"), async (req, res) => {
  try {
    const { id } = DeleteBannerParams.parse(req.params);
    const [existing] = await db.select({ id: bannersTable.id, title: bannersTable.title })
      .from(bannersTable)
      .where(eq(bannersTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (!canEditContentLive(req)) {
      const revision = await createContentRevision({
        entityType: "banner",
        entityId: id,
        entityLabel: existing.title,
        payload: { operation: "delete", title: existing.title },
        req,
      });
      return res.status(202).json({
        success: true,
        pendingApproval: true,
        revisionId: revision.id,
        bannerId: id,
      });
    }
    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    res.json({ success: true, pendingApproval: false });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

function fmt(b: any) {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? null,
    imageUrl: b.imageUrl ?? null,
    linkUrl: b.linkUrl ?? null,
    linkText: b.linkText ?? null,
    isActive: b.isActive,
    sortOrder: b.sortOrder,
  };
}

export default router;
