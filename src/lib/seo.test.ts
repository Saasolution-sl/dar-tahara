import assert from "node:assert/strict";
import test from "node:test";
import { locales } from "@/i18n/config";
import {
  buildLocalizedMetadata,
  faqPageSchema,
  languageAlternates,
  localizedUrl,
  noIndexMetadata,
  organizationSchema,
  serializeJsonLd,
  serviceSchema,
  websiteSchema,
} from "@/lib/seo";
import { site } from "@/lib/site";

test("localized metadata uses an absolute production canonical and complete hreflang set", () => {
  const metadata = buildLocalizedMetadata({
    locale: "fr",
    path: "/services/premium-cleaning",
    title: "Premium Cleaning",
    description: "A repository-backed service description.",
  });

  assert.equal(
    metadata.alternates?.canonical,
    "https://www.dartahara.com/fr/services/premium-cleaning",
  );
  const languages = metadata.alternates?.languages as Record<string, string>;
  assert.equal(languages.fr, "https://www.dartahara.com/fr/services/premium-cleaning");
  assert.equal(languages["x-default"], "https://www.dartahara.com/en/services/premium-cleaning");
  assert.equal(Object.keys(languages).length, locales.length + 1);
  assert.equal(metadata.openGraph && "url" in metadata.openGraph ? metadata.openGraph.url : undefined,
    "https://www.dartahara.com/fr/services/premium-cleaning");
  assert.ok(!JSON.stringify(metadata).includes("localhost"));
});

test("URL helpers remove duplicate slash variants and tracking parameters stay outside canonicals", () => {
  assert.equal(localizedUrl("en", "/privacy/"), "https://www.dartahara.com/en/privacy");
  assert.equal(languageAlternates("terms").en, "https://www.dartahara.com/en/terms");
});

test("private-page metadata is noindex and nofollow", () => {
  const metadata = noIndexMetadata("Private route");
  const robots = typeof metadata.robots === "object" ? metadata.robots : undefined;
  assert.deepEqual(
    { index: robots?.index, follow: robots?.follow },
    { index: false, follow: false },
  );
});

test("JSON-LD serialization blocks script termination while preserving valid JSON", () => {
  const payload = { value: "</script><script>alert('x')</script>&" };
  const serialized = serializeJsonLd(payload);
  assert.ok(!serialized.includes("</script>"));
  assert.deepEqual(JSON.parse(serialized), payload);
});

test("structured-data builders keep stable entity IDs and omit undefined values", () => {
  const organization = organizationSchema();
  const website = websiteSchema();
  const service = serviceSchema({
    locale: "en",
    slug: "premium-cleaning",
    name: "Premium Cleaning",
    description: "A premium home cleaning service.",
  });
  const faq = faqPageSchema("en", [{ q: "Question?", a: "Answer." }]);
  const serialized = JSON.stringify({ organization, website, service, faq });

  assert.equal(organization["@id"], `${site.siteUrl}/#organization`);
  assert.equal(website["@id"], `${site.siteUrl}/#website`);
  assert.deepEqual(service.provider, { "@id": `${site.siteUrl}/#organization` });
  assert.ok(!serialized.includes("undefined"));
  assert.equal((faq.mainEntity as unknown[]).length, 1);
});
