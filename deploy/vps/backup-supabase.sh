#!/usr/bin/env bash
set -euo pipefail

umask 077

project_dir="/srv/dartahara/supabase"
backup_env="${BACKUP_ENV_FILE:-/etc/dar-tahara/backup.env}"
backup_name="dar-tahara-postgres.dump"

if [[ ! -r "${backup_env}" ]]; then
  echo "Backup environment is not readable: ${backup_env}" >&2
  exit 1
fi

# The file is root/operations managed and must be mode 0600. Export values so
# Restic and the S3 client receive the repository credentials.
set -a
# shellcheck disable=SC1090
source "${backup_env}"
set +a

for command_name in docker restic; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Required backup command is unavailable: ${command_name}" >&2
    exit 1
  fi
done

if [[ -z "${RESTIC_REPOSITORY:-}" || -z "${RESTIC_PASSWORD_FILE:-}" ]]; then
  echo "RESTIC_REPOSITORY and RESTIC_PASSWORD_FILE are required" >&2
  exit 1
fi

if [[ -z "${SUPABASE_STORAGE_PATH:-}" || ! -d "${SUPABASE_STORAGE_PATH}" ]]; then
  echo "SUPABASE_STORAGE_PATH must identify the local self-hosted Storage volume" >&2
  exit 1
fi

if [[ ! -r "${RESTIC_PASSWORD_FILE}" ]]; then
  echo "Restic password file is not readable: ${RESTIC_PASSWORD_FILE}" >&2
  exit 1
fi

notify_failure() {
  local exit_code="$1"
  local line_number="$2"
  local message="Dar Tahara production backup failed on $(hostname) at line ${line_number} (exit ${exit_code})"

  logger --tag dar-tahara-backup --priority user.err -- "${message}" || true
  if [[ -n "${BACKUP_ALERT_WEBHOOK_URL:-}" ]] && command -v curl >/dev/null 2>&1; then
    local escaped="${message//\\/\\\\}"
    escaped="${escaped//\"/\\\"}"
    curl --fail --silent --show-error --max-time 15 \
      --header 'Content-Type: application/json' \
      --data "{\"text\":\"${escaped}\",\"severity\":\"critical\",\"event\":\"database_backup_failed\"}" \
      "${BACKUP_ALERT_WEBHOOK_URL}" >/dev/null || true
  fi
}

on_error() {
  local exit_code="$1"
  local line_number="$2"
  trap - ERR
  set +e
  notify_failure "${exit_code}" "${line_number}"
  exit "${exit_code}"
}
trap 'on_error $? $LINENO' ERR

postgres_password="$(sed -n 's/^POSTGRES_PASSWORD=//p' "${project_dir}/.env")"
if [[ -z "${postgres_password}" ]]; then
  echo "POSTGRES_PASSWORD is missing from ${project_dir}/.env" >&2
  exit 1
fi

restic backup \
  --stdin-from-command \
  --stdin-filename "${backup_name}" \
  --host "$(hostname)" \
  --tag dar-tahara \
  --tag postgres \
  --tag production \
  -- docker exec \
    --env "PGPASSWORD=${postgres_password}" \
    dar-tahara-supabase-db \
    pg_dump --username postgres --dbname postgres --format custom --no-owner --no-privileges

restic backup "${SUPABASE_STORAGE_PATH}" \
  --host "$(hostname)" \
  --tag dar-tahara \
  --tag storage \
  --tag production

restic forget \
  --host "$(hostname)" \
  --tag dar-tahara \
  --tag postgres \
  --keep-daily "${BACKUP_KEEP_DAILY:-14}" \
  --keep-weekly "${BACKUP_KEEP_WEEKLY:-8}" \
  --keep-monthly "${BACKUP_KEEP_MONTHLY:-12}"

restic forget \
  --host "$(hostname)" \
  --tag dar-tahara \
  --tag storage \
  --keep-daily "${BACKUP_KEEP_DAILY:-14}" \
  --keep-weekly "${BACKUP_KEEP_WEEKLY:-8}" \
  --keep-monthly "${BACKUP_KEEP_MONTHLY:-12}" \
  --prune

restic check
logger --tag dar-tahara-backup --priority user.info -- \
  "Encrypted off-site PostgreSQL and Storage backup completed successfully"
