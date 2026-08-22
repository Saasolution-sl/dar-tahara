# Staging identity and CSP evidence cycle — 2026-08-22

Evidence state: **TECHNICAL TESTS VERIFIED — BROWSER JOURNEY WINDOW OPEN**

No credentials, user identifiers or secret values are retained here.

## Synthetic staging identities

- Project guard required Supabase staging ref `ehzrroohsmwdkebezhiy`.
- Existing staging isolation verifier created two synthetic customer-side
  identities, exercised customer/company isolation, blocked cross-user writes,
  blocked role escalation and blocked anonymous access.
- `scripts/verify-iso-staging-identities.ts` created a transient least-privilege
  staff identity/profile, verified authentication, own-role/own-safe-field
  access, private-field denial, role-escalation denial, separation from customer
  provisioning and required MFA step-up for privileged AAL1.
- Both test runs deleted their temporary identities. Cleanup returned `PASS`
  with zero labelled orphan accounts.

## Feature and CSP observations

- Managed production and staging Supabase projects were `ACTIVE_HEALTHY` in
  `eu-west-1`.
- Each project contained four private buckets: assessment attachments,
  assessment confirmations, pause-request attachments and support attachments.
- Neither project published a table to `supabase_realtime`; no application
  Realtime subscription was found.
- Production public, login, MFA, account and admin responses carried CSP
  report-only where middleware applied. Staging enforcement was previously
  verified from the deployed runtime (`enforced=true`, `reportOnly=false`).
- The current production seven-day log contains one controlled `script-src`
  report in the legacy minimized format. That format has no origin/route fields,
  so it cannot independently prove the affected journey.

## Remediation and remaining gate

The report endpoint now sanitizes full CSP URLs to origin-only fields and a
coarse route class; paths, identifiers, queries, fragments and content are not
stored. Unit tests verify this minimization. Production must remain report-only
until the enriched build is deployed, at least seven consecutive days of
representative traffic are collected, staging browser journeys pass and an
Operations/CSP rollback owner is assigned.
