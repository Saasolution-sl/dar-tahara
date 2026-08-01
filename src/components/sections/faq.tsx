import { Plus } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

export function Faq({ dict }: { dict: Dictionary }) {
  const f = dict.faq;

  return (
    <Section id={sections.faq} className="bg-secondary/30">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow={f.eyebrow} title={f.title} />
          </Reveal>

          <div className="mt-12 divide-y divide-border rounded-[1.5rem] border border-border bg-card">
            {f.items.map((item, i) => (
              <details key={item.q} open={i === 0} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-start transition-colors hover:bg-secondary/40 sm:px-8 [&::-webkit-details-marker]:hidden">
                  <span className="font-serif text-lg text-foreground">{item.q}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-all duration-300 ease-luxe group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground">
                    <Plus className="h-4 w-4" aria-hidden />
                  </span>
                </summary>
                <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground sm:px-8">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
