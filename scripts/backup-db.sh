#!/usr/bin/env bash
# ==============================================================================
# CampusConnect — Local / Operator Database Backup Script
# Creates an encrypted logical backup (roles, schema, data) of the database.
#
# Usage:
#   BACKUP_ENCRYPTION_KEY="your-passphrase" ./scripts/backup-db.sh [TARGET_DB_URL]
# ==============================================================================

set -euo pipefail

DB_URL="${1:-${DIRECT_URL:-${DATABASE_URL:-}}}"

if [ -z "$DB_URL" ]; then
  echo "ERROR: No database URL provided. Pass as arg or set DIRECT_URL / DATABASE_URL in environment."
  exit 1
fi

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "ERROR: BACKUP_ENCRYPTION_KEY is required for encryption. Generate one with: openssl rand -base64 32"
  exit 1
fi

TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
OUT_DIR="./backups/${TIMESTAMP}"
mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR"

echo "=== 1. Generating Logical Database Dumps ==="
echo "Dumping roles..."
npx supabase db dump --role-only --db-url "$DB_URL" -f "${OUT_DIR}/roles.sql"

echo "Dumping public schema..."
npx supabase db dump -s public --db-url "$DB_URL" -f "${OUT_DIR}/schema.sql"

echo "Dumping public data..."
npx supabase db dump --data-only --use-copy -s public --db-url "$DB_URL" -f "${OUT_DIR}/data.sql"

echo "=== 2. Validating Non-Empty Dumps ==="
for file in roles.sql schema.sql data.sql; do
  if [ ! -s "${OUT_DIR}/${file}" ]; then
    echo "ERROR: ${file} is missing or empty!"
    rm -rf "$OUT_DIR"
    exit 1
  fi
  echo "Verified ${file} ($(wc -c < "${OUT_DIR}/${file}" | tr -d ' ') bytes)"
done

echo "=== 3. Compressing Archive ==="
ARCHIVE_NAME="campusconnect_backup_${TIMESTAMP}.tar.gz"
tar -czf "${OUT_DIR}/${ARCHIVE_NAME}" -C "${OUT_DIR}" roles.sql schema.sql data.sql

echo "=== 4. Generating SHA-256 Checksum ==="
(cd "${OUT_DIR}" && shasum -a 256 "${ARCHIVE_NAME}" > "${ARCHIVE_NAME}.sha256")
cat "${OUT_DIR}/${ARCHIVE_NAME}.sha256"

echo "=== 5. Encrypting with OpenSSL AES-256-CBC ==="
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
  -in "${OUT_DIR}/${ARCHIVE_NAME}" \
  -out "${OUT_DIR}/${ARCHIVE_NAME}.enc" \
  -pass env:BACKUP_ENCRYPTION_KEY

echo "=== 6. Removing Plaintext Dump Files ==="
rm -f "${OUT_DIR}/roles.sql" "${OUT_DIR}/schema.sql" "${OUT_DIR}/data.sql" "${OUT_DIR}/${ARCHIVE_NAME}"

echo "SUCCESS: Encrypted backup created at: ${OUT_DIR}/${ARCHIVE_NAME}.enc"
echo "Checksum recorded at: ${OUT_DIR}/${ARCHIVE_NAME}.sha256"
