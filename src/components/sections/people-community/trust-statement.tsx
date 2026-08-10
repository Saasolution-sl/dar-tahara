import * as React from "react";
import { CalendarClock, ScrollText, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Section, Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// Order matches peopleCommunity.trust.pillars.
const pillarIcons = [ShieldCheck, CalendarClock, ScrollText];

export function TrustStatement({
  copy,
}: {
  copy: Dictionary["peopleCommunity"]["trust"];
}) {
  return (
    <Section id="trust" bleed>
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 text-primary-foreground shadow-lift sm:px-12 sm:py-20 lg:px-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                background:
                  "radial-gradient(55% 60% at 15% 20%, hsl(var(--accent)), transparent 60%), radial-gradient(45% 55% at 85% 75%, hsl(var(--accent)), transparent 55%)",
              }}
              aria-hidden
            />
            <div className="relative mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {copy.eyebrow}
              </span>
              <h2 className="mt-5 text-balance text-display-md">{copy.title}</h2>
              <p className="mt-7 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
                {copy.body}
              </p>
            </div>

            <ul className="relative mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3 sm:gap-5">
              {copy.pillars.map((pillar, i) => {
                const Icon = pillarIcons[i] ?? ShieldCheck;
                return (
                  <Reveal as="li" key={pillar.title} index={i} className="min-w-0">
                    <div className="flex h-full flex-col gap-3 rounded-[1.25rem] border border-primary-foreground/15 bg-primary-foreground/[0.06] p-6 text-start backdrop-blur-sm">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <h3 className="break-words font-serif text-lg">{pillar.title}</h3>
                      <p className="break-words text-sm leading-relaxed text-primary-foreground/75">
                        {pillar.body}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
