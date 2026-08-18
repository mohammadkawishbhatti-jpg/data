#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not configured." >&2
  exit 1
fi

command -v pg_dump >/dev/null 2>&1 || {
  echo "pg_dump is required but was not found on PATH." >&2
  exit 1
}

umask 077
backup_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output="${backup_dir}/prime-packaging-${timestamp}.sql"

pg_dump \
  --no-owner \
  --no-privileges \
  --format=plain \
  --file="$output" \
  "$DATABASE_URL"

chmod 600 "$output"
printf 'Created local PostgreSQL backup: %s\n' "$output"