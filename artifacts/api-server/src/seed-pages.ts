/**
 * Seed starter HTML into pages that have null content.
 * Run: pnpm tsx scripts/seed-pages.ts
 *
 * Pages get HTML matching their hardcoded React component designs.
 * Content is stored as { gjs: { html, css } } for GrapesJS builder.
 */
// @ts-ignore — pg types resolved at runtime
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "artifacts/api-server/.env" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

const client = new pg.Client({ connectionString: DATABASE_URL });

/* ── Brand palette ── */
const navy = "#0d1f3c";
const navyMid = "#1a2f5a";
const red = "#e63329";

/* ── Reusable section styles ── */
const heroStyle = `background:${navy};padding:80px 20px 100px;text-align:center;position:relative;overflow:hidden;`;
const containerStyle = `max-width:1140px;margin:0 auto;padding:0 20px;`;
const badgeStyle = `display:inline-block;background:rgba(230,51,41,0.15);border:1px solid rgba(230,51,41,0.35);color:#ff6b63;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:5px 14px;border-radius:999px;margin-bottom:20px;`;
const h1Style = `color:#fff;font-size:clamp(28px,5vw,52px);font-weight:800;line-height:1.15;margin:0 0 18px;font-family:Inter,sans-serif;`;
const subStyle = `color:rgba(255,255,255,0.65);font-size:17px;line-height:1.7;max-width:680px;margin:0 auto 32px;`;
const btnRedStyle = `display:inline-block;background:${red};color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;text-decoration:none;margin:6px;`;
const btnGhostStyle = `display:inline-block;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.25);color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;text-decoration:none;margin:6px;`;
const sectionStyle = `padding:80px 20px;`;
const cardStyle = `background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.06);`;

/* ════════════════════════════════════════════════════════════════
   PAGE HTML SEEDS
   ════════════════════════════════════════════════════════════════ */
const PAGE_HTML: Record<string, string> = {

  /* ── ABOUT US ── */
  "about-us": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">Our Story</div>
    <h1 style="${h1Style}">We're Not Just a Printer.<br><span style="color:${red}">We're Your Packaging Partner.</span></h1>
    <p style="${subStyle}">Founded in Torrance, California, Prime Packaging Boxes was built on one belief: every brand deserves packaging that's as impressive as the product inside.</p>
    <a href="/get-quote" style="${btnRedStyle}">Get a Free Quote →</a>
    <a href="/contact" style="${btnGhostStyle}">Contact Our Team</a>
  </div>
</section>

<section style="background:#fff;padding:60px 20px;">
  <div style="${containerStyle}">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center;">
      <div><div style="font-size:40px;font-weight:900;color:${red};">500+</div><div style="font-weight:700;color:#1f2937;font-size:14px;">Happy Clients</div><div style="color:#9ca3af;font-size:12px;">US brands trust us</div></div>
      <div><div style="font-size:40px;font-weight:900;color:${red};">1M+</div><div style="font-weight:700;color:#1f2937;font-size:14px;">Boxes Shipped</div><div style="color:#9ca3af;font-size:12px;">Across all 50 states</div></div>
      <div><div style="font-size:40px;font-weight:900;color:${red};">4.9/5</div><div style="font-weight:700;color:#1f2937;font-size:14px;">Avg Rating</div><div style="color:#9ca3af;font-size:12px;">From 200+ reviews</div></div>
      <div><div style="font-size:40px;font-weight:900;color:${red};">5+</div><div style="font-weight:700;color:#1f2937;font-size:14px;">Years Experience</div><div style="color:#9ca3af;font-size:12px;">Serving US brands</div></div>
    </div>
  </div>
</section>

<section style="background:#f9fafb;padding:80px 20px;border-top:1px solid #e5e7eb;">
  <div style="${containerStyle}max-width:860px;">
    <div style="text-align:center;margin-bottom:56px;">
      <div style="color:${red};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">OUR JOURNEY</div>
      <h2 style="font-size:36px;font-weight:800;color:${navyMid};margin:0;">5 Years of Growth & Excellence</h2>
      <p style="color:#6b7280;margin-top:12px;max-width:500px;margin-left:auto;margin-right:auto;font-size:14px;">From a small California startup to a nationwide packaging partner.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${[
        ["2019","❤️","Founded in Torrance, CA","Prime Packaging Boxes launched with a mission to give growing brands access to premium packaging at fair prices."],
        ["2020","👥","First 100 Clients","Hit 100 happy clients in our first full year, expanding our product range to include rigid and luxury boxes."],
        ["2021","🌎","Nationwide Expansion","Scaled free shipping to all 50 US states and added rush 3–5 day production for urgent orders."],
        ["2022","🏆","FSC & SFI Certification","Achieved FSC and SFI certification, making eco-friendly materials standard across our entire product line."],
        ["2023","📈","500+ Brands Served","Crossed 500 active brand clients and shipped over 1 million boxes to every corner of the United States."],
        ["2024","✨","In-House Design Studio","Launched our fully-staffed in-house design studio offering free unlimited revisions and 3D mockups on every order."],
      ].map(([year,icon,title,desc]) => `
        <div style="display:flex;gap:20px;align-items:flex-start;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;">
          <div style="background:${red};color:#fff;font-weight:900;font-size:13px;padding:8px 14px;border-radius:999px;white-space:nowrap;flex-shrink:0;">${year}</div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span>${icon}</span><strong style="color:${navyMid};font-size:15px;">${title}</strong></div>
            <p style="color:#6b7280;font-size:14px;margin:0;line-height:1.65;">${desc}</p>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
</section>

<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}">
    <div style="text-align:center;margin-bottom:56px;">
      <div style="color:${red};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">HOW IT WORKS</div>
      <h2 style="font-size:36px;font-weight:800;color:${navyMid};margin:0;">Our Simple 5-Step Process</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;text-align:center;">
      ${[
        ["01","💬","Consultation","Tell us your product, size, quantity, and timeline."],
        ["02","📐","Design & Dieline","Free in-house dieline, print-ready artwork & 3D mockup."],
        ["03","🔍","Approval & Sampling","Review design. Physical samples available for large orders."],
        ["04","🏭","Production","Full quality control — material, printing, cutting, assembly."],
        ["05","🚚","Shipping","Free shipping to all 50 US states with real-time tracking."],
      ].map(([step,icon,title,desc]) => `
        <div style="${cardStyle}">
          <div style="font-size:28px;margin-bottom:12px;">${icon}</div>
          <div style="color:${red};font-size:11px;font-weight:800;letter-spacing:0.1em;margin-bottom:6px;">Step ${step}</div>
          <div style="font-weight:700;color:${navyMid};font-size:14px;margin-bottom:8px;">${title}</div>
          <div style="color:#6b7280;font-size:12px;line-height:1.6;">${desc}</div>
        </div>
      `).join("")}
    </div>
  </div>
</section>

<section style="background:#f9fafb;padding:80px 20px;">
  <div style="${containerStyle}">
    <div style="text-align:center;margin-bottom:56px;">
      <div style="color:${red};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">OUR TEAM</div>
      <h2 style="font-size:36px;font-weight:800;color:${navyMid};margin:0;">Meet the Experts Behind Every Box</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;">
      ${[
        ["🎨","James Mitchell","Head of Design","10+ years in structural and graphic design for CPG packaging."],
        ["🏭","Sarah Kim","Production Manager","Oversees all quality control and production timelines."],
        ["📞","Carlos Rivera","Sales Director","Helps brands find the perfect packaging solution for their needs."],
        ["⭐","Amy Chen","Client Success","Ensures every order meets our quality guarantee before shipping."],
      ].map(([icon,name,role,desc]) => `
        <div style="${cardStyle}text-align:center;">
          <div style="font-size:36px;margin-bottom:12px;">${icon}</div>
          <div style="font-weight:800;color:${navyMid};font-size:15px;">${name}</div>
          <div style="color:${red};font-size:12px;font-weight:600;margin-bottom:8px;">${role}</div>
          <div style="color:#6b7280;font-size:13px;line-height:1.6;">${desc}</div>
        </div>
      `).join("")}
    </div>
  </div>
</section>

<section style="background:${navy};padding:80px 20px;text-align:center;">
  <div style="${containerStyle}">
    <h2 style="color:#fff;font-size:36px;font-weight:800;margin:0 0 16px;">Ready to Build Something Great?</h2>
    <p style="color:rgba(255,255,255,0.65);font-size:16px;margin:0 0 32px;">Get a free quote in minutes. No commitment required.</p>
    <a href="/get-quote" style="${btnRedStyle}">Get a Free Quote →</a>
    <a href="/contact" style="${btnGhostStyle}">Talk to Our Team</a>
  </div>
</section>
`,

  /* ── DELIVERY POLICY ── */
  "delivery-policy": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">🚚 Delivery Policy</div>
    <h1 style="${h1Style}">Fast, Reliable<br><span style="color:${red};">Worldwide Delivery</span></h1>
    <p style="${subStyle}">Free shipping across all 50 US states. 7–10 day production. Real-time tracking on every order.</p>
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:16px;">
      ${["✓ Free US Shipping","✓ 7–10 Day Production","✓ Rush 3–5 Day Available","✓ Real-Time Tracking"].map(t=>`<span style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.2);padding:7px 16px;border-radius:999px;font-size:13px;font-weight:600;">${t}</span>`).join("")}
    </div>
  </div>
</section>

<section style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 20px;">
  <div style="${containerStyle}">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);divide-x:1px solid #e5e7eb;">
      ${[["📦","7–10 Days","Production Time"],["🚚","FREE","US Shipping"],["⚡","3–5 Days","Rush Production"],["📍","Live","Order Tracking"]].map(([icon,val,lbl])=>`
        <div style="padding:28px 20px;text-align:center;">
          <div style="font-size:24px;margin-bottom:6px;">${icon}</div>
          <div style="font-size:24px;font-weight:900;color:${navyMid};">${val}</div>
          <div style="font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:0.08em;text-transform:uppercase;">${lbl}</div>
        </div>
      `).join("")}
    </div>
  </div>
</section>

<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:860px;">
    <div style="text-align:center;margin-bottom:48px;">
      <div style="color:${red};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">HOW LONG IT TAKES</div>
      <h2 style="font-size:32px;font-weight:800;color:${navyMid};margin:0;">Production & Shipping Timeline</h2>
      <p style="color:#6b7280;margin-top:10px;font-size:14px;">Production starts after your artwork is approved.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div style="${cardStyle}border:2px solid #dbeafe;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;"><span style="font-size:28px;">📦</span><span style="background:#dbeafe;color:#1d4ed8;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">Standard Order</span></div>
        <div style="border-top:1px solid #f3f4f6;padding-top:16px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;"><span style="color:#6b7280;">🏭 Production</span><strong style="color:${navyMid};">7–10 business days</strong></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;"><span style="color:#6b7280;">🚚 Shipping</span><strong style="color:${navyMid};">5–10 business days</strong></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;"><strong style="color:#374151;">Total Estimated</strong><strong style="color:${red};font-size:16px;">12–20 business days</strong></div>
        </div>
      </div>
      <div style="${cardStyle}border:2px solid #fed7aa;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;"><span style="font-size:28px;">⚡</span><span style="background:#fed7aa;color:#9a3412;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">Rush Order</span></div>
        <div style="border-top:1px solid #f3f4f6;padding-top:16px;">
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;"><span style="color:#6b7280;">🏭 Production</span><strong style="color:${navyMid};">3–5 business days</strong></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;"><span style="color:#6b7280;">🚚 Shipping</span><strong style="color:${navyMid};">5–10 business days</strong></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:14px;"><strong style="color:#374151;">Total Estimated</strong><strong style="color:${red};font-size:16px;">8–15 business days</strong></div>
        </div>
      </div>
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">* Timeline excludes weekends and US public holidays. Starts after artwork approval.</p>
  </div>
</section>

<section style="background:#f9fafb;padding:80px 20px;border-top:1px solid #e5e7eb;">
  <div style="${containerStyle}max-width:860px;">
    <div style="text-align:center;margin-bottom:48px;">
      <div style="color:${red};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">COVERAGE</div>
      <h2 style="font-size:32px;font-weight:800;color:${navyMid};margin:0;">Shipping Coverage</h2>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div style="${cardStyle}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;"><span style="font-size:24px;">🇺🇸</span><strong style="color:${navyMid};font-size:16px;">United States</strong></div>
        <div style="color:#6b7280;font-size:14px;line-height:1.7;">Free ground shipping to all 50 US states on every order. No minimum for free shipping. Ships via UPS, FedEx, or USPS depending on size and location.</div>
        <div style="margin-top:12px;background:#dcfce7;color:#166534;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:600;">✓ FREE on every order</div>
      </div>
      <div style="${cardStyle}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;"><span style="font-size:24px;">🌎</span><strong style="color:${navyMid};font-size:16px;">International</strong></div>
        <div style="color:#6b7280;font-size:14px;line-height:1.7;">International shipping available on request. Rates calculated based on destination, order weight, and dimensions. Contact our team for a custom international shipping quote.</div>
        <div style="margin-top:12px;background:#fef3c7;color:#92400e;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:600;">Contact us for rates</div>
      </div>
    </div>
  </div>
</section>

<section style="background:${navy};padding:80px 20px;text-align:center;">
  <div style="${containerStyle}">
    <h2 style="color:#fff;font-size:32px;font-weight:800;margin:0 0 16px;">Questions About Delivery?</h2>
    <p style="color:rgba(255,255,255,0.65);margin:0 0 28px;font-size:16px;">Our team responds within 2 hours during business hours.</p>
    <a href="/contact" style="${btnRedStyle}">Contact Us →</a>
    <a href="/get-quote" style="${btnGhostStyle}">Get a Quote</a>
  </div>
</section>
`,

  /* ── CONTACT US ── */
  "contact-us": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">📞 We Respond Within 2 Hours</div>
    <h1 style="${h1Style}">Let's Build Something<br><span style="color:${red};">Great Together</span></h1>
    <p style="${subStyle}">Have a project in mind? Need a custom quote? Our team is ready to help — fast, friendly, and completely free.</p>
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;">
      <a href="tel:18187584076" style="${btnGhostStyle}">📞 818-758-4076</a>
      <a href="mailto:help@primepackagingboxes.com" style="${btnGhostStyle}">✉ Email 24/7</a>
      <a href="/get-quote" style="${btnRedStyle}">Get a Free Quote</a>
    </div>
  </div>
</section>

<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:1000px;">
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:48px;">
      <div>
        <h3 style="font-size:20px;font-weight:800;color:${navyMid};margin:0 0 24px;">Contact Info</h3>
        <div style="display:flex;flex-direction:column;gap:20px;">
          ${[["📍","Address","5435 Arbor Vitae St, Los Angeles, CA 90045"],["📞","Phone","818-758-4076"],["✉","Email","help@primepackagingboxes.com"],["⏰","Business Hours","Mon–Fri: 8AM–6PM PST\nSat: 9AM–2PM PST"]].map(([icon,label,val])=>`
            <div style="display:flex;gap:14px;align-items:flex-start;">
              <div style="width:40px;height:40px;background:rgba(230,51,41,0.08);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">${icon}</div>
              <div><div style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px;">${label}</div><div style="color:#374151;font-size:14px;line-height:1.6;">${val}</div></div>
            </div>
          `).join("")}
        </div>
      </div>
      <div style="${cardStyle}">
        <h3 style="font-size:18px;font-weight:800;color:${navyMid};margin:0 0 20px;">Send Us a Message</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div><label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">First Name</label><input type="text" placeholder="John" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>
          <div><label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Last Name</label><input type="text" placeholder="Smith" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>
          <div><label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Email</label><input type="email" placeholder="john@brand.com" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>
          <div><label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Phone</label><input type="tel" placeholder="(555) 000-0000" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>
          <div style="grid-column:1/-1;"><label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Box Type</label><select style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"><option>Select box type...</option><option>Custom Mailer Boxes</option><option>Luxury Rigid Boxes</option><option>Retail Display Boxes</option><option>Folding Cartons</option><option>Corrugated Shipping Boxes</option></select></div>
          <div style="grid-column:1/-1;"><label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Project Details</label><textarea placeholder="Tell us about your project..." rows="4" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;resize:vertical;"></textarea></div>
          <div style="grid-column:1/-1;"><button style="width:100%;background:${red};color:#fff;border:none;padding:14px 24px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;">Send Message →</button></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section style="background:#f9fafb;padding:80px 20px;border-top:1px solid #e5e7eb;">
  <div style="${containerStyle}max-width:740px;">
    <div style="text-align:center;margin-bottom:40px;">
      <h2 style="font-size:32px;font-weight:800;color:${navyMid};margin:0;">Frequently Asked Questions</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${[
        ["What is your minimum order quantity?","Our minimum order quantity is just 100 units — one of the lowest MOQs in the custom packaging industry."],
        ["How long does production take?","Standard production turnaround is 7–10 business days from artwork approval. Rush 3–5 day available."],
        ["Is design support really free?","Yes, completely free. Unlimited revisions included until you're 100% satisfied with the design."],
        ["Do you offer samples before a full order?","Yes. Physical samples available before you commit to full production. Sample costs typically offset against final order."],
        ["What if I'm not satisfied with my order?","100% satisfaction guarantee. We'll reprint or provide a full refund — no questions asked."],
      ].map(([q,a]) => `
        <div style="${cardStyle}">
          <div style="font-weight:700;color:${navyMid};font-size:15px;margin-bottom:8px;">${q}</div>
          <div style="color:#6b7280;font-size:14px;line-height:1.7;">${a}</div>
        </div>
      `).join("")}
    </div>
  </div>
</section>
`,

  /* ── FAQ ── */
  "faq": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">❓ FAQ</div>
    <h1 style="${h1Style}">Frequently Asked <span style="color:${red};">Questions</span></h1>
    <p style="${subStyle}">Everything you need to know about custom packaging with Prime Packaging Boxes.</p>
  </div>
</section>
<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:780px;">
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${[
        ["What is your minimum order quantity?","Our minimum order quantity is 100 units — one of the lowest in the industry."],
        ["How long does production take?","Standard: 7–10 business days from artwork approval. Rush: 3–5 business days."],
        ["Is design support really free?","Yes — completely free unlimited revisions until you're 100% satisfied."],
        ["What file formats do you accept?","PDF, AI, EPS, PNG, JPEG, PSD. Vector files at 300 DPI preferred."],
        ["Do you offer samples?","Yes. Physical samples available before full production."],
        ["What materials do you use?","SBS paperboard, kraft board, corrugated board, rigid chipboard, Mylar/foil laminates, FSC-certified stocks."],
        ["Do you ship internationally?","Currently free shipping to all 50 US states. Contact us for international rates."],
        ["What if I'm not satisfied?","100% satisfaction guarantee — we'll reprint or fully refund. No questions asked."],
      ].map(([q,a]) => `
        <div style="${cardStyle}border-left:4px solid ${red};">
          <div style="font-weight:700;color:${navyMid};font-size:15px;margin-bottom:8px;">${q}</div>
          <div style="color:#6b7280;font-size:14px;line-height:1.7;">${a}</div>
        </div>
      `).join("")}
    </div>
  </div>
</section>
<section style="background:${navy};padding:60px 20px;text-align:center;">
  <div style="${containerStyle}">
    <h2 style="color:#fff;font-size:28px;font-weight:800;margin:0 0 12px;">Still Have Questions?</h2>
    <p style="color:rgba(255,255,255,0.65);margin:0 0 24px;">Our team responds within 2 hours.</p>
    <a href="/contact" style="${btnRedStyle}">Contact Us →</a>
  </div>
</section>
`,

  /* ── PRIVACY POLICY ── */
  "privacy-policy": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">🔒 Privacy Policy</div>
    <h1 style="${h1Style}">Privacy <span style="color:${red};">Policy</span></h1>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;">Last updated: January 2025</p>
  </div>
</section>
<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:780px;">
    ${[
      ["Information We Collect","We collect information you provide directly to us, including name, email, phone number, company name, and project details when you fill out forms or contact us."],
      ["How We Use Your Information","We use collected information to provide and improve our services, communicate with you about orders and quotes, send promotional communications (with your consent), and comply with legal obligations."],
      ["Information Sharing","We do not sell, trade, or otherwise transfer your personal information to outside parties except to trusted third parties who assist us in operating our website and conducting our business."],
      ["Data Security","We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure."],
      ["Cookies","We use cookies to enhance your experience on our website. You can disable cookies through your browser settings, though this may affect site functionality."],
      ["Contact Us","For privacy-related questions, contact us at privacy@primepackagingboxes.com or call 818-758-4076."],
    ].map(([title,content]) => `
      <div style="margin-bottom:40px;">
        <h2 style="font-size:20px;font-weight:800;color:${navyMid};margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #f3f4f6;">${title}</h2>
        <p style="color:#4b5563;font-size:15px;line-height:1.8;margin:0;">${content}</p>
      </div>
    `).join("")}
  </div>
</section>
`,

  /* ── TERMS & CONDITIONS ── */
  "terms-and-conditions": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">📄 Terms</div>
    <h1 style="${h1Style}">Terms & <span style="color:${red};">Conditions</span></h1>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;">Last updated: January 2025</p>
  </div>
</section>
<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:780px;">
    ${[
      ["Acceptance of Terms","By placing an order with Prime Packaging Boxes, you agree to these terms and conditions. If you do not agree, please do not use our services."],
      ["Orders & Payment","All orders must be confirmed with a purchase order or written approval. Payment terms are net 30 days unless otherwise agreed."],
      ["Artwork & Design","Customer is responsible for ensuring all artwork is print-ready and legally cleared for use. We are not liable for copyright infringement in customer-provided artwork."],
      ["Production & Turnaround","Production turnaround begins after artwork is approved. We are not liable for delays due to factors beyond our control."],
      ["Quality Guarantee","We guarantee our products will match approved samples and print files. Claims must be submitted within 7 days of delivery."],
      ["Limitation of Liability","Our liability is limited to the value of the order in question. We are not liable for consequential or indirect damages."],
    ].map(([title,content]) => `
      <div style="margin-bottom:40px;">
        <h2 style="font-size:20px;font-weight:800;color:${navyMid};margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #f3f4f6;">${title}</h2>
        <p style="color:#4b5563;font-size:15px;line-height:1.8;margin:0;">${content}</p>
      </div>
    `).join("")}
  </div>
</section>
`,

  /* ── REFUND/RETURN POLICY ── */
  "refund-return-policy": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">↩ Refund Policy</div>
    <h1 style="${h1Style}">Refund & Return <span style="color:${red};">Policy</span></h1>
    <p style="${subStyle}">We stand behind every order with a 100% satisfaction guarantee.</p>
  </div>
</section>
<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:780px;">
    <div style="${cardStyle}background:#f0fdf4;border:1px solid #bbf7d0;margin-bottom:40px;">
      <div style="font-size:24px;margin-bottom:8px;">✅</div>
      <h3 style="color:#166534;font-size:18px;font-weight:800;margin:0 0 8px;">100% Satisfaction Guarantee</h3>
      <p style="color:#15803d;margin:0;font-size:14px;line-height:1.7;">If your order doesn't meet our quality standards or what was approved, we'll reprint or provide a full refund — no questions asked.</p>
    </div>
    ${[
      ["Quality Claims","Claims for defective or incorrect products must be submitted within 7 days of delivery. Email us at support@primepackagingboxes.com with photos of the issue."],
      ["Reprints","If we determine a quality issue exists, we will reprint your order at no additional cost. Reprint turnaround is the same as a standard order."],
      ["Refunds","Refunds are issued within 5–7 business days to the original payment method. Partial refunds may be offered for partial quality issues."],
      ["Non-Refundable Situations","Orders where customer-approved artwork contained errors or where the product matches the approved sample are not eligible for refunds."],
      ["How to Initiate a Claim","Email support@primepackagingboxes.com or call 818-758-4076. Include your order number and photos of the issue."],
    ].map(([title,content]) => `
      <div style="margin-bottom:32px;">
        <h2 style="font-size:18px;font-weight:800;color:${navyMid};margin:0 0 10px;">${title}</h2>
        <p style="color:#4b5563;font-size:15px;line-height:1.8;margin:0;">${content}</p>
      </div>
    `).join("")}
  </div>
</section>
`,

  /* ── DISCLAIMER ── */
  "disclaimer": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">⚠ Disclaimer</div>
    <h1 style="${h1Style}"><span style="color:${red};">Disclaimer</span></h1>
  </div>
</section>
<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:780px;">
    ${[
      ["General Information","The information on this website is provided for general informational purposes only. While we strive to keep information accurate and up to date, we make no warranties about completeness or accuracy."],
      ["Product Representations","Product images and descriptions are representative. Final product appearance may vary slightly based on material, printing, and production processes."],
      ["External Links","Our website may contain links to external sites. We are not responsible for the content or privacy practices of those sites."],
      ["Limitation of Liability","Prime Packaging Boxes shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our website or services."],
    ].map(([title,content]) => `
      <div style="margin-bottom:40px;">
        <h2 style="font-size:20px;font-weight:800;color:${navyMid};margin:0 0 12px;padding-bottom:10px;border-bottom:2px solid #f3f4f6;">${title}</h2>
        <p style="color:#4b5563;font-size:15px;line-height:1.8;margin:0;">${content}</p>
      </div>
    `).join("")}
  </div>
</section>
`,

  /* ── REQUEST SAMPLE ── */
  "request-sample": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">📦 Free Samples</div>
    <h1 style="${h1Style}">Request a <span style="color:${red};">Free Sample</span></h1>
    <p style="${subStyle}">See and feel our quality before committing to a full order. Physical samples available for most box types.</p>
    <a href="/get-quote" style="${btnRedStyle}">Request Sample →</a>
  </div>
</section>
<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:860px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:60px;">
      ${[["✅","Free Sample Kit","Receive a kit of our most popular box styles at no charge."],["⚡","Fast Delivery","Sample kits ship within 2–3 business days after request."],["🎨","Customizable","Add your logo to sample boxes for a small setup fee."],["💬","Expert Guidance","A packaging specialist contacts you to discuss your needs."]].map(([icon,title,desc])=>`
        <div style="${cardStyle}display:flex;gap:16px;align-items:flex-start;">
          <div style="font-size:28px;">${icon}</div>
          <div><strong style="color:${navyMid};font-size:15px;display:block;margin-bottom:4px;">${title}</strong><span style="color:#6b7280;font-size:14px;line-height:1.6;">${desc}</span></div>
        </div>
      `).join("")}
    </div>
    <div style="${cardStyle}">
      <h3 style="font-size:18px;font-weight:800;color:${navyMid};margin:0 0 20px;">Request Your Sample Kit</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:5px;">First Name</label><input type="text" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>
        <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:5px;">Last Name</label><input type="text" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>
        <div style="grid-column:1/-1;"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:5px;">Business Email</label><input type="email" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>
        <div style="grid-column:1/-1;"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:5px;">Shipping Address</label><textarea rows="3" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;"></textarea></div>
        <div style="grid-column:1/-1;"><button style="width:100%;background:${red};color:#fff;border:none;padding:14px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;">Request My Free Samples →</button></div>
      </div>
    </div>
  </div>
</section>
`,

  /* ── RETURNS & CLAIMS ── */
  "returns-claims-support": `
<section style="${heroStyle}">
  <div style="${containerStyle}">
    <div style="${badgeStyle}">↩ Returns & Claims</div>
    <h1 style="${h1Style}">Returns, Claims & <span style="color:${red};">Support</span></h1>
    <p style="${subStyle}">We make it easy to resolve any issue. Our support team is here to help.</p>
    <a href="tel:18187584076" style="${btnRedStyle}">📞 Call Now</a>
    <a href="mailto:support@primepackagingboxes.com" style="${btnGhostStyle}">✉ Email Support</a>
  </div>
</section>
<section style="${sectionStyle}background:#fff;">
  <div style="${containerStyle}max-width:780px;">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:60px;">
      ${[["1️⃣","Contact Us","Email or call within 7 days of delivery."],["2️⃣","Send Photos","Email photos of the issue to our support team."],["3️⃣","Resolution","We'll reprint or refund within 5 business days."]].map(([icon,title,desc])=>`
        <div style="${cardStyle}text-align:center;">
          <div style="font-size:32px;margin-bottom:10px;">${icon}</div>
          <strong style="color:${navyMid};font-size:15px;display:block;margin-bottom:6px;">${title}</strong>
          <span style="color:#6b7280;font-size:13px;">${desc}</span>
        </div>
      `).join("")}
    </div>
    ${[
      ["How to Submit a Claim","Email support@primepackagingboxes.com with your order number and photos of the issue within 7 days of delivery. We'll respond within 24 hours."],
      ["Eligible Claims","Defective products, incorrect items, or products that don't match approved artwork/samples are all eligible for reprints or refunds."],
      ["Resolution Timeline","Claims are typically resolved within 3–5 business days. Reprints ship with standard turnaround."],
    ].map(([title,content]) => `
      <div style="margin-bottom:32px;">
        <h2 style="font-size:18px;font-weight:800;color:${navyMid};margin:0 0 10px;">${title}</h2>
        <p style="color:#4b5563;font-size:15px;line-height:1.8;margin:0;">${content}</p>
      </div>
    `).join("")}
  </div>
</section>
`,
};

/* ════════════════════════════════════════════════════════════════
   SEED RUNNER
   ════════════════════════════════════════════════════════════════ */
const PAGE_TITLES: Record<string, string> = {
  "about-us":               "About Us",
  "contact-us":             "Contact Us",
  "faq":                    "FAQ",
  "privacy-policy":         "Privacy Policy",
  "terms-and-conditions":   "Terms and Conditions",
  "delivery-policy":        "Delivery Policy",
  "refund-return-policy":   "Refund & Return Policy",
  "disclaimer":             "Disclaimer",
  "request-sample":         "Request a Sample",
  "returns-claims-support": "Returns & Claims Support",
};

async function main() {
  await client.connect();
  console.log("✓ Connected to database");

  let upserted = 0;
  for (const [slug, html] of Object.entries(PAGE_HTML)) {
    const title   = PAGE_TITLES[slug] ?? slug;
    const content = JSON.stringify({ gjs: { html: html.trim(), css: "" } });
    // UPSERT: insert if missing, force-update content if already there
    await client.query(
      `INSERT INTO pages (title, slug, content, is_published, updated_at)
       VALUES ($1, $2, $3, true, NOW())
       ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             content = EXCLUDED.content,
             updated_at = NOW()`,
      [title, slug, content]
    );
    console.log(`  ✅ ${slug} — upserted`);
    upserted++;
  }

  console.log(`\n🎉 Done! Upserted ${upserted} pages.`);
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
