import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { PageStructuredData } from "@/components/seo/structured-data";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SERVICE_POLICY_COPY } from "@/lib/service-policy";
import { pages, site } from "@/lib/site";
import { buildLocalizedMetadata } from "@/lib/seo";

const description = "Terms governing Dar Tahara home assessments and subscriptions.";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return buildLocalizedMetadata({
    locale,
    path: pages.terms,
    title: dict.footer.terms,
    description,
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "en";
  const policy = SERVICE_POLICY_COPY[locale];
  const dict = await getDictionary(locale);

  return <>
    <PageStructuredData locale={locale} path={pages.terms} name={dict.footer.terms} description={description} />
    <LegalPage
      title="Terms of Service"
      updated="Effective 24 July 2026"
      breadcrumbs={[
        { label: dict.missionVision.breadcrumb.home, href: `/${locale}` },
        { label: dict.footer.terms, href: `/${locale}${pages.terms}` },
      ]}
    >
    <p>These Terms govern bookings and subscriptions supplied by Dar Tahara in Morocco. By paying for an Initial Home Assessment or accepting a subscription, you agree to these Terms and the order summary shown before payment.</p>
    <h2>1. Initial Home Assessment</h2>
    <p>An Initial Home Assessment is mandatory before any recurring service begins. It is a separate, one-time, prepaid service covering a professional visit, verification of the home information, a cleaning profile and, where reasonably achievable during the allocated visit, initial cleaning. Payment reserves the requested appointment but remains subject to our scheduling confirmation.</p>
    <p>The assessment fee is not a subscription payment and does not guarantee approval for recurring service. If the declared size, condition, access requirements, safety conditions or workload differ materially from the booking, we may propose an additional deep-clean fee, a revised recurring price or decline ongoing service.</p>
    <h2>2. Customer information and access</h2>
    <p>You must provide accurate property, contact, pet, smoking, access and safety information and ensure lawful, safe access at the agreed time. You remain responsible for valuables, hazardous materials, unstable fittings and disclosing risks. Keys or access codes accepted by us are handled only for service delivery and must not be shared through insecure channels unless we expressly instruct you to do so.</p>
    <h2>{policy.termsSchedulingHeading}</h2>
    {policy.termsScheduling.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <h2>{policy.termsSubscriptionHeading}</h2>
    {policy.termsSubscription.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <h2>{policy.termsDurationDiscountsHeading}</h2>
    {policy.termsDurationDiscounts.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <h2>{policy.termsPauseBenefitHeading}</h2>
    {policy.termsPauseBenefit.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <h2>5. Quality, damage and complaints</h2>
    <p>Please report a service concern or alleged damage within 48 hours, with reasonable evidence, so we can investigate. Where we are responsible, our first remedy may be a return visit, repair, replacement or an appropriate credit. We are not responsible for pre-existing damage, ordinary wear, undisclosed fragility, inherent defects or events outside reasonable control.</p>
    <h2>6. Liability</h2>
    <p>Nothing excludes liability that cannot lawfully be excluded. Subject to that rule, our aggregate liability arising from a service is limited to the amount paid for the affected service or, for a subscription claim, the fees paid during the preceding three months. We are not liable for indirect business losses.</p>
    <h2>7. Communications and acceptable use</h2>
    <p>We may send operational email and WhatsApp messages about applications, payments, assessments, proposals and renewals. You must not misuse our website, staff, messaging assistant or payment systems. Automated answers are general service information; Dar Tahara Support confirms exceptional arrangements.</p>
    <h2>8. Privacy, changes and law</h2>
    <p>Our Privacy Policy explains personal-data processing. We may update these Terms prospectively; the version accepted at checkout is recorded with your booking. These Terms are governed by Moroccan law, and disputes are subject to the competent Moroccan courts unless mandatory consumer law provides otherwise.</p>
    <h2>{policy.termsSupportHeading}</h2>
    <p>{policy.termsSupport} <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  </>;
}
