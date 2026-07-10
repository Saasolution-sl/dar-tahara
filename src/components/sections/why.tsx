import * as React from "react";
import Image from "next/image";
import { ShieldCheck, Gem, Feather, Lock } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

const icons = [ShieldCheck, Gem, Feather, Lock];

export function Why({ dict }: { dict: Dictionary }) {
  const w = dict.why;
  return (
    <Section id={sections.why} bleed>
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow={w.eyebrow}
                title={w.title}
                subtitle={w.subtitle}
              />
            </Reveal>

            <Reveal delay={0.15} className="mt-10">
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[1.75rem] shadow-soft">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-px overflow-hidden rounded-[1.75rem] border border-border bg-border sm:grid-cols-2">
              {w.pillars.map((p, i) => {
                const Icon = icons[i] ?? ShieldCheck;
                return (
                  <Reveal key={i} index={i} className="h-full">
                    <div className="group flex h-full flex-col gap-4 bg-card p-8 transition-colors duration-300 hover:bg-secondary/50 sm:p-10">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-transform duration-300 ease-luxe group-hover:-translate-y-0.5">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="font-serif text-xl text-foreground">{p.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {p.body}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
