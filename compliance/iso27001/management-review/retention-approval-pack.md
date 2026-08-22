# Retention governance approval pack

Status: **PROPOSED SCHEDULE — NO RETENTION PERIOD OR ACTIVATION IS APPROVED BY THIS DOCUMENT**

Owners: Legal/Privacy, Finance, HR, Operations and the ISMS Manager

The linked `retention-approval-register.csv` is the complete decision worksheet
for the 13 categories supported by the application control plane. It contains
impact-based working proposals, not approved legal periods. Every row remains
`PROPOSED — LEGAL REVIEW REQUIRED`; approval dates, review dates and activation
approval are deliberately empty. The statutory candidates and source links are
explained in `retention-schedule-proposal.md`.

## Required decisions

For every row, Legal/Privacy and the record owner must confirm or replace the
proposal and trigger. Decide how closure, inactive accounts, minors, disputes,
tax evidence, employee claims, consent withdrawal and supplier copies affect
the period. Identify deletion in Supabase/Auth, Cubbit, Stripe, Mautic, support
systems and backups. Until a Legal/Privacy owner is appointed, only the
Executive/Management Approver may authorize or release a legal hold, and only
after legal advice. Legal interpretations are **LEGAL REVIEW REQUIRED**.

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
