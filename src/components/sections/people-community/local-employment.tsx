import * as React from "react";
import {
  ArrowDown,
  ArrowRight,
  Briefcase,
  CalendarCheck,
  MapPin,
  Route,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// Order matches peopleCommunity.employment.items.
const itemIcons = [MapPin, CalendarCheck, Route, Users, TrendingUp];
// Order matches peopleCommunity.employment.flow.steps.
const flowIcons = [Users, CalendarCheck, Briefcase];

export function LocalEmploymentSection({
  copy,
}: {
  copy: Dictionary["peopleCommunity"]["employment"];
}) {
  return (
    <Section id="local-employment">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.lead} />
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {copy.items.map((item, i) => {
            const Icon = itemIcons[i] ?? MapPin;
            return (
              <Reveal key={item.title} index={i} className="h-full min-w-0">
                <div className="flex h-full flex-col gap-4 bg-card p-8 transition-colors duration-300 hover:bg-secondary/50 sm:p-9">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="break-words font-serif text-lg text-foreground">{item.title}</h3>
                  <p className="break-words text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* The model, in one line: demand creates appointments, appointments create jobs. */}
        <Reveal>
          <div className="mt-14 overflow-hidden rounded-[2rem] border border-accent/25 bg-card p-8 shadow-soft sm:p-10 lg:p-12">
            <h3 className="text-center font-serif text-xl text-foreground sm:text-2xl">
              {copy.flow.title}
            </h3>

            <ol className="mt-9 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:gap-2">
              {copy.flow.steps.map((step, i) => {
                const Icon = flowIcons[i] ?? Briefcase;
                const isLast = i === copy.flow.steps.length - 1;
                return (
                  <React.Fragment key={step}>
                    <li className="min-w-0 flex-1">
                      <div className="flex h-full items-center gap-4 rounded-[1.25rem] border border-border bg-secondary/40 px-5 py-6 text-start sm:px-6 lg:flex-col lg:gap-3 lg:text-center">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 break-words text-sm font-medium leading-snug text-foreground sm:text-base">
                          {step}
                        </span>
                      </div>
                    </li>
                    {isLast ? null : (
                      <li
                        aria-hidden
                        className="flex shrink-0 items-center justify-center text-accent lg:px-1"
                      >
                        <ArrowDown className="h-5 w-5 lg:hidden" />
                        <ArrowRight className="hidden h-5 w-5 rtl:rotate-180 lg:block" />
                      </li>
                    )}
                  </React.Fragment>
                );
              })}
            </ol>

            <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
              {copy.flow.note}
            </p>
          </div>
        </Reveal>

        <Reveal>
          <p className="mx-auto mt-12 max-w-3xl text-center font-serif text-xl leading-snug text-foreground sm:text-2xl">
            {copy.customerNote}
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
            {copy.disclaimer}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
