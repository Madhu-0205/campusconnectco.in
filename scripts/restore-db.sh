#!/usr/bin/env bash
# ==============================================================================
# CampusConnect — Safe Database Restore Verification Script
#
# CRITICAL WARNING:
#   NEVER RUN THIS SCRIPT AGAINST THE LIVE PRODUCTION DATABASE.
#   THIS SCRIPT IS DESIGNED EXCLUSIVELY FOR DISASTER RECOVERY DRILLS
#   AND RESTORING INTO AN ISOLATED STAGING OR RECOVERY DATABASE INSTANCE.
#
# Usage:
#   BACKUP_ENCRYPTION_KEY="your-passphrase" ./scripts/restore-db.sh \
#     <PATH_TO_BACKUP.tar.gz.enc> \
#     <PATH_TO_BACKUP.sha256> \
#     <TARGET_RECOVERY_DB_URL>
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: BACKUP_ENCRYPTION_KEY=\"...\" $0 <backup.tar.gz.enc> <backup.sha256> <TARGET_RECOVERY_DB_URL>"
  exit 1
fi

ENC_FILE="$1"
SHA_FILE="$2"
TARGET_DB_URL="$3"

if [ ! -f "$ENC_FILE" ]; then
  echo "ERROR: Encrypted backup file not found: $ENC_FILE"
  exit 1
fi

if [ ! -f "$SHA_FILE" ]; then
  echo "ERROR: Checksum file not found: $SHA_FILE"
  exit 1
fi

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "ERROR: BACKUP_ENCRYPTION_KEY environment variable is required to decrypt the backup."
  exit 1
fi

# ==============================================================================
# PRODUCTION SAFETY GUARD
# ==============================================================================
echo "******************************************************************************"
echo "                      DATABASE RESTORE OPERATOR GUARD                        "
echo "******************************************************************************"
echo "Target DB: $(echo "$TARGET_DB_URL" | sed -E 's/:[^@]+@/:***@/')"
echo ""
echo "CRITICAL: Verify that the target above is an ISOLATED RECOVERY / STAGING instance."
echo "Restoring will OVERWRITE data in the target database."
echo ""
read -p "Type 'RESTORE_TO_ISOLATED_INSTANCE' to proceed: " CONFIRMATION

if [ "$CONFIRMATION" != "RESTORE_TO_ISOLATED_INSTANCE" ]; then
  echo "Restoration aborted by safety guard."
  exit 1
fi

TMP_RESTORE_DIR=$(mktemp -d /tmp/cc-restore-XXXXXX)
chmod 700 "$TMP_RESTORE_DIR"

cleanup() {
  rm -rf "$TMP_RESTORE_DIR"
  echo "Sanitized restore workspace."
}
trap cleanup EXIT

echo "=== 1. Decrypting Backup Archive ==="
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
  -in "$ENC_FILE" \
  -out "${TMP_RESTORE_DIR}/archive.tar.gz" \
  -pass env:BACKUP_ENCRYPTION_KEY

echo "=== 2. Verifying SHA-256 Integrity ==="
CALCULATED_HASH=$(shasum -a 256 "${TMP_RESTORE_DIR}/archive.tar.gz" | awk '{print $1}')
EXPECTED_HASH=$(awk '{print $1}' "$SHA_FILE")

if [ "$CALCULATED_HASH" != "$EXPECTED_HASH" ]; then
  echo "FATAL: Checksum verification failed!"
  echo "Expected:   $EXPECTED_HASH"
  echo "Calculated: $CALCULATED_HASH"
  exit 1
fi
echo "SHA-256 integrity match verified successfully."

echo "=== 3. Unpacking Backup Files ==="
tar -xzf "${TMP_RESTORE_DIR}/archive.tar.gz" -C "$TMP_RESTORE_DIR"

for required in roles.sql schema.sql data.sql; do
  if [ ! -f "${TMP_RESTORE_DIR}/${required}" ]; then
    echo "FATAL: Missing ${required} in backup archive!"
    exit 1
  fi
done

echo "=== 4. Applying Roles (Ignoring Existing Platform Roles) ==="
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=0 -f "${TMP_RESTORE_DIR}/roles.sql" || true

echo "=== 5. Applying Public Schema Structure ==="
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "${TMP_RESTORE_DIR}/schema.sql"

echo "=== 6. Applying Data Records ==="
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "${TMP_RESTORE_DIR}/data.sql"

echo "=== 7. Post-Restore Verification Query ==="
psql "$TARGET_DB_URL" -c "
  SELECT 'User count' AS entity, count(*) FROM \"User\"
  UNION ALL
  SELECT 'Gig count', count(*) FROM \"gigs\"
  UNION ALL
  SELECT 'Transaction count', count(*) FROM \"Transaction\"
  UNION ALL
  SELECT 'Notification count', count(*) FROM \"Notification\";
"

echo "******************************************************************************"
echo "✅ RESTORATION AND VERIFICATION COMPLETED SUCCESSFULLY ON TARGET DATABASE"
echo "******************************************************************************"
