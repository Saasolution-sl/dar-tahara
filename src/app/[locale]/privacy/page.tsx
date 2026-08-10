import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/layout/legal-page";
import { getLegalCopy, PRIVACY_CONTACT, PRIVACY_CONTACT_SUFFIX } from "@/i18n/legal-copy";
import { PageStructuredData } from "@/components/seo/structured-data";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pages, site } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return buildLocalizedMetadata({
    locale,
    path: pages.privacy,
    title: dict.footer.privacy,
    description: dict.legal.privacyMeta,
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);
  const legal = getLegalCopy(typedLocale);
  const contact = PRIVACY_CONTACT[typedLocale];
  const contactSuffix = PRIVACY_CONTACT_SUFFIX[typedLocale];

  return <>
    <PageStructuredData locale={typedLocale} path={pages.privacy} name={dict.footer.privacy} description={dict.legal.privacyMeta} />
    <LegalPage
      title={dict.legal.privacyTitle}
      updated={dict.legal.privacyUpdated}
      bindingLanguageNotice={typedLocale === "en" ? undefined : dict.legal.bindingLanguageNotice}
      breadcrumbs={[
        { label: dict.missionVision.breadcrumb.home, href: `/${typedLocale}` },
        { label: dict.footer.privacy, href: `/${typedLocale}${pages.privacy}` },
      ]}
    >
    <p>{legal.privacy.intro}</p>
    {legal.privacy.opening.map((section) => (
      <React.Fragment key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </React.Fragment>
    ))}
    <h2>{contact.heading}</h2>
    <p>{contact.body} <a href={`mailto:${site.email}`}>{site.email}</a> {contactSuffix}</p>
    </LegalPage>
  </>;
}
