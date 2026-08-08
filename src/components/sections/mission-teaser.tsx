import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pages } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Section, Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";

/**
 * Homepage teaser for the Mission & Vision page: a short brand-story band
 * that strengthens internal linking without competing with the Why section.
 */
export function MissionTeaser({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.missionVision.teaser;
  const href = `/${locale}${pages.missionVision}`;

  return (
    <Section>
      <Container>
        <Reveal>
          <div className="grid gap-10 rounded-[2rem] border border-border bg-card px-6 py-12 shadow-soft sm:px-12 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-7">
              <span className="eyebrow">
                <Compass className="h-3.5 w-3.5" aria-hidden />
                {t.eyebrow}
              </span>
              <h2 className="mt-4 text-display-md text-foreground">{t.title}</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.body}
              </p>
            </div>

            <div className="lg:col-span-5">
              <ul className="space-y-3.5">
                {t.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-7 w-full sm:w-auto")}
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
