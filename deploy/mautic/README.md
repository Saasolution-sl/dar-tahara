# Mautic — Dar Tahara marketing backend

Self-hosted **Mautic 7.1.3** at `https://marketing.saasolution.es`, the private
marketing automation and analytics backend for the Dar Tahara early-access
system. Runs on the SaaSolution VPS (`85.215.221.142`, reachable as `ssh vps`
over Tailscale) under Docker Compose at `/opt/projects/mautic`.

This directory is the version-controlled source of truth. Secrets are generated
on the server and never committed.

## Contents

| File | Purpose |
|------|---------|
| `docker-compose.yml` | web + MariaDB + cron + worker |
| `.env.example` | documents every variable (no real secrets) |
| `bootstrap.sh` | generates `/opt/projects/mautic/.env` with fresh secrets |
| `cron/mautic` | crontab bind-mounted into the cron container |
| `backup.sh` | nightly DB + volume backup, with verification |
| `provision.sh` | idempotent: custom fields, tags, roles, API user, segments |

## First deploy (already done 2026-07-15)

```bash
ssh vps
cd /opt/projects/mautic

# 1. Generate secrets (idempotent — refuses to overwrite an existing .env).
#    Pass the Resend DSN once available; otherwise mail parks on null://.
sudo ./bootstrap.sh --mailer-dsn 'smtp://resend:re_XXXX@smtp.resend.com:587'

# 2. Bring the DB up first so it seeds cleanly, then the web app.
sudo docker compose up -d mautic-db
sudo docker compose up -d mautic-web        # seeds the shared plugin/theme volumes
#    (starting all four at once races on volume creation — start web alone first)

# 3. Install Mautic (schema + admin user). Admin password is generated and
#    written to /root/mautic-admin-credentials.txt (root 0600).
#    See the install one-liner in project history; re-running is a no-op once
#    installed.

# 4. Start automation.
sudo docker compose up -d mautic-cron mautic-worker

# 5. Write the config the image does NOT read from env (trusted_proxies + the
#    Resend mailer DSN). REQUIRED — without trusted_proxies the login page
#    301-loops behind Caddy, and mailer_dsn otherwise stays at localhost:25.
sudo ./configure-local.sh

# 6. Provision the data model (fields, tags, roles, API user, segments).
sudo ./provision.sh
```

## Known upstream issues handled here

- **Login page 500 (Twig)** — Mautic 7.1.3 on PHP 8.3 throws
  `includeWithEvent(): Return value must be of type string, Twig\Markup returned`.
  Fixed by `patches/OverrideIncludeExtension.php` (bind-mounted read-only in
  `docker-compose.yml`). Remove the patch + mount once upstream ships a fix.
- **Login redirect loop** — `trusted_proxies` must be in `local.php` (the env var
  is ignored). Handled by `configure-local.sh`.
- **Mail parked on localhost:25** — `mailer_dsn` in `local.php` takes precedence
  over the env var. Also handled by `configure-local.sh`.

## Cron — how to verify it is running

Campaigns, segment membership and broadcast emails advance ONLY because
`mautic-cron` runs `bin/console` on a schedule. To confirm:

```bash
# The registered crontab (should show 8 console jobs, incl. broadcasts + webhooks):
sudo docker compose exec mautic-cron crontab -l -u www-data | grep console

# Cron output lands in the container log (jobs run without --quiet so success
# is visible). Watch a segment/campaign tick go by:
sudo docker compose logs -f --since 20m mautic-cron

# Run a job by hand to confirm the console works in the cron context:
sudo docker compose exec -u www-data mautic-cron \
  php bin/console mautic:segments:update
```

If automation "works in the UI" but nothing ever sends, `mautic-cron` is the
first thing to check.

## Backups

`/etc/cron.d/mautic-backup` runs `backup.sh` nightly at 03:20 UTC into
`/opt/backups/mautic/<timestamp>/` (DB dump + config/media/themes/plugins
archives), keeping 14 days. Each run verifies the gzip is valid and non-trivial,
so a truncated dump fails loudly instead of silently.

Run one on demand: `sudo /opt/projects/mautic/backup.sh`

### Restore

```bash
cd /opt/projects/mautic
BK=/opt/backups/mautic/<timestamp>

# 1. Stop the app tier (keep the DB running).
sudo docker compose stop mautic-web mautic-cron mautic-worker

# 2. Restore the database.
zcat "$BK/mautic-db.sql.gz" | \
  sudo docker compose exec -T mautic-db \
  mariadb -uroot -p"$(sudo sed -n 's/^MAUTIC_DB_ROOT_PASSWORD=//p' .env)"

# 3. Restore a volume (repeat per volume: config, media, themes, plugins).
sudo docker run --rm \
  -v mautic_mautic-config:/dest \
  -v "$BK":/src:ro \
  alpine:3.20 sh -c 'rm -rf /dest/* && tar xzf /src/mautic-config.tar.gz -C /dest'

# 4. Bring the app back up.
sudo docker compose up -d
```

## Rotating secrets

`bootstrap.sh` never rotates an existing `.env`. To rotate the DB password you
must change it in MariaDB and the `.env` together, or the app locks itself out:

```bash
sudo docker compose exec mautic-db \
  mariadb -uroot -p'<root pw>' \
  -e "ALTER USER 'mautic'@'%' IDENTIFIED BY '<new pw>'; FLUSH PRIVILEGES;"
# then edit MAUTIC_DB_PASSWORD in .env and: sudo docker compose up -d
```

Rotating `MAUTIC_SECRET_KEY` only invalidates sessions (no data loss).

## Updating Mautic

Bump `MAUTIC_IMAGE_TAG` in `.env` to the next patch/minor, then
`sudo docker compose pull && sudo docker compose up -d`. The web container runs
pending DB migrations on boot. **Back up first** (`sudo ./backup.sh`) and never
jump a major version without reading the Mautic upgrade notes.

## Known blockers (need action outside this box)

1. **DNS** — `marketing.saasolution.es` has no A record. Add
   `A marketing → 85.215.221.142` at GoDaddy; Caddy then issues the TLS cert
   automatically. Until then the site is only reachable internally.
2. **Mail** — set a real Resend DSN (`MAUTIC_MAILER_DSN`) and verify
   `dartahara.com` in Resend (DKIM/SPF) before any production send.
