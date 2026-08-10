import type { Metadata } from "next";
import { after } from "next/server";
import { notFound } from "next/navigation";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { isLocale, getDir, type Locale } from "@/i18n/config";
import { getEarlyAccessCopy } from "@/i18n/early-access-copy";
import { getEarlyAccessLeadCopy } from "@/i18n/early-access-lead-copy";
import { EarlyAccessLeadForm } from "@/components/early-access/early-access-lead-form";
import { Container } from "@/components/ui/section";
import { site } from "@/lib/site";
import {
  EARLY_ACCESS_ENGLISH_SOCIAL_COPY,
  EARLY_ACCESS_SOCIAL_IMAGE,
  earlyAccessCanonicalUrl,
  earlyAccessLanguageAlternates,
  earlyAccessOpenGraphLocales,
} from "@/lib/early-access/social-metadata";
import { prepareEarlyAccessPageView } from "@/lib/early-access/page-view-recorder";
import { PageStructuredData } from "@/components/seo/structured-data";
import { pages } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getEarlyAccessCopy(locale);
  const canonicalUrl = earlyAccessCanonicalUrl(locale);
  const socialTitle = locale === "en" ? EARLY_ACCESS_ENGLISH_SOCIAL_COPY.title : copy.meta.title;
  const socialDescription = locale === "en"
    ? EARLY_ACCESS_ENGLISH_SOCIAL_COPY.description
    : copy.meta.description;
  const openGraphLocales = earlyAccessOpenGraphLocales(locale);
  // Canonical points at the clean URL (no campaign/referral params), so tagged
  // links never create duplicate indexed pages (brief §37).
  return {
    title: { absolute: copy.meta.title },
    description: copy.meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: earlyAccessLanguageAlternates(),
    },
    openGraph: {
      type: "website",
      ...openGraphLocales,
      url: canonicalUrl,
      siteName: site.name,
      title: socialTitle,
      description: socialDescription,
      images: [EARLY_ACCESS_SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: [{
        url: EARLY_ACCESS_SOCIAL_IMAGE.url,
        secureUrl: EARLY_ACCESS_SOCIAL_IMAGE.secureUrl,
        alt: EARLY_ACCESS_SOCIAL_IMAGE.alt,
      }],
    },
  };
}

export default async function EarlyAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  // Cookieless view counter. The request is inspected during render (`headers()`
  // is not callable inside `after`), then the write is deferred so the visitor
  // waits on nothing. Only reached once the locale is valid: a 404 is not a view.
  const query = await searchParams;
  after(await prepareEarlyAccessPageView(typedLocale, query));
  const copy = getEarlyAccessCopy(typedLocale);
  const leadCopy = getEarlyAccessLeadCopy(typedLocale);
  const dir = getDir(typedLocale);

  return (
    <div className="overflow-hidden" dir={dir}>
      {/*
        The highest-intent public page had site-level schema only, so crawlers
        saw no WebPage entity for it and nothing tying it to the organization.
      */}
      <PageStructuredData
        locale={typedLocale}
        path={pages.earlyAccess}
        name={copy.meta.title}
        description={copy.meta.description}
      />
      <section className="wash relative border-b border-border pb-16 pt-28 sm:pt-32 lg:pt-40">
        <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <Container className="relative">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/* Left: pitch */}
            <div className="min-w-0 lg:sticky lg:top-28">
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                {copy.hero.eyebrow}
              </span>
              <h1 className="mt-5 text-display-lg text-foreground sm:text-display-xl">{copy.hero.title}</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{leadCopy.intro}</p>

              <div className="mt-8 rounded-2xl border border-accent/25 bg-background/55 p-5 shadow-soft backdrop-blur-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {copy.hero.benefitsTitle}
                </p>
                <ul className="mt-4 space-y-3">
                  {copy.hero.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 space-y-3">
                <p className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/65 p-4 text-sm leading-relaxed text-muted-foreground backdrop-blur-sm">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  {copy.hero.notBooking}
                </p>
              </div>
            </div>

            {/* Right: the form */}
            <div id="form" className="relative min-w-0">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/[0.05] blur-xl" aria-hidden />
              <EarlyAccessLeadForm locale={typedLocale} copy={leadCopy} />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
