# SEO and AI discovery

## Audit summary

Dar Tahara uses Next.js 15 App Router, React Server Components and server rendering. Public marketing pages are locale-prefixed for English, Dutch, French, Arabic, Spanish, German and Portuguese. The root middleware negotiates a locale and the document `lang` and `dir` attributes are set from the active request locale. Vercel and the VPS/Caddy configuration are the deployment paths represented in the repository.

Before this implementation, the project already had localized homepage metadata, dynamic Open Graph images, a sitemap, a permissive robots file and JSON-LD. The audit found these production issues:

- The sitemap omitted service and Early Access pages and generated a new `lastmod` value on every build/request.
- `robots.txt` allowed private application and authentication routes.
- Page metadata was repeated and nested pages could inherit incomplete or incorrect alternate metadata.
- Service pages lacked complete Open Graph, X/Twitter, hreflang, breadcrumb and `Service` data.
- Existing business JSON-LD used an unsupported price range, a potentially over-specific type, duplicate entities, missing image assets and raw script serialization.
- Only the initially expanded FAQ answer was present in initial HTML.
- Repository VPS configuration served the apex and `www` hosts as separate sites instead of redirecting to the canonical host.
- Environment examples and several generated links used the non-canonical apex domain.
- There was no `llms.txt` or webmaster-verification configuration.

Critical marketing copy, headings, FAQ content, contact details and links are rendered into initial HTML. Interactive client components enhance that server-rendered output. The localized layout is intentionally dynamic because public feature flags are database-controlled.

## Canonical domain and URL rules

The canonical origin is `https://www.dartahara.com`, defined in `src/lib/site.ts`. Metadata does not derive its production origin from request hosts, preview deployments or development environment variables.

- Vercel currently redirects `https://dartahara.com` to `https://www.dartahara.com` with HTTP 308.
- `next.config.mjs` contains a permanent host redirect as application-level defense in depth.
- The VPS Caddy configuration redirects both HTTP and HTTPS apex requests directly to the `www` HTTPS host; Caddy provides the HTTP-to-HTTPS redirect for the `www` host.
- Next.js uses its default no-trailing-slash route format; canonical helpers remove trailing slashes.
- Canonicals contain no query string, so UTM, referral and other tracking parameters consolidate to the clean route.
- Each indexable localized route has a self-referencing absolute canonical and alternate URLs for all supported locales plus `x-default` to English.

Production and authentication environment values must also use the `www` origin. The apex callback remains on the Supabase allow-list only as a transition-safe redirect source.

## Central configuration and metadata

`src/lib/site.ts` owns:

- site name and production URL;
- default locale and supported locales;
- default title, title template and description;
- logo and default social image URLs;
- public email and telephone;
- official social profiles and repository-confirmed service areas.

`src/lib/seo.ts` builds absolute URLs, canonical/hreflang sets, index/noindex directives, Open Graph metadata, X/Twitter cards, webmaster verification and JSON-LD entities. Page titles use `Page title | Dar Tahara`, while titles that already contain the brand are not duplicated.

To add a public page:

1. Add the route using the existing locale structure.
2. Add its path to the central `pages` object when the path is reused.
3. Call `buildLocalizedMetadata` with the locale, path, unique title and unique description.
4. Add the route to `indexableLocalizedPaths` only if it returns HTTP 200, is canonical, public and intended for search.
5. Add visible breadcrumbs and the matching page schema when the route is nested.
6. Add descriptive internal links from a relevant existing page.
7. Extend `src/app/seo-discovery.test.ts` for new route classes or exclusions.

## Localization and hreflang

Language routes use `en`, `nl`, `fr`, `ar`, `es`, `de` and `pt`. These language-only hreflang codes match the route scope; Open Graph uses regional locale values such as `en_US`, `fr_FR` and `ar_MA`. English is the default and `x-default` target.

Translations are loaded through the established deep-merge dictionary system, where English is the explicit fallback. Run `npm run check:i18n` after adding metadata copy. Do not add an alternate URL for a locale until the route exists.

Known translation limitation: the long-form service-detail content and most legal body copy remain English repository content on non-English routes, although shared navigation, service summaries and policy fragments are localized. No machine-generated translations were added. These pages should receive reviewed translations through the existing content sources before claiming fully localized long-form copy.

## robots.txt

`/robots.txt` allows public content and assets for all user agents. It does not maintain a brittle allow-list or deny-list of individual search or AI crawler names.

It disallows crawling of:

- `/api/` and `/auth/`;
- `/account`, `/admin`, `/manager` and staff `/assessment` workspaces;
- login, signup, forgotten-password and reset-password routes;
- localized assessment confirmation and legacy token quote routes;
- Early Access success and mailing-list status routes.

It does not block `/_next`, styles, scripts, images, fonts, Open Graph images, public locale routes, the sitemap or `llms.txt`. It declares:

```text
Host: https://www.dartahara.com
Sitemap: https://www.dartahara.com/sitemap.xml
```

Robots rules are crawl hints, not access control. Authentication, authorization, Supabase RLS and API validation remain responsible for private-data protection.

## sitemap.xml

`/sitemap.xml` contains 77 canonical URLs:

- seven localized homepages;
- seven Mission and Vision pages;
- seven Early Access pages;
- seven Terms pages;
- seven Privacy pages;
- six service-detail pages in each of seven locales.

Every entry uses the production `www` HTTPS origin and includes language alternates plus English `x-default`. The sitemap excludes redirects, auth, account, admin, manager, staff assessment, API, token, success/status, payment and customer-specific pages.

`lastmod` is included only where a repository-backed date is available: 13 July 2026 for Privacy and 24 July 2026 for Terms. Other entries omit it instead of publishing a fabricated current timestamp. `changefreq` and `priority` are intentionally omitted because no evidence-backed values are available.

## llms.txt

`/llms.txt` is a plain-text discovery aid generated from site and service configuration. It identifies Dar Tahara, the official origin, repository-backed services, current focus cities, main official pages, contact details, sitemap and the requirement to verify current pricing, offers, availability and coverage on the official website.

It supplements canonical HTML, robots, sitemap and JSON-LD; it does not control indexing or grant access to private content.

## Structured data

JSON-LD is emitted through one script component with escaping for `<`, `>`, `&` and Unicode line separators. This prevents content from terminating the script element. Empty or undefined facts are not emitted.

Implemented types:

- `ProfessionalService` for the verified service organization;
- `WebSite` with the organization as publisher;
- `WebPage` for general public pages;
- `AboutPage` for Mission and Vision;
- `Service` for each real service page;
- `FAQPage` generated from the exact homepage questions and answers;
- `BreadcrumbList` generated from visible breadcrumb navigation.

Stable entity IDs are:

```text
https://www.dartahara.com/#organization
https://www.dartahara.com/#website
```

No ratings, reviews, awards, price ranges, opening hours, coordinates, street address, unsupported offers or unofficial profiles are included. The homepage FAQ uses native `details`/`summary`, so all schema-backed answers exist as HTML even without JavaScript.

## Indexing controls

Public marketing pages are indexable. Existing application layouts set `noindex, nofollow` for account, admin, manager and staff workspaces. Login, signup and password routes also set noindex directives. Localized Early Access success, mailing-list status and assessment confirmation routes are noindex. Redirect-only invite and legacy quote routes are not listed in the sitemap.

Private routes are absent from the sitemap and remain protected by application authentication and authorization. Do not rely on `robots.txt` or meta tags to secure customer data.

When adding a private or utility page, use the shared `noIndexMetadata` helper or a protected parent layout, keep it out of `indexableLocalizedPaths`, and preserve its authorization checks.

## Verification environment variables

No real tokens are committed. Configure these in Vercel project settings or the production VPS application environment:

```env
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
```

The Google value renders `google-site-verification`; the Bing value renders `msvalidate.01`. Empty values emit no tag.

For Google Search Console:

1. Prefer a Domain property and complete DNS verification, or use the URL-prefix property `https://www.dartahara.com/` with the metadata token.
2. Submit `https://www.dartahara.com/sitemap.xml`.
3. Inspect representative URLs and request indexing after deployment.

For Bing Webmaster Tools:

1. Add `https://www.dartahara.com/` and configure the supplied meta token if DNS/import verification is not used.
2. Submit the same sitemap.
3. Review crawl and index coverage after deployment.

## Validation

Automated coverage verifies:

- production canonicals and clean path normalization;
- complete hreflang and English `x-default` sets;
- noindex/nofollow helpers;
- safe, parseable JSON-LD and stable organization/website IDs;
- sitemap size, allowed origin, exclusions, alternates and honest dates;
- robots private-route exclusions without blocking assets;
- plain-text `llms.txt` status, content type and official URLs;
- absence of development URLs in discovery output.

Run:

```bash
npm run lint
npm run check:i18n
npm run typecheck
npm test
npm run build
```

After starting the production build, request `/robots.txt`, `/sitemap.xml`, `/llms.txt` and representative pages. Validate JSON-LD with Schema.org Validator and Google Rich Results Test. Use URL Inspection in Google Search Console to confirm rendered HTML, canonical selection and indexability.

## Known limitations and deployment actions

- Real raster `logo.png` and a general static social image are not present. JSON-LD uses the existing crawlable SVG icon, and metadata uses the existing dynamic 1200×630 localized Open Graph route. Replace these only with approved official brand assets.
- There are no genuine city-specific landing pages, standalone FAQ page or standalone contact page. City doorway pages were intentionally not created; FAQ, contact and pricing sources are homepage anchors.
- The public app is dynamically rendered because database feature flags must remain current. Ensure the production database and environment are available to the Next.js server.
- Confirm both custom domains are attached in Vercel with `www` as the redirect target. The live check on 1 August 2026 returned HTTP 308 from the apex to `www`.
- The live Vercel path currently takes two redirects from `http://dartahara.com` (HTTPS upgrade, then `www`). If the domain settings expose a direct apex redirect target, configure a one-hop redirect to `https://www.dartahara.com`; canonical sitemap URLs already return without this chain.
- Deploy the updated Caddy configuration before using the VPS path, then validate Caddy and reload it through the documented deployment procedure.
- CDN/WAF rules are outside this repository. Confirm they allow unauthenticated GET/HEAD access to public pages, public assets, `/robots.txt`, `/sitemap.xml` and `/llms.txt` while preserving API rate limits and private-route protection.
- Add production verification tokens and submit the sitemap in Google Search Console and Bing Webmaster Tools.
