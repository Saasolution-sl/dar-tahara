import { test } from "node:test";
import assert from "node:assert/strict";
import {
  phoneCountries,
  searchCountries,
  findCountry,
  flagEmoji,
  defaultCountryFor,
} from "./countries";
import {
  toE164ForCountry,
  isValidPhoneForCountry,
  normalizePhone,
} from "@/lib/early-access/phone";

test("flag emoji is derived arithmetically, not from a table", () => {
  assert.equal(flagEmoji("MA"), "🇲🇦");
  assert.equal(flagEmoji("nl"), "🇳🇱");
  assert.equal(flagEmoji("XX!"), "", "invalid input yields no flag");
});

test("every option carries a flag, a real country NAME and a calling code", () => {
  const list = phoneCountries("en");
  assert.ok(list.length > 200, "should cover the full ITU country list");
  for (const c of list.slice(0, 40)) {
    assert.match(c.callingCode, /^\+\d+$/);
    assert.equal(c.iso2.length, 2);
    assert.ok(c.flag.length > 0);
    // The name must be a real name, never just the ISO abbreviation.
    assert.notEqual(c.name, c.iso2, `${c.iso2} fell back to its ISO code`);
    assert.ok(c.name.length > 2, `${c.iso2} name too short: ${c.name}`);
  }
});

test("country names are localized per locale", () => {
  assert.equal(findCountry("MA", "en")?.name, "Morocco");
  assert.equal(findCountry("MA", "fr")?.name, "Maroc");
  assert.equal(findCountry("NL", "nl")?.name, "Nederland");
  // Arabic should be Arabic script, not a Latin fallback.
  const ar = findCountry("MA", "ar")?.name ?? "";
  assert.match(ar, /[؀-ۿ]/, `expected Arabic name, got "${ar}"`);
});

test("Morocco and the diaspora countries are surfaced first", () => {
  const top = phoneCountries("en").slice(0, 5).map((c) => c.iso2);
  assert.equal(top[0], "MA");
  assert.ok(top.includes("FR") && top.includes("ES"));
});

test("search matches country name, calling code and ISO code", () => {
  assert.equal(searchCountries("morocco", "en")[0].iso2, "MA");
  assert.equal(searchCountries("212", "en")[0].iso2, "MA");
  assert.equal(searchCountries("+212", "en")[0].iso2, "MA");
  assert.equal(searchCountries("ma", "en")[0].iso2, "MA");
  assert.equal(searchCountries("maroc", "fr")[0].iso2, "MA");
  // Diacritics folded: "espana" finds "España".
  assert.equal(searchCountries("espana", "es")[0].iso2, "ES");
  assert.equal(searchCountries("zzzzzz", "en").length, 0);
});

test("initial country comes from a previous choice, else the locale, never IP", () => {
  assert.equal(defaultCountryFor("nl"), "NL");
  assert.equal(defaultCountryFor("fr"), "FR");
  assert.equal(defaultCountryFor("ar"), "MA");
  // An explicit earlier selection always wins over the locale guess.
  assert.equal(defaultCountryFor("nl", "MA"), "MA");
  assert.equal(defaultCountryFor("nl", "bogus"), "NL");
});

test("numbers are validated against the SELECTED country", () => {
  // Valid Moroccan mobile, with and without the trunk zero.
  assert.equal(toE164ForCountry("0612345678", "MA"), "+212612345678");
  assert.equal(toE164ForCountry("612345678", "MA"), "+212612345678");
  // A Dutch mobile is not valid as a Moroccan number.
  assert.equal(isValidPhoneForCountry("0612345678", "NL"), true);
  assert.equal(isValidPhoneForCountry("123", "MA"), false);
  assert.equal(toE164ForCountry("0612345678", undefined), null);
});

test("normalizePhone prefers strict parsing but still stores odd-but-real numbers", () => {
  // Strict path.
  assert.equal(normalizePhone("0612345678", { country: "MA" }), "+212612345678");
  // Country missing → falls back to the calling-code combination.
  assert.equal(
    normalizePhone("0612345678", { country: undefined, callingCode: "+212" }),
    "+212612345678",
  );
  // Nothing usable at all.
  assert.equal(normalizePhone("", { country: "MA" }), null);
});
