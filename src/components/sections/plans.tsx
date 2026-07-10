import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";

export function Plans({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const p = dict.plans;
  const base = `/${locale}`;

  return (
    <Section id={sections.plans}>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {p.items.map((plan, i) => {
            const highlighted = "highlighted" in plan && plan.highlighted;
            return (
              <Reveal key={i} index={i}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-[1.5rem] border p-7 transition-all duration-300 ease-luxe",
                    highlighted
                      ? "border-primary/30 bg-primary text-primary-foreground shadow-lift lg:-translate-y-3"
                      : "border-border bg-card hover:-translate-y-1 hover:shadow-soft",
                  )}
                >
                  {highlighted ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-accent-foreground shadow-soft">
                      {p.mostPopular}
                    </span>
                  ) : null}

                  <h3 className="font-serif text-2xl">{plan.name}</h3>
                  <p
                    className={cn(
                      "mt-1.5 text-sm",
                      highlighted ? "text-primary-foreground/75" : "text-muted-foreground",
                    )}
                  >
                    {plan.tagline}
                  </p>

                  <div
                    className={cn(
                      "my-6 h-px w-full",
                      highlighted ? "bg-primary-foreground/15" : "bg-border",
                    )}
                  />

                  <ul className="flex flex-1 flex-col gap-3">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            highlighted ? "text-accent" : "text-primary",
                          )}
                        />
                        <span
                          className={cn(
                            highlighted ? "text-primary-foreground/90" : "text-foreground/80",
                          )}
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`${base}#${sections.contact}`}
                    className={cn(
                      buttonVariants({
                        variant: highlighted ? "gold" : "outline",
                        size: "md",
                      }),
                      "mt-8 w-full",
                    )}
                  >
                    {p.cta}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-center text-sm text-muted-foreground">{p.perMonthNote}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
