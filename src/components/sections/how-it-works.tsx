import * as React from "react";
import { CalendarCheck, MapPin, Sparkles, ClipboardCheck, DoorOpen, Heart } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

const icons = [CalendarCheck, MapPin, Sparkles, ClipboardCheck, DoorOpen, Heart];

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const h = dict.how;
  return (
    <Section id={sections.how} className="bg-primary text-primary-foreground" bleed>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={h.eyebrow}
            title={<span className="text-primary-foreground">{h.title}</span>}
            className="[&_.eyebrow]:text-accent"
          />
        </Reveal>

        <ol className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {h.steps.map((step, i) => {
            const Icon = icons[i] ?? Sparkles;
            return (
              <Reveal as="li" key={i} index={i % 3} className="relative">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-accent" />
                  </span>
                  <span className="font-serif text-5xl text-primary-foreground/15">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">
                  {step.body}
                </p>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
