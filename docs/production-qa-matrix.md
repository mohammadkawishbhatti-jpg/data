# Prime Packaging Boxes production QA matrix

This checklist is the release gate for the admin panel, customer portal, and
public storefront. The live capability matrix is also available to Super Admins
at **Admin → Monitoring** and from `GET /api/admin/capability-matrix`.

## Admin capability and mutation matrix

| Role | Expected capabilities | Read route checks | Mutation checks |
| --- | --- | --- | --- |
| Super Admin | `*` | Every admin route returns 2xx after login | Can approve/reject/restore/publish revisions, manage audit settings/exports, monitoring, users, and security |
| Editor | dashboard, catalog, content, media, forms, exports | Catalog, pages, blog, media, menus, global styles, approvals | CMS and media changes create pending revisions/metadata; cannot approve or publish |
| Sales | dashboard, sales, customers, support, invoices | Quotes, leads, customers, orders, support, invoices | Sales/customer changes succeed; CMS approval and system routes return 403 |
| Basic Admin | dashboard, support | Dashboard and support only | Support mutations succeed; all other capability routes return 403 |
| Anonymous | none | Public storefront, token preview with valid token | Protected admin/customer mutations return 401 |

For every row, assert:

1. No session → `401`.
2. Authenticated role without the capability → `403`.
3. Authenticated role with the capability → successful response.
4. Every successful admin mutation creates an audit event with actor ID and
   integrity hash.

## CMS approval checks

- Page, blog, and template create/update responses are `202` and include a
  pending revision ID plus expiring preview token.
- Existing published content remains unchanged while a revision is pending.
- Preview tokens expire and are rejected after their expiry.
- Editor/admin can compare and restore; restore creates a new pending revision.
- Only Super Admin can approve, reject, or publish a revision.
- Scheduled content is only eligible for the scheduler after approval.
- Rejected revisions never apply to a public row.

## Customer portal lifecycle checks

- Login accepts username, email, or customer number.
- Invited accounts cannot log in before activation.
- Activation links expire after 72 hours and are single-use.
- Password reset request has the same response whether the account exists or
  not; reset links expire after one hour and are single-use.
- Disabled accounts cannot log in.
- Admin customer responses never contain password hashes, plaintext passwords,
  invitation token hashes, or reset token hashes.

## Monitoring, audit, and media checks

- API latency over one second creates an `api_latency` event.
- Failed mutations, 401/403 responses, frontend errors, SMTP failures, and
  image conversion failures create the matching event type.
- Audit exports are downloadable as CSV and immutable JSON; sensitive keys are
  omitted from metadata.
- Retention is configurable from one to 3,650 days.
- Sensitive-action alerts can be enabled with a configured alert address.
- Image uploads record dimensions, size warnings, alt text, and optimization
  status; WebP/AVIF variants are linked when conversion succeeds.

## Browser and device pass

Run the visual pass at 1440×1000, 1024×768, 768×1024, and 390×844 in:

- Chromium/Chrome
- Firefox
- Safari/WebKit

Verify keyboard-only navigation reaches every control in visible order, focus
indicators are visible, dialogs trap focus and return focus, and no action
depends on hover. Verify print output for invoice and quote builders is white
with dark text, with no admin chrome. Toggle light/dark themes repeatedly and
verify no preview or document surface inherits dark text/background styles.

## Release commands

```bash
pnpm typecheck:libs
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/admin-panel run typecheck
pnpm --filter @workspace/customer-portal run typecheck
pnpm --filter @workspace/prime-site run typecheck
git diff --check
```