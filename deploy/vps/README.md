# Dar Tahara VPS Supabase

The VPS deployment uses the official self-hosted Supabase Docker bundle at
`/srv/dartahara/supabase`. Secrets and persistent volumes live only on the VPS;
they are not copied into this repository.

## Deployment layout

- Compose project: `dar-tahara-supabase`
- Private Docker network: `dar-tahara-supabase`
- Caddy network: external `public-net`
- Website: `https://dartahara.com`
- HTTPS API: `https://supabase.dartahara.com`
- PostgreSQL: not publicly exposed
- Studio: not publicly exposed
- Backups: `/srv/dartahara/backups`, retained for 14 days

The Kong host ports bind to `127.0.0.1` only. Caddy exposes only Supabase API
paths; the dashboard/root route returns 404.

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
