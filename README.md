# Dar Tahara — Website

> **House of Purity.** Premium home care & property concierge across Morocco.
> _Always arrive home to comfort._

A production-grade, multilingual marketing site built to feel like a premium
concierge service rather than a cleaning company — minimal, elegant, calm.

## Stack

- **Next.js 15** (App Router, RSC) + **TypeScript**
- **Tailwind CSS** design-token system + **shadcn-style** primitives
- **Framer Motion** for restrained, premium motion
- **Lucide** icons
- **next-themes** light/dark mode
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
The public Supabase URL and publishable key are required for signup; the
server-only secret key, Resend and Turnstile settings enable the optional admin
export, double opt-in email and bot protection respectively.

The mailing-list API expects these Supabase RPCs to exist in the configured
project: `subscribe_to_mailing_list`, `confirm_mailing_list` and
`unsubscribe_mailing_list`. Direct table access should remain protected by RLS;
only the narrowly scoped signup/confirmation functions should be executable by
the public role.

## Design system

The palette is derived from the official logo — **forest green** primary,
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
Twitter cards, dynamic OG images, `sitemap.xml`, `robots.txt`, PWA manifest and
schema.org JSON-LD (`HomeAndConstructionBusiness`, service catalog, `FAQPage`).

## Before launch

1. Add brand assets to `/public` — see [`public/ASSETS.md`](public/ASSETS.md).
2. Set real values in `src/lib/site.ts` (domain, email, phone, WhatsApp, socials).
3. Replace placeholder legal copy in `src/app/[locale]/terms` & `privacy`.
4. Complete translations in `src/i18n/dictionaries/*`.
5. Swap the Unsplash hero/gallery imagery for real photography.

## Future modules (architected for)

Customer portal · booking system · online payments · subscription management ·
cleaner tracking · property dashboard · arrival checklist · maintenance reports ·
AI concierge · home-status dashboard · mobile apps.
