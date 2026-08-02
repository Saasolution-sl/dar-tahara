# HospitalitySupport customer portal runbook

## Architecture

HospitalitySupport (or FreeScout with the API & Webhooks module) is authoritative
for the conversation ID, ticket number, mailbox, agent replies, status, assignment,
attachments and closure. The Next.js application is the authenticated customer
boundary. Supabase stores ownership mappings, related account resources,
customer-visible message and attachment metadata, unread notifications, webhook
events, retry state and audit identifiers.

The browser never receives provider credentials or a provider conversation ID as
an authorization credential. Every list, detail, reply, read and attachment route
derives the customer from Supabase Auth and checks `support_requests.customer_id`.

## Required configuration

Configure these server-only values (the existing `FREESCOUT_*` base URL, API key,
mailbox and assignee values are accepted as fallbacks):

```env
HOSPITALITY_SUPPORT_BASE_URL=https://support.example.com/
HOSPITALITY_SUPPORT_API_TOKEN=
HOSPITALITY_SUPPORT_MAILBOX_ID=
HOSPITALITY_SUPPORT_DEFAULT_ASSIGNEE_ID=
HOSPITALITY_SUPPORT_DEPARTMENT_NAME=Dar Tahara Support
HOSPITALITY_SUPPORT_WEBHOOK_SECRET=
HOSPITALITY_SUPPORT_SYNC_SECRET=
HOSPITALITY_SUPPORT_PORTAL_SOURCE=dar-tahara-customer-portal
HOSPITALITY_SUPPORT_TIMEOUT_MS=12000
```

The base URL must be public HTTPS and may not contain credentials or resolve to a
literal private/loopback address. Set `HOSPITALITY_SUPPORT_SYNC_SECRET` to a
high-entropy value outside Vercel; on Vercel, the existing `CRON_SECRET` bearer
header is also accepted by the scheduled fallback.

## FreeScout setup

1. Install and enable FreeScout's **API & Webhooks** module.
2. Create a restricted API key in **Manage → API & Webhooks**.
3. Record the support mailbox ID and a default assignee with access to that mailbox.
   The assignee is used to add an internal account-context note at creation.
4. Copy the FreeScout webhook secret into `HOSPITALITY_SUPPORT_WEBHOOK_SECRET` and
   register this webhook URL:

   `https://www.dartahara.com/api/webhooks/hospitality-support`

5. Subscribe it to:

   - `convo.created`
   - `convo.assigned`
   - `convo.status`
   - `convo.customer.reply.created`
   - `convo.agent.reply.created`
   - `convo.note.created`

FreeScout sends `X-FreeScout-Event` and a Base64 HMAC-SHA1
`X-FreeScout-Signature` over the exact raw body; the endpoint verifies both the
body signature and configured secret before parsing JSON. Compatible providers
without FreeScout signatures may instead send the secret as
`X-Hospitality-Support-Secret`, `X-FreeScout-Webhook-Secret`, or a Bearer token.
Secrets are not accepted in the URL. Events are deduplicated by provider event ID or a
stable event/body hash. Temporary failures return HTTP 503 so the provider can
retry; the daily scheduled reconciliation is the fallback on Vercel Hobby.

## Customer-visible call notes

FreeScout notes are private by default and never appear in the portal. To publish
a safe call summary, create a note whose body begins with:

`[CUSTOMER_VISIBLE_CALL]`

Only the text after this marker is synchronized. Never include recordings,
personal staff numbers, QA scores, escalation discussions or private security
information. A phone call does not close a conversation.

## Statuses and closure

The central mapper converts active/open, pending, assigned/in-progress and closed
provider states into clear portal states. FreeScout exposes only `active`,
`pending` and `closed`; therefore provider `closed` maps to customer **Resolved**.
Apply the tag `portal-closed` (or `portal_closed`) when the request is permanently
closed. Resolved requests reopen into the same conversation when the customer
replies; permanently closed requests show a follow-up action instead.

## Attachments and privacy

Customer uploads accept up to five JPG, PNG, WebP, PDF, plain-text or MP4 files,
up to 10 MB each. Executable extensions and mismatched MIME types are rejected.
Files are stored in the private `support-attachments` Supabase bucket and sent to
the provider conversation. Downloads require ticket ownership and use a short
signed URL or an authenticated same-provider proxy. Raw bucket URLs are not public.
Enable the platform's malware scanner for this bucket when that infrastructure is
available; the application currently performs type, extension and size validation.

Message bodies, access tokens and attachment contents are not written to logs or
notifications. Email outbox entries contain only the public reference, subject and
portal link. Provider internal notes, drafts and non-published threads are excluded.

## Deployment and verification

1. Back up the database and apply migrations with `npx supabase db push`.
2. Confirm the `support-attachments` bucket is private.
3. Run `supabase/tests/verify_customer_portal_rls.sql` and the application test suite.
4. Configure the server secrets in staging, then restart/redeploy the application.
5. Create a portal ticket with a property and attachment; verify one provider
   conversation and an internal metadata note are created.
6. Add an agent reply and a private note. Verify only the reply appears and unread
   count increments once, including after webhook redelivery.
7. Add a marked customer-visible call note, resolve the ticket, reply from the
   portal and verify the same conversation reopens.
8. Verify a second customer receives 404 for ticket, reply and attachment URLs.

## Current provider limitations

- FreeScout signs webhooks with HMAC-SHA1; compatible HospitalitySupport systems
  without that header must use the explicit shared-secret fallback.
- FreeScout does not distinguish resolved from permanently closed; the
  `portal-closed` tag supplies that distinction.
- Customer-visible call notes use an explicit marker because FreeScout notes do
  not have a native customer-visibility flag.
- Malware scanning depends on deployment infrastructure and is not bundled into
  this repository.
