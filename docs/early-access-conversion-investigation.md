# Dar Tahara Early Access conversion investigation

Date: 2026-08-09
Scope: `www.dartahara.com/[locale]/early-access`, the Dar Tahara Next.js API and Supabase data, and the direct Mautic API integration.
Production work during investigation: read-only. No signup was submitted and no production data was changed.

## Executive conclusion

The current data cannot identify the step where historical visitors abandoned. It records a server-side page render, a few optional client analytics actions, and the final successful submission, but it has no durable signup session, step transition, field error, autosave, or abandonment record.

Three findings are actionable now:

1. The current visit denominator is bot-inflated. Supabase contains 642 early-access page renders from 168 salted IP hashes. Two bursts account for 148 and 171 English renders from only two hashes on each day. These are not credible human funnel sessions.
2. Four logical early-access submissions exist in Supabase: two verified and two pending. All four report a successful Mautic sync. Only one still exists in Mautic because three mapped contacts were manually deleted; this is a cross-system deletion/reconciliation problem, not proof that the other visitors failed to register.
3. The deployed Google address loader initially degrades the billing address field to manual entry even though the Maps scripts arrive. The repository already contains an uncommitted loader-race correction. The deployed form otherwise reached all seven steps, Turnstile generated a token, and no browser-console errors appeared during a read-only test.

The correct next move is to deploy privacy-safe signup sessions and funnel events, observe real sessions, and only then change the larger form UX. The implementation must keep reminder consent separate from newsletter marketing consent and remain disabled until the legal/operational review and Mautic campaign review are complete.

## 1. Current signup architecture

```text
Localized early-access page
  -> EarlyAccessForm (client, seven steps)
  -> POST /api/early-access/submit
  -> validate + rate-limit + honeypot + Turnstile
  -> Supabase service-role persistence
       marketing_leads (email-idempotent anchor)
       billing_profiles
       cleaning_properties
       lead_service_preferences
       property_access_preferences
       lead_consents
       email_verification_tokens
  -> verification email via Resend (best effort)
  -> direct Mautic API upsert by normalized email (best effort)
  -> GET /api/early-access/verify
  -> Supabase verification update + Mautic re-sync + welcome email
```

The browser tracker and server API create different Mautic identities. Anonymous page tracking does not merge the browser's cookie lead with the server-created identified contact. Mautic anonymous contacts must therefore not be treated as incomplete form submissions.

## 2. Real signup steps

| Index | Step id | Visible purpose | Required before continuing |
|---:|---|---|---|
| 0 | `contact` | Name, email, telephone/WhatsApp preference, language, Moroccan residence city | First name, last name, valid email, city, and a telephone/WhatsApp number unless email-only contact is selected |
| 1 | `billing` | Customer/invoice address | Address line, building/unit number, city, country; company name for a business |
| 2 | `property_address` | Moroccan service property and operational entrance | Property address, building/unit number, city, separate Google Maps URL, and authorization acknowledgement |
| 3 | `property_info` | Type, size, rooms, occupancy and condition | No substantive field is required |
| 4 | `services` | Desired services, frequency and timing | At least one service |
| 5 | `access` | Property access method and smart-lock offer | Access method; conditional acknowledgements/choice for physical key or digital lock |
| 6 | `review` | Accuracy, authority, privacy, operational communication and optional marketing | Accuracy, authority, privacy and operational-communication acknowledgements; marketing remains optional |

The page promises about three minutes, but it asks an early-access prospect for billing information, a complete property location, operational access planning, and consent before the request is saved. That may be rational for onboarding, but it is much heavier than a typical expression-of-interest form. Telemetry must establish whether that is actually causing abandonment before restructuring it.

## 3. Existing analytics capability

### Available

- Cookieless server render counter in `early_access_page_views` with locale, URL attribution parameters, timestamp, and salted IP hash.
- Optional consent-gated client events forwarded to GA/Plausible/dataLayer:
  - early-access page viewed;
  - form started;
  - form submitted;
  - billing/property address selected;
  - property pin moved;
  - smart-lock choice;
  - email verified.
- Supabase final-submission and verification timestamps.
- Mautic contact create/update audit evidence.

### Missing

- A durable `signup_session_id`.
- Start, step-viewed and step-completed events connected to one attempt.
- Field focus/completion state.
- Client and server validation-error events.
- Google address lookup outcome events.
- API error category and status.
- Time on step and total completion time.
- Device/browser/source conversion linked to a signup attempt.
- Autosave and resume.
- Abandonment classification.
- Reminder delivery/resume/completion attribution.

## 4. Existing technical errors and degradation

### Observed

- The first Google-powered billing-address component showed the manual-entry fallback while Maps scripts loaded. The deployed loader resolves on an outer script load and can race `importLibrary`; the worktree contains a replacement based on Google's dynamic import bootstrap.
- The fallback is not fatal, but it increases work. On the next property-address step the loader retried and became usable.
- The property step separately requires a Google Maps URL even when the visitor types the address manually. The worktree contains an autofill improvement when coordinates are known, but a manual-address visitor can still face this requirement.
- The server page counter accepts large automated bursts that the current user-agent filter does not remove.
- Three Supabase rows marked synchronized reference Mautic IDs that administrators deleted. No reconciliation worker repairs them.

### Not observed in the retained evidence

- No retained Next.js early-access error log entries.
- No browser console error during the seven-step production walkthrough.
- Turnstile loaded and produced a challenge token on the review step.
- The current four Supabase leads all show `mautic_sync_status=synchronized`.
- No evidence of duplicate current email rows; the final persistence and Mautic sync are email-idempotent.

Absence of retained errors is not proof of absence. The application currently logs coarse server failures but lacks an error event joined to a signup session, and Caddy has no usable per-request access log for this reconstruction.

## 5. Historical abandonment data that can be recovered

| Evidence | Value | Reliability |
|---|---:|---|
| Supabase early-access page renders | 642 | Exact rows, but bot-inflated and not human visits |
| Distinct salted IP hashes | 168 | Coarse estimate; NAT and rotating IPs prevent person counting |
| Logical Supabase submissions | 4 | Reliable completed server persistence |
| Verified submissions | 2 | Reliable |
| Pending email verification | 2 | Reliable |
| Mautic website anonymous profiles | 126 across the Dar Tahara website | Browser-cookie identities, not people or form attempts |
| Mautic scanner profiles | 133 | Not prospects |

A render-to-submit ratio of 4/642 (0.62%) or hash-to-submit ratio of 4/168 (2.38%) would be misleading. The denominator contains bots and cannot be joined to the numerator. Historical step drop-off, field friction, voluntary/technical abandonment, device conversion, attempt count and completion duration cannot be reconstructed and must not be manufactured.

## 6. Proposed telemetry implementation

Create two service-role-only, force-RLS tables:

- `early_access_signup_sessions`: one row per attempt, opaque client credential hash, status, current/highest step, attribution, coarse device metadata, optional email association, partial autosave, reminder/feedback state, timestamps and hashed resume/feedback tokens.
- `early_access_funnel_events`: append-only event name, step, safe field alias, error category/code, duration and allowlisted non-sensitive metadata.

Allowlisted event names:

- `early_access_viewed`
- `early_access_started`
- `early_access_step_viewed`
- `early_access_step_completed`
- `early_access_field_focused`
- `early_access_field_completed`
- `early_access_validation_error`
- `early_access_api_error`
- `early_access_abandoned`
- `early_access_resumed`
- `early_access_completed`
- `early_access_feedback_submitted`

Never place names, email, telephone, address, coordinates, notes, tokens or free text in the event table. Field names are fixed aliases and field values are represented only as state such as focused/completed/error.

## 7. Signup session and autosave design

- Generate a UUID session id plus a cryptographically random client token.
- Store only the client-token hash in Supabase.
- Store the opaque id/token in `sessionStorage`; store no PII in browser storage.
- Debounce autosave to the backend and keep it fail-open so telemetry cannot break the form.
- Return partial data only when the caller proves possession of the client token.
- Associate a valid normalized email after it is supplied, but do not create a Mautic contact on every save.
- Link the completed Supabase lead and existing Mautic ID only after final submission.
- Clear the partial payload on completion and delete stale partial payloads according to retention policy.

## 8. Proposed abandonment logic

Initial configurable state machine:

```text
IN_PROGRESS
  -> COMPLETED
  -> ABANDONED_ELIGIBLE after 45 minutes without activity
ABANDONED_ELIGIBLE
  -> RESUMED on new activity
  -> ABANDONED_REMINDER_SENT after approved reminder workflow
  -> OPTED_OUT
ABANDONED_REMINDER_SENT
  -> RESUMED
  -> COMPLETED
  -> OPTED_OUT
```

Eligibility additionally requires a valid voluntarily entered email, explicit reminder permission (safest initial posture), no completion, no opt-out/suppression, and fewer than two reminders. Expiring resume and feedback tokens are created only when a reminder is queued.

Suggested defaults:

- inactivity threshold: 45 minutes;
- reminder 1: no earlier than 3 hours after abandonment;
- reminder 2: no earlier than 24 hours after reminder 1;
- maximum: two;
- feature disabled until Mautic campaign and legal review are complete.

## 9. Proposed Mautic workflow

Use the existing direct API client and idempotent email upsert. Do not create a contact per step.

When a session becomes eligible:

1. Upsert the existing contact by normalized email.
2. Store/reuse `mautic_contact_id` on the signup session.
3. Update the abandonment fields and secure resume/feedback URLs.
4. Add a single `early-access-abandoned` tag.
5. Let two dynamic reminder-count segments feed separate unpublished, human-reviewed campaigns, which prevents campaign re-entry and enforces the two-message ceiling.
6. When the visitor resumes or completes, change the status immediately so dynamic segment membership stops future actions.

Required/extended Mautic aliases:

- `early_access_status` (extend the existing lifecycle with abandoned, resumed and opted_out)
- `ea_step`
- `ea_started_at`
- `ea_last_activity`
- `ea_abandoned_at`
- `ea_reminder_count`
- `ea_resume_url`
- `ea_feedback_url`

The existing Pending Verification campaign is different: it runs after a full final submission. It must not be reused for pre-submit abandonment.

## 10. Reminder and feedback mechanism

Reminder email content should be service-focused and neutral:

- one primary “Continue your registration” link;
- one optional “Tell us why” link;
- clear statement that this is an incomplete-request reminder, not newsletter consent;
- an immediate stop-reminders/unsubscribe mechanism;
- no aggressive scarcity language.

The resume token must be random, single-purpose, revocable, expiring, and stored only as a hash in Supabase. The URL must expose no database id, email, address or other PII.

Feedback uses a separate opaque token. Allowed reasons are fixed values; optional comments are stored separately and never sent to general analytics. A reused feedback link is idempotent and cannot access another session.

## 11. Admin conversion dashboard

The administrator-only report should show:

- trustworthy signup-session visitors (separate from raw page renders);
- started, email supplied, each step entered/completed, completed and abandoned;
- resumed after reminder and completed after reminder;
- validation errors by safe field alias;
- API/Maps failures;
- entered/completed/dropped/drop-off rate per step;
- median/average duration and validation/abandonment rate per step;
- mobile/desktop/tablet, browser, OS, locale and source/UTM breakdowns;
- likely technical failure, validation friction, voluntary leave and unknown classifications.

Small cohorts must be suppressed or grouped to avoid turning the dashboard into person-level surveillance.

## 12. Security and privacy considerations

- Morocco's Law 09-08 gives a person a free right to object to direct prospecting, and Article 10 generally requires prior consent for electronic direct marketing. The CNDP also says website cookies involving personal data require consent and data should be retained only as long as necessary. See the [official Law 09-08 PDF](https://www.cndp.ma/images/lois/Loi-09-08-Fr.pdf) and [CNDP website-compliance guidance](https://www.cndp.ma/ar/%D9%85%D9%84%D8%A7%D8%A1%D9%85%D8%A9-%D9%85%D9%88%D8%A7%D9%82%D8%B9-%D8%A7%D9%84%D8%A7%D9%86%D8%AA%D8%B1%D9%86%D8%AA/).
- The CNDP notification/transfer procedure should be checked for Supabase, Mautic and email-provider processing and any transfers outside Morocco. See [CNDP notification guidance](https://www.cndp.ma/notifier-un-traitement/).
- GDPR may apply where Dar Tahara offers services to people in the EU or monitors their EU behaviour. Data minimization, purpose limitation, transparency and an identified lawful basis remain required. See [GDPR Articles 3, 5 and 6](https://eur-lex.europa.eu/eli/reg/2016/679/art_3/oj).
- EU ePrivacy rules generally require prior consent for direct-marketing email, subject to a narrow existing-customer/similar-service exception implemented by national law. An incomplete free early-access attempt should not be assumed to fit that exception. See [Directive 2002/58/EC Article 13](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A32002L0058).
- A reminder permission must not silently become newsletter consent. Marketing consent remains a separate optional value.
- Formal legal advice is required before enabling reminders; the code should ship disabled by default.

## 13. Database changes required

- `early_access_signup_sessions`
- `early_access_funnel_events`
- `early_access_abandonment_feedback`
- force RLS and revoke browser roles on all three;
- indexes for state/last activity, reminders, session events and retention;
- an administrator aggregate RPC/view that exposes grouped metrics only;
- retention job to remove old event data and partial PII.

## 14. Mautic changes required

- Extend/provision the aliases listed in section 9.
- Add dynamic segments for started, abandoned, completed, reminder sent and resumed where operationally useful; prefer fields plus a small number of tags over redundant static segments.
- Provision a separate abandoned-signup email and campaign as unpublished.
- Review suppression, bounce, unsubscribe and maximum-two-reminder behavior in the Mautic UI before publication.
- Add reconciliation for Supabase rows whose stored Mautic contact id no longer exists.

## 15. Recommended implementation and deployment order

1. Apply the signup-session/event migration.
2. Deploy session bootstrap, autosave and step/field/error telemetry.
3. Observe real data long enough to identify material friction.
4. Deploy secure resume and feedback endpoints.
5. Deploy the inactivity job with reminders disabled.
6. Provision Mautic fields, segment, email and unpublished campaign.
7. Complete legal and content review; explicitly enable reminders.
8. Deploy the administrator dashboard.
9. Use measured evidence for targeted UX changes, beginning with any confirmed address/phone/device failure.

## Acceptance criteria

- Every new attempt has one durable session and an append-only event trail.
- General events contain no email, telephone, address, coordinates, token or free text.
- Refresh restores progress without browser-stored PII.
- Final submit remains fail-open with respect to telemetry and Mautic.
- Mautic upsert stays email-idempotent.
- No reminder is possible without eligibility, permission, suppression checks and the feature gate.
- Tokens are cryptographically random, hashed at rest, expiring and revocable.
- Completion stops reminders immediately.
- Duplicate reminder execution is idempotent and capped at two.
- Dashboard data is aggregate and administrator-only.
- Historical limitations remain labelled; no fabricated pre-instrumentation funnel is shown.
