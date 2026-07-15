# Dar Tahara Early-Access Marketing — Architecture

Status: **Phase 1 complete** (infrastructure + data foundation). Phases 2–3
outlined at the end.

## Why Mautic

The brief requires marketing automation and analytics — contact management,
anonymous/identified tracking, campaign & UTM attribution, email marketing,
automated campaigns, segmentation, lead scoring, engagement tracking, consent &
unsubscribe management, and reporting. Rather than build and maintain a custom
marketing platform, we run **self-hosted Mautic 7.1.3**, a mature open-source
system that provides all of the above. Mautic is the private marketing backend;
it is not customer-facing.

## The three-way split

```
┌─────────────────────────┐        ┌──────────────────────────────┐
│  dartahara.com (Next.js) │        │  marketing.saasolution.es     │
│  — public UX only        │        │  — Mautic (private backend)   │
│  — /early-access form    │        │  — contacts, campaigns,       │
│  — validation, i18n      │        │    segments, scoring, email,  │
│  — async tracking script │◄──────►│    engagement, reports        │
└───────────┬─────────────┘  REST   └──────────────────────────────┘
            │ server-side (service role)
            ▼
┌─────────────────────────────────────────────┐
│  Supabase (structured system of record)      │
│  — exact billing + property addresses        │
│  — coordinates, entry notes, key handling    │
│  — per-property service prefs, consent audit │
│  — campaign-source registry, referral graph  │
│  — email-verification tokens (hashed)        │
└─────────────────────────────────────────────┘
```

**What lives where, and why:**

- **Mautic** holds marketing-relevant data only: identity, contact channel,
  city/country/property *summaries*, service interest, lifecycle status,
  referral counts and attribution — the things campaigns, segments and reports
  act on.
- **Supabase** is the system of record for everything structured and sensitive:
  exact addresses, coordinates, entry notes, physical-key notes, per-property
  service preferences, the consent audit trail, the campaign-source registry and
  the referral graph. These must not be reduced to flat Mautic contact fields.
- **The website** owns the entire user experience and never exposes Mautic —
  the public page uses Dar Tahara's own branding and never looks like a Mautic
  form or landing page.

## Infrastructure (Phase 1 — done)

| Piece | Detail |
|-------|--------|
| Host | SaaSolution VPS `85.215.221.142`, `ssh vps` over Tailscale |
| Mautic | 7.1.3, Docker Compose at `/opt/projects/mautic` (web + MariaDB 11.4 + cron + worker) |
| Database | MariaDB, **no published ports** — internal Docker network only |
| Proxy/TLS | shared Caddy (`/opt/projects/infra/caddy/Caddyfile`), auto-HTTPS |
| Storage | persistent volumes for db, config, media, plugins, themes, logs |
| Cron | 8 jobs incl. broadcasts + webhooks (image default omits them); verified executing |
| Worker | Messenger consumer for async email + hit tracking |
| Backups | nightly `/etc/cron.d/mautic-backup` → `/opt/backups/mautic`, verified restorable |
| Mail | Resend SMTP as "Dar Tahara" from `dartahara.com` *(pending key + DNS)* |

Deploy/runbook: [`../deploy/mautic/README.md`](../deploy/mautic/README.md).

## Security

- HTTPS only; DB unreachable from the internet and host; secure/HTTP-only
  cookies; Symfony `login_throttling` (3 attempts) for brute-force protection;
  no public user registration.
- **Roles (least privilege):** Mautic Administrator, Dar Tahara Marketing
  Manager, Campaign Manager, Lead Manager, Reporting Only, and a machine-only
  **API Integration** role. The website authenticates as the `dt-api` user
  (contacts read/write + segment read; **cannot send email**), never as admin.
- No Mautic API credentials in browser code; no admin credentials in the
  website. Admin + API credentials are stored root-only on the VPS.
- Supabase: RLS enabled **and forced** on all nine tables with **no**
  anon/authenticated policies — deny by default. All writes go through validated
  server routes using the service-role key. Verification tokens are stored
  hashed, single-use, expiring.

## Mautic data model (Phase 1 — done, via `provision.sh`, idempotent)

- **30 custom contact fields** — identity, billing/property summaries, service
  interest, lifecycle, referral, and attribution. Note `utm_*` are reserved by
  Mautic, so attribution uses `first_utm_*` / `last_utm_*` (which also satisfies
  the first-touch vs last-touch requirement).
- **31 tags** — controlled vocabulary (`dar-tahara`, `early-access`, `source-*`,
  `property-*`, `frequency-*`, `access-*`, verification states).
- **37 dynamic segments** — early-access lifecycle, Moroccan residence city, cleaning
  city, language, service frequency, access method, high-intent, referred.
- **6 roles + the `dt-api` user.**

## Website ↔ Mautic sync (Phase 1 — done, `src/lib/mautic/`)

Server-side, credential-safe, fully unit-tested (23 tests):

- `types.ts` — shared types + typed `MauticApiError` (carries a retryable flag).
- `mapping.ts` — pure lead → Mautic field/tag mapping (aliases match
  `provision.sh`); blanks are dropped so a sync never wipes a value.
- `client.ts` — REST client with **injectable fetch**, per-request timeout,
  transient-vs-permanent error classification, and **idempotent
  upsert-by-email** (find-then-edit-or-create) so repeat submissions never
  duplicate a contact.
- `sync.ts` — orchestration state machine: `synchronized` /`retry_scheduled` /
  `failed` / `permanently_failed`, with a retry budget and PII-safe error
  redaction (only class + HTTP status are ever logged).
- `env.ts` — the sole `server-only` entry point; builds the client from env, and
  returns `null` when Mautic is unconfigured so leads still save to Supabase.

**Failure handling (brief §36):** the form validates → saves to Supabase →
returns success → *then* attempts Mautic sync. A Mautic outage never loses a
lead; the row is marked `pending`/`retry_scheduled` and reconciled later. Matching
is by normalized email, so retries and resubmissions are idempotent.

## Attribution

- The page captures `src` + all `utm_*` params. First-touch values are written
  once and never overwritten; last-touch is refreshed each visit — stored in
  separate Supabase columns and separate Mautic fields.
- The `campaign_sources` table maps an opaque `src` code (e.g. `wa_tng_001`) to
  a human label ("Tangier property-owners WhatsApp group"), since the website
  can capture the code but cannot know the real group name.

## Environment variables (new)

Server-side (never `NEXT_PUBLIC_`):

```
MAUTIC_BASE_URL           https://marketing.saasolution.es
MAUTIC_API_USERNAME       dt-api
MAUTIC_API_PASSWORD       (from /root/mautic-api-credentials.txt on the VPS)
MAUTIC_API_TIMEOUT_MS     10000            # optional
```

Public (safe for the browser), added in later phases:

```
NEXT_PUBLIC_MAUTIC_BASE_URL          https://marketing.saasolution.es
NEXT_PUBLIC_MAUTIC_TRACKING_ENABLED  true
```

Mautic deployment vars are documented in
[`../deploy/mautic/.env.example`](../deploy/mautic/.env.example).

## Open blockers (need owner/provider action)

1. **DNS** — add `A marketing.saasolution.es → 85.215.221.142` at GoDaddy. No
   API credential is on the server, so this is manual. Caddy issues the cert
   automatically once it resolves.
2. **Resend** — provide a Resend API key and verify `dartahara.com` (DKIM/SPF)
   in Resend; set `MAUTIC_MAILER_DSN`. Until then Mautic mail is parked on the
   null transport (queues cleanly, delivers nothing). The production
   `dar-tahara-web` container currently has no `RESEND_API_KEY` either.
3. **Supabase migration apply** — the migration is validated and version
   controlled but not pushed: the live app uses project `sadyszicqxqslskotyta`,
   which the available tooling can't reach. Apply with `supabase db push`.

## Remaining work (phases 2–3)

- **Phase 2 (visitor side):** the public `/early-access` page + 7-step form
  (retiring `/[locale]/invite`), Supabase persistence wiring, email verification,
  referral codes, and the tracking script with consent gating.
- **Phase 3 (marketing depth):** the 6 automation campaigns, multilingual email
  templates (×7 languages, Arabic RTL), lead-scoring point rules, the reports,
  and the minimal campaign-link/QR admin utility.
