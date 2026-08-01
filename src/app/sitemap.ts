import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { servicePageSlugs } from "@/lib/service-pages";
import { languageAlternates, localizedUrl } from "@/lib/seo";
import { pages } from "@/lib/site";

export const indexableLocalizedPaths = [
  "",
  pages.missionVision,
  pages.earlyAccess,
  pages.terms,
  pages.privacy,
  ...servicePageSlugs.map((slug) => `${pages.services}/${slug}`),
] as const;

const knownLastModified: Partial<Record<(typeof indexableLocalizedPaths)[number], Date>> = {
  [pages.privacy]: new Date("2026-07-13T00:00:00.000Z"),
  [pages.terms]: new Date("2026-07-24T00:00:00.000Z"),
};

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    indexableLocalizedPaths.map((path) => ({
      url: localizedUrl(locale, path),
      ...(knownLastModified[path] ? { lastModified: knownLastModified[path] } : {}),
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
