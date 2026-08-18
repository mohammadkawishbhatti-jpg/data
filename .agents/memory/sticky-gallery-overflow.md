---
name: Sticky gallery overflow
description: The Prime storefront product gallery's sticky behavior and the global overflow constraint required for it.
---

Use `overflow-x: clip` on the document instead of `overflow-x: hidden` when a product-page gallery needs to remain sticky while the form scrolls.

**Why:** `overflow-x: hidden` can create an implicit scroll container and prevent `position: sticky` from following the page scroll in Chrome.

**How to apply:** Keep the configurator in normal document flow with no internal max-height or vertical overflow. Apply the gallery sticky rule only at desktop widths; let mobile remain normal-flow.