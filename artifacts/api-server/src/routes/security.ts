import { Router } from "express";
import { db } from "@workspace/db";
import { adminUsersTable, siteSettingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
// otplib v13 — functional API (authenticator class removed in v13)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const otplib = require("otplib") as {
  generateSecret: () => string;
  generateURI: (opts: { label: string; issuer: string; secret: string; type: string }) => string;
  generate: (secret: string) => Promise<string>;
  verify: (opts: { token: string; secret: string }) => Promise<boolean>;
};
import QRCode from "qrcode";
import crypto from "crypto";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "PrimeAdmin2024!";
const SALT = "prime_salt_2024";

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.admin) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// ── GET /admin/security/2fa/status ───────────────────────────────────────────
router.get("/admin/security/2fa/status", requireAdmin, async (req: any, res) => {
  try {
    const { username } = req.session.admin;
    if (username === ADMIN_USERNAME) {
      // superadmin: check site_settings
      const [row] = await db.select().from(siteSettingsTable).limit(1);
      return res.json({ enabled: !!(row as any)?.superadminTotpEnabled === true || (row as any)?.superadminTotpEnabled === "true" });
    }
    const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));
    res.json({ enabled: user?.totpEnabled ?? false });
  } catch (e) { res.status(500).json({ error: "Server error" }); }
});

// ── POST /admin/security/2fa/setup — generate secret + QR ───────────────────
router.post("/admin/security/2fa/setup", requireAdmin, async (req: any, res) => {
  try {
    const { username } = req.session.admin;
    const secret = otplib.generateSecret();
    const otpauth = otplib.generateURI({
      label: username,
      issuer: "Prime Packaging Admin",
      secret,
      type: "totp",
    });
    const qrDataUrl = await QRCode.toDataURL(otpauth);

    // Store secret temporarily in session (not DB yet — confirm after verify)
    req.session.pendingTotpSecret = secret;

    res.json({ secret, qrDataUrl });
  } catch (e) { console.error("2FA setup error:", e); res.status(500).json({ error: "Server error" }); }
});

// ── POST /admin/security/2fa/confirm — verify OTP then enable ───────────────
router.post("/admin/security/2fa/confirm", requireAdmin, async (req: any, res) => {
  try {
    const { token } = req.body;
    const secret = req.session.pendingTotpSecret;
    if (!secret) return res.status(400).json({ error: "No pending 2FA setup. Start setup first." });

    const valid = await otplib.verify({ token, secret });
    if (!valid) return res.status(400).json({ error: "Invalid OTP code. Try again." });

    const { username } = req.session.admin;

    if (username === ADMIN_USERNAME) {
      const [existing] = await db.select().from(siteSettingsTable).limit(1);
      if (existing) {
        await db.execute(sql`UPDATE site_settings SET superadmin_totp_secret = ${secret}, superadmin_totp_enabled = 'true' WHERE id = ${existing.id}`);
      } else {
        await db.execute(sql`INSERT INTO site_settings (superadmin_totp_secret, superadmin_totp_enabled) VALUES (${secret}, 'true')`);
      }
    } else {
      await db.update(adminUsersTable)
        .set({ totpSecret: secret, totpEnabled: true })
        .where(eq(adminUsersTable.username, username));
    }

    delete req.session.pendingTotpSecret;
    req.session.admin.totpVerified = true;
    res.json({ success: true, message: "2FA enabled successfully." });
  } catch (e) { res.status(500).json({ error: "Server error" }); }
});

// ── POST /admin/security/2fa/disable ────────────────────────────────────────
router.post("/admin/security/2fa/disable", requireAdmin, async (req: any, res) => {
  try {
    const { token } = req.body;
    const { username } = req.session.admin;

    let secret: string | null = null;
    if (username === ADMIN_USERNAME) {
      const [row] = await db.select().from(siteSettingsTable).limit(1);
      secret = (row as any)?.superadminTotpSecret ?? null;
    } else {
      const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));
      secret = user?.totpSecret ?? null;
    }

    if (!secret) return res.status(400).json({ error: "2FA is not enabled." });
    const valid = await otplib.verify({ token, secret });
    if (!valid) return res.status(400).json({ error: "Invalid OTP code." });

    if (username === ADMIN_USERNAME) {
      await db.execute(sql`UPDATE site_settings SET superadmin_totp_secret = NULL, superadmin_totp_enabled = 'false' WHERE id = (SELECT id FROM site_settings LIMIT 1)`);
    } else {
      await db.update(adminUsersTable)
        .set({ totpSecret: null, totpEnabled: false })
        .where(eq(adminUsersTable.username, username));
    }

    res.json({ success: true, message: "2FA disabled." });
  } catch (e) { res.status(500).json({ error: "Server error" }); }
});

// ── POST /admin/security/2fa/verify-login — called after password check ──────
router.post("/admin/security/2fa/verify-login", async (req: any, res) => {
  try {
    const pending = req.session?.pendingAdmin;
    if (!pending) return res.status(400).json({ error: "No pending login." });

    const { token } = req.body;
    let secret: string | null = null;

    if (pending.username === ADMIN_USERNAME) {
      const [row] = await db.select().from(siteSettingsTable).limit(1);
      secret = (row as any)?.superadminTotpSecret ?? null;
    } else {
      const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, pending.username));
      secret = user?.totpSecret ?? null;
    }

    if (!secret) return res.status(400).json({ error: "2FA not configured." });
    const valid = await otplib.verify({ token, secret });
    if (!valid) return res.status(400).json({ error: "Invalid OTP code." });

    req.session.admin = { ...pending, totpVerified: true };
    delete req.session.pendingAdmin;
    res.json({ success: true, user: { username: pending.username, role: pending.role } });
  } catch (e) { res.status(500).json({ error: "Server error" }); }
});

// ── POST /admin/security/change-password ────────────────────────────────────
router.post("/admin/security/change-password", requireAdmin, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both fields required." });
    if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

    const { username } = req.session.admin;

    if (username === ADMIN_USERNAME) {
      // Superadmin uses env var — can't change via UI unless we store it in DB
      if (currentPassword !== ADMIN_PASSWORD) return res.status(400).json({ error: "Current password is incorrect." });
      // Store new password in site_settings as override
      const [existing] = await db.select().from(siteSettingsTable).limit(1);
      const newHash = crypto.createHash("sha256").update(newPassword + SALT).digest("hex");
      if (existing) {
        await db.execute(sql`UPDATE site_settings SET superadmin_pw_hash = ${newHash} WHERE id = ${existing.id}`);
      } else {
        await db.execute(sql`INSERT INTO site_settings (superadmin_pw_hash) VALUES (${newHash})`);
      }
      return res.json({ success: true, message: "Password updated." });
    }

    // DB admin user
    const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username));
    if (!user) return res.status(404).json({ error: "User not found." });

    const currentHash = crypto.createHash("sha256").update(currentPassword + SALT).digest("hex");
    if (user.passwordHash !== currentHash) return res.status(400).json({ error: "Current password is incorrect." });

    const newHash = crypto.createHash("sha256").update(newPassword + SALT).digest("hex");
    await db.update(adminUsersTable).set({ passwordHash: newHash }).where(eq(adminUsersTable.id, user.id));
    res.json({ success: true, message: "Password updated successfully." });
  } catch (e) { res.status(500).json({ error: "Server error" }); }
});

export default router;
