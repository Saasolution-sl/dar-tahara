# Dar Tahara customer platform

## Architecture and responsibility

The Next.js application is the public website, Supabase Auth session boundary,
customer portal, staff/admin console and signed Stripe webhook receiver. Supabase
is the source of truth for identities, roles, customers, properties, assessments,
proposals, subscriptions, invoices, payments, feature flags and audit history.
HospitalitySupport is the source of truth for support conversations and agent
actions; Supabase stores the customer mapping, customer-visible cache, unread state,
integration events and idempotency records. Stripe owns payment collection and payment-method data. Mautic is
marketing automation only; it must not be used as an authorization or billing
source of truth.

All privileged writes use the server-only Supabase secret. Browser queries use
the publishable key and are constrained by RLS. Never expose the secret/service
role key, Stripe secret or webhook secret to a `NEXT_PUBLIC_*` variable.

## Roles and access

- `applicant`: can sign in and see only their own assessment status.
- `customer`: can see only their own customer, property, proposal, subscription,
  invoice, payment, support and activity records.
- `staff`: can operate the assessment queue, but cannot approve or reject.
- `administrator`: can approve/reject assessments, manage feature flags and view
  operational tables and the audit log.

The roles live in `public.user_roles`; the app does not trust editable user
metadata for authorization. `/admin` and every admin API enforce a staff/admin
role. Sensitive actions require administrator. Customer ownership is enforced
again in RLS, not only in route code.

## Controlled onboarding workflow

1. A visitor submits the Initial Home Assessment application only when
   `initial_assessment_booking_enabled` is active.
2. The server validates the request and creates the applicant, property and
   assessment. No payment or subscription is created.
3. When `customer_registration_enabled` is active, Supabase sends a controlled
   invitation and assigns the `applicant` role. Public self-sign-up stays off.
4. Staff review, contact, schedule, assign and complete the assessment.
5. An administrator approves or rejects it. Approval creates a `ready`
   subscription proposal and customer notification; it does not charge.
6. The customer signs in, reviews the proposal and explicitly accepts it.
7. If checkout and the chosen billing interval are enabled, the server creates
   an idempotent Stripe customer as needed and opens hosted Checkout.
8. Only a verified Stripe webhook activates the subscription and promotes the
   applicant to `customer`.

Legacy assessment payment and revised-estimate endpoints return `410` or redirect
to the controlled flow. There is no public arbitrary-property create/delete API.

## Feature flags

Administrators manage flags at `/admin/settings/features`. Each flag has an
enabled value, optional start/end time and optional public fallback content.
Enforcement exists in the visible UI, server routes and database-backed service
logic. Critical flag changes require confirmation and are audit logged.

Safe defaults in the migration:

- off: initial assessment booking, customer portal, subscription checkout;
- on: early access, controlled registration, monthly/annual billing, WhatsApp,
  newsletter signup.

The database is authoritative. If it is unavailable, sensitive capabilities fail
closed to the code defaults. For staged rollout, enable the portal first, then
assessment applications, and enable checkout only after Stripe webhook testing.

## Database deployment

Apply all migrations in order to the same project used by the application:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The main migration is
`supabase/migrations/20260715225139_secure_customer_onboarding_portal.sql`.
Before production, take a database backup. After applying, run the RLS assertions
in `supabase/tests/verify_customer_portal_rls.sql`, verify Auth redirect URLs and
confirm the private `assessment-attachments` storage bucket is not public.

## Customer sign-up and social providers

The public `/signup` flow supports email/password, Google and Apple. Keep **Confirm
email** enabled in Supabase Auth so password accounts cannot sign in until the
address is verified. The migration
`20260731133953_provision_public_auth_users.sql` links an Auth identity to an
existing customer with the same normalized email, or creates an applicant
profile. It never accepts a role from browser-controlled user metadata.

In the hosted Supabase project:

1. Set the Site URL to `https://www.dartahara.com` and allow
   `https://www.dartahara.com/auth/callback**` (plus the local callback in
   development).
2. Enable Google, add the Google web Client ID/secret, and register the Supabase
   callback shown in the provider panel with Google Auth Platform.
3. Enable Apple, configure the Services ID and generated client secret, and use
   `https://<project-ref>.supabase.co/auth/v1/callback` as Apple's return URL.
4. Rotate the Apple OAuth client secret at least every six months. Store the
   `.p8` signing key outside the repository and set an operational reminder.
5. Verify new password, Google, and Apple accounts each receive an `applicant`
   role and can only see their own customer data through RLS.

For local OAuth testing, set the four `SUPABASE_AUTH_EXTERNAL_*` values from
`.env.example`, switch the matching provider's `enabled` value in
`supabase/config.toml`, and restart the local stack. Provider credentials belong
in Supabase configuration, never in `NEXT_PUBLIC_*` application variables.

## Create the first administrator

Create or invite the named administrator in the Supabase Auth dashboard, copy
that user's UUID, then run as
a trusted database administrator:

```sql
insert into public.user_roles (user_id, role, granted_by)
values ('AUTH_USER_UUID', 'administrator', 'AUTH_USER_UUID')
on conflict (user_id, role) do nothing;
```

Use an individual identity, require a strong password and enable MFA in Supabase
when available for the project. Never create a shared operations account. Grant
`staff` in the same controlled way. Role changes are privileged database/admin
operations; no public role-management endpoint exists.

## Environment and provider setup

Required application values are documented in `.env.example`. In particular:

- Supabase URL, publishable key and secret/service-role key;
- `NEXT_PUBLIC_SITE_URL` and allowed Auth callback/reset redirect URLs;
- Stripe secret, webhook secret and optional customer-portal configuration;
- Resend transactional email values;
- Mautic integration credentials scoped to contacts/campaign work only.
- HospitalitySupport/FreeScout API, mailbox and webhook secrets described in
  `docs/HOSPITALITY_SUPPORT.md`.

`ADMIN_API_TOKEN` and `ADMIN_SESSION_SECRET` are retired. Supabase Auth cookies
replace the shared-token session. Remove the legacy values from secret stores.

In Stripe, register `/api/stripe/webhook` for Checkout, subscription, invoice,
payment and refund events. Store the endpoint signing secret only on the server.
Do not mark subscriptions active from a browser redirect.

## Admin operating guide

- `/admin/assessments`: filter the queue, review, contact, schedule, assign,
  complete, request information, approve or reject.
- `/admin/customers`, `/properties`, `/subscriptions`, `/invoices`: operational
  read views. Customer edits use explicit safe fields; sensitive history remains
  auditable.
- `/admin/settings/features`: staged rollout and emergency kill switches.
- `/admin/audit-log`: actor, action, resource and before/after evidence.

Avoid handling raw card data. Send customers to hosted Stripe Checkout or the
Stripe Customer Portal. Attachments belong in the private bucket and should be
served only after ownership/role checks with short-lived access.

## Verification checklist

```bash
npm test
npm run typecheck
npm run lint
npm run check:i18n
npm run build
```

In staging, test applicant, customer, staff and administrator accounts separately.
Verify cross-customer reads fail, direct disabled-feature API calls fail, staff
cannot approve/reject, a proposal does not create a charge, customer acceptance
opens Stripe, duplicate webhooks remain idempotent, and only a successful signed
webhook activates the subscription.

## Rollback

First turn off assessment booking, portal and checkout flags; this is the fastest
safe rollback and preserves records. Roll back the application deployment next.
The migration is deliberately additive: do not drop customer/payment/audit tables
during an incident. Restore from the pre-deployment backup only for confirmed data
corruption, after preserving Stripe webhook evidence and reconciling provider
state. Retain audit/payment history according to legal and accounting policy.
