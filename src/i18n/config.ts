export const locales = ["en", "nl", "fr", "ar", "es", "de", "pt"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Shared name for the visitor's explicit, long-lived language preference. */
export const localeCookieName = "NEXT_LOCALE";

export const rtlLocales: Locale[] = ["ar"];

export const localeMeta: Record<
  Locale,
  { label: string; nativeLabel: string; dir: "ltr" | "rtl"; hreflang: string; openGraph: string }
> = {
  en: { label: "English", nativeLabel: "English", dir: "ltr", hreflang: "en", openGraph: "en_US" },
  nl: { label: "Dutch", nativeLabel: "Nederlands", dir: "ltr", hreflang: "nl", openGraph: "nl_NL" },
  fr: { label: "French", nativeLabel: "Français", dir: "ltr", hreflang: "fr", openGraph: "fr_FR" },
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", hreflang: "ar", openGraph: "ar_MA" },
  es: { label: "Spanish", nativeLabel: "Español", dir: "ltr", hreflang: "es", openGraph: "es_ES" },
  de: { label: "German", nativeLabel: "Deutsch", dir: "ltr", hreflang: "de", openGraph: "de_DE" },
  pt: { label: "Portuguese", nativeLabel: "Português", dir: "ltr", hreflang: "pt", openGraph: "pt_PT" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
