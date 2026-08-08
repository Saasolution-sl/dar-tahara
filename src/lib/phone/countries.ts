/**
 * Country data for the international phone selector.
 *
 * Nothing here is hand-maintained:
 *  - the country list and calling codes come from libphonenumber-js metadata,
 *  - the country NAMES come from Intl.DisplayNames, so they arrive already
 *    localized in every locale the site supports (including Arabic),
 *  - the flag is derived arithmetically from the ISO code.
 *
 * The flag is presentation only. What we store as business data is the ISO
 * 3166-1 alpha-2 code, the calling code and the E.164 number, never the emoji.
 */
import { getCountries, getCountryCallingCode, isSupportedCountry, type CountryCode } from "./lib";
import type { Locale } from "@/i18n/config";

export type PhoneCountry = {
  /** ISO 3166-1 alpha-2, e.g. "MA". This is what we store. */
  iso2: CountryCode;
  /** International calling code WITH the plus, e.g. "+212". */
  callingCode: string;
  /** Localized country name, e.g. "Morocco" / "Maroc" / "المغرب". */
  name: string;
  /** Emoji flag, display only, never stored. */
  flag: string;
};

/**
 * Flag image URL for a country.
 *
 * Emoji flags are NOT usable here: Windows ships no country-flag glyphs, so
 * Chrome and Edge on Windows render "🇲🇦" as the letters "MA". Real images are
 * the only thing that renders consistently across platforms.
 *
 * These are served from flagcdn.com, so the images are a third-party request.
 * They are decorative only, no personal data is sent, but the visitor's IP is
 * visible to that host.
 */
export function flagImageUrl(iso2: string, width: 20 | 40 | 80 = 40): string {
  return `https://flagcdn.com/w${width}/${iso2.toLowerCase()}.png`;
}

/** 2× source for crisp rendering on high-density screens. */
export function flagImageSrcSet(iso2: string): string {
  return `${flagImageUrl(iso2, 20)} 1x, ${flagImageUrl(iso2, 40)} 2x`;
}

/**
 * Regional-indicator maths: "MA" → 🇲🇦. Retained for non-visual uses (it is
 * NOT used for display, see flagImageUrl for why).
 */
export function flagEmoji(iso2: string): string {
  const code = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  const BASE = 0x1f1e6; // regional indicator symbol letter A
  return String.fromCodePoint(
    BASE + (code.charCodeAt(0) - 65),
    BASE + (code.charCodeAt(1) - 65),
  );
}

/** Countries the Moroccan diaspora most often dials from, floated to the top. */
const PRIORITY: readonly string[] = ["MA", "FR", "ES", "NL", "BE", "DE", "GB", "IT", "US", "CA"];

const cache = new Map<string, PhoneCountry[]>();

function displayName(iso2: string, locale: Locale): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(iso2) ?? iso2;
  } catch {
    return iso2;
  }
}

/**
 * Every dialable country, localized and sorted: priority countries first, then
 * alphabetically by localized name using the locale's own collation.
 */
export function phoneCountries(locale: Locale): PhoneCountry[] {
  const cached = cache.get(locale);
  if (cached) return cached;

  const list: PhoneCountry[] = getCountries().map((iso2) => ({
    iso2,
    callingCode: `+${getCountryCallingCode(iso2)}`,
    name: displayName(iso2, locale),
    flag: flagEmoji(iso2),
  }));

  const collator = new Intl.Collator(locale);
  list.sort((a, b) => {
    const pa = PRIORITY.indexOf(a.iso2);
    const pb = PRIORITY.indexOf(b.iso2);
    if (pa !== -1 || pb !== -1) {
      if (pa === -1) return 1;
      if (pb === -1) return -1;
      return pa - pb;
    }
    return collator.compare(a.name, b.name);
  });

  cache.set(locale, list);
  return list;
}

export function findCountry(iso2: string | undefined, locale: Locale): PhoneCountry | undefined {
  if (!iso2) return undefined;
  const code = iso2.toUpperCase();
  return phoneCountries(locale).find((c) => c.iso2 === code);
}

/** Fold case/diacritics so "espana" matches "España". */
function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

/**
 * Search by localized country name, calling code (with or without "+") or ISO
 * code. Exact/prefix matches rank above substring matches.
 */
export function searchCountries(query: string, locale: Locale, limit = 8): PhoneCountry[] {
  const all = phoneCountries(locale);
  const raw = query.trim();
  if (!raw) return all.slice(0, limit);

  const q = fold(raw);
  const qDigits = raw.replace(/[^\d]/g, "");

  const scored: Array<{ c: PhoneCountry; score: number }> = [];
  for (const c of all) {
    const name = fold(c.name);
    const iso = c.iso2.toLowerCase();
    const dial = c.callingCode.replace("+", "");
    let score = Infinity;

    if (iso === q) score = 0;
    else if (name === q) score = 0;
    else if (qDigits && dial === qDigits) score = 1;
    else if (name.startsWith(q)) score = 2;
    else if (qDigits && dial.startsWith(qDigits)) score = 3;
    else if (name.includes(q)) score = 4;

    if (score < Infinity) scored.push({ c, score });
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    // Stable tiebreak: keep the priority ordering from phoneCountries().
    return all.indexOf(a.c) - all.indexOf(b.c);
  });
  return scored.slice(0, limit).map((s) => s.c);
}

/** Map a site locale to the country most likely intended, as a starting guess. */
const LOCALE_DEFAULT_COUNTRY: Record<Locale, CountryCode> = {
  en: "MA",
  fr: "FR",
  ar: "MA",
  nl: "NL",
  es: "ES",
  de: "DE",
  pt: "PT",
};

/**
 * Initial country: an explicit previous choice wins, then the site locale.
 * Deliberately NOT IP geolocation, an expat browsing from abroad still usually
 * wants their own number's country, and the customer can always change it.
 */
export function defaultCountryFor(
  locale: Locale,
  previouslySelected?: string,
): CountryCode {
  const prev = previouslySelected?.toUpperCase();
  if (isSupportedCountry(prev)) return prev;
  return LOCALE_DEFAULT_COUNTRY[locale] ?? "MA";
}
