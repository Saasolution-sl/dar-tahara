import * as React from "react";
import { CalendarRange, Clock, Info, ShieldCheck, EyeOff } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// Order matches peopleCommunity.transparency.points.
const pointIcons = [Clock, CalendarRange, ShieldCheck];

export function AccessTransparencySection({
  copy,
}: {
  copy: Dictionary["peopleCommunity"]["transparency"];
}) {
  return (
    <Section id="access-transparency">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow={copy.eyebrow}
                title={copy.title}
                subtitle={copy.body}
              />
            </Reveal>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <ul className="grid gap-4 sm:grid-cols-3 lg:gap-5">
              {copy.points.map((point, i) => {
                const Icon = pointIcons[i] ?? Clock;
                return (
                  <Reveal as="li" key={point.title} index={i} className="min-w-0">
                    <div className="flex h-full flex-col gap-3 rounded-[1.25rem] border border-border bg-card p-6 shadow-soft">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <h3 className="break-words font-serif text-base text-foreground">
                        {point.title}
                      </h3>
                      <p className="break-words text-sm leading-relaxed text-muted-foreground">
                        {point.body}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </ul>

            <Reveal>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-[1.25rem] border border-border bg-secondary/40 p-5">
                  <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="break-words text-xs leading-relaxed text-muted-foreground">
                    {copy.privacyNote}
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-[1.25rem] border border-border bg-card/70 p-5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="break-words text-xs leading-relaxed text-muted-foreground">
                    {copy.availabilityNote}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
