import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicFeatureState } from "@/lib/feature-flags";
import { pages } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";
import { PeopleCommunity } from "@/components/sections/people-community";
import { PageStructuredData } from "@/components/seo/structured-data";

export const dynamic = "force-dynamic";

const peopleCommunityPath = pages.peopleCommunity;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = await getDictionary(locale);
  const meta = dict.peopleCommunity.meta;
  return buildLocalizedMetadata({
    locale,
    path: peopleCommunityPath,
    title: meta.title,
    description: meta.description,
    type: "article",
    imageAlt: meta.ogAlt,
  });
}

export default async function PeopleCommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);
  const features = await getPublicFeatureState(typedLocale);

  const pc = dict.peopleCommunity;

  return (
    <>
      <PageStructuredData
        locale={typedLocale}
        path={peopleCommunityPath}
        name={pc.meta.title}
        description={pc.meta.description}
        type="AboutPage"
      />
      <PeopleCommunity locale={typedLocale} dict={dict} features={features} />
    </>
  );
}
