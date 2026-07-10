import "server-only";
import type { Locale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";

/**
 * Locale loaders. Each non-English dictionary is a partial override that is
 * deep-merged over the complete English base, so every component always
 * receives a fully-typed dictionary even when a translation is missing.
 */
const loaders: Record<Locale, () => Promise<{ default: unknown }>> = {
  en: async () => ({ default: en }),
  nl: () => import("./dictionaries/nl"),
  fr: () => import("./dictionaries/fr"),
  ar: () => import("./dictionaries/ar"),
  es: () => import("./dictionaries/es"),
  de: () => import("./dictionaries/de"),
  pt: () => import("./dictionaries/pt"),
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Recursively merge an override onto a base, preserving base values when absent. */
function deepMerge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    return base.map((item, i) =>
      i < override.length ? deepMerge(item, override[i]) : item,
    ) as T;
  }
  if (isPlainObject(base) && isPlainObject(override)) {
    const result: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      if (key in override && override[key] !== undefined) {
        result[key] = deepMerge((base as Record<string, unknown>)[key], override[key]);
      }
    }
    return result as T;
  }
  return (override === undefined ? base : (override as T));
}

const cache = new Map<Locale, Dictionary>();

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const cached = cache.get(locale);
  if (cached) return cached;

  if (locale === "en") {
    cache.set("en", en);
    return en;
  }

  const mod = await loaders[locale]();
  const merged = deepMerge(en, (mod as { default: unknown }).default);
  cache.set(locale, merged);
  return merged;
}

export type { Dictionary };
