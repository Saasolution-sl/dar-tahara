import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { StructuredData } from "@/components/seo/structured-data";
import { Hero } from "@/components/sections/hero";
import { Why } from "@/components/sections/why";
import { Services } from "@/components/sections/services";
import { Plans } from "@/components/sections/plans";
import { PricingCalculator } from "@/components/sections/pricing-calculator";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Audiences } from "@/components/sections/audiences";
import { Testimonials } from "@/components/sections/testimonials";
import { Gallery } from "@/components/sections/gallery";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";
import { LaunchSignup } from "@/components/sections/launch-signup";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);

  return (
    <>
      <StructuredData locale={typedLocale} dict={dict} />
      <Hero locale={typedLocale} dict={dict} />
      <Why dict={dict} />
      <Services dict={dict} />
      <Plans locale={typedLocale} dict={dict} />
      <PricingCalculator locale={typedLocale} dict={dict} />
      <HowItWorks dict={dict} />
      <Audiences dict={dict} />
      <Testimonials dict={dict} />
      <Gallery dict={dict} />
      <Faq dict={dict} />
      <LaunchSignup locale={typedLocale} dict={dict} />
      <Cta locale={typedLocale} dict={dict} />
    </>
  );
}
