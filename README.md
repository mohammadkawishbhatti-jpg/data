# Prime Packaging Boxes — Monorepo

Full-stack packaging e-commerce platform with admin panel, customer portal, Clark AI chatbot, and a dynamic public website.

---

## 📦 Project Structure

```
prime-packaging-boxes/
├── artifacts/
│   ├── api-server/          ← Express.js API (Node.js, runs on cPanel)
│   ├── prime-site/          ← Public website (React + Vite, built to dist/)
│   ├── admin-panel/         ← Admin dashboard (React + Vite, built to dist/)
│   └── customer-portal/     ← Customer portal (React + Vite, built to dist/)
├── lib/
│   ├── db/                  ← Drizzle ORM schema (shared)
│   ├── api-client-react/    ← Generated React Query hooks
│   └── api-zod/             ← Generated Zod validators
├── scripts/
│   └── sync-db-to-setup.mjs ← ⭐ IMPORTANT: Run this when you update DB data
├── .env.example             ← Required environment variables
├── cpanel-full-dump.sql     ← Full DB backup (schema + data)
└── .github/workflows/
    └── deploy.yml           ← Auto-deploy to cPanel on every git push
```

---

## 🚀 Quick Start (Replit Development)

The app is pre-configured. Just start the workflows:

- **API Server** → runs at port 3001
- **Prime Site** → public website
- **Admin Panel** → `/admin/`
- **Customer Portal** → `/customer-portal/`

### Environment Variables Required

Copy `.env.example` and fill in values:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SESSION_SECRET=your-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password
```

---

## 🌐 Production Deployment (cPanel / OrangeHost)

### Server Details
- **Host**: server215.orangehost.com
- **User**: ecofrie1
- **App Dir**: `/home/ecofrie1/prime-packaging-boxes`
- **DB**: `ecofrie1_primedb` / user: `ecofrie1_primeuser`
- **Node.js**: App Manager → startup: `dist/index.mjs`, PORT: 3001

### First-Time Setup on cPanel

```bash
# 1. SSH into cPanel
ssh ecofrie1@server215.orangehost.com

# 2. Clone the repo
git clone https://github.com/mohammadkawishbhatti-jpg/prime-packaging-boxes.git
cd prime-packaging-boxes

# 3. Create .env file
nano artifacts/api-server/.env
# Add: DATABASE_URL, SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD etc.

# 4. Install dependencies
pnpm install --frozen-lockfile

# 5. cPanel → Node.js App Manager → Create App
#    Root: prime-packaging-boxes/artifacts/api-server
#    Startup: dist/index.mjs
#    PORT: 3001

# 6. Restart app, then open in browser:
#    https://primepackagingboxes.com/api/db-setup?key=prime-setup-2024-kawish
#    This creates all 14 tables + seeds 38 categories + 65 products!
```

### Auto-Deploy (GitHub Actions)

Every `git push` to `main` triggers auto-deploy:
1. Builds all 4 apps on GitHub runner (no GLIBC issue)
2. SSHes into cPanel
3. Runs `git pull` (gets pre-built dist files)
4. Restarts Node.js app

**Required GitHub Secrets:**
```
CPANEL_HOST      = server215.orangehost.com
CPANEL_USERNAME  = ecofrie1
CPANEL_PASSWORD  = (cPanel password)
```

### Manual Deploy

```bash
# On your machine or Replit:
git add -A && git commit -m "update" && git push origin main

# On cPanel terminal:
cd ~/prime-packaging-boxes && git pull origin main
# Then: cPanel → Node.js App Manager → Restart
```

---

## ⭐ How to Sync Data from Replit → cPanel

**Whenever you add/edit products, categories, or settings in Replit, run:**

```bash
node scripts/sync-db-to-setup.mjs
```

This automatically:
1. Reads all categories + products + settings from Replit DB
2. Updates `artifacts/api-server/src/routes/db-setup.ts` with real data
3. Rebuilds the API server
4. Shows what changed

Then push and run db-setup on server:

```bash
git add -A
git commit -m "sync: update db seed with latest Replit data"
git push origin main

# On cPanel: git pull → restart app → open /api/db-setup URL
```

---

## 🗄️ Database Setup Endpoint

After deploying, visit this URL once to set up the database:

```
https://primepackagingboxes.com/api/db-setup?key=prime-setup-2024-kawish
```

**What it creates:**
- ✅ 14 tables (admin_users, session, categories, products, banners, blog_posts, leads, quotes, pages, page_templates, site_settings, customers, orders, invoices)
- ✅ 38 categories (seeded with images + meta)
- ✅ 65 products (with descriptions, images, SEO meta)
- ✅ Admin user (username/password from env vars)
- ✅ Site settings (Clark AI config, contact info)

> **Note:** This endpoint is idempotent — safe to run multiple times. Uses `ON CONFLICT DO NOTHING` / `ON CONFLICT DO UPDATE`.

---

## 🤖 Clark AI Chatbot

Clark is a Gemini-powered AI sales assistant integrated into the website.

**Configuration (Admin Panel → Settings → Clark AI):**
- Bot name, greeting message
- Company phone/email/address
- Tone notes, FAQ entries
- Quote turnaround hours
- Gemini API key

**DB Columns (quotes table):**
- `clark_session_id` — unique session per visitor
- `clark_transcript` — full conversation JSON
- `clark_last_activity` — last message timestamp
- `clark_ip/country/city` — visitor location

---

## 🔧 Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Express session secret (long random string) |
| `ADMIN_USERNAME` | ✅ | Admin login username |
| `ADMIN_PASSWORD` | ✅ | Admin login password |
| `PORT` | ✅ | Server port (3001 on cPanel) |
| `SMTP_HOST` | Optional | Email server for notifications |
| `SMTP_USER` | Optional | Email username |
| `SMTP_PASS` | Optional | Email password |

---

## 🛠️ Development Commands

```bash
# Install all dependencies
pnpm install

# Start all services (Replit manages this via workflows)
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/prime-site run dev
pnpm --filter @workspace/admin-panel run dev
pnpm --filter @workspace/customer-portal run dev

# Build for production
pnpm --filter @workspace/api-server run build
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/prime-site run build
PORT=3001 BASE_PATH=/admin/ pnpm --filter @workspace/admin-panel run build
PORT=3001 BASE_PATH=/customer-portal/ pnpm --filter @workspace/customer-portal run build

# Sync Replit DB data to cPanel seed
node scripts/sync-db-to-setup.mjs

# Push DB schema to Replit DB (dev only)
pnpm --filter @workspace/db push
```

---

## 🔒 Security Notes

- Admin panel at `/admin/` — protected by session auth
- Customer portal at `/customer-portal/` — protected by customer login
- CORS restricted to `primepackagingboxes.com` + Replit dev domains
- Rate limiting on `/api/admin/login` (10 attempts / 15 min)
- All uploads served at `/api/uploads/` (path traversal protected)
- DB setup endpoint protected by secret key (`DB_SETUP_KEY` env var)

---

## 📸 Uploading Product Images to cPanel

Product images live in `artifacts/api-server/uploads/`. To transfer from Replit to cPanel:

```bash
# From Replit terminal or locally:
scp -r artifacts/api-server/uploads/ ecofrie1@server215.orangehost.com:~/prime-packaging-boxes/artifacts/api-server/
```

Or use cPanel File Manager to upload images to:
`/home/ecofrie1/prime-packaging-boxes/artifacts/api-server/uploads/`

---

## 📋 Troubleshooting

### Site shows "Internal server error"
→ DB not connected. Check `DATABASE_URL` in `.env` file on server. Run `/api/db-setup` URL.

### Products/categories not loading
→ DB tables don't exist. Run `/api/db-setup?key=prime-setup-2024-kawish` once.

### Admin panel not loading
→ Check cPanel Node.js App Manager — app should be "started" (green). Restart it.

### Images not showing
→ Upload images from Replit `uploads/` folder to cPanel (see "Uploading Product Images" above).

### GLIBC error during build on server
→ Never build on cPanel server! All builds happen on GitHub Actions runner. Server just runs `git pull`.

### GitHub Actions deploy failing
→ Check GitHub repo → Actions → see error. Most common: wrong `CPANEL_PASSWORD` secret, or SSH not enabled on cPanel.

---

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `artifacts/api-server/src/routes/db-setup.ts` | One-click DB setup (run once on new server) |
| `artifacts/api-server/src/routes/admin.ts` | Admin API routes |
| `artifacts/api-server/src/routes/chat.ts` | Clark AI chatbot routes |
| `artifacts/api-server/src/routes/seo.ts` | robots.txt, sitemap redirect |
| `artifacts/api-server/src/routes/sitemap.ts` | Dynamic XML sitemap |
| `artifacts/api-server/src/app.ts` | Express app config, CORS, sessions |
| `lib/db/src/schema/index.ts` | Database schema (Drizzle ORM) |
| `scripts/sync-db-to-setup.mjs` | ⭐ Sync Replit data → cPanel seed |
| `.github/workflows/deploy.yml` | Auto-deploy to cPanel |
| `cpanel-full-dump.sql` | Full DB backup |

---

*Last updated: July 2026*
