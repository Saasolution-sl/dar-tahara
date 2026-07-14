# Dar Tahara shared assistant platform

For the production WhatsApp webhook, queue, Supabase, Groq, FreeScout, retention, deployment and rollback runbook, see [`docs/WHATSAPP_SUPPORT.md`](../WHATSAPP_SUPPORT.md).

This implementation creates one shared customer-service assistant for both:

- the Dar Tahara website chat
- the WhatsApp Business webhook

Both channels call the same server-side assistant engine in `src/lib/assistant/*`.
The website and WhatsApp must not drift into separate bots.

## Architecture

Main pieces:

- `src/lib/assistant/knowledge.ts` — version-controlled approved knowledge.
- `src/lib/assistant/retrieval.ts` — language-aware keyword/semantic-style retrieval and intent classification.
- `src/lib/assistant/service.ts` — shared assistant orchestration, pricing tool use, handoff rules and Supabase persistence.
- `src/lib/assistant/provider.ts` — provider-neutral OpenAI-compatible model abstraction.
- `src/app/api/assistant/chat/route.ts` — website chat API.
- `src/app/api/whatsapp/webhook/route.ts` — WhatsApp Business webhook, now routed through the same assistant engine.
- `src/components/assistant/website-chat.tsx` — accessible floating website chat.
- `src/app/admin/assistant/*` — operations view for assistant conversations.
- `supabase/migrations/20260714005102_dar_tahara_assistant_platform.sql` — assistant, knowledge, handoff, WhatsApp and audit data model.

If no AI provider is configured, the assistant still answers from retrieved approved knowledge and deterministic tools. It does not invent policy or prices.

## Knowledge base

The active production knowledge currently lives in version-controlled source:

- title
- category
- language
- status
- version
- effective date
- last reviewed date
- source
- visibility
- keywords
- related questions
- summary
- body

The migration also creates database-backed knowledge tables for future admin editing:

- `knowledge_sources`
- `knowledge_articles`
- `knowledge_article_versions`
- `knowledge_translations`
- `faq_items`

Only approved/public knowledge should be used for customer answers. Draft or archived records must not be shown as current policy.

## Website chat

The chat is mounted in the locale layout and appears on every localized page.

Features implemented:

- responsive floating chat
- accessible open/close controls
- keyboard-submittable form
- conversation persistence via server `conversationId`
- local browser `sessionId`
- translated UI copy
- quick actions
- calculator scroll action
- automated-response labelling
- server-side persistence when Supabase service role is configured

The chat API never receives service-role secrets in the browser.

## WhatsApp Business setup

The project uses the official Meta WhatsApp Cloud API helper in `src/lib/whatsapp.ts`.

Required Meta configuration:

1. Meta Business account
2. WhatsApp Business Account
3. verified phone number
4. permanent access token or secure token rotation
5. webhook URL:
   - `https://www.dartahara.com/api/whatsapp/webhook`
6. webhook verify token matching `WHATSAPP_VERIFY_TOKEN`
7. app secret matching `WHATSAPP_APP_SECRET`
8. subscribed webhook fields:
   - `messages`
   - `message_template_status_update`
   - delivery/read status fields where available

Required environment variables:

```env
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_GRAPH_VERSION=v25.0
```

Template variables are listed in `.env.example`.

Templates to create and localize in Meta:

- booking confirmation
- payment confirmation
- appointment reminder
- assessment completed
- revised quote
- subscription activation
- failed payment
- human follow-up
- annual renewal reminder

Do not use WhatsApp Web scraping, browser automation or personal-account automation.

## Assistant provider

The provider layer is OpenAI-compatible but not vendor-locked.

Optional env:

```env
ASSISTANT_PROVIDER=
ASSISTANT_API_BASE_URL=
ASSISTANT_API_KEY=
ASSISTANT_MODEL=
ASSISTANT_FALLBACK_MODEL=
ASSISTANT_TIMEOUT_MS=8000
ASSISTANT_MAX_TOKENS=450
ASSISTANT_TEMPERATURE=0.2
ASSISTANT_RETRIEVAL_LIMIT=4
ASSISTANT_CONFIDENCE_THRESHOLD=0.62
```

If these are unset, the deterministic grounded-answer path is used.

## Tool layer

Implemented tool behavior:

- `calculate_price` uses the existing shared pricing engine.
- handoff creates `support_cases` when Supabase service role is configured.
- booking-status/payment/subscription-specific answers require verified identity or human handoff.

Future transactional tools should follow the same rules:

- validate input
- validate authorization
- log the tool call
- use idempotency for consequential actions
- return structured results
- never expose stack traces
- require confirmation before changing bookings, subscriptions or payments

## Admin operations

Admin view:

- `/admin/assistant`

Capabilities implemented:

- view website and WhatsApp conversations in one queue
- see channel, language, status, intent and handoff reason
- inspect recent messages
- take over a conversation
- return it to automation
- add internal notes
- close conversations

The route uses the existing admin auth checks. Staff role granularity can be expanded after staff-account auth is formalized.

## Security controls

Implemented:

- server-only assistant/provider code
- no service-role key in frontend
- Meta webhook signature verification
- WhatsApp event idempotency via `provider_event_id`
- RLS enabled on all new public tables
- no direct anon table grants
- authenticated users can only read their own linked rows
- personal booking/payment/subscription status requires verification or handoff
- prompt-injection boundaries: customer messages are treated as untrusted and cannot override Dar Tahara policy
- pricing is calculated by the shared engine, not by model memory
- support cases are created for refund disputes, complaints, legal/safety issues and human requests

## Testing

Assistant tests cover:

- knowledge retrieval
- Initial Home Assessment answer grounding
- pricing tool use
- refund/dispute escalation
- booking privacy boundary

Run:

```bash
npm run typecheck
npm run test
npm run build
```

## Deployment checklist

Before production use:

1. Apply the Supabase migration.
2. Ensure `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` is configured server-side.
3. Configure WhatsApp Cloud API webhook and app secret.
4. Create and approve WhatsApp templates in all supported languages.
5. Decide whether to configure an AI provider or run deterministic grounded answers only.
6. Review the initial knowledge articles with Dar Tahara’s legal/operations owner.
7. Add staff role permissions once staff identity is formalized beyond the private admin token.

## Known limitations

- Database-backed knowledge editing is modeled but the current answer source is still version-controlled knowledge.
- Human takeover UI records status and notes but does not yet provide live two-way agent messaging from the admin page.
- Personal booking status requires verified identity; no one-time verification link has been added yet.
- Media handling records WhatsApp event metadata but does not process media attachments.
- AI provider calls are optional and disabled unless provider env vars are configured.
