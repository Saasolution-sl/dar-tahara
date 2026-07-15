"use client";

import * as React from "react";
import { Check, Loader2, ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import type { SignupSource } from "@/lib/mailing-list";
import { isValidEmail } from "@/lib/mailing-list";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "./turnstile-widget";

const SUBSCRIBED_KEY = "dt_ml_subscribed";

type Status = "idle" | "submitting" | "success" | "error";

export function SubscribeForm({
  locale,
  dict,
  source,
  variant = "inline",
  onSuccess,
  labels,
}: {
  locale: Locale;
  dict: Dictionary["mailing"];
  source: SignupSource;
  variant?: "inline" | "popup";
  onSuccess?: () => void;
  // Widened to plain strings: callers pass copy from other sources (e.g. the
  // campaign copy), not only literal dictionary values.
  labels?: Partial<Record<"emailPlaceholder" | "button" | "success" | "consent", string>>;
}) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorKey, setErrorKey] = React.useState<keyof Dictionary["mailing"]["errors"] | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);
  const emailId = React.useId();
  const errId = React.useId();

  function onFocus() {
    if (!startedRef.current) {
      startedRef.current = true;
      track("mailing_list_signup_started", { source });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorKey(null);
    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorKey("invalid_email");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          language: locale,
          source,
          consent: true,
          turnstileToken: token,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; doubleOptIn?: boolean };
      if (res.ok && data.ok) {
        setStatus("success");
        try {
          localStorage.setItem(SUBSCRIBED_KEY, "1");
        } catch {
          /* storage may be blocked */
        }
        track("mailing_list_signup_completed", { source, locale });
        onSuccess?.();
      } else {
        setStatus("error");
        const known: (keyof Dictionary["mailing"]["errors"])[] = [
          "invalid_email", "rate_limited", "captcha_failed", "consent_required", "server_error",
        ];
        setErrorKey(known.includes(data.error as never) ? (data.error as never) : "server_error");
      }
    } catch {
      setStatus("error");
      setErrorKey("network");
    }
  }

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl bg-primary/[0.06] p-4 text-sm dark:bg-primary/[0.12]",
          variant === "popup" && "mt-2",
        )}
        role="status"
        aria-live="polite"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" />
        </span>
        <p className="leading-relaxed text-foreground">{labels?.success ?? dict.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={emailId} className="sr-only">
          {labels?.emailPlaceholder ?? dict.emailPlaceholder}
        </label>
        <input
          id={emailId}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={onFocus}
          placeholder={labels?.emailPlaceholder ?? dict.emailPlaceholder}
          aria-invalid={status === "error"}
          aria-describedby={errorKey ? errId : undefined}
          disabled={status === "submitting"}
          className="h-12 w-full rounded-full border border-border bg-background px-5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 ease-luxe hover:-translate-y-0.5 hover:shadow-lift disabled:pointer-events-none disabled:opacity-70"
        >
          {status === "submitting" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {labels?.button ?? dict.button}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <TurnstileWidget onToken={setToken} />

      {errorKey ? (
        <p id={errId} className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {dict.errors[errorKey]}
        </p>
      ) : null}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{labels?.consent ?? dict.consent}</p>
    </form>
  );
}
