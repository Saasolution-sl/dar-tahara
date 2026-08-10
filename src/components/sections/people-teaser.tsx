import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, HeartHandshake, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pages } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Section, Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";

// Order matches peopleCommunity.teaser.points: screening, appointment-scoped
// access, local employment.
const pointIcons = [ShieldCheck, CalendarClock, HeartHandshake];

/**
 * Homepage entry point to the People & Community page.
 *
 * Sits next to MissionTeaser, so it deliberately takes a different shape: a
 * centred band with the three proof points in a row, rather than that
 * component's split card. Two identical cards back to back would read as one
 * repeated section and neither would get clicked.
 */
export function PeopleTeaser({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.peopleCommunity.teaser;
  const href = `/${locale}${pages.peopleCommunity}`;

  return (
    <Section className="bg-secondary/40">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">
              <HeartHandshake className="h-3.5 w-3.5" aria-hidden />
              {t.eyebrow}
            </span>
            <h2 className="mt-4 text-balance text-display-md text-foreground">{t.title}</h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.body}
            </p>
          </div>
        </Reveal>

        <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3 sm:gap-5">
          {t.points.map((point, i) => {
            const Icon = pointIcons[i] ?? ShieldCheck;
            return (
              <Reveal as="li" key={point} index={i} className="min-w-0">
                <div className="flex h-full items-center gap-4 rounded-[1.25rem] border border-border bg-card px-5 py-5 shadow-soft sm:flex-col sm:gap-3 sm:px-6 sm:py-7 sm:text-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 break-words text-sm font-medium leading-snug text-foreground">
                    {point}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <Reveal>
          <div className="mt-10 flex justify-center">
            <Link
              href={href}
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              {t.cta}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
