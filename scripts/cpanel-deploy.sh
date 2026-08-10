#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# cpanel-deploy.sh — cPanel pe Prime Packaging Boxes deploy karo
# 
# cPanel Terminal mein chalao:
#   bash cpanel-deploy.sh
# ═══════════════════════════════════════════════════════════════
set -e

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   Prime Packaging Boxes — cPanel Deployment       ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# ── Config — apni values yahan set karo ───────────────────────
DB_NAME="${CPANEL_PG_DB:-}"          # e.g. ecofrie1_prime
DB_USER="${CPANEL_PG_USER:-}"        # e.g. ecofrie1_admin
DB_PASS="${CPANEL_PG_PASSWORD:-}"    # DB password
SESSION_SEC="${SESSION_SECRET:-change_this_secret_123}"
GROQ_KEY="${GROQ_API_KEY:-}"
GITHUB_REPO="https://github.com/mohammadkawishbhatti-jpg/prime-packaging-boxes.git"
APP_DIR="$HOME/prime-packaging-boxes"
PUBLIC_DIR="$HOME/primepackagingboxes.com"

echo "📋 Config:"
echo "   App dir:    $APP_DIR"
echo "   Public dir: $PUBLIC_DIR"
echo "   DB:         $DB_NAME"
echo ""

# ── 1. Node.js check ──────────────────────────────────────────
echo "🔍 Node.js version check..."
node --version || { echo "❌ Node.js nahi mila! cPanel → Setup Node.js App se pehle configure karo."; exit 1; }
echo "   ✅ Node.js ready"

# ── 2. pnpm install ───────────────────────────────────────────
echo ""
echo "📦 pnpm check..."
if ! command -v pnpm &> /dev/null; then
  echo "   Installing pnpm..."
  npm install -g pnpm
fi
echo "   ✅ pnpm ready"

# ── 3. WordPress files backup (optional) ──────────────────────
echo ""
echo "💾 Old WordPress backup kar raha hoon..."
if [ -f "$PUBLIC_DIR/wp-config.php" ]; then
  mkdir -p "$HOME/wordpress-backup"
  cp "$PUBLIC_DIR/wp-config.php" "$HOME/wordpress-backup/" 2>/dev/null || true
  echo "   ✅ wp-config.php backed up to ~/wordpress-backup/"
fi

# ── 4. public_html clean karo (WordPress hata do) ─────────────
echo ""
echo "🗑️  Old WordPress files hata raha hoon..."
find "$PUBLIC_DIR" -maxdepth 1 \
  ! -name "." \
  ! -name ".htaccess" \
  ! -name "cgi-bin" \
  -exec rm -rf {} + 2>/dev/null || true
echo "   ✅ public_html clean"

# ── 5. GitHub se code clone/pull ──────────────────────────────
echo ""
echo "📥 GitHub se code pull kar raha hoon..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$GITHUB_REPO" "$APP_DIR"
  cd "$APP_DIR"
fi
echo "   ✅ Code ready"

# ── 6. Dependencies install ───────────────────────────────────
echo ""
echo "📦 Dependencies install kar raha hoon..."
pnpm install --frozen-lockfile
echo "   ✅ Dependencies ready"

# ── 7. .env file banao ────────────────────────────────────────
echo ""
echo "⚙️  Environment variables set kar raha hoon..."
cat > "$APP_DIR/.env" << ENV
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
SESSION_SECRET=${SESSION_SEC}
GROQ_API_KEY=${GROQ_KEY}
NODE_ENV=production
PORT=3000
ENV
echo "   ✅ .env file ready"

# ── 8. Database setup ─────────────────────────────────────────
echo ""
echo "🗄️  Database setup kar raha hoon..."

# Session table
psql -U "$DB_USER" -d "$DB_NAME" -h localhost << SQL
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
SQL

# Schema push
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}" \
  pnpm --filter @workspace/db run push

# Import backup (agar file hai)
if [ -f "$APP_DIR/prime_packaging_backup.sql" ]; then
  echo "   Backup import kar raha hoon..."
  PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -d "$DB_NAME" -h localhost \
    -f "$APP_DIR/prime_packaging_backup.sql" 2>&1 | grep -v "^--" | grep -v "^SET" | grep -v "^TRUNCATE" | grep -v "^INSERT" | head -10
  echo "   ✅ Data imported!"
fi

echo "   ✅ Database ready"

# ── 9. Build karo ─────────────────────────────────────────────
echo ""
echo "🔨 Apps build kar raha hoon..."
NODE_ENV=production BASE_PATH=/ \
  pnpm --filter @workspace/prime-site run build
echo "   ✅ Prime Site built"

NODE_ENV=production BASE_PATH=/admin/ \
  pnpm --filter @workspace/admin-panel run build
echo "   ✅ Admin Panel built"

NODE_ENV=production \
  pnpm --filter @workspace/api-server run build
echo "   ✅ API Server built"

# ── 10. Static files public_html mein daal do ─────────────────
echo ""
echo "📁 Static files public_html mein copy kar raha hoon..."
cp -r "$APP_DIR/artifacts/prime-site/dist/public/." "$PUBLIC_DIR/"
mkdir -p "$PUBLIC_DIR/admin"
cp -r "$APP_DIR/artifacts/admin-panel/dist/public/." "$PUBLIC_DIR/admin/"
echo "   ✅ Frontend files ready"

# ── 11. .htaccess — API proxy + SPA routing ───────────────────
echo ""
echo "⚙️  .htaccess configure kar raha hoon..."
cat > "$PUBLIC_DIR/.htaccess" << 'HTACCESS'
RewriteEngine On

# API requests → Node.js app
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Admin panel SPA routing
RewriteCond %{REQUEST_URI} ^/admin/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^admin/.*$ /admin/index.html [L]

# Main site SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
HTACCESS
echo "   ✅ .htaccess ready"

# ── 12. Cron job — daily DB backup ────────────────────────────
echo ""
echo "⏰ Daily backup cron job set kar raha hoon..."
CRON_CMD="0 0 * * * cd $APP_DIR && DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME} node scripts/backup-and-push.mjs >> $HOME/logs/db-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "backup-and-push"; echo "$CRON_CMD") | crontab -
echo "   ✅ Cron job set (roz 12 baje UTC)"

# ── Done! ─────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║         ✅ Deployment Complete!                   ║"
echo "╠═══════════════════════════════════════════════════╣"
echo "║  Site:    primepackagingboxes.com                 ║"
echo "║  Admin:   primepackagingboxes.com/admin/          ║"
echo "║  Login:   admin / admin123                        ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "💡 API server start karne ke liye:"
echo "   cPanel → Setup Node.js App → Start"
echo "   Startup file: artifacts/api-server/dist/index.mjs"
echo ""
