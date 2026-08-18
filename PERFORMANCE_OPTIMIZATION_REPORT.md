# Performance Optimization Report

## Executive Summary

Dar Tahara's public marketing experience was shipping avoidable client-side animation and widget code, delaying the actual homepage LCP element, and performing Supabase work for anonymous traffic. The warm mobile homepage baseline scored 57 in Lighthouse with a 4.27 s LCP and 1.49 s Total Blocking Time (TBT).

The optimized production build scores 85 on the mobile homepage, 89 on Early Access, 89 on People & Community, 93 on the sampled service page, and 100 on the desktop homepage. Homepage mobile LCP is 2.52 s, CLS is 0, TBT is 437 ms, and local warm TTFB is 150 ms. The homepage First Load JS reported by Next.js fell from 183 KB to 129 KB (30%).

The requested 85+ immediate lab proxy is achieved. Vercel Real Experience Score is field data, so its production value will change only after deployment and accumulation of new visits.

## Scope and Method

- Framework: Next.js 15.5.20 App Router, React 19, TypeScript, Tailwind CSS.
- Package manager: npm with `package-lock.json`.
- Hosting: Vercel configuration plus a standalone Node/Docker deployment path.
- Rendering: localized marketing routes are dynamic because locale and feature visibility are request-aware; service detail paths also use generated static params.
- Data/auth: Supabase SSR middleware plus server-only PostgREST helpers.
- Measurement: Lighthouse 13.4.1 against `next build` + production server on localhost, default simulated mobile throttling and the Lighthouse desktop preset.
- Clean-consent measurements intentionally loaded no Google Analytics, Mautic, or other third-party payloads.

Synthetic scores vary between runs. The table records the saved warm baseline and the final route-matched run, not a production field percentile.

## Baseline

| Route / profile | Perf | A11y | Best Practices | SEO | FCP | LCP | CLS | TBT | Speed Index | TTFB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage mobile | 57 | 93 | 100 | 100 | 1.89 s | 4.27 s | 0 | 1,490 ms | 3.33 s | 465 ms |
| Homepage desktop | 98 | 93 | 100 | 100 | 0.52 s | 0.93 s | 0.0008 | 61 ms | 1.43 s | 853 ms |
| Early Access mobile | 78 | 96 | 100 | 100 | 1.57 s | 3.26 s | 0 | 550 ms | 1.74 s | 259 ms |
| People & Community mobile | 73 | 96 | 100 | 100 | 1.68 s | 3.84 s | 0 | 566 ms | 2.09 s | 246 ms |
| Premium Cleaning service mobile | 78 | 96 | 100 | 100 | 0.94 s | 1.80 s | 0 | 972 ms | 1.31 s | 181 ms |

Baseline homepage transfer summary:

- Total: 477 KB
- JavaScript: 210 KB
- HTML/document: 97 KB
- Images: 79 KB
- Fonts: 72 KB
- CSS: 13 KB
- Next.js First Load JS: 183 KB

## Major Bottlenecks Found

1. **HIGH — LCP hidden behind client animation.** The homepage LCP was the hero heading on mobile. Framer Motion initialized it at zero opacity and Lighthouse attributed roughly 2.4 s to render delay.
2. **HIGH — shared marketing hydration.** Framer Motion, the full assistant, newsletter form/popup, navbar animation, consent animation, and booking modal code were reachable from initial marketing bundles.
3. **HIGH — anonymous server work.** Public requests refreshed Supabase auth even without a session cookie, while feature flags and subscription-duration configuration were fetched repeatedly.
4. **MEDIUM — oversized client props.** The complete locale dictionary was serialized into the pricing calculator and gallery although they used only small subsections.
5. **MEDIUM — font/metadata/accessibility details.** Font swapping could extend text LCP; streamed metadata was intermittently missed by the lab crawler; small ARIA/name/contrast problems held homepage accessibility at 93.

## Changes Made

- Made the hero and all former reveal wrappers server-visible at first paint.
- Replaced marketing-path Framer Motion effects with lightweight CSS entry transitions where motion remains useful.
- Lazy-loaded the full assistant only after its launcher is activated.
- Deferred the newsletter popup module until scroll or four seconds; its own ten-second display rule remains intact.
- Lazy-loaded the assessment booking modal only when opened.
- Deferred the navbar auth destination probe to idle time.
- Added `content-visibility: auto` with intrinsic-size reservation to standard below-fold sections.
- Narrowed gallery and calculator client props to only the locale copy they consume.
- Skipped Supabase auth refresh when no Supabase auth cookie is present.
- Cached public feature flags for 60 seconds and duration tiers for five minutes.
- Added tag invalidation after admin feature-flag updates, preserving prompt control changes.
- Changed local fonts from `swap` to `optional` to avoid a late font swap extending text LCP.
- Disabled streamed metadata so localized title, description, canonical, hreflang, Open Graph, and Twitter tags are present in the initial document head.
- Fixed measured ARIA label, star rating role, logo name, and footer contrast problems.

## LCP

The homepage mobile LCP was the hero `<h1>`. It was server-rendered but hidden until a client animation hydrated and completed. The hero is now a Server Component with visible initial content and no animation dependency. Mobile homepage LCP improved from 4.27 s to 2.52 s; desktop improved from 0.93 s to 0.67 s.

People & Community used the same runtime reveal system around its hero. Removing that boundary improved its mobile LCP from 3.84 s to 2.51 s. Early Access improved from 3.26 s to 3.00 s. The sampled service route varied from 1.80 s to 2.20 s in the single final run while its performance score and TBT improved materially; this route should be checked again in deployed field data.

## Images

Audited public raster assets:

| File | Dimensions | Size | Format | Usage |
| --- | ---: | ---: | --- | --- |
| `public/images/social/dar-tahara-early-access-v1.jpg` | 1200×630 | 184 KB | JPEG | Early Access social metadata |
| `public/images/people-community/dar-tahara-people-community-v1.jpg` | 1472×920 | 143 KB | JPEG | People & Community hero |

Marketing photography is delivered through `next/image` with responsive `sizes` and AVIF/WebP negotiation. Below-fold gallery images remain lazy. No source raster was recompressed because the rendered Next.js variants were already small and visual brand quality was prioritized. Homepage mobile image transfer remained approximately 79 KB; no image regression was introduced.

## JavaScript

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Homepage transferred script | 210 KB | 149 KB | −61 KB (−29%) |
| Homepage Next.js First Load JS | 183 KB | 129 KB | −54 KB (−30%) |
| People & Community First Load JS | 158 KB | 111 KB | −47 KB (−30%) |
| Homepage document transfer | 97 KB | 87 KB | −10 KB (−10%) |

The deferred booking modal retains Framer Motion internally, but that package is no longer required by the initial marketing route. Full chat, Turnstile-backed newsletter popup, and booking UI code load only when their user journey needs them.

## Third-Party Scripts

| Script / integration | Purpose | Final behavior |
| --- | --- | --- |
| Google Analytics | Analytics/conversion measurement | Consent-gated; `afterInteractive`; zero clean-consent baseline bytes |
| Mautic tracking | Lead/contact attribution | Consent-gated; `afterInteractive`; zero clean-consent baseline bytes |
| Cloudflare Turnstile | Form abuse prevention | Loaded with the newsletter/form path, not the first paint |
| Google Maps | Booking address assistance | Reachable only after the lazy booking modal opens |
| Dar Tahara assistant | Customer assistance | Small launcher initially; full assistant loaded on activation |

No legitimate analytics, Mautic, conversion, referral, or form integration was removed.

## Fonts

Fraunces and Hanken Grotesk remain managed by `next/font`, preserving the existing brand typography and local optimized delivery. The two first-visit WOFF2 resources total approximately 72 KB. `font-display: optional` prevents a slow-network font swap from extending text LCP or causing layout instability. Font bytes are unchanged; render behavior is improved.

## CLS

Measured CLS is 0 on every final mobile route and effectively zero (0.00009) on the desktop homepage. Existing explicit image/aspect-ratio reservations were preserved. Standard below-fold sections now use intrinsic-size containment, while popups and consent remain fixed overlays and do not insert content above the page.

## INP and Interaction Responsiveness

Lighthouse does not produce field INP in a local lab run, so TBT is used as the immediate main-thread proxy:

- Homepage mobile: 1,490 ms → 437 ms (−71%)
- Early Access mobile: 550 ms → 252 ms (−54%)
- People & Community mobile: 566 ms → 326 ms (−42%)
- Service mobile: 972 ms → 257 ms (−74%)

The navbar auth check is idle-scheduled, and heavy optional interfaces are activation-loaded. Existing form, menu, language, calculator, referral, and assistant event handling is preserved.

## Server Performance

- Anonymous requests no longer call `supabase.auth.getUser()` when no Supabase session cookie exists.
- Public feature configuration uses a 60-second tagged cache.
- Admin feature updates immediately invalidate that cache.
- Public duration tiers use a five-minute cache.
- Local warm TTFB improved from 465 ms to 150 ms on the homepage, 259 ms to 41 ms on Early Access, and 246 ms to 92 ms on People & Community.

Private account, admin, session-specific, payment, and customer data remains uncached. Localized marketing pages remain request-aware rather than being incorrectly frozen at build time.

## SEO Verification

Final Lighthouse SEO is 100 on all measured routes. Automated tests verify canonical URLs, complete hreflang sets, localized service routes, sitemap contents, robots rules, private-route exclusions, structured data, and metadata helpers. Localized metadata is resolved into the initial `<head>` for deterministic crawler access.

## Conversion Verification

The full automated suite passes: **630 tests passed, 0 failed**. It covers Early Access persistence and validation, Mautic mapping/synchronization, referral state and reward logic, assessment booking/pricing, auth destinations, Stripe flows, localization, sitemap/robots/metadata, and middleware behavior.

No production lead, payment, referral, or Mautic record was created during this local performance pass. A post-deployment smoke test with designated test identities is still required to confirm external production credentials, analytics dashboards, and webhook delivery.

## Final Metrics

| Route / profile | Perf | A11y | Best Practices | SEO | FCP | LCP | CLS | TBT | Speed Index | TTFB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage mobile | 85 | 97 | 100 | 100 | 1.90 s | 2.52 s | 0 | 437 ms | 1.90 s | 150 ms |
| Homepage desktop | 100 | 97 | 100 | 100 | 0.43 s | 0.67 s | 0.00009 | 19 ms | 0.55 s | 100 ms |
| Early Access mobile | 89 | 100 | 100 | 100 | 1.55 s | 3.00 s | 0 | 252 ms | 1.55 s | 41 ms |
| People & Community mobile | 89 | 96 | 100 | 100 | 1.71 s | 2.51 s | 0 | 326 ms | 1.71 s | 92 ms |
| Premium Cleaning service mobile | 93 | 96 | 100 | 100 | 1.53 s | 2.20 s | 0 | 257 ms | 1.53 s | 43 ms |

Final homepage transfer summary:

- Total: 406 KB (−71 KB, −15%)
- JavaScript: 149 KB (−61 KB, −29%)
- HTML/document: 87 KB (−10 KB, −10%)
- Images: 79 KB (unchanged)
- Fonts: 72 KB (unchanged)
- CSS: 13 KB (essentially unchanged)

## Build and Quality Checks

- `npm run lint` — passed (repository emits only the existing ESLint legacy-config warning)
- `npm run typecheck` — passed
- `npm run check:i18n` — passed; all 720 keys present in every locale
- `npm test` — 630 passed, 0 failed
- `npm run build` — passed; 162/162 static pages generated
- Lighthouse route matrix — completed; Windows Chrome occasionally reported a temp-profile cleanup `EPERM` after writing a valid JSON result, which did not invalidate the saved measurements

## Remaining Recommendations

1. Deploy and watch Vercel field LCP/INP/CLS for at least one full reporting window; field score movement is not immediate.
2. Run a production smoke test for Early Access, Mautic arrival, referral attribution, assessment booking, language switching, and consented analytics using approved test records.
3. Re-check service-page LCP in production because its single final local run showed normal Lighthouse variance despite much lower TBT and a higher overall score.
4. If a stable homepage score above 90 is still required, the next safe project is reducing the global 102 KB Next/React shared runtime or splitting the long homepage content model; those changes are architectural and should be isolated from this low-risk pass.
