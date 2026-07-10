"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Faq({ dict }: { dict: Dictionary }) {
  const f = dict.faq;
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <Section id={sections.faq} className="bg-secondary/30">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow={f.eyebrow} title={f.title} />
          </Reveal>

          <div className="mt-12 divide-y divide-border rounded-[1.5rem] border border-border bg-card">
            {f.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start transition-colors hover:bg-secondary/40 sm:px-8"
                    >
                      <span className="font-serif text-lg text-foreground">{item.q}</span>
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-all duration-300 ease-luxe",
                          isOpen && "rotate-45 bg-primary text-primary-foreground",
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground sm:px-8">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
