---
name: GitHub publish path
description: Durable guidance for publishing workspace changes through the configured GitHub connection.
---

When the repository’s HTTPS Git transport rejects credentials, the configured GitHub connection can still publish changes through its authenticated API client. If Git data/ref endpoints behave inconsistently, use the serialized Contents API with explicit `Accept: application/vnd.github+json`, `Content-Type: application/vnd.github+json`, and `X-GitHub-Api-Version` headers. Read each file’s current SHA before each write, preserve unrelated remote commits, and keep executable scripts at mode `100755`.

**Why:** The workspace may have a valid authorized GitHub connection while the local Git credential helper is unavailable or invalid; asking for a raw token is unnecessary and unsafe.

**How to apply:** Confirm the target repository and branch through the authorized connection, prefer a non-force Contents API update when Git tree/ref calls return unexpected 404s, serialize writes to the same repository, and verify the resulting commit and file paths.