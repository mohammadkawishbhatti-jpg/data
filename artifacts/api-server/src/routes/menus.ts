import { Router } from "express";
import { db, menusTable, type MenuItem } from "@workspace/db";
import { AdminGetMenuResponse, AdminUpdateMenuBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { requireCapability, requireSameOrigin } from "../middlewares/auth";

const router = Router();
const KNOWN_PRODUCT_GROUPS = new Set(["By industry", "Hot selling", "By style / material"]);

function isSafeMenuHref(href: string) {
  if (/[\u0000-\u001f\u007f]/.test(href)) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const DEFAULT_PRIMARY_MENU: MenuItem[] = [
  { id: "home", label: "Home", href: "/", parentId: null, group: null, order: 10, isVisible: true, openInNewTab: false },
  { id: "products", label: "Products", href: "/products", parentId: null, group: null, order: 20, isVisible: true, openInNewTab: false },
  { id: "faq", label: "FAQ", href: "/faq", parentId: null, group: null, order: 30, isVisible: true, openInNewTab: false },
  { id: "blog", label: "Blog", href: "/blog", parentId: null, group: null, order: 40, isVisible: true, openInNewTab: false },
  { id: "about", label: "About", href: "/about", parentId: null, group: null, order: 50, isVisible: true, openInNewTab: false },
  { id: "contact", label: "Contact", href: "/contact", parentId: null, group: null, order: 60, isVisible: true, openInNewTab: false },
];

function serializeMenu(row: typeof menusTable.$inferSelect) {
  return AdminGetMenuResponse.parse({
    id: row.id,
    location: row.location,
    name: row.name,
    items: row.items ?? [],
    isActive: row.isActive,
    updatedAt: row.updatedAt?.toISOString() ?? null,
  });
}

function defaultMenu(location: string) {
  return AdminGetMenuResponse.parse({
    id: 0,
    location,
    name: location === "primary" ? "Primary navigation" : location,
    items: location === "primary" ? DEFAULT_PRIMARY_MENU : [],
    isActive: true,
    updatedAt: null,
  });
}

router.get("/menus/:location", async (req, res): Promise<void> => {
  try {
    const location = Array.isArray(req.params.location) ? req.params.location[0] : req.params.location;
    const [row] = await db.select().from(menusTable).where(eq(menusTable.location, location)).limit(1);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json(row ? serializeMenu(row) : defaultMenu(location));
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Unable to load navigation menu" });
  }
});

router.get("/admin/menus/:location", requireCapability("content"), async (req, res): Promise<void> => {
  try {
    const location = Array.isArray(req.params.location) ? req.params.location[0] : req.params.location;
    let [row] = await db.select().from(menusTable).where(eq(menusTable.location, location)).limit(1);
    if (!row) {
      [row] = await db.insert(menusTable).values({
        location,
        name: location === "primary" ? "Primary navigation" : location,
        items: location === "primary" ? DEFAULT_PRIMARY_MENU : [],
      }).returning();
    }
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json(serializeMenu(row));
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Unable to load navigation menu" });
  }
});

router.put("/admin/menus/:location", requireCapability("content"), requireSameOrigin, async (req, res): Promise<void> => {
  try {
    const location = Array.isArray(req.params.location) ? req.params.location[0] : req.params.location;
    const parsed = AdminUpdateMenuBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const items: MenuItem[] = parsed.data.items.map((item, index) => ({
      ...item,
      parentId: item.parentId ?? null,
      group: item.group ?? null,
      order: Number.isFinite(item.order) ? item.order : (index + 1) * 10,
    }));
    const ids = new Set(items.map(item => item.id));
    if (ids.size !== items.length) {
      res.status(400).json({ error: "Menu item IDs must be unique" });
      return;
    }
    for (const item of items) {
      if (!isSafeMenuHref(item.href)) {
        res.status(400).json({ error: `Unsafe menu URL for "${item.label}"` });
        return;
      }
      if (item.parentId && (item.parentId === item.id || !ids.has(item.parentId))) {
        res.status(400).json({ error: `Invalid parent for "${item.label}"` });
        return;
      }
      if (item.parentId) {
        const parent = items.find(candidate => candidate.id === item.parentId);
        if (parent?.parentId) {
          res.status(400).json({ error: "Menu nesting is limited to one submenu level" });
          return;
        }
      }
      if (item.group && item.parentId !== "products" && KNOWN_PRODUCT_GROUPS.has(item.group)) {
        res.status(400).json({ error: "Product mega-menu groups can only be used under Products" });
        return;
      }
    }
    const [existing] = await db.select().from(menusTable).where(eq(menusTable.location, location)).limit(1);
    const [row] = existing
      ? await db.update(menusTable).set({
          name: parsed.data.name,
          items,
          isActive: parsed.data.isActive ?? true,
          updatedAt: new Date(),
        }).where(eq(menusTable.id, existing.id)).returning()
      : await db.insert(menusTable).values({
          location,
          name: parsed.data.name,
          items,
          isActive: parsed.data.isActive ?? true,
        }).returning();

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json(serializeMenu(row));
  } catch (error) {
    req.log.error(error);
    res.status(400).json({ error: "Unable to save navigation menu" });
  }
});

export default router;