import * as React from "react";
import Link from "next/link";
import { ArrowRight, CircleDot, Clock, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pages, sections } from "@/lib/site";
import {
  CITY_STATUSES,
  citiesByStatus,
  cityName,
  regions,
  MOROCCAN_CITIES,
  type CityStatus,
} from "@/lib/moroccan-cities";
import { cn } from "@/lib/utils";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import type { PublicFeatureState } from "@/lib/feature-flags";

const statusIcons: Record<CityStatus, typeof MapPin> = {
  available: MapPin,
  expanding: Clock,
  planned: CircleDot,
};

/** Live areas read as an assertion; planned areas must read as an intention. */
const statusStyles: Record<CityStatus, string> = {
  available: "border-accent/35 bg-accent/[0.07] text-foreground",
  expanding: "border-border bg-card text-foreground",
  planned: "border-border bg-secondary/40 text-muted-foreground",
};

export function ServiceAreas({
  locale,
  dict,
  features,
}: {
  locale: Locale;
  dict: Dictionary;
  features: PublicFeatureState;
}) {
  const copy = dict.serviceAreas;
  const base = `/${locale}`;
  const earlyAccessHref = features.earlyAccessEnabled
    ? `${base}${pages.earlyAccess}`
    : features.fallbackUrl;

  return (
    <>
      {/* ------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden pb-14 pt-28 sm:pb-16 sm:pt-32 lg:pt-40">
        <div className="wash pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <Container>
          <Breadcrumbs
            label={copy.breadcrumb.label}
            items={[
              { label: copy.breadcrumb.home, href: base },
              { label: copy.breadcrumb.current, href: `${base}${pages.serviceAreas}` },
            ]}
          />
          <div className="mt-8 max-w-3xl">
            <Reveal>
              <span className="eyebrow">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {copy.hero.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-5 text-balance text-display-lg text-foreground">
                {copy.hero.title}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {copy.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={earlyAccessHref}
                  className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                >
                  {copy.hero.ctaPrimary}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
                <Link
                  href={`${base}#${sections.services}`}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  {copy.hero.ctaSecondary}
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------- Cities, by status */}
      {CITY_STATUSES.map((status, groupIndex) => {
        const cities = citiesByStatus(status);
        if (!cities.length) return null;
        const Icon = statusIcons[status];
        const group = copy.status[status];

        return (
          <Section
            key={status}
            id={`areas-${status}`}
            className={cn("py-14 sm:py-16", groupIndex % 2 === 1 && "bg-secondary/40")}
          >
            <Container>
              <Reveal>
                <div className="flex items-start gap-4">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
                      {group.label}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {group.note}
                    </p>
                  </div>
                </div>
              </Reveal>

              {/*
                A plain list of place names in crawlable text. Deliberately not
                links: a link implies a destination page, and per-city pages for
                a service that is not bookable there would be doorway pages.
              */}
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {cities.map((city, i) => (
                  <Reveal as="li" key={city.name} index={Math.min(i, 8)} className="min-w-0">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-4 py-2 text-sm",
                        statusStyles[status],
                      )}
                    >
                      {cityName(city, locale)}
                    </span>
                  </Reveal>
                ))}
              </ul>
            </Container>
          </Section>
        );
      })}

      {/* ------------------------------------------------ Region overview */}
      <Section id="coverage-by-region" className="py-14 sm:py-16">
        <Container>
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow={copy.regionLabel}
              title={copy.coverageTitle}
              subtitle={copy.coverageNote}
            />
          </Reveal>

          <div className="mt-10 grid gap-px overflow-hidden rounded-[1.5rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {regions().map((region, i) => {
              const inRegion = MOROCCAN_CITIES.filter((city) => city.region === region);
              return (
                <Reveal key={region} index={Math.min(i, 8)} className="h-full min-w-0">
                  <div className="flex h-full flex-col gap-3 bg-card p-6">
                    <h3 className="break-words font-serif text-lg text-foreground">{region}</h3>
                    <p className="break-words text-sm leading-relaxed text-muted-foreground">
                      {inRegion.map((city) => cityName(city, locale)).join(" · ")}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              {copy.disclaimer}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- Q & A */}
      <Section id="areas-faq" className="bg-secondary/40 py-14 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl space-y-8">
            {copy.faq.map((item, i) => (
              <Reveal key={item.q} index={i}>
                <h2 className="font-serif text-xl text-foreground sm:text-2xl">{item.q}</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{item.a}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- CTA */}
      <Section id="areas-cta" className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="wash relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-14 text-center shadow-soft sm:px-12">
              <h2 className="mx-auto max-w-2xl text-balance text-display-md text-foreground">
                {copy.cta.title}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {copy.cta.body}
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href={earlyAccessHref}
                  className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                >
                  {copy.cta.button}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
