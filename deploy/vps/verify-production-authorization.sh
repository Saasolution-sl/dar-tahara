#!/usr/bin/env bash
set -euo pipefail

audit_sql="${1:-/srv/dartahara/app/supabase/tests/iso27001_production_authorization_audit.sql}"

if [[ ! -r "${audit_sql}" ]]; then
  echo "Authorization audit SQL is not readable: ${audit_sql}" >&2
  exit 1
fi

docker exec -i dar-tahara-supabase-db \
  psql --username postgres --dbname postgres --no-psqlrc --set ON_ERROR_STOP=1 \
  < "${audit_sql}"

echo "production_authorization_audit_passed"
