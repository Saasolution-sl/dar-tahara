import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";
import { Section, Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import type { PeopleCommunityLinks } from "./cta-links";

export function PeopleCommunityClosing({
  copy,
  links,
  secondaryLabel,
}: {
  copy: Dictionary["peopleCommunity"]["closing"];
  links: PeopleCommunityLinks;
  secondaryLabel: string;
}) {
  return (
    <Section id="people-community-closing" className="bg-secondary/40">
      <Container>
        <Reveal>
          <div className="wash relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-16 text-center shadow-soft sm:px-12 sm:py-24">
            <span className="eyebrow justify-center">{copy.eyebrow}</span>
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-display-md text-foreground">
              {copy.title}
            </h2>

            {copy.body.map((paragraph, i) => (
              <p
                key={i}
                className={cn(
                  "mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg",
                  i === 0 ? "mt-8" : "mt-4",
                )}
              >
                {paragraph}
              </p>
            ))}

            <p className="mx-auto mt-10 max-w-2xl text-balance font-serif text-2xl leading-snug text-foreground sm:text-3xl">
              {copy.statement}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={links.primaryHref}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
              >
                {links.primaryLabel}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
              <Link
                href={links.secondaryHref}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
