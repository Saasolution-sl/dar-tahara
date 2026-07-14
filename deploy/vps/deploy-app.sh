#!/usr/bin/env bash
set -euo pipefail

app_dir="/srv/dartahara/app"
release_dir="${app_dir}/release"
app_env="${app_dir}/.env"
image_tag="${1:-latest}"
image="dar-tahara-web:${image_tag}"

publishable_key="$(sed -n 's/^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=//p' "${app_env}" | head -n 1)"
supabase_url="$(sed -n 's/^NEXT_PUBLIC_SUPABASE_URL=//p' "${app_env}" | head -n 1)"
# Optional: GA4 measurement id. NEXT_PUBLIC_* is inlined at build time, so it
# must be passed as a build arg. Empty simply means analytics stays disabled.
ga_measurement_id="$(sed -n 's/^NEXT_PUBLIC_GA_MEASUREMENT_ID=//p' "${app_env}" | head -n 1)"

if [[ -z "${supabase_url}" || -z "${publishable_key}" ]]; then
  echo "Supabase URL or publishable key is missing from ${app_env}" >&2
  exit 1
fi

docker build \
  --build-arg "NEXT_PUBLIC_SUPABASE_URL=${supabase_url}" \
  --build-arg "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable_key}" \
  --build-arg NEXT_PUBLIC_SITE_URL=https://dartahara.com \
  --build-arg "NEXT_PUBLIC_GA_MEASUREMENT_ID=${ga_measurement_id}" \
  --tag "${image}" \
  "${release_dir}"

DAR_TAHARA_IMAGE="${image}" docker compose \
  --file "${app_dir}/app.compose.yml" \
  up --detach --remove-orphans
