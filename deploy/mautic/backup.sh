#!/usr/bin/env bash
#
# Mautic backup — database + the volumes that hold anything unrecoverable.
#
# Run nightly from the host crontab (see README §Backups). Writes a single
# timestamped directory per run to /opt/backups/mautic and prunes runs older
# than RETENTION_DAYS.
#
# What is backed up and why:
#   db      — contacts, campaigns, segments, scores, email stats. The one thing
#             that genuinely cannot be rebuilt.
#   config  — local.php: DB creds, site_url, tuned parameters.
#   media   — uploaded images used by email templates and landing pages.
#   themes  — the custom Dar Tahara email theme.
#   plugins — only if custom/third-party plugins are ever installed.
#
# Deliberately NOT backed up: logs (noise, and re-creatable) and the Docker
# images themselves (pinned by tag, re-pullable).
set -euo pipefail

STACK_DIR="/opt/projects/mautic"
BACKUP_ROOT="/opt/backups/mautic"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="${BACKUP_ROOT}/${STAMP}"

if [[ $EUID -ne 0 ]]; then
  echo "must run as root (reads the root-owned .env and Docker volumes)" >&2
  exit 1
fi

# Read only the keys we need, rather than `source`-ing the .env. Compose's .env
# format is not shell: an unquoted value with a space (MAUTIC_MAILER_FROM_NAME=
# Dar Tahara) is valid to Compose but makes bash try to execute "Tahara".
env_get() {
  local key="$1"
  sed -n "s/^${key}=//p" "${STACK_DIR}/.env" | head -1
}

MAUTIC_DB_ROOT_PASSWORD="$(env_get MAUTIC_DB_ROOT_PASSWORD)"
MAUTIC_DB_DATABASE="$(env_get MAUTIC_DB_DATABASE)"
MAUTIC_IMAGE_TAG="$(env_get MAUTIC_IMAGE_TAG)"

[[ -n "${MAUTIC_DB_ROOT_PASSWORD}" && -n "${MAUTIC_DB_DATABASE}" ]] \
  || { echo "could not read DB settings from ${STACK_DIR}/.env" >&2; exit 1; }

mkdir -p "${DEST}"
chmod 0700 "${BACKUP_ROOT}" "${DEST}"

fail() { echo "BACKUP FAILED: $*" >&2; rm -rf "${DEST}"; exit 1; }

# ── Database ───────────────────────────────────────────────────────────────────
# --single-transaction keeps InnoDB consistent without locking writers, so a
# nightly dump never stalls a live campaign send.
echo "==> dumping database"
docker exec mautic-db mariadb-dump \
  --user=root --password="${MAUTIC_DB_ROOT_PASSWORD}" \
  --single-transaction --quick --routines --events \
  --databases "${MAUTIC_DB_DATABASE}" \
  2>/dev/null | gzip -c > "${DEST}/mautic-db.sql.gz" || fail "mariadb-dump"

# A dump that is technically "successful" but truncated is the classic silent
# backup failure, so assert the file is non-trivial and gzip-valid.
gzip -t "${DEST}/mautic-db.sql.gz" || fail "database dump is not a valid gzip file"
SIZE="$(stat -c%s "${DEST}/mautic-db.sql.gz")"
[[ "${SIZE}" -gt 10240 ]] || fail "database dump suspiciously small (${SIZE} bytes)"

# ── Volumes ────────────────────────────────────────────────────────────────────
for vol in config media themes plugins; do
  echo "==> archiving volume mautic-${vol}"
  docker run --rm \
    -v "mautic_mautic-${vol}:/src:ro" \
    -v "${DEST}:/dest" \
    alpine:3.20 \
    tar czf "/dest/mautic-${vol}.tar.gz" -C /src . \
    || fail "archiving mautic-${vol}"
done

# local.php inside the config archive contains the DB password.
chmod 0600 "${DEST}"/*

cat > "${DEST}/MANIFEST.txt" <<EOF
Mautic backup ${STAMP}
image:    mautic/mautic:${MAUTIC_IMAGE_TAG}
database: ${MAUTIC_DB_DATABASE}
contents: mautic-db.sql.gz, mautic-{config,media,themes,plugins}.tar.gz
restore:  see /opt/projects/mautic/README.md §Restore
EOF

echo "==> pruning backups older than ${RETENTION_DAYS} days"
find "${BACKUP_ROOT}" -mindepth 1 -maxdepth 1 -type d -mtime "+${RETENTION_DAYS}" -exec rm -rf {} +

echo "Backup complete: ${DEST} ($(du -sh "${DEST}" | cut -f1))"
