"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { EarlyAccessLeadCopy } from "@/i18n/early-access-lead-copy";
import {
  validateEarlyAccessLead,
  type EarlyAccessLeadPayload,
  type LeadFieldErrors,
} from "@/lib/early-access/lead-schema";
import type { EarlyAccessPayload } from "@/lib/early-access/schema";
import { canonicalizeCity, OTHER_CITY_ID } from "@/lib/geo/moroccan-cities";
import { track } from "@/lib/analytics";
import { FieldShell, TextInput, CheckboxRow } from "./fields";
import { MoroccanCitySelector } from "./moroccan-city-selector";
import { TurnstileWidget } from "@/components/mailing-list/turnstile-widget";
import { useSignupFunnel } from "./use-signup-funnel";

type Status = "idle" | "submitting" | "error" | "success";

export function EarlyAccessLeadForm({ locale, copy }: { locale: Locale; copy: EarlyAccessLeadCopy }) {
  const [lead, setLead] = React.useState<EarlyAccessLeadPayload>({
    firstName: "",
    email: "",
    cityId: "",
    marketingConsent: false,
    locale,
  });
  const [onboardingPayload, setOnboardingPayload] = React.useState<EarlyAccessPayload>({
    firstName: "",
    lastName: "",
    email: "",
    residenceCity: "",
    preferredContactMethod: "email",
    preferredLanguage: locale,
    locale,
  });
  const [errors, setErrors] = React.useState<LeadFieldErrors>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [verificationSent, setVerificationSent] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);
  const startedAtRef = React.useRef(Date.now());

  const restore = React.useCallback((value: { partialPayload: Partial<EarlyAccessPayload> }) => {
    const restoredCity = value.partialPayload.residenceCity?.trim();
    const city = canonicalizeCity(restoredCity);
    setOnboardingPayload((previous) => ({ ...previous, ...value.partialPayload, locale }));
    setLead((previous) => ({
      ...previous,
      firstName: value.partialPayload.firstName ?? previous.firstName,
      email: value.partialPayload.email ?? previous.email,
      cityId: city?.id ?? (restoredCity ? OTHER_CITY_ID : previous.cityId),
      manualCity: city ? undefined : restoredCity ?? previous.manualCity,
      marketingConsent: value.partialPayload.marketingConsent ?? previous.marketingConsent,
      locale,
    }));
  }, [locale]);
  const funnel = useSignupFunnel({ locale, payload: onboardingPayload, stepIndex: 0, onRestore: restore });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLead((previous) => ({
      ...previous,
      src: params.get("src") ?? undefined,
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
      utmContent: params.get("utm_content") ?? undefined,
      utmTerm: params.get("utm_term") ?? undefined,
      referralCode: params.get("ref") ?? undefined,
    }));
    track("early_access_viewed", {});
  }, []);

  function started() {
    funnel.markStarted();
    if (startedRef.current) return;
    startedRef.current = true;
    track("early_access_started", {});
  }

  function setField<K extends keyof EarlyAccessLeadPayload>(key: K, value: EarlyAccessLeadPayload[K]) {
    started();
    setLead((previous) => ({ ...previous, [key]: value }));
    if (key === "firstName" || key === "email" || key === "marketingConsent") {
      const onboardingKey = key === "marketingConsent" ? "marketingConsent" : key;
      setOnboardingPayload((previous) => ({ ...previous, [onboardingKey]: value }));
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateEarlyAccessLead(lead);
    setErrors(validation.errors);
    if (!validation.ok || !validation.normalized) {
      track("early_access_error", { type: "validation" });
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);
    track("early_access_submitted", { city: validation.normalized.city });
    try {
      const response = await fetch("/api/early-access/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          turnstileToken,
          elapsedMs: Date.now() - startedAtRef.current,
          signupSessionId: funnel.credentials?.id,
          signupSessionToken: funnel.credentials?.token,
        }),
      });
      const data = await response.json().catch(() => ({})) as {
        ok?: boolean;
        error?: string;
        fields?: LeadFieldErrors;
        verificationSent?: boolean;
      };
      if (response.ok && data.ok) {
        setVerificationSent(Boolean(data.verificationSent));
        setStatus("success");
        track("early_access_success", { city: validation.normalized.city });
        track("onboarding_offered", { city: validation.normalized.city });
        return;
      }
      if (data.fields) setErrors(data.fields);
      const code = data.error ?? "server_error";
      setErrorMessage(copy.errors[code] ?? copy.errors.server_error);
      setStatus("error");
      funnel.apiError(code, response.status);
      track("early_access_error", { type: response.status >= 500 ? "server" : "validation" });
    } catch {
      setErrorMessage(copy.errors.network);
      setStatus("error");
      funnel.apiError("network");
      track("early_access_error", { type: "network" });
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[1.75rem] border border-border bg-card p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-foreground">{copy.successTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{copy.successBody}</p>
        {verificationSent ? <p className="mt-2 text-sm font-medium text-foreground">{copy.checkInbox}</p> : null}
        <div className="mt-7 rounded-2xl border border-accent/25 bg-accent/[0.04] p-5 text-start">
          <h3 className="font-semibold text-foreground">{copy.priorityTitle}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{copy.priorityBody}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={`/${locale}/early-access/onboarding`} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft">
              {copy.continue}<ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
            <Link href={`/${locale}`} className="px-4 py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground">
              {copy.later}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      onFocusCapture={funnel.onFocusCapture}
      onBlurCapture={funnel.onBlurCapture}
      className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8"
      noValidate
    >
      <h2 className="text-2xl font-semibold text-foreground">{copy.heading}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.intro}</p>
      <div className="mt-6 space-y-5">
        <FieldShell id="firstName" label={copy.firstName} required error={errors.firstName ? copy.errors[errors.firstName] : undefined}>
          <TextInput autoComplete="given-name" value={lead.firstName} onChange={(event) => setField("firstName", event.target.value)} />
        </FieldShell>
        <FieldShell id="email" label={copy.email} required error={errors.email ? copy.errors[errors.email] : undefined}>
          <TextInput type="email" inputMode="email" autoComplete="email" value={lead.email} onChange={(event) => setField("email", event.target.value)} />
        </FieldShell>
        <FieldShell id="residenceCity" label={copy.city} required error={errors.cityId ? copy.errors[errors.cityId] : undefined}>
          <MoroccanCitySelector
            id="residenceCity"
            locale={locale}
            value={lead.cityId}
            manualName={lead.manualCity}
            copy={copy.citySelector}
            manualError={errors.manualCity ? copy.errors[errors.manualCity] : undefined}
            onChange={(selection) => {
              started();
              setLead((previous) => ({
                ...previous,
                cityId: selection.cityId ?? "",
                manualCity: selection.cityId === OTHER_CITY_ID ? selection.manualName ?? "" : undefined,
              }));
              setOnboardingPayload((previous) => ({ ...previous, residenceCity: selection.cityName ?? "" }));
            }}
          />
        </FieldShell>
        <div>
          <CheckboxRow
            id="marketingConsent"
            checked={lead.marketingConsent}
            onChange={(value) => {
              setField("marketingConsent", value);
              setOnboardingPayload((previous) => ({ ...previous, abandonedReminderConsent: value }));
            }}
            label={<>{copy.consent} <Link href={`/${locale}/privacy`} target="_blank" className="font-medium text-primary underline underline-offset-2">{copy.privacy}</Link>.</>}
          />
          {errors.marketingConsent ? <p role="alert" className="mt-1 ps-8 text-xs font-medium text-red-600">{copy.errors[errors.marketingConsent]}</p> : null}
        </div>
        <TurnstileWidget onToken={setTurnstileToken} />
      </div>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="companyWebsite">Company website</label>
        <input id="companyWebsite" tabIndex={-1} autoComplete="off" value={lead.companyWebsite ?? ""} onChange={(event) => setLead((previous) => ({ ...previous, companyWebsite: event.target.value }))} />
      </div>

      {errorMessage ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{errorMessage}</p> : null}
      <button type="submit" disabled={status === "submitting"} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-60">
        {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {status === "submitting" ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
