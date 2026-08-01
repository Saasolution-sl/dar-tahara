"use client";

import * as React from "react";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";

export function DeepCleanRequestButton({
  copy, subscriptionId, isFree, priceLabel,
}: {
  copy: PortalCopy["deepClean"];
  subscriptionId: string;
  isFree: boolean;
  /** Already-formatted money string (e.g. "€180.00"), or the free label. */
  priceLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={buttonVariants({ variant: "outline", size: "sm" })}>
        {copy.requestButton} — {priceLabel}
      </button>
      {open ? (
        <DeepCleanRequestModal
          copy={copy}
          subscriptionId={subscriptionId}
          isFree={isFree}
          priceLabel={priceLabel}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function DeepCleanRequestModal({
  copy, subscriptionId, isFree, priceLabel, onClose,
}: {
  copy: PortalCopy["deepClean"];
  subscriptionId: string;
  isFree: boolean;
  priceLabel: string;
  onClose: () => void;
}) {
  const [requestedDate, setRequestedDate] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "redirecting" | "done">("idle");
  const [error, setError] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const res = await fetch("/api/account/deep-clean-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, requestedDate }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; checkoutUrl?: string; error?: string };
    if (!res.ok || !data.ok) {
      setError(copy.errors[data.error || ""] || copy.errors.bad_request);
      setStatus("idle");
      return;
    }
    if (data.checkoutUrl) {
      setStatus("redirecting");
      location.assign(data.checkoutUrl);
      return;
    }
    setStatus("done");
    setTimeout(() => location.reload(), 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={copy.modalTitle}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">{copy.modalTitle}</h2>
          <button onClick={onClose} aria-label={copy.cancel} className="text-muted-foreground hover:text-foreground">×</button>
        </div>
        {status === "done" || status === "redirecting" ? (
          <p className="mt-6 text-sm">{status === "redirecting" ? copy.redirecting : copy.success}</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{copy.priceLabel}</span>
              <span className="font-serif text-lg">{isFree ? copy.freePriceLabel : priceLabel}</span>
            </div>
            <label className="block text-sm">
              {copy.dateLabel}
              <input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} required className="input mt-2" />
            </label>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className={buttonVariants({ variant: "outline", size: "md" })}>{copy.cancel}</button>
              <button type="submit" disabled={status === "submitting"} className={buttonVariants({ variant: "primary", size: "md" })}>{status === "submitting" ? copy.submitting : copy.submit}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
