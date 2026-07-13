import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLocale, localeForCountry, parseAcceptLanguage } from "./geo-language";

test("priority 1: saved preference always wins", () => {
  const r = resolveLocale({ savedLocale: "ar", acceptLanguage: "nl-NL,nl;q=0.9", countryCode: "FR" });
  assert.deepEqual(r, { locale: "ar", source: "saved" });
});

test("saved preference ignored when unsupported", () => {
  const r = resolveLocale({ savedLocale: "zz", acceptLanguage: "de-DE", countryCode: "US" });
  assert.equal(r.locale, "de");
  assert.equal(r.source, "browser");
});

test("priority 2: browser/OS language (English/Dutch/French phone)", () => {
  assert.equal(resolveLocale({ acceptLanguage: "en-US,en;q=0.9" }).locale, "en");
  assert.equal(resolveLocale({ acceptLanguage: "nl-NL,nl;q=0.9" }).locale, "nl");
  assert.equal(resolveLocale({ acceptLanguage: "fr-FR,fr;q=0.8" }).locale, "fr");
  assert.equal(resolveLocale({ acceptLanguage: "nl" }).source, "browser");
});

test("Morocco visitor with English browser → English (not forced French)", () => {
  const r = resolveLocale({ acceptLanguage: "en-GB,en;q=0.9", countryCode: "MA" });
  assert.deepEqual(r, { locale: "en", source: "browser" });
});

test("Morocco visitor with French browser → French (browser)", () => {
  assert.equal(resolveLocale({ acceptLanguage: "fr-FR,fr", countryCode: "MA" }).locale, "fr");
});

test("Morocco visitor with Arabic browser → Arabic (not forced French)", () => {
  assert.equal(resolveLocale({ acceptLanguage: "ar,ar-MA;q=0.9", countryCode: "MA" }).locale, "ar");
});

test("priority 3: geolocation only when browser matched nothing", () => {
  // Unsupported browser language, fall through to country.
  assert.deepEqual(resolveLocale({ acceptLanguage: "zz", countryCode: "MA" }), { locale: "fr", source: "geo" });
  assert.deepEqual(resolveLocale({ acceptLanguage: "ja-JP", countryCode: "NL" }), { locale: "nl", source: "geo" });
  assert.deepEqual(resolveLocale({ acceptLanguage: "", countryCode: "SA" }), { locale: "ar", source: "geo" });
  assert.deepEqual(resolveLocale({ countryCode: "BE" }), { locale: "nl", source: "geo" });
  assert.deepEqual(resolveLocale({ countryCode: "BR" }), { locale: "pt", source: "geo" });
  assert.deepEqual(resolveLocale({ countryCode: "AT" }), { locale: "de", source: "geo" });
});

test("priority 4: English fallback when nothing matches", () => {
  assert.deepEqual(resolveLocale({}), { locale: "en", source: "default" });
  assert.deepEqual(resolveLocale({ acceptLanguage: "ja-JP", countryCode: "JP" }), { locale: "en", source: "default" });
  // geolocation disabled (no country) + unsupported browser
  assert.deepEqual(resolveLocale({ acceptLanguage: "zz-ZZ", countryCode: null }), { locale: "en", source: "default" });
});

test("localeForCountry mapping", () => {
  assert.equal(localeForCountry("MA"), "fr");
  assert.equal(localeForCountry("nl"), "nl"); // case-insensitive
  assert.equal(localeForCountry("ES"), "es");
  assert.equal(localeForCountry("EG"), "ar"); // arabic-speaking
  assert.equal(localeForCountry("US"), null);
  assert.equal(localeForCountry(null), null);
});

test("parseAcceptLanguage sorts by q and strips region", () => {
  assert.deepEqual(parseAcceptLanguage("fr-BE;q=0.7,nl-BE;q=0.9,en;q=0.5"), ["nl", "fr", "en"]);
  assert.deepEqual(parseAcceptLanguage(null), []);
});
