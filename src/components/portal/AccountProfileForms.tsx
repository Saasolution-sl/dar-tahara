"use client";

import * as React from "react";
import Link from "next/link";
import {
  CircleAlert,
  CreditCard,
  Eye,
  LockKeyhole,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { localeMeta, locales, type Locale } from "@/i18n/config";
import type { ProfileCopy } from "@/i18n/profile-copy";
import { cn } from "@/lib/utils";

export type EditableCustomerProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  preferredLanguage: Locale;
  countryOfResidence: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountryCode: string;
  marketingConsent: boolean;
};

type PaymentMethodSummary = {
  type: string;
  label: string;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  billingName: string | null;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function CustomerProfileForm({
  copy,
  initial,
}: {
  copy: ProfileCopy;
  initial: EditableCustomerProfile;
}) {
  const [state, setState] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...Object.fromEntries(data),
        marketingConsent: data.get("marketingConsent") === "on",
      }),
    });
    setState(response.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field label={copy.firstName}>
          <input
            className="input mt-2"
            name="firstName"
            defaultValue={initial.firstName}
            autoComplete="given-name"
            maxLength={100}
          />
        </Field>
        <Field label={copy.lastName}>
          <input
            className="input mt-2"
            name="lastName"
            defaultValue={initial.lastName}
            autoComplete="family-name"
            maxLength={100}
          />
        </Field>
        <Field label={copy.phone}>
          <input
            className="input mt-2"
            name="phone"
            defaultValue={initial.phone}
            autoComplete="tel"
            required
            maxLength={40}
          />
        </Field>
        <Field label={copy.whatsapp}>
          <input
            className="input mt-2"
            name="whatsapp"
            defaultValue={initial.whatsapp}
            autoComplete="tel"
            maxLength={40}
          />
        </Field>
        <Field label={copy.preferredLanguage}>
          <select
            className="input mt-2"
            name="preferredLanguage"
            defaultValue={initial.preferredLanguage}
          >
            {locales.map((locale) => (
              <option key={locale} value={locale}>
                {localeMeta[locale].nativeLabel}
              </option>
            ))}
          </select>
        </Field>
        <Field label={copy.countryOfResidence}>
          <input
            className="input mt-2 uppercase"
            name="countryOfResidence"
            defaultValue={initial.countryOfResidence}
            autoComplete="country"
            maxLength={2}
            placeholder="MA"
          />
        </Field>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-serif text-lg">{copy.billingTitle}</h3>
        <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
          <Field label={copy.addressLine1}>
            <input
              className="input mt-2"
              name="billingAddressLine1"
              defaultValue={initial.billingAddressLine1}
              autoComplete="billing address-line1"
              maxLength={160}
            />
          </Field>
          <Field label={copy.addressLine2}>
            <input
              className="input mt-2"
              name="billingAddressLine2"
              defaultValue={initial.billingAddressLine2}
              autoComplete="billing address-line2"
              maxLength={160}
            />
          </Field>
          <Field label={copy.city}>
            <input
              className="input mt-2"
              name="billingCity"
              defaultValue={initial.billingCity}
              autoComplete="billing address-level2"
              maxLength={120}
            />
          </Field>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_110px] gap-3">
            <Field label={copy.postalCode}>
              <input
                className="input mt-2"
                name="billingPostalCode"
                defaultValue={initial.billingPostalCode}
                autoComplete="billing postal-code"
                maxLength={20}
              />
            </Field>
            <Field label={copy.countryCode}>
              <input
                className="input mt-2 uppercase"
                name="billingCountryCode"
                defaultValue={initial.billingCountryCode}
                autoComplete="billing country"
                maxLength={2}
                placeholder="MA"
              />
            </Field>
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-secondary/40 p-4 text-sm leading-6">
        <input
          type="checkbox"
          name="marketingConsent"
          defaultChecked={initial.marketingConsent}
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
        />
        <span>{copy.marketingConsent}</span>
      </label>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <button
          disabled={state === "saving"}
          className={buttonVariants({ variant: "primary", size: "md" })}
        >
          {state === "saving" ? copy.saving : copy.save}
        </button>
        {state === "saved" ? (
          <p role="status" className="text-sm text-primary">
            {copy.saved}
          </p>
        ) : null}
        {state === "error" ? (
          <p role="alert" className="text-sm text-red-600">
            {copy.saveError}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function PasswordChangeForm({ copy }: { copy: ProfileCopy }) {
  const [state, setState] = React.useState<
    "idle" | "saving" | "saved" | "mismatch" | "short" | "error"
  >("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") || "");
    const newPassword = String(data.get("newPassword") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");
    if (newPassword.length < 12) {
      setState("short");
      return;
    }
    if (newPassword !== confirmPassword) {
      setState("mismatch");
      return;
    }
    setState("saving");
    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (response.ok) {
      form.reset();
      setState("saved");
      return;
    }
    setState("error");
  }

  const message =
    state === "saved"
      ? copy.passwordChanged
      : state === "mismatch"
        ? copy.passwordMismatch
        : state === "short"
          ? copy.passwordTooShort
          : state === "error"
            ? copy.passwordError
            : null;

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <Field label={copy.currentPassword}>
        <input
          className="input mt-2"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={200}
        />
      </Field>
      <Field label={copy.newPassword}>
        <input
          className="input mt-2"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={200}
        />
      </Field>
      <Field label={copy.confirmPassword}>
        <input
          className="input mt-2"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={200}
        />
      </Field>
      <div className="flex items-end">
        <button
          disabled={state === "saving"}
          className={cn(
            buttonVariants({ variant: "primary", size: "md" }),
            "w-full",
          )}
        >
          {state === "saving" ? copy.changingPassword : copy.changePassword}
        </button>
      </div>
      {message ? (
        <p
          role={state === "saved" ? "status" : "alert"}
          className={cn(
            "sm:col-span-2 text-sm",
            state === "saved" ? "text-primary" : "text-red-600",
          )}
        >
          {message}
        </p>
      ) : null}
      </form>
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {copy.resetPasswordHelp}
        </p>
        <Link
          href="/forgot-password"
          className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {copy.resetPassword}
        </Link>
      </div>
    </div>
  );
}

export function PaymentDetailsGate({
  copy,
  accountEmail,
  paymentMethodReady,
}: {
  copy: ProfileCopy;
  accountEmail: string;
  paymentMethodReady: boolean;
}) {
  const [state, setState] = React.useState<
    "locked" | "checking" | "visible" | "invalid" | "unavailable"
  >("locked");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethodSummary | null>(null);
  const [portalUrl, setPortalUrl] = React.useState<string | null>(null);
  const [setupState, setSetupState] = React.useState<
    | "idle"
    | "opening"
    | "error"
    | "not_configured"
    | "success"
    | "cancelled"
  >("idle");

  React.useEffect(() => {
    const result = new URLSearchParams(window.location.search).get(
      "paymentSetup",
    );
    if (result === "success" || result === "cancelled") {
      setSetupState(result);
    }
  }, []);

  async function startPaymentSetup() {
    setSetupState("opening");
    const response = await fetch("/api/account/payment-method/setup", {
      method: "POST",
    });
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
      url?: string;
    };
    if (response.status === 409) {
      window.location.reload();
      return;
    }
    if (!response.ok || !result.url) {
      setSetupState(
        result.error === "stripe_not_configured"
          ? "not_configured"
          : "error",
      );
      return;
    }
    window.location.assign(result.url);
  }

  async function reveal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("checking");
    setPaymentMethod(null);
    setPortalUrl(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/account/payment-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
    });
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
      paymentMethod?: PaymentMethodSummary | null;
      portalUrl?: string | null;
    };
    const password = form.elements.namedItem("password");
    if (password instanceof HTMLInputElement) password.value = "";
    if (!response.ok) {
      setState(
        result.error === "invalid_credentials" ? "invalid" : "unavailable",
      );
      return;
    }
    setPaymentMethod(result.paymentMethod || null);
    setPortalUrl(result.portalUrl || null);
    setState("visible");
  }

  if (!paymentMethodReady) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {copy.paymentRequired}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {copy.paymentRequiredBody}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={setupState === "opening"}
          onClick={startPaymentSetup}
          className={buttonVariants({ variant: "primary", size: "md" })}
        >
          <CreditCard className="me-2 h-4 w-4" />
          {setupState === "opening"
            ? copy.openingSecurePayment
            : copy.addPaymentDetails}
        </button>
        {setupState === "error" ? (
          <p role="alert" className="text-sm text-red-600">
            {copy.paymentSetupError}
          </p>
        ) : null}
        {setupState === "not_configured" ? (
          <p role="alert" className="text-sm text-amber-700">
            {copy.paymentSetupNotConfigured}
          </p>
        ) : null}
        {setupState === "success" ? (
          <p role="status" className="text-sm text-primary">
            {copy.paymentSetupSuccess}
          </p>
        ) : null}
        {setupState === "cancelled" ? (
          <p role="status" className="text-sm text-muted-foreground">
            {copy.paymentSetupCancelled}
          </p>
        ) : null}
        <p className="text-xs leading-5 text-muted-foreground">
          {copy.secureStripeNote}
        </p>
      </div>
    );
  }

  if (state === "visible") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {copy.defaultPaymentMethod}
              </p>
              {paymentMethod ? (
                <>
                  <p className="mt-1 break-words font-semibold">
                    {paymentMethod.label}
                    {paymentMethod.last4 ? ` •••• ${paymentMethod.last4}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    {paymentMethod.expMonth && paymentMethod.expYear ? (
                      <span>
                        {copy.expires}:{" "}
                        {String(paymentMethod.expMonth).padStart(2, "0")}/
                        {paymentMethod.expYear}
                      </span>
                    ) : null}
                    {paymentMethod.billingName ? (
                      <span>
                        {copy.billingName}: {paymentMethod.billingName}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {copy.noPaymentMethod}
                </p>
              )}
            </div>
          </div>
        </div>
        {portalUrl ? (
          <a
            href={portalUrl}
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            {copy.changePaymentMethod}
          </a>
        ) : null}
        <p className="text-xs leading-5 text-muted-foreground">
          {copy.secureStripeNote}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={reveal} className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl bg-secondary/40 p-4">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">{copy.paymentLocked}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy.paymentIntro}
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {copy.credentialsIntro}
      </p>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field label={copy.email}>
          <input
            className="input mt-2"
            name="email"
            type="email"
            defaultValue={accountEmail}
            autoComplete="email"
            required
          />
        </Field>
        <Field label={copy.currentPassword}>
          <input
            className="input mt-2"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            maxLength={200}
          />
        </Field>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <button
          disabled={state === "checking"}
          className={buttonVariants({ variant: "primary", size: "md" })}
        >
          <Eye className="me-2 h-4 w-4" />
          {state === "checking"
            ? copy.checkingCredentials
            : copy.revealPaymentDetails}
        </button>
        {state === "invalid" ? (
          <p role="alert" className="text-sm text-red-600">
            {copy.invalidCredentials}
          </p>
        ) : null}
        {state === "unavailable" ? (
          <p role="alert" className="text-sm text-red-600">
            {copy.paymentUnavailable}
          </p>
        ) : null}
      </div>
    </form>
  );
}
