# Retention governance approval pack

Status: **DECISION PACK — NO RETENTION PERIOD IS APPROVED BY THIS DOCUMENT**

Owners: Legal/Privacy, Finance, HR, Operations and the ISMS Manager

The linked `retention-approval-register.csv` is the complete decision worksheet
for the 13 categories already enforced by the application control plane. Empty
periods are intentional: jurisdiction, contractual obligations, claim periods,
data-subject expectations and operational needs must be decided by the named
record owner and Legal/Privacy. A repository author cannot make those decisions.

## Required decisions

For every row, record the trigger as well as the number of days. Decide how
closure, inactive accounts, minors, disputes, tax evidence, employee claims,
consent withdrawal and supplier copies affect the period. Identify deletion in
Supabase/Auth, Cubbit, Stripe, Mautic, support systems and backups. Define the
legal-hold scope and who can create/release a hold. Legal interpretations are
**LEGAL REVIEW REQUIRED**.

## Activation sequence

1. Legal/Privacy and the record owner complete and sign every applicable row.
2. Security enters approved values into `retention_policy_rules`, including the
   approver, approval time and a review date no more than one year away.
3. Operations keeps `RETENTION_EXECUTION_ENABLED=false` and runs synthetic
   dry-run, legal-hold and supplier/object deletion tests.
4. Review the candidate counts and evidence. Never use real customer records as
   the initial test population.
5. Management authorizes an execution window and rollback/stop owner.
6. Enable execution, run the approved categories, reconcile every system and
   retain the redacted `retention_execution_log` extract.

The current safe state is disabled and fail-closed. It must remain so until the
signed register and synthetic lifecycle evidence exist.
