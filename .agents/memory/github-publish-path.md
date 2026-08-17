---
name: GitHub publish path
description: Durable guidance for publishing workspace changes through the configured GitHub connection.
---

When the repository’s HTTPS Git transport rejects credentials, the configured GitHub connection can still publish changes through its authenticated API client.

**Why:** The workspace may have a valid authorized GitHub connection while the local Git credential helper is unavailable or invalid; asking for a raw token is unnecessary and unsafe.

**How to apply:** Confirm the target repository and branch through the authorized connection, create the Git blobs/tree/commit with the client, update the branch without force, and verify the resulting branch head.