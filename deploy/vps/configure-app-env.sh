#!/usr/bin/env bash
set -euo pipefail

supabase_env="${SUPABASE_ENV_FILE:-/srv/dartahara/app/supabase.env}"
app_dir="/srv/dartahara/app"
app_env="${app_dir}/.env"

install -d -m 0700 "${app_dir}"

read_value() {
  sed -n "s/^$1=//p" "$2" | head -n 1
}

supabase_url="$(read_value SUPABASE_URL "${supabase_env}")"
publishable_key="$(read_value SUPABASE_PUBLISHABLE_KEY "${supabase_env}")"
secret_key="$(read_value SUPABASE_SECRET_KEY "${supabase_env}")"

if [[ -z "${supabase_url}" || -z "${publishable_key}" || -z "${secret_key}" ]]; then
  echo "Supabase URL or API keys are missing from ${supabase_env}" >&2
  exit 1
fi

admin_api_token="$(read_value ADMIN_API_TOKEN "${app_env}" 2>/dev/null || true)"
admin_session_secret="$(read_value ADMIN_SESSION_SECRET "${app_env}" 2>/dev/null || true)"

[[ -n "${admin_api_token}" ]] || admin_api_token="$(openssl rand -hex 32)"
[[ -n "${admin_session_secret}" ]] || admin_session_secret="$(openssl rand -hex 32)"

umask 077
new_app_env="$(mktemp "${app_dir}/.env.XXXXXX")"
trap 'rm -f "${new_app_env}"' EXIT

{
  printf 'NODE_ENV=production\n'
  printf 'NEXT_PUBLIC_SITE_URL=https://dartahara.com\n'
  printf 'SUPABASE_URL=%s\n' "${supabase_url}"
  printf 'NEXT_PUBLIC_SUPABASE_URL=%s\n' "${supabase_url}"
  printf 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=%s\n' "${publishable_key}"
  printf 'SUPABASE_SECRET_KEY=%s\n' "${secret_key}"
  printf 'ADMIN_API_TOKEN=%s\n' "${admin_api_token}"
  printf 'ADMIN_SESSION_SECRET=%s\n' "${admin_session_secret}"

  if [[ -f "${app_env}" ]]; then
    grep -Ev '^(NODE_ENV|NEXT_PUBLIC_SITE_URL|SUPABASE_URL|SUPABASE_ANON_KEY|SUPABASE_PUBLISHABLE_KEY|NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|ADMIN_API_TOKEN|ADMIN_SESSION_SECRET)=' "${app_env}" || true
  fi
} > "${new_app_env}"

chmod 0600 "${new_app_env}"
mv -f "${new_app_env}" "${app_env}"
trap - EXIT
