/**
 * inject_real_pages_to_editor.mjs
 * Pushes fully styled HTML for each template into DB so the GrapesJS
 * editor canvas shows the REAL page layout.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../../../prime-packaging-boxes-main/prime-packaging-boxes-main/artifacts/api-server/data/prime.db');

const db = new Database(DB_PATH);

/* ─── SHARED STYLES injected in every template ─── */
const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #ffffff; color: #111827; }
`;

/* ═══════════════════════════════════════════════
   SHOP / PRODUCTS LISTING TEMPLATE
   ═══════════════════════════════════════════════ */
const SHOP_HTML = `
<div style="font-family:'Inter',sans-serif;background:#ffffff;">

  <!-- HERO -->
  <section style="background:linear-gradient(135deg,#1a2f5a 0%,#243d6e 100%);padding:80px 24px;text-align:center;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;opacity:0.04;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:22px 22px;"></div>
    <div style="position:relative;z-index:2;max-width:860px;margin:0 auto;">
      <span style="display:inline-block;background:rgba(230,51,41,0.2);color:#ff8a80;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;padding:6px 16px;border-radius:20px;margin-bottom:16px;">500+ Brands Served — USA &amp; UK</span>
      <h1 style="font-family:'Outfit',sans-serif;font-size:42px;font-weight:900;color:#ffffff;margin:0 0 16px;line-height:1.15;">All Custom Packaging Products</h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.75);max-width:640px;margin:0 auto 28px;line-height:1.7;">Premium custom boxes with free design support, 100-unit minimums, and free shipping across the USA &amp; UK. Browse 65+ product styles.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="/get-a-quote" style="background:#e63329;color:#fff;padding:14px 28px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 8px 20px rgba(230,51,41,0.35);">Get a Free Quote →</a>
        <a href="/request-sample" style="background:rgba(255,255,255,0.1);color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;border:1px solid rgba(255,255,255,0.25);">Request Samples</a>
      </div>
    </div>
  </section>

  <!-- CATEGORY FILTER BAR -->
  <div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:14px 24px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
    <button style="background:#1a2f5a;color:#fff;border:none;padding:7px 18px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;">All</button>
    <button style="background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;padding:7px 18px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">Mailer Boxes</button>
    <button style="background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;padding:7px 18px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">Rigid Boxes</button>
    <button style="background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;padding:7px 18px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">Kraft Boxes</button>
    <button style="background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;padding:7px 18px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;">Cosmetic Boxes</button>
    <input type="text" placeholder="Search products..." style="margin-left:auto;padding:8px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;background:#fff;outline:none;width:200px;" />
  </div>

  <!-- PRODUCTS GRID -->
  <section style="background:#f9fafb;padding:48px 24px;">
    <div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
      ${[
        ['Custom Mailer Boxes','From $0.89/unit','4.8'],
        ['Rigid Gift Boxes','From $1.20/unit','4.9'],
        ['Kraft Boxes','From $0.65/unit','4.7'],
        ['Cosmetic Boxes','From $0.95/unit','4.8'],
        ['Cake Boxes','From $0.75/unit','4.9'],
        ['Pillow Boxes','From $0.55/unit','4.6'],
        ['Display Boxes','From $1.10/unit','4.8'],
        ['Sleeve Boxes','From $0.85/unit','4.7'],
      ].map(([name, price, stars]) => `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);transition:all 0.2s;">
          <div style="height:180px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px;font-weight:600;">Product Image</div>
          <div style="padding:14px;">
            <h3 style="font-size:13px;font-weight:700;color:#111827;margin:0 0 4px;">${name}</h3>
            <div style="color:#e63329;font-weight:700;font-size:12px;margin-bottom:6px;">${price}</div>
            <div style="color:#f59e0b;font-size:11px;">★★★★★ ${stars}</div>
            <a href="/get-a-quote" style="display:block;margin-top:10px;background:#1a2f5a;color:#fff;text-align:center;padding:8px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">Get Quote</a>
          </div>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- WHY CHOOSE US -->
  <section style="background:#fff;padding:64px 24px;">
    <div style="max-width:1100px;margin:0 auto;text-align:center;margin-bottom:40px;">
      <span style="background:#fef2f2;color:#e63329;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:6px 14px;border-radius:20px;display:inline-block;margin-bottom:12px;">Why Prime Packaging</span>
      <h2 style="font-family:'Outfit',sans-serif;font-size:34px;font-weight:900;color:#1a2f5a;margin:0 0 12px;">Why 500+ Brands Choose Us</h2>
      <p style="color:#6b7280;font-size:14px;max-width:520px;margin:0 auto;">Premium custom packaging without the premium price — here's what makes us different.</p>
    </div>
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${[
        ['🎨','#eff6ff','#3b82f6','Free Custom Design','Our in-house designers create your artwork at no charge. Unlimited revisions included.'],
        ['🚚','#ecfdf5','#10b981','Free US & UK Shipping','Every order ships free across the USA (all 50 states) and the United Kingdom.'],
        ['⚡','#fff7ed','#f97316','7–10 Day Turnaround','From artwork approval to your door — most orders complete in 7–10 business days.'],
        ['🛡️','#fef2f2','#e63329','100% Quality Guarantee','We inspect every batch before dispatch. Not happy? We reprint or refund.'],
        ['🏆','#faf5ff','#a855f7','100-Unit Minimums','Start small and scale fast. Premium packaging available from just 100 units.'],
        ['🌿','#f0fdf4','#16a34a','Eco-Friendly Options','FSC-certified materials, soy inks, and recyclable substrates available.'],
      ].map(([icon, bg, color, title, desc]) => `
        <div style="border:1px solid #f3f4f6;border-radius:16px;padding:24px;">
          <div style="width:40px;height:40px;background:${bg};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:14px;">${icon}</div>
          <h3 style="font-size:13px;font-weight:700;color:#111827;margin:0 0 6px;">${title}</h3>
          <p style="font-size:12px;color:#6b7280;line-height:1.6;">${desc}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section style="background:#f9fafb;padding:64px 24px;text-align:center;">
    <span style="background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:6px 14px;border-radius:20px;display:inline-block;margin-bottom:12px;">Simple Process</span>
    <h2 style="font-family:'Outfit',sans-serif;font-size:34px;font-weight:900;color:#1a2f5a;margin:0 0 40px;">How Ordering Works</h2>
    <div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
      ${[
        ['📋','01','Submit Brief','Tell us your box dimensions, quantity, material, and design idea. We respond in under 4 hours.'],
        ['🎨','02','Design & Proof','Our designer creates a full-color dieline and proof. We revise until you love it — all free.'],
        ['🏭','03','Production & QC','We go to print after your approval. Every batch is inspected before dispatch.'],
        ['📦','04','Delivered Free','Your finished boxes arrive at your US address within 7–10 business days.'],
      ].map(([emoji, num, title, desc]) => `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;text-align:center;">
          <div style="font-size:32px;margin-bottom:12px;">${emoji}</div>
          <div style="font-size:10px;font-weight:800;color:#e63329;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">STEP ${num}</div>
          <h3 style="font-size:13px;font-weight:700;color:#111827;margin:0 0 8px;">${title}</h3>
          <p style="font-size:12px;color:#6b7280;line-height:1.6;">${desc}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section style="background:#fff;padding:64px 24px;">
    <div style="max-width:1000px;margin:0 auto;text-align:center;margin-bottom:40px;">
      <span style="background:#fefce8;color:#854d0e;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:6px 14px;border-radius:20px;display:inline-block;margin-bottom:12px;">Customer Reviews</span>
      <h2 style="font-family:'Outfit',sans-serif;font-size:34px;font-weight:900;color:#1a2f5a;margin:0;">What Our Customers Say</h2>
    </div>
    <div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${[
        ['Jessica T.','Founder, Bloom Beauty Co.','The quality blew me away. My customers keep complimenting the unboxing experience. Will be a lifetime customer.'],
        ['Marcus L.','Operations Manager, NutraPure','We needed 500 boxes fast. Prime Packaging delivered in 8 days with zero quality issues. Highly recommend.'],
        ['Sarah K.','E-commerce Director, Homewise','Free design support saved us thousands. Our designer nailed our brand on the first revision.'],
      ].map(([name, role, text]) => `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:24px;">
          <div style="color:#f59e0b;font-size:14px;margin-bottom:12px;">★★★★★</div>
          <p style="font-size:13px;color:#374151;line-height:1.7;font-style:italic;margin:0 0 16px;">"${text}"</p>
          <div style="display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid #e5e7eb;">
            <div style="width:36px;height:36px;background:#1a2f5a;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">${name[0]}</div>
            <div>
              <div style="font-size:12px;font-weight:700;color:#111827;">${name}</div>
              <div style="font-size:11px;color:#6b7280;">${role}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- CTA BANNER -->
  <section style="padding:64px 24px;background:#fff;">
    <div style="max-width:1000px;margin:0 auto;background:linear-gradient(135deg,#1a2f5a,#0d1f3c);border-radius:24px;padding:48px;display:flex;align-items:center;justify-content:space-between;gap:32px;position:relative;overflow:hidden;">
      <div style="position:absolute;inset:0;opacity:0.04;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:20px 20px;"></div>
      <div style="position:relative;z-index:2;">
        <h2 style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;color:#fff;margin:0 0 10px;">Ready to Elevate Your Brand Packaging?</h2>
        <p style="font-size:14px;color:rgba(255,255,255,0.65);max-width:440px;line-height:1.7;">Free design, free shipping, 100-unit minimum. Get your custom quote today and receive a response within 4 business hours.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;position:relative;z-index:2;flex-shrink:0;">
        <a href="/get-a-quote" style="background:#e63329;color:#fff;padding:14px 28px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;text-align:center;white-space:nowrap;">Get a Free Quote →</a>
        <a href="tel:18187584076" style="background:rgba(255,255,255,0.1);color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;text-align:center;border:1px solid rgba(255,255,255,0.2);">📞 818-758-4076</a>
      </div>
    </div>
  </section>

</div>
`;

/* ═══════════════════════════════════════════════
   CATEGORY PAGE TEMPLATE
   ═══════════════════════════════════════════════ */
const CATEGORY_HTML = `
<div style="font-family:'Inter',sans-serif;background:#ffffff;">

  <!-- HERO -->
  <section style="background:linear-gradient(135deg,#1a2f5a,#243d6e);padding:80px 24px;text-align:center;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;opacity:0.04;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:22px 22px;"></div>
    <div style="position:relative;z-index:2;max-width:800px;margin:0 auto;">
      <div style="display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:12px;font-size:12px;color:rgba(255,255,255,0.5);">
        <span>Home</span><span>›</span><span>Products</span><span>›</span><span style="color:rgba(255,255,255,0.9);">{{category.name}}</span>
      </div>
      <span style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;padding:5px 14px;border-radius:16px;margin-bottom:14px;display:inline-block;">CUSTOM PACKAGING</span>
      <h1 style="font-family:'Outfit',sans-serif;font-size:42px;font-weight:900;color:#ffffff;margin:0 0 14px;line-height:1.15;">{{category.name}}</h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.75);max-width:600px;margin:0 auto 28px;line-height:1.7;">{{category.description}}</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="/get-a-quote" style="background:#e63329;color:#fff;padding:14px 28px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;">Get a Free Quote →</a>
        <a href="tel:18187584076" style="background:rgba(255,255,255,0.1);color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;border:1px solid rgba(255,255,255,0.25);">📞 818-758-4076</a>
      </div>
    </div>
  </section>

  <!-- TRUST BAR -->
  <div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:14px 24px;">
    <div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:24px;">
      ${[['🛡️','Quality Guaranteed'],['⚡','7–10 Day Turnaround'],['🚚','Free US Shipping'],['🎨','Free Design Support']].map(([icon,text])=>`
        <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:#6b7280;font-weight:600;">${icon} ${text}</span>
      `).join('')}
    </div>
  </div>

  <!-- PRODUCTS GRID -->
  <section style="background:#f9fafb;padding:48px 24px;">
    <div style="max-width:1280px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <h2 style="font-size:20px;font-weight:800;color:#1a2f5a;">{{category.name}} — Products</h2>
        <a href="/get-a-quote" style="color:#e63329;font-weight:700;font-size:13px;text-decoration:none;">Request Custom Quote →</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
        ${['Product 1','Product 2','Product 3','Product 4','Product 5','Product 6','Product 7','Product 8'].map(name=>`
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <div style="height:160px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;font-weight:600;">Product Image</div>
            <div style="padding:12px;">
              <h3 style="font-size:12px;font-weight:700;color:#111827;margin:0 0 6px;">${name}</h3>
              <a href="/get-a-quote" style="display:block;background:#1a2f5a;color:#fff;text-align:center;padding:7px;border-radius:7px;font-size:11px;font-weight:700;text-decoration:none;">Get Quote</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- WHY CHOOSE + HOW IT WORKS sections -->
  <section style="background:#fff;padding:64px 24px;text-align:center;">
    <h2 style="font-family:'Outfit',sans-serif;font-size:30px;font-weight:900;color:#1a2f5a;margin:0 0 10px;">Why Choose Prime Packaging?</h2>
    <p style="color:#6b7280;font-size:14px;max-width:500px;margin:0 auto 36px;">Premium quality, unbeatable prices, and the fastest turnaround in the industry.</p>
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
      ${[['🎨','Free Custom Design','Get your artwork created by professionals at zero cost.'],['🚚','Free Shipping','Free delivery across all 50 US states and the UK.'],['⚡','Fast Turnaround','7–10 business days from artwork approval to delivery.'],['🛡️','Quality Guarantee','100% satisfaction guaranteed — or we reprint for free.'],['📦','Low MOQ','Start from just 100 units. No large order minimums.'],['🌿','Eco Materials','FSC-certified, recyclable, and sustainable packaging options.']].map(([icon,title,desc])=>`
        <div style="border:1px solid #e5e7eb;border-radius:14px;padding:20px;text-align:left;">
          <div style="font-size:22px;margin-bottom:10px;">${icon}</div>
          <h3 style="font-size:13px;font-weight:700;color:#111827;margin:0 0 5px;">${title}</h3>
          <p style="font-size:12px;color:#6b7280;line-height:1.6;">${desc}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section style="background:#f9fafb;padding:56px 24px;text-align:center;">
    <h2 style="font-family:'Outfit',sans-serif;font-size:30px;font-weight:900;color:#1a2f5a;margin:0 0 36px;">What Our Clients Say</h2>
    <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
      ${[['J.T.','Bloom Beauty Co.','Incredible quality and fast shipping. Will definitely order again!'],['M.L.','NutraPure','8-day delivery with perfect quality. Highly recommended.'],['S.K.','Homewise','Free design team nailed our brand identity. 5 stars!']].map(([init,co,text])=>`
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;text-align:left;">
          <div style="color:#f59e0b;margin-bottom:8px;">★★★★★</div>
          <p style="font-size:12px;color:#374151;font-style:italic;margin:0 0 12px;line-height:1.6;">"${text}"</p>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:30px;height:30px;background:#1a2f5a;border-radius:50%;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;">${init}</div>
            <span style="font-size:11px;color:#6b7280;">${co}</span>
          </div>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- CTA -->
  <section style="background:#fff;padding:56px 24px;">
    <div style="max-width:900px;margin:0 auto;background:linear-gradient(135deg,#1a2f5a,#0d1f3c);border-radius:20px;padding:40px;display:flex;align-items:center;justify-content:space-between;gap:24px;">
      <div>
        <h2 style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:900;color:#fff;margin:0 0 8px;">Need a Custom {{category.name}} Quote?</h2>
        <p style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.7;">Free design support, 100-unit minimums, 7–10 day turnaround, and free shipping to all 50 US states.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
        <a href="/get-a-quote" style="background:#e63329;color:#fff;padding:12px 24px;border-radius:9px;font-weight:800;font-size:13px;text-decoration:none;text-align:center;">Get a Free Quote →</a>
        <a href="tel:18187584076" style="background:rgba(255,255,255,0.1);color:#fff;padding:12px 24px;border-radius:9px;font-weight:700;font-size:13px;text-decoration:none;text-align:center;border:1px solid rgba(255,255,255,0.2);">📞 818-758-4076</a>
      </div>
    </div>
  </section>

</div>
`;

/* ═══════════════════════════════════════════════
   PRODUCT DETAIL PAGE TEMPLATE
   ═══════════════════════════════════════════════ */
const PRODUCT_HTML = `
<div style="font-family:'Inter',sans-serif;background:#ffffff;">

  <!-- HERO -->
  <section style="background:#1a2f5a;padding:32px 24px;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:10px;display:flex;gap:6px;align-items:center;">
        <span>Home</span><span>›</span><span>Shop</span><span>›</span><span style="color:rgba(255,255,255,0.85);">{{product.name}}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap;">
        <div style="flex:1;">
          <span style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;padding:4px 12px;border-radius:12px;display:inline-block;margin-bottom:12px;">+ CUSTOM PACKAGING</span>
          <h1 style="font-family:'Outfit',sans-serif;font-size:38px;font-weight:900;color:#f5c518;margin:0 0 12px;line-height:1.2;">{{product.name}}</h1>
          <p style="font-size:14px;color:rgba(255,255,255,0.7);max-width:540px;line-height:1.7;">Premium {{product.name}} with full-color printing, low minimums &amp; fast delivery.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${[['🖨️','Printing','Full Color CMYK'],['📦','Minimum Order','100 Units Only'],['⚡','Turnaround','7–10 Business Days']].map(([icon,label,val])=>`
            <div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:10px;min-width:180px;">
              <span style="font-size:16px;">${icon}</span>
              <div>
                <div style="font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);">${label}</div>
                <div style="font-size:12px;font-weight:700;color:#fff;">${val}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- TRUST BAR -->
  <div style="background:#162547;border-bottom:1px solid rgba(255,255,255,0.06);padding:10px 24px;">
    <div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:16px;align-items:center;">
      ${['✓ Free Design Support','✓ Eco-Friendly Materials','✓ Wholesale Pricing','✓ USA Shipping','✓ No Hidden Charges'].map(t=>`<span style="font-size:11px;color:rgba(255,255,255,0.7);display:flex;align-items:center;gap:5px;">${t}</span>`).join('')}
    </div>
  </div>

  <!-- PRODUCT CONTENT + ORDER FORM -->
  <section style="padding:32px 24px;background:#f9fafb;">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 460px;gap:32px;align-items:start;">
      <!-- Left: Image -->
      <div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;height:400px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;font-weight:600;">Product Image</div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          ${[1,2,3,4].map(i=>`<div style="width:68px;height:68px;background:#fff;border:2px solid ${i===1?'#e63329':'#e5e7eb'};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#9ca3af;">Img ${i}</div>`).join('')}
        </div>
      </div>
      <!-- Right: Order Form -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1a2f5a,#243d6e);padding:18px 22px;">
          <h2 style="font-size:15px;font-weight:800;color:#fff;margin:0;">Get an Instant Quote</h2>
          <p style="font-size:11px;color:rgba(255,255,255,0.6);margin:2px 0 0;">Fill in your specs — we'll reply within 2 hours</p>
        </div>
        <div style="padding:20px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
            ${[['Quantity','100'],['Size','12×8×4 in'],['Material','Cardboard'],['Finish','Matte']].map(([label,placeholder])=>`
              <div>
                <label style="display:block;font-size:11px;font-weight:600;color:#374151;margin-bottom:5px;">${label}</label>
                <input type="text" placeholder="${placeholder}" style="width:100%;border:1.5px solid #e5e7eb;border-radius:8px;padding:9px 12px;font-size:12px;outline:none;" />
              </div>
            `).join('')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
            <div>
              <label style="display:block;font-size:11px;font-weight:600;color:#374151;margin-bottom:5px;">Full Name *</label>
              <input type="text" placeholder="Your Name" style="width:100%;border:1.5px solid #e5e7eb;border-radius:8px;padding:9px 12px;font-size:12px;outline:none;" />
            </div>
            <div>
              <label style="display:block;font-size:11px;font-weight:600;color:#374151;margin-bottom:5px;">Email *</label>
              <input type="email" placeholder="you@email.com" style="width:100%;border:1.5px solid #e5e7eb;border-radius:8px;padding:9px 12px;font-size:12px;outline:none;" />
            </div>
          </div>
          <button style="width:100%;background:#e63329;color:#fff;border:none;border-radius:10px;padding:14px;font-size:13px;font-weight:800;cursor:pointer;">Get My Free Quote →</button>
          <p style="text-align:center;font-size:10px;color:#9ca3af;margin-top:8px;">🔒 Your info is secure · No spam · Reply in &lt; 2 hours</p>
        </div>
      </div>
    </div>
  </section>

  <!-- DESCRIPTION + REVIEWS TABS -->
  <section style="background:#fff;padding:40px 24px;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="border-bottom:1px solid #e5e7eb;margin-bottom:24px;display:flex;gap:0;">
        <button style="padding:12px 24px;font-size:13px;font-weight:700;color:#1a2f5a;border:none;border-bottom:2px solid #e63329;background:transparent;cursor:pointer;">Description</button>
        <button style="padding:12px 24px;font-size:13px;font-weight:600;color:#9ca3af;border:none;border-bottom:2px solid transparent;background:transparent;cursor:pointer;">Reviews (3)</button>
      </div>
      <div style="max-width:720px;">
        <p style="font-size:14px;color:#374151;line-height:1.8;">{{product.description}}</p>
      </div>
    </div>
  </section>

  <!-- TECHNICAL DETAILS -->
  <section style="background:#f9fafb;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:56px 24px;">
    <div style="max-width:720px;margin:0 auto;">
      <p style="text-align:center;color:#e63329;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Specifications</p>
      <h2 style="text-align:center;font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;color:#1a2f5a;margin:0 0 28px;">Technical Details</h2>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        ${[['Printing Process','Offset Litho / Digital'],['Printing Sides','Outside Only / Inside & Outside'],['Minimum Order','100 Units'],['Turnaround Time','7–10 Business Days'],['Available Sizes','Custom to your specification'],['Material','Premium 14pt–18pt Cardstock'],['Coating','Gloss, Matte, Soft-Touch, Spot UV']].map(([label,val],i)=>`
          <div style="display:grid;grid-template-columns:180px 1fr;${i>0?'border-top:1px solid #f3f4f6;':''}">
            <div style="padding:12px 18px;font-size:12px;font-weight:600;color:#1a2f5a;background:${i%2===1?'#f9fafb':'#fff'};border-right:1px solid #f3f4f6;">${label}</div>
            <div style="padding:12px 18px;font-size:12px;color:#374151;background:${i%2===1?'#f9fafb':'#fff'};">${val}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section style="background:#fff;padding:56px 24px;text-align:center;">
    <p style="color:#e63329;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;">Simple Process</p>
    <h2 style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;color:#1a2f5a;margin:0 0 36px;">How It Works</h2>
    <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
      ${[['1','Submit Brief','Tell us your size, quantity &amp; design idea.'],['2','Free Design','We create your artwork — unlimited revisions.'],['3','Production','Printed and inspected before shipping.'],['4','Delivered','Arrives in 7–10 days, shipping free.']].map(([step,title,desc])=>`
        <div style="text-align:center;">
          <div style="width:52px;height:52px;background:#1a2f5a;border-radius:50%;color:#fff;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 4px 12px rgba(26,47,90,0.3);">${step}</div>
          <h3 style="font-size:13px;font-weight:700;color:#1a2f5a;margin:0 0 6px;">${title}</h3>
          <p style="font-size:11px;color:#6b7280;line-height:1.6;">${desc}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- CTA -->
  <section style="background:linear-gradient(135deg,#1a2f5a,#24407a);padding:48px 24px;text-align:center;">
    <span style="background:#e63329;color:#fff;font-size:10px;font-weight:800;padding:5px 14px;border-radius:16px;display:inline-block;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.08em;">Limited Offer</span>
    <h2 style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;color:#fff;margin:0 0 10px;">10% Off Your First Custom Order</h2>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;max-width:440px;margin:0 auto 24px;line-height:1.7;">Ready to upgrade your packaging? Get a custom quote today and take advantage of our first customer discount.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/get-a-quote" style="background:#e63329;color:#fff;padding:14px 28px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;">Get an Instant Quote →</a>
      <a href="/contact" style="background:rgba(255,255,255,0.1);color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">Request Free Samples</a>
    </div>
  </section>

</div>
`;

/* ═══════════════════════════════════════════════
   BLOG LISTING PAGE TEMPLATE
   ═══════════════════════════════════════════════ */
const BLOG_HTML = `
<div style="font-family:'Inter',sans-serif;background:#ffffff;">

  <!-- HERO -->
  <section style="background:linear-gradient(135deg,#1a2f5a,#243d6e);padding:72px 24px;text-align:center;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;opacity:0.04;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:22px 22px;"></div>
    <div style="position:relative;z-index:2;max-width:700px;margin:0 auto;">
      <span style="background:rgba(230,51,41,0.2);color:#ff8a80;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;padding:6px 16px;border-radius:20px;margin-bottom:16px;display:inline-block;">Packaging Insights</span>
      <h1 style="font-family:'Outfit',sans-serif;font-size:40px;font-weight:900;color:#ffffff;margin:0 0 14px;line-height:1.15;">Packaging Knowledge Hub</h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.75);max-width:580px;margin:0 auto;line-height:1.7;">Expert tips, design guides, and industry insights to help you build a standout brand through premium packaging.</p>
    </div>
  </section>

  <!-- FEATURED POST -->
  <section style="background:#fff;padding:48px 24px;">
    <div style="max-width:1100px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#f9fafb,#f3f4f6);border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;gap:0;">
        <div style="height:320px;background:linear-gradient(135deg,#1a2f5a,#243d6e);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);font-size:14px;">Featured Image</div>
        <div style="padding:40px;">
          <span style="background:#fef2f2;color:#e63329;font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:4px 12px;border-radius:12px;">FEATURED</span>
          <h2 style="font-family:'Outfit',sans-serif;font-size:24px;font-weight:900;color:#111827;margin:16px 0 10px;line-height:1.35;">The Complete Guide to Custom Box Printing in 2024</h2>
          <p style="font-size:13px;color:#6b7280;line-height:1.7;margin:0 0 20px;">Everything you need to know about choosing materials, print methods, and finishing options for your custom packaging.</p>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <div style="width:32px;height:32px;background:#1a2f5a;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;">P</div>
            <div>
              <div style="font-size:12px;font-weight:700;color:#111827;">Prime Team</div>
              <div style="font-size:11px;color:#9ca3af;">Jan 15, 2025 · 8 min read</div>
            </div>
          </div>
          <a href="/blog/custom-box-printing-guide" style="display:inline-flex;align-items:center;gap:6px;background:#e63329;color:#fff;padding:10px 20px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">Read Article →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- BLOG GRID -->
  <section style="background:#f9fafb;padding:48px 24px;">
    <div style="max-width:1100px;margin:0 auto;">
      <h2 style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:900;color:#1a2f5a;margin:0 0 24px;">Latest Articles</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
        ${[
          ['Mailer Box Design Tips','Branding','5 min read','How to design mailer boxes that create an unforgettable unboxing experience for your customers.'],
          ['Eco-Friendly Packaging Guide','Sustainability','6 min read','Explore FSC-certified, soy-ink, and recyclable packaging options for your brand.'],
          ['Box Size Calculator','How-To','4 min read','Never order the wrong size again. Use our simple formula to calculate the perfect box dimensions.'],
          ['Custom Rigid Boxes vs Folding','Comparison','7 min read','Understand the key differences to pick the right packaging style for your product.'],
          ['Wholesale Packaging Tips','Business','5 min read','How to negotiate better pricing and MOQs when ordering custom packaging in bulk.'],
          ['Color Printing on Kraft','Design','4 min read','Achieve stunning visual results printing CMYK or Pantone colors on natural kraft board.'],
        ].map(([title, cat, time, desc]) => `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <div style="height:160px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;">Blog Image</div>
            <div style="padding:18px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                <span style="background:#fef2f2;color:#e63329;font-size:10px;font-weight:700;padding:3px 8px;border-radius:8px;">${cat}</span>
                <span style="color:#9ca3af;font-size:10px;">${time}</span>
              </div>
              <h3 style="font-size:14px;font-weight:700;color:#111827;margin:0 0 6px;line-height:1.4;">${title}</h3>
              <p style="font-size:12px;color:#6b7280;line-height:1.6;margin:0 0 12px;">${desc}</p>
              <a href="/blog" style="font-size:12px;font-weight:700;color:#e63329;text-decoration:none;">Read More →</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section style="background:#fff;padding:56px 24px;">
    <div style="max-width:900px;margin:0 auto;background:linear-gradient(135deg,#1a2f5a,#0d1f3c);border-radius:20px;padding:48px;text-align:center;">
      <h2 style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;color:#fff;margin:0 0 10px;">Ready to Order Custom Packaging?</h2>
      <p style="font-size:14px;color:rgba(255,255,255,0.7);max-width:440px;margin:0 auto 24px;line-height:1.7;">Free design, free shipping, 100-unit minimum. Get your custom quote in minutes.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="/get-a-quote" style="background:#e63329;color:#fff;padding:14px 28px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;">Get a Free Quote →</a>
        <a href="/products" style="background:rgba(255,255,255,0.1);color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">Browse All Products</a>
      </div>
    </div>
  </section>

</div>
`;

// ── Save to DB ──
function saveTemplate(type, html) {
  const content = JSON.stringify({ gjs: { html, css: BASE_CSS } });
  const existing = db.prepare('SELECT id FROM page_templates WHERE type = ?').get(type);
  if (existing) {
    db.prepare('UPDATE page_templates SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE type = ?').run(content, type);
    console.log(`✅ UPDATED [${type}] — HTML: ${html.length} chars`);
  } else {
    db.prepare('INSERT INTO page_templates (type, content) VALUES (?, ?)').run(type, content);
    console.log(`✅ INSERTED [${type}] — HTML: ${html.length} chars`);
  }
}

saveTemplate('shop',     SHOP_HTML);
saveTemplate('category', CATEGORY_HTML);
saveTemplate('product',  PRODUCT_HTML);
saveTemplate('blog',     BLOG_HTML);

db.close();
console.log('\n🎉 All 4 templates updated with REAL page content!');
console.log('👉 Now open Admin → Templates → Edit any template');
console.log('   You should see the full page layout in the editor canvas.');
