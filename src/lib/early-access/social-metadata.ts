import { localeMeta, locales, type Locale } from "@/i18n/config";
import { site } from "@/lib/site";

export const EARLY_ACCESS_SOCIAL_IMAGE_PATH =
  "/images/social/dar-tahara-early-access-v1.jpg";

export const EARLY_ACCESS_SOCIAL_IMAGE = {
  url: `${site.url}${EARLY_ACCESS_SOCIAL_IMAGE_PATH}`,
  secureUrl: `${site.url}${EARLY_ACCESS_SOCIAL_IMAGE_PATH}`,
  type: "image/jpeg",
  width: 1200,
  height: 630,
  alt: "Dar Tahara Early Access for premium home cleaning services in Morocco",
} as const;

export const EARLY_ACCESS_ENGLISH_SOCIAL_COPY = {
  title: "Dar Tahara Early Access",
  description:
    "Join Dar Tahara before launch and be among the first to access premium home cleaning and property care in Morocco.",
} as const;

const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  en: "en_US",
  nl: "nl_NL",
  fr: "fr_FR",
  ar: "ar_MA",
  es: "es_ES",
  de: "de_DE",
  pt: "pt_PT",
};

export function earlyAccessCanonicalUrl(locale: Locale): string {
  return `${site.url}/${locale}/early-access`;
}

export function earlyAccessLanguageAlternates(): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [localeMeta[locale].hreflang, earlyAccessCanonicalUrl(locale)]),
    ),
    "x-default": earlyAccessCanonicalUrl("en"),
  };
}

export function earlyAccessOpenGraphLocales(locale: Locale): {
  locale: string;
  alternateLocale: string[];
} {
  return {
    locale: OPEN_GRAPH_LOCALES[locale],
    alternateLocale: locales
      .filter((candidate) => candidate !== locale)
      .map((candidate) => OPEN_GRAPH_LOCALES[candidate]),
  };
}
