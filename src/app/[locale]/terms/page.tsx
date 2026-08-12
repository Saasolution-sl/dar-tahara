import * as React from "react";
import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getLegalCopy } from "@/i18n/legal-copy";
import { PageStructuredData } from "@/components/seo/structured-data";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SERVICE_POLICY_COPY } from "@/lib/service-policy";
import { pages, site } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return buildLocalizedMetadata({
    locale,
    path: pages.terms,
    title: dict.footer.terms,
    description: dict.legal.termsMeta,
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "en";
  const policy = SERVICE_POLICY_COPY[locale];
  const legal = getLegalCopy(locale);
  const dict = await getDictionary(locale);

  return <>
    <PageStructuredData locale={locale} path={pages.terms} name={dict.footer.terms} description={dict.legal.termsMeta} />
    <LegalPage
      title={dict.legal.termsTitle}
      updated={dict.legal.termsUpdated}
      // English is the original, so it is never labelled a translation of itself.
      bindingLanguageNotice={locale === "en" ? undefined : dict.legal.bindingLanguageNotice}
      breadcrumbs={[
        { label: dict.missionVision.breadcrumb.home, href: `/${locale}` },
        { label: dict.footer.terms, href: `/${locale}${pages.terms}` },
      ]}
    >
    <p>{legal.terms.intro}</p>
    {legal.terms.opening.map((section) => (
      <React.Fragment key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </React.Fragment>
    ))}
    <h2>{policy.termsSchedulingHeading}</h2>
    {policy.termsScheduling.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <h2>{policy.termsSubscriptionHeading}</h2>
    {policy.termsSubscription.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <h2>{policy.termsDurationDiscountsHeading}</h2>
    {policy.termsDurationDiscounts.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <h2>{policy.termsPauseBenefitHeading}</h2>
    {policy.termsPauseBenefit.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    {legal.terms.closing.map((section) => (
      <React.Fragment key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </React.Fragment>
    ))}
    <h2>{policy.termsSupportHeading}</h2>
    <p>{policy.termsSupport} <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  </>;
}
