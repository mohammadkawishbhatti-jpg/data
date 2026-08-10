/**
 * Full seed — all categories from the header mega-menu + 50+ products using
 * LOCAL /api/uploads/ images that are already in the uploads folder.
 * Run: node lib/db/seed.mjs
 */
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const U = "/api/uploads"; // local upload base

// ─── ALL CATEGORIES (matches every slug in Header mega-menu) ───────────────
const categories = [
  // BY INDUSTRY
  { name: "Apparel & Clothing Boxes",   slug: "apparel-boxes",        image_url: `${U}/clothing-boxes.webp`,                        sort_order: 1,  meta_title: "Custom Apparel Boxes | Clothing Packaging USA",             meta_description: "Custom clothing and apparel boxes for fashion brands. Premium finishes, low 100-unit MOQ, free design support." },
  { name: "Bakery Boxes",               slug: "bakery-boxes",          image_url: `${U}/custom-bread-packaging-bakery-box.webp`,      sort_order: 2,  meta_title: "Custom Bakery Boxes | Pastry & Cookie Packaging USA",        meta_description: "Custom bakery boxes for bread, cookies, cupcakes, and pastries. Free design, low MOQ from 100 units." },
  { name: "Bottle Boxes",               slug: "bottle-boxes",          image_url: `${U}/100ml-bottle-boxes.webp`,                    sort_order: 3,  meta_title: "Custom Bottle Boxes | Bottle Packaging USA",                meta_description: "Custom printed bottle boxes for skincare, supplements, and beverages. Precision sizing, premium finishes." },
  { name: "Candle Boxes",               slug: "candle-boxes",          image_url: `${U}/candle-packaging-boxes.webp`,                sort_order: 4,  meta_title: "Custom Candle Boxes | Candle Packaging Wholesale USA",       meta_description: "Custom printed candle boxes with window, insert, and premium finishes. Free design support." },
  { name: "CBD Boxes",                  slug: "cbd-boxes",             image_url: `${U}/cbd-oil-boxes.webp`,                         sort_order: 5,  meta_title: "Custom CBD Boxes | CBD Packaging USA",                      meta_description: "Compliant, eye-catching CBD oil and product boxes. Full-color printing, low 100-unit MOQ." },
  { name: "Cereal Boxes",               slug: "cereal-boxes",          image_url: `${U}/breakfast-cereal-boxes.webp`,                sort_order: 6,  meta_title: "Custom Cereal Boxes | Breakfast Packaging USA",             meta_description: "Custom cereal and breakfast food boxes with bold full-color printing. Food-safe board, free design." },
  { name: "Coffee Packaging",           slug: "coffee-packaging",      image_url: `${U}/coffee-bags.webp`,                           sort_order: 7,  meta_title: "Custom Coffee Packaging | Coffee Bags & Boxes USA",         meta_description: "Custom coffee bags and boxes for roasters and cafes. Stand-up pouches, kraft bags, and rigid boxes." },
  { name: "Display Boxes",              slug: "display-boxes",         image_url: `${U}/counter-display-boxes-wholesale.webp`,        sort_order: 8,  meta_title: "Custom Display Boxes | Counter Display Packaging USA",       meta_description: "Custom counter display boxes that drive impulse buys. POP displays in any shape and size." },
  { name: "Food Boxes",                 slug: "food-boxes",            image_url: `${U}/burger-boxes.webp`,                          sort_order: 9,  meta_title: "Custom Food Boxes | Food Safe Packaging USA",               meta_description: "FDA-compliant custom food packaging — burger boxes, bakery, and specialty food brands." },
  { name: "Mailer Boxes",               slug: "mailer-boxes",          image_url: `${U}/corrugated-mailer-boxes.webp`,               sort_order: 10, meta_title: "Custom Mailer Boxes | E-Commerce Shipping Boxes USA",        meta_description: "Custom printed mailer boxes for subscription boxes, apparel, and e-commerce. Low MOQ from 100 units." },
  { name: "Medicine Boxes",             slug: "medicine-boxes",        image_url: `${U}/custom-medicine-boxes.webp`,                 sort_order: 11, meta_title: "Custom Medicine Boxes | Pharmaceutical Packaging USA",       meta_description: "Compliant custom medicine and pharmaceutical boxes with full-color printing and inserts." },
  { name: "Retail Boxes",               slug: "retail-boxes",          image_url: `${U}/carton-packaging-boxes.webp`,                sort_order: 12, meta_title: "Custom Retail Boxes | Shelf-Ready Packaging USA",           meta_description: "Custom retail packaging that stands out on the shelf. Full-color printing, low MOQ from 100 units." },
  { name: "Shipping Boxes",             slug: "shipping-boxes",        image_url: `${U}/shipping-box-packaging.webp`,                sort_order: 13, meta_title: "Custom Shipping Boxes | Corrugated Shipping Packaging USA",  meta_description: "Sturdy custom corrugated shipping boxes for e-commerce and B2B fulfillment." },
  { name: "Soap Boxes",                 slug: "soap-boxes",            image_url: `${U}/custom-kraft-soap-boxes.webp`,               sort_order: 14, meta_title: "Custom Soap Boxes | Bath & Body Packaging USA",             meta_description: "Custom soap packaging with premium finishes for handmade and commercial soap brands." },
  { name: "Gable Boxes",               slug: "gable-boxes",           image_url: `${U}/custom-kraft-gable-boxes.webp`,              sort_order: 15, meta_title: "Custom Gable Boxes | Kraft Gable Packaging USA",            meta_description: "Custom kraft gable boxes for gifts, bakery, and retail. Carry-friendly with full-color printing." },
  { name: "Product Boxes",              slug: "product-boxes",         image_url: `${U}/custom-packaging-sleeves-with-logo.webp`,    sort_order: 16, meta_title: "Custom Product Boxes | Branded Packaging USA",              meta_description: "Custom product packaging boxes for any industry. Full color, any size, low 100-unit MOQ." },

  // HOT SELLING
  { name: "Christmas Gift Boxes",       slug: "christmas-boxes",       image_url: `${U}/christmas-gift-boxes-wholesale.webp`,        sort_order: 17, meta_title: "Custom Christmas Gift Boxes | Holiday Packaging USA",        meta_description: "Custom Christmas and holiday gift boxes with festive printing and ribbon options." },
  { name: "Custom Paper Bags",          slug: "custom-paper-bags",     image_url: `${U}/brown-paper-bags.webp`,                      sort_order: 18, meta_title: "Custom Paper Shopping Bags | Branded Bags USA",             meta_description: "Custom printed paper shopping bags for retail, boutiques, and events. Low MOQ from 100 units." },
  { name: "Jewelry Boxes",              slug: "jewelry-boxes",         image_url: `${U}/ring-boxes.webp`,                            sort_order: 19, meta_title: "Custom Jewelry Boxes | Ring & Necklace Packaging USA",       meta_description: "Premium custom jewelry boxes for rings, necklaces, and luxury accessories." },
  { name: "Pillow Boxes",               slug: "pillow-boxes",          image_url: `${U}/custom-kraft-gable-boxes-wholesale.webp`,    sort_order: 20, meta_title: "Custom Pillow Boxes | Wholesale Pillow Packaging USA",       meta_description: "Custom pillow boxes for jewelry, small gifts, and retail products. Free design support." },
  { name: "Pizza Boxes",                slug: "pizza-boxes",           image_url: `${U}/custom-kraft-pizza-boxes-with-logo.webp`,    sort_order: 21, meta_title: "Custom Pizza Boxes | Kraft Pizza Packaging USA",            meta_description: "Custom printed kraft pizza boxes for pizzerias and food delivery. Grease-resistant, any size." },
  { name: "Tea Packaging",              slug: "tea-packaging",         image_url: `${U}/tea-boxes.webp`,                             sort_order: 22, meta_title: "Custom Tea Boxes | Tea Packaging Wholesale USA",            meta_description: "Custom tea boxes and packaging for tea brands and retailers. Premium finishes, low MOQ." },
  { name: "Trays & Sleeves",            slug: "trays-and-sleeves",     image_url: `${U}/custom-packaging-sleeves-with-logo.webp`,    sort_order: 23, meta_title: "Custom Trays & Sleeves | Packaging Sleeves USA",            meta_description: "Custom packaging trays and sleeves for retail and food products. Elegant wrap-around design." },
  { name: "Window Packaging",           slug: "window-packaging",      image_url: `${U}/custom-kraft-window-boxes-with-logo.webp`,   sort_order: 24, meta_title: "Custom Window Boxes | Window Packaging USA",                meta_description: "Custom boxes with clear window cutouts to showcase your product. Any material, any finish." },
  { name: "Stationery Boxes",           slug: "stationery-boxes",      image_url: `${U}/printed-presentation-folders-bulk.webp`,     sort_order: 25, meta_title: "Custom Stationery Boxes | Presentation Folders USA",        meta_description: "Custom stationery boxes and presentation folders with premium printing and finishes." },
  { name: "Cigarette Boxes",            slug: "cigarette-boxes",       image_url: `${U}/vape-cartridge-packaging.webp`,              sort_order: 26, meta_title: "Custom Cigarette & Vape Boxes | Tobacco Packaging USA",     meta_description: "Custom cigarette and vape packaging with premium printing, compliant finishes, and low MOQ." },

  // BY STYLE / MATERIAL
  { name: "Cardboard Boxes",            slug: "cardboard-boxes",       image_url: `${U}/cardboard-gift-boxes.webp`,                  sort_order: 27, meta_title: "Custom Cardboard Boxes | Printed Cardboard Packaging USA",  meta_description: "Custom cardboard boxes in any shape and size. Full-color printing, premium SBS and CRB board." },
  { name: "Corrugated Boxes",           slug: "corrugated-boxes",      image_url: `${U}/corrugated-mailer-boxes.webp`,               sort_order: 28, meta_title: "Custom Corrugated Boxes | Corrugated Packaging USA",        meta_description: "Durable custom corrugated boxes for shipping and retail. Single-wall and double-wall options." },
  { name: "Custom Kraft Boxes",         slug: "custom-kraft-boxes",    image_url: `${U}/custom-kraft-boxes-wholesale.webp`,          sort_order: 29, meta_title: "Custom Kraft Boxes | Eco-Friendly Packaging USA",           meta_description: "Custom printed kraft boxes — sustainable, recyclable, and beautiful. Starting from 100 units." },
  { name: "Eco-Friendly Boxes",         slug: "eco-friendly-boxes",    image_url: `${U}/custom-kraft-boxes-with-logo.webp`,          sort_order: 30, meta_title: "Eco-Friendly Packaging | Sustainable Boxes USA",            meta_description: "100% recycled and sustainable eco-friendly boxes. FSC certified materials, earth-safe inks." },
  { name: "Cosmetic Boxes",             slug: "cosmetic-boxes",        image_url: `${U}/custom-cream-jars.webp`,                     sort_order: 31, meta_title: "Custom Cosmetic Boxes | Beauty Packaging USA",             meta_description: "Premium cosmetic packaging for skincare and beauty brands. Free design support, low MOQ from 100 units." },
  { name: "Chocolate Boxes",            slug: "chocolate-boxes",       image_url: `${U}/custom-luxury-chocolate-boxes-with-logo.webp`, sort_order: 32, meta_title: "Custom Chocolate Boxes | Confectionery Packaging USA",    meta_description: "Custom chocolate boxes with inserts and window for candy, truffles, and gift chocolates." },
  { name: "Labels & Stickers",          slug: "labels-and-stickers",   image_url: `${U}/custom-die-cut-stickers-with-logo.webp`,     sort_order: 33, meta_title: "Custom Labels & Stickers | Die-Cut Stickers USA",          meta_description: "Custom die-cut labels and stickers for products, packaging, and branding. Any shape, full color." },
  { name: "Custom Mylar Bags",          slug: "custom-mylar-bags",     image_url: `${U}/resealable-mylar-bags.webp`,                 sort_order: 34, meta_title: "Custom Mylar Bags | Resealable Stand-Up Pouches USA",       meta_description: "Custom printed mylar bags and stand-up pouches for food, cannabis, supplements, and more." },
  { name: "Rigid Boxes",                slug: "rigid-boxes",           image_url: `${U}/custom-magnetic-closure-boxes-wholesale.webp`, sort_order: 35, meta_title: "Custom Rigid Boxes | Luxury Gift Box Packaging USA",      meta_description: "Premium rigid gift boxes with magnetic closures and luxury finishes. Perfect for high-end products." },
  { name: "Gift Boxes",                 slug: "gift-boxes",            image_url: `${U}/cardboard-gift-boxes.webp`,                  sort_order: 36, meta_title: "Custom Gift Boxes | Premium Gift Packaging USA",           meta_description: "Custom gift boxes for retail, corporate gifting, and special occasions. Premium finishes available." },

  // FEATURED products referenced in header FEATURED_IN_MENU by product slug but as categories
  { name: "Custom Cake Boxes",          slug: "cake-boxes",            image_url: `${U}/custom-cake-boxes.webp`,                     sort_order: 37, meta_title: "Custom Cake Boxes | Wholesale Bakery Packaging USA",         meta_description: "Order custom printed cake boxes with window, ribbon, and premium finishes. Free design support. 100-unit minimum." },
  { name: "Magnetic Closure Boxes",     slug: "magnetic-closure-boxes",image_url: `${U}/custom-magnetic-closure-boxes-wholesale.webp`, sort_order: 38, meta_title: "Custom Magnetic Closure Boxes | Luxury Gift Boxes USA",   meta_description: "Premium magnetic closure boxes for luxury packaging. Custom sizes, colors, and finishes." },
];

// ─── HELPER: build a full HTML product description ─────────────────────────
function buildDesc(title, intro, bullets, closing) {
  const liItems = bullets.map(b => `<li>${b}</li>`).join("\n");
  return `<h2>${title}</h2>
<p>${intro}</p>
<ul>
${liItems}
</ul>
<p>${closing}</p>`;
}

// ─── PRODUCTS — 65 with LOCAL images + full descriptions ───────────────────
const products = [
  // ── APPAREL / CLOTHING ──
  {
    cat: "apparel-boxes", name: "Custom Clothing Boxes", slug: "custom-clothing-boxes",
    featured: true, sort: 1,
    image: `${U}/clothing-boxes.webp`,
    images: [`${U}/clothing-boxes.webp`,`${U}/clothing-boxes-wholesale.webp`,`${U}/custom-clothing-boxes-with-logo.webp`],
    short: "Premium custom clothing and apparel boxes for fashion brands. Sturdy board with premium UV, foil, and soft-touch finishes.",
    desc: buildDesc(
      "Custom Clothing & Apparel Boxes",
      "Make every unboxing a brand moment with our custom clothing boxes. Designed for fashion brands, boutiques, and e-commerce apparel sellers, our boxes combine premium board stock with stunning full-color print to create packaging your customers will remember — and share.",
      [
        "Fully custom sizes for folded garments, shoes, accessories, or full outfits",
        "Choice of 14pt–24pt SBS, kraft, or recycled board",
        "Finishes: gloss/matte lamination, soft-touch, spot UV, hot foil stamping, embossing",
        "Interior printing and tissue-paper inserts available",
        "100-unit minimum order — ideal for small brands and limited runs",
        "Free structural dieline and 3D digital mockup included",
        "6–8 business day production after artwork approval",
      ],
      "Whether you're a startup boutique or an established fashion label, Prime Packaging delivers clothing boxes that reflect your brand's quality. Request a free quote today and our design team will have a proof ready within 24 hours."
    ),
  },
  {
    cat: "apparel-boxes", name: "Wholesale Clothing Boxes", slug: "wholesale-clothing-boxes",
    featured: false, sort: 2,
    image: `${U}/clothing-boxes-wholesale.webp`,
    images: [`${U}/clothing-boxes-wholesale.webp`,`${U}/custom-clothing-boxes-with-logo-1.webp`],
    short: "Bulk wholesale clothing boxes for e-commerce and retail fashion brands. Low 100-unit MOQ with fast turnaround.",
    desc: buildDesc(
      "Wholesale Clothing Boxes — Bulk Pricing for Fashion Brands",
      "Order custom clothing boxes in bulk and save more per unit without sacrificing quality. Our wholesale program is built for growing fashion brands, retail stores, and apparel distributors who need consistent, high-quality packaging at scale.",
      [
        "Bulk pricing available from 100 units — better rates at 500, 1,000, and 5,000+",
        "Consistent color and structural accuracy across all runs",
        "Same premium materials: 14pt–24pt SBS, kraft, and recycled board",
        "Custom sizes for any garment type — shirts, dresses, shoes, accessories",
        "Rush production options available for seasonal campaigns",
        "Dedicated account manager for wholesale orders",
      ],
      "Talk to our wholesale team to get volume pricing for your clothing boxes. We work with brands of all sizes across the USA, providing the same quality and turnaround whether you order 100 or 100,000 units."
    ),
  },

  // ── BAKERY ──
  {
    cat: "bakery-boxes", name: "Custom Bread & Bakery Boxes", slug: "custom-bread-bakery-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-bread-packaging-bakery-box.webp`,
    images: [`${U}/custom-bread-packaging-bakery-box.webp`,`${U}/printed-kraft-sourdough-bread-retail-box.webp`],
    short: "Artisan bread and bakery boxes with kraft and premium board options. Perfect for sourdough, pastry, and specialty baked goods.",
    desc: buildDesc(
      "Custom Bread & Bakery Boxes",
      "Showcase your artisan baked goods in packaging as crafted as the product inside. Our custom bakery boxes are designed for sourdough loaves, pastries, cookies, cakes, and specialty breads — combining food-safe materials with premium print that tells your brand story on every shelf and delivery.",
      [
        "Food-safe SBS, kraft, and corrugated board options",
        "Custom window cutouts to display your products inside",
        "Available in tuck-top, auto-bottom, and sleeve styles",
        "Full-color CMYK + Pantone printing inside and outside",
        "Soy-based food-safe inks — no harmful off-gassing",
        "Ventilation holes available for breads and warm pastries",
        "Grease-resistant coating available for buttery and oily items",
        "100-unit minimum — perfect for artisan bakeries and small batch brands",
      ],
      "From sourdough subscription boxes to upscale pastry boutiques, Prime Packaging builds bakery boxes that make your products look as good as they taste. Get a free design proof within 24 hours of submitting your quote."
    ),
  },
  {
    cat: "bakery-boxes", name: "Custom Burger Boxes", slug: "custom-burger-boxes",
    featured: true, sort: 2,
    image: `${U}/burger-boxes.webp`,
    images: [`${U}/burger-boxes.webp`,`${U}/burger-boxes-wholesale.webp`,`${U}/custom-burger-boxes-with-logo.webp`],
    short: "Grease-resistant custom burger boxes for restaurants and food trucks. Bold full-color branding on food-safe board.",
    desc: buildDesc(
      "Custom Burger Boxes — Restaurant & Food Truck Packaging",
      "Serve your burgers in custom boxes that double as walking advertisements for your brand. Our burger boxes are printed on food-safe, grease-resistant board and designed to keep your burgers fresh and presentable from kitchen to customer hands.",
      [
        "Grease-resistant kraft or white SBS board — keeps boxes clean and presentable",
        "Custom sizes for sliders, single burgers, double stacks, and gourmet creations",
        "Full-color outside printing — perfect for logos, branding, and promotional messaging",
        "Interior food-safe coating for direct food contact",
        "Ventilated lid options to prevent sogginess",
        "Available in clamshell, two-piece lid, and sleeve styles",
        "Suitable for dine-in, takeout, delivery, and food festival use",
        "100-unit minimum order with 6–8 business day production",
      ],
      "Make your burger brand unforgettable with packaging as bold as your flavors. Prime Packaging provides custom burger boxes for restaurants, ghost kitchens, food trucks, and QSR brands across the USA."
    ),
  },

  // ── BOTTLE BOXES ──
  {
    cat: "bottle-boxes", name: "Custom 100ml Bottle Boxes", slug: "custom-100ml-bottle-boxes",
    featured: true, sort: 1,
    image: `${U}/100ml-bottle-boxes.webp`,
    images: [`${U}/100ml-bottle-boxes.webp`,`${U}/100ml-bottle-boxes-wholesale.webp`,`${U}/custom-100ml-bottle-boxes-with-logo.webp`],
    short: "Precision-fit 100ml bottle boxes for skincare serums, essential oils, and wellness products. Foil, UV, and embossing available.",
    desc: buildDesc(
      "Custom 100ml Bottle Boxes — Skincare & Wellness Packaging",
      "Protect and present your 100ml bottles in custom packaging that conveys the quality inside. Our precision-engineered bottle boxes are built for serums, essential oils, tinctures, CBD drops, and luxury skincare products — with the premium finishes that discerning consumers expect.",
      [
        "Custom-cut to fit 100ml glass or plastic bottles with snug, secure fit",
        "Premium 14pt–18pt SBS board with optional rigid chipboard upgrade",
        "Finishes: soft-touch matte, gloss lamination, hot foil stamping, embossing, spot UV",
        "Inside printing for instructional or branding content",
        "Foam or kraft insert options for bottle protection during shipping",
        "Pantone color-matching for consistent brand identity",
        "Ideal for skincare serums, essential oils, CBD tinctures, perfumes, and supplements",
        "100-unit minimum — perfect for startup wellness and beauty brands",
      ],
      "Your 100ml bottle deserves packaging that reflects its value. Request a free quote and receive a 3D digital proof of your bottle box within 24 hours."
    ),
  },

  // ── CANDLE BOXES ──
  {
    cat: "candle-boxes", name: "Custom Printed Candle Boxes", slug: "custom-printed-candle-boxes",
    featured: true, sort: 1,
    image: `${U}/candle-packaging-boxes.webp`,
    images: [`${U}/candle-packaging-boxes.webp`,`${U}/candle-packaging-box.webp`,`${U}/candle-packaging-boxes-uk.webp`],
    short: "Stunning candle boxes with window and insert. Protect your candles and boost brand recognition with premium finishes.",
    desc: buildDesc(
      "Custom Printed Candle Boxes",
      "Your candles deserve packaging as beautiful as the ambiance they create. Our custom candle boxes are designed to showcase the color, texture, and aesthetic of your candles while protecting them from damage in transit and on the shelf. From luxury soy candles to pillar candles and gift sets, we craft boxes that elevate your brand.",
      [
        "Custom sizes for votives, jar candles, pillar candles, and gift sets",
        "Clear PET window cutout options to showcase candle color and texture",
        "Premium SBS board with options for rigid chipboard for luxury feel",
        "Finishes: gloss/matte lamination, embossing, foil stamping, soft-touch",
        "Kraft, white, and custom-colored board options",
        "Interior insert tray or foam padding for candle protection",
        "Full-color inside printing for ingredient lists and brand story",
        "100-unit minimum order — ideal for indie candle brands",
      ],
      "Whether you're selling at a farmer's market or scaling a luxury candle line, Prime Packaging delivers candle boxes that make your products irresistible on the shelf and unforgettable as gifts. Get your free design proof today."
    ),
  },
  {
    cat: "candle-boxes", name: "Scented Candle Retail Packaging", slug: "scented-candle-retail-packaging",
    featured: false, sort: 2,
    image: `${U}/scented-candle-retail-packaging-box.webp`,
    images: [`${U}/scented-candle-retail-packaging-box.webp`,`${U}/wax-melt-scented-gift-packaging-box.webp`],
    short: "Retail-ready scented candle packaging for luxury fragrance and gift brands. Magnetic closure and ribbon options.",
    desc: buildDesc(
      "Scented Candle Retail Packaging — Luxury Gift & Fragrance Brands",
      "Create a retail experience that matches the luxury of your scented candle line. Our premium retail candle packaging is designed for boutique stores, online gift shops, and fragrance brands that want packaging to trigger an emotional response the moment it's picked up.",
      [
        "Rigid board options with magnetic snap closure for luxury unboxing",
        "Ribbon pull and custom tissue paper insert options",
        "Foil stamping and embossing for premium brand lettering",
        "Custom scent-neutral interior lining to prevent packaging odor interference",
        "Available as single candle boxes, duo sets, and multi-candle gift sets",
        "Retail-ready barcoded panels on request",
        "Suitable for soy, beeswax, coconut wax, and paraffin candles",
      ],
      "For brands that sell candles as a luxury experience, our retail candle packaging completes the story. Request a free sample pack to see the quality in person before you order."
    ),
  },
  {
    cat: "candle-boxes", name: "Custom Wax Melt Boxes", slug: "custom-wax-melt-boxes",
    featured: false, sort: 3,
    image: `${U}/wax-melt-scented-gift-packaging-box.webp`,
    images: [`${U}/wax-melt-scented-gift-packaging-box.webp`,`${U}/printed-wax-melt-retail-packaging-box.webp`],
    short: "Custom wax melt and clamshell packaging with bold color printing and windowed lids to showcase your scents.",
    desc: buildDesc(
      "Custom Wax Melt Packaging Boxes",
      "Wax melts sell on sight — and our custom wax melt boxes are designed to make shoppers stop, pick up, and buy. With vivid full-color printing and windowed lids that showcase your wax melt shapes and colors, our packaging lets the product sell itself.",
      [
        "Custom clamshell and snap-lid box styles for wax melt bars and shapes",
        "Clear PET window options to display wax melt colors and designs",
        "Food-safe board and inks — safe for all wax melt formulas",
        "Bold full-color outside printing for your brand",
        "Custom sizing for 2.5oz, 4oz, 6oz wax melt bars and scalloped shapes",
        "Flat-pack design for easy storage and assembly",
        "100-unit minimum — perfect for Etsy sellers and boutique brands",
      ],
      "Turn your wax melt display into a brand showcase. Prime Packaging builds wax melt boxes that stand out at craft fairs, on Etsy, and in retail stores. Get a free quote and proof today."
    ),
  },

  // ── CBD BOXES ──
  {
    cat: "cbd-boxes", name: "Custom CBD Oil Boxes", slug: "custom-cbd-oil-boxes",
    featured: true, sort: 1,
    image: `${U}/cbd-oil-boxes.webp`,
    images: [`${U}/cbd-oil-boxes.webp`,`${U}/cbd-oil-boxes-wholesale.webp`,`${U}/custom-cbd-oil-boxes-with-logo.webp`],
    short: "Compliant custom CBD oil boxes with full-color printing. Child-resistant options, tamper-evident, and lab-tested safe inks.",
    desc: buildDesc(
      "Custom CBD Oil Boxes — Compliant Cannabis & Wellness Packaging",
      "Your CBD oil deserves packaging that builds trust and moves product off the shelf. Our custom CBD oil boxes are printed with lab-tested, food-safe inks on premium board, giving your brand a professional look while meeting compliance requirements for the cannabis wellness market.",
      [
        "Custom-fit boxes for 10ml, 30ml, 50ml, and 100ml CBD tincture bottles",
        "Child-resistant box styles available for regulatory compliance",
        "Tamper-evident gluing and perforated tear strips",
        "Full-color CMYK and Pantone printing with lab-safe, food-grade inks",
        "Space for dosage information, COA QR codes, and batch numbers",
        "Premium finishes: soft-touch matte, spot UV, foil stamping",
        "Black kraft, white, and custom-color board available",
        "100-unit minimum — low barrier for startup CBD brands",
      ],
      "Build consumer confidence in your CBD brand with premium, compliant packaging. Request a free CBD oil box quote and receive a 3D proof within 24 hours — our team understands the CBD market requirements."
    ),
  },

  // ── CEREAL BOXES ──
  {
    cat: "cereal-boxes", name: "Custom Breakfast Cereal Boxes", slug: "custom-breakfast-cereal-boxes",
    featured: true, sort: 1,
    image: `${U}/breakfast-cereal-boxes.webp`,
    images: [`${U}/breakfast-cereal-boxes.webp`,`${U}/breakfast-cereal-boxes-wholesale.webp`,`${U}/breakfast-cereal-boxes-1.webp`],
    short: "Custom cereal and granola boxes with vibrant full-color printing on food-safe board. Great for health food and breakfast brands.",
    desc: buildDesc(
      "Custom Breakfast Cereal Boxes",
      "Stand out in the breakfast aisle with custom cereal boxes printed in vivid full color. Whether you're launching a new granola brand, a health cereal line, or an artisan muesli blend, our food-safe cereal boxes give your product the shelf presence it deserves.",
      [
        "Food-safe SBS and kraft board with direct food contact coatings",
        "Custom sizes for single-serve, family-size, and bulk cereal boxes",
        "Vivid full-color CMYK printing — vibrant colors that pop on-shelf",
        "Perforated pour spout and inner seal options for freshness",
        "Nutritional panel layout templates available from our design team",
        "FDA-compliant printing inks and materials",
        "Inner bag insert options for cereal freshness",
        "100-unit minimum — ideal for startup and boutique food brands",
      ],
      "From health food startups to established breakfast brands, Prime Packaging builds cereal boxes that win on shelf. Get your free design consultation and quote today."
    ),
  },

  // ── COFFEE PACKAGING ──
  {
    cat: "coffee-packaging", name: "Custom Coffee Bags", slug: "custom-coffee-bags",
    featured: true, sort: 1,
    image: `${U}/coffee-bags.webp`,
    images: [`${U}/coffee-bags.webp`,`${U}/custom-coffee-bags-with-logo.webp`,`${U}/custom-coffee-bags-with-logo-1.webp`],
    short: "Custom printed coffee bags with degassing valve and resealable zipper. Kraft, matte, and foil finish options.",
    desc: buildDesc(
      "Custom Coffee Bags — Specialty Roasters & Cafe Packaging",
      "Your specialty roast deserves packaging that preserves freshness and communicates craftsmanship. Our custom coffee bags are built for specialty roasters, cafes, and subscription coffee brands — with degassing valves, resealable zippers, and premium printing that makes your coffee shelf-ready and gift-worthy.",
      [
        "Available styles: flat bottom, stand-up pouch, side-gusset, and quad-seal bags",
        "One-way degassing valve to release CO2 and preserve fresh roast flavor",
        "Resealable zip-lock closure to maintain coffee freshness after opening",
        "Premium laminated finishes: kraft, matte black, glossy, or metallic foil",
        "Full-color front, back, and side panel printing",
        "Custom sizing from 2oz to 5lb bags",
        "Optional tin-tie closure for retail and wholesale bags",
        "Certified food-safe materials and inks",
        "100-unit minimum — low MOQ for indie roasters",
      ],
      "Prime Packaging works with specialty roasters and coffee brands across the USA to create bags that are as carefully crafted as the coffee inside. Get a free quote and proof for your custom coffee bags today."
    ),
  },
  {
    cat: "coffee-packaging", name: "Custom Matcha & Tea Powder Bags", slug: "custom-matcha-powder-bags",
    featured: false, sort: 2,
    image: `${U}/custom-matcha-powder-packaging-bag.webp`,
    images: [`${U}/custom-matcha-powder-packaging-bag.webp`],
    short: "Stand-up kraft pouches for matcha, ceremonial teas, and adaptogen powders. Windowed and sealed options.",
    desc: buildDesc(
      "Custom Matcha & Tea Powder Packaging Bags",
      "Present your matcha, ceremonial green tea, and adaptogen powders in packaging that communicates premium quality. Our custom stand-up pouches are designed for the wellness and specialty tea market — with the freshness barriers, resealable closures, and refined printing that tea lovers expect.",
      [
        "Stand-up pouch design for stable shelf display",
        "Matte kraft and foil laminate finishes for premium on-shelf look",
        "Clear window option to show off the vibrant green of matcha",
        "Resealable zipper to preserve powder freshness",
        "Custom sizing for 30g, 100g, 200g, and 500g fills",
        "Food-safe interior barrier film — protects against moisture and UV light",
        "Full-color printing on front, back, and gusset",
        "100-unit minimum for small-batch tea and wellness brands",
      ],
      "From ceremonial-grade matcha to adaptogen blends, Prime Packaging builds stand-up pouches that tell your brand's wellness story. Get a free design proof for your tea powder packaging today."
    ),
  },

  // ── DISPLAY BOXES ──
  {
    cat: "display-boxes", name: "Custom Counter Display Boxes", slug: "custom-counter-display-boxes",
    featured: true, sort: 1,
    image: `${U}/counter-display-boxes-wholesale.webp`,
    images: [`${U}/counter-display-boxes-wholesale.webp`,`${U}/custom-counter-display-boxes-with-logo.webp`],
    short: "Eye-catching custom counter display boxes that drive impulse purchases. POP displays in any shape and size.",
    desc: buildDesc(
      "Custom Counter Display Boxes — POP & Retail Impulse Packaging",
      "Turn your retail counter into a revenue generator. Our custom counter display boxes (also called POP displays or CDUs) are designed to hold, organize, and showcase your products at checkout and retail points of sale — maximizing impulse buys and brand visibility.",
      [
        "Custom-designed to hold your exact product dimensions and quantity",
        "Available in single-tier, multi-tier, and header card configurations",
        "Full-color printing with vivid graphics and promotional messaging",
        "Sturdy corrugated or chipboard construction for long display life",
        "Die-cut holes or peg-board hooks for pegboard display options",
        "Easy flat-pack shipping and simple assembly on-site",
        "Works for cosmetics, food, supplements, electronics, and more",
        "100-unit minimum for custom POP displays",
      ],
      "A well-designed counter display can double your impulse sales. Prime Packaging builds custom CDUs that fit your brand and your products perfectly. Request a free display box quote today."
    ),
  },
  {
    cat: "display-boxes", name: "Gemstone & Crystal Display Boxes", slug: "gemstone-crystal-display-boxes",
    featured: false, sort: 2,
    image: `${U}/custom-crystal-gemstone-display-gift-box.webp`,
    images: [`${U}/custom-crystal-gemstone-display-gift-box.webp`,`${U}/printed-gemstone-retail-packaging-box.webp`],
    short: "Custom gemstone and crystal display gift boxes for metaphysical shops and jewelry retailers.",
    desc: buildDesc(
      "Custom Gemstone & Crystal Display Boxes",
      "Display your crystals, gemstones, and mineral specimens in packaging that honors their beauty. Our custom crystal display gift boxes combine clear window lids with premium board construction and refined printing — perfect for metaphysical shops, mineral dealers, and crystal jewelry brands.",
      [
        "Clear PET window lid to showcase gemstone color and natural texture",
        "Custom foam or velvet insert to cradle and protect specimens",
        "Premium matte and foil-stamped printing for upscale retail look",
        "Available in open-top display, magnetic lid, and hinged box styles",
        "Custom sizing for small tumblestones to large specimen displays",
        "Suitable for retail shelves, market stalls, and online gift sales",
        "100-unit minimum with 6–8 business day production",
      ],
      "Let your crystals shine in packaging as beautiful as the stones themselves. Get a free custom display box quote from Prime Packaging today."
    ),
  },

  // ── FOOD BOXES ──
  {
    cat: "food-boxes", name: "Custom Burger & Food Boxes", slug: "custom-burger-food-boxes",
    featured: true, sort: 1,
    image: `${U}/burger-boxes.webp`,
    images: [`${U}/burger-boxes.webp`,`${U}/burger-boxes-wholesale.webp`,`${U}/custom-burger-boxes-with-logo.webp`],
    short: "FDA-compliant burger and food boxes for restaurants, ghost kitchens, and food trucks. Grease-resistant, any size.",
    desc: buildDesc(
      "Custom Food Boxes — Restaurants, Ghost Kitchens & Food Brands",
      "Your food brand is defined by every touchpoint — including the box it comes in. Our custom food boxes are manufactured on FDA-compliant, food-safe board with grease-resistant coatings, making them ideal for restaurants, ghost kitchens, food trucks, and specialty food brands.",
      [
        "FDA-compliant food-safe board with direct food contact coatings",
        "Grease-resistant coating to keep boxes looking fresh for delivery",
        "Custom sizes for burgers, sandwiches, hot dogs, fries, and specialty foods",
        "Full-color outside branding — turn every delivery into a brand impression",
        "Ventilation hole options for fried and steamed items",
        "Clamshell, tuck-top, and sleeve styles available",
        "Suitable for dine-in, takeout, delivery, and ghost kitchen operations",
        "100-unit minimum — affordable entry point for new food brands",
      ],
      "Make your food packaging as memorable as your menu. Prime Packaging builds custom food boxes for some of the fastest-growing restaurant and food delivery brands in the USA. Get a free quote today."
    ),
  },
  {
    cat: "food-boxes", name: "Custom Hot Sauce Boxes", slug: "custom-hot-sauce-boxes",
    featured: false, sort: 2,
    image: `${U}/custom-hot-sauce-bottle-packaging-box.webp`,
    images: [`${U}/custom-hot-sauce-bottle-packaging-box.webp`,`${U}/custom-hot-sauce-brand-packaging-box.webp`,`${U}/artisan-hot-sauce-gift-packaging-box.webp`],
    short: "Custom hot sauce and condiment packaging boxes for artisan food brands. Bold branding, precision bottle fit.",
    desc: buildDesc(
      "Custom Hot Sauce Boxes — Artisan & Craft Condiment Packaging",
      "Hot sauce is a lifestyle — and your packaging should show it. Our custom hot sauce boxes are designed to hold your bottles securely while delivering bold, fiery brand impressions at farmers markets, specialty food stores, and online. We build boxes that are as bold as your sauces.",
      [
        "Precision-fit inserts for 5oz, 8oz, and 12oz hot sauce bottles",
        "Kraft, white, and custom color board options",
        "Full-color CMYK printing — bold graphics that capture your hot sauce personality",
        "Available as single-bottle, 3-pack, and gift set configurations",
        "Window cutout option to display bottle label through box",
        "Food-safe, FDA-compliant materials",
        "Artisan and craft aesthetic design support from our team",
        "100-unit minimum — perfect for small-batch hot sauce brands",
      ],
      "Your hot sauce brand deserves packaging that's as spicy as the product inside. Get a free custom hot sauce box quote from Prime Packaging today."
    ),
  },
  {
    cat: "food-boxes", name: "Custom Kombucha Packaging", slug: "custom-kombucha-packaging",
    featured: false, sort: 3,
    image: `${U}/custom-kombucha-beverage-packaging-box.webp`,
    images: [`${U}/custom-kombucha-beverage-packaging-box.webp`,`${U}/custom-kombucha-brewing-kit-retail-box.webp`],
    short: "Custom kombucha beverage and brewing kit packaging for wellness and fermented food brands.",
    desc: buildDesc(
      "Custom Kombucha Packaging — Fermented Beverage & Brewing Kits",
      "Kombucha is booming — and your packaging needs to keep pace. Whether you're bottling a signature brew for retail or selling home-brewing kits, our custom kombucha packaging communicates the natural, health-forward ethos of your brand with bold, earthy printing on premium board.",
      [
        "Custom-fit single-bottle and multi-bottle kombucha carrier boxes",
        "Kraft and natural brown board for an authentic fermented brand aesthetic",
        "Full-color printing for brew names, SCOBY facts, and flavor profiles",
        "Custom brewing kit box configurations with foam insert options",
        "Food-safe materials and inks compliant with FDA beverage packaging standards",
        "Available in retail shelf, e-commerce mailer, and gift set styles",
        "100-unit minimum — accessible for small-batch kombucha brands",
      ],
      "From craft tap rooms to nationwide health food stores, Prime Packaging builds kombucha packaging that connects with wellness-focused consumers. Request a free quote today."
    ),
  },
  {
    cat: "food-boxes", name: "Custom Fermented Food Packaging", slug: "custom-fermented-food-packaging",
    featured: false, sort: 4,
    image: `${U}/custom-fermented-food-retail-packaging-box.webp`,
    images: [`${U}/custom-fermented-food-retail-packaging-box.webp`,`${U}/printed-fermented-food-kraft-box.webp`],
    short: "Eco kraft boxes for fermented foods — kimchi, kefir, pickles, and probiotic products. Food-safe, premium printing.",
    desc: buildDesc(
      "Custom Fermented Food Packaging — Kimchi, Pickles & Probiotic Brands",
      "The fermented food market is one of the fastest-growing in the US specialty food industry — and your packaging should reflect that premium, health-forward positioning. Our custom fermented food boxes use natural kraft and eco-friendly materials with clean, modern printing for kimchi, kefir, pickles, sauerkraut, and probiotic product brands.",
      [
        "Food-safe eco-kraft board — aligns with the natural ethos of fermented food brands",
        "Custom sizing for jars, pouches, and multi-unit gift packs",
        "Earthy, minimalist design printing to communicate authenticity",
        "Full-color or 1–2 color print options for lower-cost artisan runs",
        "Moisture-resistant coatings for refrigerated product packaging",
        "Window options for displaying jar labels or product color",
        "100-unit minimum — accessible for small-batch ferment producers",
      ],
      "Build a premium fermented food brand that stands out in health food stores and online marketplaces. Get a free custom packaging quote from Prime Packaging today."
    ),
  },
  {
    cat: "food-boxes", name: "Freeze Dried Candy Packaging", slug: "freeze-dried-candy-packaging",
    featured: false, sort: 5,
    image: `${U}/colorful-freeze-dried-candy-retail-box.webp`,
    images: [`${U}/colorful-freeze-dried-candy-retail-box.webp`,`${U}/bulk-freeze-dried-candy-resealable-bag.webp`,`${U}/custom-freeze-dried-sweets-packaging-bag.webp`],
    short: "Vibrant freeze-dried candy boxes and resealable bags. Bold graphics that pop off the shelf for candy brands.",
    desc: buildDesc(
      "Custom Freeze Dried Candy Packaging Boxes & Bags",
      "Freeze dried candy is one of the hottest trends in the confectionery market — and bold, colorful packaging is a big part of why brands go viral. Our custom freeze dried candy boxes and resealable bags are printed with neon-bright, attention-grabbing graphics that stop shoppers in their tracks and beg to be photographed for social media.",
      [
        "Ultra-vibrant full-color printing — neons, gradients, and bold typography",
        "Available as retail display boxes, mylar resealable pouches, and window bags",
        "Custom sizing for 2oz, 4oz, 8oz, and 1lb candy fills",
        "Resealable zipper for freshness and repeat opens",
        "Moisture barrier interior lining to keep freeze-dried candy crunchy",
        "Window options to showcase candy colors and textures",
        "Influencer-ready unboxing design available from our creative team",
        "100-unit minimum — low barrier for viral candy startups",
      ],
      "Your freeze dried candy brand deserves packaging that's as addictive as the product. Prime Packaging builds candy boxes and bags that go viral. Get a free design proof today."
    ),
  },
  {
    cat: "food-boxes", name: "Custom Charcuterie Gift Boxes", slug: "custom-charcuterie-gift-boxes",
    featured: false, sort: 6,
    image: `${U}/custom-charcuterie-board-gift-box.webp`,
    images: [`${U}/custom-charcuterie-board-gift-box.webp`,`${U}/custom-brownie-charcuterie-gift-packaging.webp`],
    short: "Luxurious custom charcuterie board and brownie gift boxes for food gifting brands and corporate events.",
    desc: buildDesc(
      "Custom Charcuterie & Gourmet Gift Boxes",
      "The charcuterie and gourmet gift market has exploded — and your packaging needs to match the premium price point. Our custom charcuterie gift boxes are built for elevated food gifting brands, corporate event caterers, and specialty food businesses that want packaging as curated as the contents inside.",
      [
        "Custom large-format boxes for charcuterie boards, brownie boxes, and gourmet gift sets",
        "Premium rigid board with magnetic closure or ribbon-tie options",
        "Foil stamping, embossing, and soft-touch lamination for luxury look and feel",
        "Custom foam or kraft paper nesting to hold items securely",
        "Food-safe interior lining options",
        "Corporate gifting MOQ options with personalization per box",
        "Seasonal and holiday variations available with quick turnaround",
        "Available in eco-kraft for sustainability-forward brands",
      ],
      "Deliver a gift experience that starts the moment the box is seen. Prime Packaging creates custom charcuterie and gourmet gift boxes for food brands, corporate gifters, and catering businesses. Get a free quote today."
    ),
  },

  // ── MAILER BOXES ──
  {
    cat: "mailer-boxes", name: "Custom Corrugated Mailer Boxes", slug: "custom-corrugated-mailer-boxes",
    featured: true, sort: 1,
    image: `${U}/corrugated-mailer-boxes.webp`,
    images: [`${U}/corrugated-mailer-boxes.webp`,`${U}/corrugated-mailer-boxes-wholesale.webp`,`${U}/custom-corrugated-mailer-boxes-with-logo.webp`],
    short: "Durable custom mailer boxes with full inside/outside printing. Built for e-commerce and subscription box brands.",
    desc: buildDesc(
      "Custom Corrugated Mailer Boxes — E-Commerce & Subscription Packaging",
      "Your mailer box is the first physical touchpoint your customer has with your brand — make it count. Our custom corrugated mailer boxes are engineered for e-commerce and subscription box brands that want the unboxing moment to feel as premium as the product inside. With full inside and outside printing, rigid corrugated walls, and a clean self-locking closure, our mailer boxes deliver an experience customers share.",
      [
        "Durable single-wall (B or E flute) corrugated construction",
        "Full-color printing inside and outside — turns the unboxing into a brand experience",
        "Self-locking tuck closure — no tape needed for clean opening",
        "Custom sizes to fit your products with minimal void-fill",
        "Optional custom tissue paper, thank-you card, and sticker inserts",
        "Available in kraft brown and white corrugated board",
        "Eco-friendly 100% recycled corrugated options available",
        "100-unit minimum — accessible for startup subscription brands",
        "6–8 business day turnaround after artwork approval",
      ],
      "Custom mailer boxes from Prime Packaging have helped hundreds of e-commerce brands elevate their unboxing and turn customers into brand advocates. Request a free quote and 3D mockup today."
    ),
  },
  {
    cat: "mailer-boxes", name: "Resin Art Mailer Boxes", slug: "resin-art-mailer-boxes",
    featured: false, sort: 2,
    image: `${U}/printed-resin-craft-mailer-box.webp`,
    images: [`${U}/printed-resin-craft-mailer-box.webp`,`${U}/resin-art-product-retail-packaging-box.webp`],
    short: "Custom mailer boxes for resin art, craft, and handmade product brands. Premium printing for artisan sellers.",
    desc: buildDesc(
      "Custom Mailer Boxes for Resin Art & Handmade Products",
      "Your handmade resin art deserves packaging that reflects the care and craft you put into every piece. Our custom mailer boxes for resin art and handmade products are designed to protect fragile items in transit while presenting a beautiful, branded unboxing experience for your customers.",
      [
        "Corrugated construction with optional foam insert for delicate resin pieces",
        "Full-color inside and outside printing to tell your brand story",
        "Custom sizing to minimize movement and protect resin art in shipping",
        "Artistic and custom-illustration printing supported by our design team",
        "Options for tissue paper, branded ribbon, and thank-you card inserts",
        "Etsy and DTC-friendly sizing and branding",
        "100-unit minimum — accessible for solo artisans and small studios",
      ],
      "Let your packaging be as artful as your work. Prime Packaging builds custom mailer boxes for resin artists, craft sellers, and handmade product brands. Get a free quote today."
    ),
  },

  // ── MEDICINE BOXES ──
  {
    cat: "medicine-boxes", name: "Custom Medicine Boxes", slug: "custom-medicine-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-medicine-boxes.webp`,
    images: [`${U}/custom-medicine-boxes.webp`,`${U}/custom-medicine-boxes-wholesale.webp`,`${U}/custom-medicine-boxes-with-logo.webp`],
    short: "Compliant custom medicine and pharmaceutical boxes with full-color printing. Insert-ready, tamper-evident options.",
    desc: buildDesc(
      "Custom Medicine & Pharmaceutical Boxes",
      "Pharmaceutical and healthcare packaging demands precision, compliance, and trust. Our custom medicine boxes are manufactured on FDA-compliant board with safe, non-toxic inks — providing the accuracy, durability, and professional appearance that the healthcare market requires.",
      [
        "FDA-compliant board and food-safe ink printing",
        "Custom sizing for capsules, tablets, vials, syringes, and medical devices",
        "Tamper-evident gluing and perforated tear strips for product safety",
        "Child-resistant box designs available for controlled substances",
        "Inside-panel space for dosage instructions, warnings, and batch information",
        "Serialization and batch code printing support",
        "Rigid chipboard options for high-value pharmaceutical products",
        "100-unit minimum for startup supplement and health brands",
      ],
      "Build consumer trust from the shelf with professional pharmaceutical packaging. Prime Packaging delivers custom medicine boxes that meet your compliance requirements and represent your brand with precision. Request a free quote today."
    ),
  },
  {
    cat: "medicine-boxes", name: "Custom Medical Syringe Boxes", slug: "custom-medical-syringe-boxes",
    featured: false, sort: 2,
    image: `${U}/custom-medical-syringe-packaging-box.webp`,
    images: [`${U}/custom-medical-syringe-packaging-box.webp`,`${U}/printed-syringe-retail-box-packaging.webp`,`${U}/syringe-set-corrugated-shipping-box.webp`],
    short: "Precision-fit medical syringe packaging boxes for pharmaceutical and wellness brands.",
    desc: buildDesc(
      "Custom Medical Syringe Packaging Boxes",
      "Protect delicate medical syringes and injectable products with custom packaging engineered to precision. Our syringe packaging boxes are built for pharmaceutical brands, compounding pharmacies, and medical device companies that require exact-fit packaging with clear product identification.",
      [
        "Precision-engineered custom die-cut inserts for syringe protection",
        "Available in 1ml, 3ml, 5ml, 10ml, and 20ml syringe sizes",
        "FDA-compliant materials and printing inks",
        "Tamper-evident and child-resistant closure options",
        "Full-color printing for product ID, dosage, and batch information",
        "Corrugated outer shipping box options for multi-pack wholesale",
        "Clean room-compatible packaging options available on request",
        "100-unit minimum for medical device startups and specialty pharmacies",
      ],
      "Precision packaging for precision medicine. Request a custom medical syringe box quote from Prime Packaging today — our packaging engineers specialize in exact-fit medical packaging."
    ),
  },

  // ── RETAIL BOXES ──
  {
    cat: "retail-boxes", name: "Custom Drone Retail Packaging", slug: "custom-drone-retail-packaging",
    featured: true, sort: 1,
    image: `${U}/custom-drone-retail-packaging-box.webp`,
    images: [`${U}/custom-drone-retail-packaging-box.webp`,`${U}/custom-mobile-phone-packaging-with-logo.webp`],
    short: "Premium retail packaging for electronics, drones, and tech products. Structured inserts and bold branding.",
    desc: buildDesc(
      "Custom Drone & Electronics Retail Packaging",
      "Consumer electronics packaging is a powerful brand signal — and for drones, cameras, and tech gadgets, the box is part of the product experience. Our custom drone and electronics retail packaging combines rigid protection, structured foam inserts, and premium printing to deliver an Apple-grade unboxing experience for your tech customers.",
      [
        "Rigid board and corrugated construction for maximum product protection",
        "Custom-cut foam or cardboard inserts to hold drones, remotes, and accessories",
        "Premium full-color printing with metallic foil and spot UV options",
        "Magnetic lid or sleeve-and-tray configurations for premium unboxing",
        "QR code and serial number printing panels",
        "Multi-language packaging support for international markets",
        "Custom inserts for accessories, cables, manuals, and documentation",
        "100-unit minimum — ideal for electronics startups and kickstarter products",
      ],
      "Make the unboxing of your drone or tech product as impressive as the device itself. Prime Packaging builds premium electronics retail packaging that drives five-star reviews and repeat purchases. Get a free quote today."
    ),
  },
  {
    cat: "retail-boxes", name: "Custom Carton Packaging Boxes", slug: "custom-carton-packaging-boxes",
    featured: false, sort: 2,
    image: `${U}/carton-packaging-boxes.webp`,
    images: [`${U}/carton-packaging-boxes.webp`],
    short: "Versatile custom carton packaging for retail consumer goods. Any size, full-color print, low MOQ.",
    desc: buildDesc(
      "Custom Carton Packaging Boxes — Retail Consumer Goods",
      "Custom carton boxes are the backbone of retail packaging — versatile, cost-effective, and capable of stunning full-color print. Whether you're packaging household goods, toys, tools, or specialty products, our custom carton boxes give your retail product the professional shelf presence it needs to compete.",
      [
        "Versatile tuck-top, reverse tuck, and auto-bottom carton styles",
        "Premium 14pt–18pt SBS board for crisp full-color printing",
        "Custom sizing for any retail product — from small accessories to large appliances",
        "Full-color CMYK and Pantone printing for exact brand color matching",
        "Finishes: gloss/matte lamination, spot UV, embossing, foil stamping",
        "Retail-ready barcoded panels and product photography guidelines available",
        "100-unit minimum — accessible for small brands entering retail",
      ],
      "From big-box retail to independent boutiques, Prime Packaging builds custom carton packaging that earns shelf space. Request a free quote for your custom retail carton boxes today."
    ),
  },

  // ── SHIPPING BOXES ──
  {
    cat: "shipping-boxes", name: "Custom Corrugated Shipping Boxes", slug: "custom-corrugated-shipping-boxes",
    featured: true, sort: 1,
    image: `${U}/shipping-box-packaging.webp`,
    images: [`${U}/shipping-box-packaging.webp`,`${U}/custom-drone-shipping-corrugated-box.webp`,`${U}/bone-broth-corrugated-shipping-box.webp`],
    short: "Sturdy custom corrugated shipping boxes for e-commerce and B2B fulfillment. Single and double-wall options.",
    desc: buildDesc(
      "Custom Corrugated Shipping Boxes — E-Commerce & Wholesale Fulfillment",
      "Every box you ship is a brand impression in transit. Our custom corrugated shipping boxes are engineered for the rigors of e-commerce fulfillment, FBA prep, and B2B wholesale shipping — combining structural strength with full-color branding that makes your packages recognizable at every doorstep.",
      [
        "Single-wall (B-flute, C-flute) and double-wall corrugated options for heavy items",
        "Custom sizing to minimize dimensional weight costs and excess void-fill",
        "Full-color outside printing — turn every shipment into a brand ad",
        "RSC (regular slotted carton), FEFCO 0201, and custom die-cut styles",
        "Amazon FBA-compliant sizing and labeling panel options",
        "Eco-friendly 100% recycled corrugated available",
        "Bulk pricing for high-volume e-commerce and wholesale operations",
        "100-unit minimum with 6–8 business day turnaround",
      ],
      "Shipping boxes are the most-seen packaging touchpoint in e-commerce — make yours count. Prime Packaging builds custom corrugated shipping boxes for brands across every category. Request a free quote and see your design in 3D within 24 hours."
    ),
  },

  // ── SOAP BOXES ──
  {
    cat: "soap-boxes", name: "Custom Kraft Soap Boxes", slug: "custom-kraft-soap-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-kraft-soap-boxes.webp`,
    images: [`${U}/custom-kraft-soap-boxes.webp`,`${U}/custom-kraft-soap-boxes-wholesale.webp`,`${U}/custom-kraft-soap-boxes-with-logo.webp`,`${U}/custom-kraft-soap-boxes-1.webp`],
    short: "Premium custom kraft soap boxes for handmade and artisan soap brands. Natural brown and white options.",
    desc: buildDesc(
      "Custom Kraft Soap Boxes — Handmade & Artisan Bath Brands",
      "Soap is a sensory product — and your packaging should engage sight before the scent even reaches the customer. Our custom kraft soap boxes are designed for handmade soap makers, artisan bath brands, and natural body care lines who want sustainable, beautiful packaging that showcases their craftsmanship.",
      [
        "Natural brown kraft and white SBS board options",
        "Sleeve, tuck-top, and belly-band soap packaging styles",
        "Custom window cutout to display bar color, texture, and botanicals",
        "Full-color or 1–2 spot color printing — vibrant or minimalist",
        "Embossing, foil stamping, and soft-touch lamination for luxury soap lines",
        "Recyclable and FSC-certified board for eco-conscious brands",
        "Custom sizing for guest bars, standard bars, and artisan large-format bars",
        "100-unit minimum — perfect for Etsy sellers and boutique soap brands",
      ],
      "From farmer's market standouts to upscale apothecary brands, Prime Packaging builds kraft soap boxes that reflect the care you put into every bar. Get a free soap packaging quote and design proof today."
    ),
  },
  {
    cat: "soap-boxes", name: "Custom Incense & Smudge Stick Boxes", slug: "custom-incense-smudge-stick-boxes",
    featured: false, sort: 2,
    image: `${U}/custom-incense-smudge-stick-packaging-box.webp`,
    images: [`${U}/custom-incense-smudge-stick-packaging-box.webp`,`${U}/printed-sage-smudge-stick-retail-box.webp`],
    short: "Custom incense and sage smudge stick packaging for wellness and spiritual product brands.",
    desc: buildDesc(
      "Custom Incense & Smudge Stick Packaging Boxes",
      "Ritual and wellness products deserve packaging that tells a sacred story. Our custom incense and smudge stick boxes are designed for spiritual wellness brands, herbal apothecaries, and metaphysical shops — with earthy kraft materials and refined printing that resonates with mindfulness-focused consumers.",
      [
        "Custom-fit boxes for incense sticks, cones, sage bundles, and palo santo",
        "Natural kraft and matte board for earthy, organic aesthetic",
        "Window options to display sage or herbal bundle through packaging",
        "Full-color or 1–2 spot color printing with botanical illustration support",
        "Available in slide-drawer, tuck-top, and eco-sleeve styles",
        "Recyclable and compostable material options",
        "100-unit minimum — accessible for boutique wellness brands",
      ],
      "Let your packaging honor the ritual. Prime Packaging creates custom incense and smudge stick packaging that connects with spiritual and wellness consumers. Get a free quote today."
    ),
  },

  // ── GABLE BOXES ──
  {
    cat: "gable-boxes", name: "Custom Kraft Gable Boxes", slug: "custom-kraft-gable-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-kraft-gable-boxes.webp`,
    images: [`${U}/custom-kraft-gable-boxes.webp`,`${U}/custom-kraft-gable-boxes-1.webp`,`${U}/custom-kraft-gable-boxes-wholesale.webp`,`${U}/custom-kraft-gable-boxes-wholesale-1.webp`],
    short: "Custom kraft gable boxes for gifts, bakery, and retail. Carry-friendly with full-color printing and die-cut handles.",
    desc: buildDesc(
      "Custom Kraft Gable Boxes — Gifts, Bakery & Retail Packaging",
      "Gable boxes are one of the most versatile and charming packaging formats — carry-friendly, stackable, and instantly recognizable. Our custom kraft gable boxes combine natural brown board with vibrant full-color printing to create gift and bakery packaging that customers love to carry, display, and give.",
      [
        "Die-cut integrated handle for easy carry — no separate ribbon needed",
        "Natural kraft and white board options with full-color printing",
        "Custom sizing for individual bakery items, gift sets, and favor bags",
        "Window cutout option to display baked goods or gifts inside",
        "Perfect for wedding favors, party gifts, bakery take-home, and retail products",
        "Flat-pack design for easy storage and fast assembly",
        "Eco-friendly recyclable kraft board",
        "100-unit minimum — ideal for events and boutique brands",
      ],
      "From wedding favors to holiday bakery boxes, Prime Packaging builds custom gable boxes that are as functional as they are beautiful. Get a free quote and design proof for your kraft gable boxes today."
    ),
  },

  // ── PRODUCT BOXES ──
  {
    cat: "product-boxes", name: "Custom Packaging Sleeves", slug: "custom-packaging-sleeves",
    featured: true, sort: 1,
    image: `${U}/custom-packaging-sleeves-with-logo.webp`,
    images: [`${U}/custom-packaging-sleeves-with-logo.webp`,`${U}/printed-packaging-sleeves-bulk.webp`],
    short: "Custom wrap-around packaging sleeves for retail products. Cost-effective branding over plain boxes.",
    desc: buildDesc(
      "Custom Packaging Sleeves — Tray & Sleeve Retail Packaging",
      "Packaging sleeves are one of the most cost-effective ways to brand your product without redesigning your entire box. Our custom wrap-around sleeves slide over plain trays, boxes, or containers to deliver premium printed branding at a fraction of the cost of fully custom packaging.",
      [
        "Custom-cut to fit your existing tray, box, or container dimensions",
        "Full-color printing on premium 14pt–18pt SBS board",
        "Matte, gloss, and soft-touch finish options",
        "Great for multi-SKU brands where only the sleeve changes",
        "Suitable for food, cosmetics, electronics, and gift products",
        "Cost-effective branding upgrade for businesses already using plain boxes",
        "Fast turnaround — 4–6 business days for sleeves vs. full box production",
        "100-unit minimum for custom sleeve orders",
      ],
      "Custom packaging sleeves deliver premium brand impact at a budget-friendly price point. Prime Packaging builds sleeves for brands across every category. Get a free quote and sample today."
    ),
  },
  {
    cat: "product-boxes", name: "Custom Paper Tubes", slug: "custom-paper-tubes",
    featured: false, sort: 2,
    image: `${U}/custom-paper-tubes-wholesale.webp`,
    images: [`${U}/custom-paper-tubes-wholesale.webp`,`${U}/printed-paper-tubes-bulk.webp`,`${U}/printed-paper-tubes-bulk-1.webp`],
    short: "Custom premium paper tube packaging for cosmetics, supplements, and luxury products.",
    desc: buildDesc(
      "Custom Paper Tubes — Cylindrical Luxury Packaging",
      "Paper tube packaging is having a major moment in premium product categories — from cosmetics and skincare to gourmet tea and artisan candles. Our custom paper tubes combine structural elegance with high-quality full-color printing to create packaging that's as memorable as the product inside.",
      [
        "Premium spiral-wound and convolute paper tube construction",
        "Custom diameter and height for any product fit",
        "Full-color lithographic or flexo printing with premium finishes",
        "Lid and base options: push-fit, friction-fit, and metal-rim caps",
        "Interior barrier lining for cosmetics, food, and fragrance products",
        "Embossing, foil stamping, and soft-touch coating options",
        "Eco-friendly kraft and recycled paper tube options",
        "100-unit minimum — accessible for luxury boutique brands",
      ],
      "Premium paper tube packaging signals quality the moment it's picked up. Prime Packaging builds custom paper tubes for cosmetic, food, and luxury product brands. Get a free quote and physical sample today."
    ),
  },

  // ── CHRISTMAS / HOLIDAY BOXES ──
  {
    cat: "christmas-boxes", name: "Custom Christmas Gift Boxes", slug: "custom-christmas-gift-boxes",
    featured: true, sort: 1,
    image: `${U}/christmas-gift-boxes-wholesale.webp`,
    images: [`${U}/christmas-gift-boxes-wholesale.webp`,`${U}/custom-christmas-gift-boxes-with-logo.webp`,`${U}/custom-christmas-gift-boxes-with-logo-1.webp`],
    short: "Custom Christmas and holiday gift boxes with festive printing, ribbon, and insert options. Low 100-unit MOQ.",
    desc: buildDesc(
      "Custom Christmas Gift Boxes — Holiday Packaging That Delights",
      "The holiday season is the biggest gift-giving moment of the year — and custom Christmas gift boxes make every present feel extraordinary. Our festive custom holiday boxes feature vibrant seasonal printing, luxury ribbon options, and tissue paper inserts that create an unforgettable unwrapping experience for every recipient.",
      [
        "Festive full-color printing: classic red and green, winter white, gold, and custom holiday palettes",
        "Rigid box and folding carton options for different product sizes and price points",
        "Ribbon pull, magnetic closure, and ribbon-tie options",
        "Custom tissue paper, kraft crinkle fill, and gift card insert pockets",
        "Available in single-item and multi-item gift set configurations",
        "Corporate gift customization with personalized messaging panels",
        "Rush production available for last-minute holiday orders",
        "100-unit minimum — perfect for boutique holiday campaigns",
      ],
      "Make gifting magical with custom Christmas boxes that are as beautiful on the outside as the gift inside. Prime Packaging ships holiday gift boxes across the USA. Order early — holiday rush fills up fast!"
    ),
  },
  {
    cat: "christmas-boxes", name: "Custom Diwali Gift Boxes", slug: "custom-diwali-gift-boxes",
    featured: false, sort: 2,
    image: `${U}/custom-diwali-festive-gift-packaging-box.webp`,
    images: [`${U}/custom-diwali-festive-gift-packaging-box.webp`,`${U}/traditional-diwali-sweet-gift-box.webp`],
    short: "Elegant Diwali festive gift packaging boxes for traditional sweets, mithai, and celebration gifts.",
    desc: buildDesc(
      "Custom Diwali Gift Boxes — Festive Indian Holiday Packaging",
      "Diwali is the festival of lights and the gift-giving occasion of the year for millions of families. Our custom Diwali gift boxes bring the richness and vibrancy of the festival to your packaging — with gold foil, deep jewel tones, and traditional motifs that honor the celebration and delight recipients.",
      [
        "Rich jewel tone printing: deep red, gold, saffron orange, emerald green, royal purple",
        "Gold and silver foil stamping for traditional Diwali luxury aesthetic",
        "Custom compartment inserts for mithai, dry fruits, candles, and gifting sets",
        "Rigid and folding carton options for different product weights",
        "Available as thali-style trays, stacked boxes, and gift hamper configurations",
        "Traditional motif design templates from our design team",
        "100-unit minimum — accessible for South Asian food brands and gift shops",
      ],
      "Create Diwali gifts your customers will be proud to give. Prime Packaging builds custom Diwali gift boxes with the richness and elegance the festival deserves. Get a free quote today."
    ),
  },
  {
    cat: "christmas-boxes", name: "Custom Eid Gift Boxes", slug: "custom-eid-gift-boxes",
    featured: false, sort: 3,
    image: `${U}/custom-eid-celebration-gift-packaging.webp`,
    images: [`${U}/custom-eid-celebration-gift-packaging.webp`,`${U}/custom-eid-luxury-gift-packaging-box.webp`],
    short: "Luxurious custom Eid celebration gift boxes for sweets, dates, and celebration gifts.",
    desc: buildDesc(
      "Custom Eid Gift Boxes — Celebration Packaging for Eid al-Fitr & Eid al-Adha",
      "Eid is a time of gratitude, sharing, and beautiful gifting. Our custom Eid gift boxes are designed for Muslim families, food brands, and gift shops that want to present dates, sweets, chocolates, and celebration gifts in packaging that reflects the spiritual joy of Eid.",
      [
        "Elegant crescent and star motif designs in rich greens, golds, and deep blues",
        "Gold and silver foil stamping for premium Eid gift presentation",
        "Custom compartment inserts for Medjool dates, chocolates, and sweet trays",
        "Rigid box and magnetic closure options for luxury gifting",
        "Personalized panel space for Eid Mubarak messages and brand greetings",
        "Available as single-item, duo, and full hamper gift box configurations",
        "Halal-certified printing inks available on request",
        "100-unit minimum — accessible for specialty food and gift shops",
      ],
      "Celebrate Eid with gifting that's as beautiful as the occasion. Prime Packaging builds custom Eid gift boxes for bakeries, confectionery brands, and gift shops across the USA. Request a free quote today."
    ),
  },

  // ── CUSTOM PAPER BAGS ──
  {
    cat: "custom-paper-bags", name: "Custom Paper Shopping Bags", slug: "custom-paper-shopping-bags",
    featured: true, sort: 1,
    image: `${U}/brown-paper-bags.webp`,
    images: [`${U}/brown-paper-bags.webp`,`${U}/custom-paper-shopping-bags-with-logo.webp`],
    short: "Custom printed paper shopping bags for retail boutiques, events, and brand gifting. Kraft and coated options.",
    desc: buildDesc(
      "Custom Paper Shopping Bags — Branded Retail Carry Bags",
      "A custom shopping bag is a walking billboard for your brand. Our custom printed paper bags are designed for retail boutiques, fashion stores, gift shops, and events — combining premium paper stock with beautiful full-color printing and sturdy handles that make carrying a pleasure.",
      [
        "Natural kraft brown, white gloss, and custom color paper stock options",
        "Twisted paper, ribbon, and flat cotton cord handle options",
        "Custom sizes from small gift bags to large shopping bags",
        "Full-color outside printing with inside printing available",
        "Matte and gloss lamination for paper strength and premium look",
        "Soft-touch and foil stamping options for luxury boutique bags",
        "Flat-bottom and euro-style bottom options",
        "100-unit minimum — accessible for boutique retail and events",
      ],
      "Custom paper bags are the last thing your customer holds after every purchase — make them brand-worthy. Prime Packaging builds custom shopping bags that customers keep and reuse. Get a free quote today."
    ),
  },

  // ── JEWELRY BOXES ──
  {
    cat: "jewelry-boxes", name: "Custom Ring Boxes", slug: "custom-ring-boxes",
    featured: true, sort: 1,
    image: `${U}/ring-boxes.webp`,
    images: [`${U}/ring-boxes.webp`,`${U}/ring-boxes-wholesale.webp`,`${U}/ring-boxes-1.webp`,`${U}/printed-ring-boxes-bulk.webp`],
    short: "Premium custom ring and jewelry boxes for jewelers and retail brands. Velvet inserts and luxury finishes.",
    desc: buildDesc(
      "Custom Ring Boxes — Jewelry Packaging for Jewelers & Brands",
      "The right ring box makes every proposal or gift moment unforgettable. Our custom ring boxes combine premium outer box printing with velvet, satin, or foam inserts that hold rings, earrings, and small jewelry items with elegance and care — designed for independent jewelers, fine jewelry brands, and fashion accessory retailers.",
      [
        "Rigid outer box with premium laminated full-color printing",
        "Velvet, satin, and foam inner insert options for secure ring display",
        "Available in classic clam-shell, two-piece lid and base, and magnetic closure styles",
        "Custom sizes for rings, stud earrings, pendants, and bracelets",
        "Embossing, foil stamping, and soft-touch outer finish options",
        "Brand name debossing on lid for premium jeweler presentation",
        "100-unit minimum — accessible for independent jewelers and boutique brands",
        "Wholesale pricing for jewelry retailers at 500+ units",
      ],
      "Every piece of jewelry deserves a box as special as the moment it marks. Prime Packaging builds custom ring and jewelry boxes for jewelers and luxury brands. Get a free quote and sample today."
    ),
  },

  // ── PIZZA BOXES ──
  {
    cat: "pizza-boxes", name: "Custom Kraft Pizza Boxes", slug: "custom-kraft-pizza-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-kraft-pizza-boxes-with-logo.webp`,
    images: [`${U}/custom-kraft-pizza-boxes-with-logo.webp`,`${U}/printed-kraft-pizza-boxes-bulk.webp`],
    short: "Custom kraft pizza boxes for pizzerias and food delivery. Grease-resistant, ventilated, any size. Bold branding.",
    desc: buildDesc(
      "Custom Kraft Pizza Boxes — Pizzeria & Food Delivery Packaging",
      "Your pizza deserves a box that keeps it hot, crispy, and branded. Our custom kraft pizza boxes are built for pizzerias, delivery operations, and food trucks — combining grease-resistant corrugated construction with bold, full-color branding that makes your logo the last thing customers see before the first slice.",
      [
        "Grease-resistant E-flute or B-flute corrugated kraft construction",
        "Custom sizes from 6-inch personal pizza to 18-inch party size",
        "Ventilation holes on lid to prevent sogginess",
        "Full-color flexo or digital printing on natural brown kraft",
        "White interior base option for cleaner food presentation",
        "Perforated tuck for easy lid opening",
        "FDA food-safe materials and inks",
        "Bulk pricing from 100 units — competitive for high-volume pizzerias",
      ],
      "Make your pizza brand as memorable as your recipe. Prime Packaging builds custom pizza boxes for independent pizzerias, food delivery brands, and restaurant chains. Get your free quote and 3D proof today."
    ),
  },

  // ── TEA PACKAGING ──
  {
    cat: "tea-packaging", name: "Custom Tea Boxes", slug: "custom-tea-boxes",
    featured: true, sort: 1,
    image: `${U}/tea-boxes.webp`,
    images: [`${U}/tea-boxes.webp`,`${U}/tea-boxes-wholesale.webp`,`${U}/printed-tea-boxes-bulk.webp`],
    short: "Custom tea boxes for tea brands and retailers. Premium board, foil stamping, and windowed options available.",
    desc: buildDesc(
      "Custom Tea Boxes — Specialty Tea & Wellness Brand Packaging",
      "Tea packaging is deeply sensory — the box sets the expectation for every cup. Our custom tea boxes are designed for specialty tea brands, herbal wellness companies, and artisan tea blenders who want packaging that communicates freshness, quality, and the heritage of their blends.",
      [
        "Premium 14pt–18pt SBS board with matte, gloss, and foil finish options",
        "Custom sizing for single-serve sachets, 20-count, 50-count, and loose leaf tins",
        "Moisture barrier interior coating to maintain tea freshness",
        "Full-color printing with Pantone-matched brand colors",
        "Window cutout to display tea sachets or loose leaf texture",
        "Sliding drawer box styles for premium loose leaf presentation",
        "Embossing and foil stamping for luxury tea brand aesthetics",
        "100-unit minimum — accessible for boutique tea brands",
      ],
      "Your tea brand's story starts with the box. Prime Packaging builds custom tea boxes that invite customers in and keep them coming back. Request a free quote and design proof for your tea packaging today."
    ),
  },

  // ── TRAYS & SLEEVES ──
  {
    cat: "trays-and-sleeves", name: "Custom Printed Packaging Sleeves", slug: "custom-printed-packaging-sleeves",
    featured: true, sort: 1,
    image: `${U}/custom-packaging-sleeves-with-logo.webp`,
    images: [`${U}/custom-packaging-sleeves-with-logo.webp`,`${U}/printed-packaging-sleeves-bulk.webp`],
    short: "Custom wrap-around printed sleeves for tray and sleeve packaging. Cost-effective premium branding.",
    desc: buildDesc(
      "Custom Tray & Sleeve Packaging — Premium Wrap-Around Sleeves",
      "Tray and sleeve packaging is a sophisticated retail format used by premium consumer brands for electronics, food, cosmetics, and gift products. The outer sleeve slides over a custom tray to create a clean, two-piece design that feels premium, unboxes beautifully, and showcases products with elegance.",
      [
        "Precision-cut sleeve sized to your inner tray dimensions",
        "Premium 16pt–18pt SBS board for the sleeve with full-color printing",
        "Matte, gloss, and soft-touch lamination for the outer sleeve",
        "Inner tray available in matching board or kraft",
        "Suitable for cosmetics, skincare sets, food gifts, and tech accessories",
        "Retail-ready format with barcoded back panel on request",
        "Custom sleeve removal experience — smooth pull or tabbed open",
        "100-unit minimum with 6–8 business day production",
      ],
      "Tray and sleeve packaging is a simple way to elevate any product to premium status. Prime Packaging builds custom tray and sleeve sets for brands across all categories. Get a free quote today."
    ),
  },

  // ── WINDOW PACKAGING ──
  {
    cat: "window-packaging", name: "Custom Kraft Window Boxes", slug: "custom-kraft-window-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-kraft-window-boxes-with-logo.webp`,
    images: [`${U}/custom-kraft-window-boxes-with-logo.webp`,`${U}/printed-kraft-window-boxes-bulk.webp`],
    short: "Custom kraft window boxes with clear PET window cutout. Perfect for showcasing handmade and natural products.",
    desc: buildDesc(
      "Custom Kraft Window Boxes — Showcase Your Product Inside",
      "Window boxes let the product sell itself. Our custom kraft window boxes feature a clear PET window cutout that invites customers to see exactly what they're buying — making them ideal for handmade soaps, candles, baked goods, botanical products, and any item where natural color and texture is a selling point.",
      [
        "Clear food-safe PET window in custom shape and size",
        "Natural kraft brown and white SBS board options",
        "Full-color printing around the window for branding and product information",
        "Custom window shapes: rectangle, arch, oval, and die-cut custom shapes",
        "Tuck-top, auto-bottom, and reverse-tuck styles available",
        "Suitable for soap bars, candles, baked goods, dried botanicals, and jewelry",
        "Eco-friendly kraft options with recyclable PET window",
        "100-unit minimum — accessible for artisan and handmade brands",
      ],
      "Let your product shine through. Prime Packaging builds custom window boxes in kraft and premium board for artisan, food, and retail brands. Get a free quote and design proof today."
    ),
  },

  // ── STATIONERY BOXES ──
  {
    cat: "stationery-boxes", name: "Custom Presentation Folders", slug: "custom-presentation-folders",
    featured: true, sort: 1,
    image: `${U}/printed-presentation-folders-bulk.webp`,
    images: [`${U}/printed-presentation-folders-bulk.webp`,`${U}/custom-die-cut-boxes-with-logo.webp`],
    short: "Custom printed presentation folders and stationery packaging. Perfect for business proposals and events.",
    desc: buildDesc(
      "Custom Presentation Folders — Business & Corporate Stationery",
      "First impressions matter in business — and a premium presentation folder signals professionalism before a single word is read. Our custom presentation folders are used by agencies, law firms, real estate brokers, and corporate brands who want their proposals, contracts, and marketing materials presented with intention and impact.",
      [
        "Heavy 16pt–18pt SBS board for a substantial, professional feel",
        "Full-color cover printing with gloss or matte lamination",
        "Soft-touch coating and foil stamping for executive-level presentations",
        "Two-pocket interior with business card slot options",
        "Custom die-cut slots for USB drives and promotional inserts",
        "Available in letter size, legal size, and custom dimensions",
        "Spine options for thicker document presentations",
        "100-unit minimum — accessible for small businesses and agencies",
      ],
      "Your presentation deserves a folder as polished as its content. Prime Packaging builds custom presentation folders for businesses, agencies, and corporate teams. Get a free quote and sample today."
    ),
  },

  // ── CIGARETTE / VAPE ──
  {
    cat: "cigarette-boxes", name: "Custom Vape Cartridge Packaging", slug: "custom-vape-cartridge-packaging",
    featured: true, sort: 1,
    image: `${U}/vape-cartridge-packaging.webp`,
    images: [`${U}/vape-cartridge-packaging.webp`,`${U}/vape-cartridge-packaging-wholesale.webp`],
    short: "Custom vape cartridge packaging with premium finishes and compliant labeling. Precision fit for all cartridge sizes.",
    desc: buildDesc(
      "Custom Vape Cartridge Packaging — Cannabis & Vape Brand Boxes",
      "Premium vape cartridge packaging is essential for standing out in the competitive cannabis and vaping market. Our custom vape boxes combine precision-fit interior cutouts with premium printing and finishes that communicate quality, safety, and brand identity at every retail touchpoint.",
      [
        "Precision-cut foam or cardboard inserts for 0.5g, 1g, and 2g cartridge sizes",
        "Child-resistant box options for cannabis market compliance",
        "Tamper-evident gluing and holographic seal options",
        "Full-color printing with matte, gloss, and spot UV finishes",
        "Black, white, kraft, and custom color board options",
        "QR code panel for COA and lab result linking",
        "Compliance labeling panels for state cannabis regulations",
        "100-unit minimum — low barrier for emerging vape brands",
      ],
      "Build trust in your vape brand with packaging that's as refined as your formula. Prime Packaging builds custom vape cartridge boxes for cannabis and vaping brands across legal US markets. Request a free quote today."
    ),
  },

  // ── CARDBOARD BOXES ──
  {
    cat: "cardboard-boxes", name: "Custom Cardboard Gift Boxes", slug: "custom-cardboard-gift-boxes",
    featured: true, sort: 1,
    image: `${U}/cardboard-gift-boxes.webp`,
    images: [`${U}/cardboard-gift-boxes.webp`,`${U}/custom-cardboard-gift-boxes-with-logo.webp`],
    short: "Custom cardboard gift boxes in premium SBS and CRB board. Full-color printing, embossing, and foil stamping.",
    desc: buildDesc(
      "Custom Cardboard Gift Boxes — Premium Branded Gifting",
      "Custom cardboard gift boxes are the workhorse of branded packaging — versatile, premium, and capable of incredible printing quality. From corporate gifting to retail product launches, our cardboard gift boxes deliver the look and feel of luxury at accessible price points.",
      [
        "Premium 14pt–18pt SBS and CRB board for crisp printing and rigid structure",
        "Full-color CMYK + Pantone printing for exact brand color reproduction",
        "Embossing, debossing, and foil stamping for tactile luxury elements",
        "Matte, gloss, and soft-touch lamination finish options",
        "Available in tuck-top, two-piece lid and base, and rigid box styles",
        "Custom tissue paper, ribbon, and insert options",
        "Retail-ready barcoded panels and product photography guidelines",
        "100-unit minimum — great entry point for growing brands",
      ],
      "Custom cardboard gift boxes that reflect your brand's quality — from startup launches to established retail. Prime Packaging builds packaging that makes gifting feel special. Get a free quote today."
    ),
  },

  // ── CORRUGATED BOXES ──
  {
    cat: "corrugated-boxes", name: "Custom Corrugated Mailer Boxes", slug: "corrugated-custom-mailer-boxes",
    featured: true, sort: 1,
    image: `${U}/corrugated-mailer-boxes.webp`,
    images: [`${U}/corrugated-mailer-boxes.webp`,`${U}/corrugated-mailer-boxes-wholesale.webp`],
    short: "Durable corrugated mailer boxes for e-commerce shipping. Single and double-wall construction with custom printing.",
    desc: buildDesc(
      "Custom Corrugated Mailer Boxes — Strong E-Commerce Shipping",
      "In e-commerce, your box is your brand — and it needs to survive the shipping journey while creating a memorable unboxing experience. Our custom corrugated mailer boxes are built for DTC brands, subscription boxes, and online retailers who want the strength of corrugated with the beauty of full-color printing.",
      [
        "Single-wall (B/E-flute) and double-wall construction for heavy or fragile items",
        "Full-color outside and inside printing for immersive unboxing experiences",
        "Self-locking tuck closure — no tape needed for clean, easy opening",
        "Custom sizes to minimize dimensional weight fees",
        "Eco-friendly 100% recycled corrugated options",
        "Amazon FBA-compliant sizes available",
        "Bulk pricing from 100 units — competitive for high-volume operations",
        "6–8 business day turnaround with rush options available",
      ],
      "Every corrugated box you ship is a brand impression. Prime Packaging builds custom corrugated mailer boxes for DTC and e-commerce brands across the USA. Get a free quote and 3D proof today."
    ),
  },

  // ── CUSTOM KRAFT BOXES ──
  {
    cat: "custom-kraft-boxes", name: "Custom Kraft Boxes", slug: "custom-kraft-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-kraft-boxes-wholesale.webp`,
    images: [`${U}/custom-kraft-boxes-wholesale.webp`,`${U}/custom-kraft-boxes-with-logo.webp`,`${U}/printed-kraft-boxes-bulk.webp`],
    short: "Natural eco-friendly kraft boxes for sustainable brands. 100% recycled board, FSC certified, custom printing.",
    desc: buildDesc(
      "Custom Kraft Boxes — Eco-Friendly Sustainable Packaging",
      "Kraft packaging isn't just a material choice — it's a brand statement. Our custom kraft boxes signal sustainability, authenticity, and natural quality to eco-conscious consumers who reward brands that share their values. Built from 100% recycled or FSC-certified board, our kraft boxes print beautifully and hold up as strong as any premium alternative.",
      [
        "100% recycled content and FSC-certified kraft board options",
        "Natural brown kraft in 60lb, 80lb, and 100lb weights",
        "Full-color printing and 1–2 color sustainable ink options",
        "Available in tuck-top, sleeve, mailer, and retail display styles",
        "Compostable and biodegradable board options for zero-waste brands",
        "Custom sizing for any product category",
        "Embossing and debossing for logo detail without adding synthetic finishes",
        "100-unit minimum — accessible for eco-startup brands",
      ],
      "Sustainable packaging is no longer optional — it's expected. Prime Packaging builds custom kraft boxes for eco-friendly brands that want packaging as green as their values. Get a free quote today."
    ),
  },

  // ── ECO-FRIENDLY BOXES ──
  {
    cat: "eco-friendly-boxes", name: "Custom Kraft Seed Packet Envelopes", slug: "custom-kraft-seed-packet-envelopes",
    featured: true, sort: 1,
    image: `${U}/custom-kraft-seed-packet-envelope.webp`,
    images: [`${U}/custom-kraft-seed-packet-envelope.webp`,`${U}/printed-seed-packet-bulk-envelopes.webp`],
    short: "Custom kraft seed packet envelopes for plant nurseries and eco brands. 100% recycled, earth-safe inks.",
    desc: buildDesc(
      "Custom Kraft Seed Packet Envelopes — Nursery & Garden Brand Packaging",
      "Your seeds carry life — and your packaging should honor that. Our custom kraft seed packet envelopes are designed for plant nurseries, garden brands, farmers markets, and eco-gifting companies that want sustainable, beautiful packaging for seeds, dried herbs, and botanical products.",
      [
        "100% recycled kraft paper envelopes — compostable and earth-friendly",
        "Soy-based, food-safe inks for environmentally conscious printing",
        "Custom sizes for seed packets, herb sachets, and botanical mixes",
        "Full-color or 1–2 color printing for brand name, variety, and planting instructions",
        "Moisture-resistant coating options to protect seeds in storage",
        "Ideal for farmers markets, nurseries, subscription boxes, and eco-gifting",
        "100-unit minimum — accessible for small garden and eco brands",
      ],
      "Let your packaging grow your brand as naturally as your seeds grow plants. Prime Packaging builds custom seed packet envelopes for garden and eco brands. Get a free quote and sample today."
    ),
  },
  {
    cat: "eco-friendly-boxes", name: "Custom Microgreens Packaging", slug: "custom-microgreens-packaging",
    featured: false, sort: 2,
    image: `${U}/custom-microgreens-retail-packaging-box.webp`,
    images: [`${U}/custom-microgreens-retail-packaging-box.webp`,`${U}/printed-microgreens-wholesale-box.webp`],
    short: "Eco kraft boxes for microgreens and urban farm produce brands. Food-safe, sustainable, compostable.",
    desc: buildDesc(
      "Custom Microgreens Packaging — Urban Farm & Produce Brands",
      "Microgreens are a premium product that commands premium packaging. Our custom microgreens boxes are built for urban farms, CSA programs, and specialty produce brands who want food-safe, sustainable packaging that communicates the health and freshness of their greens.",
      [
        "Food-safe eco-kraft board with direct food contact approval",
        "Ventilation hole options to maintain microgreen freshness",
        "Custom sizing for 4-ounce, 8-ounce, and 1-pound microgreen trays",
        "Compostable and biodegradable packaging options for zero-waste brands",
        "Full-color or minimal 1–2 color printing in food-safe soy inks",
        "Window top option for displaying microgreen variety",
        "QR code panels for farm story, growing info, and CSA subscription",
        "100-unit minimum — accessible for urban farms and small producers",
      ],
      "Your microgreens deserve packaging that's as fresh as the product inside. Prime Packaging builds custom microgreens boxes for urban farms and specialty produce brands. Get a free quote today."
    ),
  },

  // ── COSMETIC BOXES ──
  {
    cat: "cosmetic-boxes", name: "Custom Cream Jar Packaging", slug: "custom-cream-jar-packaging",
    featured: true, sort: 1,
    image: `${U}/custom-cream-jars.webp`,
    images: [`${U}/custom-cream-jars.webp`,`${U}/custom-cream-jars-wholesale.webp`],
    short: "Premium custom cream jar packaging for skincare and cosmetic brands. Soft-touch, foil, and spot UV finishes.",
    desc: buildDesc(
      "Custom Cream Jar Packaging — Skincare & Cosmetic Brand Boxes",
      "Your face cream, body butter, or luxury balm is a premium product — and the packaging should signal that from across a retail shelf. Our custom cream jar packaging boxes are designed for skincare brands, cosmetic lines, and beauty entrepreneurs who want packaging that elevates perceived value and drives purchase decisions.",
      [
        "Custom-fit boxes for 30ml, 50ml, 100ml, and 200ml jar sizes",
        "Premium 14pt–18pt SBS board with rigid chipboard upgrade available",
        "Finishes: soft-touch matte, spot UV, gloss lamination, embossing, foil stamping",
        "Full-color inside printing for ingredient lists, brand story, and sustainability claims",
        "Pantone color-matched printing for consistent brand palette",
        "Insert tray options for jar stabilization in box",
        "Cruelty-free, vegan, and certification badge panel support",
        "100-unit minimum — accessible for beauty startups and indie brands",
      ],
      "Premium skincare packaging starts with the right box. Prime Packaging builds custom cream jar boxes for indie beauty brands and luxury skincare lines. Get a free quote and 3D design proof today."
    ),
  },
  {
    cat: "cosmetic-boxes", name: "Custom Lip Gloss Boxes", slug: "custom-lip-gloss-boxes",
    featured: true, sort: 2,
    image: `${U}/custom-lip-gloss-boxes.webp`,
    images: [`${U}/custom-lip-gloss-boxes.webp`,`${U}/custom-lip-gloss-boxes-with-logo.webp`,`${U}/printed-lip-gloss-boxes-bulk.webp`,`${U}/printed-lip-gloss-boxes-bulk-1.webp`],
    short: "Custom lip gloss boxes with bold color printing and precision fit. Perfect for beauty brands and cosmetic launches.",
    desc: buildDesc(
      "Custom Lip Gloss Boxes — Beauty Brand Packaging",
      "Lip gloss packaging is a micro-moment billboard for your beauty brand. Our custom lip gloss boxes are designed to showcase individual lip glosses, duos, and gift sets with the vibrant, fashion-forward printing that beauty consumers expect from premium cosmetic brands.",
      [
        "Precision-fit boxes for standard 8ml, 10ml, and jumbo 15ml lip gloss tubes",
        "Ultra-vibrant full-color printing — neons, metallics, and custom palettes",
        "Gloss and matte lamination with spot UV highlight options",
        "Available as single tube boxes, 2-pack, and gift set configurations",
        "Gold and silver foil stamping for luxury beauty brand aesthetics",
        "Inside printing for ingredient lists and application tips",
        "Influencer-ready unboxing design from our beauty packaging specialists",
        "100-unit minimum — accessible for indie beauty and cosmetic startups",
      ],
      "Build a beauty brand that sells itself from the shelf. Prime Packaging builds custom lip gloss boxes for indie beauty brands and established cosmetic companies. Get a free beauty packaging quote today."
    ),
  },
  {
    cat: "cosmetic-boxes", name: "Custom Perfume Boxes", slug: "custom-perfume-boxes",
    featured: false, sort: 3,
    image: `${U}/printed-perfume-boxes-bulk.webp`,
    images: [`${U}/printed-perfume-boxes-bulk.webp`],
    short: "Luxury custom perfume boxes with embossing, foil stamping, and soft-touch lamination for fragrance brands.",
    desc: buildDesc(
      "Custom Perfume Boxes — Luxury Fragrance Brand Packaging",
      "Fragrance packaging is theater — and your perfume box is the opening act. Our custom perfume boxes combine precision engineering with luxury print finishes to create packaging that communicates the sophistication and artistry of your fragrance brand before the first spritz.",
      [
        "Custom-fit boxes for 30ml, 50ml, 100ml, and 200ml fragrance bottles",
        "Rigid chipboard construction for luxurious weight and structure",
        "Soft-touch matte lamination — silky, premium tactile experience",
        "Embossing and debossing for brand name and floral motif detail",
        "Gold, silver, and rose gold foil stamping on dark and light backgrounds",
        "Premium magnetic closure and ribbon-pull lid options",
        "Custom interior tissue and foam nest for bottle protection",
        "100-unit minimum — accessible for indie perfumers and fragrance startups",
      ],
      "Luxury fragrance deserves luxury packaging. Prime Packaging builds custom perfume boxes for independent perfumers and established fragrance brands. Request a free luxury packaging quote today."
    ),
  },
  {
    cat: "cosmetic-boxes", name: "Custom Tallow Balm Packaging", slug: "custom-tallow-balm-packaging",
    featured: false, sort: 4,
    image: `${U}/tallow-balm-unscented-product-box.webp`,
    images: [`${U}/tallow-balm-unscented-product-box.webp`,`${U}/printed-tallow-balm-skincare-packaging-box.webp`],
    short: "Custom tallow balm and natural skincare packaging for clean beauty brands. Kraft and premium board options.",
    desc: buildDesc(
      "Custom Tallow Balm Packaging — Clean Beauty & Natural Skincare",
      "The tallow skincare movement is booming — and your packaging should match the purity story of the product. Our custom tallow balm boxes are designed for clean beauty brands, ancestral health brands, and natural skincare companies who want earthy, authentic packaging that resonates with health-conscious consumers.",
      [
        "Natural kraft and unbleached board — matches the clean, ancestral aesthetic",
        "Custom sizing for 1oz, 2oz, and 4oz tallow balm jars and tins",
        "Minimal, clean design printing that tells the natural ingredient story",
        "Food-safe inks — important for brands with edible-grade tallow products",
        "Window cutout options to show jar or tin label through box",
        "Sustainability claims printing panels for grass-fed and pasture-raised certifications",
        "100-unit minimum — accessible for small-batch tallow skincare brands",
      ],
      "Clean beauty brands deserve packaging as honest as the formula. Prime Packaging builds custom tallow balm packaging for natural skincare and ancestral health brands. Get a free quote today."
    ),
  },

  // ── CHOCOLATE BOXES ──
  {
    cat: "chocolate-boxes", name: "Custom Luxury Chocolate Boxes", slug: "luxury-chocolate-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-luxury-chocolate-boxes-with-logo.webp`,
    images: [`${U}/custom-luxury-chocolate-boxes-with-logo.webp`,`${U}/custom-luxury-chocolate-boxes-with-logo-1.webp`,`${U}/printed-luxury-chocolate-boxes-bulk.webp`],
    short: "Premium luxury chocolate boxes with velvet inserts and window lid. Perfect for truffles and gift chocolates.",
    desc: buildDesc(
      "Custom Luxury Chocolate Boxes — Premium Confectionery Packaging",
      "Luxury chocolate is an experience — and it begins with the box. Our custom luxury chocolate boxes are designed for artisan chocolatiers, confectionery brands, and gift companies who want packaging that communicates richness, care, and indulgence from the very first touch.",
      [
        "Custom compartment inserts for truffles, bonbons, pralines, and bars",
        "Velvet, satin, and custom-colored flocking interior options",
        "Clear PET window lid to showcase chocolate arrangements",
        "Premium rigid board with magnetic closure and ribbon-pull options",
        "Gold, silver, and rose gold foil stamping on matte and gloss surfaces",
        "Embossed brand name and motif detailing",
        "Available in 4-piece, 8-piece, 12-piece, and full slab box configurations",
        "Perfect for Valentine's Day, Mother's Day, corporate gifting, and retail",
        "100-unit minimum — accessible for boutique chocolatiers",
      ],
      "Your chocolate is a luxury gift — and the box should feel like one. Prime Packaging builds custom luxury chocolate boxes for artisan chocolatiers and confectionery brands. Request a free quote and physical sample today."
    ),
  },
  {
    cat: "chocolate-boxes", name: "Custom Mushroom Chocolate Bar Boxes", slug: "custom-mushroom-chocolate-bar-boxes",
    featured: false, sort: 2,
    image: `${U}/custom-mushroom-infused-chocolate-bar-box.webp`,
    images: [`${U}/custom-mushroom-infused-chocolate-bar-box.webp`,`${U}/custom-mushroom-cultivation-kit-box.webp`],
    short: "Custom functional mushroom chocolate and wellness product packaging. Bold graphics, premium finishes.",
    desc: buildDesc(
      "Custom Mushroom Chocolate Bar Boxes — Functional Food Packaging",
      "The functional mushroom and psychedelic chocolate market demands packaging that's both bold and trust-building. Our custom mushroom chocolate bar boxes combine striking design printing with premium finishes that position your functional confectionery as a premium wellness product.",
      [
        "Custom-fit boxes for 1oz, 2oz, and 3.5oz chocolate bars",
        "Bold, psychedelic or wellness-minimal design printing",
        "Spot UV and foil options for premium visual impact",
        "QR code panels linking to dosage guides and lab results",
        "Tamper-evident seal and child-resistant closure options",
        "Compliance label panels for functional supplement claims",
        "Available in kraft, black matte, and white gloss board",
        "100-unit minimum — accessible for emerging functional food brands",
      ],
      "Stand out in the functional food category with packaging as powerful as your product. Prime Packaging builds custom mushroom chocolate bar boxes for wellness and confectionery brands. Get a free quote today."
    ),
  },

  // ── LABELS & STICKERS ──
  {
    cat: "labels-and-stickers", name: "Custom Die-Cut Stickers", slug: "custom-die-cut-stickers",
    featured: true, sort: 1,
    image: `${U}/custom-die-cut-stickers-with-logo.webp`,
    images: [`${U}/custom-die-cut-stickers-with-logo.webp`,`${U}/custom-die-cut-boxes-with-logo.webp`],
    short: "Custom die-cut stickers and labels in any shape. Waterproof, UV-resistant, full-color for any surface.",
    desc: buildDesc(
      "Custom Die-Cut Stickers & Labels — Any Shape, Full Color",
      "Custom die-cut stickers and labels are one of the most versatile and cost-effective brand tools available. Whether you're labeling products, decorating packaging, rewarding loyal customers, or creating influencer kits, our custom die-cut stickers deliver full-color precision in any shape you can imagine.",
      [
        "Custom die-cut to any shape — circles, rectangles, irregular custom outlines",
        "Full-color digital printing — photographic quality and pantone matching",
        "Waterproof BOPP vinyl — dishwasher-safe for product labels",
        "UV-resistant outdoor-grade options for vehicles, equipment, and outdoor products",
        "Matte, gloss, and clear label substrate options",
        "Kiss-cut sheets and individual stickers available",
        "Kiss-cut on rolls for production line application",
        "100-unit minimum — accessible for startups and small brands",
      ],
      "From product labels to influencer packs and retail price tags, Prime Packaging builds custom die-cut stickers and labels for brands across every category. Get a free quote and proof today."
    ),
  },

  // ── CUSTOM MYLAR BAGS ──
  {
    cat: "custom-mylar-bags", name: "Custom Resealable Mylar Bags", slug: "custom-resealable-mylar-bags",
    featured: true, sort: 1,
    image: `${U}/resealable-mylar-bags.webp`,
    images: [`${U}/resealable-mylar-bags.webp`,`${U}/resealable-mylar-bags-wholesale.webp`,`${U}/printed-resealable-mylar-bags-bulk.webp`],
    short: "Custom printed resealable mylar stand-up pouches for food, cannabis, supplements, and specialty goods.",
    desc: buildDesc(
      "Custom Resealable Mylar Bags — Stand-Up Pouches for Food & Cannabis",
      "Mylar stand-up pouches are the gold standard for product freshness and shelf appeal. Our custom resealable mylar bags combine a high-barrier laminate film with stunning full-color printing to deliver packaging that protects your product's freshness and drives purchase from across the shelf.",
      [
        "High-barrier mylar laminate — blocks oxygen, moisture, and UV for maximum shelf life",
        "Resealable zip-lock closure for consumer convenience and repeat use",
        "Stand-up bottom gusset for self-display on retail shelves",
        "Full-color printing on front, back, and gusset panels",
        "Matte, gloss, and metallic foil laminate exterior finish options",
        "Custom sizes from 1oz to 1lb — flexible for any product fill weight",
        "Clear window option to showcase product color and texture",
        "Child-resistant zipper options for cannabis and pharmaceutical compliance",
        "100-unit minimum — low MOQ for startup food and cannabis brands",
      ],
      "Mylar pouches protect your product and sell it at the same time. Prime Packaging builds custom resealable mylar bags for food, cannabis, supplement, and specialty goods brands. Get a free quote and design proof today."
    ),
  },
  {
    cat: "custom-mylar-bags", name: "Custom Kratom Mylar Pouches", slug: "custom-kratom-mylar-pouches",
    featured: false, sort: 2,
    image: `${U}/custom-kratom-mylar-stand-up-pouch.webp`,
    images: [`${U}/custom-kratom-mylar-stand-up-pouch.webp`,`${U}/printed-kratom-resealable-packaging-bag.webp`],
    short: "Compliant custom kratom mylar stand-up pouches with child-resistant zippers and full-color branding.",
    desc: buildDesc(
      "Custom Kratom Mylar Pouches — Botanical Supplement Packaging",
      "Custom kratom packaging requires the perfect balance of product protection, brand impact, and compliance readiness. Our custom kratom mylar pouches are designed for kratom vendors, botanical supplement companies, and herbal wellness brands who want professional packaging that builds consumer trust.",
      [
        "High-barrier mylar laminate — protects kratom alkaloids from moisture and UV degradation",
        "Child-resistant zip-lock closure for safety compliance",
        "Tamper-evident heat seal and tear-notch options",
        "Full-color front and back panel printing",
        "Custom sizing for 1oz, 2oz, 4oz, and 1lb kratom powder and capsule fills",
        "Matte kraft and black glossy exterior finish options",
        "QR code panel for product testing results and brand website",
        "100-unit minimum — accessible for kratom startup brands",
      ],
      "Build a professional kratom brand with compliant, premium packaging. Prime Packaging builds custom kratom mylar pouches for botanical supplement and herbal wellness brands. Get a free quote today."
    ),
  },
  {
    cat: "custom-mylar-bags", name: "Custom Supplement Stand-Up Pouches", slug: "custom-supplement-standup-pouches",
    featured: false, sort: 3,
    image: `${U}/collagen-protein-resealable-pouch-bag.webp`,
    images: [`${U}/collagen-protein-resealable-pouch-bag.webp`,`${U}/collagen-elastin-supplement-packaging-bag.webp`,`${U}/custom-collagen-peptide-stand-up-pouch.webp`],
    short: "Custom stand-up pouches for collagen, protein, and supplement powders. Resealable zip-lock, matte finish.",
    desc: buildDesc(
      "Custom Supplement Stand-Up Pouches — Protein & Wellness Brand Packaging",
      "The supplement market is one of the most competitive retail categories — and your packaging is your silent salesperson. Our custom supplement stand-up pouches for collagen, protein, and wellness powders combine premium matte finishes with bold nutritional branding that builds credibility and drives repeat purchase.",
      [
        "Food-grade high-barrier foil pouch construction for powder freshness",
        "Resealable zip-lock for consumer convenience between uses",
        "Matte and soft-touch exterior finishes for premium supplement shelf look",
        "Full-color front, back, and gusset panel printing",
        "Custom sizing for 100g, 250g, 500g, and 1kg supplement fills",
        "Nutritional panel and supplement facts layout support from our design team",
        "GMP-compliant printing inks — suitable for FDA-regulated supplement brands",
        "100-unit minimum — accessible for supplement startup brands",
      ],
      "Your supplement brand deserves packaging as science-backed as your formula. Prime Packaging builds custom supplement pouches for collagen, protein, and wellness brands. Get a free quote and design proof today."
    ),
  },
  {
    cat: "custom-mylar-bags", name: "Custom Kava & Adaptogen Pouches", slug: "custom-kava-adaptogen-pouches",
    featured: false, sort: 4,
    image: `${U}/custom-kava-powder-stand-up-pouch-bag.webp`,
    images: [`${U}/custom-kava-powder-stand-up-pouch-bag.webp`,`${U}/printed-kava-herbal-supplement-packaging.webp`,`${U}/custom-adaptogen-supplement-packaging-box.webp`,`${U}/adaptogen-supplement-retail-packaging-box.webp`],
    short: "Custom kava powder and adaptogen supplement packaging pouches and boxes for wellness brands.",
    desc: buildDesc(
      "Custom Kava & Adaptogen Packaging — Herbal Wellness Brands",
      "Kava, ashwagandha, lion's mane, and adaptogen blends are among the fastest-growing supplement categories. Our custom kava and adaptogen packaging pouches and boxes are built for the wellness-forward consumer who trusts premium, clearly labeled products from brands that look as credible as their clinical claims.",
      [
        "High-barrier mylar pouches and rigid box options for adaptogen products",
        "Earthy, wellness-forward design printing — kraft, forest green, deep brown palettes",
        "Full-color printing with botanical illustration support",
        "Resealable zip-lock and tin-tie closure options for powders",
        "Supplement facts and botanical sourcing panel space",
        "QR code integration for product origin and lab testing transparency",
        "Sustainable and eco-friendly board and pouch options",
        "100-unit minimum — accessible for emerging adaptogen brands",
      ],
      "Position your kava or adaptogen brand as the premium choice with packaging that communicates purity and potency. Prime Packaging builds custom adaptogen packaging for wellness startups and established supplement brands. Get a free quote today."
    ),
  },

  // ── RIGID BOXES ──
  {
    cat: "rigid-boxes", name: "Custom Magnetic Closure Boxes", slug: "custom-magnetic-closure-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-magnetic-closure-boxes-wholesale.webp`,
    images: [`${U}/custom-magnetic-closure-boxes-wholesale.webp`,`${U}/custom-magnetic-closure-boxes-with-logo.webp`,`${U}/custom-magnetic-closure-boxes-with-logo-1.webp`,`${U}/printed-magnetic-closure-boxes-bulk.webp`],
    short: "Premium magnetic closure rigid boxes for luxury packaging. Snap-shut magnets with premium board and finishes.",
    desc: buildDesc(
      "Custom Magnetic Closure Rigid Boxes — Luxury Packaging",
      "The satisfying snap of a magnetic closure box is the sound of premium unboxing. Our custom magnetic closure boxes are the gold standard in luxury packaging — used by jewelry brands, high-end cosmetics, corporate gifters, and premium product brands who want their packaging to create an emotional response at the moment of opening.",
      [
        "Rigid chipboard construction (1200–2400 gsm) for substantial luxury feel",
        "Magnetic snap closure with powerful N35 or N52 neodymium magnets",
        "Full-color lithographic printing wrapped on premium boards",
        "Soft-touch matte, gloss lamination, foil stamping, embossing options",
        "Custom interior satin, velvet, and EVA foam inserts",
        "Available in lift-lid, clam-shell, and shoulder box configurations",
        "Ribbon pull tab for smooth lid removal experience",
        "100-unit minimum — accessible for luxury brand startups",
      ],
      "Magnetic closure boxes turn opening a package into an event. Prime Packaging builds custom magnetic closure boxes for luxury brands across jewelry, cosmetics, tech, and gift categories. Get a free quote and physical sample today."
    ),
  },
  {
    cat: "rigid-boxes", name: "Custom Magnetic Gift Boxes", slug: "custom-magnetic-gift-boxes",
    featured: false, sort: 2,
    image: `${U}/custom-magnetic-gift-boxes.webp`,
    images: [`${U}/custom-magnetic-gift-boxes.webp`,`${U}/custom-magnetic-gift-boxes-wholesale.webp`,`${U}/custom-magnetic-gift-boxes-with-logo.webp`,`${U}/printed-magnetic-gift-boxes-bulk.webp`],
    short: "Custom rigid magnetic gift boxes for corporate gifting and luxury retail. Snap closures in any color.",
    desc: buildDesc(
      "Custom Magnetic Gift Boxes — Corporate Gifting & Luxury Retail",
      "Corporate gifts and premium retail products deserve a presentation that reflects your brand's investment. Our custom magnetic gift boxes combine rich, full-color printing with sturdy rigid construction and premium magnetic closures — creating gift packaging your recipients will keep and reuse, extending your brand's reach beyond the initial gift.",
      [
        "Rigid board construction in multiple thicknesses for different budget levels",
        "Custom exterior color — white, black, kraft, and brand-specific colors",
        "Full-color lithographic wrap printing on all exterior panels",
        "Satin and velvet interior lining options for premium presentation",
        "Custom compartment inserts for multi-item gift sets",
        "Corporate logo embossing and debossing on lid",
        "Holiday and seasonal design options available from our design team",
        "Bulk pricing for corporate gifting programs at 500+ units",
        "100-unit minimum for custom magnetic gift box orders",
      ],
      "Corporate gifting is a brand statement — make sure yours says premium. Prime Packaging builds custom magnetic gift boxes for corporations, luxury retailers, and event planners. Request a free quote today."
    ),
  },

  // ── GIFT BOXES ──
  {
    cat: "gift-boxes", name: "Custom Resin Art Gift Boxes", slug: "custom-resin-art-gift-boxes",
    featured: true, sort: 1,
    image: `${U}/resin-art-product-retail-packaging-box.webp`,
    images: [`${U}/resin-art-product-retail-packaging-box.webp`,`${U}/resin-art-thank-you-card-packaging.webp`],
    short: "Custom packaging for resin art and handmade craft products. Premium mailers and rigid boxes for artisan sellers.",
    desc: buildDesc(
      "Custom Gift Boxes for Resin Art & Handmade Products",
      "Your handmade resin art pieces are one-of-a-kind — and the packaging they arrive in should honor that uniqueness. Our custom gift boxes for resin artists combine protective corrugated or rigid construction with custom printing and branded inserts that make every delivery feel like a curated gallery unboxing.",
      [
        "Corrugated and rigid box options for different product sizes and fragility levels",
        "Custom foam or crinkle paper inserts to protect resin pieces in transit",
        "Artistic full-color printing to reflect your studio aesthetic",
        "Thank-you card and certificate of authenticity pocket inserts",
        "Tissue paper, wax seal, and branded ribbon options",
        "Suitable for Etsy, DTC, and gallery retail packaging",
        "Custom branding that tells your artist story on every box",
        "100-unit minimum — accessible for independent artisan studios",
      ],
      "Let your packaging be as extraordinary as your resin art. Prime Packaging builds custom gift boxes for resin artists, craft sellers, and handmade product brands. Get a free quote today."
    ),
  },
  {
    cat: "gift-boxes", name: "Custom Cardboard Gift Boxes", slug: "custom-cardboard-gift-boxes-set",
    featured: false, sort: 2,
    image: `${U}/cardboard-gift-boxes.webp`,
    images: [`${U}/cardboard-gift-boxes.webp`,`${U}/custom-cardboard-gift-boxes-with-logo.webp`],
    short: "Custom cardboard gift boxes for retail, event, and corporate gifting. Full-color, any size, ribbon options.",
    desc: buildDesc(
      "Custom Cardboard Gift Boxes — Retail & Corporate Gifting",
      "Custom cardboard gift boxes are the versatile backbone of branded gifting programs. From retail product launches to corporate thank-you gifts and event giveaways, our custom gift boxes deliver full-color premium printing in a sturdy, elegant package that works for any gifting occasion.",
      [
        "Premium SBS board in multiple thicknesses for different product weights",
        "Full-color CMYK and Pantone printing for exact brand color matching",
        "Embossing, foil stamping, and spot UV highlight options",
        "Matte and gloss lamination finish options",
        "Ribbon and handle options for carry-friendly gift presentation",
        "Custom tissue paper, fill, and insert options available",
        "Available in tuck-top, two-piece lid and base, and windowed styles",
        "100-unit minimum — great for retail and corporate gifting programs",
      ],
      "From retail shelves to corporate gift programs, Prime Packaging builds custom gift boxes that make every giving moment feel special. Get a free quote for your custom gift boxes today."
    ),
  },

  // ── CAKE BOXES ──
  {
    cat: "cake-boxes", name: "Custom Cake Boxes", slug: "custom-cake-boxes",
    featured: true, sort: 1,
    image: `${U}/custom-cake-boxes.webp`,
    images: [`${U}/custom-cake-boxes.webp`,`${U}/custom-cake-boxes-wholesale.webp`,`${U}/custom-cake-boxes-with-logo.webp`],
    short: "Premium custom cake boxes with clear PET window cutout. Showcase your cakes beautifully with full-color printing.",
    desc: buildDesc(
      "Custom Cake Boxes — Bakery & Patisserie Packaging",
      "Your cakes are works of art — and our custom cake boxes are designed to showcase them. Whether you're boxing individual slices, whole tiered cakes, or specialty celebration cakes, our boxes combine food-safe construction with premium printing and a clear window to display your creations at their beautiful best.",
      [
        "Clear PET window cutout to display cake layers, frosting, and decorations",
        "Food-safe SBS and kraft board with direct food contact coatings",
        "Custom sizing from mini cupcake boxes to full 14-inch tier cake boxes",
        "Full-color printing for bakery logo, branding, and seasonal messages",
        "Tuck-top, auto-lock bottom, and 4-corner tray styles available",
        "Ventilation options for tall decorated cakes",
        "Grease-resistant interior coating for buttercream and fondant cakes",
        "Custom insert options for cupcakes, macarons, and cake pops",
        "100-unit minimum — perfect for boutique bakeries and patisseries",
      ],
      "Make every cake presentation as memorable as the taste. Prime Packaging builds custom cake boxes for bakeries, patisseries, and cake artists across the USA. Get a free design proof today — our team specializes in bakery packaging."
    ),
  },

  // ── MAGNETIC CLOSURE BOXES (featured category) ──
  {
    cat: "magnetic-closure-boxes", name: "Printed Magnetic Closure Boxes", slug: "printed-magnetic-closure-boxes",
    featured: true, sort: 1,
    image: `${U}/printed-magnetic-closure-boxes-bulk.webp`,
    images: [`${U}/printed-magnetic-closure-boxes-bulk.webp`,`${U}/custom-magnetic-closure-boxes-wholesale.webp`],
    short: "Premium printed magnetic closure gift boxes with full inside/outside printing. Ideal for luxury retail brands.",
    desc: buildDesc(
      "Printed Magnetic Closure Boxes — Full-Color Luxury Rigid Packaging",
      "Printed magnetic closure boxes take luxury unboxing to the next level. Unlike plain magnetic boxes, our fully printed versions feature stunning full-color artwork on the exterior and interior — making every surface a brand canvas that creates an immersive, premium experience for the recipient.",
      [
        "Rigid chipboard core with full-color lithographic printing wrap",
        "Full inside printing — transform the interior into a brand story",
        "Magnetic snap closure with premium neodymium magnets",
        "Custom exterior finish: soft-touch matte, gloss, foil, embossing",
        "Satin, velvet, and foam interior lining options",
        "Available in lift-lid, clamshell, and drawer configurations",
        "Custom compartment inserts for product organization inside",
        "100-unit minimum with competitive wholesale pricing at 500+ units",
      ],
      "Turn every unboxing into a brand experience with fully printed magnetic closure boxes. Prime Packaging builds custom printed rigid boxes for luxury brands across jewelry, cosmetics, and premium gifting. Get a free quote and sample today."
    ),
  },
];

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
  const client = await pool.connect();
  try {
    console.log("Clearing old data...");
    await client.query("DELETE FROM products");
    await client.query("DELETE FROM categories");
    console.log("Cleared.");

    // Insert categories
    let catCount = 0;
    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (name, slug, image_url, meta_title, meta_description, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (slug) DO UPDATE
          SET name=$1, image_url=$3, meta_title=$4, meta_description=$5, sort_order=$6, is_active=true
      `, [cat.name, cat.slug, cat.image_url, cat.meta_title, cat.meta_description, cat.sort_order]);
      catCount++;
    }
    console.log(`Inserted ${catCount} categories.`);

    // Fetch category slug→id map
    const { rows: catRows } = await client.query("SELECT id, slug FROM categories");
    const catMap = Object.fromEntries(catRows.map(r => [r.slug, r.id]));

    // Insert products
    let prodCount = 0;
    let skipped = 0;
    for (const p of products) {
      const catId = catMap[p.cat];
      if (!catId) { console.warn(`  SKIP — no category for slug: ${p.cat}`); skipped++; continue; }
      await client.query(`
        INSERT INTO products (category_id, name, slug, short_description, description, image_url, images, is_featured, is_active, min_order, sort_order, meta_title, meta_description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 100, $9, $10, $11)
        ON CONFLICT (slug) DO UPDATE
          SET name=$2, short_description=$4, description=$5, image_url=$6, images=$7, is_featured=$8, is_active=true, sort_order=$9, meta_title=$10, meta_description=$11
      `, [
        catId, p.name, p.slug, p.short, p.desc,
        p.image, JSON.stringify(p.images),
        p.featured, p.sort,
        `${p.name} | Custom Packaging Boxes USA`,
        `${p.short} Free design support. Low MOQ from 100 units. 7–10 day turnaround.`,
      ]);
      prodCount++;
    }
    console.log(`Inserted ${prodCount} products. Skipped: ${skipped}`);
    console.log("✅ Seeding complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
