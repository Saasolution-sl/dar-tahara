#!/usr/bin/env bash
set -euo pipefail

supabase_env="/srv/dartahara/supabase/.env"
app_dir="/srv/dartahara/app"
app_env="${app_dir}/.env"

install -d -m 0700 "${app_dir}"

read_value() {
  sed -n "s/^$1=//p" "$2" | head -n 1
}

publishable_key="$(read_value SUPABASE_PUBLISHABLE_KEY "${supabase_env}")"
secret_key="$(read_value SUPABASE_SECRET_KEY "${supabase_env}")"

if [[ -z "${publishable_key}" || -z "${secret_key}" ]]; then
  echo "Supabase API keys are missing" >&2
  exit 1
fi

admin_api_token="$(read_value ADMIN_API_TOKEN "${app_env}" 2>/dev/null || true)"
admin_session_secret="$(read_value ADMIN_SESSION_SECRET "${app_env}" 2>/dev/null || true)"
stripe_secret_key="$(read_value STRIPE_SECRET_KEY "${app_env}" 2>/dev/null || true)"
stripe_webhook_secret="$(read_value STRIPE_WEBHOOK_SECRET "${app_env}" 2>/dev/null || true)"

[[ -n "${admin_api_token}" ]] || admin_api_token="$(openssl rand -hex 32)"
[[ -n "${admin_session_secret}" ]] || admin_session_secret="$(openssl rand -hex 32)"

umask 077
{
  printf 'NODE_ENV=production\n'
  printf 'NEXT_PUBLIC_SITE_URL=https://dartahara.com\n'
  printf 'NEXT_PUBLIC_SUPABASE_URL=https://supabase.dartahara.com\n'
  printf 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=%s\n' "${publishable_key}"
  printf 'SUPABASE_SECRET_KEY=%s\n' "${secret_key}"
  printf 'ADMIN_API_TOKEN=%s\n' "${admin_api_token}"
  printf 'ADMIN_SESSION_SECRET=%s\n' "${admin_session_secret}"
  printf 'STRIPE_SECRET_KEY=%s\n' "${stripe_secret_key}"
  printf 'STRIPE_WEBHOOK_SECRET=%s\n' "${stripe_webhook_secret}"
} > "${app_env}"

chmod 0600 "${app_env}"
