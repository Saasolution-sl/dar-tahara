import * as React from "react";
import { Quote, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

export function Testimonials({ dict }: { dict: Dictionary }) {
  const t = dict.testimonials;
  return (
    <Section className="bg-secondary/30">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t.eyebrow} title={t.title} />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {t.items.map((item, i) => (
            <Reveal key={i} index={i}>
              <figure className="flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
                <Quote className="h-8 w-8 text-accent/30" />
                <div className="mt-4 flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-[0.95rem] leading-relaxed text-foreground/85">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-serif text-sm text-primary-foreground">
                    {item.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
