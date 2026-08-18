# Prime Packaging Boxes

Prime Packaging Boxes is a production-oriented, quote-first packaging storefront for custom boxes and branded packaging. The public site helps visitors browse products, request quotes, read packaging content, and chat with Clark. It does not expose public product pricing or a public payment checkout.

The workspace also contains a protected CMS/admin panel, a customer portal, a PostgreSQL-backed API, and a reusable component preview sandbox.

## Workspace map

| Area | Location | Purpose |
| --- | --- | --- |
| Public storefront | `artifacts/prime-site` | Branded website, product/category/blog pages, quote flow, Clark, admin inline editing |
| Admin panel | `artifacts/admin-panel` | Catalog, CMS, approvals, CRM, support, settings, monitoring, and audit workspaces |
| Customer portal | `artifacts/customer-portal` | Authenticated customer quote/order/support access |
| API server | `artifacts/api-server` | Express routes, authentication, CMS revisions, chat, CRM, and integrations |
| Database package | `lib/db` | Drizzle PostgreSQL schema and development schema push |
| API contract | `lib/api-spec/openapi.yaml` | OpenAPI source of truth for generated client hooks and Zod contracts |
| Generated clients | `lib/api-client-react`, `lib/api-zod` | Generated React Query hooks and request/response validation |
| Preview sandbox | `artifacts/mockup-sandbox` | Isolated live UI previews; do not embed the main app here |

The public website and admin panel are separate artifacts but use the shared API service. Artifact routing supplies each frontend's base path; browser code should use `import.meta.env.BASE_URL` or the existing API helpers instead of hard-coded localhost URLs.

## Product behavior

- Public catalog and content are quote-first. Product pages expose quote actions rather than public pricing.
- PostgreSQL controls products, categories, featured placements, banners, CMS pages, templates, blog content, menus, settings, quotes, leads, invoices, orders, tickets, media metadata, and audit records.
- Uploaded files are kept in persistent app storage/filesystem paths; PostgreSQL stores their metadata and paths.
- Admin inline editing uses the same CMS revision contract as the full admin editors.
- Customer conversations can remain anonymous. Clark transcripts are stored independently from quote leads so a visitor does not need to submit an email for the conversation to be recoverable.

## Local development

Install dependencies from the workspace root:

```bash
pnpm install
```

Useful commands:

```bash
# Build shared generated libraries before artifact typechecks
pnpm run typecheck:libs

# Regenerate React Query hooks and Zod schemas after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen

# Typecheck individual packages
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/admin-panel run typecheck
pnpm --filter @workspace/prime-site run typecheck
pnpm --filter @workspace/customer-portal run typecheck

# Build the project
pnpm run build

# Push development schema only
pnpm --filter @workspace/db run push
```

Configured development workflows:

```text
artifacts/api-server: API Server
artifacts/prime-site: web
artifacts/admin-panel: web
artifacts/customer-portal: web
artifacts/mockup-sandbox: Component Preview Server
```

After server, schema, package, or run-command changes, restart the affected managed workflow and inspect its logs. Do not create a replacement workflow for an existing artifact service.

## Environment and secrets

The API needs a PostgreSQL `DATABASE_URL`. Runtime secrets are managed by Replit Secrets and must never be committed, pasted into chat, or returned by an API response. The project may use:

- `ADMIN_PASSWORD` — initial Super Admin password
- `SESSION_SECRET` — session signing/encryption material
- `GEMINI_API_KEY` — Clark's primary provider
- `GROQ_API_KEY` — Clark's fallback provider

Optional provider overrides and email settings are managed through the protected admin Settings screens. Keep private SMTP passwords and database API-key overrides redacted from public settings. Use the integrations already connected to the workspace for GitHub and Google Sheets; do not install duplicate connectors or put credentials in source.

### Tawk.to setup

Tawk's browser Property ID/widget path is public configuration, not an API secret. A Super Admin can open **Admin → Settings → Clark AI → Live agent handoff**, enable the widget, and enter the public path such as `property-id/widget-id`.

When configured:

1. The official `https://embed.tawk.to/...` browser script loads on the public site.
2. Its launcher is hidden while Clark is active, preventing competing launchers.
3. Clark's **Talk to a real person** action saves the current transcript to PostgreSQL.
4. The official Tawk API is asked to show and maximize the live-agent chat.
5. Tawk availability, agent routing, email/browser notifications, and transcripts inside Tawk remain controlled by the Tawk dashboard.

No Tawk private API credential is accepted by the browser or stored in site settings.

## Database and schema policy

- PostgreSQL is the development database and is accessed through Drizzle.
- Run `pnpm --filter @workspace/db run push` for development schema changes.
- Replit's publish flow applies production schema changes; do not add a custom startup migration.
- Development and production databases are isolated.
- Publishing/copying development data over production is destructive to existing production data and must only happen when explicitly safe.
- Database rows, backups, uploaded media, sessions, and secrets do not belong in GitHub.

The schema source is `lib/db/src/schema/index.ts`. If a route contract changes, update `lib/api-spec/openapi.yaml`, run codegen, build shared libraries, then typecheck the consuming artifacts.

## Roles and capabilities

The API is the source of truth for the role matrix. The admin UI filters navigation and guards routes, but every sensitive route also enforces the backend capability.

| Role | Main access | Content/catalog behavior |
| --- | --- | --- |
| **Super Admin** (`superadmin`) | Full access, including Settings, users, security, database, monitoring, Clark controls, and audit controls | Changes are recorded for audit and applied live; can review, reject, restore, and publish revisions |
| **Basic Admin** (`admin`) | Dashboard, catalog, content, media, forms, exports, and Approval Center; no Settings or system/security workspaces | Own content/catalog changes are live; can review, reject, restore, and publish pending Editor revisions |
| **Editor** (`editor`) | Dashboard, catalog, content, media, forms, and exports | Changes create pending revisions; revision history and previews are scoped to the Editor's own submissions; cannot approve or publish |
| **Sales** (`sales`) | Dashboard, quotes, quote builder, leads, customers, support, invoices, and sales follow-up | Sales/CRM actions use their own workflow and do not grant CMS approval |

The `admin` database role is intentionally displayed as **Basic Admin**. `requireAdministrator()` remains reserved for Super Admin-only system operations. Settings, user management, security, database, monitoring, and audit configuration must not be opened merely because a user can edit content.

## CMS revision and approval flow

Managed pages, blog posts, templates, products, categories, and banners use append-only `content_revisions` records.

- Editor writes create `pending` revisions and expiring preview tokens.
- Super Admin and Basic Admin writes also create revision records, then apply them immediately with `approved` status for an auditable live change.
- A pending revision is never exposed through normal public CMS endpoints.
- Preview links use a random expiring token and are served with `Cache-Control: no-store`.
- Basic Admin and Super Admin can approve, reject, publish, or restore revisions.
- Restore always creates another revision; it never overwrites history.
- Editors can list and preview their own revisions only.
- Delete operations remain intentionally restricted for high-impact base-row removal unless the route has a safe revision workflow.

Rendered private previews use visible inline change markers. The field-level Before/After panel is the authoritative diff; the rendered product, category, banner, page, blog, and template surfaces provide the visual context.

## Clark chat and privacy

Clark uses Gemini `gemini-2.5-flash` first and Groq `openai/gpt-oss-120b` as fallback. The server persists a conversation before provider work and persists the completed assistant/admin response afterward.

- `clark_conversations` is the durable source of anonymous chat history.
- A quote lead is a later qualification/promotion step, not the chat transcript itself.
- The public browser receives only public site settings and the streaming response.
- Private provider keys, SMTP passwords, session secrets, and administrative data stay server-side.
- The public handoff endpoint saves a bounded transcript and a handoff event before Tawk is opened.

## GitHub and source safety

GitHub is for source code and documentation only. Before committing or publishing:

- Check `git status` and the diff.
- Confirm no `.env` files, credentials, database exports, backups, sessions, uploaded media, or generated runtime data are staged.
- Do not solve Git transport credential errors by exposing or requesting tokens in chat; use the authorized GitHub integration/client.
- Never commit `DATABASE_URL`, API keys, private Tawk credentials, customer passwords, or password-reset/session tokens.

## Deployment and troubleshooting

Use the Replit Publish flow for deployment. Validate public performance against the published build rather than a `.replit.dev` development URL; Vite/HMR modules can distort development PageSpeed results.

For a blank preview:

1. Confirm the managed workflow is running and listening on its injected `PORT`.
2. Restart the affected artifact workflow.
3. Refresh workflow and browser-console logs.
4. Check Vite host/base-path configuration and API proxy paths.
5. Run `pnpm run typecheck:libs` before artifact typechecks if generated/shared types changed.

For a content issue:

1. Check the active database environment and public row.
2. Check the revision status and preview expiry.
3. Confirm the request is using the correct artifact base path.
4. Do not bypass the revision helper with a direct editor mutation.

For a Clark provider issue, verify current provider model availability and server logs before changing keys. For a Tawk issue, verify the public Property ID/widget path and the Tawk dashboard's property/agent settings; no private Tawk API key is required for the browser handoff.
