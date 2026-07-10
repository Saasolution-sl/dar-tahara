import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/lib/site";

/** Injects LocalBusiness, Service catalog and FAQ schema.org JSON-LD. */
export function StructuredData({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const url = `${site.url}/${locale}`;

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${site.url}/#business`,
    name: dict.brand.name,
    description: dict.meta.description,
    slogan: dict.brand.tagline,
    url,
    email: site.email,
    telephone: site.phoneE164,
    image: `${site.url}/og.jpg`,
    logo: `${site.url}/logo.png`,
    priceRange: "$$$",
    areaServed: { "@type": "Country", name: "Morocco" },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.addressLocality,
      addressCountry: site.addressCountry,
    },
    sameAs: Object.values(site.socials),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: dict.services.title,
      itemListElement: dict.services.items.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.body },
      })),
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: dict.brand.name,
    url: site.url,
    inLanguage: locale,
  };

  return (
    <>
      {[localBusiness, faqPage, website].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
