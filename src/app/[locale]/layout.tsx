import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site, whatsappLink } from "@/lib/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DetectionTracker } from "@/components/layout/detection-tracker";
import { LaunchPopupLoader } from "@/components/mailing-list/launch-popup-loader";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MauticTracking } from "@/components/analytics/mautic-tracking";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import { WebsiteChatLauncher } from "@/components/assistant/website-chat-launcher";
import { shouldShowAssistantLauncher } from "@/lib/assistant/availability-state";
import { featureEnabled } from "@/lib/feature-flags";
import { buildLocalizedMetadata } from "@/lib/seo";
import { SiteStructuredData } from "@/components/seo/structured-data";

// Feature visibility is database-controlled and must not be frozen into a build.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1c0d" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);

  const baseMetadata = buildLocalizedMetadata({
    locale,
    title: dict.meta.title,
    description: dict.meta.description,
    absoluteTitle: true,
    imageAlt: dict.meta.ogAlt,
  });

  return {
    ...baseMetadata,
    title: {
      default: dict.meta.title,
      template: site.titleTemplate,
    },
    applicationName: dict.brand.name,
    authors: [{ name: dict.brand.name }],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = await getDictionary(typedLocale);
  const [newsletterEnabled, assistantEnabled] = await Promise.all([
    featureEnabled("newsletter_signup_enabled"),
    featureEnabled("ai_assistant_enabled"),
  ]);

  return (
    <>
      <SiteStructuredData />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <GoogleAnalytics />
      <MauticTracking />
      <ConsentBanner locale={typedLocale} dict={dict.consent} />
      <DetectionTracker locale={typedLocale} />
      <Navbar locale={typedLocale} dict={dict.nav} whatsappHref={whatsappLink()} />
      <main id="main">{children}</main>
      <Footer locale={typedLocale} dict={dict} />
      {newsletterEnabled ? <LaunchPopupLoader locale={typedLocale} dict={dict.mailing} /> : null}
      {shouldShowAssistantLauncher(assistantEnabled)
        ? <WebsiteChatLauncher locale={typedLocale} copy={dict.assistant.chat} />
        : null}
    </>
  );
}
