import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EarlyAccessForm } from "@/components/early-access/early-access-form";
import { Container } from "@/components/ui/section";
import { getDir, isLocale, type Locale } from "@/i18n/config";
import { getEarlyAccessCopy } from "@/i18n/early-access-copy";
import { getEarlyAccessLeadCopy } from "@/i18n/early-access-lead-copy";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EarlyAccessOnboardingPage({ params }: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const copy = getEarlyAccessCopy(typedLocale);
  const leadCopy = getEarlyAccessLeadCopy(typedLocale);

  return (
    <section className="wash min-h-screen pb-16 pt-28 sm:pt-32" dir={getDir(typedLocale)}>
      <Container className="max-w-3xl">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <p className="eyebrow mx-auto w-fit">{leadCopy.priorityTitle}</p>
          <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">{leadCopy.priorityBody}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.hero.notBooking}</p>
        </header>
        <EarlyAccessForm locale={typedLocale} copy={copy} />
      </Container>
    </section>
  );
}
