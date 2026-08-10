/**
 * Seed script — inserts starter categories + products so the website has real data.
 * Run: pnpm --filter @workspace/db exec tsx seed.ts
 */
import { db, categoriesTable, productsTable } from "./src/index";

const BASE = "https://www.primepackagingboxes.com/wp-content/uploads/2025/05";
const BASE2 = "https://www.primepackagingboxes.com/wp-content/uploads/2025/06";

// ── Categories ────────────────────────────────────────────────────────────────
const categories = [
  {
    name: "Custom Cake Boxes",     slug: "cake-boxes",
    description: "Premium custom cake boxes with window cutouts, inserts, and full-color printing. Perfect for bakeries, home bakers, and pastry shops.",
    imageUrl: `${BASE}/custom-cake-boxes-wholesale.webp`,
    metaTitle: "Custom Cake Boxes | Wholesale Bakery Packaging USA",
    metaDescription: "Order custom printed cake boxes with window, ribbon, and premium finishes. Free design support. 100-unit minimum.",
    sortOrder: 1,
  },
  {
    name: "Custom Mailer Boxes",   slug: "mailer-boxes",
    description: "High-impact custom mailer boxes for e-commerce brands. Durable corrugated construction with full-color printing inside and out.",
    imageUrl: `${BASE}/custom-mailer-boxes-wholesale.webp`,
    metaTitle: "Custom Mailer Boxes | E-Commerce Shipping Boxes USA",
    metaDescription: "Custom printed mailer boxes for subscription boxes, apparel, and e-commerce. Low MOQ from 100 units.",
    sortOrder: 2,
  },
  {
    name: "Cosmetic Boxes",        slug: "cosmetic-boxes",
    description: "Luxury cosmetic packaging for skincare, makeup, and beauty brands. Premium SBS board with foil, soft-touch, and spot UV finishes.",
    imageUrl: `${BASE}/custom-cosmetic-boxes-wholesale.webp`,
    metaTitle: "Custom Cosmetic Boxes | Beauty Packaging USA",
    metaDescription: "Premium cosmetic packaging for skincare and beauty brands. Free design support, low MOQ from 100 units.",
    sortOrder: 3,
  },
  {
    name: "Kraft Boxes",           slug: "kraft-boxes",
    description: "Eco-friendly kraft packaging for natural and sustainable brands. 100% recycled brown kraft board with custom printing.",
    imageUrl: `${BASE}/custom-kraft-boxes-wholesale.webp`,
    metaTitle: "Custom Kraft Boxes | Eco-Friendly Packaging USA",
    metaDescription: "Custom printed kraft boxes — sustainable, recyclable, and beautiful. Starting from 100 units.",
    sortOrder: 4,
  },
  {
    name: "Rigid Boxes",           slug: "rigid-boxes",
    description: "Premium rigid setup boxes for luxury brands. Heavyweight chipboard construction with magnetic closures, ribbon pulls, and custom inserts.",
    imageUrl: `${BASE2}/custom-rigid-boxes-wholesale.webp`,
    metaTitle: "Custom Rigid Boxes | Luxury Gift Box Packaging USA",
    metaDescription: "Premium rigid gift boxes with magnetic closures and luxury finishes. Perfect for high-end products.",
    sortOrder: 5,
  },
  {
    name: "Food Boxes",            slug: "food-boxes",
    description: "FDA-compliant custom food packaging for restaurants, cafes, and food brands. Grease-resistant coatings available.",
    imageUrl: `${BASE}/custom-food-boxes-wholesale.webp`,
    metaTitle: "Custom Food Boxes | Food Safe Packaging USA",
    metaDescription: "Custom food packaging boxes — FDA compliant, grease resistant, and fully printable. Low MOQ from 100 units.",
    sortOrder: 6,
  },
  {
    name: "Candle Boxes",          slug: "candle-boxes",
    description: "Custom candle packaging with premium window cutouts and inserts to protect your candles during shipping and on shelf.",
    imageUrl: `${BASE}/custom-candle-boxes-wholesale.webp`,
    metaTitle: "Custom Candle Boxes | Candle Packaging Wholesale USA",
    metaDescription: "Custom printed candle boxes with window, insert, and premium finishes. Free design support.",
    sortOrder: 7,
  },
  {
    name: "Apparel Boxes",         slug: "apparel-boxes",
    description: "Custom clothing and apparel packaging for fashion brands. Sturdy corrugated and rigid options for shirts, shoes, and accessories.",
    imageUrl: `${BASE2}/custom-apparel-boxes-wholesale.webp`,
    metaTitle: "Custom Apparel Boxes | Clothing Packaging USA",
    metaDescription: "Custom clothing and apparel boxes for fashion brands. Premium finishes, free design support.",
    sortOrder: 8,
  },
  {
    name: "Magnetic Closure Boxes", slug: "magnetic-closure-boxes",
    description: "Premium magnetic closure gift boxes for luxury products. Perfect for jewelry, electronics, cosmetics, and high-end retail.",
    imageUrl: `${BASE2}/printed-magnetic-closure-boxes-bulk.webp`,
    metaTitle: "Custom Magnetic Closure Boxes | Luxury Gift Boxes USA",
    metaDescription: "Premium magnetic closure boxes for luxury packaging. Custom sizes, colors, and finishes.",
    sortOrder: 9,
  },
  {
    name: "Chocolate Boxes",       slug: "chocolate-boxes",
    description: "Custom chocolate and confectionery packaging with premium inserts and windowed lids to showcase your product.",
    imageUrl: `${BASE}/custom-chocolate-boxes-wholesale.webp`,
    metaTitle: "Custom Chocolate Boxes | Confectionery Packaging USA",
    metaDescription: "Custom chocolate boxes with inserts and window for candy, truffles, and gift chocolates.",
    sortOrder: 10,
  },
];

// ── Products ──────────────────────────────────────────────────────────────────
const productData = [
  // Cake Boxes (slug: cake-boxes)
  {
    name: "Custom Window Cake Boxes",
    slug: "custom-window-cake-boxes",
    catSlug: "cake-boxes",
    shortDescription: "Premium custom cake boxes with clear window cutout. Perfect for showcasing bakery products with full-color printing.",
    description: `<h2>Custom Printed Window Cake Boxes</h2>
<p>Our custom window cake boxes are designed to showcase your baked goods beautifully while providing structural protection. Made from premium 18pt SBS board with a clear PET window, these boxes let customers see your product before purchase — boosting impulse buys and brand perception.</p>
<h3>Why Choose Our Cake Boxes?</h3>
<ul>
<li>Premium 18pt SBS paperboard with smooth printing surface</li>
<li>Crystal-clear PET window in any shape or size</li>
<li>Full-color CMYK printing with optional foil and spot UV</li>
<li>Food-safe interior lining available</li>
<li>Flat-pack design for easy storage and assembly</li>
</ul>`,
    imageUrl: `${BASE}/custom-cake-boxes-wholesale.webp`,
    images: [`${BASE}/custom-cake-boxes-wholesale.webp`, `${BASE}/custom-cake-boxes-with-window.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Window Cake Boxes | Wholesale Bakery Packaging",
    metaDescription: "Order custom cake boxes with window cutout. Full-color printing, food-safe, low MOQ from 100 units. Free design support.",
    focusKeyword: "custom window cake boxes",
    minOrder: 100,
  },
  {
    name: "Custom Bakery Pastry Boxes",
    slug: "custom-bakery-pastry-boxes",
    catSlug: "cake-boxes",
    shortDescription: "Sturdy custom pastry and bakery boxes for cookies, cupcakes, and pastries. Available with and without window.",
    description: `<h2>Custom Bakery & Pastry Boxes</h2>
<p>Our custom bakery boxes are perfect for packaging cookies, cupcakes, macarons, and other pastries. Sturdy SBS board construction prevents crushing during delivery while our printing capabilities ensure your branding stands out on every shelf.</p>`,
    imageUrl: `${BASE}/custom-bakery-boxes-wholesale.webp`,
    images: [`${BASE}/custom-bakery-boxes-wholesale.webp`],
    isFeatured: false,
    sortOrder: 2,
    metaTitle: "Custom Bakery Pastry Boxes | Cookie & Cupcake Packaging",
    metaDescription: "Custom printed bakery boxes for cookies, cupcakes, and pastries. Premium board, free design support.",
    focusKeyword: "custom bakery pastry boxes",
    minOrder: 100,
  },
  // Mailer Boxes
  {
    name: "Custom Printed Mailer Boxes",
    slug: "custom-printed-mailer-boxes",
    catSlug: "mailer-boxes",
    shortDescription: "Durable custom mailer boxes with full inside and outside printing. Built for e-commerce and subscription box brands.",
    description: `<h2>Custom Printed Mailer Boxes for E-Commerce</h2>
<p>Make your unboxing experience unforgettable with our custom printed mailer boxes. Built from B-flute corrugated board, these boxes are strong enough to protect products in transit while looking premium on arrival. Print your brand's full story inside and outside.</p>
<h3>Features</h3>
<ul>
<li>B-flute corrugated construction — lightweight yet strong</li>
<li>Full-color printing inside and outside</li>
<li>Self-locking tab closure — no tape needed</li>
<li>Optional tear strip for easy opening</li>
<li>Available in custom sizes to fit your product exactly</li>
</ul>`,
    imageUrl: `${BASE}/custom-mailer-boxes-wholesale.webp`,
    images: [`${BASE}/custom-mailer-boxes-wholesale.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Printed Mailer Boxes | E-Commerce Shipping Packaging",
    metaDescription: "Custom mailer boxes with full-color inside/outside printing for e-commerce brands. Low MOQ from 100 units.",
    focusKeyword: "custom printed mailer boxes",
    minOrder: 100,
  },
  {
    name: "Kraft Mailer Boxes",
    slug: "kraft-mailer-boxes",
    catSlug: "mailer-boxes",
    shortDescription: "Eco-friendly kraft mailer boxes for sustainable brands. Natural brown finish with custom printing.",
    description: `<h2>Eco-Friendly Kraft Mailer Boxes</h2>
<p>Our kraft mailer boxes are the sustainable choice for eco-conscious brands. Made from 100% recycled brown kraft board, these boxes deliver the natural, earthy aesthetic your brand values while providing the same structural protection as standard corrugated mailers.</p>`,
    imageUrl: `${BASE}/kraft-mailer-boxes-wholesale.webp`,
    images: [`${BASE}/kraft-mailer-boxes-wholesale.webp`],
    isFeatured: false,
    sortOrder: 2,
    metaTitle: "Kraft Mailer Boxes | Eco-Friendly Shipping Boxes Wholesale",
    metaDescription: "Custom kraft mailer boxes made from recycled board. Sustainable packaging with full-color printing.",
    focusKeyword: "kraft mailer boxes",
    minOrder: 100,
  },
  // Cosmetic Boxes
  {
    name: "Custom Skincare Serum Boxes",
    slug: "custom-skincare-serum-boxes",
    catSlug: "cosmetic-boxes",
    shortDescription: "Luxury skincare and serum packaging boxes with premium lamination, foil stamping, and spot UV finishes.",
    description: `<h2>Custom Skincare & Serum Packaging Boxes</h2>
<p>Premium skincare packaging that reflects the quality of your product. Our custom serum boxes are printed on high-grade SBS board with luxury finishing options that create a premium unboxing experience for your customers.</p>
<h3>Available Finishes</h3>
<ul>
<li>Soft-touch matte lamination</li>
<li>Gold and silver foil stamping</li>
<li>Spot UV coating for dramatic visual contrast</li>
<li>Embossing and debossing for texture</li>
<li>Pearlescent and satin finishes</li>
</ul>`,
    imageUrl: `${BASE}/custom-cosmetic-boxes-wholesale.webp`,
    images: [`${BASE}/custom-cosmetic-boxes-wholesale.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Skincare Serum Boxes | Luxury Cosmetic Packaging USA",
    metaDescription: "Premium skincare and serum packaging with foil, soft-touch, and spot UV finishes. Free design support.",
    focusKeyword: "custom skincare serum boxes",
    minOrder: 100,
  },
  {
    name: "Custom Lipstick & Makeup Boxes",
    slug: "custom-lipstick-makeup-boxes",
    catSlug: "cosmetic-boxes",
    shortDescription: "Custom cosmetic boxes for lipstick, eyeshadow, and makeup products. Premium finishes and precise sizing.",
    description: `<h2>Custom Lipstick & Makeup Packaging</h2>
<p>Stand out on beauty counters with our custom makeup packaging. Designed for lipstick, foundation, eyeshadow palettes, and more — our cosmetic boxes combine precision sizing with luxury printing to elevate your brand's shelf presence.</p>`,
    imageUrl: `${BASE}/custom-lipstick-boxes-wholesale.webp`,
    images: [`${BASE}/custom-lipstick-boxes-wholesale.webp`],
    isFeatured: false,
    sortOrder: 2,
    metaTitle: "Custom Lipstick & Makeup Boxes | Cosmetic Packaging Wholesale",
    metaDescription: "Custom lipstick and makeup packaging boxes with premium finishes for beauty brands.",
    focusKeyword: "custom lipstick makeup boxes",
    minOrder: 100,
  },
  // Kraft Boxes
  {
    name: "Custom Kraft Product Boxes",
    slug: "custom-kraft-product-boxes",
    catSlug: "kraft-boxes",
    shortDescription: "Natural eco-friendly kraft product boxes for sustainable brands. 100% recycled board with custom printing.",
    description: `<h2>Custom Kraft Product Boxes</h2>
<p>Our custom kraft boxes are crafted from 100% recycled natural brown board, perfect for brands that want to communicate sustainability and natural values. Despite the raw aesthetic, these boxes are fully printable with vibrant colors using eco-soy inks.</p>`,
    imageUrl: `${BASE}/custom-kraft-boxes-wholesale.webp`,
    images: [`${BASE}/custom-kraft-boxes-wholesale.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Kraft Product Boxes | Eco-Friendly Packaging USA",
    metaDescription: "Custom kraft boxes from recycled board. Sustainable, eco-friendly packaging with full-color printing.",
    focusKeyword: "custom kraft product boxes",
    minOrder: 100,
  },
  // Rigid Boxes
  {
    name: "Custom Luxury Rigid Gift Boxes",
    slug: "custom-luxury-rigid-gift-boxes",
    catSlug: "rigid-boxes",
    shortDescription: "Premium rigid setup gift boxes with magnetic closures. Perfect for jewelry, electronics, and luxury retail brands.",
    description: `<h2>Custom Luxury Rigid Gift Boxes</h2>
<p>Make the ultimate brand impression with our custom rigid gift boxes. Built from 2mm heavyweight chipboard wrapped in premium paper, these setup boxes deliver an unboxing experience that matches the quality of the product inside.</p>
<h3>Rigid Box Features</h3>
<ul>
<li>2mm chipboard core for maximum rigidity</li>
<li>Premium paper wrap in any color or finish</li>
<li>Magnetic closure options</li>
<li>Custom foam and velvet inserts available</li>
<li>Lid-and-base or book-style configurations</li>
</ul>`,
    imageUrl: `${BASE2}/custom-rigid-boxes-wholesale.webp`,
    images: [`${BASE2}/custom-rigid-boxes-wholesale.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Luxury Rigid Gift Boxes | Premium Gift Packaging USA",
    metaDescription: "Premium rigid gift boxes with magnetic closures for luxury brands. Custom sizes, finishes, and inserts.",
    focusKeyword: "custom luxury rigid gift boxes",
    minOrder: 100,
  },
  // Magnetic Closure Boxes
  {
    name: "Printed Magnetic Closure Boxes",
    slug: "printed-magnetic-closure-boxes",
    catSlug: "magnetic-closure-boxes",
    shortDescription: "Premium magnetic closure gift boxes with full-color printing inside and out. Ideal for luxury retail and gift packaging.",
    description: `<h2>Custom Printed Magnetic Closure Boxes</h2>
<p>Our custom magnetic closure boxes are the gold standard in luxury gift packaging. The satisfying snap of the magnetic closure communicates premium quality the moment your customer picks up the box. Fully customizable in any size, color, and finish.</p>`,
    imageUrl: `${BASE2}/printed-magnetic-closure-boxes-bulk.webp`,
    images: [`${BASE2}/printed-magnetic-closure-boxes-bulk.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Printed Magnetic Closure Boxes | Luxury Gift Box Packaging",
    metaDescription: "Custom magnetic closure gift boxes with full-color printing. Premium luxury packaging for retail brands.",
    focusKeyword: "printed magnetic closure boxes",
    minOrder: 100,
  },
  // Chocolate Boxes
  {
    name: "Custom Luxury Chocolate Boxes",
    slug: "luxury-chocolate-boxes",
    catSlug: "chocolate-boxes",
    shortDescription: "Premium custom chocolate packaging with velvet inserts and window lid. Perfect for truffles, pralines, and gift chocolates.",
    description: `<h2>Custom Luxury Chocolate & Confectionery Boxes</h2>
<p>Elevate your chocolate brand with our premium custom chocolate boxes. Whether you're packaging truffles, pralines, or gift chocolates, our packaging combines structural protection with luxurious presentation that commands premium retail prices.</p>`,
    imageUrl: `${BASE}/custom-chocolate-boxes-wholesale.webp`,
    images: [`${BASE}/custom-chocolate-boxes-wholesale.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Luxury Chocolate Boxes | Confectionery Gift Packaging",
    metaDescription: "Premium custom chocolate boxes with inserts and window. Perfect for truffles and luxury confectionery brands.",
    focusKeyword: "custom luxury chocolate boxes",
    minOrder: 100,
  },
  // Candle Boxes
  {
    name: "Custom Printed Candle Boxes",
    slug: "custom-printed-candle-boxes",
    catSlug: "candle-boxes",
    shortDescription: "Stunning custom candle boxes with window and insert. Protect your candles and boost brand recognition on the shelf.",
    description: `<h2>Custom Candle Packaging Boxes</h2>
<p>Our custom candle boxes are designed specifically for jar candles, pillar candles, and taper sets. The structural design includes a custom-fit insert to prevent movement during shipping, while the printed outer box showcases your brand with professional finishes.</p>`,
    imageUrl: `${BASE}/custom-candle-boxes-wholesale.webp`,
    images: [`${BASE}/custom-candle-boxes-wholesale.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Printed Candle Boxes | Candle Packaging Wholesale USA",
    metaDescription: "Custom candle packaging boxes with inserts and premium finishes. Low MOQ from 100 units.",
    focusKeyword: "custom printed candle boxes",
    minOrder: 100,
  },
  // Food Boxes
  {
    name: "Custom Food Safe Packaging Boxes",
    slug: "custom-food-safe-packaging-boxes",
    catSlug: "food-boxes",
    shortDescription: "FDA-compliant custom food packaging for restaurants, brands, and food businesses. Grease and moisture resistant.",
    description: `<h2>Custom Food-Safe Packaging Boxes</h2>
<p>Our FDA-compliant food packaging boxes are designed for direct food contact. Whether you're packaging snacks, supplements, or gourmet products, our food-safe boxes provide both protection and impressive brand presentation.</p>`,
    imageUrl: `${BASE}/custom-food-boxes-wholesale.webp`,
    images: [`${BASE}/custom-food-boxes-wholesale.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Food Safe Packaging Boxes | FDA Compliant Food Packaging",
    metaDescription: "FDA-compliant custom food packaging boxes with full-color printing. Grease resistant and food safe.",
    focusKeyword: "custom food safe packaging boxes",
    minOrder: 100,
  },
  // Apparel Boxes
  {
    name: "Custom Apparel & Clothing Boxes",
    slug: "custom-apparel-clothing-boxes",
    catSlug: "apparel-boxes",
    shortDescription: "Premium custom clothing and apparel boxes for fashion brands. Sturdy construction with premium finishes.",
    description: `<h2>Custom Apparel & Fashion Packaging Boxes</h2>
<p>Deliver your clothing and fashion products in packaging that reflects your brand's quality. Our custom apparel boxes are built from sturdy corrugated or rigid board, fully printable with your brand colors, patterns, and messaging.</p>`,
    imageUrl: `${BASE2}/custom-apparel-boxes-wholesale.webp`,
    images: [`${BASE2}/custom-apparel-boxes-wholesale.webp`],
    isFeatured: true,
    sortOrder: 1,
    metaTitle: "Custom Apparel Boxes | Clothing Packaging Boxes USA",
    metaDescription: "Custom apparel and clothing boxes for fashion brands. Premium finishes and low MOQ from 100 units.",
    focusKeyword: "custom apparel clothing boxes",
    minOrder: 100,
  },
];

async function main() {
  console.log("Seeding categories...");

  // Insert categories and collect the returned rows
  const insertedCats = await db
    .insert(categoriesTable)
    .values(categories)
    .onConflictDoNothing()
    .returning();

  console.log(`Inserted ${insertedCats.length} categories.`);

  // Fetch all categories to build slug→id map
  const { sql } = await import("drizzle-orm");
  const allCats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(allCats.map(c => [c.slug, c.id]));

  console.log("Seeding products...");

  const products = productData
    .map(({ catSlug, ...rest }) => ({
      ...rest,
      categoryId: catMap[catSlug] ?? null,
    }))
    .filter(p => p.categoryId !== null);

  const insertedProds = await db
    .insert(productsTable)
    .values(products)
    .onConflictDoNothing()
    .returning();

  console.log(`Inserted ${insertedProds.length} products.`);
  console.log("Seeding complete!");
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
