import * as React from "react";
import {
  Sparkles, RefreshCw, ArrowRightLeft, ClipboardCheck, Wrench, KeyRound,
  Plane, Shirt, Droplets, PaintRoller, Zap, Home,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

const icons = [
  Sparkles, RefreshCw, ArrowRightLeft, ClipboardCheck, Wrench, KeyRound,
  Plane, Shirt, Droplets, PaintRoller, Zap, Home,
];

export function Services({ dict }: { dict: Dictionary }) {
  const s = dict.services;
  return (
    <Section id={sections.services} className="bg-secondary/30">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.items.map((item, i) => {
            const Icon = icons[i] ?? Sparkles;
            return (
              <Reveal key={i} index={i % 3}>
                <article className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift">
                  <span
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
