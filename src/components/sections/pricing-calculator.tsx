"use client";

import * as React from "react";
import { Check, ArrowRight, Sparkles, Info, Package, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import {
  calculatePrice,
  formatEuro,
  frequencies,
  frequencyOrder,
  SIZE_LIMITS,
  CUSTOM_QUOTE_THRESHOLD_M2,
  type FrequencyKey,
} from "@/lib/pricing";
import {
  durationOrder,
  findDurationTier,
  applyDurationDiscount,
  type DurationTier,
  type DurationCode,
} from "@/lib/subscription-duration";
import type { DurationMonths } from "@/lib/assessment";
import { sections } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type { PublicFeatureState } from "@/lib/feature-flags";

type CalculatorDictionary = Pick<Dictionary, "calculator" | "booking">;

const LazyAssessmentBookingModal = React.lazy(async () => {
  const imported = await import("@/components/assessment/booking-modal");
  return { default: imported.AssessmentBookingModal };
});

function clampSize(n: number): number {
  return Math.min(Math.max(n, SIZE_LIMITS.min), SIZE_LIMITS.max);
}

export function PricingCalculator({
  locale,
  dict,
  features,
  durationTiers,
}: {
  locale: Locale;
  dict: CalculatorDictionary;
  features: PublicFeatureState;
  durationTiers: DurationTier[];
}) {
  const c = dict.calculator;

  const [size, setSize] = React.useState(68);
  const [sizeInput, setSizeInput] = React.useState("68");
  const [frequency, setFrequency] = React.useState<FrequencyKey>("biweekly");
  const [overMax, setOverMax] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  // No default duration: the customer must consciously select one.
  const [duration, setDuration] = React.useState<DurationMonths | null>(null);

  const result = React.useMemo(
    () => calculatePrice(size, frequency),
    [size, frequency],
  );

  const enabledDurationTiers = React.useMemo(
    () => [...durationTiers].filter((t) => t.enabled).sort((a, b) => a.displayOrder - b.displayOrder),
    [durationTiers],
  );

  const durationResult = React.useMemo(() => {
    if (result.status !== "ok" || duration === null) return null;
    const tier = findDurationTier(durationTiers, duration);
    if (!tier) return null;
    const monthlyCents = Math.round(result.monthlyTotal * 100);
    return { tier, ...applyDurationDiscount(monthlyCents, tier, durationTiers) };
  }, [result, duration, durationTiers]);

  // Properties over the 250 m² slider ceiling are quoted personally: the user
  // opts in via a toggle since the slider itself is capped at 250 m².
  const isCustom = overMax || size > CUSTOM_QUOTE_THRESHOLD_M2;
  const percent = ((size - SIZE_LIMITS.min) / (SIZE_LIMITS.max - SIZE_LIMITS.min)) * 100;

  function onSliderChange(value: number) {
    const clamped = clampSize(value);
    setSize(clamped);
    setSizeInput(String(clamped));
  }

  function onInputChange(raw: string) {
    // Keep only what a positive number could contain; drop letters/symbols.
    const sanitized = raw.replace(/[^\d.]/g, "");
    setSizeInput(sanitized);
    const n = Number(sanitized);
    if (sanitized.trim() !== "" && Number.isFinite(n)) {
      setSize(clampSize(n));
    }
  }

  function commitInput() {
    const n = Number(sizeInput);
    const next = Number.isFinite(n) && sizeInput.trim() !== "" ? clampSize(n) : size;
    setSize(next);
    setSizeInput(String(next));
  }

  function frequencyLabel(key: FrequencyKey) {
    return c.freq[key].name;
  }

  function openBooking() {
    if (!features.assessmentBookingEnabled || duration === null) return;
    setModalOpen(true);
  }

  React.useEffect(() => {
    function handleAssistantBooking() {
      setModalOpen(true);
    }

    window.addEventListener("dar-tahara:open-booking", handleAssistantBooking);

    const url = new URL(window.location.href);
    if (url.searchParams.get("assistant") === "book-assessment") {
      setModalOpen(true);
      url.searchParams.delete("assistant");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }

    return () => window.removeEventListener("dar-tahara:open-booking", handleAssistantBooking);
  }, []);

  return (
    <Section id={sections.calculator} className="bg-secondary/30">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
            {/* Controls */}
            <div className="flex flex-col gap-10">
              {/* Property size */}
              <div>
                <div className="flex items-end justify-between gap-4">
                  <label htmlFor="pc-size" className="text-sm font-semibold uppercase tracking-widest text-foreground">
                    {c.sizeLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="pc-size"
                      type="text"
                      inputMode="numeric"
                      value={overMax ? "250+" : sizeInput}
                      onChange={(e) => onInputChange(e.target.value)}
                      onBlur={commitInput}
                      disabled={overMax}
                      aria-label={`${c.sizeLabel} (${c.sizeUnit})`}
                      className="h-11 w-24 rounded-xl border border-border bg-background px-3 text-right font-serif text-lg text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    />
                    <span className="text-sm text-muted-foreground">{c.sizeUnit}</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={SIZE_LIMITS.min}
                  max={SIZE_LIMITS.max}
                  step={SIZE_LIMITS.step}
                  value={size}
                  onChange={(e) => onSliderChange(Number(e.target.value))}
                  disabled={overMax}
                  aria-label={c.sizeLabel}
                  aria-valuetext={`${size} ${c.sizeUnit}`}
                  className={cn("pc-range mt-5 w-full", overMax && "opacity-40")}
                  style={
                    {
                      "--pc-fill": `${percent}%`,
                    } as React.CSSProperties
                  }
                />
                <div className={cn("mt-2 flex justify-between text-xs text-muted-foreground", overMax && "opacity-40")}>
                  <span>{SIZE_LIMITS.min} {c.sizeUnit}</span>
                  <span>{c.sizeHelp}</span>
                  <span>{SIZE_LIMITS.max} {c.sizeUnit}</span>
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors hover:border-foreground/25 has-[:checked]:border-primary has-[:checked]:bg-primary/[0.04] dark:has-[:checked]:bg-primary/[0.08]">
                  <input
                    type="checkbox"
                    checked={overMax}
                    onChange={(e) => setOverMax(e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                  />
                  <span>{c.overMax}</span>
                </label>
              </div>

              {/* Frequency */}
              <fieldset>
                <legend className="text-sm font-semibold uppercase tracking-widest text-foreground">
                  {c.frequencyLabel}
                </legend>
                <div className="mt-4 grid gap-3">
                  {frequencyOrder.map((key) => {
                    const cfg = frequencies[key];
                    const meta = c.freq[key];
                    const selected = frequency === key;
                    return (
                      <label
                        key={key}
                        className={cn(
                          "group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-200",
                          "focus-within:ring-2 focus-within:ring-ring",
                          selected
                            ? "border-primary bg-primary/[0.04] dark:bg-primary/[0.08]"
                            : "border-border bg-card hover:border-foreground/25",
                        )}
                      >
                        <input
                          type="radio"
                          name="pc-frequency"
                          value={key}
                          checked={selected}
                          onChange={() => setFrequency(key)}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                          )}
                          aria-hidden
                        >
                          {selected ? <Check className="h-3 w-3" /> : null}
                        </span>
                        <span className="flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-serif text-base text-foreground">{meta.name}</span>
                            {cfg.recommended ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
                                <Sparkles className="h-3 w-3" />
                                {c.recommended}
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{meta.visits}</span>
                            <span aria-hidden>·</span>
                            <span className={cfg.discountPercentage > 0 ? "font-medium text-accent" : ""}>
                              {cfg.discountPercentage > 0
                                ? `${cfg.discountPercentage}% ${c.discountLabel}`
                                : c.noDiscount}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                            {meta.note}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Subscription duration */}
              <fieldset>
                <legend className="text-sm font-semibold uppercase tracking-widest text-foreground">
                  {c.durationLabel}
                </legend>
                <p className="mt-1 text-xs text-muted-foreground">{c.durationHelp}</p>
                {/* Square tiles in one row rather than stacked cards: the same
                    choice takes far less vertical space in the calculator. */}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-flow-col sm:auto-cols-fr sm:gap-3">
                  {enabledDurationTiers.map((tier) => {
                    const key = tier.code as DurationCode;
                    const meta = c.duration[key];
                    const selected = duration === tier.months;
                    return (
                      <label
                        key={tier.code}
                        className={cn(
                          "group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-all duration-200",
                          "focus-within:ring-2 focus-within:ring-ring",
                          selected
                            ? "border-primary bg-primary/[0.04] dark:bg-primary/[0.08]"
                            : "border-border bg-card hover:border-foreground/25",
                        )}
                      >
                        <input
                          type="radio"
                          name="pc-duration"
                          value={tier.code}
                          checked={selected}
                          onChange={() => setDuration(tier.months as DurationMonths)}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            "absolute right-1.5 top-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                          )}
                          aria-hidden
                        >
                          {selected ? <Check className="h-2.5 w-2.5" /> : null}
                        </span>
                        {tier.recommended ? (
                          <Sparkles className="absolute left-1.5 top-1.5 h-3.5 w-3.5 text-accent" aria-hidden />
                        ) : null}
                        <span className="font-serif text-sm leading-tight text-foreground sm:text-base">
                          {meta.name}
                        </span>
                        <span
                          className={cn(
                            "text-[0.65rem] font-medium leading-tight sm:text-xs",
                            tier.discountPercentage > 0 ? "text-accent" : "text-muted-foreground",
                          )}
                        >
                          {meta.tag}
                        </span>
                        {tier.recommended ? (
                          <span className="text-[0.55rem] font-semibold uppercase leading-none tracking-wider text-accent">
                            {c.duration.bestValue}
                          </span>
                        ) : null}
                        {tier.pauseEligible ? (
                          <span className="text-[0.55rem] font-semibold uppercase leading-none tracking-wider text-muted-foreground">
                            {c.duration.pauseBenefit}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {/* Result */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ResultPanel
                dict={dict}
                result={result}
                isCustom={isCustom}
                frequencyLabel={frequencyLabel(frequency)}
                durationResult={durationResult}
                durationSelected={duration !== null}
                onBook={openBooking}
                features={features}
              />
            </div>
          </div>
        </Reveal>

        {/* Disclaimer */}
        <Reveal delay={0.15}>
          <div className="mx-auto mt-10 max-w-3xl border-t border-border pt-6">
            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <span>{c.disclaimer}</span>
            </p>
            <p className="mt-3 pl-[1.375rem] text-xs leading-relaxed text-muted-foreground/85">
              {c.optionalNote}
            </p>
          </div>
        </Reveal>
      </Container>

      {features.assessmentBookingEnabled && modalOpen ? (
        <React.Suspense fallback={null}>
          <LazyAssessmentBookingModal
            open
            onClose={() => setModalOpen(false)}
            locale={locale}
            dict={dict}
            sizeM2={size}
            frequency={frequency}
            overMax={isCustom}
            durationMonths={duration}
            durationTiers={durationTiers}
            monthlyEnabled={features.monthlySubscriptionEnabled}
            annualEnabled={features.annualSubscriptionEnabled}
          />
        </React.Suspense>
      ) : null}
    </Section>
  );
}

type DurationResult = { tier: DurationTier } & ReturnType<typeof applyDurationDiscount>;

function ResultPanel({
  dict,
  result,
  isCustom,
  frequencyLabel,
  durationResult,
  durationSelected,
  onBook,
  features,
}: {
  dict: CalculatorDictionary;
  result: ReturnType<typeof calculatePrice>;
  isCustom: boolean;
  frequencyLabel: string;
  durationResult: DurationResult | null;
  durationSelected: boolean;
  onBook: () => void;
  features: PublicFeatureState;
}) {
  const c = dict.calculator;

  if (isCustom || result.status !== "ok") {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{c.result.heading}</p>
        <h3 className="mt-4 font-serif text-2xl text-foreground">{c.custom.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.custom.body}</p>
        <Link
          href={features.assessmentBookingEnabled ? "#calculator" : features.fallbackUrl}
          className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-8 w-full")}
        >
          {features.assessmentBookingEnabled ? c.cta.book : features.fallbackLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const irregular = result.irregular;

  const rows = irregular
    ? [
        { label: c.result.propertySize, value: `${result.sizeM2} ${c.sizeUnit}` },
        { label: c.result.frequency, value: frequencyLabel },
        // Show the base price only when a surcharge follows, so the maths reads clearly.
        ...(result.areaSurcharge > 0
          ? [{ label: c.result.pricePerCleaning, value: formatEuro(result.pricePerVisit) }]
          : []),
      ]
    : [
        { label: c.result.propertySize, value: `${result.sizeM2} ${c.sizeUnit}` },
        { label: c.result.pricePerCleaning, value: formatEuro(result.pricePerVisit) },
        { label: c.result.frequency, value: frequencyLabel },
        {
          label: c.result.visits,
          value: c.result.visitsValue.replace("{n}", String(result.visitsPerMonth)),
        },
        { label: c.result.subtotal, value: formatEuro(result.subtotal) },
      ];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">{c.result.heading}</p>

      <dl className="mt-5 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium text-foreground">{row.value}</dd>
          </div>
        ))}

        {result.discountPercentage > 0 ? (
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">
              {c.result.discount} · {result.discountPercentage}%
            </dt>
            <dd className="font-medium text-accent">−{formatEuro(result.discountAmount)}</dd>
          </div>
        ) : null}

        {result.areaSurcharge > 0 ? (
          <div className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">
              {c.result.areaSurcharge} · {result.extraM2} {c.sizeUnit} × {formatEuro(result.extraRatePerM2, true)}
            </dt>
            <dd className="font-medium text-foreground">+{formatEuro(result.areaSurcharge)}</dd>
          </div>
        ) : null}

        {!irregular && durationResult ? (
          <>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-2.5 text-sm">
              <dt className="text-muted-foreground">{c.result.contractDuration}</dt>
              <dd className="font-medium text-foreground">{c.duration[durationResult.tier.code as DurationCode].name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">{c.result.priceBeforeDuration}</dt>
              <dd className="font-medium text-foreground">
                {formatEuro(durationResult.priceBeforeDurationDiscountCents / 100)}
              </dd>
            </div>
            {durationResult.durationDiscountAmountCents > 0 ? (
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">
                  {c.result.durationDiscount}
                  {" · "}
                  {Math.round(
                    (durationResult.durationDiscountAmountCents / durationResult.priceBeforeDurationDiscountCents) * 100,
                  )}%
                </dt>
                <dd className="font-medium text-accent">
                  −{formatEuro(durationResult.durationDiscountAmountCents / 100)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">{c.result.minimumContractValue}</dt>
              <dd className="font-medium text-foreground">
                {formatEuro(durationResult.minimumContractValueCents / 100)}
              </dd>
            </div>
          </>
        ) : null}
      </dl>

      {/* Prominent headline price */}
      <div className="mt-6 border-t border-border pt-6">
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {irregular ? c.result.pricePerWeek : c.result.monthlyTotal}
          </span>
          {!irregular && durationResult && durationResult.durationDiscountAmountCents > 0 ? (
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
              {c.result.durationSavings} {formatEuro(durationResult.durationDiscountAmountCents / 100)}
            </span>
          ) : !irregular && !durationResult && result.discountAmount > 0 ? (
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
              {c.result.youSave} {formatEuro(result.discountAmount)}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span
            key={durationResult ? durationResult.discountedMonthlyCents : result.monthlyTotal}
            className="animate-price-in font-serif text-5xl tracking-tight text-foreground"
          >
            {formatEuro(durationResult ? durationResult.discountedMonthlyCents / 100 : result.monthlyTotal)}
          </span>
          <span className="text-sm text-muted-foreground">
            {irregular ? c.result.perWeek : c.result.perMonth}
          </span>
        </div>
        {!irregular ? (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {c.result.effective}: <span className="text-foreground">{formatEuro(result.effectivePricePerVisit, true)}</span>
          </p>
        ) : null}
        {irregular ? (
          <p className="mt-3 flex gap-2 rounded-xl bg-secondary/60 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>{c.materialsNote}</span>
          </p>
        ) : null}
        {!irregular && durationResult?.tier.pauseEligible ? (
          <p className="mt-3 flex gap-2 rounded-xl bg-secondary/60 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>{c.result.pauseBenefitNote}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-7">
        {!durationSelected ? (
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{c.result.chooseDuration}</p>
        ) : null}
        {features.assessmentBookingEnabled ? <button
          type="button" onClick={onBook} disabled={!durationSelected}
          className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full disabled:cursor-not-allowed disabled:opacity-50")}
        >
          {c.cta.book}
          <ArrowRight className="h-4 w-4" />
        </button> : <><p className="mb-4 text-sm leading-relaxed text-muted-foreground">{features.disabledMessage}</p><Link href={features.fallbackUrl} className={cn(buttonVariants({variant:"primary",size:"lg"}),"w-full")}>{features.fallbackLabel}<ArrowRight className="h-4 w-4" /></Link></>}
      </div>
    </div>
  );
}
