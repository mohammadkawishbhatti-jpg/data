#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# post-merge.sh  — auto-runs after every task merge and on new Replit servers
# Keeps the database in sync with the codebase automatically.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🗄️  Pushing DB schema..."
pnpm --filter @workspace/db run push

echo "🌱 Seeding categories + products (safe: skips existing)..."
node lib/db/seed.mjs

echo "📄 Seeding page builder content (force-updates all 10 pages)..."
pnpm --filter @workspace/api-server exec tsx src/seed-pages.ts

echo "✅ Post-merge setup complete!"
