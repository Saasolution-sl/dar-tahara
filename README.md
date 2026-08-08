# Dar Tahara Website

Production WhatsApp assistant setup and operations: [`docs/WHATSAPP_SUPPORT.md`](docs/WHATSAPP_SUPPORT.md).

> **House of Purity.** Premium home care & property concierge across Morocco.
> _Always arrive home to comfort._

A production-grade, multilingual marketing site built to feel like a premium
concierge service rather than a cleaning company: minimal, elegant, calm.

## Stack

- **Next.js 15** (App Router, RSC) + **TypeScript**
- **Tailwind CSS** design-token system + **shadcn-style** primitives
- **Framer Motion** for restrained, premium motion
- **Lucide** icons
- **next-themes** light/dark mode
- Supabase Auth with server-side sessions, database roles and RLS
- Locale routing middleware (7 languages, incl. Arabic RTL)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /en
npm run build    # production build (all locales prerendered)
npm run start    # serve the production build
npm run lint     # eslint
npm run typecheck
```

Copy `.env.example` to `.env.local` before enabling the launch mailing list.
The public Supabase URL and publishable key power authenticated sessions; the
server-only secret key, Resend and Turnstile settings enable controlled account
invitations, transactional email and bot protection respectively.

The mailing-list API expects these Supabase RPCs to exist in the configured
project: `subscribe_to_mailing_list`, `confirm_mailing_list` and
`unsubscribe_mailing_list`. Direct table access should remain protected by RLS;
only the narrowly scoped signup/confirmation functions should be executable by
the public role.

## Assessment and subscription workflow

The Initial Home Assessment is a controlled application workflow. Direct booking
is disabled by default. When enabled, an application creates an applicant record,
property and submitted assessment; it does not take payment. Staff review and
schedule the visit, then an administrator approves or rejects the outcome.
Approval creates a customer-visible subscription proposal, never a charge.
Only the customer can accept that proposal and continue to Stripe-hosted Checkout.
The signed Stripe webhook is the authority that activates the subscription.

Apply the schema to the exact project referenced by
`NEXT_PUBLIC_SUPABASE_URL`:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The secure portal migration is
`supabase/migrations/20260715225139_secure_customer_onboarding_portal.sql`. It
adds roles, feature flags, proposals, payments, audit history, private attachments
and ownership-scoped RLS. See [`docs/CUSTOMER_PLATFORM.md`](docs/CUSTOMER_PLATFORM.md)
for deployment, administration, testing and rollback.

Register `/api/stripe/webhook` with Stripe and `/api/whatsapp/webhook` with
Meta. Both handlers verify provider signatures. Free-form WhatsApp FAQ replies
are for the active support window; proactive messages must use approved Meta
templates configured in `.env.local`.

The private `/admin` operations console uses Supabase Auth and database-backed
`staff` / `administrator` roles. There is no shared admin token. Customer routes
use the same session system and RLS enforces ownership at the database boundary.

## Design system

The palette is derived from the official logo: **forest green** primary,
warm **gold** accent, grounded in **warm white / stone / beige / charcoal**.

- Tokens: `tailwind.config.ts` (brand scales) + `src/app/globals.css` (semantic
  CSS variables for light/dark).
- Type: **Fraunces** (display serif) + **Hanken Grotesk** (body) via `next/font`.
- Primitives: `src/components/ui/*` (`Button`, `Section`, `SectionHeading`).
- Motion: `src/components/motion/reveal.tsx` (scroll reveals, reduced-motion safe).

## Structure

```
src/
├── app/
│   ├── [locale]/            # localized routes (layout, page, terms, privacy)
│   │   └── opengraph-image  # dynamic, branded, localized OG cards
│   ├── sitemap.ts robots.ts manifest.ts icon.svg
│   └── layout.tsx           # passthrough root (shell lives in [locale])
├── components/
│   ├── layout/  (navbar, footer, language-switcher, theme-toggle)
│   ├── sections/ (hero, why, services, plans, how-it-works, audiences,
│   │              testimonials, gallery, faq, cta)
│   ├── brand/ (logo)  seo/ (structured-data)  ui/  motion/
├── i18n/
│   ├── config.ts            # locales, RTL, metadata
│   ├── dictionaries.ts      # deep-merge loader (fallback to English)
│   └── dictionaries/        # en (source of truth) + nl fr ar es de pt
├── lib/ (site.ts, utils.ts)
└── middleware.ts            # locale negotiation & redirect
```

## Internationalization

Every string comes from a typed dictionary. `en.ts` is the complete source of
truth; each other locale is a **partial override** deep-merged over English, so
missing translations gracefully fall back. To translate more, just add keys to
the relevant file in `src/i18n/dictionaries/`.

Languages: English · Dutch · French · Arabic (RTL) · Spanish · German · Portuguese.

## SEO

Per-locale titles/descriptions, canonical + `hreflang` alternates, Open Graph &
Twitter cards, dynamic OG images, `sitemap.xml`, `robots.txt`, `llms.txt`, PWA
manifest and typed schema.org JSON-LD (`ProfessionalService`, `WebSite`,
`WebPage`, `AboutPage`, `Service`, `FAQPage`, `BreadcrumbList`). See
[`docs/SEO_AND_AI_DISCOVERY.md`](docs/SEO_AND_AI_DISCOVERY.md).

## Before launch

1. Add brand assets to `/public`. See [`public/ASSETS.md`](public/ASSETS.md).
2. Set real values in `src/lib/site.ts` (domain, email, phone, WhatsApp, socials).
3. Have qualified Moroccan counsel review the operational terms and privacy notice.
4. Set the correct Supabase, Stripe, Resend and Meta server credentials.
5. Apply the migration and register the Stripe and Meta webhook endpoints.
6. Approve localized Meta templates for proactive customer notifications.
7. Run `npm test`, `npm run check:i18n`, `npm run typecheck` and `npm run build`.
8. Swap the Unsplash hero/gallery imagery for real photography.

## Future modules (architected for)

Cleaner tracking · arrival checklist · maintenance reports ·
AI concierge · home-status dashboard · mobile apps.
