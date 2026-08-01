"use client";

import * as React from "react";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";
import { money, shortDate } from "@/lib/portal-format";
import type { Locale } from "@/i18n/config";

type Breakdown = {
  alreadyFullyServed: boolean;
  creditReviewRequired: boolean;
  completedMonths: number;
  originalTier: { months: number };
  replacementTier: { months: number };
  remainingMinimumMonths: number;
  originalMonthlyCents: number;
  replacementMonthlyCents: number;
  amountPreviouslyPaidCents: number;
  recalculatedConsumedPeriodCents: number;
  discountCorrectionCents: number;
  remainingMinimumTermAmountCents: number;
  paymentsAllocatedToRemainingTermCents: number;
  includedInvoiceOutstandingCents: number;
  additionalChargesCents: number;
  deepCleanRecoveryCents: number;
  creditsCents: number;
  totalCents: number;
  currency: string;
};

type PreviewResponse = {
  calculationId: string;
  contract: {
    property: string;
    frequency: string;
    startDate: string;
    originalEndDate: string | null;
    originalTermMonths: number;
    completedMonths: number;
    currentMonth: number;
  };
  breakdown: Breakdown;
};

type ConfirmResponse = {
  ok: true;
  settlementRequired: boolean;
  payUrl?: string | null;
};

export function CancellationButton({
  copy,
  subscriptionId,
  locale,
  autoOpen,
}: {
  copy: PortalCopy["cancellation"];
  subscriptionId: string;
  locale: Locale;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(Boolean(autoOpen));
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {copy.requestButton}
      </button>
      {open ? (
        <CancellationModal
          copy={copy}
          subscriptionId={subscriptionId}
          locale={locale}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

export function DisableRenewalButton({
  copy,
  subscriptionId,
  locale,
  currentTermEnd,
  renewalDisabled,
}: {
  copy: PortalCopy["cancellation"];
  subscriptionId: string;
  locale: Locale;
  currentTermEnd: string | null;
  renewalDisabled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "saving" | "done" | "error">(
    renewalDisabled ? "done" : "idle",
  );

  async function disableRenewal() {
    setState("saving");
    const response = await fetch(
      `/api/account/subscriptions/${subscriptionId}/renewal/disable`,
      { method: "POST" },
    );
    setState(response.ok ? "done" : "error");
  }

  if (renewalDisabled && !open) {
    return <p className="text-xs text-muted-foreground">{copy.renewalDisabled}</p>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        {copy.disableRenewalButton}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={copy.disableRenewalButton}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-serif text-xl">{copy.disableRenewalButton}</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {copy.prepaidEndsMessage.replace(
                "{date}",
                shortDate(currentTermEnd, locale),
              )}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {copy.prepaidNoRefundMessage}
            </p>
            {state === "done" ? (
              <p className="mt-4 text-sm font-medium text-primary">
                {copy.renewalDisabled}
              </p>
            ) : null}
            {state === "error" ? (
              <p className="mt-4 text-sm text-red-700">
                {copy.errors.bad_request}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline", size: "md" })}
              >
                {copy.cancel}
              </button>
              {state !== "done" ? (
                <button
                  disabled={state === "saving"}
                  onClick={disableRenewal}
                  className={buttonVariants({ variant: "primary", size: "md" })}
                >
                  {state === "saving"
                    ? copy.disablingRenewal
                    : copy.disableRenewalButton}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CancellationModal({
  copy,
  subscriptionId,
  locale,
  onClose,
}: {
  copy: PortalCopy["cancellation"];
  subscriptionId: string;
  locale: Locale;
  onClose: () => void;
}) {
  const [state, setState] = React.useState<
    "loading" | "preview" | "confirming" | "done" | "error"
  >("loading");
  const [preview, setPreview] = React.useState<PreviewResponse | null>(null);
  const [result, setResult] = React.useState<ConfirmResponse | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch(
        `/api/account/subscriptions/${subscriptionId}/cancellation/preview`,
        { method: "POST" },
      );
      const data = (await response.json().catch(() => ({}))) as PreviewResponse & {
        error?: string;
      };
      if (cancelled) return;
      if (!response.ok) {
        setError(copy.errors[data.error || ""] || copy.errors.bad_request);
        setState("error");
        return;
      }
      setPreview(data);
      setState("preview");
    })();
    return () => {
      cancelled = true;
    };
  }, [copy.errors, subscriptionId]);

  async function confirm() {
    if (!preview) return;
    setState("confirming");
    setError("");
    const response = await fetch(
      `/api/account/subscriptions/${subscriptionId}/cancellation/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calculationId: preview.calculationId }),
      },
    );
    const data = (await response.json().catch(() => ({}))) as ConfirmResponse & {
      error?: string;
    };
    if (!response.ok) {
      setError(copy.errors[data.error || ""] || copy.errors.bad_request);
      setState("preview");
      return;
    }
    setResult(data);
    setState("done");
  }

  const breakdown = preview?.breakdown;
  const row = (label: string, cents: number, negative = false) => (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-right">
        {negative ? "−" : ""}
        {money(Math.abs(cents), breakdown!.currency, locale)}
      </span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={copy.modalTitle}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">{copy.modalTitle}</h2>
          <button
            onClick={onClose}
            aria-label={copy.cancel}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>

        {state === "loading" ? (
          <p className="mt-6 text-sm text-muted-foreground">{copy.loading}</p>
        ) : null}
        {state === "error" ? (
          <p className="mt-6 text-sm text-red-700">{error}</p>
        ) : null}

        {(state === "preview" || state === "confirming") && preview && breakdown ? (
          <>
            <p className="mt-5 text-sm text-muted-foreground">
              {copy.currentMonthLabel
                .replace("{current}", String(preview.contract.currentMonth))
                .replace("{total}", String(preview.contract.originalTermMonths))}
            </p>
            <div className="mt-4 space-y-2 rounded-xl border border-border p-4 text-sm">
              <h3 className="font-medium">{copy.originalContractLabel}</h3>
              <p className="text-muted-foreground">
                {preview.contract.property} · {preview.contract.frequency} ·{" "}
                {copy.termMonthsLabel.replace(
                  "{months}",
                  String(breakdown.originalTier.months),
                )}
              </p>
              <p className="text-muted-foreground">
                {copy.contractDatesLabel
                  .replace("{start}", shortDate(preview.contract.startDate, locale))
                  .replace(
                    "{end}",
                    shortDate(preview.contract.originalEndDate, locale),
                  )}
              </p>
              {row(copy.amountAlreadyPaidLabel, breakdown.amountPreviouslyPaidCents)}
              {row(copy.originalMonthlyPriceLabel, breakdown.originalMonthlyCents)}

              <h3 className="border-t border-border pt-3 font-medium">
                {copy.replacementMinimumTermLabel}
              </h3>
              <p className="text-muted-foreground">
                {copy.termMonthsLabel.replace(
                  "{months}",
                  String(breakdown.replacementTier.months),
                )} ·{" "}
                {copy.replacementMonthlyPriceLabel}:{" "}
                {money(breakdown.replacementMonthlyCents, breakdown.currency, locale)}{" "}
                {copy.perMonthLabel}
              </p>
              {row(
                `${copy.recalculatedConsumedLabel} (${breakdown.completedMonths})`,
                breakdown.recalculatedConsumedPeriodCents,
              )}
              {row(copy.discountCorrectionLabel, breakdown.discountCorrectionCents)}
              {row(
                `${copy.remainingMinimumLabel} (${breakdown.remainingMinimumMonths})`,
                breakdown.remainingMinimumTermAmountCents,
              )}
              {breakdown.paymentsAllocatedToRemainingTermCents > 0
                ? row(
                    copy.paymentsAppliedLabel,
                    breakdown.paymentsAllocatedToRemainingTermCents,
                    true,
                  )
                : null}
              {breakdown.includedInvoiceOutstandingCents > 0 ? (
                <div className="rounded-lg bg-secondary/60 p-3">
                  {row(
                    copy.includedInvoicesLabel,
                    breakdown.includedInvoiceOutstandingCents,
                  )}
                </div>
              ) : null}
              {breakdown.additionalChargesCents > 0
                ? row(copy.additionalChargesLabel, breakdown.additionalChargesCents)
                : null}
              {breakdown.deepCleanRecoveryCents > 0
                ? row(copy.deepCleanRecoveryLabel, breakdown.deepCleanRecoveryCents)
                : null}
              {breakdown.creditsCents > 0
                ? row(copy.creditsLabel, breakdown.creditsCents, true)
                : null}
              <div className="border-t border-border pt-2 font-serif text-lg">
                {row(copy.totalLabel, breakdown.totalCents)}
              </div>
            </div>
            {breakdown.creditReviewRequired ? (
              <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-800">
                {copy.creditReviewMessage}
              </p>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">
                {copy.disclosure}
              </p>
            )}
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={buttonVariants({ variant: "outline", size: "md" })}
              >
                {copy.cancel}
              </button>
              {!breakdown.creditReviewRequired ? (
                <button
                  type="button"
                  disabled={state === "confirming"}
                  onClick={confirm}
                  className={buttonVariants({ variant: "primary", size: "md" })}
                >
                  {state === "confirming" ? copy.confirming : copy.confirmButton}
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {state === "done" && result ? (
          <div className="mt-6">
            <p className="text-sm">
              {result.settlementRequired
                ? copy.successWithSettlement
                : copy.successNoSettlement}
            </p>
            {result.settlementRequired && result.payUrl ? (
              <a
                href={result.payUrl}
                className={`${buttonVariants({ variant: "primary", size: "md" })} mt-4 inline-block`}
              >
                {copy.payNow}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
