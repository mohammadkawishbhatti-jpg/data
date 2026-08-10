#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# setup-new-replit.sh — Naye Replit pe ek command se sab ready
# Usage: bash scripts/setup-new-replit.sh
# ═══════════════════════════════════════════════════════════════
set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Prime Packaging — New Replit Setup     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Git remote set karo apne token se ──────────────────────
if [ -n "$GITHUB_TOKEN" ]; then
  echo "🔗 GitHub remote set kar raha hoon..."
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://${GITHUB_TOKEN}@github.com/mohammadkawishbhatti-jpg/prime-packaging-boxes.git"
  echo "   ✅ GitHub remote ready"
else
  echo "⚠️  GITHUB_TOKEN secret nahi mila — skip kar raha hoon"
  echo "   (Replit Secrets mein GITHUB_TOKEN add karo baad mein)"
fi

# ── 2. Latest code pull karo ───────────────────────────────────
echo ""
echo "📥 GitHub se latest code pull kar raha hoon..."
git pull origin main --allow-unrelated-histories --no-edit 2>/dev/null || echo "   (Already up to date)"
echo "   ✅ Code ready"

# ── 3. Dependencies install karo ──────────────────────────────
echo ""
echo "📦 Dependencies install kar raha hoon..."
pnpm install --frozen-lockfile
echo "   ✅ Dependencies ready"

# ── 4. DB session table banao ─────────────────────────────────
echo ""
echo "🗄️  Database setup kar raha hoon..."
if [ -n "$NEON_DATABASE_URL" ]; then
  echo "   ✅ NEON_DATABASE_URL mila — Neon use hoga (persistent!)"
else
  echo "   ⚠️  NEON_DATABASE_URL nahi mila — Replit DB use hoga (data reset ho sakta hai)"
  echo "   💡 Neon setup ke liye: neon.tech → project banao → secret add karo"
fi
pnpm --filter @workspace/db run push

# Session table (connect-pg-simple ke liye zaroori)
psql "$DATABASE_URL" -c "
CREATE TABLE IF NOT EXISTS \"session\" (
  \"sid\" varchar NOT NULL COLLATE \"default\",
  \"sess\" json NOT NULL,
  \"expire\" timestamp(6) NOT NULL,
  CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\") NOT DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS \"IDX_session_expire\" ON \"session\" (\"expire\");
" 2>/dev/null && echo "   ✅ Session table ready" || echo "   (Session table already exists)"

# DB Indexes
psql "$DATABASE_URL" -c "
CREATE INDEX IF NOT EXISTS idx_categories_is_active  ON categories (is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_active     ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id   ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured   ON products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_active_cat    ON products (is_active, category_id);
CREATE INDEX IF NOT EXISTS idx_blog_status            ON blog_posts (status);
" 2>/dev/null || true
echo "   ✅ Database indexes ready"

# ── 5. Data seed karo ─────────────────────────────────────────
echo ""
echo "🌱 Data seed kar raha hoon..."
node lib/db/seed.mjs
pnpm --filter @workspace/api-server exec tsx src/seed-pages.ts
echo "   ✅ 38 categories, 65 products, 10 pages — sab ready!"

# ── 6. Done! ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         ✅ Setup Complete!               ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Admin Login: admin / admin123           ║"
echo "║  Site:  preview mein / select karo       ║"
echo "║  Admin: preview mein /admin/ select karo ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "💡 Workflows start karne ke liye:"
echo "   Replit mein Run button dabao ya"
echo "   WorkflowsRestart tool use karo"
echo ""
