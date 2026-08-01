import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import {
  faqPageSchema,
  organizationSchema,
  serializeJsonLd,
  serviceSchema,
  webPageSchema,
  websiteSchema,
  type JsonLdObject,
} from "@/lib/seo";

export function JsonLd({ id, data }: { id: string; data: JsonLdObject }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export function SiteStructuredData() {
  return (
    <JsonLd
      id="site-structured-data"
      data={{
        "@context": "https://schema.org",
        "@graph": [organizationSchema(), websiteSchema()],
      }}
    />
  );
}

export function HomePageStructuredData({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <JsonLd
      id="home-structured-data"
      data={{
        "@context": "https://schema.org",
        "@graph": [
          webPageSchema({
            locale,
            name: dict.meta.title,
            description: dict.meta.description,
          }),
          faqPageSchema(locale, dict.faq.items),
        ],
      }}
    />
  );
}

export function PageStructuredData({
  locale,
  path,
  name,
  description,
  type = "WebPage",
}: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
}) {
  return (
    <JsonLd
      id="page-structured-data"
      data={{
        "@context": "https://schema.org",
        ...webPageSchema({ locale, path, name, description, type }),
      }}
    />
  );
}

export function ServiceStructuredData({
  locale,
  slug,
  name,
  description,
}: {
  locale: Locale;
  slug: string;
  name: string;
  description: string;
}) {
  const path = `/services/${slug}`;
  return (
    <JsonLd
      id="service-structured-data"
      data={{
        "@context": "https://schema.org",
        "@graph": [
          webPageSchema({ locale, path, name, description }),
          serviceSchema({ locale, slug, name, description }),
        ],
      }}
    />
  );
}
