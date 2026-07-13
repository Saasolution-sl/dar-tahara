import * as React from "react";
import { Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { SubscribeForm } from "@/components/mailing-list/subscribe-form";

/** Pre-launch email capture, near the foot of the homepage. */
export function LaunchSignup({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const m = dict.mailing;
  return (
    <section id="launch" className="py-20 sm:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-border bg-secondary/40 px-6 py-14 text-center sm:px-12">
            <span className="eyebrow justify-center">
              <Sparkles className="h-3.5 w-3.5" />
              {m.footerEyebrow}
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl text-display-md text-foreground">{m.footerTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {m.footerBody}
            </p>
            <div className="mx-auto mt-8 max-w-md text-start">
              <SubscribeForm locale={locale} dict={m} source="homepage_footer" />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
