import assert from "node:assert/strict";
import test from "node:test";
import { locales } from "@/i18n/config";
import { GET as getLlms } from "@/app/llms.txt/route";
import robots from "@/app/robots";
import sitemap, { indexableLocalizedPaths } from "@/app/sitemap";
import { buildLlmsText } from "@/lib/llms";
import { servicePageSlugs } from "@/lib/service-pages";
import { getServicePage } from "@/i18n/service-pages-copy";
import { organizationSchema } from "@/lib/seo";
import { pages } from "@/lib/site";

const privateRoutePattern = /\/(api|auth|account|admin|manager|assessment)(?:\/|$)|\/login(?:\/|$)|\/signup(?:\/|$)/;

test("robots.txt allows public assets and blocks private application areas", () => {
  const result = robots();
  assert.equal(result.sitemap, "https://www.dartahara.com/sitemap.xml");
  assert.equal(result.host, "https://www.dartahara.com");
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
  const wildcard = rules.find((rule) => rule.userAgent === "*");
  assert.ok(wildcard);
  assert.equal(wildcard.allow, "/");
  const disallow = wildcard.disallow as string[];
  for (const path of ["/api/", "/account/", "/admin/", "/login", "/reset-password"]) {
    assert.ok(disallow.includes(path));
  }
  assert.ok(!disallow.some((path) => path.startsWith("/_next") || path.startsWith("/images")));
});

test("sitemap contains only canonical public localized pages", () => {
  const entries = sitemap();
  assert.equal(entries.length, locales.length * indexableLocalizedPaths.length);
  assert.ok(entries.some((entry) => entry.url.endsWith("/en/services/premium-cleaning")));
  assert.ok(entries.some((entry) => entry.url.endsWith("/fr/early-access")));

  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.equal(url.origin, "https://www.dartahara.com");
    assert.ok(!url.pathname.endsWith("/"));
    assert.ok(!privateRoutePattern.test(url.pathname));
    assert.equal(url.search, "");
    const languages = entry.alternates?.languages as Record<string, string>;
    assert.equal(Object.keys(languages).length, locales.length + 1);
    assert.ok(languages["x-default"].startsWith("https://www.dartahara.com/en"));
  }
});

test("sitemap uses known legal dates and does not fabricate timestamps for other pages", () => {
  const entries = sitemap();
  const privacy = entries.find((entry) => entry.url.endsWith("/en/privacy"));
  const home = entries.find((entry) => entry.url.endsWith("/en"));
  assert.equal(new Date(privacy?.lastModified as Date).toISOString(), "2026-07-13T00:00:00.000Z");
  assert.equal(home?.lastModified, undefined);
});

test("every private area is disallowed, including the ones no prefix covers", () => {
  const rules = Array.isArray(robots().rules) ? robots().rules : [robots().rules];
  // `/manager` does not prefix-match `/regional-manager`, so it needs its own entry.
  const required = [
    "/api/", "/auth/", "/account", "/admin", "/manager", "/regional-manager",
    "/assessment", "/login", "/signup", "/forgot-password", "/reset-password",
  ];
  for (const rule of rules as { userAgent?: string; disallow?: string[] }[]) {
    const disallow = rule.disallow as string[];
    for (const path of required) {
      assert.ok(disallow.includes(path), `${rule.userAgent} does not disallow ${path}`);
    }
  }
});

test("AI answer engines are named and allowed, each carrying the private-area rules", () => {
  const rules = (Array.isArray(robots().rules) ? robots().rules : [robots().rules]) as {
    userAgent?: string; allow?: string; disallow?: string[];
  }[];
  const agents = rules.map((rule) => rule.userAgent);
  // A named group replaces the `*` group, so an allow-only group would expose
  // the dashboards to exactly the crawlers we bothered to name.
  for (const agent of ["GPTBot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot", "Google-Extended", "Bingbot"]) {
    assert.ok(agents.includes(agent), `${agent} is not named`);
    const rule = rules.find((r) => r.userAgent === agent)!;
    assert.equal(rule.allow, "/");
    assert.ok((rule.disallow as string[]).includes("/admin"));
  }
  assert.ok(agents.includes("*"));
});

test("service pages are localized rather than English served under seven hreflangs", () => {
  for (const slug of servicePageSlugs) {
    const titles = new Set(locales.map((locale) => getServicePage(locale, slug).eyebrow));
    // Seven identical titles was the pre-existing duplicate-metadata defect.
    assert.ok(titles.size >= 6, `${slug} has only ${titles.size} distinct titles`);
    for (const locale of locales) {
      const page = getServicePage(locale, slug);
      assert.equal(page.sections.length, 3);
      assert.ok(page.summary.length > 40);
      assert.ok(page.highlights.every((h) => h.trim().length > 0));
    }
  }
});

test("organization schema declares no rating, price or address it cannot verify", () => {
  const org = organizationSchema() as Record<string, unknown>;
  for (const forbidden of ["aggregateRating", "review", "priceRange", "geo", "openingHours"]) {
    assert.equal(org[forbidden], undefined, `${forbidden} is not verifiable from config`);
  }
  assert.equal((org.address as Record<string, string>).addressCountry, "MA");
  assert.ok(Array.isArray((org.hasOfferCatalog as { itemListElement: unknown[] }).itemListElement));
});

test("sitemap carries the People & Community page for every locale", () => {
  assert.ok(indexableLocalizedPaths.includes(pages.peopleCommunity));
  const entries = sitemap().filter((entry) => entry.url.endsWith(pages.peopleCommunity));
  assert.equal(entries.length, locales.length);
});

test("llms.txt qualifies availability instead of implying the service is live everywhere", () => {
  const body = buildLlmsText();
  assert.match(body, /early-access programme/);
  assert.match(body, /not yet active in every home/);
  assert.match(body, /does not claim that every employee has a clean criminal record/);
  // An AI system must not be able to source a rating from us.
  assert.match(body, /does not publish customer reviews or ratings/);
});

test("every Moroccan city carries a status, and only the live focus areas are 'available'", async () => {
  const { MOROCCAN_CITIES, citiesByStatus } = await import("@/lib/moroccan-cities");
  const { site } = await import("@/lib/site");

  for (const city of MOROCCAN_CITIES) {
    assert.ok(city.name && city.nameAr && city.region, `${city.name} is incomplete`);
    assert.ok(["available", "expanding", "planned"].includes(city.status));
  }
  // A city marked available but absent from site.serviceAreas would be a
  // coverage claim the rest of the site does not make.
  const available = citiesByStatus("available").map((c) => c.name).sort();
  assert.deepEqual(available, [...site.serviceAreas].sort());
  assert.ok(citiesByStatus("planned").length > 0);
  assert.equal(new Set(MOROCCAN_CITIES.map((c) => c.name)).size, MOROCCAN_CITIES.length);
});

test("service-areas page is indexable in every locale and llms.txt separates live from planned", async () => {
  const { buildLlmsText } = await import("@/lib/llms");
  assert.ok(indexableLocalizedPaths.includes(pages.serviceAreas));
  assert.equal(sitemap().filter((e) => e.url.endsWith(pages.serviceAreas)).length, locales.length);

  const body = buildLlmsText();
  assert.match(body, /Live focus areas:/);
  assert.match(body, /Planned, with no service yet:/);
  assert.match(body, /does not have national coverage/);
});

test("translated legal pages carry a prevailing-language clause; English does not", async () => {
  const { getDictionary } = await import("@/i18n/dictionaries");
  for (const locale of locales) {
    const dict = await getDictionary(locale);
    const notice = dict.legal.bindingLanguageNotice;
    assert.ok(notice.length > 60, `${locale} notice is too short to be meaningful`);
    if (locale !== "en") {
      // Must be translated, not left as the English fallback.
      const en = await getDictionary("en");
      assert.notEqual(notice, en.legal.bindingLanguageNotice, `${locale} notice is untranslated`);
    }
    assert.ok(dict.legal.termsTitle.length > 0 && dict.legal.privacyTitle.length > 0);
  }
});

test("llms.txt returns plain text with official pages and verification guidance", async () => {
  const response = getLlms();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /^text\/plain/);
  const body = await response.text();
  assert.equal(body, buildLlmsText());
  assert.match(body, /^# Dar Tahara/m);
  assert.match(body, /https:\/\/www\.dartahara\.com\/sitemap\.xml/);
  assert.match(body, /Verify current prices, offers, availability and service areas/);
  assert.ok(!body.includes("localhost"));
});
