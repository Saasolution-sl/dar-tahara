"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Star } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function Hero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const reduce = useReducedMotion();
  const h = dict.hero;
  const base = `/${locale}`;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const stats = [
    { value: h.stat1Value, label: h.stat1Label },
    { value: h.stat2Value, label: h.stat2Label },
    { value: h.stat3Value, label: h.stat3Label },
  ];

  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-32 lg:pb-32 lg:pt-40">
      <div className="wash pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        aria-hidden
      />

      <div className="container grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        {/* Copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6"
        >
          <motion.span variants={item} className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            {h.eyebrow}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-5 text-display-lg text-foreground"
          >
            {h.title}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            {h.subtitle}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href={`${base}#${sections.contact}`}
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              {h.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`${base}#${sections.plans}`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {h.ctaSecondary}
            </Link>
            <Link
              href={`${base}#${sections.why}`}
              className={cn(buttonVariants({ variant: "link", size: "lg" }))}
            >
              {h.ctaTertiary}
            </Link>
          </motion.div>

          <motion.dl
            variants={item}
            className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-serif text-2xl text-foreground sm:text-3xl">
                    {s.value}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Imagery */}
        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-6"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-lift sm:aspect-[5/5] lg:aspect-[4/5]">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
              alt={h.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent" />
          </div>

          {/* Floating trust cards */}
          <FloatingCard
            className="-left-4 bottom-8 sm:-left-8"
            delay={0.5}
            reduce={!!reduce}
            icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          >
            <span className="text-xs font-medium text-foreground">Vetted & insured team</span>
          </FloatingCard>
          <FloatingCard
            className="-right-3 top-10 sm:-right-6"
            delay={0.7}
            reduce={!!reduce}
            icon={
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </span>
            }
          >
            <span className="text-xs font-medium text-foreground">Loved by 500+ homes</span>
          </FloatingCard>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingCard({
  children,
  icon,
  className,
  delay,
  reduce,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  delay: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "absolute z-10 flex items-center gap-2.5 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-lift backdrop-blur-md",
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
        {icon}
      </span>
      {children}
    </motion.div>
  );
}
