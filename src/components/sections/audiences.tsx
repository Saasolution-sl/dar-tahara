import * as React from "react";
import { Globe2, Briefcase, Users, Palmtree, BedDouble, TrendingUp } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

const icons = [Globe2, Briefcase, Users, Palmtree, BedDouble, TrendingUp];

export function Audiences({ dict }: { dict: Dictionary }) {
  const a = dict.audiences;
  return (
    <Section id={sections.audiences}>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={a.eyebrow} title={a.title} />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {a.items.map((item, i) => {
            const Icon = icons[i] ?? Globe2;
            return (
              <Reveal key={i} index={i % 3}>
                <article className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 ease-luxe hover:border-accent/40 hover:shadow-soft">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
