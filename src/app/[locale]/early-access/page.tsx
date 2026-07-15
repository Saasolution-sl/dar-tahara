import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles, ShieldCheck, Clock } from "lucide-react";
import { isLocale, locales, localeMeta, getDir, type Locale } from "@/i18n/config";
import { getEarlyAccessCopy } from "@/i18n/early-access-copy";
import { EarlyAccessForm } from "@/components/early-access/early-access-form";
import { Container } from "@/components/ui/section";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getEarlyAccessCopy(locale);
  // Canonical points at the clean URL (no campaign/referral params), so tagged
  // links never create duplicate indexed pages (brief §37).
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: {
      canonical: `/${locale}/early-access`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [localeMeta[l].hreflang, `/${l}/early-access`])),
        "x-default": "/en/early-access",
      },
    },
    openGraph: {
      type: "website",
      locale: localeMeta[locale].hreflang,
      url: `${site.url}/${locale}/early-access`,
      siteName: site.name,
      title: copy.meta.title,
      description: copy.meta.description,
    },
    twitter: { card: "summary_large_image", title: copy.meta.title, description: copy.meta.description },
  };
}

export default async function EarlyAccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const copy = getEarlyAccessCopy(typedLocale);
  const dir = getDir(typedLocale);

  return (
    <div className="overflow-hidden" dir={dir}>
      <section className="wash relative border-b border-border pb-16 pt-28 sm:pt-32 lg:pt-40">
        <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <Container className="relative">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/* Left: pitch */}
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                {copy.hero.eyebrow}
              </span>
              <h1 className="mt-5 text-display-lg text-foreground sm:text-display-xl">{copy.hero.title}</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{copy.hero.body}</p>

              <div className="mt-8 space-y-3">
                <p className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/65 p-4 text-sm leading-relaxed text-muted-foreground backdrop-blur-sm">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  {copy.hero.notBooking}
                </p>
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Clock className="h-4 w-4 text-accent" />
                  {copy.hero.reassure}
                </p>
              </div>
            </div>

            {/* Right: the form */}
            <div id="form" className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary/[0.05] blur-xl" aria-hidden />
              <EarlyAccessForm locale={typedLocale} copy={copy} />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
