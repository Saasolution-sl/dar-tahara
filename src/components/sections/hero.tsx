import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Star } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { sections } from "@/lib/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { PublicFeatureState } from "@/lib/feature-flags";

export function Hero({
  locale,
  dict,
  features,
}: {
  locale: Locale;
  dict: Dictionary;
  features: PublicFeatureState;
}) {
  const h = dict.hero;
  const base = `/${locale}`;

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
        <div className="lg:col-span-6">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            {h.eyebrow}
          </span>

          <h1 className="mt-5 text-display-lg text-foreground">
            {h.title}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {h.subtitle}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={features.assessmentBookingEnabled ? `${base}#${sections.calculator}` : features.fallbackUrl}
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              {features.assessmentBookingEnabled ? h.ctaPrimary : features.fallbackLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {dict.nav.login}
            </Link>
            <Link
              href={`${base}#${sections.why}`}
              className={cn(buttonVariants({ variant: "link", size: "lg" }))}
            >
              {h.ctaTertiary}
            </Link>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
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
          </dl>
        </div>

        {/* Imagery */}
        <div className="relative lg:col-span-6">
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
            icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          >
            <span className="text-xs font-medium text-foreground">Vetted & insured team</span>
          </FloatingCard>
          <FloatingCard
            className="-right-3 top-10 sm:-right-6"
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
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  children,
  icon,
  className,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute z-10 flex items-center gap-2.5 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-lift backdrop-blur-md",
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
        {icon}
      </span>
      {children}
    </div>
  );
}
