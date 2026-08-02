# Release bundles

This document tracks the customer-platform work as staged deployment bundles. A
bundle may contain multiple commits, but it is promoted as one staging or
production release. Do not deploy a later bundle before its dependencies.

## Bundle 0 — repository safety — ✅ shipped

Merged into `main` via #36.

No application or database behavior changes.

## Bundle 1 — subscription pricing — ✅ shipped

Merged into `main` via #36 (subscription duration tiers, discounts,
validation, calculator, policies, FAQ content, and translations).

## Bundle 2 — identity, assessment, and account foundation — ✅ shipped

Merged into `main` via #37 and #38 (public auth, multi-profile roles,
assessment and manager workspaces, Stripe account/subscription primitives,
secure profile/company profile/property/payment-method setup).

## Bundle 3 — pause and deep-clean operations — PR #42 (draft)

Branch: `codex/bundle-03-pause-deep-clean` (base `main`).

Adds pause and deep-clean request workflows: eligibility, pricing, admin
approval UI, customer modals, API routes, a scheduled job, and 3 migrations.

Note: this branch's admin pages reference a type introduced in Bundle 4
(`src/i18n/admin-copy.ts`), so it does not typecheck standalone — merge
together with or before Bundle 4. Validated at the Bundle 3+4 combined tip.

Production gate:

- Add or verify dedicated, default-off kill switches for both workflows.
- Verify eligibility, approval, rejection, attachments, emails, Stripe pause/resume,
  and free deep-clean consumption in staging.
- Configure and execute the pause-request job deliberately; do not expose the UI
  before operations staff approve the workflow.

## Bundle 4 — invoice documents — PR #43 (draft)

Branch: `codex/bundle-04-invoices` (base `codex/bundle-03-pause-deep-clean`,
stacked on #42).

Adds invoice statements, unit filtering, PDF documents, and the admin invoice
view. Introduces `src/i18n/admin-copy.ts`.

Production gate:

- Visually review invoice, statement, and pause-notice PDFs.
- Verify ownership checks and downloads with at least two isolated customer accounts.
- Compare totals, discounts, payment references, and unit grouping against real fixtures.

## Bundle 5 — billing lifecycle — PR #44 (draft)

Branch: `codex/bundle-05-billing-lifecycle` (base `codex/bundle-04-invoices`,
stacked on #43).

Adds subscription activation, payment recovery, cancellation, early-termination
settlement, prepaid renewal, jobs, and extends the Stripe webhook handler.
6 migrations.

**Highest sensitivity bundle** — modifies the live Stripe webhook endpoint
(`src/app/api/stripe/webhook/route.ts`). Review that file personally
regardless of test results.

Production gate:

- Replay representative Stripe test-mode webhook events, including duplicates.
- Complete activation, failed payment, suspension, recovery, cancellation, settlement,
  and prepaid-renewal journeys end to end.
- Decide and configure schedules for billing collection and prepaid renewals.
- Verify migration backfills and constraints on production-like data.
- Keep subscription checkout and early termination disabled until smoke tests pass.

## Bundle 6 — HospitalitySupport portal — PR #45 (draft)

Branch: `codex/bundle-06-support-portal` (base `main`, independent of Bundles 3–5).

Adds the HospitalitySupport portal integration: provider API, attachments,
webhook, sync, database mappings, configuration, and runbook
(`docs/HOSPITALITY_SUPPORT.md`). 1 migration.

Production gate:

- Configure a staging mailbox, API token, webhook secret, sync secret, and private bucket.
- Verify ownership isolation, allowed attachments, webhook signature checks, deduplication,
  replies, unread state, resolution, reopening, and reconciliation.
- Keep the support portal unavailable until the provider and storage checks pass.

## Bundle 7 — admin integration — PR #46 (draft)

Branch: `codex/bundle-07-admin-console` (base `codex/bundle-05-billing-lifecycle`,
stacked on #44).

Localizes and expands the admin console navigation and tables for the
features shipped in Bundles 3–5.

Production gate:

- Verify all admin navigation destinations and role restrictions.
- Verify translated tables, feature controls, assessment actions, and dashboard queries.
- Deploy only after every admin destination being exposed has been approved.

## Resolved — migration timestamp ordering

Bundles 3–6 originally carried Supabase migration filenames timestamped
`20260729`–`20260801`, authored before Bundle 2's migrations (applied to
production up to `20260731160349`) were finalized — which would have applied
out of order against `supabase db push`'s watermark of already-applied
migrations. Renamed to `20260802180000`–`20260802180800` (preserving relative
order) so they sort after everything already in production. Still verify
against a staging database before running these against production —
renaming fixes the ordering, not the untested SQL itself.

## Apple Sign-In key rotation

Google and Apple Sign-In are both fully configured (Supabase Auth providers +
`NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` / `NEXT_PUBLIC_APPLE_AUTH_ENABLED` in Vercel
production). Prod and staging use separate, dedicated Google OAuth clients and
Apple Services IDs/keys — nothing is shared between environments.

Google's client secret does not expire. **Apple's does — Apple caps the
Sign-In-with-Apple client secret JWT at a 6-month lifetime, enforced by
Apple's own OAuth server, regardless of key or environment.** If a key isn't
rotated in time, web sign-in for that environment silently stops working.

| Environment | Key ID | Actual expiry | Rotate by (1 week buffer) |
| --- | --- | --- | --- |
| Production | `6G46RAL4L2` | 2027-01-27 14:35 UTC | **2027-01-20** |
| Staging | `2X9GGYDP7K` | 2027-01-29 19:19 UTC | **2027-01-22** |

To rotate: in Apple Developer (Certificates, Identifiers & Profiles → Keys),
register a new Sign in with Apple key against the same Services ID, download
the `.p8` (one-time download), generate a new client-secret JWT
(`iss`=Team ID `7U2425WHTJ`, `kid`=new Key ID, `aud`=`https://appleid.apple.com`,
`sub`=Services ID, max 6-month `exp`), and paste it into the environment's
Supabase Auth → Apple provider Secret Key field. The `.p8` files live in
`C:\Users\othma\keystores\apple-signin-keys\`.

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
