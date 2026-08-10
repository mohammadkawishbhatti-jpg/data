# Prime Packaging Boxes — Database Schema
> Auto-exported: July 30, 2026  
> Database: PostgreSQL (Replit managed)  
> ORM: Drizzle ORM (`lib/db/src/schema/index.ts`)

---

## Tables

### `customers`
Portal login accounts for customers.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | integer | NO | auto-increment | Primary Key |
| customer_number | text | YES | — | Unique, e.g. `CUST-123456` |
| username | text | YES | — | Unique, used for portal login |
| name | text | NO | — | Full name |
| email | text | NO | — | Unique |
| phone | text | YES | — | |
| company | text | YES | — | |
| notes | text | YES | — | Admin notes |
| password_hash | text | YES | — | SHA-256 hashed with salt |
| portal_password | text | YES | — | Plain password (auto-generated accounts only) |
| status | text | NO | `active` | |
| created_at | timestamp | NO | now() | |
| updated_at | timestamp | NO | now() | |

---

### `orders`
Customer orders — created manually or auto-created from invoices.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | integer | NO | auto-increment | Primary Key |
| order_number | text | YES | — | e.g. `ORD-20260730-1234` |
| customer_id | integer | YES | — | FK → customers.id |
| customer_email | text | YES | — | |
| customer_name | text | YES | — | |
| currency | text | YES | `USD` | |
| status | text | NO | `confirmed` | confirmed / processing / production / quality_check / shipped / delivered / cancelled |
| items | json | YES | `[]` | Array of line items |
| subtotal | text | YES | — | |
| tax | text | YES | — | |
| total | text | YES | — | |
| tracking_number | text | YES | — | |
| estimated_delivery | text | YES | — | |
| notes | text | YES | — | |
| created_at | timestamp | NO | now() | |
| updated_at | timestamp | NO | now() | |

---

### `invoices`
Invoices built in the Invoice Builder.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | integer | NO | auto-increment | Primary Key |
| invoice_number | text | YES | — | e.g. `INV-20260730-1234` |
| order_id | integer | YES | — | FK → orders.id |
| customer_id | integer | YES | — | FK → customers.id |
| customer_email | text | YES | — | |
| customer_name | text | YES | — | |
| customer_company | text | YES | — | |
| customer_phone | text | YES | — | |
| customer_country | text | YES | — | |
| exec_name | text | YES | — | Sales exec name |
| exec_title | text | YES | — | |
| exec_phone | text | YES | — | |
| exec_email | text | YES | — | |
| currency | text | YES | `USD` | |
| subtotal | text | YES | `0` | |
| tax | text | YES | `0` | |
| items | json | YES | `[]` | Line items array |
| total | text | YES | `0` | |
| price_includes | text | YES | — | Footer info |
| production_time | text | YES | — | Footer info |
| delivery | text | YES | — | Footer info |
| notes_text | text | YES | — | Project notes + payment notes |
| payment_terms | text | YES | — | e.g. Net 30 |
| status | text | NO | `draft` | draft / sent |
| due_date | timestamp | YES | — | |
| sent_at | timestamp | YES | — | When email was sent |
| created_at | timestamp | NO | now() | |
| updated_at | timestamp | NO | now() | |

---

### `quotes`
Quote requests from website form or Clark AI chat.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | integer | NO | auto-increment | Primary Key |
| name | text | NO | — | Customer name |
| email | text | NO | — | |
| phone | text | YES | — | |
| company | text | YES | — | |
| product_type | text | YES | — | |
| quantity | text | YES | — | |
| dimensions | text | YES | — | |
| material | text | YES | — | |
| printing_details | text | YES | — | |
| additional_notes | text | YES | — | |
| status | text | NO | `new` | new / reviewing / quoted / accepted / rejected / closed |
| source | text | YES | `form` | `form` or `clark` |
| clark_session_id | text | YES | — | Clark chat dedup |
| clark_transcript | text | YES | — | Full JSON messages |
| clark_last_activity | timestamp | YES | — | |
| admin_pending_message | text | YES | — | Admin message to inject |
| admin_took_over | boolean | YES | `false` | Pause AI |
| clark_ip | text | YES | — | Visitor IP |
| clark_country | text | YES | — | Resolved country |
| clark_city | text | YES | — | Resolved city |
| notes | text | YES | — | Admin notes |
| follow_up_done | boolean | NO | `false` | |
| follow_up_date | timestamp | YES | — | |
| follow_up_notes | text | YES | — | |
| created_at | timestamp | NO | now() | |

---

### `admin_users`
Admin panel login accounts.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | integer | NO | auto-increment | Primary Key |
| username | text | NO | — | Unique |
| email | text | YES | — | |
| role | text | NO | `admin` | |
| password_hash | text | NO | — | |
| totp_secret | text | YES | — | 2FA secret |
| totp_enabled | boolean | NO | `false` | |
| created_at | timestamp | NO | now() | |

---

### `banners`
Homepage promotional banners.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| title | text | NO | — |
| subtitle | text | YES | — |
| image_url | text | YES | — |
| link | text | YES | — |
| is_active | boolean | NO | `true` |
| sort_order | integer | NO | `0` |
| created_at | timestamp | NO | now() |

---

### `categories`
Product categories.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| name | text | NO | — |
| slug | text | NO | — |
| description | text | YES | — |
| image_url | text | YES | — |
| is_active | boolean | NO | `true` |
| sort_order | integer | NO | `0` |
| meta_title | text | YES | — |
| meta_description | text | YES | — |
| created_at | timestamp | NO | now() |
| updated_at | timestamp | NO | now() |

---

### `products`
Packaging products.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| category_id | integer | YES | FK → categories.id |
| name | text | NO | — |
| slug | text | NO | — |
| description | text | YES | — |
| short_description | text | YES | — |
| image_url | text | YES | — |
| gallery | json | YES | `[]` |
| materials | json | YES | `[]` |
| sizes | json | YES | `[]` |
| is_active | boolean | NO | `true` |
| is_featured | boolean | NO | `false` |
| sort_order | integer | NO | `0` |
| meta_title | text | YES | — |
| meta_description | text | YES | — |
| created_at | timestamp | NO | now() |
| updated_at | timestamp | NO | now() |

---

### `pages`
CMS pages for the website.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| slug | text | NO | Unique |
| title | text | NO | — |
| content | json | YES | — |
| meta_title | text | YES | — |
| meta_description | text | YES | — |
| is_published | boolean | NO | `true` |
| created_at | timestamp | NO | now() |
| updated_at | timestamp | NO | now() |

---

### `blog_posts`
Blog / news articles.

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| title | text | NO | — |
| slug | text | NO | Unique |
| excerpt | text | YES | — |
| content | text | YES | — |
| image_url | text | YES | — |
| author | text | YES | — |
| status | text | NO | `draft` |
| meta_title | text | YES | — |
| meta_description | text | YES | — |
| created_at | timestamp | NO | now() |
| updated_at | timestamp | NO | now() |

---

### `site_settings`
Global site configuration (single row).

| Column | Type | Notes |
|--------|------|-------|
| id | integer | Primary Key |
| site_name | text | |
| site_description | text | |
| logo_url | text | |
| email / phone / address | text | Contact info |
| smtp_host / smtp_port / smtp_user / smtp_pass / smtp_from / smtp_to / smtp_secure | text/int | Email settings |
| clark_enabled | text | `'true'` / `'false'` |
| clark_bot_name | text | Default: `Clark` |
| clark_greeting / clark_tone_notes / clark_custom_faqs | text | AI chat settings |
| country_block_enabled | text | |
| blocked_countries | text | Comma-separated |
| gemini_api_key | text | AI key |
| header_code / footer_code | text | Inject scripts |

---

### `leads`
Lead captures from site forms.

---

### `page_templates`
Saved design templates for the page builder.

---

## Relationships

```
customers ──< orders
customers ──< invoices
orders    ──< invoices  (order_id FK)
categories ──< products
quotes (standalone — matched to customers by email)
```

---

## Drizzle Schema File
`lib/db/src/schema/index.ts`

## Apply Schema Changes
```bash
pnpm --filter @workspace/db run push
```

## Connect to DB (dev)
```bash
psql "$DATABASE_URL"
```
