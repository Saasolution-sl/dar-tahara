#!/usr/bin/env bash
set -euo pipefail

app_dir="/srv/dartahara/app"
release_dir="${app_dir}/release"
app_env="${app_dir}/.env"
image_tag="${1:-latest}"
image="dar-tahara-web:${image_tag}"

publishable_key="$(sed -n 's/^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=//p' "${app_env}" | head -n 1)"

docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://supabase.dartahara.com \
  --build-arg "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable_key}" \
  --build-arg NEXT_PUBLIC_SITE_URL=https://dartahara.com \
  --tag "${image}" \
  "${release_dir}"

DAR_TAHARA_IMAGE="${image}" docker compose \
  --file "${app_dir}/app.compose.yml" \
  up --detach --remove-orphans
