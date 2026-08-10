import * as React from "react";
import {
  CalendarClock,
  GraduationCap,
  HeartPulse,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// Order matches peopleCommunity.stability.items: salary, health coverage,
// predictable schedule, onboarding, structured working environment.
const itemIcons = [Wallet, HeartPulse, CalendarClock, GraduationCap, ShieldCheck];

export function EmployeeStabilitySection({
  copy,
}: {
  copy: Dictionary["peopleCommunity"]["stability"];
}) {
  return (
    <Section id="employee-stability" className="bg-secondary/40">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-5">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow={copy.eyebrow}
                title={copy.title}
                subtitle={copy.lead}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 border-s-2 border-accent/40 ps-6 font-serif text-lg leading-snug text-foreground sm:text-xl">
                {copy.objective}
              </p>
            </Reveal>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <ul className="grid gap-px overflow-hidden rounded-[1.5rem] border border-border bg-border">
              {copy.items.map((item, i) => {
                const Icon = itemIcons[i] ?? ShieldCheck;
                return (
                  <Reveal as="li" key={item.title} index={i} className="min-w-0">
                    <div className="flex items-start gap-5 bg-card p-6 sm:p-7">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="break-words font-serif text-lg text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 break-words text-sm leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
            <Reveal>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                {copy.disclaimer}
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
