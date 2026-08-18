import { pgTable, text, integer, boolean, timestamp, json, serial, index, uniqueIndex } from "drizzle-orm/pg-core";

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
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
  isShowcase: boolean("is_showcase").notNull().default(false),
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
  index("idx_products_is_showcase").on(t.isShowcase),
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
  scheduledAt: timestamp("scheduled_at"),
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
  referenceNumber: text("reference_number").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  source: text("source").notNull().default("form"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  referrer: text("referrer"),
  assignedTo: text("assigned_to"),
  followUpDone: boolean("follow_up_done").notNull().default(false),
  followUpDate: timestamp("follow_up_date"),
  followUpNotes: text("follow_up_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("idx_leads_status_created_at").on(t.status, t.createdAt),
  index("idx_leads_follow_up").on(t.followUpDone, t.followUpDate),
]);

// ── Pages ─────────────────────────────────────────────────────────────────────
export const pagesTable = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  isPublished: boolean("is_published").notNull().default(true),
  scheduledAt: timestamp("scheduled_at"),
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
  referenceNumber: text("reference_number").unique(),
  customerId: integer("customer_id").references(() => customersTable.id),
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
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  referrer: text("referrer"),
  assignedTo: text("assigned_to"),
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
}, (t) => [
  index("idx_quotes_status_created_at").on(t.status, t.createdAt),
  index("idx_quotes_follow_up").on(t.followUpDone, t.followUpDate),
  index("idx_quotes_customer_id").on(t.customerId),
]);

// ── Clark conversations ───────────────────────────────────────────────────────
// Stores every chat turn, including visitors who have not supplied an email yet.
export const clarkConversationsTable = pgTable("clark_conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  transcript: text("transcript").notNull(),
  ip: text("ip"),
  country: text("country"),
  city: text("city"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
}, (t) => [
  index("idx_clark_conversations_last_activity").on(t.lastActivity),
]);

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
  // Public Tawk.to browser widget configuration. Never store private Tawk API
  // credentials here; Tawk notifications and agent settings stay in Tawk.
  tawkEnabled: text("tawk_enabled").default("false"),
  tawkPropertyId: text("tawk_property_id"),
  tawkHandoffLabel: text("tawk_handoff_label").default("Talk to a real person"),
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
  // Public promotional popup configured from protected admin settings
  popupEnabled: text("popup_enabled").default("true"),
  popupBadge: text("popup_badge"),
  popupTitle: text("popup_title"),
  popupMessage: text("popup_message"),
  popupButtonText: text("popup_button_text"),
  popupButtonUrl: text("popup_button_url"),
  popupImageUrl: text("popup_image_url"),
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
  invitationTokenHash: text("invitation_token_hash"),
  invitationExpiresAt: timestamp("invitation_expires_at"),
  invitedAt: timestamp("invited_at"),
  activatedAt: timestamp("activated_at"),
  passwordResetTokenHash: text("password_reset_token_hash"),
  passwordResetExpiresAt: timestamp("password_reset_expires_at"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").unique(),
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
  invoiceNumber: text("invoice_number").unique(),
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

// ── Admin audit trail (automatically retained for seven days) ─────────────────
export const adminAuditLogsTable = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id"),
  actorId: text("actor_id"),
  username: text("username").notNull(),
  role: text("role").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  route: text("route").notNull(),
  summary: text("summary").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  integrityHash: text("integrity_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("idx_admin_audit_created_at").on(t.createdAt),
  index("idx_admin_audit_username_created_at").on(t.username, t.createdAt),
  index("idx_admin_audit_actor_created_at").on(t.actorId, t.createdAt),
]);

// ── CMS revision and approval history ─────────────────────────────────────────
// Revisions are append-only. Editor changes remain pending; Super Admin and
// Basic Admin changes are recorded as revisions and applied live immediately.
export const contentRevisionsTable = pgTable("content_revisions", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // page | blog | template
  entityId: integer("entity_id").notNull(),
  entityLabel: text("entity_label").notNull(),
  payload: json("payload").$type<Record<string, unknown>>().notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | published
  createdById: integer("created_by_id"),
  createdByUsername: text("created_by_username"),
  createdByRole: text("created_by_role"),
  approvedById: integer("approved_by_id"),
  approvedByUsername: text("approved_by_username"),
  approvedAt: timestamp("approved_at"),
  publishedAt: timestamp("published_at"),
  rejectionReason: text("rejection_reason"),
  previewToken: text("preview_token").notNull().unique(),
  previewExpiresAt: timestamp("preview_expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("idx_content_revisions_entity").on(t.entityType, t.entityId, t.createdAt),
  index("idx_content_revisions_status_created").on(t.status, t.createdAt),
]);

// ── Media-library metadata and generated variants ─────────────────────────────
export const mediaAssetsTable = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  originalName: text("original_name").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  variantUrls: json("variant_urls").$type<Record<string, unknown>>().default({}),
  createdById: integer("created_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("idx_media_assets_created_at").on(t.createdAt),
  index("idx_media_assets_mime_type").on(t.mimeType),
]);

// ── Audit retention configuration ─────────────────────────────────────────────
export const adminAuditSettingsTable = pgTable("admin_audit_settings", {
  id: serial("id").primaryKey(),
  retentionDays: integer("retention_days").notNull().default(30),
  sensitiveAlertEmail: text("sensitive_alert_email"),
  sensitiveAlertsEnabled: boolean("sensitive_alerts_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Operational monitoring events ─────────────────────────────────────────────
export const monitoringEventsTable = pgTable("monitoring_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // api_latency | mutation_failure | auth_spike | media_failure | frontend_error | email_failure
  severity: text("severity").notNull().default("info"),
  route: text("route"),
  method: text("method"),
  statusCode: integer("status_code"),
  durationMs: integer("duration_ms"),
  message: text("message"),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("idx_monitoring_events_type_created").on(t.eventType, t.createdAt),
  index("idx_monitoring_events_severity_created").on(t.severity, t.createdAt),
]);

// ── Security IP rules and login telemetry ────────────────────────────────────
export const securityIpRulesTable = pgTable("security_ip_rules", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  ruleType: text("rule_type").notNull().default("blacklist"),
  reason: text("reason"),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("uq_security_ip_rule").on(t.ipAddress, t.ruleType),
  index("idx_security_ip_active").on(t.active, t.ruleType),
]);

export const securityLoginAttemptsTable = pgTable("security_login_attempts", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  username: text("username"),
  success: boolean("success").notNull().default(false),
  captchaPassed: boolean("captcha_passed").notNull().default(false),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("idx_security_attempts_ip_time").on(t.ipAddress, t.createdAt),
  index("idx_security_attempts_username_time").on(t.username, t.createdAt),
]);

// ── Customer support tickets ─────────────────────────────────────────────────
export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customersTable.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("new"),
  priority: text("priority").notNull().default("normal"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("idx_support_tickets_status_updated_at").on(t.status, t.updatedAt),
  index("idx_support_tickets_email").on(t.email),
]);

export const supportTicketMessagesTable = pgTable("support_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => supportTicketsTable.id),
  senderType: text("sender_type").notNull().default("customer"),
  senderName: text("sender_name"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("idx_support_ticket_messages_ticket").on(t.ticketId, t.createdAt),
]);

// ── Admin-managed forms ──────────────────────────────────────────────────────
export const customFormsTable = pgTable("custom_forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  fields: json("fields").$type<Array<{ key: string; label: string; type: string; required?: boolean }>>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const formSubmissionsTable = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => customFormsTable.id),
  data: json("data").$type<Record<string, unknown>>().notNull().default({}),
  email: text("email"),
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("idx_form_submissions_form_created_at").on(t.formId, t.createdAt),
]);

export * from "./menus";
