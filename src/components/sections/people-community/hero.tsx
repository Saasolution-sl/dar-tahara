import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, HeartHandshake } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pages } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import type { PeopleCommunityLinks } from "./cta-links";

export function PeopleCommunityHero({
  locale,
  copy,
  links,
  secondaryLabel,
}: {
  locale: Locale;
  copy: Dictionary["peopleCommunity"];
  links: PeopleCommunityLinks;
  secondaryLabel: string;
}) {
  const base = `/${locale}`;

  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-40">
      <div className="wash pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <Container>
        <Breadcrumbs
          label={copy.breadcrumb.label}
          items={[
            { label: copy.breadcrumb.home, href: base },
            { label: copy.breadcrumb.current, href: `${base}${pages.peopleCommunity}` },
          ]}
        />

        <div className="mt-8 grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-6">
            <Reveal>
              <span className="eyebrow">
                <HeartHandshake className="h-3.5 w-3.5" aria-hidden />
                {copy.hero.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-5 text-balance text-display-lg text-foreground">
                {copy.hero.title}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {copy.hero.subtitle}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <ul className="mt-7 flex flex-wrap gap-2">
                {copy.hero.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1.5 text-xs font-medium text-foreground"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={links.primaryHref}
                  className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                >
                  {links.primaryLabel}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
                <Link
                  href={links.secondaryHref}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  {secondaryLabel}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.1}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-lift sm:aspect-[16/10]">
                {/*
                  Own photography, not stock. On a page arguing that these are
                  screened, salaried professionals, a borrowed stock image would
                  undercut the claim it sits next to. Source is 16:10, matching
                  the container at sm and above, so object-cover only crops on
                  mobile, where the subject sits left of centre and survives it.
                */}
                <Image
                  src="/images/people-community/dar-tahara-people-community-v1.jpg"
                  alt={copy.hero.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent"
                  aria-hidden
                />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
