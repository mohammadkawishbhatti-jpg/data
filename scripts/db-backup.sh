#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# db-backup.sh  —  Export DB → db-backup.sql and push to GitHub
# Usage:  bash scripts/db-backup.sh
#         bash scripts/db-backup.sh "optional commit message"
# ─────────────────────────────────────────────────────────
set -e

MSG="${1:-"chore: db backup $(date '+%Y-%m-%d %H:%M')"}"
BACKUP="db-backup.sql"

echo "▶ Dumping database..."
pg_dump "$DATABASE_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  -f "$BACKUP"

echo "▶ Backup saved to $BACKUP ($(du -sh "$BACKUP" | cut -f1))"

echo "▶ Committing and pushing to GitHub..."
git add "$BACKUP"
git commit -m "$MSG" || echo "  (no changes to commit)"
git pull --no-rebase origin main --quiet 2>/dev/null || true
git push origin main

echo "✅ Done — database backed up and pushed to GitHub."
