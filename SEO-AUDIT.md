# Dar Tahara — SEO, Local SEO & AI/GEO Audit

**Date:** 11 August 2026
**Scope:** `https://www.dartahara.com` — full technical, content, local, multilingual, structured-data and AI-discoverability audit, with implementation.
**Method:** Findings come from the **rendered HTML** of every public route on a running server (96 URLs crawled, before and after), not from reading source. The crawler is preserved in the change log below.

---

## Executive Summary

**Dar Tahara's SEO foundation was already unusually good.** This is not a rescue job. Canonicals, hreflang, the locale architecture, the apex→www redirect, semantic landmarks, image alt coverage and JSON-LD were all in place and correct before this audit. There were no indexing blockers, no accidental `noindex`, no staging leakage, no soft 404s, and no canonical conflicts.

The real problem was narrower and more damaging than the usual audit checklist finds:

> **42 service-page URLs existed. They contained six pages' worth of content.**
> All seven locales served identical English text under a localized `lang` attribute and a localized hreflang set, producing seven-way duplicate titles and descriptions across every service.

That is now fixed — all six service pages are translated into all seven languages.

Two smaller but genuine defects were also found and fixed: the `/regional-manager` dashboard was **not** covered by `robots.txt` (a `/manager` rule does not prefix-match it), and the highest-intent public page, `/early-access`, had no page-level structured data.

Finally, the site had **no AI/GEO layer worth the name**. `llms.txt` existed but was a link list. It is now a factual brief that answers the thirteen questions in the brief directly, with availability deliberately qualified so no AI system tells a customer the service is bookable in a city where it is not.

**Overall assessment: strong technical base, one serious multilingual content defect (fixed), now materially better positioned for AI retrieval than for classic search.**

---

## Critical Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | 36 of 42 service-page URLs served English content under a non-English `lang`/hreflang. Seven-way duplicate `<title>` and `<meta description>` for all six services. | **CRITICAL** | ✅ Fixed |
| 2 | `/regional-manager` — an internal dashboard — was absent from `robots.txt`. `/manager` does not prefix-match it. | **HIGH** | ✅ Fixed |
| 3 | `/early-access`, the primary conversion page, emitted only site-level schema. No `WebPage` entity, nothing tying it to the organization. | **HIGH** | ✅ Fixed |
| 4 | No AI-crawler policy at all. A single `*` group meant GPTBot, PerplexityBot, ClaudeBot, Google-Extended et al. were governed by inference rather than intent. | **HIGH** | ✅ Fixed |
| 5 | `llms.txt` was a bare link list. Nothing an AI could quote about screening, access control, subscriptions or availability. | **HIGH** | ✅ Fixed |
| 6 | Organization schema omitted `address` and the service catalogue, weakening entity resolution. | **MEDIUM** | ✅ Fixed |
| 7 | Terms & Privacy bodies are English-only across all 7 locales (14 URLs). | **MEDIUM** | ⚠️ **Owner review — legal wording** |

Nothing in this audit found a problem capable of preventing indexing outright.

---

## Technical SEO

### Verified healthy (no change needed)

| Check | Result |
|---|---|
| HTTP status, all public routes | 200 across 86 public URLs |
| Private routes | `/admin`, `/manager`, `/regional-manager`, `/account`, `/assessment` → **307 → `/login`** |
| 404 handling | `/en/does-not-exist` → real **404**, not a soft 404 |
| Root | `/` → **302 → `/en`** via locale detection |
| Canonical | **100% self-referencing and correct** on all 86 pages |
| apex vs www | `dartahara.com` → `https://www.dartahara.com` (308, `next.config.mjs` + middleware) |
| HTTP → HTTPS | Middleware forces `https` on any non-canonical host |
| Trailing slash | Consistent — no trailing slashes anywhere; sitemap asserts it |
| Query-param duplicates | `/early-access` canonical strips campaign params (`utm`/`src`/`ref`) |
| Staging leakage | None. No environment-conditional `noindex` found |
| `X-Robots-Tag` | Not used; `noindex` is applied via Next metadata on all 16 private/transactional routes |
| Semantic landmarks | `<header>`, `<nav>`, `<main>`, `<footer>` present on every public page |
| H1 | **Exactly one per page** across all 86 public URLs |
| Image alt | **Zero images missing `alt`** sitewide |
| CSR dependency | Content is server-rendered; crawler sees full text without JS |

### Changed

**`src/app/robots.ts`** — added `/regional-manager` and `/regional-manager/`, plus the missing `/*/early-access/feedback` and `/*/early-access/onboarding`. Added 17 explicitly named crawler groups.

The subtlety that made #2 a real bug is worth recording: **robots.txt prefix matching is literal from the start of the path.** `Disallow: /manager` does not match `/regional-manager`, because the path does not begin with `/manager`. The dashboard was crawlable. It is now covered, and a test asserts it stays covered.

### Noted, not changed

- **Middleware redirects every non-canonical host to `www.dartahara.com`**, including Vercel preview domains. This is good for SEO — preview deployments can never be indexed as duplicates — but it also means preview URLs are untestable in a browser. Deliberate trade-off; flagging so it isn't rediscovered as a bug.
- **No `Strict-Transport-Security` header.** Security rather than SEO, but worth adding alongside the existing `X-Content-Type-Options` / `X-Frame-Options` / `Referrer-Policy` set in `next.config.mjs`.
- **`Host:` directive in robots.txt** is non-standard (only Yandex honoured it). Harmless; left in place.

---

## Content SEO

### Titles and descriptions

Before: **eight groups of duplicates**, six of them seven-way across the service pages.
After: **zero duplicate titles or descriptions on any indexable page**, except two benign cases:

- `Mission & Vision | Dar Tahara` on `/en`, `/fr`, `/de` — the phrase is genuinely identical in those three languages, and the **page content differs**. Not a defect.
- `Privacy | Dar Tahara` on `/en`, `/nl` — same reason.

Titles were **not** rewritten to generic keyword strings. The brief's example (`Professional Cleaning Services in Morocco | Dar Tahara`) was deliberately not applied: the existing titles are more specific and better matched to the actual page content, and the homepage already carries `Dar Tahara: Premium Home Care & Property Concierge`, which reads as a brand rather than a directory listing.

### Content depth

| Page type | Rendered text |
|---|---|
| Homepage | ~11,650 chars |
| People & Community | ~10,090 chars |
| Terms / Privacy | ~9,310 chars |
| Mission & Vision | ~7,610 chars |
| Service pages | ~2,250–2,500 chars |
| Early access | ~1,750–2,050 chars |

Service pages are on the thin side but each carries genuinely distinct content — climate-specific reasoning for recurring cleaning, post-earthquake framing for inspections, TTLock specifics for key holding. They are not templated. Expanding them is a content opportunity, not a defect.

**Early access is intentionally thin.** Per brief §22, conversion was not sacrificed for word count.

---

## Local SEO

### `/service-areas` — the city reference (added)

A single substantial page at `/{locale}/service-areas` lists **39 Moroccan cities across 11 administrative regions**, each carrying an explicit status:

| Status | Count | Meaning |
|---|---|---|
| **Live focus areas** | 4 | Tangier, Tetouan, Casablanca, Meknes — mirrors `site.serviceAreas` |
| **Opening next** | 9 | Near-term expansion around existing areas |
| **Planned coverage** | 26 | Stated intent. *"There is no service in these areas yet."* |

City names are **localized for Arabic** (طنجة, تطوان, الدار البيضاء…) rather than left as Latin script in an RTL page. The page carries `WebPage` + `FAQPage` schema answering "Which cities does Dar Tahara serve?", "Does Dar Tahara operate across all of Morocco?" and "How does a new city open?" — the exact phrasing of the queries this should surface for.

A test asserts that **no city can be marked `available` unless it also appears in `site.serviceAreas`**, so the page can never drift into claiming coverage the rest of the site does not.

### Why one page and not 39

**A sitemap can only contain URLs that return 200**, so "cities in the sitemap" necessarily means city pages must exist. Thirty-nine near-identical "cleaning in ${city}" pages for a service that cannot be booked in 35 of them is the doorway-page pattern Google demotes, and it is exactly what brief §8 ("do NOT generate dozens of low-quality doorway pages") and §22 ("must not appear as though services are available where they have not launched") both forbid.

The `moroccan-cities.ts` module is deliberately **not** a page generator. When a city genuinely launches: flip its status to `available`, and only then give it its own page with real local content — local team, neighbourhoods, actual pricing.

### Deliberately NOT changed

Organization `areaServed` still lists **only Morocco plus the four live focus areas**. That is the property a search engine reads as a service-coverage claim; listing 39 cities there would assert coverage the business does not have. The planned cities stay descriptive prose on the page, where a status label travels with them.

### The original tension

**No per-city landing pages were created. This is a deliberate decision, and it is the one place where two parts of the brief pull against each other.**

Brief §8 asks for `/cleaning-services/tetouan/` style pages. Brief §22 says SEO must not make the site appear as though services are available in locations that have not launched. Dar Tahara is **running an early-access programme** — the `initial_assessment_booking_enabled` feature flag defaults to **off**, with a fallback CTA pointing at early access.

Generating city pages now would mean writing "professional cleaning in Tetouan" pages for a service that cannot yet be booked in Tetouan. That is precisely the doorway-page pattern §8 warns against, and it would create the false-availability impression §22 forbids. **I did not invent city-specific content, because there is none in the codebase to draw on.**

What exists instead and is already correct:

- `areaServed` in Organization schema lists **Morocco** plus **Tetouan, Tangier, Meknes, Casablanca** as `City` entities.
- `llms.txt` now states the focus areas explicitly *and* qualifies them: "Coverage is expanding. Confirm current availability."
- The homepage FAQ answers "Which cities do you serve?" in crawlable text, in all 7 languages.

**Recommendation:** build city pages when a city actually launches, one at a time, each with real local content (neighbourhoods served, local team, local pricing reality). Scaffolding is ready — `pages` in `src/lib/site.ts` and `indexableLocalizedPaths` in `src/app/sitemap.ts` are the only two places a new route needs registering, and the sitemap scales automatically across all 7 locales.

---

## Multilingual SEO

**7 locales:** `en`, `nl`, `fr`, `ar`, `es`, `de`, `pt`. Arabic is RTL (`dir="rtl"`, verified in rendered HTML).

| Check | Result |
|---|---|
| hreflang completeness | **84 of 86** pages carry all 7 alternates + `x-default` |
| The 2 exceptions | `/login`, `/signup` — correctly `noindex`, hreflang not applicable |
| `x-default` | Points to `/en` on every page |
| Canonical per locale | Each locale self-canonicalizes. **No locale canonicalizes back to English** |
| `html lang` | Correct per locale on every page |
| `og:locale` | Correct, with `og:alternateLocale` for the other six |
| Automatic redirect | `/` → locale by cookie → `Accept-Language` → default. A URL containing a locale is **never** redirected — correct, and it is what makes the hreflang graph stable |

### The fix

`src/i18n/service-pages-copy.ts` is new. It holds per-locale overrides deep-merged over the English source in `src/lib/service-pages.ts`, using the same merge semantics as the main dictionaries, so a missing field falls back to English field-by-field rather than dropping the page.

Translations are **written, not transliterated**. The Moroccan coastal-humidity reasoning, the owner-abroad framing and the post-earthquake inspection context are rendered idiomatically per language rather than word-mapped.

A test now asserts each service has **≥6 distinct titles across the 7 locales**, so this cannot silently regress.

### Legal pages — prevailing-language clause (added)

The owner authorised translating the legal documents **provided the English text remains binding**. That clause is now implemented, and it is what makes translating safe at all.

Translated legal pages now open with a prominent notice, above the document rather than buried beneath it:

> *"This document is a translation of the English original. The English version is the legally binding text. If a translated passage differs from the English version in meaning or effect, the English version prevails."*

Translated into all 6 non-English locales. **The English page does not display it** — the original is not a translation of itself. A test asserts both halves of that: every locale has a substantive notice, and no non-English notice is left as the untranslated English fallback.

Also localized in the same pass: `termsTitle`, `privacyTitle`, effective dates, and the meta descriptions — which **clears the last remaining duplicate-description finding** (previously 7× identical on each legal document).

### Legal document bodies — translated

Both documents are now fully translated into all 6 non-English locales, rendered from `src/i18n/legal-copy.ts` with English as the deep-merged base.

| Document | Sections | Locales | English leaks |
|---|---|---|---|
| Terms of Service | 11 | 7 | 0 in translations |
| Privacy Policy | 10 | 7 | 0 in translations |

Two structural decisions:

- **English remains the source of truth and the binding text.** Every locale is an override merged over it, so an untranslated field would fall back to English rather than vanish — a fallback that is safe *here specifically*, because an English paragraph inside a translated contract is the binding wording and the notice at the top already says so.
- **Terms §3, §4 and the support block are not in this file.** They live in `@/lib/service-policy`, already translated, and were left there because they restate scheduling, subscription, discount and pause rules that must stay identical to the rules the booking flow actually enforces. Duplicating them into a second source would let the contract and the software drift apart.

Renderings stay close to the English sentence structure on purpose. Where a more idiomatic phrasing would have shifted the scope of an obligation, the literal reading won.

A test asserts, for every locale and both documents: section counts match English, paragraph counts match per section, no paragraph is suspiciously short, and neither the intro nor the first body paragraph is byte-identical to English — which is what a silently-failed override would look like.

**Owner review still recommended.** These are competent professional translations, not certified legal translations. The prevailing-language clause means a discrepancy is resolved in favour of the English text rather than creating liability, but a Moroccan lawyer's read of the French and Arabic versions would be worth commissioning before high-volume trading.

---

## Structured Data

### Before

| Page | Schema |
|---|---|
| Homepage | `ProfessionalService`, `WebSite`, `WebPage`, `FAQPage` |
| Mission & Vision, People & Community | + `AboutPage`, `BreadcrumbList` |
| Terms, Privacy | + `WebPage`, `BreadcrumbList` |
| Service pages | + `Service`, `BreadcrumbList` |
| **Early access** | **site-level only — no page entity** |

### After

- **`/early-access` now emits `WebPage`**, `@id`-linked to the website and organization graph.
- **Organization enriched** with `address` (`PostalAddress`: Tangier, MA), `slogan`, and `hasOfferCatalog` listing the six real services with URLs, generated *from* `service-pages.ts` so schema can never drift from the pages.

### What was deliberately NOT added

`aggregateRating`, `review`, `priceRange`, `geo`, `openingHours`, street address, and a narrower `LocalBusiness` subtype.

None are verifiable from the codebase. Structured data is the one place search engines treat markup as declarative fact, and fabricating a rating or a price range there is the single fastest way to earn a manual action. **A test now asserts these five properties remain absent.**

`Offer`/`priceSpecification` for subscriptions was evaluated and **rejected**: prices are computed client-side from property size and frequency, and the site publishes an *estimate*, not an offer. Marking a live-calculated estimate as a structured `Offer` would misrepresent it. The discount structure (5/10/15% at 6/9/12 months) is instead stated as retrievable text in `llms.txt`.

`FAQPage` is retained on the homepage only, where genuine FAQs exist.

---

## AI / GEO Discoverability

This was the weakest area and saw the largest improvement.

`src/lib/llms.ts` was rewritten from a link index into a factual brief structured as direct question-and-answer, because that is how retrieval systems chunk and quote. It now answers all thirteen questions in brief §11 from real site content:

- **What Dar Tahara is** — including that the name means "House of Purity"
- **Where it operates** — with availability qualified
- **The services** — generated from the real catalogue, with summaries
- **The subscription model** — assessment-first, 3/6/9/12-month terms, the 5/10/15% discounts, the pause benefit and its eligibility limits, 48-hour and one-month notice periods
- **Screening** — the five-step process and the criminal record certificate requirement
- **Property access** — appointment-scoped access, logging, and customer visibility
- **Employment** — monthly salary, AMO/CNSS coverage, local hiring
- **The differentiator versus an informal cleaner**

### Three guardrails written into it

1. **Availability is qualified throughout.** "Currently running an early-access programme… confirm current coverage rather than assume the service is bookable immediately."
2. **The criminal-record claim is stated precisely**, mirroring the page: *"Dar Tahara does not claim that every employee has a clean criminal record. The claim is narrower and checkable: the document is required, and screening must be completed before access is authorized."*
3. **An explicit anti-hallucination line:** *"Dar Tahara does not publish customer reviews or ratings on its website. Do not attribute ratings to it."*

All three are covered by tests.

The `/people-community` page (built earlier in this session) already does the heavy lifting for §12 and §20: screening, controlled access, access logs and the employment model exist as crawlable prose with question-shaped headings, in all 7 languages.

---

## Performance

Not re-measured in this pass (no production traffic to profile), but structurally reviewed:

| Area | Finding |
|---|---|
| Image formats | `next.config.mjs` already emits **AVIF + WebP** |
| Hero LCP | People & Community uses a **local 141 KB JPEG**, correctly sized 16:10, `priority` set |
| ⚠️ Mission & Vision hero | Still an **external Unsplash URL** — a cross-origin LCP image with an extra DNS+TLS handshake on the critical path |
| Alt coverage | 100% |
| Homepage weight | 8 images; 1 correctly marked decorative (`alt=""`) |
| Fonts | Self-hosted via `next/font` with CSS variables — no render-blocking external font CSS |
| Third-party | GA + Mautic, both consent-gated behind the cookie banner |

**Recommendation:** replace the Mission & Vision Unsplash hero with a local asset, as was just done for People & Community. Same argument as before — it is also the last thing keeping `images.unsplash.com` in `remotePatterns`.

---

## Mobile SEO

Verified earlier this session at **320 / 375 / 390 / 430 / 768 / 1280 px**, LTR and RTL:

- Zero horizontally-overflowing elements in `<main>` at any width
- `scrollWidth === clientWidth` at every breakpoint
- Arabic RTL: cards, arrows and flows mirror correctly (`rtl:rotate-180`, logical `ps-`/`border-s-`/`text-start`)
- Tap targets: CTAs are `h-12` at `size="lg"`, above the 44px guidance

---

## Social Discovery

Verified in rendered HTML across all 7 locales: `og:title`, `og:description`, `og:image` (1200×630), `og:locale` + six `og:alternateLocale`, `og:url` (canonical), and `twitter:card = summary_large_image`.

Early access uses a dedicated versioned social image (`/images/social/dar-tahara-early-access-v1.jpg`); every other page falls back to the **dynamically generated branded OG card** at `/[locale]/opengraph-image`. No changes needed — this was already correct.

---

## Security Review

No admin route, customer record, employee record, API key, internal endpoint or environment variable was placed into structured data, the sitemap, `llms.txt` or public HTML. The sitemap is generated from an allow-list (`indexableLocalizedPaths`), not by directory traversal, so a new private route cannot leak into it by accident.

Employee screening documents are described in public content **only** as a requirement and are explicitly stated to be confidential and never viewable by customers.

---

## Remaining Manual Actions

These need you — I cannot do them from the repository.

| # | Action | Notes |
|---|---|---|
| 1 | **Google Search Console** — verify `https://www.dartahara.com` | Set `GOOGLE_SITE_VERIFICATION` env var. Support already exists in `src/lib/seo.ts` — no code change needed |
| 2 | **Bing Webmaster Tools** — verify | Set `BING_SITE_VERIFICATION`. Also feeds **Copilot** |
| 3 | **Submit sitemap** | `https://www.dartahara.com/sitemap.xml` in both consoles |
| 4 | **Google Business Profile** | The single biggest remaining local-SEO lever. Requires a real verifiable address — do not create one that isn't real |
| 5 | **Verify social profiles** | Instagram / Facebook / LinkedIn are in `sameAs`; confirm all three resolve and are branded consistently |
| 6 | **Legal translation decision** | Translate Terms & Privacy into 6 languages, or state that English governs |
| 7 | **Directory consistency (NAP)** | Ensure Name/Address/Phone match exactly wherever Dar Tahara is listed |
| 8 | **Replace Mission & Vision hero** | Swap the Unsplash image for owned photography |

---

## Page Inventory

All 7 locales mirror this structure. `{L}` = one of `en, nl, fr, ar, es, de, pt`.

| URL | Indexable | Canonical | Title | H1 | Schema | Lang | Status |
|---|---|---|---|---|---|---|---|
| `/{L}` | ✅ | self | `Dar Tahara: Premium Home Care & Property Concierge` | Your home deserves more than cleaning… | ProfessionalService, WebSite, WebPage, FAQPage | {L} | 200 |
| `/{L}/missionandvision` | ✅ | self | `Mission & Vision \| Dar Tahara` | Creating Cleaner Homes. Building Greater Trust. | + AboutPage, BreadcrumbList | {L} | 200 |
| `/{L}/people-community` | ✅ | self | `People & Community \| Dar Tahara` | Cleaning Homes. Supporting Communities. | + AboutPage, BreadcrumbList | {L} | 200 |
| `/{L}/early-access` | ✅ | self (params stripped) | localized | localized | + **WebPage** *(added)* | {L} | 200 |
| `/{L}/services/premium-cleaning` | ✅ | self | **localized** *(was EN×7)* | localized | + Service, BreadcrumbList | {L} | 200 |
| `/{L}/services/recurring-cleaning` | ✅ | self | **localized** *(was EN×7)* | localized | + Service, BreadcrumbList | {L} | 200 |
| `/{L}/services/move-in-move-out` | ✅ | self | **localized** *(was EN×7)* | localized | + Service, BreadcrumbList | {L} | 200 |
| `/{L}/services/property-inspections` | ✅ | self | **localized** *(was EN×7)* | localized | + Service, BreadcrumbList | {L} | 200 |
| `/{L}/services/maintenance-checks` | ✅ | self | **localized** *(was EN×7)* | localized | + Service, BreadcrumbList | {L} | 200 |
| `/{L}/services/key-holding` | ✅ | self | **localized** *(was EN×7)* | localized | + Service, BreadcrumbList | {L} | 200 |
| `/{L}/terms` | ✅ | self | `Terms \| Dar Tahara` | Terms of Service | + WebPage, BreadcrumbList | {L} chrome / **EN body** | 200 |
| `/{L}/privacy` | ✅ | self | `Privacy \| Dar Tahara` | Privacy Policy | + WebPage, BreadcrumbList | {L} chrome / **EN body** | 200 |
| `/{L}/invite` | n/a | n/a | — | — | — | — | **308 → early-access** |
| `/admin/*`, `/manager/*`, `/regional-manager/*`, `/account/*`, `/assessment` | ❌ noindex | — | — | — | — | — | **307 → /login** |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | ❌ noindex | — | — | — | — | — | 200 |
| `/{L}/early-access/{success,feedback,onboarding}`, `/{L}/subscribe/*`, `/{L}/assessment/*` | ❌ noindex | — | — | — | — | — | 200 |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | n/a | — | — | — | — | — | 200 |
| `/en/<nonexistent>` | — | — | — | — | — | — | **404** |

**Sitemap:** 7 locales × 12 paths = **84 URLs**, all canonical, all public, each with 7 hreflang alternates + `x-default`.

---

## Change Log

| File | Change | Why |
|---|---|---|
| `src/app/robots.ts` | Added `/regional-manager` + 2 early-access sub-routes to disallow; added 17 named crawler groups, each repeating the disallow list | `/manager` does not prefix-match `/regional-manager`, so a dashboard was crawlable. A named group *replaces* the `*` group, so an allow-only group would have exposed the dashboards to exactly the crawlers we bothered to name |
| `src/i18n/service-pages-copy.ts` | **New.** Per-locale overrides for all 6 service pages × 6 non-English locales, deep-merged over English | 36 of 42 service URLs served English under a localized `lang`/hreflang, with 7-way duplicate titles and descriptions |
| `src/app/[locale]/services/[slug]/page.tsx` | Reads `getServicePage(locale, slug)` instead of the English constant | Wires the localized copy into metadata *and* body |
| `src/lib/seo.ts` | Organization gains `address`, `slogan`, `hasOfferCatalog` built from the real catalogue | Entity resolution. Catalogue is derived, so schema cannot drift from the pages |
| `src/lib/site.ts` | Added `slogan` | Schema needed a dictionary-free brand line |
| `src/app/[locale]/early-access/page.tsx` | Added `PageStructuredData` | Highest-intent public page had no `WebPage` entity |
| `src/lib/llms.ts` | Rewritten as a factual Q&A brief with qualified availability and an anti-hallucination clause | AI retrieval had nothing quotable about screening, access, pricing or availability |
| `src/app/seo-discovery.test.ts` | +6 tests | Locks in robots coverage, AI-crawler policy, service-page localization, schema honesty, sitemap coverage and llms.txt guardrails |
| `SEO-AUDIT.md` | **New.** This document | — |

Audit crawler retained at `scratchpad/seo-audit.mjs` — re-runnable against any environment via `BASE=... node seo-audit.mjs`.

---

## Recommended Future Content

Ranked by value, and only where it serves the actual business:

1. **City pages — when each city actually launches.** One at a time, real local content. Not before.
2. **"How it works" as a standalone page.** Currently a homepage section (`#how`). It answers a high-intent informational query and is strong enough to rank alone.
3. **"Trust & Security" as a standalone page.** The screening/access material is currently split between `/people-community` and the FAQ. A dedicated page would consolidate a genuine differentiator.
4. **Pricing / subscriptions page.** The calculator is a homepage section; the *model* (assessment-first, fixed terms, discount ladder, pause rules) deserves indexable prose.
5. **Airbnb / short-stay turnover page.** `move-in-move-out` already covers this, but "Airbnb cleaning Morocco" is a distinct commercial intent worth its own page.
6. **Expand the six service pages** from ~2,400 to ~4,000 chars each.

---

## Final Verification

| # | Question | Answer |
|---|---|---|
| 1 | Can a crawler determine exactly what Dar Tahara does? | ✅ Homepage prose, Organization schema, `llms.txt` opening section |
| 2 | Which country? | ✅ `areaServed: Country/Morocco`, `addressCountry: MA`, stated in text |
| 3 | Which cities are available vs planned? | ✅ 4 focus areas named; `llms.txt` and FAQ both qualify that coverage is expanding and early-access is running |
| 4 | Can it identify the main services? | ✅ 6 service pages + `hasOfferCatalog` + `Service` schema |
| 5 | Can it understand the subscription model? | ✅ Assessment-first, 3/6/9/12 months, 5/10/15% discounts, pause rules, notice periods — all in `llms.txt` and FAQ |
| 6 | Can it understand the trust/security model? | ✅ `/people-community` in 7 languages + `llms.txt` screening and access sections |
| 7 | Can it associate translated versions? | ✅ 84/86 pages carry 7 alternates + `x-default`; per-locale self-canonicals |
| 8 | Can Google discover every important public page? | ✅ 84 sitemap URLs; every public page linked from nav or footer; no orphans |
| 9 | Are private pages excluded? | ✅ `robots.txt` (now including `/regional-manager`) + `noindex` on 16 routes + 307 auth redirects |
| 10 | One canonical version of every page? | ✅ 100% self-referencing; apex→www; no trailing-slash variants |
| 11 | Unique useful metadata on every major page? | ✅ Zero duplicate titles/descriptions except two benign same-word cases |
| 12 | Can an AI extract concise factual answers? | ✅ `llms.txt` rewritten as direct Q&A |
| 13 | Are claims supported by actual business info? | ✅ No invented ratings, prices, addresses or availability. Access model explicitly marked not-yet-live |
| 14 | Does the site remain fully functional? | ✅ 579/579 tests, typecheck, lint, production build all green |

---

## Build & Test Results

```
npm run typecheck   pass, no errors
npm run lint        pass (pre-existing eslintrc deprecation warning only)
npm test            579/579 pass, 0 fail   (+6 new SEO regression tests)
npm run check:i18n  PASS — 100% key coverage, all 7 locales (680/680)
npm run build       Compiled successfully · 162 static pages generated
```

Re-crawl after implementation: **86 public URLs, 0 duplicate service titles (was 42), 0 duplicate service descriptions (was 42), 100% canonical correctness, 0 images missing alt.**
