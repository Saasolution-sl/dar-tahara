# Dar Tahara VPS Supabase

The WhatsApp support service uses the external managed project configured by
`SUPABASE_URL`. Its production setup, cron worker, retention and rollback
procedure are documented in [`docs/WHATSAPP_SUPPORT.md`](../../docs/WHATSAPP_SUPPORT.md).

The VPS deployment uses the official self-hosted Supabase Docker bundle at
`/srv/dartahara/supabase`. Secrets and persistent volumes live only on the VPS;
they are not copied into this repository.

## Deployment layout

- Compose project: `dar-tahara-supabase`
- Private Docker network: `dar-tahara-supabase`
- Caddy network: external `public-net`
- Website: `https://www.dartahara.com`
- HTTPS API: `https://supabase.dartahara.com`
- PostgreSQL: not publicly exposed
- Studio: not publicly exposed
- Backups: encrypted Restic snapshots in a separate S3-compatible repository

The Kong host ports bind to `127.0.0.1` only. Caddy exposes only Supabase API
paths; the dashboard/root route returns 404.

## Encrypted off-site backups and restore tests

1. Install Restic 0.15 or newer and copy `backup.env.example` to
   `/etc/dar-tahara/backup.env`; make that file and the separate Restic password
   file root-owned and mode `0600`.
2. Use a dedicated bucket and S3 identity in an approved region. Grant only the
   permissions Restic needs for that bucket. Configure an owned alert webhook.
3. Initialize once with `restic init`, then install `backup-supabase.sh` and the
   root cron entry. The database dump streams directly from PostgreSQL into the
   encrypted repository and the self-hosted Storage volume is captured in a
   separate encrypted snapshot. The dump is not retained as plaintext on the VPS.
4. Run `test-supabase-restore.sh` after initial setup and at least quarterly.
   The script downloads the newest encrypted snapshot into a temporary mode-0700
   directory, restores it into a network-isolated disposable PostgreSQL
   container, restores the object-volume snapshot, records duration/database
   relation/object file and byte counts, and removes the plaintext test data.
5. Retain each generated file under `/srv/dartahara/restore-evidence` in the ISMS
   evidence store. Investigate every missed backup or failed restore as a
   security/continuity event.

The operations owner must verify the repository is truly on different failure
infrastructure from the production VPS. A local S3 gateway or a bucket backed by
the same host does not satisfy the off-site requirement.

## Host verification

Run `verify-host-hardening.sh` as root after provisioning, after material host or
network changes, and monthly. It is read-only and fails when the firewall, SSH
key-only access, NTP, automatic security updates, Docker socket permissions,
ASLR, private service bindings, or container privilege boundaries are not as
required. Store its timestamped output with the vulnerability scan in the ISMS
evidence store; a passing repository scan is not evidence that the live host is
hardened.

## Production cutover to Supabase Cloud

1. Create the hosted Supabase project in the final region.
2. Apply every committed file under `supabase/migrations` to the empty project.
3. Freeze writes on the VPS application during the cutover window.
4. Dump application schemas/data with `--no-owner --no-privileges` and restore
   through the hosted project's session pooler or direct connection.
5. Re-enable and verify RLS, grants, extensions, functions, triggers, and row
   counts. Recreate platform configuration such as API keys and Auth settings.
6. Copy Storage objects separately if Storage is introduced.
7. Replace the application's Supabase URL and keys, deploy, and run checkout and
   webhook smoke tests before directing production traffic to the hosted project.
8. Keep the VPS database read-only until the hosted backup and application have
   been verified, then retire it according to the retention policy.

For a low-volume staging database, a maintenance-window dump/restore is simpler
than logical replication. Use logical replication only if production write
volume later requires a near-zero-downtime cutover.
