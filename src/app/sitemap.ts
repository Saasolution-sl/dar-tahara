import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/terms", "/privacy"];
  const now = new Date();

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${site.url}/${locale}${route}`,
      lastModified: now,
      changeFrequency: route === "" ? "weekly" : "yearly",
      priority: route === "" ? 1 : 0.4,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${site.url}/${l}${route}`]),
        ),
      },
    })),
  );
}
