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
import { requireAdmin } from "../middlewares/auth";

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
router.get("/admin/banners", requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(bannersTable).orderBy(bannersTable.sortOrder);
    res.json(rows.map(fmt));
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: POST /admin/banners
router.post("/admin/banners", requireAdmin, async (req, res) => {
  try {
    const data = CreateBannerBody.parse(req.body);
    const [row] = await db.insert(bannersTable).values(data).returning();
    res.status(201).json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: PUT /admin/banners/:id
router.put("/admin/banners/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = UpdateBannerParams.parse(req.params);
    const data = UpdateBannerBody.parse(req.body);
    const [row] = await db.update(bannersTable).set(data)
      .where(eq(bannersTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// Admin: DELETE /admin/banners/:id
router.delete("/admin/banners/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = DeleteBannerParams.parse(req.params);
    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    res.json({ success: true });
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
