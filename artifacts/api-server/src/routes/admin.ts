import { Router } from "express";
import { db } from "@workspace/db";
import { quotesTable, leadsTable, productsTable, categoriesTable, blogPostsTable, siteSettingsTable } from "@workspace/db";
import { eq, count, desc, sql, and, gte } from "drizzle-orm";
import { AdminLoginBody, UpdateSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";
import { invalidateCountryBlockCache } from "../middlewares/countryBlock";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = AdminLoginBody.parse(req.body);
    const crypto = await import("crypto");

    let matchedUser: { username: string; role: string; id?: number } | null = null;

    // 1. Check superadmin — support DB-stored pw override or env variable
    if (username === ADMIN_USERNAME) {
      const [settings] = await db.select().from(siteSettingsTable).limit(1);
      const dbPwHash = (settings as any)?.superadminPwHash;
      let pwOk = false;
      if (dbPwHash) {
        const hash = crypto.createHash("sha256").update(password + "prime_salt_2024").digest("hex");
        pwOk = hash === dbPwHash;
      } else if (ADMIN_PASSWORD) {
        pwOk = password === ADMIN_PASSWORD;
      }
      if (pwOk) matchedUser = { username, role: "superadmin" };
    }

    // 2. Check admin_users table
    if (!matchedUser) {
      const hash = crypto.createHash("sha256").update(password + "prime_salt_2024").digest("hex");
      const rows = await db.execute(
        sql`SELECT id, username, email, role, totp_enabled FROM admin_users WHERE username = ${username} AND password_hash = ${hash} LIMIT 1`
      );
      const user = rows.rows[0] as any;
      if (user) matchedUser = { username: user.username, role: user.role, id: user.id };
    }

    if (!matchedUser) return res.status(401).json({ error: "Invalid credentials" });

    // 3. Check if 2FA is enabled for this user
    let totpEnabled = false;
    if (matchedUser.username === ADMIN_USERNAME) {
      const [settings] = await db.select().from(siteSettingsTable).limit(1);
      totpEnabled = (settings as any)?.superadminTotpEnabled === "true";
    } else {
      const uResult = await db.execute(sql`SELECT totp_enabled FROM admin_users WHERE username = ${matchedUser.username} LIMIT 1`);
      totpEnabled = !!(uResult as any)?.rows?.[0]?.totp_enabled;
    }

    if (totpEnabled) {
      // Store pending — require 2FA verification
      (req as any).session.pendingAdmin = matchedUser;
      return res.json({ success: false, requires2fa: true });
    }

    // Regenerate session on login to prevent session fixation attacks
    await new Promise<void>((resolve, reject) => {
      (req as any).session.regenerate((err: any) => err ? reject(err) : resolve());
    });
    (req as any).session.admin = matchedUser;
    return res.json({ success: true, user: { username: matchedUser.username, role: matchedUser.role } });
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
});

// POST /admin/logout
router.post("/admin/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

// GET /admin/me
router.get("/admin/me", (req, res) => {
  const admin = (req as any).session?.admin;
  if (!admin) return res.status(401).json({ error: "Not authenticated" });
  res.json({ username: admin.username, role: admin.role ?? "superadmin", id: admin.id ?? null });
});

// GET /admin/stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOf6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      [totalProducts], [totalCategories], [totalQuotes], [totalLeads], [totalBlogPosts],
      recentQuotes, recentLeads,
      [newQuotesRow], [newLeadsRow],
      monthlyQuotesRaw, monthlyLeadsRaw,
      todayQRaw, todayLRaw,
      settings,
    ] = await Promise.all([
      db.select({ cnt: count() }).from(productsTable),
      db.select({ cnt: count() }).from(categoriesTable),
      db.select({ cnt: count() }).from(quotesTable),
      db.select({ cnt: count() }).from(leadsTable),
      db.select({ cnt: count() }).from(blogPostsTable),
      db.select().from(quotesTable).orderBy(desc(quotesTable.createdAt)).limit(8),
      db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt)).limit(8),
      db.select({ cnt: count() }).from(quotesTable).where(eq(quotesTable.status, "new")),
      db.select({ cnt: count() }).from(leadsTable).where(eq(leadsTable.status, "new")),
      db.execute(sql`SELECT TO_CHAR(created_at,'YYYY-MM') as month, COUNT(*)::int as cnt FROM quotes WHERE created_at >= ${startOf6MonthsAgo} GROUP BY month ORDER BY month`),
      db.execute(sql`SELECT TO_CHAR(created_at,'YYYY-MM') as month, COUNT(*)::int as cnt FROM leads  WHERE created_at >= ${startOf6MonthsAgo} GROUP BY month ORDER BY month`),
      db.execute(sql`SELECT COUNT(*)::int as cnt FROM quotes WHERE follow_up_done = false AND follow_up_date IS NOT NULL AND follow_up_date::date = CURRENT_DATE`),
      db.execute(sql`SELECT COUNT(*)::int as cnt FROM leads  WHERE follow_up_done = false AND follow_up_date IS NOT NULL AND follow_up_date::date = CURRENT_DATE`),
      db.select().from(siteSettingsTable).limit(1),
    ]);

    // Build last 6 months labels
    const months: { label: string; month: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short" });
      months.push({ label, month });
    }

    const qMap = new Map((monthlyQuotesRaw.rows as any[]).map(r => [r.month, Number(r.cnt)]));
    const lMap = new Map((monthlyLeadsRaw.rows as any[]).map(r => [r.month, Number(r.cnt)]));
    const monthlyTrend = months.map(({ label, month }) => ({
      month: label,
      quotes: qMap.get(month) ?? 0,
      leads:  lMap.get(month) ?? 0,
    }));

    const todayFollowUps = (Number((todayQRaw.rows[0] as any)?.cnt) || 0)
                         + (Number((todayLRaw.rows[0] as any)?.cnt) || 0);
    const smtpConfigured = !!(settings[0]?.smtpHost);

    res.json({
      totalProducts: Number(totalProducts.cnt),
      totalCategories: Number(totalCategories.cnt),
      totalQuotes: Number(totalQuotes.cnt),
      newQuotes: Number(newQuotesRow.cnt),
      totalLeads: Number(totalLeads.cnt),
      newLeads: Number(newLeadsRow.cnt),
      totalBlogPosts: Number(totalBlogPosts.cnt),
      todayFollowUps,
      smtpConfigured,
      monthlyTrend,
      recentQuotes: recentQuotes.map(fmtQ),
      recentLeads: recentLeads.map(fmtL),
    });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /settings (public) — only safe, non-sensitive fields
const PUBLIC_SETTINGS_KEYS = new Set([
  "id", "phone", "email", "address", "whatsapp",
  "facebook", "instagram", "twitter", "linkedin",
  "metaTitle", "metaDescription", "announcementBar",
  "logoUrl", "faviconUrl", "siteName",
  "clarkEnabled", "clarkBotName", "clarkGreeting",
  "clarkCompanyPhone", "clarkCompanyEmail", "clarkCompanyAddress",
  "clarkToneNotes", "clarkQuoteHours", "clarkCustomFaqs",
]);

function filterPublicSettings(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const key of PUBLIC_SETTINGS_KEYS) {
    if (key in row) out[key] = row[key];
  }
  return out;
}

router.get("/settings", async (req, res) => {
  try {
    const [row] = await db.select().from(siteSettingsTable).limit(1);
    const data = row ? filterPublicSettings(row as any) : getDefaults();
    res.json(data);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/settings
router.get("/admin/settings", requireAdmin, async (req, res) => {
  try {
    const [row] = await db.select().from(siteSettingsTable).limit(1);
    res.json(row ?? getDefaults());
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/settings (also aliased as PUT for generated client compatibility)
async function handleUpdateSettings(req: any, res: any) {
  try {
    // Allow core settings + SMTP fields
    const base = UpdateSettingsBody.parse(req.body);
    const body = req.body as any;
    const smtpFields: Record<string, any> = {};
    if (body.smtpHost   !== undefined) smtpFields.smtpHost   = body.smtpHost   || null;
    if (body.smtpPort   !== undefined) smtpFields.smtpPort   = body.smtpPort ? Number(body.smtpPort) : null;
    if (body.smtpUser   !== undefined) smtpFields.smtpUser   = body.smtpUser   || null;
    if (body.smtpPass   !== undefined) smtpFields.smtpPass   = body.smtpPass   || null;
    if (body.smtpFrom   !== undefined) smtpFields.smtpFrom   = body.smtpFrom   || null;
    if (body.smtpTo     !== undefined) smtpFields.smtpTo     = body.smtpTo     || null;
    if (body.smtpSecure !== undefined) smtpFields.smtpSecure = body.smtpSecure || null;
    // Secondary / fallback SMTP
    if (body.smtp2Host   !== undefined) smtpFields.smtp2Host   = body.smtp2Host   || null;
    if (body.smtp2Port   !== undefined) smtpFields.smtp2Port   = body.smtp2Port ? Number(body.smtp2Port) : null;
    if (body.smtp2User   !== undefined) smtpFields.smtp2User   = body.smtp2User   || null;
    if (body.smtp2Pass   !== undefined) smtpFields.smtp2Pass   = body.smtp2Pass   || null;
    if (body.smtp2From   !== undefined) smtpFields.smtp2From   = body.smtp2From   || null;
    if (body.smtp2Secure !== undefined) smtpFields.smtp2Secure = body.smtp2Secure || null;

    // Extended fields
    const extFields: Record<string, any> = {};
    if (body.robotsTxt            !== undefined) extFields.robotsTxt            = body.robotsTxt || null;
    if (body.sitemapSettings      !== undefined) extFields.sitemapSettings      = body.sitemapSettings || null;
    if (body.blockedCountries     !== undefined) extFields.blockedCountries     = body.blockedCountries || null;
    if (body.countryBlockEnabled  !== undefined) extFields.countryBlockEnabled  = body.countryBlockEnabled || "false";
    if (body.logoUrl              !== undefined) extFields.logoUrl              = body.logoUrl || null;
    if (body.faviconUrl           !== undefined) extFields.faviconUrl           = body.faviconUrl || null;
    if (body.geminiApiKey         !== undefined) extFields.geminiApiKey         = body.geminiApiKey || null;

    // Clark AI config fields
    if (body.clarkEnabled         !== undefined) extFields.clarkEnabled         = body.clarkEnabled ?? "true";
    if (body.clarkBotName         !== undefined) extFields.clarkBotName         = body.clarkBotName || null;
    if (body.clarkGreeting        !== undefined) extFields.clarkGreeting        = body.clarkGreeting || null;
    if (body.clarkCompanyPhone    !== undefined) extFields.clarkCompanyPhone    = body.clarkCompanyPhone || null;
    if (body.clarkCompanyEmail    !== undefined) extFields.clarkCompanyEmail    = body.clarkCompanyEmail || null;
    if (body.clarkCompanyAddress  !== undefined) extFields.clarkCompanyAddress  = body.clarkCompanyAddress || null;
    if (body.clarkToneNotes       !== undefined) extFields.clarkToneNotes       = body.clarkToneNotes || null;
    if (body.clarkQuoteHours      !== undefined) extFields.clarkQuoteHours      = body.clarkQuoteHours || "2";
    if (body.clarkCustomFaqs      !== undefined) extFields.clarkCustomFaqs      = body.clarkCustomFaqs || null;
    // Contact & social
    if (body.whatsapp             !== undefined) extFields.whatsapp             = body.whatsapp || null;
    if (body.facebook             !== undefined) extFields.facebook             = body.facebook || null;
    if (body.instagram            !== undefined) extFields.instagram            = body.instagram || null;
    if (body.twitter              !== undefined) extFields.twitter              = body.twitter || null;
    if (body.linkedin             !== undefined) extFields.linkedin             = body.linkedin || null;
    // Global SEO
    if (body.metaTitle            !== undefined) extFields.metaTitle            = body.metaTitle || null;
    if (body.metaDescription      !== undefined) extFields.metaDescription      = body.metaDescription || null;
    // Announcement bar
    if (body.announcementBar      !== undefined) extFields.announcementBar      = body.announcementBar || null;
    // Site name (also in base schema but handle here for safety)
    if (body.siteName             !== undefined) extFields.siteName             = body.siteName || null;

    const data = { ...base, ...smtpFields, ...extFields };
    const [existing] = await db.select().from(siteSettingsTable).limit(1);
    let row;
    if (existing) {
      [row] = await db.update(siteSettingsTable).set(data as any).where(eq(siteSettingsTable.id, existing.id)).returning();
    } else {
      [row] = await db.insert(siteSettingsTable).values(data as any).returning();
    }
    if (body.countryBlockEnabled !== undefined || body.blockedCountries !== undefined) {
      invalidateCountryBlockCache();
    }
    res.json(row);
  } catch (e) {
    req.log.error(e);
    res.status(400).json({ error: "Bad request" });
  }
}

// Accept both PATCH (standard) and PUT (generated API client sends PUT)
router.patch("/admin/settings", requireAdmin, handleUpdateSettings);
router.put("/admin/settings",   requireAdmin, handleUpdateSettings);

// POST /admin/smtp-test — send a test email using configured SMTP (primary → fallback)
router.post("/admin/smtp-test", requireAdmin, async (req: any, res: any) => {
  try {
    const { testSmtp } = await import("../lib/email.js");
    const result = await testSmtp();
    if (!result) return res.status(400).json({ error: "No SMTP configured. Add SMTP settings and save first." });
    res.json({ ok: true, via: result.label, host: result.host });
  } catch (err: any) {
    req.log.error(err, "SMTP test failed");
    res.status(500).json({ error: err?.message || "SMTP test failed — check your credentials." });
  }
});

// ── Clark live-session routes ─────────────────────────────────────────────────

// GET /admin/clark/sessions — conversations active in last 30 min
router.get("/admin/clark/sessions", requireAdmin, async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const rows = await db
      .select({
        id: quotesTable.id,
        name: quotesTable.name,
        email: quotesTable.email,
        productType: quotesTable.productType,
        clarkSessionId: quotesTable.clarkSessionId,
        clarkTranscript: quotesTable.clarkTranscript,
        clarkLastActivity: quotesTable.clarkLastActivity,
        adminTookOver: quotesTable.adminTookOver,
        adminPendingMessage: quotesTable.adminPendingMessage,
        status: quotesTable.status,
      })
      .from(quotesTable)
      .where(
        and(
          eq(quotesTable.source, "clark"),
          gte(quotesTable.clarkLastActivity, cutoff)
        )
      )
      .orderBy(desc(quotesTable.clarkLastActivity));
    res.json(rows);
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/clark/sessions/:sessionId/inject — send admin message to customer
router.post("/admin/clark/sessions/:sessionId/inject", requireAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body as { message?: string };
    if (!message?.trim()) return res.status(400).json({ error: "message required" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedRows: any[] = await (db as any)
      .update(quotesTable)
      .set({ adminPendingMessage: message.trim(), adminTookOver: true })
      .where(eq(quotesTable.clarkSessionId, String(sessionId)))
      .returning({ id: quotesTable.id });

    if (!updatedRows?.[0]) return res.status(404).json({ error: "Session not found" });
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/clark/sessions/:sessionId/release — hand back to AI
router.post("/admin/clark/sessions/:sessionId/release", requireAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;
    await db
      .update(quotesTable)
      .set({ adminTookOver: false, adminPendingMessage: null } as any)
      .where(eq(quotesTable.clarkSessionId, String(sessionId)));
    res.json({ success: true });
  } catch (e) {
    req.log.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

function getDefaults() {
  return {
    phone: "818-758-4076",
    email: "help@primepackagingboxes.com",
    address: "444 Alaska Avenue Suite Torrance, CA 90503 USA",
    whatsapp: "18187584076",
    facebook: null, instagram: null, twitter: null, linkedin: null,
    metaTitle: "Prime Packaging Boxes — Custom Packaging That Sells Your Brand",
    metaDescription: "Premium custom boxes, mailers, and retail packaging — designed, printed, and shipped fast. Low minimums, free design support, and a price you will love.",
    announcementBar: null,
  };
}

function fmtQ(q: any) {
  return { id: q.id, name: q.name, email: q.email, phone: q.phone ?? null, company: q.company ?? null, productType: q.productType, quantity: q.quantity, dimensions: q.dimensions ?? null, material: q.material ?? null, printingDetails: q.printingDetails ?? null, additionalNotes: q.additionalNotes ?? null, status: q.status, createdAt: q.createdAt?.toISOString?.() ?? q.createdAt };
}

function fmtL(l: any) {
  return { id: l.id, name: l.name, email: l.email, phone: l.phone ?? null, subject: l.subject ?? null, message: l.message, status: l.status, createdAt: l.createdAt?.toISOString?.() ?? l.createdAt };
}

export default router;
