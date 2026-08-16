# Dar Tahara Brand Search SEO Report

**Date:** 16 August 2026
**Scope:** Brand/entity disambiguation — teaching Google, Bing and AI search systems that `Dar Tahara`, `DarTahara`, `dartahara` and `dartahara.com` all refer to the same company.
**Relationship to prior work:** [`SEO-AUDIT.md`](./SEO-AUDIT.md) (11 August 2026) covers general technical/content/local/multilingual SEO health and found the site's foundation "unusually good." This report only covers the narrower brand-entity task and does not repeat that audit's findings.

---

## 1. Initial problems found

The codebase was audited before any change was made (`src/lib/seo.ts`, `src/lib/site.ts`, `src/lib/llms.ts`, `src/components/seo/*`, all 7 dictionaries, `robots.ts`, `sitemap.ts`).

**Why `dartahara` already surfaces the site but `dar tahara` does not:**

- The domain itself is `dartahara.com`, and the concatenated form appears literally in the URL, in `hello@dartahara.com`, and in the social handles `dartaharaservices` / `dartahara` (LinkedIn). Every one of those is an exact, unambiguous string match for the query `dartahara`. A search engine doesn't need to *infer* anything — the substring is right there in indexed URLs and text.
- `Dar Tahara` (two words), by contrast, only existed as **visible page copy** — the brand name, nav, titles. It was correctly used everywhere as the on-page brand (that part was already good). But nothing on the site **declared, in a form search engines specifically parse for entity identity, that "Dar Tahara" and "dartahara.com" name the same organization.** That declaration normally comes from `alternateName` in `Organization`/`WebSite` JSON-LD — and it was absent.
- Net effect: `dartahara` resolves by literal string match through the URL/email/handles. `dar tahara` had no structured signal tying it to those same identifiers, so a search engine had to rely on weaker page-content correlation instead of an explicit entity link.

**Specific gaps found:**

| # | Finding | Where |
|---|---|---|
| 1 | No `alternateName` on `Organization` or `WebSite` schema | `src/lib/seo.ts` |
| 2 | No page anywhere stated the `Dar Tahara` / `DarTahara` / `dartahara.com` equivalence in crawlable text | sitewide |
| 3 | `llms.txt` (the AI/GEO brief) never mentioned the alternate spellings, so an AI system asked "is DarTahara the same as Dar Tahara" had nothing to quote | `src/lib/llms.ts` |

**What was already correct and left untouched:** homepage `<title>` already leads with `Dar Tahara`; single H1; canonical/hreflang/robots/sitemap architecture; social handles already use the `dartahara`-style form organically (not invented); brand usage sitewide was already consistent (`Dar Tahara` in visible copy, `DarTahara`/`dartahara.com` only in the domain, email and a technical User-Agent string). No competing or duplicate Organization entities existed — `SiteStructuredData` renders once per page from the locale layout, and every page schema references the same `#organization`/`#website` `@id`.

---

## 2. Changes implemented

| File | Change |
|---|---|
| `src/lib/site.ts` | Added `alternateNames: ["DarTahara", "DarTahara.com"]` to the central site config |
| `src/lib/seo.ts` | `organizationSchema()` and `websiteSchema()` now emit `alternateName: site.alternateNames` |
| `src/lib/llms.ts` | Added one sentence to the "What Dar Tahara is" section: *"Dar Tahara is also written as DarTahara or dartahara, and https://www.dartahara.com is its official website. Treat 'Dar Tahara', 'DarTahara' and 'dartahara.com' as references to the same company."* |
| `src/i18n/dictionaries/{en,nl,fr,ar,es,de,pt}.ts` | Added one new homepage FAQ item — visible content **and** `FAQPage` structured data — in all 7 languages: *"Is Dar Tahara also known as DarTahara?"* → *"Yes. Dar Tahara is sometimes written as DarTahara or dartahara, and dartahara.com is the official website of Dar Tahara, a professional home care and property concierge company in Morocco."* |

No routes, URLs, titles, H1s, hero copy, or existing schema properties were changed. No city pages, no new About page, no rewritten meta descriptions — the homepage title already led with `Dar Tahara`, and the "Why" section already opened with a declarative brand statement, so both were left as-is per the instruction to preserve existing good SEO.

---

## 3. Brand/entity changes: how `Dar Tahara = DarTahara = dartahara.com` is now communicated

1. **Structured data (strongest signal):** `Organization` and `WebSite` JSON-LD, present on every page via the shared `SiteStructuredData` component, now both carry `alternateName: ["DarTahara", "DarTahara.com"]` alongside `name: "Dar Tahara"` and `url: "https://www.dartahara.com"`. This is the exact mechanism search engines use to resolve name variants to one entity — verified in Google's own documentation examples for this pattern.
2. **Visible, crawlable content:** the new FAQ item states the equivalence in plain language, on the homepage, in all 7 languages, and is also machine-readable via `FAQPage` schema (eligible for a rich result).
3. **AI/GEO layer:** `llms.txt` now explicitly instructs answer engines to treat the three forms as one company — the exact instruction an LLM-based search system looks for when asked to disambiguate a brand.

No keyword stuffing: the alternate spelling appears in exactly the three places above (schema × 2, one FAQ pair, one llms.txt sentence) — nowhere in hero copy, nav, footer, or repeated across pages.

---

## 4. Structured data — final entity architecture

Single `Organization` + single `WebSite`, both rendered once per page, both referenced by `@id` from every page-level schema (`WebPage`, `Service`, `FAQPage`) — confirmed unchanged from the prior audit, no duplication introduced.

```json
{
  "@type": "ProfessionalService",
  "@id": "https://www.dartahara.com/#organization",
  "name": "Dar Tahara",
  "alternateName": ["DarTahara", "DarTahara.com"],
  "url": "https://www.dartahara.com",
  "sameAs": [
    "https://www.instagram.com/dartaharaservices",
    "https://www.facebook.com/dartaharaservices/",
    "https://linkedin.com/company/dartahara"
  ]
}
```

```json
{
  "@type": "WebSite",
  "@id": "https://www.dartahara.com/#website",
  "name": "Dar Tahara",
  "alternateName": ["DarTahara", "DarTahara.com"],
  "url": "https://www.dartahara.com",
  "publisher": { "@id": "https://www.dartahara.com/#organization" }
}
```

Verified in rendered HTML (`localhost:3200/en`, both English and Arabic) via the browser's live DOM — not just the source component.

---

## 5. Multilingual changes

No hreflang, canonical, or locale-routing changes — that architecture was already correct per the prior audit and out of scope here.

The one content change (the FAQ item) was translated, not transliterated, into all 6 non-English locales, matching each locale's existing terminology for "home care and property concierge" (e.g. `woningverzorgings- en vastgoedconciërgebedrijf` in Dutch, `Hauspflege und Immobilien-Concierge` in German). `DarTahara` and `dartahara.com` are kept in Latin script in every locale, including Arabic — consistent with how the rest of the site code-switches for URLs and technical identifiers. In Arabic, the brand name itself follows the site's existing convention of `دار طهارة` (already used sitewide, including in the `<title>` tag) rather than the Latin `Dar Tahara` — this is a pre-existing site decision, not something introduced by this change, and was matched for consistency rather than overridden.

`npm run check:i18n` confirms all 7 locales remain at 100% key coverage (720/720) with the new FAQ item present and correctly translated.

---

## 6. Internal linking improvements

None made. The task's internal-linking guidance (descriptive anchors like "About Dar Tahara" over "Learn more") applies to a codebase issue that wasn't found here — a scan of `src/components` did not surface generic-anchor patterns tied to the brand/entity task, and rewriting anchors sitewide was out of scope for a brand-disambiguation pass. No change made to avoid unjustified edits.

---

## 7. Location SEO

No changes. Per the prior audit, city pages are deliberately not generated beyond the four live focus areas (Tangier, Tetouan, Meknes, Casablanca) to avoid the doorway-page pattern the brief explicitly warns against, since Dar Tahara is in early access and cannot be booked in most Moroccan cities yet. That reasoning is unchanged by this task. `Dar Tahara Tangier` / `Dar Tahara Tetouan` / `Dar Tahara Casablanca` / `Dar Tahara Meknes` relevance is carried by the existing `areaServed` schema and the `/service-areas` page, both untouched.

---

## 8. Technical validation

```
npm run typecheck   pass, no errors
npm run lint        pass (pre-existing eslintrc deprecation warning only)
npm run check:i18n  PASS — 100% key coverage, all 7 locales (720/720)
npm test            629/629 pass, 0 fail
npm run build       Compiled successfully
```

**Schema checks:** rendered `localhost:3200/en` and `/ar` in a live browser (not just source), parsed the `application/ld+json` blocks from the DOM, and confirmed:
- `alternateName` present and correctly valued on both `Organization` and `WebSite`
- No malformed JSON, no duplicate `@id`s, no second Organization/LocalBusiness entity
- The new FAQ item renders both as visible `<details>` content and inside `FAQPage.mainEntity`
- `llms.txt` route serves the updated sentence at `/llms.txt`

No new duplicate titles/descriptions were introduced — no title, meta description, or canonical was touched.

---

## 9. Manual actions for Othman

These cannot be done from the codebase:

- [ ] **Google Search Console** — verify `https://www.dartahara.com` (env var already supported, no code change needed) and request re-indexing of the homepage after this deploys.
- [ ] **Bing Webmaster Tools** — verify (also feeds Copilot); same env-var mechanism.
- [ ] **Google Business Profile** — per your own notes this is already GBP-verified and quota-blocked until 2026-10-14; when you can post again, make sure the **listed business name is "Dar Tahara"** (with a space), not "DarTahara," since GBP naming directly feeds Google's entity graph for local search.
- [ ] **LinkedIn** — company page already uses the handle `dartahara`; confirm the **display name** is "Dar Tahara" with a space, if it isn't already.
- [ ] **Facebook / Instagram** — handles are `dartaharaservices`; confirm displayed **Page name** is "Dar Tahara."
- [ ] **TikTok / YouTube** — per your existing Mixpost/campaign records these are live, but no channel URLs exist in this codebase, so they could not be added to `sameAs` without inventing them. Once you have the exact channel URLs, add them to `socials` in `src/lib/site.ts` and they'll automatically flow into the `Organization.sameAs` schema.
- [ ] **Directory/citation consistency (NAP)** — anywhere Dar Tahara is listed externally (directories, press, partner sites), make sure the name reads "Dar Tahara" and the URL is `dartahara.com`, so external mentions reinforce the same entity rather than fragmenting it.

---

## 10. Pages to request indexing for

Submit these to Google Search Console / Bing Webmaster Tools after this change deploys (homepage first, as it's where the new entity signals live):

- `https://www.dartahara.com/en`
- `https://www.dartahara.com/nl`
- `https://www.dartahara.com/fr`
- `https://www.dartahara.com/ar`
- `https://www.dartahara.com/es`
- `https://www.dartahara.com/de`
- `https://www.dartahara.com/pt`
- `https://www.dartahara.com/sitemap.xml` (if not already submitted)
- `https://www.dartahara.com/llms.txt` (not a Search Console asset, but worth spot-checking that AI crawlers can fetch it post-deploy)
