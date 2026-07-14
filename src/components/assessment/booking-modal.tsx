"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, Loader2, Lock, KeyRound, Wifi } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import type { FrequencyKey } from "@/lib/pricing";
import {
  calculateAssessmentQuote,
  DOORLOCK_INSTALLATION_PRICE_CENTS,
  formatMoneyFromCents,
  type BillingInterval,
  type PropertyCondition,
  type TimeSlot,
} from "@/lib/assessment";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Status = "idle" | "submitting";
type ErrorKey = keyof Dictionary["booking"]["errors"];

const CONDITIONS: PropertyCondition[] = ["excellent", "standard", "needs_attention", "heavy"];
const TIME_SLOTS: TimeSlot[] = ["morning", "afternoon", "flexible"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AssessmentBookingModal({
  open,
  onClose,
  locale,
  dict,
  sizeM2: initialSize,
  frequency,
  overMax,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  dict: Dictionary;
  sizeM2: number;
  frequency: FrequencyKey;
  overMax: boolean;
}) {
  const b = dict.booking;
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  const [sizeM2, setSizeM2] = React.useState(initialSize);
  const [billingInterval, setBillingInterval] = React.useState<BillingInterval>("monthly");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorKey, setErrorKey] = React.useState<ErrorKey | null>(null);
  const [invalidFields, setInvalidFields] = React.useState<Set<string>>(new Set());

  const [form, setForm] = React.useState({
    fullName: "", email: "", phone: "",
    addressLine1: "", addressLine2: "", city: "", postalCode: "", countryCode: "MA",
    bedrooms: "", bathrooms: "",
    condition: "standard" as PropertyCondition,
    pets: false, petDetails: "", smoking: false, accessNotes: "",
    doorlockInstallationRequested: false, doorlockInternetConfirmed: false,
    preferredDate: "", alternateDate: "", timeSlot: "flexible" as TimeSlot,
    accuracy: false, terms: false,
  });

  React.useEffect(() => {
    if (open) setSizeM2(initialSize);
  }, [open, initialSize]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const effectiveOverMax = overMax || sizeM2 > 250;
  const quote = React.useMemo(
    () => calculateAssessmentQuote(sizeM2, frequency, effectiveOverMax, form.doorlockInstallationRequested),
    [sizeM2, frequency, effectiveOverMax, form.doorlockInstallationRequested],
  );

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setInvalidFields((prev) => {
      if (!prev.has(key as string)) return prev;
      const next = new Set(prev);
      next.delete(key as string);
      return next;
    });
  }

  function validate(): boolean {
    const missing = new Set<string>();
    if (!form.fullName.trim()) missing.add("fullName");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) missing.add("email");
    if (!form.phone.trim()) missing.add("phone");
    if (!form.addressLine1.trim()) missing.add("addressLine1");
    if (!form.city.trim()) missing.add("city");
    if (form.bedrooms === "" || Number(form.bedrooms) < 0) missing.add("bedrooms");
    if (form.bathrooms === "" || Number(form.bathrooms) < 0) missing.add("bathrooms");
    if (!form.preferredDate) missing.add("preferredDate");
    if (form.pets && !form.petDetails.trim()) missing.add("petDetails");
    if (form.doorlockInstallationRequested && !form.doorlockInternetConfirmed) missing.add("doorlockInternetConfirmed");
    if (!form.accuracy) missing.add("accuracy");
    if (!form.terms) missing.add("terms");
    setInvalidFields(missing);
    if (missing.size > 0) {
      setErrorKey(
        missing.has("accuracy") || missing.has("terms")
          ? "legal_acceptance_required"
          : missing.has("doorlockInternetConfirmed")
            ? "doorlock_internet_required"
          : missing.has("petDetails")
            ? "pet_details_required"
            : missing.has("fullName") || missing.has("email") || missing.has("phone")
              ? "invalid_customer"
              : "invalid_property",
      );
      return false;
    }
    setErrorKey(null);
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/assessment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || null,
          city: form.city,
          postalCode: form.postalCode || null,
          countryCode: form.countryCode,
          sizeM2,
          overMax: effectiveOverMax,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          pets: form.pets,
          petDetails: form.pets ? form.petDetails : null,
          smoking: form.smoking,
          condition: form.condition,
          accessNotes: form.accessNotes || null,
          frequency,
          billingInterval,
          preferredDate: form.preferredDate,
          alternateDate: form.alternateDate || null,
          timeSlot: form.timeSlot,
          doorlockInstallationRequested: form.doorlockInstallationRequested,
          doorlockInternetConfirmed: form.doorlockInternetConfirmed,
          propertyAccuracyAccepted: form.accuracy,
          termsAccepted: form.terms,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { checkoutUrl?: string; error?: string };
      if (res.ok && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setStatus("idle");
      const known: ErrorKey[] = [
        "invalid_customer", "invalid_property", "invalid_booking", "pet_details_required",
        "doorlock_internet_required", "legal_acceptance_required", "rate_limited", "checkout_not_configured", "checkout_failed",
      ];
      setErrorKey(known.includes(data.error as ErrorKey) ? (data.error as ErrorKey) : "checkout_failed");
    } catch {
      setStatus("idle");
      setErrorKey("network");
    }
  }

  const invalid = (f: string) => invalidFields.has(f);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[85] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-lift sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h2 id={titleId} className="font-serif text-xl text-foreground sm:text-2xl">{b.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={b.close}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} noValidate className="no-scrollbar flex-1 overflow-y-auto px-6 py-5">
              {/* Selection summary */}
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{b.summary.heading}</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row label={b.summary.propertySize} value={`${sizeM2} m²`} />
                  <Row label={b.summary.frequency} value={dict.calculator.freq[frequency].name} />
                  <Row
                    label={b.summary.estMonthly}
                    value={quote.estimatedMonthlyCents === null ? "—" : formatMoneyFromCents(quote.estimatedMonthlyCents, locale)}
                  />
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
                    <dt className="font-medium text-foreground">{b.summary.assessment}</dt>
                    <dd className="font-serif text-lg text-foreground">{formatMoneyFromCents(quote.assessmentPriceCents, locale)}</dd>
                  </div>
                  {form.doorlockInstallationRequested ? (
                    <Row
                      label={b.summary.doorlockInstallation}
                      value={formatMoneyFromCents(quote.doorlockInstallationPriceCents, locale)}
                    />
                  ) : null}
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
                    <dt className="font-medium text-foreground">{b.summary.dueToday}</dt>
                    <dd className="font-serif text-lg text-foreground">{formatMoneyFromCents(quote.dueTodayCents, locale)}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-muted-foreground">{b.summary.fromAfterAssessment}</p>
              </div>

              {/* Billing interval */}
              <Fieldset legend={b.billing.label}>
                <div className="grid grid-cols-2 gap-3">
                  {(["monthly", "annual"] as BillingInterval[]).map((interval) => {
                    const selected = billingInterval === interval;
                    return (
                      <button
                        type="button"
                        key={interval}
                        onClick={() => setBillingInterval(interval)}
                        className={cn(
                          "flex flex-col items-start gap-0.5 rounded-xl border p-4 text-left transition-all",
                          selected ? "border-primary bg-primary/[0.04] dark:bg-primary/[0.08]" : "border-border hover:border-foreground/25",
                        )}
                        aria-pressed={selected}
                      >
                        <span className="flex items-center gap-2 font-serif text-base text-foreground">
                          {interval === "monthly" ? b.billing.monthly : b.billing.annual}
                          {interval === "annual" ? (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
                              {b.billing.save}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {interval === "monthly" ? b.billing.monthlyNote : b.billing.annualNote}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Fieldset>

              {/* Visit */}
              <Fieldset legend={b.steps.visit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label={b.visit.preferredDate} required error={invalid("preferredDate")}>
                    <input type="date" min={todayISO()} value={form.preferredDate}
                      onChange={(e) => set("preferredDate", e.target.value)} className={inputCls(invalid("preferredDate"))} />
                  </Field>
                  <Field label={b.visit.alternateDate}>
                    <input type="date" min={todayISO()} value={form.alternateDate}
                      onChange={(e) => set("alternateDate", e.target.value)} className={inputCls(false)} />
                  </Field>
                  <Field label={b.visit.timeSlot} className="sm:col-span-2">
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button type="button" key={slot} onClick={() => set("timeSlot", slot)} aria-pressed={form.timeSlot === slot}
                          className={cn("rounded-xl border px-3 py-2.5 text-sm transition-colors",
                            form.timeSlot === slot ? "border-primary bg-primary/[0.04] text-foreground dark:bg-primary/[0.08]" : "border-border text-muted-foreground hover:border-foreground/25")}>
                          {b.visit[slot]}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </Fieldset>

              {/* Home */}
              <Fieldset legend={b.steps.home}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label={`${b.fields.size} (m²)`} required error={invalid("sizeM2")}>
                    <input type="number" min={20} value={sizeM2}
                      onChange={(e) => setSizeM2(Math.max(20, Number(e.target.value) || 20))} className={inputCls(false)} />
                  </Field>
                  <Field label={b.fields.condition}>
                    <select value={form.condition} onChange={(e) => set("condition", e.target.value as PropertyCondition)} className={inputCls(false)}>
                      {CONDITIONS.map((cond) => <option key={cond} value={cond}>{b.condition[cond]}</option>)}
                    </select>
                  </Field>
                  <Field label={b.fields.bedrooms} required error={invalid("bedrooms")}>
                    <input type="number" min={0} value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className={inputCls(invalid("bedrooms"))} />
                  </Field>
                  <Field label={b.fields.bathrooms} required error={invalid("bathrooms")}>
                    <input type="number" min={0} step="0.5" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} className={inputCls(invalid("bathrooms"))} />
                  </Field>
                  <Field label={b.fields.accessNotes} className="sm:col-span-2">
                    <textarea rows={2} value={form.accessNotes} onChange={(e) => set("accessNotes", e.target.value)}
                      placeholder={b.fields.accessNotesPlaceholder} className={cn(inputCls(false), "h-auto py-2.5")} />
                  </Field>
                  <label className="flex items-center gap-2.5 text-sm text-foreground sm:col-span-2">
                    <input type="checkbox" checked={form.pets} onChange={(e) => set("pets", e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                    {b.fields.pets}
                  </label>
                  {form.pets ? (
                    <Field label={b.fields.petDetails} required error={invalid("petDetails")} className="sm:col-span-2">
                      <input type="text" value={form.petDetails} onChange={(e) => set("petDetails", e.target.value)}
                        placeholder={b.fields.petDetailsPlaceholder} className={inputCls(invalid("petDetails"))} />
                    </Field>
                  ) : null}
                  <label className="flex items-center gap-2.5 text-sm text-foreground sm:col-span-2">
                    <input type="checkbox" checked={form.smoking} onChange={(e) => set("smoking", e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                    {b.fields.smoking}
                  </label>
                </div>
              </Fieldset>

              {/* Details */}
              <Fieldset legend={b.steps.details}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label={b.fields.fullName} required error={invalid("fullName")}>
                    <input type="text" autoComplete="name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputCls(invalid("fullName"))} />
                  </Field>
                  <Field label={b.fields.email} required error={invalid("email")}>
                    <input type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls(invalid("email"))} />
                  </Field>
                  <Field label={b.fields.phone} required error={invalid("phone")}>
                    <input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls(invalid("phone"))} />
                  </Field>
                  <Field label={b.fields.city} required error={invalid("city")}>
                    <input type="text" autoComplete="address-level2" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls(invalid("city"))} />
                  </Field>
                  <Field label={b.fields.addressLine1} required error={invalid("addressLine1")} className="sm:col-span-2">
                    <input type="text" autoComplete="address-line1" value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} className={inputCls(invalid("addressLine1"))} />
                  </Field>
                  <Field label={b.fields.addressLine2}>
                    <input type="text" autoComplete="address-line2" value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} className={inputCls(false)} />
                  </Field>
                  <Field label={b.fields.postalCode}>
                    <input type="text" autoComplete="postal-code" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={inputCls(false)} />
                  </Field>
                </div>
              </Fieldset>

              {/* Door lock installation add-on */}
              <Fieldset legend={b.doorlock.title}>
                <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.doorlockInstallationRequested}
                      onChange={(e) => {
                        set("doorlockInstallationRequested", e.target.checked);
                        if (!e.target.checked) set("doorlockInternetConfirmed", false);
                      }}
                      className="mt-1 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                    />
                    <span>
                      <span className="flex flex-wrap items-center gap-2 font-serif text-base text-foreground">
                        <KeyRound className="h-4 w-4 text-primary" />
                        {b.doorlock.label}
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-accent">
                          {formatMoneyFromCents(DOORLOCK_INSTALLATION_PRICE_CENTS, locale)}
                        </span>
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{b.doorlock.body}</span>
                      <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{b.doorlock.benefit}</span>
                    </span>
                  </label>
                  {form.doorlockInstallationRequested ? (
                    <label
                      className={cn(
                        "mt-4 flex items-start gap-3 rounded-xl border p-3 text-sm",
                        invalid("doorlockInternetConfirmed") ? "border-red-500/70 text-red-600 dark:text-red-400" : "border-border text-foreground",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={form.doorlockInternetConfirmed}
                        onChange={(e) => set("doorlockInternetConfirmed", e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                      />
                      <span>
                        <span className="flex items-center gap-2 font-medium">
                          <Wifi className="h-4 w-4 text-primary" />
                          {b.doorlock.internetRequired}
                        </span>
                        <span className="mt-1 block text-muted-foreground">{b.doorlock.confirmation}</span>
                      </span>
                    </label>
                  ) : null}
                </div>
              </Fieldset>

              {/* Legal */}
              <div className="mt-6 space-y-3 rounded-2xl border border-border p-4">
                <label className={cn("flex items-start gap-3 text-sm", invalid("accuracy") && "text-red-600 dark:text-red-400")}>
                  <input type="checkbox" checked={form.accuracy} onChange={(e) => set("accuracy", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
                  <span className="text-foreground">{b.legal.accuracy}</span>
                </label>
                <label className={cn("flex items-start gap-3 text-sm", invalid("terms") && "text-red-600 dark:text-red-400")}>
                  <input type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
                  <span className="text-foreground">
                    <a href={`/${locale}/terms`} target="_blank" rel="noreferrer" className="underline decoration-accent/50 underline-offset-2 hover:text-accent">{b.legal.termsLink}</a>
                    {" "}·{" "}
                    <a href={`/${locale}/privacy`} target="_blank" rel="noreferrer" className="underline decoration-accent/50 underline-offset-2 hover:text-accent">{b.legal.privacyLink}</a>
                  </span>
                </label>
                <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                  <span>{b.legal.note}</span>
                </p>
              </div>

              {errorKey ? (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">{b.errors[errorKey]}</p>
              ) : null}
            </form>

            {/* Footer / pay */}
            <div className="border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={onSubmit}
                disabled={status === "submitting"}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}
              >
                {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {b.pay} · {formatMoneyFromCents(quote.dueTodayCents, locale)}
              </button>
              <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">{b.paySecure}</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-6">
      <legend className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label, children, required, error, className,
}: {
  label: string; children: React.ReactNode; required?: boolean; error?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-accent" aria-hidden> *</span> : null}
      </label>
      {children}
      {error ? <span className="sr-only">required</span> : null}
    </div>
  );
}

function inputCls(error: boolean): string {
  return cn(
    "h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
    error ? "border-red-500/70" : "border-border",
  );
}
