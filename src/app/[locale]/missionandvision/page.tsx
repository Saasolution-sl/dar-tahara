import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicFeatureState } from "@/lib/feature-flags";
import { pages } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";
import { MissionVision } from "@/components/sections/mission-vision";
import { PageStructuredData } from "@/components/seo/structured-data";

export const dynamic = "force-dynamic";

const missionVisionPath = pages.missionVision;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = await getDictionary(locale);
  const meta = dict.missionVision.meta;
  return buildLocalizedMetadata({
    locale,
    path: missionVisionPath,
    title: meta.title,
    description: meta.description,
    type: "article",
    imageAlt: meta.ogAlt,
  });
}

export default async function MissionAndVisionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);
  const features = await getPublicFeatureState(typedLocale);

  const mv = dict.missionVision;

  return (
    <>
      <PageStructuredData
        locale={typedLocale}
        path={missionVisionPath}
        name={mv.meta.title}
        description={mv.meta.description}
        type="AboutPage"
      />
      <MissionVision locale={typedLocale} dict={dict} features={features} />
    </>
  );
}
