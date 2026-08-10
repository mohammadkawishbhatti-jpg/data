#!/bin/bash
# ─────────────────────────────────────────────────────────────
# setup-db.sh  — run this on every new Replit / server to seed the DB
# Usage: bash scripts/setup-db.sh
# ─────────────────────────────────────────────────────────────
set -e

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🗄️  Pushing DB schema..."
pnpm --filter @workspace/db run push

echo "🌱 Seeding categories + products..."
node lib/db/seed.mjs

echo "📄 Seeding pages..."
pnpm --filter @workspace/api-server exec tsx src/seed-pages.ts

echo "✅ Database setup complete!"
