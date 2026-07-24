import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Briefcase,
  CalendarCheck,
  Check,
  Compass,
  Cpu,
  FileCheck2,
  FileDigit,
  GraduationCap,
  HardHat,
  HeartHandshake,
  HeartPulse,
  Gem,
  Leaf,
  Lock,
  Recycle,
  ReceiptText,
  Route,
  Scale,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import type { PublicFeatureState } from "@/lib/feature-flags";

const valueIcons = [ShieldCheck, Gem, HeartHandshake, Sparkles, GraduationCap, Leaf];
const promiseIcons = [GraduationCap, ReceiptText, Lock, CalendarCheck, Cpu, TrendingUp];
// Order matches missionVision.people.items: formal employment, CNSS registration,
// AMO health coverage, clear conditions, development, safe methods, equal
// opportunity, respectful treatment.
const peopleIcons = [
  FileCheck2,
  ShieldCheck,
  HeartPulse,
  ReceiptText,
  GraduationCap,
  HardHat,
  Scale,
  HeartHandshake,
];
const impactIcons = [Briefcase, GraduationCap, Scale, Store, Award, ShieldCheck, TrendingUp];
const sustainabilityIcons = [Route, Leaf, FileDigit, Recycle, Sprout];

export function MissionVision({
  locale,
  dict,
  features,
}: {
  locale: Locale;
  dict: Dictionary;
  features: PublicFeatureState;
}) {
  const mv = dict.missionVision;
  const base = `/${locale}`;
  const bookHref = features.assessmentBookingEnabled
    ? `${base}#${sections.calculator}`
    : features.fallbackUrl;
  const bookLabel = features.assessmentBookingEnabled
    ? mv.hero.ctaPrimary
    : features.fallbackLabel;
  const servicesHref = `${base}#${sections.services}`;

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-40">
        <div className="wash pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <Container>
          <Breadcrumbs
            label={mv.breadcrumb.label}
            items={[
              { label: mv.breadcrumb.home, href: base },
              { label: mv.breadcrumb.current },
            ]}
          />

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <Reveal>
                <span className="eyebrow">
                  <Compass className="h-3.5 w-3.5" aria-hidden />
                  {mv.hero.eyebrow}
                </span>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-5 text-display-lg text-foreground">{mv.hero.title}</h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {mv.hero.subtitle}
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href={bookHref} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                    {bookLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href={servicesHref}
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                  >
                    {mv.hero.ctaSecondary}
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={0.1}>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-lift sm:aspect-[16/10]">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                    alt={mv.hero.imageAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Mission */}
      <Section id="mission" className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionHeading
                  align="left"
                  eyebrow={mv.mission.eyebrow}
                  title={mv.mission.title}
                />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={0.1}>
                <p className="font-serif text-2xl leading-snug text-foreground sm:text-[1.75rem]">
                  {mv.mission.lead}
                </p>
              </Reveal>
              <div className="mt-7 space-y-5">
                {mv.mission.body.map((paragraph, i) => (
                  <Reveal key={i} index={i} delay={0.15}>
                    <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {paragraph}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Vision */}
      <Section id="vision" bleed>
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 text-primary-foreground shadow-lift sm:px-12 sm:py-20 lg:px-16">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                  background:
                    "radial-gradient(55% 60% at 15% 20%, hsl(var(--accent)), transparent 60%), radial-gradient(45% 55% at 85% 75%, hsl(var(--accent)), transparent 55%)",
                }}
                aria-hidden
              />
              <div className="relative mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
                  <Target className="h-3.5 w-3.5" aria-hidden />
                  {mv.vision.eyebrow}
                </span>
                <h2 className="mt-5 text-display-md">{mv.vision.title}</h2>
                <p className="mt-7 font-serif text-xl leading-snug text-primary-foreground/95 sm:text-2xl">
                  {mv.vision.lead}
                </p>
                {mv.vision.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="mt-6 text-base leading-relaxed text-primary-foreground/80 sm:text-lg"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Values */}
      <Section id="values">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={mv.values.eyebrow}
              title={mv.values.title}
              subtitle={mv.values.subtitle}
            />
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {mv.values.items.map((item, i) => {
              const Icon = valueIcons[i] ?? ShieldCheck;
              return (
                <Reveal key={item.title} index={i} className="h-full">
                  <div className="group flex h-full flex-col gap-4 bg-card p-8 transition-colors duration-300 hover:bg-secondary/50 sm:p-10">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-transform duration-300 ease-luxe group-hover:-translate-y-0.5">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="font-serif text-xl text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- Promises */}
      <Section id="promises" className="bg-secondary/40">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={mv.promises.eyebrow}
              title={mv.promises.title}
              subtitle={mv.promises.subtitle}
            />
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {mv.promises.items.map((item, i) => {
              const Icon = promiseIcons[i] ?? ShieldCheck;
              return (
                <Reveal key={item.title} index={i}>
                  <div className="flex h-full flex-col gap-4 rounded-[1.5rem] border border-border bg-card p-8 shadow-soft transition-shadow duration-300 ease-luxe hover:shadow-lift">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- Inclusion */}
      <Section id="inclusion">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <span className="eyebrow">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {mv.inclusion.eyebrow}
                </span>
                <h2 className="mt-4 text-display-md text-foreground">{mv.inclusion.title}</h2>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-5 border-s-2 border-accent/30 ps-6 sm:ps-8">
                {mv.inclusion.body.map((paragraph, i) => (
                  <Reveal key={i} index={i}>
                    <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {paragraph}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- People */}
      <Section id="people">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={mv.people.eyebrow}
              title={mv.people.title}
              subtitle={mv.people.subtitle}
            />
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {mv.people.items.map((item, i) => {
              const Icon = peopleIcons[i] ?? HeartPulse;
              return (
                <Reveal key={item.title} index={i} className="min-w-0">
                  <div className="flex h-full items-start gap-5 rounded-[1.5rem] border border-accent/25 bg-card p-8 shadow-soft transition-shadow duration-300 ease-luxe hover:shadow-lift sm:p-9">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="break-words font-serif text-lg text-foreground">{item.title}</h3>
                      <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal>
            <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
              {mv.people.clarification}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Impact */}
      <Section id="impact" className="bg-secondary/40">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={mv.impact.eyebrow}
              title={mv.impact.title}
              subtitle={mv.impact.subtitle}
            />
          </Reveal>

          <ul className="mt-14 grid gap-6 lg:grid-cols-2">
            {mv.impact.items.map((item, i) => {
              const Icon = impactIcons[i] ?? Check;
              return (
                <Reveal as="li" key={item} index={i} className="h-full">
                  <div className="flex h-full items-start gap-4 rounded-[1.25rem] border border-border bg-card p-6">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* --------------------------------------------------------- Comparison */}
      <Section id="comparison">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={mv.comparison.eyebrow}
              title={mv.comparison.title}
              subtitle={mv.comparison.subtitle}
            />
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Traditional */}
            <Reveal>
              <div className="h-full rounded-[1.75rem] border border-border bg-card/60 p-8 sm:p-10">
                <h3 className="font-serif text-xl text-muted-foreground">
                  {mv.comparison.traditionalTitle}
                </h3>
                <ul className="mt-7 space-y-4">
                  {mv.comparison.traditional.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground">
                        <X className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Dar Tahara */}
            <Reveal delay={0.1}>
              <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-accent/30 bg-card p-8 shadow-lift sm:p-10">
                <div
                  className="pointer-events-none absolute inset-0 -z-10 opacity-60"
                  style={{
                    background:
                      "radial-gradient(60% 50% at 80% 0%, hsl(var(--accent) / 0.10), transparent 60%)",
                  }}
                  aria-hidden
                />
                <h3 className="font-serif text-xl text-foreground">{mv.comparison.brandTitle}</h3>
                <ul className="mt-7 space-y-4">
                  {mv.comparison.brand.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="text-sm leading-relaxed text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------- Sustainability */}
      <Section id="sustainability" className="bg-secondary/40">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionHeading
                  align="left"
                  eyebrow={mv.sustainability.eyebrow}
                  title={mv.sustainability.title}
                  subtitle={mv.sustainability.subtitle}
                />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <ul className="grid gap-px overflow-hidden rounded-[1.5rem] border border-border bg-border">
                {mv.sustainability.items.map((item, i) => {
                  const Icon = sustainabilityIcons[i] ?? Leaf;
                  return (
                    <Reveal as="li" key={item.title} index={i}>
                      <div className="flex items-start gap-5 bg-card p-6 sm:p-7">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <h3 className="font-serif text-lg text-foreground">{item.title}</h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Closing */}
      <Section id="closing">
        <Container>
          <Reveal>
            <div className="wash relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-16 text-center shadow-soft sm:px-12 sm:py-24">
              <span className="eyebrow justify-center">{mv.closing.eyebrow}</span>
              <h2 className="mx-auto mt-4 max-w-3xl text-display-md text-foreground">
                {mv.closing.title}
              </h2>
              {mv.closing.body.map((paragraph, i) => (
                <p
                  key={i}
                  className={cn(
                    "mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg",
                    i === 0 ? "mt-6" : "mt-4",
                  )}
                >
                  {paragraph}
                </p>
              ))}
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href={bookHref} className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                  {features.assessmentBookingEnabled ? mv.closing.ctaPrimary : features.fallbackLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href={servicesHref}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  {mv.closing.ctaSecondary}
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
