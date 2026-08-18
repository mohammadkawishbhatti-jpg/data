---
name: Clark chat persistence
description: Durable rules for saving Clark conversations and keeping provider fallbacks healthy.
---

Clark conversations must be persisted independently of lead qualification. A visitor may never provide an email, so quote rows are not a complete chat history; use the conversation record as the source of truth for every turn and promote qualified sessions to quotes later.

**Why:** The original lead-only flow required multiple user messages and an email, so normal anonymous chats were not recoverable. A swallowed invalid-column error also made the failure look like a missing database write.

**How to apply:** Await the conversation save before provider work and save the completed assistant/admin response afterward. The Sales Clark workspace should read these durable records and attach any matching quote by session ID. If an AI provider returns a model-not-found error, verify its current production model catalog before changing keys or asking the user for credentials.