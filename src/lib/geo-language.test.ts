import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLocale, parseAcceptLanguage } from "./geo-language";

test("priority 1: saved preference always wins", () => {
  const r = resolveLocale({ savedLocale: "ar", acceptLanguage: "nl-NL,nl;q=0.9" });
  assert.deepEqual(r, { locale: "ar", source: "saved" });
});

test("saved preference ignored when unsupported", () => {
  const r = resolveLocale({ savedLocale: "zz", acceptLanguage: "de-DE" });
  assert.equal(r.locale, "de");
  assert.equal(r.source, "browser");
});

test("priority 2: browser/OS language (English/Dutch/French phone)", () => {
  assert.equal(resolveLocale({ acceptLanguage: "en-US,en;q=0.9" }).locale, "en");
  assert.equal(resolveLocale({ acceptLanguage: "nl-NL,nl;q=0.9" }).locale, "nl");
  assert.equal(resolveLocale({ acceptLanguage: "fr-FR,fr;q=0.8" }).locale, "fr");
  assert.equal(resolveLocale({ acceptLanguage: "nl" }).source, "browser");
});

test("priority 3: English fallback when nothing matches", () => {
  assert.deepEqual(resolveLocale({}), { locale: "en", source: "default" });
  assert.deepEqual(resolveLocale({ acceptLanguage: "ja-JP" }), { locale: "en", source: "default" });
  assert.deepEqual(resolveLocale({ acceptLanguage: "zz-ZZ" }), { locale: "en", source: "default" });
});

test("parseAcceptLanguage sorts by q and strips region", () => {
  assert.deepEqual(parseAcceptLanguage("fr-BE;q=0.7,nl-BE;q=0.9,en;q=0.5"), ["nl", "fr", "en"]);
  assert.deepEqual(parseAcceptLanguage(null), []);
});

test("parseAcceptLanguage ignores disabled, wildcard, and invalid entries", () => {
  assert.deepEqual(parseAcceptLanguage("fr;q=0, *;q=0.9, DE-de;q=0.8, nl;q=invalid"), ["de"]);
  assert.deepEqual(resolveLocale({ acceptLanguage: "fr;q=0,ja;q=1" }), { locale: "en", source: "default" });
});
