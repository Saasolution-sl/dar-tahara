# Initial backup and restoration exercise plan

Status: **PREPARED — EXERCISE DATE/OWNER AND EXECUTION AUTHORIZATION REQUIRED**

Objective: prove that an in-scope managed Supabase database and private object
sample can be restored into an isolated, non-production environment and meet or
measure the proposed recovery targets. This plan does not authorize a production
restore or overwrite.

## Safe exercise boundary

1. Appoint the exercise owner, witness and stop authority.
2. Select a provider backup or approved encrypted export without customer data
   where possible; otherwise access is restricted and the restore target must be
   isolated.
3. Restore to a Supabase development branch, isolated temporary PostgreSQL or
   the repository's network-isolated restore harness. Never target production.
4. Restore a synthetic private object and its database metadata through
   supported Storage APIs; never write directly to `storage.objects`.
5. Validate schema/migration version, row counts/checksums, RLS, private bucket
   access, Auth separation and application read-only smoke paths.
6. Destroy or sanitize the temporary target through an approved cleanup after
   evidence is captured.

## Evidence record

Record source backup identifier (not credentials), system, restoration start
and completion, integrity method/result, measured RTO, source-to-backup data-loss
window (measured RPO), failures, corrective actions, witness and cleanup result.
Use `exercise-template.md`; do not mark the exercise complete from this plan.
