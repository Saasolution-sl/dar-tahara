export const locales = ["en", "nl", "fr", "ar", "es", "de", "pt"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const rtlLocales: Locale[] = ["ar"];

export const localeMeta: Record<
  Locale,
  { label: string; nativeLabel: string; dir: "ltr" | "rtl"; hreflang: string }
> = {
  en: { label: "English", nativeLabel: "English", dir: "ltr", hreflang: "en" },
  nl: { label: "Dutch", nativeLabel: "Nederlands", dir: "ltr", hreflang: "nl" },
  fr: { label: "French", nativeLabel: "Français", dir: "ltr", hreflang: "fr" },
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", hreflang: "ar" },
  es: { label: "Spanish", nativeLabel: "Español", dir: "ltr", hreflang: "es" },
  de: { label: "German", nativeLabel: "Deutsch", dir: "ltr", hreflang: "de" },
  pt: { label: "Portuguese", nativeLabel: "Português", dir: "ltr", hreflang: "pt" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
