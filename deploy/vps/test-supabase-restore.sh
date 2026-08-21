#!/usr/bin/env bash
set -euo pipefail

umask 077

backup_env="${BACKUP_ENV_FILE:-/etc/dar-tahara/backup.env}"
evidence_dir="${RESTORE_EVIDENCE_DIR:-/srv/dartahara/restore-evidence}"
backup_name="dar-tahara-postgres.dump"
started_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
started_epoch="$(date +%s)"
run_id="$(date -u +%Y%m%dT%H%M%SZ)-$$"
container_name="dar-tahara-restore-test-${run_id}"
temporary_dir="$(mktemp -d -t dar-tahara-restore.XXXXXXXX)"
dump_path="${temporary_dir}/${backup_name}"
evidence_path="${evidence_dir}/restore-${run_id}.txt"

cleanup() {
  docker rm --force "${container_name}" >/dev/null 2>&1 || true
  if [[ "${temporary_dir}" == /tmp/dar-tahara-restore.* ]]; then
    rm -rf -- "${temporary_dir}"
  else
    echo "Refusing to remove unexpected temporary path: ${temporary_dir}" >&2
  fi
}
trap cleanup EXIT

if [[ ! -r "${backup_env}" ]]; then
  echo "Backup environment is not readable: ${backup_env}" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${backup_env}"
set +a

for command_name in docker restic; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Required restore-test command is unavailable: ${command_name}" >&2
    exit 1
  fi
done

if [[ -z "${RESTIC_REPOSITORY:-}" || -z "${RESTIC_PASSWORD_FILE:-}" ]]; then
  echo "RESTIC_REPOSITORY and RESTIC_PASSWORD_FILE are required" >&2
  exit 1
fi

install -d -m 0700 "${evidence_dir}"

# The restore is downloaded only into a mode-0700 temporary directory and is
# destroyed by the EXIT trap. No production database is modified.
restic dump latest "${backup_name}" --tag postgres > "${dump_path}"
restic restore latest --tag storage --target "${temporary_dir}/storage-restore"
restored_storage_files="$(find "${temporary_dir}/storage-restore" -type f | wc -l | tr -d ' ')"
restored_storage_bytes="$(du -sb "${temporary_dir}/storage-restore" | awk '{print $1}')"
pg_restore_listing_count="$(docker exec -i dar-tahara-supabase-db pg_restore --list < "${dump_path}" | wc -l | tr -d ' ')"
if [[ "${pg_restore_listing_count}" -lt 1 ]]; then
  echo "The recovered archive contains no PostgreSQL objects" >&2
  exit 1
fi

postgres_image="$(docker inspect --format '{{.Config.Image}}' dar-tahara-supabase-db)"
test_password="$(od -An -N24 -tx1 /dev/urandom | tr -d ' \n')"
docker run --detach \
  --name "${container_name}" \
  --network none \
  --env "POSTGRES_PASSWORD=${test_password}" \
  "${postgres_image}" >/dev/null

for _ in $(seq 1 60); do
  if docker exec "${container_name}" pg_isready --username postgres --dbname postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "${container_name}" pg_isready --username postgres --dbname postgres >/dev/null
docker exec "${container_name}" createdb --username postgres restore_test
docker exec -i "${container_name}" \
  pg_restore --username postgres --dbname restore_test --no-owner --no-privileges --exit-on-error \
  < "${dump_path}"

restored_relations="$(docker exec "${container_name}" psql --username postgres --dbname restore_test --tuples-only --no-align --command \
  "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname not in ('pg_catalog','information_schema') and n.nspname not like 'pg_toast%' and c.relkind in ('r','p','v','m','S');")"
if [[ "${restored_relations}" -lt 1 ]]; then
  echo "Restore completed without application relations" >&2
  exit 1
fi

completed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
duration_seconds="$(( $(date +%s) - started_epoch ))"
snapshot_summary="$(restic snapshots --latest 1 --compact --tag postgres | tail -n 2 | head -n 1)"

{
  echo "control=A.5.30,A.8.13,A.8.14"
  echo "result=pass"
  echo "started_at=${started_at}"
  echo "completed_at=${completed_at}"
  echo "duration_seconds=${duration_seconds}"
  echo "archive_entries=${pg_restore_listing_count}"
  echo "restored_relations=${restored_relations}"
  echo "restored_storage_files=${restored_storage_files}"
  echo "restored_storage_bytes=${restored_storage_bytes}"
  echo "source_snapshot=${snapshot_summary}"
  echo "isolation=disposable_container_network_none"
  echo "production_modified=false"
} | tee "${evidence_path}"

logger --tag dar-tahara-restore-test --priority user.info -- \
  "Isolated PostgreSQL restore test passed; evidence=${evidence_path}"
