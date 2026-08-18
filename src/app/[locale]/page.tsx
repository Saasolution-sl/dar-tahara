import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { HomePageStructuredData } from "@/components/seo/structured-data";
import { Hero } from "@/components/sections/hero";
import { Why } from "@/components/sections/why";
import { Services } from "@/components/sections/services";
import { Plans } from "@/components/sections/plans";
import { PricingCalculator } from "@/components/sections/pricing-calculator";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Audiences } from "@/components/sections/audiences";
import { Testimonials } from "@/components/sections/testimonials";
import { MissionTeaser } from "@/components/sections/mission-teaser";
import { PeopleTeaser } from "@/components/sections/people-teaser";
import { Gallery } from "@/components/sections/gallery";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";
import { LaunchSignup } from "@/components/sections/launch-signup";
import { getPublicFeatureState } from "@/lib/feature-flags";
import { getDurationTiers } from "@/lib/subscription-duration-config";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);
  const features = await getPublicFeatureState(typedLocale);
  const durationTiers = await getDurationTiers();

  return (
    <>
      <HomePageStructuredData locale={typedLocale} dict={dict} />
      <Hero locale={typedLocale} dict={dict} features={features} />
      <Why dict={dict} />
      <Services locale={typedLocale} dict={dict} />
      <Plans locale={typedLocale} dict={dict} />
      <PricingCalculator
        locale={typedLocale}
        dict={{ calculator: dict.calculator, booking: dict.booking }}
        features={features}
        durationTiers={durationTiers}
      />
      <HowItWorks dict={dict} />
      <Audiences dict={dict} />
      <Testimonials dict={dict} />
      <MissionTeaser locale={typedLocale} dict={dict} />
      <PeopleTeaser locale={typedLocale} dict={dict} />
      <Gallery dict={dict.gallery} />
      <Faq dict={dict} />
      {features.earlyAccessEnabled ? <LaunchSignup locale={typedLocale} dict={dict} /> : null}
      <Cta locale={typedLocale} dict={dict} features={features} />
    </>
  );
}
