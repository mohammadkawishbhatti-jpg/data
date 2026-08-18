---
name: Generated contract cleanup
description: Removing an OpenAPI-backed feature must clean generated clients and database schema together.
---

When an OpenAPI-backed feature is removed, remove its source routes/schema first, rerun codegen to clean generated clients, and push the reduced development schema so feature-specific tables do not remain.

**Why:** Hand-editing generated files left stale calculator hooks and made it easy to miss the persisted table during a full feature removal.

**How to apply:** Use this sequence for future feature deletions, then search the workspace and verify the database table is absent before restarting affected workflows.