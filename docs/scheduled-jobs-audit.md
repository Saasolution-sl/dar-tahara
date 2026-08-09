# Scheduled jobs: what runs, what doesn't

Audited 2026-08-10.

Eight job routes exist under `src/app/api/jobs/`. Three were scheduled in
`vercel.json`; `billing-collection` has now been added as a fourth. **Four
remain unscheduled and are therefore dead code in production.**

| Job | Scheduled | Accepts `CRON_SECRET` | Side effects | Recommendation |
| --- | --- | --- | --- | --- |
| `assistant` | yes | — | — | running |
| `assessment-confirmations-retention` | yes | — | deletes stale PII | running |
| `hospitality-support-sync` | yes | yes | sync | running |
| `billing-collection` | **now yes** | **now yes** | emails, suspends subscriptions, cancels Stripe subs | enabled 2026-08-10 |
| `early-access` | no | **yes** | purges stale signup PII, abandonment job | **enable** - see below |
| `whatsapp` | no | no | deletes WhatsApp data past retention | **enable**, needs secret fix |
| `pause-requests` | no | no | syncs pause/subscription status to approved dates | **enable**, needs secret fix |
| `prepaid-renewals` | no | no | **raises renewal invoices, emails customers, sets Stripe cancel_at_period_end** | needs a decision, not just a schedule |

## The `CRON_SECRET` trap

Vercel calls a scheduled route with `Authorization: Bearer $CRON_SECRET` and
nothing else. A route that only accepts its own dedicated secret will return
401 every night while looking perfectly configured in `vercel.json`.

Of the unscheduled four, only `early-access` already accepts `CRON_SECRET`.
`whatsapp`, `pause-requests` and `prepaid-renewals` each accept only an admin
session or their own secret, so scheduling them **without** either adding the
fallback or setting their secret equal to `CRON_SECRET` would achieve nothing.

`billing-collection` had exactly this problem and the fallback was added when
it was scheduled.

## Why two of these matter beyond features

`early-access` calls `purgeStaleSignupSessionPii()` and `whatsapp` calls
`runWhatsAppRetention()`. Both are **data-retention jobs**. Neither has ever
run, which means personal data that was meant to be purged on a schedule has
been retained indefinitely. That is a compliance question rather than a bug,
and it is the reason these two are worth attention before the feature-shaped
ones.

`early-access` also runs an abandonment job that may email people, so it is
worth reading that path before enabling rather than assuming it is purely a
purge.

## Why `prepaid-renewals` was not enabled

It selects active annual subscriptions approaching `current_period_end` and,
depending on renewal state, raises a renewal invoice, emails the customer, and
can set `cancel_at_period_end` on the Stripe subscription. Switching that on is
a decision about billing behaviour, not a scheduling fix, and it was left alone
deliberately.

Note it reuses `BILLING_COLLECTION_JOB_SECRET` rather than having its own.

## Suggested next step

Enable `early-access`, `whatsapp` and `pause-requests` together, adding the
`CRON_SECRET` fallback to the two that lack it, and stagger them away from the
existing 02:00-03:00 block. Handle `prepaid-renewals` separately once the
renewal behaviour is confirmed.
