"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { EarlyAccessCopy } from "@/i18n/early-access-copy";
import { isValidEmail } from "@/lib/early-access/schema";

/**
 * Resend-confirmation form shown on the pending/expired/invalid success states.
 * Enumeration-safe end to end: the server always returns ok, and the UI shows a
 * uniform "if that email is on our list…" message regardless of the outcome.
 */
export function ResendForm({ locale, copy }: { locale: Locale; copy: EarlyAccessCopy }) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");
  const id = React.useId();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) return;
    setState("sending");
    try {
      await fetch("/api/early-access/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
    } catch {
      /* uniform response regardless */
    }
    setState("done");
  }

  if (state === "done") {
    return <p className="mt-4 rounded-xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">{copy.success.resent}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <label htmlFor={id} className="sr-only">{copy.fields.email}</label>
      <input
        id={id}
        type="email"
        inputMode="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={copy.fields.email}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {copy.success.resend}
      </button>
    </form>
  );
}
