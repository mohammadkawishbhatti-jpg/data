import { pgTable, text, integer, boolean, timestamp, json, serial, index } from "drizzle-orm/pg-core";

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("idx_categories_is_active").on(t.isActive),
  index("idx_categories_sort_order").on(t.sortOrder),
]);

// ── Products ──────────────────────────────────────────────────────────────────
export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  imageUrl: text("image_url"),
  images: json("images").$type<string[]>().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  minOrder: integer("min_order").default(100),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  sortOrder: integer("sort_order").notNull().default(0),
  regularPrice: text("regular_price"),
  salePrice: text("sale_price"),
  sku: text("sku"),
  weight: text("weight"),
  boxLength: text("box_length"),
  boxWidth: text("box_width"),
  boxHeight: text("box_height"),
  focusKeyword: text("focus_keyword"),
  tags: text("tags"),
  attributes: json("attributes").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("idx_products_is_active").on(t.isActive),
  index("idx_products_category_id").on(t.categoryId),
  index("idx_products_is_featured").on(t.isFeatured),
  index("idx_products_sort_order").on(t.sortOrder),
  index("idx_products_active_category").on(t.isActive, t.categoryId),
]);

// ── Blog Posts ────────────────────────────────────────────────────────────────
export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  imageUrl: text("image_url"),
  author: text("author"),
  status: text("status").notNull().default("draft"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("idx_blog_posts_status").on(t.status),
  index("idx_blog_posts_created_at").on(t.createdAt),
]);

// ── Leads (contact form) ──────────────────────────────────────────────────────
export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  followUpDone: boolean("follow_up_done").notNull().default(false),
  followUpDate: timestamp("follow_up_date"),
  followUpNotes: text("follow_up_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Pages ─────────────────────────────────────────────────────────────────────
export const pagesTable = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Page Templates ────────────────────────────────────────────────────────────
export const pageTemplatesTable = pgTable("page_templates", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().unique(),
  name: text("name").notNull(),
  content: text("content"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Leads (contact form) ──────────────────────────────────────────────────────
// (index on createdAt for admin sorting)

// ── Quotes ────────────────────────────────────────────────────────────────────
export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  productType: text("product_type"),
  quantity: text("quantity"),
  dimensions: text("dimensions"),
  material: text("material"),
  printingDetails: text("printing_details"),
  additionalNotes: text("additional_notes"),
  status: text("status").notNull().default("new"),
  source: text("source").default("form"),          // "form" | "clark"
  clarkSessionId: text("clark_session_id"),         // dedup Clark sessions
  clarkTranscript: text("clark_transcript"),        // full JSON messages array
  clarkLastActivity: timestamp("clark_last_activity"), // updated on every chat msg
  adminPendingMessage: text("admin_pending_message"),  // admin message to inject next
  adminTookOver: boolean("admin_took_over").default(false), // pause AI, show holding msg
  clarkIp: text("clark_ip"),                           // visitor IP at chat start
  clarkCountry: text("clark_country"),                 // resolved country name
  clarkCity: text("clark_city"),                       // resolved city
  notes: text("notes"),
  followUpDone: boolean("follow_up_done").notNull().default(false),
  followUpDate: timestamp("follow_up_date"),
  followUpNotes: text("follow_up_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Banners ───────────────────────────────────────────────────────────────────
export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  link: text("link"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Site Settings ─────────────────────────────────────────────────────────────
export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name"),
  siteDescription: text("site_description"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  robotsTxt: text("robots_txt"),
  sitemapSettings: text("sitemap_settings"),
  headerCode: text("header_code"),
  footerCode: text("footer_code"),
  adminEmail: text("admin_email"),
  smtpSettings: text("smtp_settings"),   // legacy — kept for compat
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port"),
  smtpUser: text("smtp_user"),
  smtpPass: text("smtp_pass"),
  smtpFrom: text("smtp_from"),
  smtpTo: text("smtp_to"),
  smtpSecure: text("smtp_secure").default("false"),
  // Secondary / fallback SMTP (e.g. cPanel webmail)
  smtp2Host: text("smtp2_host"),
  smtp2Port: integer("smtp2_port"),
  smtp2User: text("smtp2_user"),
  smtp2Pass: text("smtp2_pass"),
  smtp2From: text("smtp2_from"),
  smtp2Secure: text("smtp2_secure").default("false"),
  countryBlockEnabled: text("country_block_enabled").default("false"),
  blockedCountries: text("blocked_countries"),
  geminiApiKey: text("gemini_api_key"),
  // Clark AI chatbot config
  clarkEnabled: text("clark_enabled").default("true"),
  clarkBotName: text("clark_bot_name").default("Clark"),
  clarkGreeting: text("clark_greeting"),
  clarkCompanyPhone: text("clark_company_phone"),
  clarkCompanyEmail: text("clark_company_email"),
  clarkCompanyAddress: text("clark_company_address"),
  clarkToneNotes: text("clark_tone_notes"),
  clarkQuoteHours: text("clark_quote_hours").default("2"),
  clarkCustomFaqs: text("clark_custom_faqs"),   // JSON: [{q,a}]
  // Contact & social
  whatsapp: text("whatsapp"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  twitter: text("twitter"),
  linkedin: text("linkedin"),
  // Global SEO defaults
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  // Announcement bar
  announcementBar: text("announcement_bar"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Customers (portal) ────────────────────────────────────────────────────────
export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerNumber: text("customer_number").unique(),
  username: text("username").unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  company: text("company"),
  notes: text("notes"),
  passwordHash: text("password_hash"),
  portalPassword: text("portal_password"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number"),
  customerId: integer("customer_id").references(() => customersTable.id),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  status: text("status").notNull().default("confirmed"),
  items: json("items").$type<any[]>().default([]),
  subtotal: text("subtotal"),
  tax: text("tax"),
  total: text("total"),
  currency: text("currency").default("USD"),
  trackingNumber: text("tracking_number"),
  estimatedDelivery: text("estimated_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Invoices ──────────────────────────────────────────────────────────────────
export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => ordersTable.id),
  customerId: integer("customer_id").references(() => customersTable.id),
  invoiceNumber: text("invoice_number"),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  customerCompany: text("customer_company"),
  customerPhone: text("customer_phone"),
  customerCountry: text("customer_country"),
  execName: text("exec_name"),
  execTitle: text("exec_title"),
  execPhone: text("exec_phone"),
  execEmail: text("exec_email"),
  currency: text("currency").default("USD"),
  subtotal: text("subtotal").default("0"),
  tax: text("tax").default("0"),
  items: json("items").$type<any[]>().default([]),
  total: text("total").default("0"),
  priceIncludes: text("price_includes"),
  productionTime: text("production_time"),
  delivery: text("delivery"),
  notesText: text("notes_text"),
  paymentTerms: text("payment_terms"),
  status: text("status").notNull().default("draft"),
  dueDate: timestamp("due_date"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Admin Users ───────────────────────────────────────────────────────────────
export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  role: text("role").notNull().default("admin"),
  passwordHash: text("password_hash").notNull(),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
