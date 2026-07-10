"use client";

import * as React from "react";
import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";

// Genuine before → after pairs: a cluttered/soiled "before" and a clean,
// bright "after" for each room type (matched to gallery labels below).
const pairs = [
  {
    // Living room restoration: cluttered, overflowing room → styled clean living room
    before: "https://images.unsplash.com/photo-1556866149-a42ffe6478ea?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1632119580908-ae947d4c7691?auto=format&fit=crop&w=900&q=80",
  },
  {
    // Kitchen deep clean: greasy, used pans on the hob → spotless modern kitchen
    before: "https://images.unsplash.com/photo-1581622558638-818128465982?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
  },
  {
    // Master suite refresh: dim, unmade bedroom → bright, freshly made master suite
    before: "https://images.unsplash.com/photo-1782811560121-c81fcd02d5bd?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1631048501786-4e97f20eac71?auto=format&fit=crop&w=900&q=80",
  },
];

export function Gallery({ dict }: { dict: Dictionary }) {
  const g = dict.gallery;
  return (
    <Section id={sections.gallery}>
      <Container>
        <Reveal>
          <SectionHeading eyebrow={g.eyebrow} title={g.title} subtitle={g.subtitle} />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {g.items.map((item, i) => (
            <Reveal key={i} index={i}>
              <BeforeAfter
                before={pairs[i].before}
                after={pairs[i].after}
                label={item.label}
                beforeLabel={g.before}
                afterLabel={g.after}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function BeforeAfter({
  before,
  after,
  label,
  beforeLabel,
  afterLabel,
}: {
  before: string;
  after: string;
  label: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  const [value, setValue] = React.useState(50);

  return (
    <figure>
      <div className="group relative aspect-[4/3] w-full select-none overflow-hidden rounded-[1.5rem] border border-border shadow-soft">
        {/* After (base) */}
        <Image src={after} alt={`${label} — ${afterLabel}`} fill sizes="(max-width:1024px) 100vw, 33vw" className="object-cover" />
        <span className="absolute end-3 top-3 rounded-full bg-primary/85 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-widest text-primary-foreground backdrop-blur-sm">
          {afterLabel}
        </span>

        {/* Before (clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <Image src={before} alt={`${label} — ${beforeLabel}`} fill sizes="(max-width:1024px) 100vw, 33vw" className="object-cover" />
          <span className="absolute start-3 top-3 rounded-full bg-charcoal/70 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-widest text-stone-50 backdrop-blur-sm">
            {beforeLabel}
          </span>
        </div>

        {/* Divider handle */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-stone-50 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
          style={{ left: `${value}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-stone-50 text-charcoal shadow-lift">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={`${label}: reveal before and after`}
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">{label}</figcaption>
    </figure>
  );
}
