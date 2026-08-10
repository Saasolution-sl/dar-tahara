import * as React from "react";
import { BadgeCheck, FileCheck2, KeyRound, Lock, ScrollText, UserCheck } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// Order matches peopleCommunity.screening.steps: identity, background /
// employment verification, onboarding, professional standards, authorization.
const stepIcons = [UserCheck, FileCheck2, ScrollText, BadgeCheck, KeyRound];

export function EmployeeScreeningSection({
  copy,
}: {
  copy: Dictionary["peopleCommunity"]["screening"];
}) {
  return (
    <Section id="screening">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.lead} />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <ol className="min-w-0 space-y-4 lg:col-span-7">
            {copy.steps.map((step, i) => {
              const Icon = stepIcons[i] ?? BadgeCheck;
              return (
                <Reveal as="li" key={step.title} index={i} className="min-w-0">
                  <div className="flex items-start gap-5 rounded-[1.25rem] border border-border bg-card p-6 shadow-soft transition-shadow duration-300 ease-luxe hover:shadow-lift sm:p-7">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="break-words font-serif text-lg text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 break-words text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>

          {/*
            The official screening document. `criminalRecordDocument` is a single
            localized term per locale; the visitor only ever sees the wording that
            belongs to the language they are reading. Never combine locales here.
          */}
          <div className="min-w-0 lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-accent/30 bg-card p-8 shadow-lift sm:p-9">
                <div
                  className="pointer-events-none absolute inset-0 -z-10 opacity-70"
                  style={{
                    background:
                      "radial-gradient(70% 55% at 85% 0%, hsl(var(--accent) / 0.12), transparent 60%)",
                  }}
                  aria-hidden
                />
                <span className="eyebrow">
                  <ScrollText className="h-3.5 w-3.5" aria-hidden />
                  {copy.criminalRecordLabel}
                </span>
                <h3 className="mt-4 break-words font-serif text-2xl leading-snug text-foreground">
                  {copy.criminalRecordDocument}
                </h3>
                <p className="mt-4 break-words text-sm leading-relaxed text-muted-foreground">
                  {copy.criminalRecordBody}
                </p>
                <div className="mt-6 flex items-start gap-3 rounded-[1rem] border border-border bg-secondary/50 p-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="break-words text-xs leading-relaxed text-muted-foreground">
                    {copy.criminalRecordPrivacy}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal>
          <p className="mx-auto mt-12 max-w-3xl text-balance text-center font-serif text-xl leading-snug text-foreground sm:text-2xl">
            {copy.authorization}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
