"use client";

import * as React from "react";
import { Check, Loader2, ArrowRight, ArrowLeft, ShieldCheck, KeyRound, Info } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { EarlyAccessCopy } from "@/i18n/early-access-copy";
import {
  STEPS, validateStep, type StepId, type EarlyAccessPayload, type FieldErrors,
} from "@/lib/early-access/schema";
import type { Attribution } from "@/lib/early-access/attribution";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "@/components/mailing-list/turnstile-widget";
import {
  FieldShell, TextInput, TextArea, Select, CheckboxRow, RadioCards, CheckboxChips,
} from "./fields";

const FIRST_TOUCH_KEY = "dt_ea_first_touch";

// Curated country + calling-code list (Moroccan diaspora focus). Not exhaustive
// by design — "Other" is always available via free-typing residence.
const COUNTRIES: Record<string, string> = {
  MA: "Morocco", NL: "Netherlands", BE: "Belgium", FR: "France", DE: "Germany",
  ES: "Spain", GB: "United Kingdom", AE: "United Arab Emirates", IT: "Italy",
  US: "United States", CA: "Canada", CH: "Switzerland", SE: "Sweden", NO: "Norway",
};
const CALLING_CODES: Record<string, string> = {
  "+212": "🇲🇦 +212", "+31": "🇳🇱 +31", "+32": "🇧🇪 +32", "+33": "🇫🇷 +33",
  "+49": "🇩🇪 +49", "+34": "🇪🇸 +34", "+44": "🇬🇧 +44", "+971": "🇦🇪 +971",
  "+39": "🇮🇹 +39", "+1": "🇺🇸 +1", "+41": "🇨🇭 +41", "+46": "🇸🇪 +46", "+47": "🇳🇴 +47",
};
const LANGUAGES: Record<string, string> = {
  en: "English", fr: "Français", ar: "العربية", nl: "Nederlands", es: "Español", de: "Deutsch", pt: "Português",
};

type Status = "idle" | "submitting" | "error";

export function EarlyAccessForm({ locale, copy }: { locale: Locale; copy: EarlyAccessCopy }) {
  const [p, setP] = React.useState<EarlyAccessPayload>({
    firstName: "", lastName: "", email: "",
    countryCallingCode: "+212", preferredContactMethod: "whatsapp",
    preferredLanguage: locale, whatsappSameAsMobile: true,
    billingRecipientType: "private", propertyCountry: "MA",
    serviceTypes: [], locale,
  });
  const [stepIndex, setStepIndex] = React.useState(0);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState<null | { verificationSent: boolean }>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);
  const startTimeRef = React.useRef<number>(Date.now());
  const firstTouchRef = React.useRef<Attribution | undefined>(undefined);
  const topRef = React.useRef<HTMLDivElement>(null);

  const step: StepId = STEPS[stepIndex];
  const total = STEPS.length;

  // Capture attribution + referral on mount.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const current: Attribution = {
      sourceCode: params.get("src") ?? undefined,
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
      utmContent: params.get("utm_content") ?? undefined,
      utmTerm: params.get("utm_term") ?? undefined,
    };
    const ref = params.get("ref") ?? undefined;

    // First-touch: persist the very first visit's attribution; never overwrite.
    try {
      const stored = window.localStorage.getItem(FIRST_TOUCH_KEY);
      if (stored) firstTouchRef.current = JSON.parse(stored);
      else if (Object.values(current).some(Boolean)) {
        window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(current));
        firstTouchRef.current = current;
      }
    } catch { /* storage blocked — first-touch simply falls back to last */ }

    setP((prev) => ({
      ...prev,
      src: current.sourceCode, utmSource: current.utmSource, utmMedium: current.utmMedium,
      utmCampaign: current.utmCampaign, utmContent: current.utmContent, utmTerm: current.utmTerm,
      referralCode: ref,
    }));
    track("early_access_page_view", {});
  }, []);

  function set<K extends keyof EarlyAccessPayload>(key: K, value: EarlyAccessPayload[K]) {
    if (!startedRef.current) {
      startedRef.current = true;
      track("early_access_form_started", {});
    }
    setP((prev) => ({ ...prev, [key]: value }));
  }
  function toggleService(v: string) {
    setP((prev) => {
      const cur = prev.serviceTypes ?? [];
      return { ...prev, serviceTypes: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
    });
  }

  function scrollTop() { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  function goNext() {
    const e = validateStep(step, p);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (stepIndex < total - 1) { setStepIndex((i) => i + 1); scrollTop(); }
  }
  function goBack() {
    setErrors({});
    if (stepIndex > 0) { setStepIndex((i) => i - 1); scrollTop(); }
  }

  async function onSubmit() {
    const e = validateStep("review", p);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setStatus("submitting");
    setFormError(null);
    try {
      const res = await fetch("/api/early-access/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...p,
          firstTouch: firstTouchRef.current,
          turnstileToken: token,
          elapsedMs: Date.now() - startTimeRef.current,
          locale,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors; verificationSent?: boolean };
      if (res.ok && data.ok) {
        track("early_access_form_submitted", {});
        setSubmitted({ verificationSent: Boolean(data.verificationSent) });
        scrollTop();
        return;
      }
      if (data.fields) setErrors(data.fields);
      setFormError(copy.errors[data.error ?? "server_error"] ?? copy.errors.server_error);
      setStatus("error");
    } catch {
      setFormError(copy.errors.network);
      setStatus("error");
    }
  }

  if (submitted) {
    return (
      <div ref={topRef} className="rounded-[1.75rem] border border-border bg-card p-8 text-center shadow-soft sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-2xl text-foreground">{copy.submitted.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.submitted.body}</p>
        {submitted.verificationSent ? (
          <p className="mt-2 text-sm font-medium text-foreground">{copy.submitted.checkInbox}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={topRef} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{copy.progress.stepOf.replace("{n}", String(stepIndex + 1)).replace("{total}", String(total))}</span>
          <span>{Math.round(((stepIndex + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-luxe"
            style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{copy.steps[step].title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{copy.steps[step].subtitle}</p>

      <div className="mt-6 space-y-5">
        {step === "contact" && <ContactStep p={p} set={set} errors={errors} copy={copy} />}
        {step === "billing" && <BillingStep p={p} set={set} errors={errors} copy={copy} />}
        {step === "property_address" && <PropertyAddressStep p={p} set={set} errors={errors} copy={copy} />}
        {step === "property_info" && <PropertyInfoStep p={p} set={set} errors={errors} copy={copy} />}
        {step === "services" && <ServicesStep p={p} set={set} toggleService={toggleService} errors={errors} copy={copy} />}
        {step === "access" && <AccessStep p={p} set={set} errors={errors} copy={copy} />}
        {step === "review" && <ReviewStep p={p} set={set} errors={errors} copy={copy} />}
      </div>

      {/* Honeypot — visually hidden, off-screen, not announced. Bots fill it. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="company-website">Company website</label>
        <input
          id="company-website" type="text" tabIndex={-1} autoComplete="off"
          value={p.companyWebsite ?? ""} onChange={(e) => setP((prev) => ({ ...prev, companyWebsite: e.target.value }))}
        />
      </div>

      {step === "review" ? (
        <div className="mt-6">
          <TurnstileWidget onToken={setToken} />
        </div>
      ) : null}

      {formError ? (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {formError}
        </p>
      ) : null}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
            stepIndex === 0 ? "invisible" : "text-foreground hover:bg-secondary",
          )}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {copy.nav.back}
        </button>

        {step !== "review" ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            {copy.nav.next}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={status === "submitting"}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-60"
          >
            {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {status === "submitting" ? copy.nav.submitting : copy.nav.submit}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step components ──────────────────────────────────────────────────────────
type StepProps = {
  p: EarlyAccessPayload;
  set: <K extends keyof EarlyAccessPayload>(k: K, v: EarlyAccessPayload[K]) => void;
  errors: FieldErrors;
  copy: EarlyAccessCopy;
};

function err(copy: EarlyAccessCopy, code?: string) {
  return code ? copy.errors[code] ?? copy.errors.invalid : undefined;
}

function ContactStep({ p, set, errors, copy }: StepProps) {
  const f = copy.fields;
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id="firstName" label={f.firstName} required error={err(copy, errors.firstName)}>
          <TextInput value={p.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" />
        </FieldShell>
        <FieldShell id="lastName" label={f.lastName} required error={err(copy, errors.lastName)}>
          <TextInput value={p.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" />
        </FieldShell>
      </div>
      <FieldShell id="email" label={f.email} required error={err(copy, errors.email)}>
        <TextInput type="email" inputMode="email" value={p.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
      </FieldShell>
      <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
        <FieldShell id="cc" label={f.countryCallingCode}>
          <Select options={CALLING_CODES} value={p.countryCallingCode} onChange={(e) => set("countryCallingCode", e.target.value)} />
        </FieldShell>
        <FieldShell id="mobileNumber" label={f.mobileNumber} error={err(copy, errors.mobileNumber)}>
          <TextInput type="tel" inputMode="tel" value={p.mobileNumber ?? ""} onChange={(e) => set("mobileNumber", e.target.value)} autoComplete="tel-national" />
        </FieldShell>
      </div>
      <CheckboxRow id="wa-same" label={f.whatsappSameAsMobile} checked={Boolean(p.whatsappSameAsMobile)} onChange={(v) => set("whatsappSameAsMobile", v)} />
      {!p.whatsappSameAsMobile ? (
        <FieldShell id="whatsappNumber" label={f.whatsappNumber}>
          <TextInput type="tel" inputMode="tel" value={p.whatsappNumber ?? ""} onChange={(e) => set("whatsappNumber", e.target.value)} />
        </FieldShell>
      ) : null}
      <FieldShell id="pcm" label={f.preferredContactMethod}>
        <RadioCards name="pcm" columns={3} value={p.preferredContactMethod} options={copy.options.contactMethod} onChange={(v) => set("preferredContactMethod", v)} />
      </FieldShell>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id="lang" label={f.preferredLanguage}>
          <Select options={LANGUAGES} value={p.preferredLanguage} onChange={(e) => set("preferredLanguage", e.target.value)} />
        </FieldShell>
        <FieldShell id="res" label={f.residenceCountry}>
          <Select options={COUNTRIES} placeholder="—" value={p.residenceCountry ?? ""} onChange={(e) => set("residenceCountry", e.target.value)} />
        </FieldShell>
      </div>
    </>
  );
}

function BillingStep({ p, set, errors, copy }: StepProps) {
  const f = copy.fields;
  return (
    <>
      <FieldShell id="brt" label={f.billingRecipientType}>
        <RadioCards name="brt" value={p.billingRecipientType} options={copy.options.recipientType} onChange={(v) => set("billingRecipientType", v)} />
      </FieldShell>
      {p.billingRecipientType === "business" ? (
        <FieldShell id="companyName" label={f.companyName} required error={err(copy, errors.companyName)}>
          <TextInput value={p.companyName ?? ""} onChange={(e) => set("companyName", e.target.value)} autoComplete="organization" />
        </FieldShell>
      ) : null}
      <FieldShell id="b1" label={f.billingAddressLine1} required error={err(copy, errors.billingAddressLine1)}>
        <TextInput value={p.billingAddressLine1 ?? ""} onChange={(e) => set("billingAddressLine1", e.target.value)} autoComplete="address-line1" />
      </FieldShell>
      <FieldShell id="b2" label={f.billingAddressLine2}>
        <TextInput value={p.billingAddressLine2 ?? ""} onChange={(e) => set("billingAddressLine2", e.target.value)} autoComplete="address-line2" />
      </FieldShell>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id="bhn" label={f.billingBuildingNumber}>
          <TextInput value={p.billingBuildingNumber ?? ""} onChange={(e) => set("billingBuildingNumber", e.target.value)} />
        </FieldShell>
        <FieldShell id="bu" label={f.billingUnit}>
          <TextInput value={p.billingUnit ?? ""} onChange={(e) => set("billingUnit", e.target.value)} />
        </FieldShell>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id="bpc" label={f.billingPostalCode}>
          <TextInput value={p.billingPostalCode ?? ""} onChange={(e) => set("billingPostalCode", e.target.value)} autoComplete="postal-code" />
        </FieldShell>
        <FieldShell id="bcity" label={f.billingCity} required error={err(copy, errors.billingCity)}>
          <TextInput value={p.billingCity ?? ""} onChange={(e) => set("billingCity", e.target.value)} autoComplete="address-level2" />
        </FieldShell>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id="breg" label={f.billingRegion}>
          <TextInput value={p.billingRegion ?? ""} onChange={(e) => set("billingRegion", e.target.value)} autoComplete="address-level1" />
        </FieldShell>
        <FieldShell id="bco" label={f.billingCountry} required error={err(copy, errors.billingCountry)}>
          <Select options={COUNTRIES} placeholder="—" value={p.billingCountry ?? ""} onChange={(e) => set("billingCountry", e.target.value)} />
        </FieldShell>
      </div>
      <FieldShell id="tax" label={f.taxId}>
        <TextInput value={p.taxId ?? ""} onChange={(e) => set("taxId", e.target.value)} />
      </FieldShell>
      <CheckboxRow id="inv-same" label={f.invoiceEmailSameAsContact} checked={Boolean(p.invoiceEmailSameAsContact)} onChange={(v) => set("invoiceEmailSameAsContact", v)} />
      {!p.invoiceEmailSameAsContact ? (
        <FieldShell id="invoiceEmail" label={f.invoiceEmail} error={err(copy, errors.invoiceEmail)}>
          <TextInput type="email" value={p.invoiceEmail ?? ""} onChange={(e) => set("invoiceEmail", e.target.value)} />
        </FieldShell>
      ) : null}
    </>
  );
}

function PropertyAddressStep({ p, set, errors, copy }: StepProps) {
  const f = copy.fields;
  const canCopy = (p.billingCountry ?? "").toUpperCase() === "MA";
  return (
    <>
      {canCopy ? (
        <CheckboxRow id="use-billing" label={f.useBillingAsProperty} checked={Boolean(p.useBillingAsProperty)} onChange={(v) => set("useBillingAsProperty", v)} />
      ) : null}
      <FieldShell id="pname" label={f.propertyName}>
        <TextInput value={p.propertyName ?? ""} onChange={(e) => set("propertyName", e.target.value)} />
      </FieldShell>
      {!p.useBillingAsProperty ? (
        <>
          <FieldShell id="pa1" label={f.propertyAddressLine1} required error={err(copy, errors.propertyAddressLine1)}>
            <TextInput value={p.propertyAddressLine1 ?? ""} onChange={(e) => set("propertyAddressLine1", e.target.value)} />
          </FieldShell>
          <FieldShell id="pa2" label={f.propertyAddressLine2}>
            <TextInput value={p.propertyAddressLine2 ?? ""} onChange={(e) => set("propertyAddressLine2", e.target.value)} />
          </FieldShell>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell id="rn" label={f.residenceName}>
              <TextInput value={p.residenceName ?? ""} onChange={(e) => set("residenceName", e.target.value)} />
            </FieldShell>
            <FieldShell id="pbn" label={f.propertyBuildingNumber}>
              <TextInput value={p.propertyBuildingNumber ?? ""} onChange={(e) => set("propertyBuildingNumber", e.target.value)} />
            </FieldShell>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <FieldShell id="pun" label={f.propertyUnitNumber}>
              <TextInput value={p.propertyUnitNumber ?? ""} onChange={(e) => set("propertyUnitNumber", e.target.value)} />
            </FieldShell>
            <FieldShell id="pf" label={f.propertyFloor}>
              <TextInput value={p.propertyFloor ?? ""} onChange={(e) => set("propertyFloor", e.target.value)} />
            </FieldShell>
            <FieldShell id="ppc" label={f.propertyPostalCode}>
              <TextInput value={p.propertyPostalCode ?? ""} onChange={(e) => set("propertyPostalCode", e.target.value)} />
            </FieldShell>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell id="pcity" label={f.propertyCity} required error={err(copy, errors.propertyCity)}>
              <TextInput value={p.propertyCity ?? ""} onChange={(e) => set("propertyCity", e.target.value)} />
            </FieldShell>
            <FieldShell id="preg" label={f.propertyRegion}>
              <TextInput value={p.propertyRegion ?? ""} onChange={(e) => set("propertyRegion", e.target.value)} />
            </FieldShell>
          </div>
          <FieldShell id="nb" label={f.neighbourhood}>
            <TextInput value={p.neighbourhood ?? ""} onChange={(e) => set("neighbourhood", e.target.value)} />
          </FieldShell>
        </>
      ) : null}
      <FieldShell id="lm" label={f.landmark}>
        <TextInput value={p.landmark ?? ""} onChange={(e) => set("landmark", e.target.value)} />
      </FieldShell>
      <FieldShell id="gm" label={f.googleMapsUrl} hint={copy.hints.googleMapsUrl} error={err(copy, errors.googleMapsUrl)}>
        <TextInput type="url" inputMode="url" value={p.googleMapsUrl ?? ""} onChange={(e) => set("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/…" />
      </FieldShell>
      <FieldShell id="en" label={f.entryNotes} hint={copy.hints.entryNotes}>
        <TextArea value={p.entryNotes ?? ""} onChange={(e) => set("entryNotes", e.target.value)} />
      </FieldShell>
      <CheckboxRow id="auth" label={f.authorizedBySubmitter} checked={Boolean(p.authorizedBySubmitter)} onChange={(v) => set("authorizedBySubmitter", v)} />
      {errors.authorizedBySubmitter ? <p role="alert" className="text-xs font-medium text-red-600">{err(copy, errors.authorizedBySubmitter)}</p> : null}
    </>
  );
}

function NumberField({ id, label, value, onChange }: { id: string; label: string; value?: number; onChange: (v: number | undefined) => void }) {
  return (
    <FieldShell id={id} label={label}>
      <TextInput
        type="number" inputMode="numeric" min={0}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </FieldShell>
  );
}

function PropertyInfoStep({ p, set, copy }: StepProps) {
  const f = copy.fields;
  return (
    <>
      <FieldShell id="pt" label={f.propertyType}>
        <RadioCards name="pt" columns={2} value={p.propertyType} options={copy.options.propertyType} onChange={(v) => set("propertyType", v)} />
      </FieldShell>
      <div className="grid gap-5 sm:grid-cols-3">
        <NumberField id="size" label={f.sizeM2} value={p.sizeM2} onChange={(v) => set("sizeM2", v)} />
        <NumberField id="bed" label={f.bedrooms} value={p.bedrooms} onChange={(v) => set("bedrooms", v)} />
        <NumberField id="bath" label={f.bathrooms} value={p.bathrooms} onChange={(v) => set("bathrooms", v)} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <NumberField id="kit" label={f.kitchens} value={p.kitchens} onChange={(v) => set("kitchens", v)} />
        <NumberField id="liv" label={f.livingRooms} value={p.livingRooms} onChange={(v) => set("livingRooms", v)} />
        <NumberField id="nf" label={f.numberOfFloors} value={p.numberOfFloors} onChange={(v) => set("numberOfFloors", v)} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id="elev" label={f.elevatorStatus}>
          <Select options={copy.options.tristate} placeholder="—" value={p.elevatorStatus ?? ""} onChange={(e) => set("elevatorStatus", e.target.value)} />
        </FieldShell>
        <FieldShell id="out" label={f.outdoorArea}>
          <Select options={copy.options.outdoor} placeholder="—" value={p.outdoorArea ?? ""} onChange={(e) => set("outdoorArea", e.target.value)} />
        </FieldShell>
      </div>
      <FieldShell id="occ" label={f.occupancyType}>
        <Select options={copy.options.occupancy} placeholder="—" value={p.occupancyType ?? ""} onChange={(e) => set("occupancyType", e.target.value)} />
      </FieldShell>
      <FieldShell id="cond" label={f.propertyCondition}>
        <Select options={copy.options.condition} placeholder="—" value={p.propertyCondition ?? ""} onChange={(e) => set("propertyCondition", e.target.value)} />
      </FieldShell>
      <FieldShell id="furn" label={f.furnishingStatus}>
        <Select options={copy.options.furnishing} placeholder="—" value={p.furnishingStatus ?? ""} onChange={(e) => set("furnishingStatus", e.target.value)} />
      </FieldShell>
      <div className="grid gap-5 sm:grid-cols-2">
        <CheckboxRow id="pets" label={f.petsPresent} checked={Boolean(p.petsPresent)} onChange={(v) => set("petsPresent", v)} />
        <FieldShell id="smoke" label={f.smokingStatus}>
          <Select options={copy.options.tristate} placeholder="—" value={p.smokingStatus ?? ""} onChange={(e) => set("smokingStatus", e.target.value)} />
        </FieldShell>
      </div>
    </>
  );
}

function ServicesStep({
  p, set, toggleService, errors, copy,
}: StepProps & { toggleService: (v: string) => void }) {
  const f = copy.fields;
  return (
    <>
      <FieldShell id="svc" label={f.serviceTypes} required error={err(copy, errors.serviceTypes)}>
        <CheckboxChips options={copy.options.service} values={p.serviceTypes ?? []} onToggle={toggleService} />
      </FieldShell>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldShell id="freq" label={f.desiredFrequency}>
          <Select options={copy.options.frequency} placeholder="—" value={p.desiredFrequency ?? ""} onChange={(e) => set("desiredFrequency", e.target.value)} />
        </FieldShell>
        <FieldShell id="start" label={f.expectedStartPeriod}>
          <Select options={copy.options.startPeriod} placeholder="—" value={p.expectedStartPeriod ?? ""} onChange={(e) => set("expectedStartPeriod", e.target.value)} />
        </FieldShell>
      </div>
      <FieldShell id="sd" label={f.preferredStartDate}>
        <TextInput type="date" value={p.preferredStartDate ?? ""} onChange={(e) => set("preferredStartDate", e.target.value)} />
      </FieldShell>
      <FieldShell id="sn" label={f.serviceNotes}>
        <TextArea value={p.serviceNotes ?? ""} onChange={(e) => set("serviceNotes", e.target.value)} />
      </FieldShell>
      <p className="flex items-start gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {copy.hints.notBookingServices}
      </p>
    </>
  );
}

function AccessStep({ p, set, errors, copy }: StepProps) {
  const f = copy.fields;
  return (
    <>
      <FieldShell id="am" label={f.accessMethod} required error={err(copy, errors.accessMethod)}>
        <RadioCards name="am" columns={2} value={p.accessMethod} options={copy.options.access} onChange={(v) => set("accessMethod", v)} />
      </FieldShell>

      {p.accessMethod === "digital_lock" ? (
        <p className="flex items-start gap-2 rounded-xl bg-primary/5 px-4 py-3 text-xs leading-relaxed text-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {copy.digitalLockNotice}
        </p>
      ) : null}

      {p.accessMethod === "physical_key" ? (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <KeyRound className="h-4 w-4 text-accent" />
            {copy.keyNotice.title}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy.keyNotice.body}</p>
          <div className="mt-3">
            <CheckboxRow
              id="key-ack"
              label={copy.keyNotice.ack}
              checked={Boolean(p.physicalKeyTermsAcknowledged)}
              onChange={(v) => set("physicalKeyTermsAcknowledged", v)}
            />
            {errors.physicalKeyTermsAcknowledged ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600">{err(copy, errors.physicalKeyTermsAcknowledged)}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {p.accessMethod === "person_present" || p.accessMethod === "other" ? (
        <>
          <p className="flex items-start gap-2 rounded-xl bg-secondary/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {copy.thirdPartyNotice}
          </p>
          <FieldShell id="tpd" label={f.thirdPartyDetails}>
            <TextArea value={p.thirdPartyDetails ?? ""} onChange={(e) => set("thirdPartyDetails", e.target.value)} />
          </FieldShell>
        </>
      ) : null}

      <FieldShell id="an" label={f.accessNotes}>
        <TextArea value={p.accessNotes ?? ""} onChange={(e) => set("accessNotes", e.target.value)} />
      </FieldShell>
    </>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-medium text-foreground">{value}</span>
    </div>
  );
}

function ReviewStep({ p, set, errors, copy }: StepProps) {
  const c = copy.consent;
  const o = copy.options;
  return (
    <>
      <div className="rounded-xl border border-border bg-background/60 p-4">
        <Row label={copy.fields.firstName} value={`${p.firstName} ${p.lastName}`.trim()} />
        <Row label={copy.fields.email} value={p.email} />
        <Row label={copy.fields.mobileNumber} value={p.mobileNumber ? `${p.countryCallingCode} ${p.mobileNumber}` : undefined} />
        <Row label={copy.steps.billing.title} value={[p.billingCity, p.billingCountry].filter(Boolean).join(", ")} />
        <Row label={copy.steps.property_address.title} value={[p.useBillingAsProperty ? p.billingCity : p.propertyCity, "Morocco"].filter(Boolean).join(", ")} />
        <Row label={copy.fields.propertyType} value={p.propertyType ? o.propertyType[p.propertyType] : undefined} />
        <Row label={copy.fields.serviceTypes} value={(p.serviceTypes ?? []).map((s) => o.service[s]).join(", ") || undefined} />
        <Row label={copy.fields.desiredFrequency} value={p.desiredFrequency ? o.frequency[p.desiredFrequency] : undefined} />
        <Row label={copy.fields.accessMethod} value={p.accessMethod ? o.access[p.accessMethod] : undefined} />
        {p.referralCode ? <Row label="Referral" value={p.referralCode} /> : null}
      </div>

      <h3 className="pt-2 text-sm font-semibold text-foreground">{c.heading}</h3>
      <div className="space-y-3">
        <ConsentRow id="c-acc" label={c.accurate} checked={Boolean(p.confirmAccurate)} onChange={(v) => set("confirmAccurate", v)} error={err(copy, errors.confirmAccurate)} />
        <ConsentRow id="c-auth" label={c.authorized} checked={Boolean(p.confirmAuthorized)} onChange={(v) => set("confirmAuthorized", v)} error={err(copy, errors.confirmAuthorized)} />
        <ConsentRow id="c-priv" label={c.privacy} checked={Boolean(p.acceptPrivacy)} onChange={(v) => set("acceptPrivacy", v)} error={err(copy, errors.acceptPrivacy)} />
        <ConsentRow id="c-op" label={c.operational} checked={Boolean(p.acceptOperationalComms)} onChange={(v) => set("acceptOperationalComms", v)} error={err(copy, errors.acceptOperationalComms)} />
      </div>
      <div className="rounded-xl border border-dashed border-border p-4">
        <CheckboxRow id="c-mkt" label={c.marketing} checked={Boolean(p.marketingConsent)} onChange={(v) => set("marketingConsent", v)} hint={c.marketingHint} />
      </div>
    </>
  );
}

function ConsentRow({
  id, label, checked, onChange, error,
}: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div>
      <CheckboxRow id={id} label={label} checked={checked} onChange={onChange} />
      {error ? <p role="alert" className="mt-1 text-xs font-medium text-red-600 ps-8">{error}</p> : null}
    </div>
  );
}
