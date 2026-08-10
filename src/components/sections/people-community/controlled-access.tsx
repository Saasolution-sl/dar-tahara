import * as React from "react";
import {
  CalendarCheck,
  ClipboardList,
  Eye,
  KeyRound,
  Info,
  ShieldOff,
  Timer,
  UserCheck,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// Order matches peopleCommunity.access.steps.
const stepIcons = [
  CalendarCheck,
  UserCheck,
  Timer,
  KeyRound,
  ShieldOff,
  ClipboardList,
  Eye,
];

export function ControlledAccessSection({
  copy,
}: {
  copy: Dictionary["peopleCommunity"]["access"];
}) {
  return (
    <Section id="controlled-access" className="bg-secondary/40">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.lead} />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mx-auto mt-10 max-w-3xl text-balance rounded-[1.5rem] border border-accent/30 bg-card px-6 py-7 text-center font-serif text-xl leading-snug text-foreground shadow-soft sm:px-10 sm:text-2xl">
            {copy.statement}
          </p>
        </Reveal>

        {/*
          A numbered, ordered workflow. The counter sits in a circle rather than
          being a rendered "1." string so it needs no per-locale digit handling
          and stays on the correct side in RTL.
        */}
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {copy.steps.map((step, i) => {
            const Icon = stepIcons[i] ?? KeyRound;
            return (
              <Reveal as="li" key={step.title} index={i} className="min-w-0">
                <div className="flex h-full flex-col gap-4 rounded-[1.5rem] border border-border bg-card p-7 shadow-soft transition-shadow duration-300 ease-luxe hover:shadow-lift sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-muted-foreground"
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="break-words font-serif text-lg text-foreground">{step.title}</h3>
                  <p className="break-words text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>

        <Reveal>
          <div className="mx-auto mt-12 flex max-w-3xl items-start gap-3 rounded-[1.25rem] border border-border bg-card/70 p-5 sm:p-6">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="break-words text-xs leading-relaxed text-muted-foreground">
              {copy.availabilityNote}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
