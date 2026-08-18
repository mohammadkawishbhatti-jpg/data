---
name: PageSpeed dev versus production
description: Lighthouse scans of Replit dev previews include Vite and HMR modules that are absent from published static builds
---

PageSpeed reports against a `.replit.dev` Vite preview can attribute large “unminified JavaScript” and render-blocking costs to Vite client, React refresh, source modules, and development plugins; anonymous admin-session probes can also appear as console-error audits.

**Why:** Development previews intentionally serve HMR/debug modules and are not representative of the published artifact, whose Vite build is minified and code-split.

**How to apply:** Remove avoidable public-only development plugins such as the dev banner, but validate final JavaScript payload and Lighthouse scores against the published production URL rather than treating dev-module savings or expected anonymous admin 401 probes as production regressions.