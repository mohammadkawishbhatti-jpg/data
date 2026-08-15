/**
 * 50+ professional GrapesJS blocks — Elementor-style
 * Each block has id, label, category, icon (SVG), and HTML content.
 */
import { Editor } from 'grapesjs';

/* ─── SVG icon helper ─── */
const ico = (path: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

/* ─── Block definitions ─── */
interface CB { id: string; label: string; category: string; icon: string; content: string; }

const CUSTOM_BLOCKS: CB[] = [

  /* ══════════════════════════════════
     LAYOUT
  ══════════════════════════════════ */
  {
    id: 'cb-hero',
    label: 'Hero',
    category: 'Layout',
    icon: ico('<rect x="3" y="6" width="34" height="28" rx="3"/><line x1="3" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="22" y2="24"/><rect x="24" y="21" width="9" height="6" rx="2" fill="currentColor" opacity=".4"/>'),
    content: `<section style="background:linear-gradient(135deg,#1e2040 0%,#4f46e5 100%);padding:100px 40px;text-align:center;min-height:500px;display:flex;align-items:center;justify-content:center;flex-direction:column">
  <span style="color:#a5b4fc;font-size:13px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-bottom:16px;display:block">#1 Custom Packaging in the USA</span>
  <h1 style="color:#fff;font-size:52px;font-weight:900;margin:0 0 20px;line-height:1.1;font-family:Inter,sans-serif;max-width:700px">Packaging That Makes Your Brand Unforgettable</h1>
  <p style="color:#c7d2fe;font-size:18px;max-width:560px;margin:0 0 36px;line-height:1.7">Premium custom boxes with free design support, 100-unit minimums, and 7–10 day turnaround.</p>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
    <a href="#" style="background:#ef4444;color:#fff;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:700;text-decoration:none;display:inline-block">Get a Free Quote →</a>
    <a href="#" style="background:rgba(255,255,255,.12);color:#fff;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;border:1px solid rgba(255,255,255,.2)">Browse Products</a>
  </div>
</section>`,
  },
  {
    id: 'cb-section',
    label: 'Section',
    category: 'Layout',
    icon: ico('<rect x="3" y="4" width="34" height="32" rx="3"/><line x1="3" y1="12" x2="37" y2="12"/>'),
    content: `<section style="padding:80px 40px;background:#fff">
  <div style="max-width:1100px;margin:0 auto">
    <h2 style="font-size:34px;font-weight:800;color:#111827;margin:0 0 12px;font-family:Inter,sans-serif">Section Title</h2>
    <p style="font-size:16px;color:#6b7280;margin:0 0 48px;max-width:540px">Describe what this section is about. Keep it concise and compelling.</p>
    <p>Add your content here…</p>
  </div>
</section>`,
  },
  {
    id: 'cb-two-col',
    label: '2 Col Content',
    category: 'Layout',
    icon: ico('<rect x="3" y="6" width="15" height="28" rx="2"/><rect x="22" y="6" width="15" height="28" rx="2"/><line x1="6" y1="14" x2="15" y2="14"/><line x1="6" y1="20" x2="13" y2="20"/><line x1="25" y1="14" x2="34" y2="14"/><line x1="25" y1="20" x2="32" y2="20"/>'),
    content: `<section style="padding:70px 40px;background:#fff">
  <div style="max-width:1100px;margin:0 auto;display:flex;gap:60px;align-items:center;flex-wrap:wrap">
    <div style="flex:1;min-width:280px">
      <span style="color:#4f46e5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em">Feature</span>
      <h2 style="font-size:32px;font-weight:800;color:#111827;margin:12px 0 16px;font-family:Inter,sans-serif">Left Column Heading</h2>
      <p style="color:#6b7280;line-height:1.75;margin:0 0 20px">Describe your product, feature, or story. This is the left content area.</p>
      <a href="#" style="color:#4f46e5;font-weight:600;text-decoration:none">Learn more →</a>
    </div>
    <div style="flex:1;min-width:280px">
      <img src="https://placehold.co/520x380/f3f4f6/9ca3af?text=Image" alt="" style="width:100%;border-radius:12px;display:block"/>
    </div>
  </div>
</section>`,
  },
  {
    id: 'cb-spacer',
    label: 'Spacer',
    category: 'Layout',
    icon: ico('<line x1="20" y1="4" x2="20" y2="36"/><line x1="8" y1="4" x2="32" y2="4"/><line x1="8" y1="36" x2="32" y2="36"/>'),
    content: `<div style="height:60px;width:100%"></div>`,
  },
  {
    id: 'cb-divider',
    label: 'Divider',
    category: 'Layout',
    icon: ico('<line x1="4" y1="20" x2="36" y2="20"/><circle cx="20" cy="20" r="3" fill="currentColor"/>'),
    content: `<div style="padding:20px 40px"><hr style="border:none;border-top:2px solid #e5e7eb;margin:0"/></div>`,
  },
  {
    id: 'cb-container',
    label: 'Container',
    category: 'Layout',
    icon: ico('<rect x="3" y="8" width="34" height="24" rx="3"/><line x1="10" y1="8" x2="10" y2="32"/><line x1="30" y1="8" x2="30" y2="32"/>'),
    content: `<div style="max-width:1100px;margin:0 auto;padding:40px 20px"><p style="color:#9ca3af;text-align:center;border:2px dashed #e5e7eb;padding:40px;border-radius:8px">Drag widgets into this container</p></div>`,
  },

  /* ══════════════════════════════════
     TYPOGRAPHY
  ══════════════════════════════════ */
  {
    id: 'cb-heading',
    label: 'Heading',
    category: 'Typography',
    icon: ico('<text x="4" y="28" font-size="26" font-weight="900" fill="currentColor" stroke="none" style="font-family:serif">H1</text>'),
    content: `<h2 style="font-size:36px;font-weight:800;color:#111827;margin:0;line-height:1.2;font-family:Inter,sans-serif">Your Main Heading Goes Here</h2>`,
  },
  {
    id: 'cb-paragraph',
    label: 'Paragraph',
    category: 'Typography',
    icon: ico('<line x1="5" y1="12" x2="35" y2="12"/><line x1="5" y1="18" x2="35" y2="18"/><line x1="5" y1="24" x2="27" y2="24"/><line x1="5" y1="30" x2="31" y2="30"/>'),
    content: `<p style="font-size:16px;color:#374151;line-height:1.8;max-width:680px;margin:0">Add your paragraph text here. This widget lets you write rich text content that engages your visitors and communicates your message clearly and effectively.</p>`,
  },
  {
    id: 'cb-button',
    label: 'Button',
    category: 'Typography',
    icon: ico('<rect x="5" y="13" width="30" height="14" rx="7"/><line x1="14" y1="20" x2="26" y2="20"/>'),
    content: `<div style="padding:8px 0"><a href="#" style="display:inline-block;background:#4f46e5;color:#fff;padding:13px 30px;border-radius:50px;font-size:14px;font-weight:700;text-decoration:none;font-family:Inter,sans-serif">Get Started →</a></div>`,
  },
  {
    id: 'cb-badge',
    label: 'Badge',
    category: 'Typography',
    icon: ico('<rect x="6" y="14" width="28" height="12" rx="6"/><line x1="12" y1="20" x2="28" y2="20"/>'),
    content: `<span style="display:inline-block;background:#ede9fe;color:#4f46e5;font-size:12px;font-weight:700;padding:5px 14px;border-radius:50px;text-transform:uppercase;letter-spacing:.08em">New</span>`,
  },
  {
    id: 'cb-alert',
    label: 'Alert Box',
    category: 'Typography',
    icon: ico('<path d="M20 8l14 24H6L20 8z"/><line x1="20" y1="18" x2="20" y2="24"/><circle cx="20" cy="28" r="1.5" fill="currentColor" stroke="none"/>'),
    content: `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;padding:14px 18px;border-radius:6px;display:flex;gap:12px;align-items:flex-start">
  <span style="color:#3b82f6;font-size:18px;margin-top:1px">ℹ</span>
  <div>
    <strong style="color:#1e40af;font-size:14px;display:block;margin-bottom:4px">Information</strong>
    <p style="color:#1e40af;font-size:13px;margin:0;line-height:1.5">This is an informational alert. Click to edit this message.</p>
  </div>
</div>`,
  },

  /* ══════════════════════════════════
     CONTENT WIDGETS
  ══════════════════════════════════ */
  {
    id: 'cb-icon-box',
    label: 'Icon Box',
    category: 'Content',
    icon: ico('<rect x="4" y="14" width="14" height="14" rx="3"/><circle cx="11" cy="21" r="4" stroke="currentColor"/><line x1="22" y1="16" x2="36" y2="16"/><line x1="22" y1="22" x2="33" y2="22"/>'),
    content: `<div style="display:flex;gap:18px;align-items:flex-start;padding:24px;background:#fff;border-radius:12px;border:1px solid #f3f4f6">
  <div style="width:52px;height:52px;background:#ede9fe;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px">📦</div>
  <div>
    <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 6px;font-family:Inter,sans-serif">Feature Title</h3>
    <p style="font-size:14px;color:#6b7280;margin:0;line-height:1.6">Describe the feature or benefit here. Keep it short and impactful.</p>
  </div>
</div>`,
  },
  {
    id: 'cb-feature-cards',
    label: 'Feature Cards',
    category: 'Content',
    icon: ico('<rect x="3" y="8" width="10" height="24" rx="2"/><rect x="15" y="8" width="10" height="24" rx="2"/><rect x="27" y="8" width="10" height="24" rx="2"/>'),
    content: `<section style="padding:70px 40px;background:#f9fafb">
  <div style="max-width:1100px;margin:0 auto">
    <h2 style="text-align:center;font-size:32px;font-weight:800;color:#111827;margin:0 0 48px;font-family:Inter,sans-serif">Why Choose Us</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px">
      <div style="background:#fff;border-radius:14px;padding:30px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <div style="font-size:36px;margin-bottom:16px">🚀</div>
        <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 10px;font-family:Inter,sans-serif">Fast Turnaround</h3>
        <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">7–10 day production with rush options available for urgent orders.</p>
      </div>
      <div style="background:#fff;border-radius:14px;padding:30px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <div style="font-size:36px;margin-bottom:16px">🎨</div>
        <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 10px;font-family:Inter,sans-serif">Free Design Support</h3>
        <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">Our in-house designers help bring your packaging vision to life.</p>
      </div>
      <div style="background:#fff;border-radius:14px;padding:30px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <div style="font-size:36px;margin-bottom:16px">✅</div>
        <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 10px;font-family:Inter,sans-serif">100% Quality Guarantee</h3>
        <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">We stand behind every box. If it's wrong, we reprint it—free.</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: 'cb-testimonial',
    label: 'Testimonial',
    category: 'Content',
    icon: ico('<path d="M8 24c2 0 4-1 4-5V9H8v10h2c0 2-.5 4-2 4v1zM20 24c2 0 4-1 4-5V9h-4v10h2c0 2-.5 4-2 4v1z" fill="currentColor" opacity=".7" stroke="none"/><line x1="5" y1="30" x2="35" y2="30"/>'),
    content: `<div style="background:#f8fafc;border-radius:16px;padding:36px;max-width:600px;border-left:4px solid #4f46e5">
  <p style="font-size:17px;color:#374151;line-height:1.7;margin:0 0 24px;font-style:italic">"Prime Packaging delivered beyond our expectations. The quality is outstanding and they had our order ready in just 8 days. Our customers love the unboxing experience!"</p>
  <div style="display:flex;align-items:center;gap:14px">
    <div style="width:48px;height:48px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px">S</div>
    <div>
      <strong style="color:#111827;display:block;font-size:15px">Sarah Johnson</strong>
      <span style="color:#9ca3af;font-size:13px">CEO, Glow Beauty Co.</span>
    </div>
    <div style="margin-left:auto;color:#f59e0b;font-size:18px">★★★★★</div>
  </div>
</div>`,
  },
  {
    id: 'cb-testimonials-row',
    label: 'Reviews Row',
    category: 'Content',
    icon: ico('<rect x="3" y="10" width="15" height="20" rx="3"/><rect x="22" y="10" width="15" height="20" rx="3"/><line x1="6" y1="16" x2="15" y2="16"/><line x1="6" y1="20" x2="13" y2="20"/><line x1="25" y1="16" x2="34" y2="16"/><line x1="25" y1="20" x2="32" y2="20"/>'),
    content: `<section style="padding:70px 40px;background:#fff">
  <div style="max-width:1100px;margin:0 auto">
    <h2 style="text-align:center;font-size:32px;font-weight:800;color:#111827;margin:0 0 48px;font-family:Inter,sans-serif">What Our Clients Say</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px">
      <div style="background:#f8fafc;border-radius:14px;padding:28px">
        <div style="color:#f59e0b;font-size:16px;margin-bottom:14px">★★★★★</div>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;font-style:italic">"Absolutely love the quality. Our brand now stands out on every shelf."</p>
        <strong style="color:#111827;font-size:14px">Alex M. — Brand Manager</strong>
      </div>
      <div style="background:#f8fafc;border-radius:14px;padding:28px">
        <div style="color:#f59e0b;font-size:16px;margin-bottom:14px">★★★★★</div>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;font-style:italic">"Fast turnaround, responsive team, and beautiful results every time."</p>
        <strong style="color:#111827;font-size:14px">Maria L. — Founder, Luxe Candles</strong>
      </div>
      <div style="background:#f8fafc;border-radius:14px;padding:28px">
        <div style="color:#f59e0b;font-size:16px;margin-bottom:14px">★★★★★</div>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;font-style:italic">"Best packaging partner we've had. Will definitely reorder for our next launch."</p>
        <strong style="color:#111827;font-size:14px">James T. — E-commerce Owner</strong>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: 'cb-pricing',
    label: 'Pricing Card',
    category: 'Content',
    icon: ico('<rect x="8" y="4" width="24" height="32" rx="4"/><line x1="14" y1="13" x2="26" y2="13"/><line x1="14" y1="18" x2="24" y2="18"/><line x1="14" y1="23" x2="22" y2="23"/><rect x="10" y="28" width="20" height="6" rx="3" fill="currentColor" opacity=".4"/>'),
    content: `<div style="background:#fff;border-radius:16px;padding:36px;max-width:320px;border:2px solid #4f46e5;box-shadow:0 20px 40px rgba(79,70,229,.1);text-align:center">
  <span style="background:#4f46e5;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:50px;text-transform:uppercase;letter-spacing:.08em">Most Popular</span>
  <h3 style="font-size:22px;font-weight:800;color:#111827;margin:16px 0 4px;font-family:Inter,sans-serif">Professional</h3>
  <p style="color:#9ca3af;font-size:13px;margin:0 0 20px">Perfect for growing brands</p>
  <div style="font-size:48px;font-weight:900;color:#111827;line-height:1;margin-bottom:24px">$0.89<span style="font-size:16px;color:#9ca3af;font-weight:400">/unit</span></div>
  <ul style="list-style:none;padding:0;margin:0 0 28px;text-align:left">
    <li style="padding:8px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6">✅ 100 unit minimum</li>
    <li style="padding:8px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6">✅ Free design support</li>
    <li style="padding:8px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6">✅ Full color printing</li>
    <li style="padding:8px 0;color:#374151;font-size:14px">✅ 7–10 day turnaround</li>
  </ul>
  <a href="#" style="display:block;background:#4f46e5;color:#fff;padding:13px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">Get Quote →</a>
</div>`,
  },
  {
    id: 'cb-stats',
    label: 'Stats Row',
    category: 'Content',
    icon: ico('<line x1="5" y1="30" x2="35" y2="30"/><rect x="7" y="20" width="6" height="10" rx="1" fill="currentColor" opacity=".5"/><rect x="17" y="12" width="6" height="18" rx="1" fill="currentColor" opacity=".7"/><rect x="27" y="16" width="6" height="14" rx="1" fill="currentColor" opacity=".5"/>'),
    content: `<section style="padding:60px 40px;background:#1e2040">
  <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:40px;text-align:center">
    <div>
      <div style="font-size:48px;font-weight:900;color:#fff;font-family:Inter,sans-serif">500+</div>
      <div style="color:#a5b4fc;font-size:14px;margin-top:8px">US Brands Served</div>
    </div>
    <div>
      <div style="font-size:48px;font-weight:900;color:#fff;font-family:Inter,sans-serif">10M+</div>
      <div style="color:#a5b4fc;font-size:14px;margin-top:8px">Boxes Delivered</div>
    </div>
    <div>
      <div style="font-size:48px;font-weight:900;color:#fff;font-family:Inter,sans-serif">100%</div>
      <div style="color:#a5b4fc;font-size:14px;margin-top:8px">Quality Guarantee</div>
    </div>
    <div>
      <div style="font-size:48px;font-weight:900;color:#fff;font-family:Inter,sans-serif">4.9★</div>
      <div style="color:#a5b4fc;font-size:14px;margin-top:8px">Average Rating</div>
    </div>
  </div>
</section>`,
  },
  {
    id: 'cb-progress-bar',
    label: 'Progress Bar',
    category: 'Content',
    icon: ico('<rect x="4" y="15" width="32" height="10" rx="5"/><rect x="4" y="15" width="22" height="10" rx="5" fill="currentColor" opacity=".4" stroke="none"/>'),
    content: `<div style="padding:20px 0">
  <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px;font-weight:600;color:#374151">Brand Recognition</span><span style="font-size:13px;color:#6b7280">85%</span></div>
  <div style="background:#f3f4f6;border-radius:50px;height:8px;overflow:hidden"><div style="background:linear-gradient(90deg,#4f46e5,#818cf8);height:100%;width:85%;border-radius:50px"></div></div>
  <div style="display:flex;justify-content:space-between;margin:16px 0 6px"><span style="font-size:13px;font-weight:600;color:#374151">Customer Satisfaction</span><span style="font-size:13px;color:#6b7280">98%</span></div>
  <div style="background:#f3f4f6;border-radius:50px;height:8px;overflow:hidden"><div style="background:linear-gradient(90deg,#10b981,#34d399);height:100%;width:98%;border-radius:50px"></div></div>
  <div style="display:flex;justify-content:space-between;margin:16px 0 6px"><span style="font-size:13px;font-weight:600;color:#374151">On-time Delivery</span><span style="font-size:13px;color:#6b7280">95%</span></div>
  <div style="background:#f3f4f6;border-radius:50px;height:8px;overflow:hidden"><div style="background:linear-gradient(90deg,#f59e0b,#fcd34d);height:100%;width:95%;border-radius:50px"></div></div>
</div>`,
  },
  {
    id: 'cb-accordion',
    label: 'Accordion',
    category: 'Content',
    icon: ico('<rect x="4" y="6" width="32" height="9" rx="2"/><polyline points="30,10 33,10.5 30,14.5" transform="rotate(90,32,11)"/><rect x="4" y="18" width="32" height="9" rx="2" opacity=".5"/><rect x="4" y="30" width="32" height="6" rx="2" opacity=".3"/>'),
    content: `<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;font-family:Inter,sans-serif">
  <details style="border-bottom:1px solid #e5e7eb" open>
    <summary style="padding:16px 20px;cursor:pointer;font-size:15px;font-weight:600;color:#111827;display:flex;justify-content:space-between;list-style:none">What is the minimum order quantity? <span>▼</span></summary>
    <div style="padding:0 20px 16px;font-size:14px;color:#6b7280;line-height:1.7">Our minimum order is 100 units. This applies to all custom-printed box styles including mailers, rigid boxes, and folding cartons.</div>
  </details>
  <details style="border-bottom:1px solid #e5e7eb">
    <summary style="padding:16px 20px;cursor:pointer;font-size:15px;font-weight:600;color:#111827;display:flex;justify-content:space-between;list-style:none">How long does production take? <span>▶</span></summary>
    <div style="padding:0 20px 16px;font-size:14px;color:#6b7280;line-height:1.7">Standard production is 7–10 business days. Rush options (3–5 days) are available at an additional cost.</div>
  </details>
  <details>
    <summary style="padding:16px 20px;cursor:pointer;font-size:15px;font-weight:600;color:#111827;display:flex;justify-content:space-between;list-style:none">Do you offer free design support? <span>▶</span></summary>
    <div style="padding:0 20px 16px;font-size:14px;color:#6b7280;line-height:1.7">Yes! Every order includes complimentary design support from our in-house team. Just share your files or brief and we'll handle the rest.</div>
  </details>
</div>`,
  },
  {
    id: 'cb-timeline',
    label: 'Timeline',
    category: 'Content',
    icon: ico('<line x1="20" y1="4" x2="20" y2="36"/><circle cx="20" cy="10" r="4" fill="currentColor" opacity=".8"/><circle cx="20" cy="20" r="4" fill="currentColor" opacity=".5"/><circle cx="20" cy="30" r="4" fill="currentColor" opacity=".3"/><line x1="24" y1="10" x2="36" y2="10"/><line x1="24" y1="20" x2="36" y2="20"/><line x1="24" y1="30" x2="36" y2="30"/>'),
    content: `<div style="padding:20px 0;font-family:Inter,sans-serif">
  <div style="display:flex;gap:20px;margin-bottom:28px;position:relative">
    <div style="width:40px;height:40px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0;z-index:1">1</div>
    <div style="padding-top:8px"><h4 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 6px">Submit Your Order</h4><p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6">Fill out our quote form with your box dimensions, quantity, and design requirements.</p></div>
  </div>
  <div style="display:flex;gap:20px;margin-bottom:28px">
    <div style="width:40px;height:40px;background:#6366f1;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0">2</div>
    <div style="padding-top:8px"><h4 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 6px">Design & Approval</h4><p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6">Our team creates your dieline and artwork. You approve the design before we print.</p></div>
  </div>
  <div style="display:flex;gap:20px">
    <div style="width:40px;height:40px;background:#818cf8;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0">3</div>
    <div style="padding-top:8px"><h4 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 6px">Production & Delivery</h4><p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6">Your boxes are printed, quality-checked, and shipped to your door in 7–10 days.</p></div>
  </div>
</div>`,
  },
  {
    id: 'cb-image-box',
    label: 'Image Box',
    category: 'Content',
    icon: ico('<rect x="4" y="4" width="32" height="22" rx="3"/><line x1="4" y1="28" x2="36" y2="28"/><line x1="4" y1="34" x2="28" y2="34"/>'),
    content: `<div style="border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);background:#fff;max-width:380px">
  <img src="https://placehold.co/380x220/f3f4f6/9ca3af?text=Box+Image" alt="Product Box" style="width:100%;display:block"/>
  <div style="padding:20px">
    <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px;font-family:Inter,sans-serif">Custom Mailer Boxes</h3>
    <p style="font-size:13px;color:#6b7280;margin:0 0 14px;line-height:1.6">Premium E-flute corrugated mailers perfect for subscription boxes and e-commerce shipping.</p>
    <a href="#" style="color:#4f46e5;font-size:13px;font-weight:600;text-decoration:none">View Details →</a>
  </div>
</div>`,
  },
  {
    id: 'cb-team-card',
    label: 'Team Card',
    category: 'Content',
    icon: ico('<circle cx="20" cy="14" r="7"/><path d="M6 36c0-8 6-12 14-12s14 4 14 12"/>'),
    content: `<div style="text-align:center;padding:28px;background:#fff;border-radius:14px;border:1px solid #f3f4f6;max-width:220px">
  <img src="https://placehold.co/80x80/ede9fe/4f46e5?text=TM" alt="Team Member" style="width:80px;height:80px;border-radius:50%;margin:0 auto 14px;display:block"/>
  <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 4px;font-family:Inter,sans-serif">John Smith</h3>
  <p style="font-size:13px;color:#4f46e5;margin:0 0 10px;font-weight:600">Lead Designer</p>
  <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.5">Creating beautiful packaging solutions for 500+ brands.</p>
</div>`,
  },
  {
    id: 'cb-product-card',
    label: 'Product Card',
    category: 'Content',
    icon: ico('<rect x="4" y="4" width="32" height="32" rx="4"/><line x1="4" y1="22" x2="36" y2="22"/><line x1="10" y1="28" x2="20" y2="28"/><rect x="22" y="26" width="10" height="7" rx="3" fill="currentColor" opacity=".4"/>'),
    content: `<div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);background:#fff;max-width:300px">
  <div style="position:relative">
    <img src="https://placehold.co/300x220/f3f4f6/9ca3af?text=Product" alt="" style="width:100%;display:block"/>
    <span style="position:absolute;top:12px;left:12px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px">Best Seller</span>
  </div>
  <div style="padding:18px">
    <h3 style="font-size:15px;font-weight:700;color:#111827;margin:0 0 6px;font-family:Inter,sans-serif">Custom Rigid Boxes</h3>
    <p style="font-size:13px;color:#9ca3af;margin:0 0 12px">Premium setup boxes for luxury brands</p>
    <div style="display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:18px;font-weight:800;color:#111827">From $1.20</span>
      <a href="#" style="background:#4f46e5;color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none">Quote</a>
    </div>
  </div>
</div>`,
  },
  {
    id: 'cb-cta-banner',
    label: 'CTA Banner',
    category: 'Content',
    icon: ico('<rect x="3" y="10" width="34" height="20" rx="4"/><line x1="8" y1="17" x2="22" y2="17"/><line x1="8" y1="23" x2="18" y2="23"/><rect x="26" y="15" width="9" height="10" rx="3" fill="currentColor" opacity=".4"/>'),
    content: `<div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:50px 40px;text-align:center;border-radius:16px">
  <h2 style="color:#fff;font-size:30px;font-weight:800;margin:0 0 12px;font-family:Inter,sans-serif">Ready to Elevate Your Packaging?</h2>
  <p style="color:#c7d2fe;font-size:16px;margin:0 0 28px">Get a free custom quote in under 24 hours. No commitment required.</p>
  <a href="#" style="display:inline-block;background:#fff;color:#4f46e5;padding:13px 32px;border-radius:50px;font-size:15px;font-weight:700;text-decoration:none">Get a Free Quote →</a>
</div>`,
  },
  {
    id: 'cb-feature-list',
    label: 'Feature List',
    category: 'Content',
    icon: ico('<polyline points="5,10 9,14 15,6"/><line x1="19" y1="10" x2="35" y2="10"/><polyline points="5,20 9,24 15,16"/><line x1="19" y1="20" x2="35" y2="20"/><polyline points="5,30 9,34 15,26"/><line x1="19" y1="30" x2="35" y2="30"/>'),
    content: `<ul style="list-style:none;padding:0;margin:0;font-family:Inter,sans-serif">
  <li style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6"><span style="color:#10b981;font-size:18px">✓</span><span style="font-size:15px;color:#374151">Free design support on every order</span></li>
  <li style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6"><span style="color:#10b981;font-size:18px">✓</span><span style="font-size:15px;color:#374151">100 unit minimum — no huge commitments</span></li>
  <li style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6"><span style="color:#10b981;font-size:18px">✓</span><span style="font-size:15px;color:#374151">7–10 day production turnaround</span></li>
  <li style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6"><span style="color:#10b981;font-size:18px">✓</span><span style="font-size:15px;color:#374151">Full-color printing with pantone matching</span></li>
  <li style="display:flex;align-items:center;gap:12px;padding:10px 0"><span style="color:#10b981;font-size:18px">✓</span><span style="font-size:15px;color:#374151">100% quality guarantee — we reprint if needed</span></li>
</ul>`,
  },
  {
    id: 'cb-comparison-table',
    label: 'Compare Table',
    category: 'Content',
    icon: ico('<rect x="3" y="6" width="34" height="28" rx="3"/><line x1="3" y1="14" x2="37" y2="14"/><line x1="20" y1="6" x2="20" y2="34"/><line x1="3" y1="21" x2="37" y2="21"/><line x1="3" y1="28" x2="37" y2="28"/>'),
    content: `<div style="overflow-x:auto;font-family:Inter,sans-serif">
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead>
      <tr style="background:#1e2040;color:#fff">
        <th style="padding:14px 16px;text-align:left;font-weight:700">Feature</th>
        <th style="padding:14px 16px;text-align:center;font-weight:700;color:#a5b4fc">Standard</th>
        <th style="padding:14px 16px;text-align:center;font-weight:700;background:#4f46e5">Professional</th>
        <th style="padding:14px 16px;text-align:center;font-weight:700;color:#a5b4fc">Enterprise</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 16px;color:#374151">Min. Order</td><td style="padding:12px 16px;text-align:center;color:#6b7280">500 units</td><td style="padding:12px 16px;text-align:center;font-weight:600;color:#4f46e5;background:#faf5ff">100 units</td><td style="padding:12px 16px;text-align:center;color:#6b7280">50 units</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:12px 16px;color:#374151">Design Support</td><td style="padding:12px 16px;text-align:center">—</td><td style="padding:12px 16px;text-align:center;color:#10b981;background:#faf5ff">✓ Free</td><td style="padding:12px 16px;text-align:center;color:#10b981">✓ Free</td></tr>
      <tr><td style="padding:12px 16px;color:#374151">Rush Available</td><td style="padding:12px 16px;text-align:center">—</td><td style="padding:12px 16px;text-align:center;color:#10b981;background:#faf5ff">✓</td><td style="padding:12px 16px;text-align:center;color:#10b981">✓</td></tr>
    </tbody>
  </table>
</div>`,
  },
  {
    id: 'cb-gallery',
    label: 'Image Gallery',
    category: 'Content',
    icon: ico('<rect x="3" y="3" width="15" height="15" rx="2"/><rect x="22" y="3" width="15" height="15" rx="2"/><rect x="3" y="22" width="15" height="15" rx="2"/><rect x="22" y="22" width="15" height="15" rx="2"/>'),
    content: `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:4px">
  <img src="https://placehold.co/360x260/f3f4f6/9ca3af?text=Box+1" alt="" style="width:100%;border-radius:8px;display:block"/>
  <img src="https://placehold.co/360x260/f3f4f6/9ca3af?text=Box+2" alt="" style="width:100%;border-radius:8px;display:block"/>
  <img src="https://placehold.co/360x260/f3f4f6/9ca3af?text=Box+3" alt="" style="width:100%;border-radius:8px;display:block"/>
  <img src="https://placehold.co/360x260/f3f4f6/9ca3af?text=Box+4" alt="" style="width:100%;border-radius:8px;display:block"/>
</div>`,
  },
  {
    id: 'cb-tabs',
    label: 'Tabs',
    category: 'Content',
    icon: ico('<rect x="3" y="14" width="34" height="22" rx="3"/><rect x="3" y="8" width="10" height="9" rx="2"/><rect x="15" y="8" width="10" height="9" rx="2" opacity=".4"/><rect x="27" y="8" width="10" height="9" rx="2" opacity=".3"/>'),
    content: `<div style="font-family:Inter,sans-serif">
  <div style="display:flex;gap:0;border-bottom:2px solid #e5e7eb;margin-bottom:20px">
    <button style="padding:10px 20px;font-size:14px;font-weight:600;color:#4f46e5;border-bottom:2px solid #4f46e5;margin-bottom:-2px;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer">Mailer Boxes</button>
    <button style="padding:10px 20px;font-size:14px;font-weight:600;color:#9ca3af;background:none;border:none;cursor:pointer">Rigid Boxes</button>
    <button style="padding:10px 20px;font-size:14px;font-weight:600;color:#9ca3af;background:none;border:none;cursor:pointer">Folding Cartons</button>
  </div>
  <div style="padding:4px">
    <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 10px">Custom Mailer Boxes</h3>
    <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">Our custom mailer boxes are made from durable E-flute corrugated material, perfect for subscription boxes, e-commerce shipping, and retail packaging.</p>
  </div>
</div>`,
  },
  {
    id: 'cb-steps',
    label: 'How It Works',
    category: 'Content',
    icon: ico('<circle cx="10" cy="20" r="6"/><circle cx="20" cy="20" r="6" opacity=".6"/><circle cx="30" cy="20" r="6" opacity=".4"/><line x1="16" y1="20" x2="14" y2="20"/><line x1="26" y1="20" x2="24" y2="20"/>'),
    content: `<section style="padding:70px 40px;background:#f9fafb">
  <div style="max-width:900px;margin:0 auto;text-align:center">
    <h2 style="font-size:32px;font-weight:800;color:#111827;margin:0 0 48px;font-family:Inter,sans-serif">How It Works</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px">
      <div>
        <div style="width:56px;height:56px;background:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;margin:0 auto 16px">1</div>
        <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px;font-family:Inter,sans-serif">Get a Quote</h3>
        <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6">Submit your specs and get a custom price in 24 hours</p>
      </div>
      <div>
        <div style="width:56px;height:56px;background:#6366f1;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;margin:0 auto 16px">2</div>
        <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px;font-family:Inter,sans-serif">Approve Design</h3>
        <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6">Review your artwork and approve before we print</p>
      </div>
      <div>
        <div style="width:56px;height:56px;background:#818cf8;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;margin:0 auto 16px">3</div>
        <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px;font-family:Inter,sans-serif">Get Delivered</h3>
        <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6">Your boxes arrive at your door in 7–10 business days</p>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: 'cb-faq',
    label: 'FAQ Section',
    category: 'Content',
    icon: ico('<circle cx="20" cy="14" r="8"/><line x1="20" y1="12" x2="20" y2="15"/><circle cx="20" cy="17.5" r="1.2" fill="currentColor" stroke="none"/><line x1="10" y1="28" x2="30" y2="28"/><line x1="10" y1="34" x2="26" y2="34"/>'),
    content: `<section style="padding:70px 40px;background:#fff">
  <div style="max-width:720px;margin:0 auto">
    <h2 style="text-align:center;font-size:32px;font-weight:800;color:#111827;margin:0 0 48px;font-family:Inter,sans-serif">Frequently Asked Questions</h2>
    <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <details style="border-bottom:1px solid #e5e7eb" open>
        <summary style="padding:18px 22px;cursor:pointer;font-size:15px;font-weight:600;color:#111827;list-style:none">How do I place an order?</summary>
        <div style="padding:0 22px 18px;font-size:14px;color:#6b7280;line-height:1.7">Fill out our online quote form or email us directly. Include your box size, quantity, and design files or brief. We'll respond within 24 hours.</div>
      </details>
      <details style="border-bottom:1px solid #e5e7eb">
        <summary style="padding:18px 22px;cursor:pointer;font-size:15px;font-weight:600;color:#111827;list-style:none">What file formats do you accept?</summary>
        <div style="padding:0 22px 18px;font-size:14px;color:#6b7280;line-height:1.7">We accept AI, PDF, PSD, and EPS files. If you only have a logo or concept, our design team can create the full artwork for you at no charge.</div>
      </details>
      <details>
        <summary style="padding:18px 22px;cursor:pointer;font-size:15px;font-weight:600;color:#111827;list-style:none">Do you ship internationally?</summary>
        <div style="padding:0 22px 18px;font-size:14px;color:#6b7280;line-height:1.7">We ship throughout the USA and Canada. For international orders outside these regions, please contact us directly to discuss options.</div>
      </details>
    </div>
  </div>
</section>`,
  },
  {
    id: 'cb-breadcrumb',
    label: 'Breadcrumb',
    category: 'Content',
    icon: ico('<line x1="4" y1="20" x2="36" y2="20"/><polyline points="16,14 22,20 16,26"/><polyline points="26,14 32,20 26,26"/>'),
    content: `<nav style="padding:12px 0;font-size:13px;color:#9ca3af;font-family:Inter,sans-serif"><a href="/" style="color:#4f46e5;text-decoration:none">Home</a> <span style="margin:0 8px">›</span> <a href="/products" style="color:#4f46e5;text-decoration:none">Products</a> <span style="margin:0 8px">›</span> <span style="color:#374151">Custom Mailer Boxes</span></nav>`,
  },

  /* ══════════════════════════════════
     FORMS & INTERACTION
  ══════════════════════════════════ */
  {
    id: 'cb-contact-form',
    label: 'Contact Form',
    category: 'Forms',
    icon: ico('<rect x="4" y="6" width="32" height="9" rx="2"/><rect x="4" y="18" width="32" height="16" rx="2"/><rect x="4" y="37" width="14" height="7" rx="3" fill="currentColor" opacity=".4"/>'),
    content: `<div style="background:#fff;padding:36px;border-radius:14px;border:1px solid #e5e7eb;max-width:560px;font-family:Inter,sans-serif">
  <h3 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 6px">Get a Free Quote</h3>
  <p style="font-size:13px;color:#9ca3af;margin:0 0 24px">We'll respond within 24 hours</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
    <div><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">First Name</label><input type="text" placeholder="John" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none"/></div>
    <div><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Last Name</label><input type="text" placeholder="Smith" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none"/></div>
  </div>
  <div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Email</label><input type="email" placeholder="john@company.com" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none"/></div>
  <div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Message</label><textarea rows="4" placeholder="Tell us about your project..." style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box;outline:none;font-family:inherit"></textarea></div>
  <button style="width:100%;background:#4f46e5;color:#fff;border:none;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">Send Message</button>
</div>`,
  },
  {
    id: 'cb-newsletter',
    label: 'Newsletter',
    category: 'Forms',
    icon: ico('<rect x="4" y="10" width="32" height="20" rx="3"/><polyline points="4,10 20,22 36,10"/><line x1="28" y1="28" x2="28" y2="32"/>'),
    content: `<div style="background:linear-gradient(135deg,#faf5ff 0%,#ede9fe 100%);padding:40px;border-radius:14px;text-align:center;border:1px solid #ddd6fe">
  <h3 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 8px;font-family:Inter,sans-serif">Stay in the Loop</h3>
  <p style="font-size:14px;color:#6b7280;margin:0 0 24px">Get packaging tips, special offers, and industry news delivered to your inbox.</p>
  <div style="display:flex;gap:10px;max-width:420px;margin:0 auto;flex-wrap:wrap">
    <input type="email" placeholder="Enter your email address" style="flex:1;min-width:200px;padding:12px 16px;border:1px solid #ddd6fe;border-radius:50px;font-size:14px;outline:none;font-family:Inter,sans-serif"/>
    <button style="background:#4f46e5;color:#fff;border:none;padding:12px 22px;border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">Subscribe</button>
  </div>
</div>`,
  },
  {
    id: 'cb-search',
    label: 'Search Bar',
    category: 'Forms',
    icon: ico('<circle cx="17" cy="17" r="10"/><line x1="25" y1="25" x2="35" y2="35"/>'),
    content: `<div style="display:flex;align-items:center;border:2px solid #e5e7eb;border-radius:50px;overflow:hidden;max-width:480px;background:#fff">
  <span style="padding:0 16px;color:#9ca3af;font-size:16px">🔍</span>
  <input type="search" placeholder="Search products…" style="flex:1;padding:12px 0;border:none;font-size:15px;outline:none;font-family:Inter,sans-serif;background:transparent"/>
  <button style="background:#4f46e5;color:#fff;border:none;padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer;height:100%">Search</button>
</div>`,
  },
  {
    id: 'cb-quote-form',
    label: 'Quote Form',
    category: 'Forms',
    icon: ico('<rect x="4" y="4" width="32" height="32" rx="4"/><line x1="10" y1="13" x2="30" y2="13"/><line x1="10" y1="20" x2="30" y2="20"/><line x1="10" y1="27" x2="20" y2="27"/>'),
    content: `<div style="background:#fff;padding:36px;border-radius:14px;border:1px solid #e5e7eb;max-width:580px;font-family:Inter,sans-serif">
  <h3 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 24px">Request a Custom Quote</h3>
  <div style="margin-bottom:14px"><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Box Type</label>
    <select style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none;background:#fff">
      <option>Custom Mailer Box</option><option>Rigid Box</option><option>Folding Carton</option><option>Corrugated Shipper</option>
    </select>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">
    <div><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Length (in)</label><input type="number" placeholder="12" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none"/></div>
    <div><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Width (in)</label><input type="number" placeholder="8" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none"/></div>
    <div><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Height (in)</label><input type="number" placeholder="4" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none"/></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
    <div><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Quantity</label><input type="number" placeholder="500" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none"/></div>
    <div><label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px">Email</label><input type="email" placeholder="you@company.com" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;outline:none"/></div>
  </div>
  <button style="width:100%;background:#ef4444;color:#fff;border:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer">Get My Free Quote →</button>
</div>`,
  },

  /* ══════════════════════════════════
     MEDIA
  ══════════════════════════════════ */
  {
    id: 'cb-video-section',
    label: 'Video Section',
    category: 'Media',
    icon: ico('<rect x="3" y="7" width="34" height="26" rx="3"/><polygon points="16,14 30,20 16,26" fill="currentColor" opacity=".6" stroke="none"/>'),
    content: `<div style="background:#000;border-radius:12px;overflow:hidden;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;max-width:700px">
  <div style="text-align:center;color:#fff">
    <div style="width:70px;height:70px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;cursor:pointer;font-size:26px">▶</div>
    <p style="font-size:14px;color:#9ca3af;margin:0">Watch Our Process Video</p>
  </div>
</div>`,
  },
  {
    id: 'cb-youtube',
    label: 'YouTube',
    category: 'Media',
    icon: ico('<rect x="3" y="8" width="34" height="24" rx="4"/><polygon points="16,14 28,20 16,26" fill="currentColor" opacity=".7" stroke="none"/>'),
    content: `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;max-width:700px">
  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen title="Video"></iframe>
</div>`,
  },
  {
    id: 'cb-icon-grid',
    label: 'Icon Grid',
    category: 'Media',
    icon: ico('<circle cx="10" cy="10" r="6"/><circle cx="30" cy="10" r="6"/><circle cx="10" cy="30" r="6"/><circle cx="30" cy="30" r="6"/>'),
    content: `<section style="padding:60px 40px;background:#f9fafb">
  <div style="max-width:900px;margin:0 auto">
    <h2 style="text-align:center;font-size:28px;font-weight:800;color:#111827;margin:0 0 40px;font-family:Inter,sans-serif">We Handle Every Detail</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:24px;text-align:center">
      <div><div style="font-size:32px;margin-bottom:10px">📐</div><div style="font-size:13px;font-weight:600;color:#374151">Custom Sizes</div></div>
      <div><div style="font-size:32px;margin-bottom:10px">🖨️</div><div style="font-size:13px;font-weight:600;color:#374151">Full Color Print</div></div>
      <div><div style="font-size:32px;margin-bottom:10px">🌿</div><div style="font-size:13px;font-weight:600;color:#374151">Eco Materials</div></div>
      <div><div style="font-size:32px;margin-bottom:10px">✨</div><div style="font-size:13px;font-weight:600;color:#374151">Foil & Emboss</div></div>
      <div><div style="font-size:32px;margin-bottom:10px">🚀</div><div style="font-size:13px;font-weight:600;color:#374151">Rush Orders</div></div>
      <div><div style="font-size:32px;margin-bottom:10px">🛡️</div><div style="font-size:13px;font-weight:600;color:#374151">Quality Check</div></div>
    </div>
  </div>
</section>`,
  },

  /* ══════════════════════════════════
     NAVIGATION & INFO BARS
  ══════════════════════════════════ */
  {
    id: 'cb-top-bar',
    label: 'Top Info Bar',
    category: 'Navigation',
    icon: ico('<rect x="3" y="14" width="34" height="12" rx="2"/><line x1="10" y1="20" x2="18" y2="20"/><line x1="22" y1="20" x2="30" y2="20"/>'),
    content: `<div style="background:#1e2040;color:#a5b4fc;font-size:12px;padding:8px 20px;display:flex;justify-content:center;gap:28px;flex-wrap:wrap">
  <span>🚚 Free Shipping on All US Orders</span>
  <span>⏱ 7–10 Day Turnaround</span>
  <span>🎨 Free Design Support</span>
  <span>📦 100 Unit Minimum</span>
</div>`,
  },
  {
    id: 'cb-social-links',
    label: 'Social Links',
    category: 'Navigation',
    icon: ico('<circle cx="12" cy="20" r="5"/><circle cx="28" cy="12" r="5"/><circle cx="28" cy="28" r="5"/><line x1="17" y1="18" x2="23" y2="14"/><line x1="17" y1="22" x2="23" y2="26"/>'),
    content: `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:8px 0">
  <a href="#" style="width:38px;height:38px;background:#1877f2;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-size:16px;font-weight:700">f</a>
  <a href="#" style="width:38px;height:38px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-size:14px">📸</a>
  <a href="#" style="width:38px;height:38px;background:#1da1f2;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-size:16px">𝕏</a>
  <a href="#" style="width:38px;height:38px;background:#0077b5;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-size:16px">in</a>
  <a href="#" style="width:38px;height:38px;background:#ff0000;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-size:16px">▶</a>
</div>`,
  },
  {
    id: 'cb-footer-simple',
    label: 'Footer',
    category: 'Navigation',
    icon: ico('<rect x="3" y="24" width="34" height="12" rx="2"/><line x1="3" y1="20" x2="37" y2="20"/><line x1="8" y1="29" x2="16" y2="29"/><line x1="20" y1="29" x2="28" y2="29"/><line x1="32" y1="29" x2="37" y2="29"/>'),
    content: `<footer style="background:#111827;color:#9ca3af;padding:50px 40px 28px;font-family:Inter,sans-serif">
  <div style="max-width:1100px;margin:0 auto">
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;flex-wrap:wrap">
      <div>
        <h3 style="color:#fff;font-size:18px;font-weight:800;margin:0 0 14px">Prime Packaging Boxes</h3>
        <p style="font-size:13px;line-height:1.7;margin:0 0 16px">Premium custom packaging for brands that care about unboxing.</p>
        <p style="font-size:13px;margin:0">📞 818-758-4076<br>✉ help@primepackagingboxes.com</p>
      </div>
      <div>
        <h4 style="color:#fff;font-size:14px;font-weight:700;margin:0 0 14px">Products</h4>
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;line-height:2"><li><a href="#" style="color:#9ca3af;text-decoration:none">Mailer Boxes</a></li><li><a href="#" style="color:#9ca3af;text-decoration:none">Rigid Boxes</a></li><li><a href="#" style="color:#9ca3af;text-decoration:none">Folding Cartons</a></li></ul>
      </div>
      <div>
        <h4 style="color:#fff;font-size:14px;font-weight:700;margin:0 0 14px">Company</h4>
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;line-height:2"><li><a href="#" style="color:#9ca3af;text-decoration:none">About Us</a></li><li><a href="#" style="color:#9ca3af;text-decoration:none">FAQ</a></li><li><a href="#" style="color:#9ca3af;text-decoration:none">Contact</a></li></ul>
      </div>
      <div>
        <h4 style="color:#fff;font-size:14px;font-weight:700;margin:0 0 14px">Policies</h4>
        <ul style="list-style:none;padding:0;margin:0;font-size:13px;line-height:2"><li><a href="#" style="color:#9ca3af;text-decoration:none">Privacy Policy</a></li><li><a href="#" style="color:#9ca3af;text-decoration:none">Terms of Service</a></li><li><a href="#" style="color:#9ca3af;text-decoration:none">Refund Policy</a></li></ul>
      </div>
    </div>
    <div style="border-top:1px solid #374151;padding-top:20px;text-align:center;font-size:12px">© 2025 Prime Packaging Boxes. All rights reserved.</div>
  </div>
</footer>`,
  },
  {
    id: 'cb-table',
    label: 'Table',
    category: 'Content',
    icon: ico('<rect x="3" y="6" width="34" height="28" rx="3"/><line x1="3" y1="14" x2="37" y2="14"/><line x1="14" y1="6" x2="14" y2="34"/><line x1="26" y1="6" x2="26" y2="34"/>'),
    content: `<div style="overflow-x:auto;font-family:Inter,sans-serif">
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead><tr style="background:#f9fafb">
      <th style="padding:12px 16px;text-align:left;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb">Box Type</th>
      <th style="padding:12px 16px;text-align:left;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb">Material</th>
      <th style="padding:12px 16px;text-align:left;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb">Min. Order</th>
      <th style="padding:12px 16px;text-align:left;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb">Price/unit</th>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:11px 16px;color:#374151">Mailer Box</td><td style="padding:11px 16px;color:#6b7280">E-Flute Corrugated</td><td style="padding:11px 16px;color:#6b7280">100</td><td style="padding:11px 16px;color:#374151;font-weight:600">$0.89</td></tr>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:11px 16px;color:#374151">Rigid Box</td><td style="padding:11px 16px;color:#6b7280">Greyboard + Wrap</td><td style="padding:11px 16px;color:#6b7280">100</td><td style="padding:11px 16px;color:#374151;font-weight:600">$2.40</td></tr>
      <tr><td style="padding:11px 16px;color:#374151">Folding Carton</td><td style="padding:11px 16px;color:#6b7280">SBS Paperboard</td><td style="padding:11px 16px;color:#6b7280">500</td><td style="padding:11px 16px;color:#374151;font-weight:600">$0.34</td></tr>
    </tbody>
  </table>
</div>`,
  },

  /* ══════════════════════════════════
     DEVELOPER WIDGETS
  ══════════════════════════════════ */
  {
    id: 'cb-html-code',
    label: 'HTML Code',
    category: 'Developer',
    icon: ico('<polyline points="10,14 4,20 10,26"/><polyline points="30,14 36,20 30,26"/><line x1="22" y1="8" x2="18" y2="32"/>'),
    content: `<!-- HTML Widget: Edit this block to add custom HTML code -->
<div class="custom-html-block" style="padding:20px;border:2px dashed #4f46e5;border-radius:8px;background:#f5f3ff;font-family:monospace;font-size:13px;color:#374151;min-height:80px">
  <p style="margin:0 0 10px;font-weight:700;color:#4f46e5">&lt;HTML Widget&gt;</p>
  <p style="margin:0;color:#6b7280">Double-click or use Settings panel to edit this custom HTML block.</p>
</div>`,
  },
  {
    id: 'cb-embed',
    label: 'Embed / iFrame',
    category: 'Developer',
    icon: ico('<rect x="4" y="8" width="32" height="24" rx="3"/><line x1="4" y1="14" x2="36" y2="14"/><circle cx="8" cy="11" r="1.5" fill="currentColor" stroke="none"/><circle cx="13" cy="11" r="1.5" fill="currentColor" stroke="none"/>'),
    content: `<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-118.2614,34.0194,-118.2514,34.0254&amp;layer=mapnik" style="width:100%;height:350px;border:0" title="Map"></iframe>
</div>`,
  },
  {
    id: 'cb-map',
    label: 'Google Map',
    category: 'Developer',
    icon: ico('<path d="M20 6c-5 0-9 4-9 9 0 7 9 17 9 17s9-10 9-17c0-5-4-9-9-9z"/><circle cx="20" cy="15" r="3.5"/>'),
    content: `<div style="border-radius:12px;overflow:hidden">
  <iframe src="https://maps.google.com/maps?q=Los+Angeles,CA&output=embed" style="width:100%;height:350px;border:0" title="Google Maps" loading="lazy"></iframe>
</div>`,
  },
  {
    id: 'cb-rating',
    label: 'Star Rating',
    category: 'Content',
    icon: ico('<polygon points="20,6 24,16 36,16 26,23 30,34 20,27 10,34 14,23 4,16 16,16" fill="currentColor" opacity=".6" stroke="none"/>'),
    content: `<div style="text-align:center;padding:20px">
  <div style="font-size:32px;color:#f59e0b;letter-spacing:4px;margin-bottom:8px">★★★★★</div>
  <p style="font-size:15px;font-weight:600;color:#111827;margin:0 0 4px">Rated 4.9 out of 5</p>
  <p style="font-size:13px;color:#9ca3af;margin:0">Based on 247 verified reviews</p>
</div>`,
  },
  {
    id: 'cb-trust-badges',
    label: 'Trust Badges',
    category: 'Content',
    icon: ico('<path d="M20 4L6 9v7c0 8.4 6 15 14 17 8-2 14-8.6 14-17V9L20 4z"/><polyline points="14,20 18,24 26,14"/>'),
    content: `<div style="display:flex;gap:20px;align-items:center;justify-content:center;flex-wrap:wrap;padding:24px;background:#f9fafb;border-radius:12px">
  <div style="text-align:center"><div style="font-size:28px;margin-bottom:6px">🔒</div><div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.05em">Secure Payment</div></div>
  <div style="width:1px;height:40px;background:#e5e7eb"></div>
  <div style="text-align:center"><div style="font-size:28px;margin-bottom:6px">🚚</div><div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.05em">Free Shipping</div></div>
  <div style="width:1px;height:40px;background:#e5e7eb"></div>
  <div style="text-align:center"><div style="font-size:28px;margin-bottom:6px">✅</div><div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.05em">100% Guarantee</div></div>
  <div style="width:1px;height:40px;background:#e5e7eb"></div>
  <div style="text-align:center"><div style="font-size:28px;margin-bottom:6px">🏅</div><div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.05em">Award Winning</div></div>
</div>`,
  },
];

/* ─── Icon map for block manager panel ─── */
export const CUSTOM_BLOCK_ICONS: Record<string, string> = Object.fromEntries(
  CUSTOM_BLOCKS.map(b => [b.id, b.icon])
);

/* ─── Label map ─── */
export const CUSTOM_BLOCK_LABELS: Record<string, string> = Object.fromEntries(
  CUSTOM_BLOCKS.map(b => [b.id, b.label])
);

/* ─── Register all custom blocks with GrapesJS editor ─── */
export function registerCustomBlocks(editor: Editor): void {
  // GrapesJS 0.23 exposes the blocks module as `Blocks`; older builds used
  // `BlockManager`. Keep both so the builder does not crash during startup.
  const bm = (editor as any).Blocks ?? (editor as any).BlockManager;
  if (!bm) return;
  CUSTOM_BLOCKS.forEach(({ id, label, category, icon, content }) => {
    bm.add(id, { label, category, media: icon, content });
  });
}
