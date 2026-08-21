# Data retention and deletion procedure

Status: **DRAFT — APPROVAL AND LIVE VALIDATION REQUIRED**

1. The record owner proposes each category, systems/suppliers, legal basis, period, deletion method and exceptions.
2. Legal/Privacy and the owner approve the rule in `retention_policy_rules`; disabled/TBD rules cannot delete data.
3. An authorized role records legal holds before litigation, investigation or preservation needs arise. A category hold blocks bulk deletion conservatively.
4. Operations runs with `RETENTION_EXECUTION_ENABLED=false`, reviews the blocked/dry-run evidence, then enables execution only in an approved maintenance window.
5. The job deletes through supported database or provider APIs. Direct SQL deletion from Supabase Storage metadata is prohibited because it can orphan objects.
6. Operations reconciles database, object storage and supplier results, records failures/corrective actions, and samples non-recoverability outside backups.

Acceptance evidence: approved rule export, synthetic record lifecycle, supplier/object deletion receipt, legal-hold negative test and `retention_execution_log` extract. Rollback is quarantine or stopped execution; deleted production records are not restored without owner/legal approval.
