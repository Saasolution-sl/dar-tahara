import type { Metadata } from "next";
import { localeMeta, locales, type Locale } from "@/i18n/config";
import { site } from "@/lib/site";

export type JsonLdObject = Record<string, unknown>;

function cleanPath(path: string): string {
  if (!path || path === "/") return "";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

export function absoluteUrl(path = ""): string {
  return `${site.siteUrl}${cleanPath(path)}`;
}

export function localizedPath(locale: Locale, path = ""): string {
  return `/${locale}${cleanPath(path)}`;
}

export function localizedUrl(locale: Locale, path = ""): string {
  return absoluteUrl(localizedPath(locale, path));
}

export function languageAlternates(path = ""): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [localeMeta[locale].hreflang, localizedUrl(locale, path)]),
    ),
    "x-default": localizedUrl(site.defaultLocale, path),
  };
}

export function formatTitle(title: string): string {
  return title.includes(site.siteName) ? title : `${title} | ${site.siteName}`;
}

function verificationMetadata(): Metadata["verification"] | undefined {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": [bing] } } : {}),
  };
}

export function indexableRobots(): NonNullable<Metadata["robots"]> {
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function noIndexMetadata(title?: string): Metadata {
  return {
    ...(title ? { title } : {}),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  };
}

export function buildLocalizedMetadata({
  locale,
  path = "",
  title,
  description,
  absoluteTitle = false,
  type = "website",
  image,
  imageAlt,
  index = true,
}: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
  image?: string;
  imageAlt?: string;
  index?: boolean;
}): Metadata {
  const canonical = localizedUrl(locale, path);
  const socialTitle = absoluteTitle ? title : formatTitle(title);
  const socialImage = image || localizedUrl(locale, "/opengraph-image");

  return {
    metadataBase: new URL(site.siteUrl),
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      locale: localeMeta[locale].openGraph,
      alternateLocale: locales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => localeMeta[candidate].openGraph),
      url: canonical,
      siteName: site.siteName,
      title: socialTitle,
      description,
      images: [
        {
          url: socialImage,
          alt: imageAlt || `${site.siteName}, ${title}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: socialImage, alt: imageAlt || `${site.siteName}, ${title}` }],
    },
    robots: index ? indexableRobots() : noIndexMetadata().robots,
    verification: verificationMetadata(),
  };
}

/** Escape characters that could terminate a script element when data comes from content sources. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function organizationSchema(): JsonLdObject {
  return {
    "@type": "ProfessionalService",
    "@id": `${site.siteUrl}/#organization`,
    name: site.siteName,
    url: site.siteUrl,
    logo: { "@type": "ImageObject", url: site.logoUrl },
    image: site.defaultSocialImage,
    description: site.defaultDescription,
    email: site.contactEmail,
    telephone: site.telephone,
    areaServed: [
      { "@type": "Country", name: "Morocco" },
      ...site.serviceAreas.map((name) => ({ "@type": "City", name })),
    ],
    knowsLanguage: [...site.supportedLocales],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: site.contactEmail,
      telephone: site.telephone,
      availableLanguage: [...site.supportedLocales],
    },
    sameAs: Object.values(site.socials),
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": `${site.siteUrl}/#website`,
    url: site.siteUrl,
    name: site.siteName,
    description: site.defaultDescription,
    inLanguage: [...site.supportedLocales],
    publisher: { "@id": `${site.siteUrl}/#organization` },
  };
}

export function webPageSchema({
  locale,
  path = "",
  name,
  description,
  type = "WebPage",
}: {
  locale: Locale;
  path?: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
}): JsonLdObject {
  const url = localizedUrl(locale, path);
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: formatTitle(name),
    description,
    inLanguage: localeMeta[locale].hreflang,
    isPartOf: { "@id": `${site.siteUrl}/#website` },
    about: { "@id": `${site.siteUrl}/#organization` },
  };
}

export function faqPageSchema(
  locale: Locale,
  items: ReadonlyArray<{ q: string; a: string }>,
): JsonLdObject {
  const url = localizedUrl(locale);
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url: `${url}#faq`,
    inLanguage: localeMeta[locale].hreflang,
    isPartOf: { "@id": `${url}#webpage` },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function serviceSchema({
  locale,
  slug,
  name,
  description,
}: {
  locale: Locale;
  slug: string;
  name: string;
  description: string;
}): JsonLdObject {
  const url = localizedUrl(locale, `/services/${slug}`);
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    url,
    name,
    description,
    inLanguage: localeMeta[locale].hreflang,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    provider: { "@id": `${site.siteUrl}/#organization` },
    areaServed: { "@type": "Country", name: "Morocco" },
  };
}
