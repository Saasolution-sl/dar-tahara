#!/usr/bin/env bash
#
# Ensure Mautic's local.php has the parameters the 7.1.3 image does NOT read from
# environment variables. Run once after `mautic:install` (idempotent — safe to
# re-run).
#
# Why this exists: contrary to expectation, Mautic 7.1.3 does NOT overlay every
# MAUTIC_<PARAM> env var onto its config. In particular:
#   - trusted_proxies is read ONLY from local.php (app/middlewares/TrustMiddleware)
#     — without it Mautic never trusts Caddy's X-Forwarded-Proto, always thinks the
#     request is http, and 301-loops the login page behind TLS.
#   - mailer_dsn / mailer_from_* in local.php take precedence over the env vars,
#     and a fresh install leaves mailer_dsn at smtp://localhost:25.
#
# The actual edit runs INSIDE the container (the host has no PHP) via
# patches/configure-local.php, reading the mailer values from the container's
# environment (which compose populates from .env).
#
# Usage: sudo ./configure-local.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root" >&2; exit 1; }

STACK_DIR="/opt/projects/mautic"
cd "$STACK_DIR"

# Back up the current local.php from the config volume before touching it.
LOCAL_PHP="/var/lib/docker/volumes/mautic_mautic-config/_data/local.php"
[[ -f "$LOCAL_PHP" ]] || { echo "local.php not found (is Mautic installed?)" >&2; exit 1; }
cp "$LOCAL_PHP" "${LOCAL_PHP}.bak-$(date -u +%Y%m%dT%H%M%SZ)"

# Copy the editor into the running web container and execute it there. The
# container already has MAUTIC_MAILER_* in its environment (from compose).
docker compose cp patches/configure-local.php mautic-web:/tmp/configure-local.php
docker compose exec -T mautic-web php /tmp/configure-local.php
docker compose exec -T mautic-web php -l /var/www/html/config/local.php >/dev/null && echo "syntax OK"
docker compose exec -T mautic-web rm -f /tmp/configure-local.php || true

# Reload config across the app + workers and clear the compiled cache.
docker compose exec -T -u www-data mautic-web php /var/www/html/bin/console cache:clear >/dev/null 2>&1 || true
docker compose restart mautic-web mautic-cron mautic-worker >/dev/null 2>&1 || true
echo "done — Mautic reloaded with trusted_proxies + Resend mailer."
