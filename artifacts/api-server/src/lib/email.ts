import nodemailer from "nodemailer";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { recordMonitoringEvent } from "./monitoring";

/** Escape HTML special chars — prevents XSS/HTML-injection in email templates */
function esc(raw: string | null | undefined): string {
  if (!raw) return "—";
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const EMAIL_TO_DEFAULT = process.env.EMAIL_TO || "sales@primepackagingboxes.co.uk";
const EMAIL_FROM_DEFAULT = process.env.EMAIL_FROM || "noreply@primepackagingboxes.com";

type SmtpCfg = {
  host: string; port: number; secure: boolean;
  user?: string; pass?: string; from: string; to: string;
  label: string;
};

/** Read both primary + secondary SMTP configs from DB (or env var fallback) */
async function getSmtpConfigs(): Promise<SmtpCfg[]> {
  const configs: SmtpCfg[] = [];
  try {
    const [row] = await db.select().from(siteSettingsTable).limit(1);
    if (row?.smtpHost) {
      configs.push({
        label: "Primary",
        host: row.smtpHost,
        port: row.smtpPort || 587,
        secure: row.smtpSecure === "true",
        user: row.smtpUser || undefined,
        pass: row.smtpPass || undefined,
        from: row.smtpFrom || EMAIL_FROM_DEFAULT,
        to: row.smtpTo || EMAIL_TO_DEFAULT,
      });
    }
    if (row?.smtp2Host) {
      configs.push({
        label: "Secondary",
        host: row.smtp2Host,
        port: row.smtp2Port || 587,
        secure: row.smtp2Secure === "true",
        user: row.smtp2User || undefined,
        pass: row.smtp2Pass || undefined,
        from: row.smtp2From || EMAIL_FROM_DEFAULT,
        to: row.smtpTo || EMAIL_TO_DEFAULT,   // shared deliver-to
      });
    }
  } catch (_) { /* fall through */ }

  // Env var fallback when DB has nothing
  if (configs.length === 0 && process.env.SMTP_HOST) {
    configs.push({
      label: "Env",
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: EMAIL_FROM_DEFAULT,
      to: EMAIL_TO_DEFAULT,
    });
  }
  return configs;
}

function buildTransport(cfg: SmtpCfg) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
}

/** Try primary SMTP; if it throws, automatically fall back to secondary */
async function sendWithFallback(message: Parameters<ReturnType<typeof nodemailer.createTransport>["sendMail"]>[0] & { from: string }) {
  const configs = await getSmtpConfigs();
  if (configs.length === 0) return null;     // no SMTP configured
  let lastErr: unknown;
  for (const cfg of configs) {
    try {
      const transport = buildTransport(cfg);
      await transport.sendMail({ ...message, from: cfg.from });
      console.log(`[EMAIL] Sent via ${cfg.label} (${cfg.host}): "${message.subject}"`);
      return cfg;
    } catch (err) {
      console.error(`[EMAIL] ${cfg.label} SMTP failed (${cfg.host}):`, err);
      lastErr = err;
    }
  }
  void recordMonitoringEvent({
    eventType: "email_failure",
    severity: "critical",
    message: "All configured SMTP providers failed",
    metadata: { providerCount: configs.length },
  });
  throw lastErr;   // all configs failed
}

/** For backwards compat — returns first available config or null */
async function createTransport() {
  const configs = await getSmtpConfigs();
  if (configs.length === 0) return null;
  const cfg = configs[0];
  return { transport: buildTransport(cfg), from: cfg.from, to: cfg.to };
}

/** Send a test email — exported for the SMTP test endpoint */
export async function testSmtp(): Promise<SmtpCfg | null> {
  const configs = await getSmtpConfigs();
  if (configs.length === 0) return null;
  const cfg = await sendWithFallback({
    from: configs[0].from,
    to: configs[0].to,
    subject: "✅ SMTP Test — Prime Packaging Boxes",
    html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
      <h2 style="color:#1a2f5a">SMTP Test Successful</h2>
      <p>Your email settings are working correctly. Emails from quotes and contact forms will be delivered to this inbox.</p>
      <p style="color:#6b7280;font-size:12px;margin-top:24px">Sent from Prime Packaging Boxes admin panel</p>
    </div>`,
    text: "SMTP Test Successful — Your email settings are working correctly.",
  });
  return cfg as SmtpCfg;
}

/** Generic send — for custom HTML emails (credentials, invoices, replies, etc.)
 *  Automatically tries primary SMTP first, falls back to secondary if primary fails. */
export async function sendEmail(data: { to: string; subject: string; html: string; text?: string }) {
  const configs = await getSmtpConfigs();
  if (configs.length === 0) {
    console.log("[EMAIL] No SMTP configured. Would send to:", data.to, "Subject:", data.subject);
    return;
  }
  await sendWithFallback({ from: configs[0].from, to: data.to, subject: data.subject, html: data.html, text: data.text });
}

export async function sendQuoteEmail(data: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  productType: string;
  quantity: string;
  timeline?: string | null;
  dimensions?: string | null;
  material?: string | null;
  printingDetails?: string | null;
  additionalNotes?: string | null;
}) {
  const configs = await getSmtpConfigs();
  if (configs.length === 0) {
    console.log("[EMAIL] No SMTP configured. Quote submission:", JSON.stringify(data, null, 2));
    return;
  }

  const rows = [
    ["Name", esc(data.name)],
    ["Email", esc(data.email)],
    ["Phone", esc(data.phone)],
    ["Company", esc(data.company)],
    ["Box Type", esc(data.productType)],
    ["Estimated Quantity", esc(data.quantity)],
    ["Timeline", esc(data.timeline)],
    ["Dimensions", esc(data.dimensions)],
    ["Material", esc(data.material)],
    ["Printing Options", esc(data.printingDetails)],
    ["Project Details", esc(data.additionalNotes)],
  ];

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <div style="background:#1a2f5a;padding:24px">
    <h1 style="color:#fff;margin:0;font-size:22px">📦 New Quote Request</h1>
    <p style="color:#94a3b8;margin:4px 0 0">Prime Packaging Boxes</p>
  </div>
  <div style="padding:24px">
    <table style="width:100%;border-collapse:collapse">
      ${rows.map(([label, value]) => `
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:10px 0;font-weight:bold;color:#374151;width:40%;vertical-align:top">${label}</td>
        <td style="padding:10px 0;color:#6b7280;vertical-align:top">${value}</td>
      </tr>`).join("")}
    </table>
  </div>
  <div style="background:#f8fafc;padding:16px 24px;font-size:12px;color:#94a3b8">
    Reply directly to this email to respond to ${data.name} at ${data.email}
  </div>
</div>`;

  try {
    await sendWithFallback({
      from: configs[0].from,
      to: configs[0].to,
      replyTo: data.email,
      subject: `New Quote Request — ${data.productType} — Prime Packaging Boxes`,
      html,
      text: rows.map(([l, v]) => `${l}: ${v}`).join("\n"),
    });
  } catch (err) {
    console.error("[EMAIL] Failed to send quote email (all SMTP tried):", err);
  }
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}) {
  const configs = await getSmtpConfigs();
  if (configs.length === 0) {
    console.log("[EMAIL] No SMTP configured. Contact submission:", JSON.stringify(data, null, 2));
    return;
  }

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <div style="background:#1a2f5a;padding:24px">
    <h1 style="color:#fff;margin:0;font-size:22px">✉️ New Contact Message</h1>
    <p style="color:#94a3b8;margin:4px 0 0">Prime Packaging Boxes</p>
  </div>
  <div style="padding:24px">
    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:10px 0;font-weight:bold;color:#374151;width:40%">Name</td>
        <td style="padding:10px 0;color:#6b7280">${esc(data.name)}</td>
      </tr>
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:10px 0;font-weight:bold;color:#374151">Email</td>
        <td style="padding:10px 0;color:#6b7280">${esc(data.email)}</td>
      </tr>
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:10px 0;font-weight:bold;color:#374151">Phone</td>
        <td style="padding:10px 0;color:#6b7280">${esc(data.phone)}</td>
      </tr>
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:10px 0;font-weight:bold;color:#374151">Subject</td>
        <td style="padding:10px 0;color:#6b7280">${esc(data.subject) || "General Inquiry"}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-weight:bold;color:#374151;vertical-align:top">Message</td>
        <td style="padding:10px 0;color:#6b7280;white-space:pre-wrap">${esc(data.message)}</td>
      </tr>
    </table>
  </div>
  <div style="background:#f8fafc;padding:16px 24px;font-size:12px;color:#94a3b8">
    Reply directly to this email to respond to ${esc(data.name)} at ${esc(data.email)}
  </div>
</div>`;

  try {
    await sendWithFallback({
      from: configs[0].from,
      to: configs[0].to,
      replyTo: data.email,
      subject: `Contact: ${data.subject || "General Inquiry"} — ${data.name}`,
      html,
      text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "—"}\nSubject: ${data.subject || "General Inquiry"}\n\n${data.message}`,
    });
  } catch (err) {
    console.error("[EMAIL] Failed to send contact email (all SMTP tried):", err);
  }
}
