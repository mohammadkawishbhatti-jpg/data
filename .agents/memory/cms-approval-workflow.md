---
name: CMS approval workflow
description: Managed catalog and CMS edits use append-only revisions; Editor work is pending while Basic/Super Admin work is live.
---

All managed product, category, banner, page, blog, and template edits must create
an append-only revision. Editor work remains pending until an authorized reviewer
applies it; Basic Admin and Super Admin work is applied live immediately while
retaining the revision record. Restore creates another revision, and preview
access comes only from an expiring revision token.

**Why:** Published content must remain stable while editor work is reviewed, and
historical versions must remain auditable instead of being overwritten.

**How to apply:** Route future catalog/CMS mutations through the shared revision
helper; direct/live behavior is only for roles with `content-approval`, and
high-impact system operations remain Super Admin-only.

**Preview note:** Admin dark/midnight themes override generic `.bg-white`
surfaces, so private previews must use the dedicated light document-preview
surface to keep saved HTML readable.

**Role rule:** Super Admin and Basic Admin content/catalog mutations are live;
Editor mutations remain pending for Basic Admin or Super Admin review, while Sales
actions stay direct.

**Visibility rule:** Basic Admin and Super Admin can review the complete revision
queue; Editor revision list, detail, and restore operations must be scoped to
revisions created by the current admin. High-impact imports remain restricted
until they support the same revision workflow.

**Why:** A role restriction on the approval button is insufficient if an Editor
can still read, restore, or bulk-write another administrator's content, and the
dashboard must not hide queue work from a Basic Admin who can approve it.

**How to apply:** Scope every revision endpoint, not only the queue list, and
keep high-impact import operations behind the administrator guard until they
support the same revision workflow.