# Production WhatsApp support runbook

Dar Tahara's WhatsApp assistant reuses the Next.js application, shared deterministic pricing engine, approved knowledge, admin authentication, Docker image, and Caddy route. Human replies continue by email through FreeScout; FreeScout replies are never represented as WhatsApp replies.

## Architecture

```text
Meta Cloud API -> /api/webhooks/whatsapp
  -> raw-body signature and size validation
  -> encrypted Supabase webhook_events queue
  -> quick HTTP 200 acknowledgement
  -> background/minute worker using FOR UPDATE SKIP LOCKED
     -> encrypted/redacted contact, conversation and message persistence
     -> deterministic language, abuse, pricing and escalation rules
     -> published Supabase knowledge, then approved repository knowledge
     -> bounded Groq composition
     -> Meta response
     -> email collection for handoff
     -> FreeScout email conversation (API preferred, email ingestion fallback)
     -> human reply to customer email only
```

Important files:

- `src/app/api/webhooks/whatsapp/route.ts`: canonical Meta webhook.
- `src/app/api/whatsapp/webhook/route.ts`: legacy URL alias.
- `src/app/api/health/whatsapp/route.ts`: secret-free health state.
- `src/app/api/jobs/whatsapp/route.ts`: protected queue/retry/retention worker.
- `src/lib/whatsapp/orchestrator.ts`: durable workflow and handoff state machine.
- `src/lib/whatsapp/security.ts`: Meta signatures, HMAC identifiers, AES-256-GCM and redaction.
- `src/lib/whatsapp/freescout.ts`: FreeScout API and email-ingestion adapters.
- `src/lib/assistant/provider.ts`: Groq timeout/retry/JSON provider.
- `src/lib/pricing.ts`: website and bot pricing source of truth.
- `supabase/migrations/20260714131303_production_whatsapp_support.sql`: production schema.

Meta event IDs, message IDs, outbound jobs, support escalations and ingestion emails all have stable idempotency boundaries. The normal test suite mocks every external provider.

## Database and security

The migration creates `whatsapp_contacts`, `whatsapp_conversations`, `whatsapp_messages`, `support_escalations`, `knowledge_entries`, `bot_audit_logs`, and `webhook_events`. It adds queue/retry/lookup indexes, an atomic queue claim function and a retention function.

All tables have RLS enabled. `anon` and `authenticated` have no privileges or policies. Only `service_role` receives explicit grants. This is required for new Supabase projects where public-schema tables are no longer automatically exposed through the Data API.

The migration is forward-only and depends on existing migrations for `staff_members` and `private.set_updated_at()`. Apply every repository migration to the same external managed Supabase project. Do not point `SUPABASE_URL` at an empty WhatsApp-only database.

Sensitive storage rules:

- Meta `wa_id` is stored as an HMAC lookup value.
- The phone identifier and message body are encrypted with AES-256-GCM.
- Admin previews and logs use redacted text only.
- Card numbers, CVV/CVC, passwords, likely access codes and secrets are never retained in clear text.
- Customer URLs are never fetched.
- FreeScout base URLs must use public HTTPS; private/localhost targets and URL credentials are rejected.

## Environment

`.env.example` is authoritative. Core readiness requires:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_VERIFY_TOKEN=
META_APP_SECRET=
WHATSAPP_API_VERSION=
WHATSAPP_DATA_ENCRYPTION_KEY=
WHATSAPP_PHONE_HASH_SECRET=
WHATSAPP_JOB_SECRET=
```

Generate the encryption, HMAC and job secrets independently. Rotating the encryption key requires re-encrypting stored ciphertext.

Groq:

```env
GROQ_API_KEY=
GROQ_MODEL=
GROQ_TIMEOUT_MS=15000
GROQ_MAX_TOKENS=600
```

FreeScout API (preferred):

```env
FREESCOUT_BASE_URL=https://support.example.com/
FREESCOUT_API_KEY=
FREESCOUT_MAILBOX_ID=
FREESCOUT_DEFAULT_ASSIGNEE_ID=
FREESCOUT_DEFAULT_TAGS=
FREESCOUT_FROM_EMAIL=
```

The assignee ID is required for API mode so the transcript can be an internal note owned by a valid FreeScout user. Email-ingestion fallback needs:

```env
FREESCOUT_SUPPORT_EMAIL=
FREESCOUT_FROM_EMAIL=
RESEND_API_KEY=
```

The fallback sets `Reply-To` to the customer and uses a Resend `Idempotency-Key`. Verify mailbox reply routing in staging.

## Manual Meta setup

1. Verify Dar Tahara in Meta Business Manager.
2. Create/select the Meta app, add WhatsApp, attach the business account and production phone.
3. Create a permanent system-user token with minimum WhatsApp permissions; store it only as a deployment secret.
4. Copy the app secret to `META_APP_SECRET` and generate an independent verify token.
5. Register `https://www.dartahara.com/api/webhooks/whatsapp`.
6. Subscribe to `messages` and applicable message status fields.
7. Complete the GET challenge verification.
8. Approve any outbound templates needed beyond the 24-hour service window.

Business verification, phone ownership, permanent token creation, template approval and token rotation cannot be automated.

## Manual Supabase setup

1. Create/select the external managed project in the approved region.
2. Store URL/publishable/secret keys in the deployment secret store; never expose the secret key with `NEXT_PUBLIC_`.
3. Back up the project.
4. Link from an authorized workstation, review migration history, then run `npx supabase db push` once.
5. Run database/security advisors.
6. Verify RLS and confirm `anon`/`authenticated` cannot access any WhatsApp table.
7. Add knowledge only after operations/legal approval; only `status='published'` rows are retrieved.

Do not push migrations concurrently from multiple operators.

## Manual FreeScout/email setup

1. Install the FreeScout API & Webhooks module for API mode.
2. Configure the mailbox's IMAP/SMTP delivery.
3. Generate the API key in **Manage -> API & Webhooks**.
4. Record mailbox and restricted assignee IDs.
5. Verify the public HTTPS base URL from the app container.
6. Create a staging ticket and confirm: type is email, customer is the submitted address, transcript is internal, agent reply reaches that address, and internal notes never appear to the customer.
7. If using email ingestion, verify the mailbox honors `Reply-To` correctly.
8. Configure/verify the Resend sender domain and DNS records.

DNS, provider-domain verification, mailbox credentials and FreeScout module setup are manual.

## Groq and knowledge

Choose the smallest approved Groq model that reliably handles English, French, Arabic/Darija, Dutch, Spanish, German and Portuguese. The model is configurable and only composes from supplied approved knowledge. Deterministic code controls prices, signatures, persistence, consent, rate limits and ticket creation. Groq failures fall back to approved content or email support.

Knowledge priority is:

1. Published Supabase entry in the requested locale.
2. Published English database entry only when no locale entry matches.
3. Approved version-controlled knowledge.
4. Shared deterministic pricing output.

Arabic script and common Latin-script Darija/Arabizi signals use the Arabic locale/RTL response path. To add a language, update locale configuration, all website/WhatsApp copy, database constraints, knowledge and tests together.

## Handoff state and email flow

```text
active -> escalation_required -> awaiting_email -> email_received
       -> creating_ticket -> escalated -> closed

creating_ticket -> retry_pending -> creating_ticket
```

Theft, missing keys and personal safety are urgent. Legal threats, refunds/payment disputes, damage/liability and formal privacy/termination requests are high. Human requests and unresolved cases are normal unless a stronger rule matches.

Email is requested only for escalation. The bot explains that support continues by email and the WhatsApp context is included. It announces success only after ticket creation. Failures are saved and retried without claiming a ticket exists.

Submitted email syntax is validated, but ownership verification is not implemented; it remains `email_verified=false`. The current support flow may use that submitted address, but account-sensitive data must not be disclosed until a future verification step is added.

## Abuse, context and observability

Controls include raw signature verification, constant-time token checks, a 1 MB/100-event webhook limit, per-contact rate limits, conservative repeated-spam blocking, maximum message length, prompt-injection auditing, fixed provider endpoints, HTTPS/SSRF protection, and bounded conversation context.

Recent redacted messages plus a compact summary are used for model context. Full history is never sent to Groq. Structured logs contain event names, correlation IDs, severity/status and hashes, not tokens or full transcripts.

Monitor:

- webhook/job HTTP 5xx;
- `webhook_events` in `retry_pending` or `failed`;
- `support_escalations` in `retry_pending`;
- invalid-signature spikes and outbound send failures;
- Supabase connectivity and health status;
- rate-limit/spam growth;
- retention job completion.

## Local verification

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run check:i18n
npm run build
```

Use staging—not the normal suite—for live Meta verification, Supabase migration/advisor checks, Groq connectivity, FreeScout delivery and email reply testing.

## Deployment, scheduling and backup

1. Back up the external managed Supabase project.
2. Apply migrations before code deployment.
3. Build the Docker image with public build arguments only; runtime secrets remain in `/srv/dartahara/app/.env`.
4. Deploy with the existing Compose/Caddy stack. The existing domain route already proxies the webhook.
5. Install `deploy/vps/dar-tahara-whatsapp.cron` at `/etc/cron.d/dar-tahara-whatsapp` with owner `root:root` and mode `0644`.
6. Confirm `/api/health/whatsapp` returns HTTP 200 (`healthy` or intentionally `degraded`).
7. Verify text, button, list, media fallback and delivery-status events.
8. Trigger a test escalation, provide email, verify exactly one FreeScout ticket, and reply. Confirm the reply arrives by email only.

The cron calls the protected job every minute and retention daily. Defaults are 90 days for messages/webhook payloads and 365 days for audits. Align managed backup retention with deletion requests because backups can retain already-deleted rows longer.

## Rollback

Application rollback is image-based: deploy the last known-good image and pause the minute worker if that image cannot process the new queue. Keep the new tables and queued evidence. Database changes are forward-only; fix with a new migration. Restore the pre-deployment managed backup only for catastrophic failure after freezing writes and preserving webhook/ticket evidence.

## Troubleshooting

- GET verification fails: compare callback URL and verify token.
- Every POST is 401: compare Meta app secret and ensure the proxy preserves the raw body/signature header.
- Supabase 42501: verify the external URL/key pair and explicit `service_role` grants.
- No internal note: configure a FreeScout assignee with mailbox access.
- Duplicate tickets: verify all workers share the same database and inspect idempotency keys before manual creation.
- Arabic direction: WhatsApp normally handles RTL; verify the actual customer client.

## Production checklist

- [ ] Tests, typecheck, lint, i18n and build pass.
- [ ] Managed Supabase backup, migrations and advisors pass.
- [ ] RLS/anon denial verified.
- [ ] Meta business, phone, permanent token and callback configured.
- [ ] Independent encryption/HMAC/job secrets stored securely.
- [ ] Groq model and fallback approved.
- [ ] FreeScout ticket plus email reply verified end to end.
- [ ] Email-ingestion fallback verified or deliberately disabled.
- [ ] Worker and retention cron installed and monitored.
- [ ] Privacy/operations owners approved knowledge, retention and wording.
- [ ] No credentials exist in source control or build arguments.

## Known limitations

- Email ownership is not yet verified.
- Darija uses the Arabic locale rather than a separate catalog.
- FreeScout replies are email-only; there is no reverse WhatsApp relay.
- Admin supports search/filter/retry/block/close but not arbitrary staff WhatsApp sends.
- Database retrieval uses curated text scoring, not vectors.
- Out-of-window Meta templates require manual approval and future explicit routing.
- No response-time promise is made because no approved SLA exists.

References: [Meta Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api), [Supabase migrations](https://supabase.com/docs/guides/local-development/overview), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Groq API](https://console.groq.com/docs/api-reference), [FreeScout API](https://api-docs.freescout.net/), and [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
