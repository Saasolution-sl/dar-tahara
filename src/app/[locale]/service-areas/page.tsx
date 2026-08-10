import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicFeatureState } from "@/lib/feature-flags";
import { pages } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";
import { ServiceAreas } from "@/components/sections/service-areas";
import { ServiceAreasStructuredData } from "@/components/seo/structured-data";

export const dynamic = "force-dynamic";

const serviceAreasPath = pages.serviceAreas;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = await getDictionary(locale);
  const meta = dict.serviceAreas.meta;
  return buildLocalizedMetadata({
    locale,
    path: serviceAreasPath,
    title: meta.title,
    description: meta.description,
    imageAlt: meta.ogAlt,
  });
}

export default async function ServiceAreasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);
  const features = await getPublicFeatureState(typedLocale);
  const copy = dict.serviceAreas;

  return (
    <>
      <ServiceAreasStructuredData
        locale={typedLocale}
        name={copy.meta.title}
        description={copy.meta.description}
        faq={copy.faq}
      />
      <ServiceAreas locale={typedLocale} dict={dict} features={features} />
    </>
  );
}
