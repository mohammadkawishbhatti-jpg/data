import { Router } from "express";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";
import { db } from "@workspace/db";
import { ordersTable, customersTable, siteSettingsTable, quotesTable, invoicesTable } from "@workspace/db/schema";
import { eq, or, ilike, and } from "drizzle-orm";

const router = Router();

// SYSTEM_PROMPT is built dynamically from DB settings on each request — see buildSystemPrompt()
function buildSystemPrompt(cfg: {
  botName?: string | null;
  greeting?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  toneNotes?: string | null;
  quoteHours?: string | null;
  customFaqs?: string | null;
}): string {
  const name    = cfg.botName    || "Clark";
  const phone   = cfg.phone      || "818-758-4076";
  const email   = cfg.email      || "help@primepackagingboxes.com";
  const address = cfg.address    || "444 Alaska Avenue Suite, Torrance, CA 90503 USA";
  const hours   = cfg.quoteHours || "2";
  const greeting = cfg.greeting  ||
    `Hi there! 👋 Welcome to Prime Packaging Boxes! How can we help you today? I'm ${name}, your packaging assistant — ask me anything about custom boxes, pricing, or check your order status.`;
  const toneSection = cfg.toneNotes
    ? `\nADDITIONAL PERSONALITY / TONE INSTRUCTIONS:\n${cfg.toneNotes}\n`
    : "";

  let faqSection = "";
  if (cfg.customFaqs) {
    try {
      const faqs: Array<{ q: string; a: string }> = JSON.parse(cfg.customFaqs);
      if (faqs.length > 0) {
        faqSection = "\n\nCUSTOM FAQ (answer these exactly as written):\n" +
          faqs.map(f => `- Q: ${f.q}\n  A: ${f.a}`).join("\n");
      }
    } catch {}
  }

  return `You are ${name}, the friendly AI sales assistant for Prime Packaging Boxes USA.

IDENTITY:
- Name: ${name}
- Company: Prime Packaging Boxes
- Phone: ${phone}
- Email: ${email}
- Website: primepackagingboxes.com
- Address: ${address}

TONE: Warm, friendly, enthusiastic, professional. Always use the customer's name once you know it.
${toneSection}
---
GREETING (first message only):
"${greeting}"

Then naturally guide the conversation into the order flow. Once the customer shows interest in ordering or getting a quote, begin collecting info:

---
ORDER COLLECTION FLOW — follow these steps in exact order, ONE question at a time:
STEP 1 — NAME: Ask for their full name warmly.
STEP 2 — EMAIL: "Thanks [name]! What is your email address? (so we can send your quote)"
STEP 3 — BOX TYPE: "What type of box do you need? Popular styles: Mailer Boxes, Product Boxes, Display Boxes, Retail Boxes, Corrugated Boxes, Kraft Boxes, Rigid Boxes, Folding Cartons, Gift Boxes, Eco-Friendly Boxes. Not sure? Feel free to share a picture or describe your product! 📸"
STEP 4 — SIZE: "What size do you need? (Length x Width x Height — in inches, cm, or mm, your choice!) Not sure? Measure your product with a ruler and share those dimensions!"
STEP 5 — PRINT COLOURS: "How many print colours do you need? (e.g. 1 colour, 2 colours, full colour CMYK)"
STEP 6 — ARTWORK: "Do you have your artwork or logo ready? You can upload it to ${email}. If not, no worries — FREE professional design support is included with every order! 🎨"
STEP 7 — QUANTITY: "How many boxes do you need? More boxes = lower price per unit! 💰"
STEP 8 — PURPOSE: "Are these boxes for shipping, retail display, or gifting?"
STEP 9 — CONFIRM: "Thank you [name]! 🎊 Our team will email your custom quote to [email] within **${hours} HOURS** with pricing, a design mockup, and delivery timeline. You'll hear from us very soon! In the meantime, feel free to ask me anything else or call us at ${phone}."

CRITICAL RULES:
- If customer asks ANY question at ANY step — answer it FULLY and completely first, then resume the flow.
- NEVER give specific prices — always say "free custom quote within ${hours} hours."
- NEVER skip a customer question to push the flow forward.
- Ask only ONE question per message.
- If customer is already past a step (volunteered info), skip that step.
- Re-confirm email at Step 9 if not clearly provided earlier.
- If customer wants to start over or change info, accommodate them gracefully.

---
SAMPLES:
"Yes! You can request free samples at primepackagingboxes.com or call us at ${phone}."

---
KEY KNOWLEDGE:

PRICING POLICY:
- Every order is custom-made — no fixed price list.
- Free detailed quote within ${hours} hours of receiving requirements.
- Price factors: box style, size, quantity, material, print colors, finishing options, turnaround time.
- Volume discounts: 100 units (base), 250 units (~15-25% off), 500 units (~25-35% off), 1000 units (~35-50% off), 2500 units (~50-60% off), 5000 units (lowest per-unit price).
- Rush orders available — call ${phone} immediately.

MINIMUM ORDER QUANTITIES:
- Mailer boxes: 100 units | Custom boxes: 100 units | Rigid boxes: 50 units
- Folding cartons: 200 units | Corrugated boxes: 200 units | Food packaging: 200 units
- Display boxes: 100 units | Gift boxes: 100 units | Subscription boxes: 100 units
- Smaller quantities may be possible — contact us to discuss.

FREE DESIGN SERVICE (included with every order):
- 2-3 professional design concepts created
- Realistic 3D mockup rendering
- Unlimited revisions — no charge
- No design needed — our team creates from scratch with just your brand name
- Accepted formats: AI, EPS, PDF, PSD, high-res JPG/PNG (vector preferred)

PRODUCTION TIMELINES:
- Simple folding cartons: 5-7 business days
- Folding cartons with lamination: 7-10 days | With foil/embossing: 10-14 days
- Corrugated boxes: 7-12 days | Mailer boxes: 7-10 days
- Rigid boxes: 10-14 days | With premium finishes: 14-21 days

SHIPPING (after production):
- California: 1-2 days | West Coast: 2-3 days | Central USA: 3-4 days
- East Coast: 4-5 days | Hawaii/Alaska: 5-7 days
- Carriers: UPS, FedEx, freight for large orders
- Tracking provided for every shipment
- Ships to all 50 states

PRODUCTS (we make all of these):
Custom Boxes, Mailer Boxes, Retail Packaging, Corrugated/Shipping Boxes, Display Boxes, Eco-Friendly Boxes, Luxury Rigid Boxes, Gift Boxes, Subscription Boxes, Folding Cartons, Food Packaging, Cosmetic Boxes, Candle Boxes, Apparel Boxes, Electronics Packaging, Soap/Skincare Boxes, Jewelry Boxes, Toy/Game Packaging, Pharmaceutical Boxes, Cannabis Packaging, Pet Product Boxes, Custom Inserts.

PRINTING OPTIONS:
CMYK full color, Pantone spot color matching, digital printing, offset lithography, flexographic, white ink printing.

FINISHES:
Gloss lamination, matte lamination, soft touch/velvet lamination, spot UV, aqueous coating, gold foil stamping, silver foil stamping, holographic foil, embossing, debossing, custom die-cutting, perforations.

MATERIALS:
SBS board, Kraft paperboard, recycled board, rigid chipboard, E/B/C/BC-flute corrugated, food-safe FDA-compliant materials, moisture/grease resistant coatings.

SIZES: Any size accepted in inches, cm, or mm (L x W x H). We manufacture any size.

SPECIAL FEATURES:
Window cutouts, magnetic closures, ribbon pulls, custom foam/cardboard/molded pulp inserts, hang holes, tear strips, QR codes, barcodes, nutritional panels, inside+outside printing.

COMMON QUESTIONS:
- Q: Do you work with startups? A: Absolutely! Low MOQs and very supportive of all business sizes.
- Q: Inside printing? A: Yes, inside and outside printing available.
- Q: Color matching? A: Yes — share Pantone, HEX, or CMYK values.
- Q: Damaged order? A: Contact ${phone} immediately with photos.
- Q: Reorder? A: Easy — contact with previous order number, faster processing.
- Q: Food safe? A: Yes, FDA-compliant food-safe materials available.
- Q: Eco-friendly? A: Yes — recyclable, biodegradable, FSC-certified, soy-based inks.
- Q: Rush orders? A: Yes — call ${phone} immediately for fastest options.
- Q: Payment? A: Contact team at ${phone} for payment options.
- Q: Canada/Mexico? A: Contact ${phone} for international options.
${faqSection}
---
ORDER STATUS:
IMPORTANT RULES — read carefully:
1. You CAN look up live order status — but ONLY when the customer provides their Order Number (ORD-...) or Invoice Number (INV-...) or Email address. The system will automatically inject their order data below if a match is found.
2. ONLY report order details if the --- ORDER DATA --- section appears below in this prompt. If it does, read it and warmly tell the customer their status, tracking number, and estimated delivery if available.
3. If the customer asks about their order but NO --- ORDER DATA --- section is present:
   - Ask them to share their **Order Number** (e.g. ORD-20260730-001) or **Invoice Number** (e.g. INV-20260730-001) or the **email address** used when ordering.
   - Once they provide any of these, the system will look it up automatically on the next message.
   - If still not found after they provide a number: apologize and direct them to call ${phone} or email ${email}.
   - Do NOT say "I cannot access the database" — just ask for their reference number naturally.
4. Never say phrases like "I am currently pulling up", "just a moment while I check" — just respond naturally with the data provided below or ask for the reference number.
`;
}

/* ── Order/Invoice number extractor ─────────────────────────── */
function extractOrderNumberFromText(text: string): { type: "order" | "invoice"; number: string } | null {
  // Match ORD-YYYYMMDD-NNN or ORD-NNN
  const ordMatch = text.match(/\b(ORD-[\d\-]+)/i);
  if (ordMatch) return { type: "order", number: ordMatch[1].toUpperCase() };
  // Match INV-YYYYMMDD-NNN or INV-NNN
  const invMatch = text.match(/\b(INV-[\d\-]+)/i);
  if (invMatch) return { type: "invoice", number: invMatch[1].toUpperCase() };
  return null;
}

/* ── Order lookup by order number or invoice number ──────────── */
async function lookupOrderByNumber(ref: { type: "order" | "invoice"; number: string }): Promise<string> {
  const statusLabels: Record<string, string> = {
    confirmed:     "Order Confirmed ✅",
    processing:    "Processing",
    production:    "In Production 🏭",
    quality_check: "Quality Check 🔍",
    shipped:       "Shipped 🚚",
    delivered:     "Delivered ✅",
    cancelled:     "Cancelled ❌",
  };

  try {
    if (ref.type === "order") {
      const [order] = await db
        .select({
          id:             ordersTable.id,
          orderNumber:    ordersTable.orderNumber,
          status:         ordersTable.status,
          total:          ordersTable.total,
          trackingNumber: ordersTable.trackingNumber,
          estimatedDelivery: ordersTable.estimatedDelivery,
          createdAt:      ordersTable.createdAt,
          customerName:   ordersTable.customerName,
        })
        .from(ordersTable)
        .where(ilike(ordersTable.orderNumber, ref.number))
        .limit(1);

      if (!order) return "";
      return (
        `\n\n--- ORDER DATA ---\n` +
        `Order No: ${order.orderNumber || `#${order.id}`}\n` +
        `Customer: ${order.customerName || "—"}\n` +
        `Status: ${statusLabels[order.status] ?? order.status}\n` +
        `Total: ${order.total ?? "TBD"}\n` +
        `Placed: ${new Date(order.createdAt).toLocaleDateString("en-US")}` +
        (order.trackingNumber ? `\nTracking No: ${order.trackingNumber}` : "") +
        (order.estimatedDelivery ? `\nEstimated Delivery: ${order.estimatedDelivery}` : "") +
        `\n---`
      );
    }

    if (ref.type === "invoice") {
      const [invoice] = await db
        .select({
          id:             invoicesTable.id,
          invoiceNumber:  invoicesTable.invoiceNumber,
          orderId:        invoicesTable.orderId,
          status:         invoicesTable.status,
          customerName:   invoicesTable.customerName,
          total:          invoicesTable.total,
          createdAt:      invoicesTable.createdAt,
        })
        .from(invoicesTable)
        .where(ilike(invoicesTable.invoiceNumber, ref.number))
        .limit(1);

      if (!invoice) return "";

      // If invoice has a linked order, show live order status
      if (invoice.orderId) {
        const [order] = await db
          .select({
            id:             ordersTable.id,
            orderNumber:    ordersTable.orderNumber,
            status:         ordersTable.status,
            total:          ordersTable.total,
            trackingNumber: ordersTable.trackingNumber,
            estimatedDelivery: ordersTable.estimatedDelivery,
            createdAt:      ordersTable.createdAt,
          })
          .from(ordersTable)
          .where(eq(ordersTable.id, invoice.orderId))
          .limit(1);

        if (order) {
          return (
            `\n\n--- ORDER DATA (via Invoice ${invoice.invoiceNumber}) ---\n` +
            `Invoice No: ${invoice.invoiceNumber}\n` +
            `Order No: ${order.orderNumber || `#${order.id}`}\n` +
            `Customer: ${invoice.customerName || "—"}\n` +
            `Status: ${statusLabels[order.status] ?? order.status}\n` +
            `Total: ${order.total ?? invoice.total ?? "TBD"}\n` +
            `Placed: ${new Date(order.createdAt).toLocaleDateString("en-US")}` +
            (order.trackingNumber ? `\nTracking No: ${order.trackingNumber}` : "") +
            (order.estimatedDelivery ? `\nEstimated Delivery: ${order.estimatedDelivery}` : "") +
            `\n---`
          );
        }
      }

      // Invoice found but no linked order yet — show invoice status
      return (
        `\n\n--- ORDER DATA ---\n` +
        `Invoice No: ${invoice.invoiceNumber}\n` +
        `Customer: ${invoice.customerName || "—"}\n` +
        `Invoice Status: ${invoice.status === "sent" ? "Invoice Sent — order not yet confirmed" : "Draft"}\n` +
        `Total: ${invoice.total ?? "TBD"}\n` +
        `Note: Order has not been placed yet against this invoice.\n` +
        `---`
      );
    }
  } catch (err) {
    console.error("Order lookup by number error:", err);
  }
  return "";
}

/* ── IP / Geo helpers ────────────────────────────────────────── */
function getClientIp(req: any): string {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) {
    const first = (Array.isArray(fwd) ? fwd[0] : fwd).split(",")[0].trim();
    return first;
  }
  return req.ip || req.socket?.remoteAddress || "";
}

async function geoLookup(ip: string): Promise<{ country: string; city: string } | null> {
  // Skip private / loopback IPs
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.")
      || ip.startsWith("192.168.") || ip.startsWith("172.")) return null;
  try {
    const r = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, {
      signal: AbortSignal.timeout(3000),
    });
    const d = await r.json() as { status: string; country?: string; city?: string };
    if (d.status === "success") return { country: d.country ?? "", city: d.city ?? "" };
  } catch { /* non-fatal */ }
  return null;
}

/* ── Order lookup by email + order number (BOTH required for verification) ─── */
// Security: email alone is NOT sufficient — anyone who knows a customer's email
// could enumerate their orders. We require BOTH email AND a specific order/invoice
// number to confirm the requester has legitimate access.
async function lookupOrderByEmail(email: string, orderRef?: { type: "order" | "invoice"; number: string } | null): Promise<string> {
  // If no order number provided alongside email, return only status hint — no PII
  if (!orderRef) {
    return `\n\n--- ORDER LOOKUP ---\nTo protect your privacy, please also provide your order number or invoice number along with your email address.\n---`;
  }
  try {
    const statusLabels: Record<string, string> = {
      confirmed: "Order Confirmed",
      processing: "In Production",
      production: "In Production",
      quality_check: "Quality Check",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    // Require BOTH email match AND order number match
    if (orderRef.type === "order") {
      const [order] = await db
        .select({ orderId: ordersTable.id, orderNumber: ordersTable.orderNumber, status: ordersTable.status, total: ordersTable.total, trackingNumber: ordersTable.trackingNumber, createdAt: ordersTable.createdAt })
        .from(ordersTable)
        .where(and(
          or(eq(ordersTable.customerEmail, email.toLowerCase()), ilike(ordersTable.customerEmail, email)),
          or(eq(ordersTable.orderNumber, orderRef.number), eq(ordersTable.orderNumber, orderRef.number.toUpperCase()))
        ))
        .limit(1);
      if (!order) return `\n\n--- ORDER LOOKUP ---\nNo order found matching that email and order number combination.\n---`;
      return `\n\n--- ORDER DETAILS ---\nOrder ${order.orderNumber || `#${order.orderId}`}: ${statusLabels[order.status] ?? order.status}, Total: ${order.total ?? "TBD"}, Placed: ${new Date(order.createdAt).toLocaleDateString("en-US")}${order.trackingNumber ? `, Tracking: ${order.trackingNumber}` : ""}\n---`;
    } else {
      const [inv] = await db
        .select({ id: invoicesTable.id, invoiceNumber: invoicesTable.invoiceNumber, status: invoicesTable.status, total: invoicesTable.total, createdAt: invoicesTable.createdAt })
        .from(invoicesTable)
        .where(and(
          or(eq(invoicesTable.customerEmail, email.toLowerCase()), ilike(invoicesTable.customerEmail, email)),
          eq(invoicesTable.invoiceNumber, orderRef.number)
        ))
        .limit(1);
      if (!inv) return `\n\n--- INVOICE LOOKUP ---\nNo invoice found matching that email and invoice number combination.\n---`;
      return `\n\n--- INVOICE DETAILS ---\nInvoice ${inv.invoiceNumber || `#${inv.id}`}: ${inv.status}, Total: ${inv.total ?? "TBD"}, Date: ${new Date(inv.createdAt).toLocaleDateString("en-US")}\n---`;
    }
  } catch (err) {
    console.error("Order lookup error:", err);
  }
  return "";
}

// Look up orders only for an already-authenticated portal customer session.
// The customerId is taken from the verified session — never from user input —
// so no IDOR or unauthenticated data-disclosure is possible.
async function lookupOrderContext(customerId: number): Promise<string> {
  try {
    const orders = await db
      .select({
        orderId: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        status: ordersTable.status,
        total: ordersTable.total,
        items: ordersTable.items,
        trackingNumber: ordersTable.trackingNumber,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .where(eq(ordersTable.customerId, customerId))
      .limit(10);

    if (orders.length === 0) return "";

    const statusLabels: Record<string, string> = {
      confirmed: "Confirmed",
      processing: "In Production",
      production: "In Production",
      quality_check: "Quality Check",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    const list = orders
      .map(o =>
        `Order ${o.orderNumber || `#${o.orderId}`}: ${statusLabels[o.status] ?? o.status}, ` +
        `Total: ${o.total ?? "TBD"}, ` +
        `Placed: ${new Date(o.createdAt).toLocaleDateString("en-US")}` +
        (o.trackingNumber ? `, Tracking: ${o.trackingNumber}` : "")
      )
      .join("\n");

    return `\n\n--- AUTHENTICATED CUSTOMER ORDERS ---\n${list}\n---`;
  } catch (err) {
    console.error("Order lookup error:", err);
  }
  return "";
}

/* ── Lead extraction helpers ─────────────────────────────────── */
function extractEmailFromText(text: string): string | null {
  const m = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  return m ? m[0] : null;
}

function extractQuantity(text: string): string | null {
  const m = text.match(/\b(\d[\d,]*)\s*(unit|pcs|piece|box|boxes|k\b)/i);
  return m ? m[0] : null;
}

const BOX_KEYWORDS = [
  "mailer box","product box","display box","retail box","corrugated",
  "kraft box","rigid box","folding carton","gift box","shipping box",
  "cosmetic box","soap box","candle box","cbd box","mylar","subscription box",
];

/* ── Email notification ──────────────────────────────────────── */
async function sendLeadNotification(lead: {
  name: string;
  email: string;
  productType?: string | null;
  quantity?: string | null;
  quoteId: number;
}) {
  try {
    const [s] = await db
      .select({
        smtpHost:   siteSettingsTable.smtpHost,
        smtpPort:   siteSettingsTable.smtpPort,
        smtpUser:   siteSettingsTable.smtpUser,
        smtpPass:   siteSettingsTable.smtpPass,
        smtpFrom:   siteSettingsTable.smtpFrom,
        smtpTo:     siteSettingsTable.smtpTo,
        smtpSecure: siteSettingsTable.smtpSecure,
      })
      .from(siteSettingsTable)
      .limit(1);

    if (!s?.smtpHost || !s?.smtpTo) return; // SMTP not configured — skip silently

    const transport = nodemailer.createTransport({
      host:   s.smtpHost,
      port:   s.smtpPort ?? 587,
      secure: s.smtpSecure === "true",
      auth:   s.smtpUser ? { user: s.smtpUser, pass: s.smtpPass ?? "" } : undefined,
    } as any);

    const adminUrl =
      process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/admin/quotes`
        : "/admin/quotes";

    const html = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
  <div style="background:#1B2B5E;padding:20px 24px;border-radius:8px 8px 0 0;">
    <h2 style="color:#fff;margin:0;font-size:18px;">🤖 New Clark AI Lead</h2>
    <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">A customer just provided their details via the chat widget</p>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6b7280;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;color:#111827;">${lead.name}</td></tr>
      <tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;"><a href="mailto:${lead.email}" style="color:#1B2B5E;">${lead.email}</a></td></tr>
      ${lead.productType ? `<tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;">Box Type</td><td style="padding:8px 0;color:#111827;">${lead.productType}</td></tr>` : ""}
      ${lead.quantity ? `<tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;">Quantity</td><td style="padding:8px 0;color:#111827;">${lead.quantity}</td></tr>` : ""}
      <tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;">Quote ID</td><td style="padding:8px 0;color:#6b7280;">#${lead.quoteId}</td></tr>
    </table>
    <div style="margin-top:20px;">
      <a href="${adminUrl}" style="background:#e63329;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">View in Admin Panel →</a>
    </div>
    <p style="margin-top:16px;font-size:12px;color:#9ca3af;">This lead was captured automatically by Clark, the Prime Packaging Boxes AI assistant.</p>
  </div>
</div>`;

    await transport.sendMail({
      from:    s.smtpFrom ?? s.smtpUser ?? "clark@primepackagingboxes.com",
      to:      s.smtpTo,
      subject: `🤖 New Clark Lead: ${lead.name} — ${lead.productType ?? "packaging inquiry"}`,
      html,
    });
  } catch (e) {
    // Non-fatal — log but never crash the chat flow
    console.error("Clark lead email error:", e);
  }
}

async function tryUpsertLead(
  sessionId: string,
  messages: Array<{ role: string; content: string }>,
  ipData?: { ip: string; country: string; city: string } | null,
) {
  try {
    const userMsgs = messages.filter(m => m.role === "user");
    if (userMsgs.length < 2) return; // need at least name + one more

    const allText = messages.map(m => m.content).join("\n");

    const email = extractEmailFromText(allText);
    if (!email) return; // no email yet — not ready

    const name = userMsgs[0]?.content?.trim();
    if (!name || name.length < 2 || name.length > 80) return;

    const lc = allText.toLowerCase();
    const productType = BOX_KEYWORDS.find(k => lc.includes(k)) ?? null;
    const quantity = extractQuantity(allText);

    // Upsert by sessionId
    const [existing] = await db
      .select({ id: quotesTable.id, clarkIp: quotesTable.clarkIp })
      .from(quotesTable)
      .where(eq(quotesTable.clarkSessionId, sessionId))
      .limit(1);

    const payload: Record<string, any> = {
      name,
      email,
      productType: productType || undefined,
      quantity: quantity || undefined,
      message: `Clark AI chat — ${userMsgs.length} messages exchanged`,
      source: "clark",
      clarkSessionId: sessionId,
      clarkTranscript: JSON.stringify(messages),
    };

    // Only set IP/country on insert or if not yet captured
    if (ipData?.ip && (!existing || !existing.clarkIp)) {
      payload.clarkIp      = ipData.ip;
      payload.clarkCountry = ipData.country;
      payload.clarkCity    = ipData.city;
    }

    if (existing) {
      await db.update(quotesTable).set(payload as any).where(eq(quotesTable.id, existing.id));
    } else {
      const [inserted] = await db.insert(quotesTable).values(payload as any).returning({ id: quotesTable.id } as any);
      if (inserted?.id) {
        sendLeadNotification({ name, email, productType, quantity, quoteId: inserted.id });
      }
    }
  } catch (e) {
    console.error("Clark lead save error:", e);
  }
}

router.post("/chat", async (req, res) => {
  try {
    const { messages, sessionId } = req.body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      sessionId?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    // Read ALL Clark settings + API key from DB
    const [settingsRow] = await db.select({
      geminiApiKey:       siteSettingsTable.geminiApiKey,
      clarkEnabled:       siteSettingsTable.clarkEnabled,
      clarkBotName:       siteSettingsTable.clarkBotName,
      clarkGreeting:      siteSettingsTable.clarkGreeting,
      clarkCompanyPhone:  siteSettingsTable.clarkCompanyPhone,
      clarkCompanyEmail:  siteSettingsTable.clarkCompanyEmail,
      clarkCompanyAddress:siteSettingsTable.clarkCompanyAddress,
      clarkToneNotes:     siteSettingsTable.clarkToneNotes,
      clarkQuoteHours:    siteSettingsTable.clarkQuoteHours,
      clarkCustomFaqs:    siteSettingsTable.clarkCustomFaqs,
    }).from(siteSettingsTable).limit(1);

    // Respect the enable/disable toggle
    if (settingsRow?.clarkEnabled === "false") {
      return res.status(503).json({ error: "Chat is currently disabled." });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || settingsRow?.geminiApiKey;
    const sessionCustomer = (req as any).session?.customer;

    if (!groqKey && !geminiKey) {
      return res.status(500).json({ error: "AI service not configured. Please add GROQ_API_KEY or GEMINI_API_KEY environment variable or set it in Admin → Settings → Clark AI." });
    }

    // Capture visitor IP + geo on first user message (fire-and-forget)
    const clientIp = getClientIp(req);
    let ipData: { ip: string; country: string; city: string } | null = null;
    if (clientIp && messages.filter(m => m.role === "user").length === 1) {
      // First message — resolve geo asynchronously; don't await to avoid latency
      geoLookup(clientIp).then(geo => {
        if (geo && sessionId) {
          db.update(quotesTable)
            .set({ clarkIp: clientIp, clarkCountry: geo.country, clarkCity: geo.city })
            .where(eq(quotesTable.clarkSessionId, sessionId))
            .catch(() => {});
        }
      });
      ipData = { ip: clientIp, country: "", city: "" }; // placeholder until geo resolves
    }

    // Save / update Clark lead + last-activity timestamp (fire-and-forget)
    if (sessionId) {
      tryUpsertLead(sessionId, messages, ipData);
      // Always stamp last activity, even before email is known
      db.update(quotesTable)
        .set({ clarkLastActivity: new Date() })
        .where(eq(quotesTable.clarkSessionId, sessionId))
        .catch(() => {});
    }

    // ── Admin takeover / pending-message check ────────────────────
    if (sessionId) {
      const [session] = await db
        .select({
          adminPendingMessage: quotesTable.adminPendingMessage,
          adminTookOver:       quotesTable.adminTookOver,
        })
        .from(quotesTable)
        .where(eq(quotesTable.clarkSessionId, sessionId))
        .limit(1);

      if (session?.adminPendingMessage) {
        // Admin injected a message — stream it back, then clear it
        const adminMsg = session.adminPendingMessage;
        await db.update(quotesTable)
          .set({ adminPendingMessage: null })
          .where(eq(quotesTable.clarkSessionId, sessionId));

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        res.write(`data: ${JSON.stringify({ content: adminMsg, isAdmin: true })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      if (session?.adminTookOver) {
        // Admin has taken over — hold AI, tell customer to wait
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        const holdMsg = "Our team has joined the chat and will respond to you directly. Please hold on! 😊";
        res.write(`data: ${JSON.stringify({ content: holdMsg, isAdmin: true })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }
    }

    // Order context: authenticated portal customer (by session ID) or
    // anonymous website visitor (by order/invoice number or email from conversation)
    let orderContext = "";
    if (sessionCustomer?.id) {
      orderContext = await lookupOrderContext(sessionCustomer.id);
    } else {
      const allText = messages.map(m => m.content).join("\n");
      // Priority 1: order/invoice number (most specific — no PII required)
      const orderRef = extractOrderNumberFromText(allText);
      if (orderRef) {
        orderContext = await lookupOrderByNumber(orderRef);
      }
      // Priority 2: email + order number together (BOTH required for privacy)
      if (!orderContext) {
        const visitorEmail = extractEmailFromText(allText);
        if (visitorEmail) {
          // Pass orderRef — if null, function returns a privacy prompt (no PII)
          orderContext = await lookupOrderByEmail(visitorEmail, orderRef ?? null);
        }
      }
    }

    // Build dynamic system prompt from DB settings
    const systemPrompt = buildSystemPrompt({
      botName:    settingsRow?.clarkBotName,
      greeting:   settingsRow?.clarkGreeting,
      phone:      settingsRow?.clarkCompanyPhone,
      email:      settingsRow?.clarkCompanyEmail,
      address:    settingsRow?.clarkCompanyAddress,
      toneNotes:  settingsRow?.clarkToneNotes,
      quoteHours: settingsRow?.clarkQuoteHours,
      customFaqs: settingsRow?.clarkCustomFaqs,
    });

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let success = false;

    let responseContentWritten = false;
    const writeChunk = (content: string) => {
      if (content) {
        responseContentWritten = true;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    };
    const withProviderTimeout = async <T>(operation: Promise<T>, provider: string): Promise<T> => {
      let timeoutId: NodeJS.Timeout | undefined;
      try {
        return await Promise.race([
          operation,
          new Promise<T>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error(`${provider} request timed out`)), 25_000);
          }),
        ]);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };
    const consumeProviderStream = async <T>(
      stream: AsyncIterable<T>,
      onChunk: (chunk: T) => void,
      provider: string,
    ) => {
      const iterator = stream[Symbol.asyncIterator]();
      const deadline = Date.now() + 25_000;
      try {
        while (true) {
          const remaining = deadline - Date.now();
          if (remaining <= 0) throw new Error(`${provider} stream timed out`);
          const next = await Promise.race([
            iterator.next(),
            new Promise<IteratorResult<T>>((_, reject) => {
              setTimeout(() => reject(new Error(`${provider} stream timed out`)), remaining);
            }),
          ]);
          if (next.done) break;
          onChunk(next.value);
        }
      } finally {
        await iterator.return?.().catch(() => {});
      }
    };

    // 1. Primary Attempt: Gemini AI. Groq is deliberately second so a
    // configured Gemini account is always preferred for normal requests.
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const fullSystemPrompt = systemPrompt + orderContext;
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: fullSystemPrompt,
        });

        const history = messages.slice(0, -1).map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
        const lastUserMsg = messages[messages.length - 1]?.content || "Hello";
        const chat = model.startChat({ history });
        const result = await withProviderTimeout(chat.sendMessageStream(lastUserMsg), "Gemini");

        await consumeProviderStream(result.stream, chunk => writeChunk(chunk.text()), "Gemini");
        success = true;
        req.log.info({ provider: "gemini" }, "Clark AI response completed");
      } catch (geminiErr: any) {
        req.log.warn(
          { provider: "gemini", error: String(geminiErr?.message || geminiErr) },
          "Clark Gemini failed, attempting Groq fallback",
        );
      }
    }

    // 2. Fallback Attempt: Groq AI. This also handles a missing Gemini key.
    if (!success && !responseContentWritten && groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const stream = await withProviderTimeout(groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt + orderContext },
            ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
          ],
          stream: true,
          max_tokens: 1024,
        }), "Groq");

        await consumeProviderStream(stream, chunk => writeChunk(chunk.choices[0]?.delta?.content || ""), "Groq");
        success = true;
        req.log.info({ provider: "groq" }, "Clark AI fallback response completed");
      } catch (groqErr: any) {
        req.log.error(
          { provider: "groq", error: String(groqErr?.message || groqErr) },
          "Clark Groq fallback failed",
        );
      }
    }

    if (!success && responseContentWritten) {
      res.write(`data: ${JSON.stringify({ done: true, interrupted: true })}\n\n`);
      res.end();
      return;
    }

    if (!success) {
      const errMsg =
        "I'm having a little trouble right now. Please call us at 818-758-4076 or email help@primepackagingboxes.com and we'll help you right away! 😊";
      res.write(`data: ${JSON.stringify({ content: errMsg, done: true })}\n\n`);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    req.log.error({ clarkErr: String(err?.message || err) }, "Clark chat unexpected error");
    const errMsg =
      "I'm having a little trouble right now. Please call us at 818-758-4076 or email help@primepackagingboxes.com and we'll help you right away! 😊";
    res.write(`data: ${JSON.stringify({ content: errMsg, done: true })}\n\n`);
    res.end();
  }
});

export default router;
