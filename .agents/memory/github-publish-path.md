---
name: GitHub publish path
description: Durable guidance for publishing workspace changes through the configured GitHub connection.
---

When the repository’s HTTPS Git transport rejects credentials, the configured GitHub connection can still publish changes through its authenticated API client. For a large workspace tree, create blobs first and apply small serialized Git tree layers before creating one commit and updating the ref; oversized tree payloads can trigger sandbox replay failures. Use explicit `Accept: application/vnd.github+json`, `Content-Type: application/json`, and `X-GitHub-Api-Version` headers. Preserve unrelated remote commits and keep executable scripts at mode `100755`.

**Why:** The workspace may have a valid authorized GitHub connection while the local Git credential helper is unavailable or invalid; asking for a raw token is unnecessary and unsafe.

**How to apply:** Confirm the target repository and branch through the authorized connection, guard the final ref update against the live parent SHA, serialize writes to the same repository, and verify the resulting commit and file paths. Treat local and remote history divergence as acceptable only when the fetched trees are identical.