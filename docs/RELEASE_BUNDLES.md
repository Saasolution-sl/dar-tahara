# Release bundles

This branch packages the customer-platform work into deployment bundles. A bundle
may contain multiple commits, but it is promoted as one staging or production
release. Do not deploy a later bundle before its dependencies.

## Bundle 0 — repository safety

- `40b53f7` — ignore local Codex and Ruflo runtime artifacts
- `4c49c49` — clarify canonical logo guidance

No application or database behavior changes. Include these commits with the first
functional release.

## Bundle 1 — subscription pricing

- `027433b` — subscription duration tiers, discounts, validation, calculator,
  policies, FAQ content, and translations

Dependencies: Bundle 0.

Production gate:

- Apply the three duration migrations successfully in staging.
- Compare 3-, 6-, 9-, and 12-month quotes against the approved price examples.
- Confirm the terms and translated discount/pause wording.
- Keep initial assessment booking controlled by its existing feature flag.

## Bundle 2 — identity, assessment, and account foundation

- `dbc99fe` — public auth, multi-profile roles, assessment and manager workspaces
- `a1a19b8` — Stripe account and subscription primitives
- `2f20c5b` — secure profile, company profile, property, and payment-method setup

Dependencies: Bundle 1.

Production gate:

- Verify password signup, email confirmation, Google, Apple, and existing-customer linking.
- Verify applicant, customer, company, assessment, manager, staff, and administrator isolation.
- Verify Stripe Setup mode without charging a customer.
- Apply migrations to production-like data and run RLS/security checks.
- Keep registration, customer portal, and subscription checkout flags disabled during deployment.

## Bundle 3 — pause and deep-clean operations

- `3470dd1` — customer lifecycle email templates
- `d530be6` — pause and deep-clean request workflows

Dependencies: Bundles 1 and 2.

Production gate:

- Add or verify dedicated, default-off kill switches for both workflows.
- Verify eligibility, approval, rejection, attachments, emails, Stripe pause/resume,
  and free deep-clean consumption in staging.
- Configure and execute the pause-request job deliberately; do not expose the UI
  before operations staff approve the workflow.

## Bundle 4 — invoice documents

- `b2099c7` — invoice statements, unit filtering, PDF documents, and admin invoice view

Dependencies: Bundles 1 through 3.

Production gate:

- Visually review invoice, statement, and pause-notice PDFs.
- Verify ownership checks and downloads with at least two isolated customer accounts.
- Compare totals, discounts, payment references, and unit grouping against real fixtures.

## Bundle 5 — billing lifecycle

- `b748c0f` — subscription activation, payment recovery, cancellation, settlement,
  prepaid renewal, jobs, and Stripe webhook lifecycle

Dependencies: Bundles 1 through 4.

Production gate:

- Replay representative Stripe test-mode webhook events, including duplicates.
- Complete activation, failed payment, suspension, recovery, cancellation, settlement,
  and prepaid-renewal journeys end to end.
- Decide and configure schedules for billing collection and prepaid renewals.
- Verify migration backfills and constraints on production-like data.
- Keep subscription checkout and early termination disabled until smoke tests pass.

## Bundle 6 — HospitalitySupport portal

- `9f7d3ea` — HospitalitySupport portal, provider API, attachments, webhook, sync,
  database mappings, configuration, and runbook

Dependencies: Bundle 2. It can be released before Bundles 3–5 if independently verified.

Production gate:

- Configure a staging mailbox, API token, webhook secret, sync secret, and private bucket.
- Verify ownership isolation, allowed attachments, webhook signature checks, deduplication,
  replies, unread state, resolution, reopening, and reconciliation.
- Keep the support portal unavailable until the provider and storage checks pass.

## Bundle 7 — admin integration

- `36745e5` — localized and expanded admin console

Dependencies: Deploy only after every admin destination being exposed has been approved.

Production gate:

- Verify all admin navigation destinations and role restrictions.
- Verify translated tables, feature controls, assessment actions, and dashboard queries.

## Required verification for every bundle

Before production approval, run:

1. `npm test`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run check:i18n`
5. `npm run build`
6. Applicable Supabase migration, RLS, advisor, and upgrade tests in staging
7. Manual browser smoke tests for the affected customer and staff journeys

Only one bundle is approved at a time. A later bundle is not implicitly approved
when an earlier bundle is accepted.
