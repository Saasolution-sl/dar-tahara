import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { fontSans, fontSerif } from "../fonts";
import { locales, isLocale, getDir, localeMeta, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site, whatsappLink } from "@/lib/site";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DetectionTracker } from "@/components/layout/detection-tracker";
import { LaunchPopup } from "@/components/mailing-list/launch-popup";
import { WebsiteChat } from "@/components/assistant/website-chat";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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

  const languages = Object.fromEntries(
    locales.map((l) => [localeMeta[l].hreflang, `/${l}`]),
  );

  return {
    metadataBase: new URL(site.url),
    title: {
      default: dict.meta.title,
      template: `%s · ${dict.brand.name}`,
    },
    description: dict.meta.description,
    applicationName: dict.brand.name,
    authors: [{ name: dict.brand.name }],
    keywords: [
      "home cleaning Morocco",
      "property concierge",
      "villa management",
      "holiday home care",
      "expat home management",
      "Dar Tahara",
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      locale: localeMeta[locale].hreflang,
      url: `${site.url}/${locale}`,
      siteName: dict.brand.name,
      title: dict.meta.title,
      description: dict.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
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
  const dir = getDir(typedLocale);

  return (
    <html
      lang={localeMeta[typedLocale].hreflang}
      dir={dir}
      suppressHydrationWarning
      className={cn(fontSerif.variable, fontSans.variable)}
    >
      <body className="min-h-dvh bg-background">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <DetectionTracker locale={typedLocale} />
          <Navbar locale={typedLocale} dict={dict.nav} whatsappHref={whatsappLink()} />
          <main id="main">{children}</main>
          <Footer locale={typedLocale} dict={dict} />
          <LaunchPopup locale={typedLocale} dict={dict.mailing} />
          <WebsiteChat locale={typedLocale} copy={dict.assistant.chat} />
        </ThemeProvider>
      </body>
    </html>
  );
}
