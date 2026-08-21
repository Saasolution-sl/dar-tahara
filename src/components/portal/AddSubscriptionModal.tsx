"use client";

import * as React from "react";
import { Loader2, Lock, Plus, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  calculateAssessmentQuote,
  formatMoneyFromCents,
  type BillingInterval,
  type DurationMonths,
  type PropertyCondition,
  type TimeSlot,
} from "@/lib/assessment";
import { frequencyOrder, type FrequencyKey } from "@/lib/pricing";
import type { DurationTier } from "@/lib/subscription-duration";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Copy = {
  button: string;
  title: string;
  intro: string;
  subscription: string;
  assessmentPayment: string;
  assessmentPaymentNote: string;
  propertyAccuracy: string;
  terms: string;
  submit: string;
  submitting: string;
  required: string;
  errors: Record<string, string>;
};

const english: Copy = {
  button: "Add a new subscription",
  title: "Add a new property",
  intro: "Request and pay for a Home Assessment. After payment, the property will appear as pending until the assessment is completed.",
  subscription: "Subscription preferences",
  assessmentPayment: "Home Assessment fee",
  assessmentPaymentNote: "You will continue to Stripe to pay securely. This fee does not activate or charge a subscription.",
  propertyAccuracy: "I confirm that the property details above are complete and accurate.",
  terms: "I accept the Terms and Privacy Policy for this Home Assessment request.",
  submit: "Continue to secure payment",
  submitting: "Opening secure payment...",
  required: "Complete all required fields before continuing.",
  errors: {
    payment_details_required: "Add your payment details in Profile before requesting another subscription.",
    profile_incomplete: "Complete your customer profile before requesting another subscription.",
    assessment_booking_disabled: "New assessment requests are temporarily unavailable.",
    rate_limited: "Please wait a moment before trying again.",
    checkout_failed: "Secure assessment payment could not be opened. Please try again.",
    application_not_configured: "Secure assessment payment is temporarily unavailable.",
  },
};

const dutch: Copy = {
  ...english,
  button: "Nieuw abonnement toevoegen",
  title: "Nieuwe woning toevoegen",
  intro: "Vraag een woningbeoordeling aan en betaal deze. Na betaling verschijnt de woning als in behandeling totdat de beoordeling is afgerond.",
  subscription: "Abonnementsvoorkeuren",
  assessmentPayment: "Kosten woningbeoordeling",
  assessmentPaymentNote: "U gaat door naar Stripe om veilig te betalen. Deze betaling activeert of belast nog geen abonnement.",
  propertyAccuracy: "Ik bevestig dat de woninggegevens hierboven volledig en correct zijn.",
  terms: "Ik ga akkoord met de Voorwaarden en het Privacybeleid voor deze woningbeoordeling.",
  submit: "Doorgaan naar veilige betaling",
  submitting: "Veilige betaling openen...",
  required: "Vul alle verplichte velden in voordat u doorgaat.",
};

const localizedCopy: Record<Locale, Copy> = {
  en: english,
  nl: dutch,
  fr: english,
  ar: english,
  es: english,
  de: english,
  pt: english,
};

type FormState = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  sizeM2: string;
  bedrooms: string;
  bathrooms: string;
  condition: PropertyCondition;
  pets: boolean;
  petDetails: string;
  smoking: boolean;
  accessNotes: string;
  airConditioningUnits: string;
  frequency: FrequencyKey;
  billingInterval: BillingInterval;
  durationMonths: DurationMonths;
  preferredDate: string;
  alternateDate: string;
  timeSlot: TimeSlot;
  accuracy: boolean;
  terms: boolean;
};

function localToday(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function AddSubscriptionModal({
  locale,
  dict,
  durationTiers,
}: {
  locale: Locale;
  dict: Pick<Dictionary, "booking" | "calculator">;
  durationTiers: DurationTier[];
}) {
  const copy = localizedCopy[locale];
  const enabledTiers = durationTiers.filter((tier) => tier.enabled);
  const defaultDuration = (enabledTiers.find((tier) => tier.recommended)?.months ||
    enabledTiers.at(-1)?.months ||
    12) as DurationMonths;
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [invalid, setInvalid] = React.useState<Set<string>>(new Set());
  const [form, setForm] = React.useState<FormState>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    sizeM2: "",
    bedrooms: "",
    bathrooms: "",
    condition: "standard",
    pets: false,
    petDetails: "",
    smoking: false,
    accessNotes: "",
    airConditioningUnits: "",
    frequency: "biweekly",
    billingInterval: "monthly",
    durationMonths: defaultDuration,
    preferredDate: "",
    alternateDate: "",
    timeSlot: "flexible",
    accuracy: false,
    terms: false,
  });

  React.useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [open, submitting]);

  const sizeM2 = Number(form.sizeM2) || 0;
  const overMax = sizeM2 > 250;
  const quote = calculateAssessmentQuote(
    Math.max(20, sizeM2 || 20),
    form.frequency,
    overMax,
    false,
    form.durationMonths,
    durationTiers,
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setInvalid((current) => {
      if (!current.has(key)) return current;
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    setError(null);
  }

  function validate(): boolean {
    const missing = new Set<string>();
    if (!form.addressLine1.trim()) missing.add("addressLine1");
    if (!form.city.trim()) missing.add("city");
    if (!Number.isFinite(sizeM2) || sizeM2 < 20 || sizeM2 > 5000) missing.add("sizeM2");
    if (form.bedrooms === "" || Number(form.bedrooms) < 0) missing.add("bedrooms");
    if (form.bathrooms === "" || Number(form.bathrooms) < 0) missing.add("bathrooms");
    if (!form.preferredDate) missing.add("preferredDate");
    if (form.pets && !form.petDetails.trim()) missing.add("petDetails");
    if (!form.accuracy) missing.add("accuracy");
    if (!form.terms) missing.add("terms");
    setInvalid(missing);
    if (missing.size) setError(copy.required);
    return missing.size === 0;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/account/subscriptions/new-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || null,
          city: form.city,
          postalCode: form.postalCode || null,
          countryCode: "MA",
          sizeM2,
          overMax,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          pets: form.pets,
          petDetails: form.pets ? form.petDetails : null,
          smoking: form.smoking,
          condition: form.condition,
          accessNotes: form.accessNotes || null,
          airConditioningUnits: form.airConditioningUnits === "" ? null : Number(form.airConditioningUnits),
          frequency: form.frequency,
          billingInterval: form.billingInterval,
          durationMonths: form.durationMonths,
          preferredDate: form.preferredDate,
          alternateDate: form.alternateDate || null,
          timeSlot: form.timeSlot,
          propertyAccuracyAccepted: form.accuracy,
          termsAccepted: form.terms,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (response.ok && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      setError(
        (result.error && copy.errors[result.error]) || copy.errors.checkout_failed,
      );
    } catch {
      setError(copy.errors.checkout_failed);
    } finally {
      setSubmitting(false);
    }
  }

  const b = dict.booking;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonVariants({ variant: "primary", size: "lg" })}
      >
        <Plus className="h-4 w-4" />
        {copy.button}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label={b.close}
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
            onClick={() => !submitting && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-subscription-title"
            className="relative z-10 flex max-h-[96dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-lift sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
              <div className="min-w-0">
                <h2 id="add-subscription-title" className="font-serif text-2xl text-foreground">
                  {copy.title}
                </h2>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {copy.intro}
                </p>
              </div>
              <button
                type="button"
                aria-label={b.close}
                disabled={submitting}
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border hover:bg-secondary disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="overflow-y-auto px-5 py-5 sm:px-7" noValidate>
              <Section title={copy.subscription}>
                <Field label={dict.calculator.frequencyLabel} className="sm:col-span-2" group>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {frequencyOrder.map((frequency) => (
                      <ChoiceButton
                        key={frequency}
                        selected={form.frequency === frequency}
                        onClick={() => update("frequency", frequency)}
                        label={dict.calculator.freq[frequency].name}
                        note={dict.calculator.freq[frequency].visits}
                      />
                    ))}
                  </div>
                </Field>
                <Field label={dict.calculator.durationLabel}>
                  <select
                    value={form.durationMonths}
                    onChange={(event) => update("durationMonths", Number(event.target.value) as DurationMonths)}
                    className={inputClass(false)}
                  >
                    {enabledTiers.map((tier) => (
                      <option key={tier.months} value={tier.months}>
                        {dict.calculator.duration[`${tier.months}_month` as "3_month"].name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={b.billing.label}>
                  <select
                    value={form.billingInterval}
                    onChange={(event) => update("billingInterval", event.target.value as BillingInterval)}
                    className={inputClass(false)}
                  >
                    <option value="monthly">{b.billing.monthly}</option>
                    <option value="annual">{b.billing.annual}</option>
                  </select>
                </Field>
              </Section>

              <Section title={b.steps.visit}>
                <Field label={b.visit.preferredDate} required invalid={invalid.has("preferredDate")}>
                  <input
                    type="date"
                    min={localToday()}
                    value={form.preferredDate}
                    onChange={(event) => update("preferredDate", event.target.value)}
                    className={inputClass(invalid.has("preferredDate"))}
                  />
                </Field>
                <Field label={b.visit.alternateDate}>
                  <input
                    type="date"
                    min={localToday()}
                    value={form.alternateDate}
                    onChange={(event) => update("alternateDate", event.target.value)}
                    className={inputClass(false)}
                  />
                </Field>
                <Field label={b.visit.timeSlot} className="sm:col-span-2" group>
                  <div className="grid grid-cols-3 gap-2">
                    {(["morning", "afternoon", "flexible"] as TimeSlot[]).map((slot) => (
                      <ChoiceButton
                        key={slot}
                        selected={form.timeSlot === slot}
                        onClick={() => update("timeSlot", slot)}
                        label={b.visit[slot]}
                      />
                    ))}
                  </div>
                </Field>
              </Section>

              <Section title={b.steps.home}>
                <Field label={b.fields.addressLine1} required invalid={invalid.has("addressLine1")} className="sm:col-span-2">
                  <input autoComplete="address-line1" value={form.addressLine1} onChange={(event) => update("addressLine1", event.target.value)} className={inputClass(invalid.has("addressLine1"))} />
                </Field>
                <Field label={b.fields.addressLine2}>
                  <input autoComplete="address-line2" value={form.addressLine2} onChange={(event) => update("addressLine2", event.target.value)} className={inputClass(false)} />
                </Field>
                <Field label={b.fields.city} required invalid={invalid.has("city")}>
                  <input autoComplete="address-level2" value={form.city} onChange={(event) => update("city", event.target.value)} className={inputClass(invalid.has("city"))} />
                </Field>
                <Field label={b.fields.postalCode}>
                  <input autoComplete="postal-code" value={form.postalCode} onChange={(event) => update("postalCode", event.target.value)} className={inputClass(false)} />
                </Field>
                <Field label={`${b.fields.size} (m²)`} required invalid={invalid.has("sizeM2")}>
                  <input type="number" min={20} max={5000} value={form.sizeM2} onChange={(event) => update("sizeM2", event.target.value)} className={inputClass(invalid.has("sizeM2"))} />
                </Field>
                <Field label={b.fields.bedrooms} required invalid={invalid.has("bedrooms")}>
                  <input type="number" min={0} max={50} value={form.bedrooms} onChange={(event) => update("bedrooms", event.target.value)} className={inputClass(invalid.has("bedrooms"))} />
                </Field>
                <Field label={b.fields.bathrooms} required invalid={invalid.has("bathrooms")}>
                  <input type="number" min={0} max={50} step="0.5" value={form.bathrooms} onChange={(event) => update("bathrooms", event.target.value)} className={inputClass(invalid.has("bathrooms"))} />
                </Field>
                <Field label={b.fields.condition}>
                  <select value={form.condition} onChange={(event) => update("condition", event.target.value as PropertyCondition)} className={inputClass(false)}>
                    {(["excellent", "standard", "needs_attention", "heavy"] as PropertyCondition[]).map((condition) => (
                      <option key={condition} value={condition}>{b.condition[condition]}</option>
                    ))}
                  </select>
                </Field>
                <Field label={b.fields.airConditioningUnits}>
                  <input
                    type="number" min={0} max={50}
                    value={form.airConditioningUnits}
                    onChange={(event) => update("airConditioningUnits", event.target.value)}
                    className={inputClass(false)}
                  />
                </Field>
                <Field label={b.fields.accessNotes} className="sm:col-span-2">
                  <textarea rows={3} value={form.accessNotes} onChange={(event) => update("accessNotes", event.target.value)} className={cn(inputClass(false), "h-auto py-3")} />
                </Field>
                <label className="flex items-center gap-3 text-sm sm:col-span-2">
                  <input type="checkbox" checked={form.pets} onChange={(event) => update("pets", event.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  {b.fields.pets}
                </label>
                {form.pets ? (
                  <Field label={b.fields.petDetails} required invalid={invalid.has("petDetails")} className="sm:col-span-2">
                    <input value={form.petDetails} onChange={(event) => update("petDetails", event.target.value)} className={inputClass(invalid.has("petDetails"))} />
                  </Field>
                ) : null}
                <label className="flex items-center gap-3 text-sm sm:col-span-2">
                  <input type="checkbox" checked={form.smoking} onChange={(event) => update("smoking", event.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  {b.fields.smoking}
                </label>
              </Section>

              <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-medium text-foreground">{copy.assessmentPayment}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy.assessmentPaymentNote}</p>
                  </div>
                  <p className="shrink-0 font-serif text-xl text-foreground">
                    {formatMoneyFromCents(quote.assessmentPriceCents, locale)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
                <p className="font-medium text-foreground">{dict.booking.acMaintenance.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{dict.booking.acMaintenance.body}</p>
              </div>

              <div className="mt-5 space-y-3 rounded-2xl border border-border p-4">
                <CheckRow checked={form.accuracy} invalid={invalid.has("accuracy")} onChange={(checked) => update("accuracy", checked)}>
                  {copy.propertyAccuracy}
                </CheckRow>
                <CheckRow checked={form.terms} invalid={invalid.has("terms")} onChange={(checked) => update("terms", checked)}>
                  <span>
                    {copy.terms}{" "}
                    <a href={`/${locale}/terms`} target="_blank" rel="noreferrer" className="underline underline-offset-2">{b.legal.termsLink}</a>
                    {" · "}
                    <a href={`/${locale}/privacy`} target="_blank" rel="noreferrer" className="underline underline-offset-2">{b.legal.privacyLink}</a>
                  </span>
                </CheckRow>
              </div>

              {error ? <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

              <div className="mt-6 border-t border-border pt-5">
                <button type="submit" disabled={submitting} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {submitting ? copy.submitting : copy.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-6 first:mt-0">
      <legend className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, required, invalid, className, group = false, children }: { label: string; required?: boolean; invalid?: boolean; className?: string; group?: boolean; children: React.ReactNode }) {
  const Wrapper = group ? "div" : "label";
  return (
    <Wrapper className={className}>
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}{required ? <span className="text-accent"> *</span> : null}
      </span>
      {children}
      {invalid ? <span className="sr-only">Required</span> : null}
    </Wrapper>
  );
}

function ChoiceButton({ selected, onClick, label, note }: { selected: boolean; onClick: () => void; label: string; note?: string }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={cn("rounded-xl border px-3 py-2.5 text-start text-sm transition-colors", selected ? "border-primary bg-primary/[0.06] text-foreground" : "border-border text-muted-foreground hover:border-foreground/25")}>
      <span className="block font-medium">{label}</span>
      {note ? <span className="mt-0.5 block text-xs">{note}</span> : null}
    </button>
  );
}

function CheckRow({ checked, invalid, onChange, children }: { checked: boolean; invalid: boolean; onChange: (checked: boolean) => void; children: React.ReactNode }) {
  return (
    <label className={cn("flex items-start gap-3 text-sm leading-relaxed", invalid && "text-red-600 dark:text-red-400")}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
      <span>{children}</span>
    </label>
  );
}

function inputClass(invalid: boolean): string {
  return cn(
    "h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
    invalid ? "border-red-500/70" : "border-border",
  );
}
