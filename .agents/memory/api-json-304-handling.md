---
name: API JSON 304 handling
description: Why this monorepo avoids bodyless 304 responses for browser-fetched JSON APIs
---

Browser `fetch` calls used by the generated React Query client cannot rehydrate a JSON response from a bodyless `304 Not Modified`. API routes consumed by the web apps should return a bodyful `200` response instead of honoring `If-None-Match` or `If-Modified-Since`.

**Why:** Express can still convert a response to `304` even when `Cache-Control: no-cache` is set. That leaves React Query requests in an error/loading path when the client expects JSON.

**How to apply:** Keep caching for media and explicitly public catalog responses where appropriate, but strip conditional request headers and use no-store headers at the general JSON API boundary.