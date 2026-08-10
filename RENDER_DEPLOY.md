# Render.com Free Deployment Guide

## Steps

1. **Render.com account banao**: https://render.com (GitHub se login karo)

2. **New → Blueprint** click karo

3. **GitHub repo connect karo**: `mohammadkawishbhatti-jpg/prime-packaging-boxes`

4. **render.yaml detect ho jaye ga** — sab settings auto-fill hon gi

5. **"Apply" click karo** — Render:
   - PostgreSQL database banaye ga (free)
   - Build kare ga (prime-site + admin-panel + api-server)
   - Deploy kare ga

6. **5-10 minutes wait karo** → آپ کو URL mile ga jaise:
   `https://prime-packaging-boxes.onrender.com`

## URLs after deploy

| Page | URL |
|------|-----|
| Main site | `https://prime-packaging-boxes.onrender.com/` |
| Admin panel | `https://prime-packaging-boxes.onrender.com/admin/` |
| Sitemap | `https://prime-packaging-boxes.onrender.com/sitemap.xml` |
| API | `https://prime-packaging-boxes.onrender.com/api/` |

## Environment Variables (Render auto-set karta hai)

- `DATABASE_URL` — Render ki free PostgreSQL se auto-link
- `SESSION_SECRET` — auto-generate
- `NODE_ENV` — production
- `PORT` — 10000

## Note: Free tier limitations
- Server 15 min baad **sleep** ho jata hai agar koi visit na kare
- First request slow hogi (cold start ~30 sec)
- Free PostgreSQL 90 din ke baad expire hoti hai (then $7/month)
