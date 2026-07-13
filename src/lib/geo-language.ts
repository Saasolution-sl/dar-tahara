/**
 * Language resolution — the single source of truth for "which locale should a
 * visitor see", used by the middleware. Pure and unit-tested.
 *
 * Priority order (spec):
 *   1. Saved user preference (cookie)
 *   2. Browser / OS language (Accept-Language)
 *   3. Geolocation (IP country) — only when the browser language matched none
 *   4. English fallback
 */
import { locales, defaultLocale, isLocale, type Locale } from "@/i18n/config";

/** Countries whose primary supported language is Arabic (Morocco is handled
 * separately → French, per the brief). */
const ARABIC_COUNTRIES = new Set([
  "DZ", "TN", "LY", "EG", "SA", "AE", "QA", "KW", "BH", "OM",
  "JO", "LB", "SY", "IQ", "YE", "PS", "SD", "MR", "KM", "DJ", "SO",
]);

/** Country → default locale (secondary fallback only). */
const COUNTRY_LOCALE: Record<string, Locale> = {
  MA: "fr", // Morocco → French (Arabic available via the switcher)
  NL: "nl",
  BE: "nl", // Dutch/French handled earlier via Accept-Language; default nl
  FR: "fr",
  ES: "es",
  DE: "de",
  AT: "de",
  PT: "pt",
  BR: "pt",
};

export function localeForCountry(countryCode?: string | null): Locale | null {
  if (!countryCode) return null;
  const cc = countryCode.toUpperCase();
  if (COUNTRY_LOCALE[cc]) return COUNTRY_LOCALE[cc];
  if (ARABIC_COUNTRIES.has(cc)) return "ar";
  return null;
}

/** Parse an Accept-Language header into base language tags, highest q first. */
export function parseAcceptLanguage(header?: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.split("-")[0].toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q)
    .map((x) => x.tag);
}

export type LocaleSource = "saved" | "browser" | "geo" | "default";

export type ResolveInput = {
  savedLocale?: string | null;
  acceptLanguage?: string | null;
  countryCode?: string | null;
};

/** Resolve the best locale plus the reason (for analytics). */
export function resolveLocale(input: ResolveInput): { locale: Locale; source: LocaleSource } {
  // 1. Saved preference always wins.
  if (input.savedLocale && isLocale(input.savedLocale)) {
    return { locale: input.savedLocale, source: "saved" };
  }
  // 2. Browser / OS language.
  for (const tag of parseAcceptLanguage(input.acceptLanguage)) {
    if ((locales as readonly string[]).includes(tag)) {
      return { locale: tag as Locale, source: "browser" };
    }
  }
  // 3. Geolocation (only reached when the browser matched nothing).
  const geo = localeForCountry(input.countryCode);
  if (geo) return { locale: geo, source: "geo" };

  // 4. English.
  return { locale: defaultLocale, source: "default" };
}

/** Read the visitor's country from common proxy headers (no GPS, IP-based). */
export function countryFromHeaders(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    null
  );
}
