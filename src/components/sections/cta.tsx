import * as React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { DomeMark } from "@/components/brand/logo";

export function Cta({ dict }: { locale: Locale; dict: Dictionary }) {
  const c = dict.cta;
  return (
    <section id={sections.contact} className="py-20 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <div className="wash relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-16 text-center shadow-soft sm:px-12 sm:py-24">
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
              aria-hidden
            />
            <DomeMark className="mx-auto h-10 w-10 text-accent" />

            <span className="eyebrow mt-6 justify-center">{c.eyebrow}</span>
            <h2 className="mx-auto mt-4 max-w-3xl text-display-md text-foreground">
              {c.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {c.subtitle}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#"
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
              >
                {c.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                {c.ctaSecondary}
              </Link>
              <Link
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "gold", size: "lg" }))}
              >
                <MessageCircle className="h-4 w-4" />
                {c.whatsapp}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
