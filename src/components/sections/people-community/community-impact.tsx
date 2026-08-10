import * as React from "react";
import { ArrowDown, ArrowRight, Check, Home, Users, Building2 } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// Order matches peopleCommunity.impact.groups: customer, employee, community.
const groupIcons = [Home, Users, Building2];

export function CommunityImpactSection({
  copy,
}: {
  copy: Dictionary["peopleCommunity"]["impact"];
}) {
  return (
    <Section id="community-impact">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {copy.groups.map((group, i) => {
            const Icon = groupIcons[i] ?? Users;
            return (
              <Reveal key={group.title} index={i} className="min-w-0">
                <div className="flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-8 shadow-soft transition-shadow duration-300 ease-luxe hover:shadow-lift sm:p-9">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 break-words font-serif text-xl text-foreground">
                    {group.title}
                  </h3>
                  <ul className="mt-6 space-y-3.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                          <Check className="h-3 w-3" aria-hidden />
                        </span>
                        <span className="min-w-0 break-words text-sm leading-relaxed text-muted-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* The three groups, restated as one chain rather than three silos. */}
        <Reveal>
          <ol className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-2">
            {copy.chain.map((link, i) => {
              const isLast = i === copy.chain.length - 1;
              return (
                <React.Fragment key={link}>
                  <li className="min-w-0">
                    <span className="flex items-center justify-center rounded-full border border-accent/30 bg-accent/5 px-5 py-3 text-center text-sm font-medium text-foreground">
                      {link}
                    </span>
                  </li>
                  {isLast ? null : (
                    <li
                      aria-hidden
                      className="flex shrink-0 items-center justify-center text-accent"
                    >
                      <ArrowDown className="h-4 w-4 sm:hidden" />
                      <ArrowRight className="hidden h-4 w-4 rtl:rotate-180 sm:block" />
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </Reveal>
      </Container>
    </Section>
  );
}
