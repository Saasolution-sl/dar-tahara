/**
 * Language resolution — the single source of truth for "which locale should a
 * visitor see", used by the middleware. Pure and unit-tested.
 *
 * Priority order:
 *   1. Saved user preference (cookie)
 *   2. Browser / OS language (Accept-Language)
 *   3. English fallback
 */
import { locales, defaultLocale, isLocale, type Locale } from "@/i18n/config";

/** Parse an Accept-Language header into base language tags, highest q first. */
export function parseAcceptLanguage(header?: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part, index) => {
      const [rawTag, ...parameters] = part.trim().split(";");
      const qualityParameter = parameters.find(
        (parameter) => parameter.trim().toLowerCase().startsWith("q="),
      );
      const parsedQuality = qualityParameter
        ? Number(qualityParameter.trim().slice(2))
        : 1;
      const quality = Number.isFinite(parsedQuality) && parsedQuality >= 0 && parsedQuality <= 1
        ? parsedQuality
        : 0;

      return {
        tag: rawTag.trim().split("-")[0].toLowerCase(),
        quality,
        index,
      };
    })
    .filter((entry) => entry.tag && entry.tag !== "*" && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((entry) => entry.tag);
}

export type LocaleSource = "saved" | "browser" | "default";

export type ResolveInput = {
  savedLocale?: string | null;
  acceptLanguage?: string | null;
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
  // 3. English.
  return { locale: defaultLocale, source: "default" };
}

/** Read the visitor's country for signup attribution, not locale detection. */
export function countryFromHeaders(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    null
  );
}
