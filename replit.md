# Prime Packaging Boxes

Custom packaging e-commerce site for USA brands — catalog, quote requests, admin CMS, and page builder.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## 🚀 New Server / Replit Setup

Run this **once** on every new deployment or Replit server to seed the database:

```bash
bash scripts/setup-db.sh
```

This installs deps, pushes the schema, seeds 38 categories + 65 products, and seeds all 10 page HTML content for the admin page builder.

If you only need to re-seed pages (e.g. after page content was cleared):

```bash
pnpm --filter @workspace/api-server exec tsx src/seed-pages.ts
```

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM (lib/db)
- Frontend: React + Vite + Tailwind (artifacts/prime-site)
- Admin: React + Vite (artifacts/admin-panel)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/prime-site/src/pages/` — all customer-facing pages (React components)
- `artifacts/admin-panel/src/pages/` — admin CMS pages
- `artifacts/api-server/src/` — Express routes, seed scripts
- `artifacts/api-server/uploads/` — all product & hero images (.webp)
- `lib/db/` — Drizzle schema + seed scripts
- `lib/db/seed.mjs` — full product + category seed (38 cats, 65 products)
- `artifacts/api-server/src/seed-pages.ts` — seeds HTML into all 10 pages (force-updates every run)

## Architecture decisions

- **SmartPage**: Each page checks DB for content; if `null`, renders a React fallback component.
- **Page builder**: Admin GrapesJS builder reads/writes JSON `{gjs:{html,css}}` stored in `pages.content`.
- **Images**: All product images served from `/api/uploads/` — 241 `.webp` files in `artifacts/api-server/uploads/`.
- **Scroll to top**: `ScrollToTop` component (wouter `useLocation`) mounted in `App.tsx` inside `<Router>`.

## User preferences

- **Auto-push to GitHub**: After every change, always `git add -A && git commit` and `git push origin main`. Never finish a task without pushing.

## Gotchas

- `seed-pages.ts` now **force-updates** all pages (removed skip-if-content check). Safe to run repeatedly.
- GitHub has a large file warning for `attached_assets/elementor-main_*.zip` (~55MB) — consider adding to `.gitignore`.
- Pre-existing TypeScript errors in `BlockRenderer.tsx` — cosmetic only, Vite HMR builds fine.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
