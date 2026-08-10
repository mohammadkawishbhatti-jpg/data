# cPanel Deployment Guide — Prime Packaging Boxes

## Overview

Yeh project ek **Node.js monorepo** hai. cPanel pe deploy karne ke liye ek hi Node.js app chalti hai  
(`artifacts/api-server`) jo sab kuch serve karti hai:

| URL | Kya serve hoga |
|-----|---------------|
| `primepackagingboxes.com/` | Main website (React) |
| `primepackagingboxes.com/admin/` | Admin panel (React) |
| `primepackagingboxes.com/customer-portal/` | Customer portal (React) |
| `primepackagingboxes.com/api/` | REST API |
| `primepackagingboxes.com/sitemap.xml` | SEO sitemap |

---

## Method 1 — GitHub Actions (Recommended) 🚀

Har `main` branch push pe **automatically deploy** hota hai.

### Step 1 — GitHub Secrets Set Karo

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|------------|-------|
| `CPANEL_HOST` | `primepackagingboxes.com` |
| `CPANEL_USERNAME` | cPanel username (e.g. `primepkg`) |
| `CPANEL_PASSWORD` | cPanel password |
| `APP_DIR` | `/home/primepkg/prime-packaging-boxes` |

### Step 2 — cPanel pe SSH Enable Karo

cPanel → **Security → SSH Access** → Enable SSH

### Step 3 — cPanel pe Repo Clone Karo (pehli baar)

cPanel → **Terminal** ya SSH:

```bash
cd ~
git clone https://github.com/mohammadkawishbhatti-jpg/prime-packaging-boxes.git
cd prime-packaging-boxes

# pnpm install (agar nahi hai)
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# .env file banao (zaroor zaroor)
cp .env.example .env   # ya manual banao
nano .env
```

### Step 4 — `.env` File Setup

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/prime_packaging
SESSION_SECRET=your-super-secret-key-64-chars-min
```

### Step 5 — cPanel Node.js App Manager Setup

cPanel → **Software → Setup Node.js App** → Create Application:

| Field | Value |
|-------|-------|
| Node.js version | 20.x |
| Application mode | Production |
| Application root | `prime-packaging-boxes/artifacts/api-server` |
| Application URL | `primepackagingboxes.com` |
| Application startup file | `dist/index.mjs` |
| Environment variables | `PORT=3001`, `NODE_ENV=production` |

**Important:** Environment variables `DATABASE_URL` aur `SESSION_SECRET` bhi add karo.

### Step 6 — Pehli Deploy

```bash
# cPanel Terminal mein
cd ~/prime-packaging-boxes

# Dependencies install
pnpm install --frozen-lockfile

# Sab kuch build karo
PORT=3001 BASE_PATH=/ pnpm --filter @workspace/prime-site run build
PORT=3001 BASE_PATH=/admin/ pnpm --filter @workspace/admin-panel run build
PORT=3001 BASE_PATH=/customer-portal/ pnpm --filter @workspace/customer-portal run build
pnpm --filter @workspace/api-server run build

# DB schema push
pnpm --filter @workspace/db run push

# App restart (cPanel App Manager se ya PM2 se)
touch tmp/restart.txt   # cPanel App Manager
# ya:
pm2 start ecosystem.config.cjs
```

Ab se jab bhi `git push origin main` karo — **GitHub Actions automatically deploy kar dega**.

---

## Method 2 — cPanel Git Version Control (Alternative)

cPanel → **Files → Git Version Control** → Create

| Field | Value |
|-------|-------|
| Clone URL | `https://github.com/mohammadkawishbhatti-jpg/prime-packaging-boxes.git` |
| Repository path | `/home/username/prime-packaging-boxes` |
| Branch | `main` |

`.cpanel.yml` file already hai repo mein — cPanel use automatic chalayega.

**Note:** `.cpanel.yml` mein `{YOUR_CPANEL_USERNAME}` apne username se replace karo.

---

## Method 3 — Manual Deploy (PM2)

PM2 zyada reliable hai cPanel App Manager se:

```bash
# PM2 install
npm install -g pm2

# App start
cd ~/prime-packaging-boxes
pm2 start ecosystem.config.cjs

# Auto-start on server reboot
pm2 save
pm2 startup   # command copy karo aur run karo
```

---

## PostgreSQL Setup (cPanel)

1. cPanel → **Databases → PostgreSQL Databases**
2. Database create karo: `prime_packaging`
3. User create karo aur database se link karo
4. `.env` mein `DATABASE_URL` update karo:
   ```
   DATABASE_URL=postgresql://cpanel_user:password@localhost:5432/cpanel_user_prime_packaging
   ```

---

## Uploads Folder

User-uploaded files `uploads/` folder mein hain. Pehli deploy pe:

```bash
# Replit se uploads download karo aur cPanel pe upload karo
scp -r uploads/ username@primepackagingboxes.com:~/prime-packaging-boxes/
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 500 Error | cPanel error logs check karo: `~/logs/` |
| DB connect fail | `DATABASE_URL` check karo `.env` mein |
| App nahi chalta | PM2 logs: `pm2 logs prime-packaging` |
| Static files 404 | Build run hua? `dist/public/` exists? |
| Session error | `SESSION_SECRET` `.env` mein set hai? |

```bash
# PM2 logs dekhne ke liye
pm2 logs prime-packaging --lines 50

# App restart
pm2 restart prime-packaging
```

---

## GitHub Actions Secrets Quick Reference

```
CPANEL_HOST     → primepackagingboxes.com
CPANEL_USERNAME → your-cpanel-username
CPANEL_PASSWORD → your-cpanel-password
APP_DIR         → /home/your-username/prime-packaging-boxes
```
