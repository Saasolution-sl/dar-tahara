# Early Access funnel simplification

Date: 2026-08-10

## Investigation findings before the change

1. The public localized `/early-access` page rendered `EarlyAccessForm`, a seven-step client flow: contact, billing, Moroccan property address/map, property information, services, access/smart-lock, and review/consent.
2. A durable `marketing_leads` row was created only after the final review step passed client and server validation, Turnstile, and anti-spam checks. Earlier field entry only updated a signup-session autosave row; it did not create a lead or Mautic contact.
3. Final persistence used `marketing_leads` as the email-idempotent anchor and replaced its one-to-one/one-to-many onboarding children in `billing_profiles`, `cleaning_properties`, `lead_service_preferences`, and `property_access_preferences`. Consent history is append-only in `lead_consents`; email verification uses hashed `email_verification_tokens`.
4. Mautic is called server-side through the direct REST API. `syncLeadAfterSubmit` reads the Supabase lead, upserts by normalized email, adds the standard Early Access/city-relevant attributes and tags, then writes contact ID, sync status, attempts, and a PII-safe error back to `marketing_leads`. It is not a Mautic HTML form.
5. Before final submit, abandonment left no lead. The newer `early_access_signup_sessions` and `early_access_funnel_events` instrumentation did retain an opaque-token-protected partial payload and safe step/error events, but the abandonment campaign still represented an incomplete seven-step Early Access form rather than optional onboarding.
6. Partial detailed information is stored only in the server-side signup session, never in browser storage; the browser stores only an opaque session ID/token. On completion the partial payload is cleared.
7. Existing analytics covered page/form actions plus durable view/start/step/field/error/completion events. It had no distinct first-conversion versus second-conversion timestamps.
8. `src/lib/geo/moroccan-cities.ts` is the canonical reusable city taxonomy. The searchable `MoroccanCitySelector` already consumes it, and Mautic provisions dynamic residence-city segments, including Tetouan, Tangier, Meknes, and Casablanca.
9. The seven-step UI, Maps/address parsing, property data mapping, smart-lock interest, service preferences, consent audit, autosave/resume tokens, abandonment job, Mautic client, and admin report were all reusable as customer onboarding.

## Implemented architecture

```text
/early-access
  -> first name + email + canonical city (or Other + required manual city) + required consent
  -> Supabase marketing_leads upsert (normalized-email unique)
  -> append-only consent evidence
  -> early_access_registered session state
  -> best-effort verification email + direct Mautic API upsert
  -> success: lead conversion is complete
  -> optional /early-access/onboarding
  -> existing seven-step flow, autosave and resume
  -> onboarding_started / current_step / last_activity
  -> detailed child-table persistence
  -> onboarding_completed (immediately suppresses reminders)
```

Mautic failure never rolls back the Supabase lead. Pending/retry-scheduled rows are retried by the existing authenticated Early Access cron endpoint. The normalized email unique index and Mautic find-then-edit-or-create behavior prevent unnecessary duplicates.

## Backward-compatible schema mapping

| Existing data | New meaning |
|---|---|
| `marketing_leads` | Still the durable lead/contact anchor; `last_name` is now optional for first-stage capture |
| `residence_city` | Canonical city marketing attribute; no duplicate `city` field was added to the lead |
| `lead_consents.policy_version/source/created_at` | Consent version, source/page, and timestamp audit evidence |
| `early_access_signup_sessions.current_step`, `last_activity_at` | Reused for detailed onboarding progress |
| legacy `completed_at` | Retained for compatibility |
| `early_access_registered_at` | First conversion timestamp |
| `onboarding_started_at` | Optional second-stage start timestamp |
| `onboarding_completed_at` | Optional second-stage completion timestamp |
| legacy seven-step child tables | Preserved without destructive migration |

The migration does not delete or truncate existing leads, onboarding children, consent history, events, or sessions.

## Deployment order

Apply `supabase/migrations/20260810101033_simplify_early_access_funnel.sql` before deploying the application code. The migration is additive except for relaxing `marketing_leads.last_name` to nullable, and it must be present before the new registration API writes the new session states and event names.
