import { Router } from "express";
import { db } from "@workspace/db";
import { pageTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireCapability } from "../middlewares/auth";
import { createContentRevision } from "../lib/content-revisions";
import { sanitizeInlineDocument } from "../lib/inline-content";

const router = Router();

const TEMPLATE_NAMES: Record<string, string> = {
  category: "Category Page Template",
  product: "Product Page Template",
  shop: "Shop / Products Listing Template",
  blog: "Blog Listing Template",
};

const CURRENT_TEMPLATE_VERSION = 2;
const INLINE_DOCUMENT_MARKER = "__prime_inline_page_v1";

function isCurrentTemplateContent(content: unknown): boolean {
  if (typeof content !== "string") return false;
  try {
    return JSON.parse(content)?.builderVersion === CURRENT_TEMPLATE_VERSION;
  } catch {
    return false;
  }
}

function isInlineTemplateContent(content: unknown): boolean {
  if (typeof content !== "string") return false;
  try {
    const parsed = JSON.parse(content);
    return parsed?.[INLINE_DOCUMENT_MARKER] === true
      && typeof parsed.baseContent === "string"
      && parsed.overrides
      && typeof parsed.overrides === "object";
  } catch {
    return false;
  }
}

function currentTemplateContent(type: string, content: unknown): string {
  if (isInlineTemplateContent(content)) return String(content);
  return isCurrentTemplateContent(content)
    ? String(content)
    : JSON.stringify(DEFAULTS[type] || []);
}

// Default templates
const DEFAULTS: Record<string, any[]> = {
  category: [
    { id: "d1", type: "dynamic_hero", data: { useTitle: true, useDescription: true, useImage: true, buttonText: "Get Free Quote", buttonLink: "/get-a-quote", bgColor: "#1a2f5a", mode: "category" } },
    { id: "d2", type: "trust_bar", data: { items: ["🎨 Free Custom Design", "🚚 Free US Shipping", "⚡ 6-8 Day Turnaround", "✅ 100% Satisfaction Guaranteed", "📦 Low 100-Unit MOQ"] } },
    { id: "d3", type: "products_grid", data: { heading: "", showCategoryFilter: false, limit: 20 } },
    { id: "d4", type: "cta", data: { heading: "Need a Custom Size?", text: "Tell us what you need and we'll create it for you.", buttonText: "Get a Free Quote", buttonLink: "/get-a-quote", bgColor: "#1a2f5a" } },
  ],
  product: [
    { id: "d1", type: "dynamic_hero", data: { useTitle: true, useDescription: true, useImage: false, mode: "product", bgColor: "#1a2f5a" } },
    { id: "d2", type: "features", data: { heading: "Why Choose Our Packaging", items: [{ icon: "🎨", title: "Free Design Support", text: "Expert designers work with you at no cost." }, { icon: "📦", title: "Low MOQ", text: "Start from just 100 units. No huge minimums." }, { icon: "⚡", title: "Fast Turnaround", text: "6–8 business days from proof approval." }, { icon: "🚚", title: "Free US Shipping", text: "Free shipping on all orders to US addresses." }] } },
    { id: "d3", type: "cta", data: { heading: "Ready to Order Your Custom Packaging?", text: "Get a free quote — no commitment required.", buttonText: "Get a Free Quote", buttonLink: "/get-a-quote", bgColor: "#e63329" } },
  ],
  shop: [
    { id: "d1", type: "hero", data: { heading: "Shop All Products", subheading: "Premium custom packaging for every need. Low minimums, fast turnaround.", buttonText: "Get a Free Quote", buttonLink: "/get-a-quote", bgColor: "#1a2f5a" } },
    { id: "d2", type: "trust_bar", data: { items: ["🎨 Free Custom Design", "🚚 Free US Shipping", "⚡ 6-8 Day Turnaround", "✅ 100% Satisfaction Guaranteed", "📦 Low 100-Unit MOQ"] } },
    { id: "d3", type: "products_grid", data: { heading: "All Products", showSearch: true, showCategoryFilter: true, limit: 50 } },
    { id: "d4", type: "cta", data: { heading: "Can't Find What You Need?", text: "We build completely custom packaging solutions.", buttonText: "Contact Us", buttonLink: "/contact", bgColor: "#1a2f5a" } },
  ],
  blog: [
    { id: "d1", type: "hero", data: { heading: "Packaging Insights", subheading: "Tips, trends, and ideas for brands that care about their packaging.", buttonText: "Get a Free Quote", buttonLink: "/get-a-quote", bgColor: "#1a2f5a" } },
    { id: "d2", type: "blog_grid", data: { heading: "Latest Articles", limit: 12, columns: 3 } },
    { id: "d3", type: "cta", data: { heading: "Ready to Upgrade Your Packaging?", text: "Join 500+ brands using Prime Packaging Boxes.", buttonText: "Get a Free Quote", buttonLink: "/get-a-quote", bgColor: "#e63329" } },
  ],
};

// GET /admin/templates/:type
router.get("/admin/templates/:type", requireCapability("content"), async (req, res) => {
  try {
    const type = String(req.params.type);
    if (!TEMPLATE_NAMES[type]) return res.status(404).json({ error: "Unknown template type" });

    const [row] = await db.select().from(pageTemplatesTable).where(eq(pageTemplatesTable.type, type));
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    if (row) {
      res.json({ type: row.type, name: row.name, content: currentTemplateContent(type, row.content), updatedAt: row.updatedAt });
    } else {
      res.json({ type, name: TEMPLATE_NAMES[type], content: JSON.stringify(DEFAULTS[type] || []), updatedAt: null });
    }
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /templates/:type (public — used by frontend)
router.get("/templates/:type", async (req, res) => {
  try {
    const type = String(req.params.type);
    if (!TEMPLATE_NAMES[type]) return res.status(404).json({ error: "Unknown template type" });

    const [row] = await db.select().from(pageTemplatesTable).where(eq(pageTemplatesTable.type, type));
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    const content = currentTemplateContent(type, row?.content);
    res.json({ type, content });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /admin/templates/:type
router.put("/admin/templates/:type", requireCapability("content"), async (req, res) => {
  try {
    const type = String(req.params.type);
    if (!TEMPLATE_NAMES[type]) return res.status(404).json({ error: "Unknown template type" });
    const { content } = req.body;
    if (typeof content !== "string") return res.status(400).json({ error: "content must be a JSON string" });
    const sanitizedContent = sanitizeInlineDocument(content);

    const [existing] = await db.select().from(pageTemplatesTable).where(eq(pageTemplatesTable.type, type));
    let row;
    if (existing) {
      row = existing;
    } else {
      [row] = await db.insert(pageTemplatesTable).values({ type, name: TEMPLATE_NAMES[type], content: null }).returning();
    }
    const revision = await createContentRevision({
      entityType: "template",
      entityId: row.id,
      entityLabel: row.name,
      payload: { type, content: sanitizedContent },
      req,
    });
    res.status(202).json({ ...row, content: existing?.content ?? null, workflow: "pending", revisionId: revision.id, previewToken: revision.previewToken });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
