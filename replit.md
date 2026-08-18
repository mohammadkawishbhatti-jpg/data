# Prime Packaging Boxes

Production-ready packaging storefront with a public quote-only website, admin CMS, customer portal, PostgreSQL-backed catalog/CRM, and approval-controlled content editing.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Database and hosting model

- The app uses PostgreSQL through Drizzle ORM. The development database is
  persistent Replit-managed storage, not an offline file.
- When the app is published, Replit can create a separate production database.
  The publish flow can copy development data into production once; copying
  overwrites existing production data, so it must only be used when that data
  is safe for live traffic.
- Admin changes are written to whichever database the running app is using.
  The public website reads the same database for that environment. Development
  and production are intentionally isolated.
- GitHub tracks source code and documentation, not PostgreSQL rows, uploaded
  files, sessions, or secrets. Database backups/exports must be handled
  separately; do not commit `DATABASE_URL` or other credentials.
- The supported development schema flow is `pnpm --filter @workspace/db run
  push`. Production schema changes are applied by Replit's publish-time schema
  flow, not by a custom startup migration.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/prime-site` — public quote-first storefront, public CMS rendering, Clark, Tawk handoff, and admin inline editing.
- `artifacts/admin-panel` — protected WordPress-style admin shell, catalog, CMS, approval center, CRM, support, settings, and monitoring.
- `artifacts/customer-portal` — customer authentication and portal workflows.
- `artifacts/api-server` — Express API, sessions, admin capabilities, CMS revisions, chat persistence, and provider integrations.
- `lib/db/src/schema/index.ts` — Drizzle PostgreSQL schema source of truth.
- `lib/api-spec/openapi.yaml` — OpenAPI source of truth; `lib/api-client-react` and `lib/api-zod` are generated.
- `artifacts/mockup-sandbox` — isolated live component previews; never embed the main app server here.

The full contributor guide is in the root `README.md`.

## Architecture decisions

- Editor page, blog, template, catalog, and banner edits create pending
  revisions; Super Admin or Basic Admin approval is required before they become
  public.
- Super Admin and Basic Admin edits are recorded as approved revisions and
  applied live immediately. Basic Admin is deliberately blocked from Settings,
  users, security, database, monitoring, and other system controls.
- Inline editing uses the same approval API for static pages and shared
  product/category/shop/blog templates.
- Customer passwords are not displayed in admin responses; invitation and
  expiring password-reset links are used for lifecycle changes.
- Uploaded media bytes are kept in persistent app storage/filesystem paths and
  queryable metadata is stored in PostgreSQL.
- Clark transcripts are stored independently of quote leads. The optional Tawk
  browser handoff saves the transcript first, then opens the official Tawk
  widget; Tawk notifications remain configured in Tawk's dashboard.

## Product

Prime Packaging Boxes is a quote-only packaging storefront. Visitors browse
custom box products and categories, request a quote, read supporting content,
and chat with Clark. Admin users manage the catalog, content, SEO, media, CRM,
support, quotes, invoices, customer access, and operational settings through
separate capability-guarded workspaces. There is no public pricing or payment
checkout requirement.

## User preferences

- Keep PostgreSQL as the database of record.
- Keep GitHub limited to source and documentation; never commit database rows,
  uploads, backups, sessions, or credentials.
- Keep CMS revisions append-only and previews expiring.
- Keep Clark on Gemini first with Groq fallback and preserve anonymous
  transcript persistence.
- Use the official Tawk browser embed only after a public Property ID/widget
  path is configured; do not ask for private Tawk credentials.

## Gotchas

- Run `pnpm run typecheck:libs` before artifact typechecks because TypeScript
  project references require the shared composite libraries first.
- Run OpenAPI codegen after editing `lib/api-spec/openapi.yaml`.
- Use Drizzle push for development schema changes; production schema changes go
  through Replit Publish.
- Restart the managed API, Prime, and admin workflows after server or schema
  changes, then inspect workflow and browser logs.
- Do not use `overflow-x: hidden` on the body for sticky product galleries;
  `overflow-x: clip` preserves sticky positioning.
- `.replit.dev` PageSpeed scans include development/HMR assets; validate final
  performance against the published build.
- Fetch-based JSON clients need bodyful 200 responses; avoid bodyless API 304
  responses for endpoints consumed as JSON.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `README.md` for the complete setup, role matrix, CMS workflow, Clark/Tawk
  handoff, privacy rules, deployment notes, and troubleshooting guide.
