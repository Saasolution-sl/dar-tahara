/**
 * Deterministic early-termination settlement policy.
 *
 * Money is represented exclusively in integer minor units. Database, Stripe,
 * email and UI concerns deliberately live outside this module.
 */

import type { DurationTier } from "@/lib/subscription-duration";

export type BillingMethod = "monthly" | "prepaid";

export type EarlyTerminationEligibilityInput = {
  billingMethod: BillingMethod;
  contractDurationMonths: number | null;
  activatedAt: Date | null;
  contractEndAt: Date | null;
  asOf: Date;
  subscriptionStatus: string;
  cancellationStatus: string | null;
  administratorWaiver?: boolean;
};

export type EarlyTerminationEligibility =
  | { eligible: true }
  | {
      eligible: false;
      reason:
        | "prepaid_contract"
        | "no_fixed_term_contract"
        | "contract_not_started"
        | "outside_minimum_term"
        | "already_terminated"
        | "administrator_waiver";
    };

export function evaluateEarlyTerminationEligibility(
  input: EarlyTerminationEligibilityInput,
): EarlyTerminationEligibility {
  if (input.administratorWaiver) return { eligible: false, reason: "administrator_waiver" };
  if (input.billingMethod === "prepaid") return { eligible: false, reason: "prepaid_contract" };
  if (!input.contractDurationMonths || !input.activatedAt || !input.contractEndAt) {
    return { eligible: false, reason: "no_fixed_term_contract" };
  }
  if (input.asOf.getTime() < input.activatedAt.getTime()) {
    return { eligible: false, reason: "contract_not_started" };
  }
  if (input.asOf.getTime() >= input.contractEndAt.getTime()) {
    return { eligible: false, reason: "outside_minimum_term" };
  }
  if (
    input.subscriptionStatus === "cancelled"
    || input.cancellationStatus === "confirmed"
    || input.cancellationStatus === "settled"
  ) {
    return { eligible: false, reason: "already_terminated" };
  }
  return { eligible: true };
}

function daysInUtcMonth(year: number, zeroBasedMonth: number): number {
  return new Date(Date.UTC(year, zeroBasedMonth + 1, 0)).getUTCDate();
}

/** Adds calendar months without JavaScript's end-of-month overflow drift. */
export function addUtcMonthsClamped(date: Date, months: number): Date {
  const targetMonthIndex = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const targetDay = Math.min(date.getUTCDate(), daysInUtcMonth(targetYear, targetMonth));
  return new Date(Date.UTC(
    targetYear,
    targetMonth,
    targetDay,
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  ));
}

function fullMonthsBetween(start: Date, end: Date): number {
  if (end.getTime() <= start.getTime()) return 0;
  let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12
    + (end.getUTCMonth() - start.getUTCMonth());
  if (addUtcMonthsClamped(start, months).getTime() > end.getTime()) months -= 1;
  return Math.max(0, months);
}

export type ContractCycleState = {
  completedMonths: number;
  currentContractMonth: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};

/**
 * A billing anniversary closes the prior period and starts the next contract
 * month at the same instant. Thus 2026-04-01 for a 2026-01-01 activation
 * means three periods completed and contract month four started.
 *
 * Approved full-month pauses extend the contract clock. The existing
 * `pause_months_used` counter is the source of truth for those extensions.
 */
export function determineContractCycleState(
  activatedAt: Date,
  pauseMonthsUsed: number,
  asOf: Date,
): ContractCycleState {
  const normalizedPauseMonths = Math.max(0, Math.trunc(pauseMonthsUsed));
  const calendarMonths = fullMonthsBetween(activatedAt, asOf);
  const completedMonths = Math.max(0, calendarMonths - normalizedPauseMonths);
  const currentPeriodStart = addUtcMonthsClamped(
    activatedAt,
    completedMonths + normalizedPauseMonths,
  );
  return {
    completedMonths,
    currentContractMonth: completedMonths + 1,
    currentPeriodStart,
    currentPeriodEnd: addUtcMonthsClamped(currentPeriodStart, 1),
  };
}

/** Backwards-compatible name retained for pause and boundary callers. */
export function computeElapsedMonths(
  activatedAt: Date,
  pauseMonthsUsed: number,
  asOf: Date,
): number {
  return determineContractCycleState(activatedAt, pauseMonthsUsed, asOf).completedMonths;
}

export function selectReplacementTier(
  currentContractMonth: number,
  tiers: DurationTier[],
): DurationTier | null {
  const enabled = tiers.filter((tier) => tier.enabled).sort((a, b) => a.months - b.months);
  if (enabled.length === 0) return null;
  return enabled.find((tier) => tier.months >= currentContractMonth)
    ?? enabled[enabled.length - 1];
}

/** Legacy export used by older callers/tests; argument is coverage months. */
export const selectReclassifiedTier = selectReplacementTier;

export function tierMonthlyPriceCents(
  priceBeforeDurationDiscountCents: number,
  tier: DurationTier,
): number {
  return Math.round(
    priceBeforeDurationDiscountCents * (10_000 - Math.round(tier.discountPercentage * 100)) / 10_000,
  );
}

export type DeepCleanRecoveryInput = {
  used: boolean;
  originalTierIncludesFreeDeepClean: boolean;
  replacementTierIncludesFreeDeepClean: boolean;
  retailPriceCents: number | null;
};

export function computeDeepCleanRecovery(input: DeepCleanRecoveryInput): number {
  if (!input.used) return 0;
  if (!input.originalTierIncludesFreeDeepClean) return 0;
  if (input.replacementTierIncludesFreeDeepClean) return 0;
  return input.retailPriceCents ?? 0;
}

export type SettlementInvoiceAllocationInput = {
  id: string;
  status: string;
  amountDueCents: number;
  amountPaidCents: number;
  periodStart: Date | null;
  periodEnd: Date | null;
};

export type SettlementInvoiceAllocation = {
  completedPeriodPaymentsCents: number;
  remainingTermPaymentsCents: number;
  includedInvoiceOutstandingCents: number;
  includedInvoiceIds: string[];
};

/**
 * Every still-open subscription invoice is absorbed into the settlement and
 * removed from normal collection. Its outstanding balance is disclosed but
 * not added again: completed periods are already represented by
 * `recalculatedConsumed - actualPaid`, and current/future periods are already
 * represented by the replacement minimum-term charge.
 */
export function summarizeSettlementInvoiceAllocations(
  invoices: SettlementInvoiceAllocationInput[],
  currentPeriodStart: Date,
): SettlementInvoiceAllocation {
  let completedPeriodPaymentsCents = 0;
  let remainingTermPaymentsCents = 0;
  let includedInvoiceOutstandingCents = 0;
  const includedInvoiceIds: string[] = [];

  for (const invoice of invoices) {
    if (invoice.status === "void" || invoice.status === "refunded" || invoice.status === "uncollectible") {
      continue;
    }
    const paid = Math.max(0, Math.min(invoice.amountDueCents, invoice.amountPaidCents));
    if (invoice.periodEnd && invoice.periodEnd.getTime() <= currentPeriodStart.getTime()) {
      completedPeriodPaymentsCents += paid;
    } else {
      remainingTermPaymentsCents += paid;
    }
    const outstanding = Math.max(0, invoice.amountDueCents - invoice.amountPaidCents);
    if (
      outstanding > 0
      && (invoice.status === "open" || invoice.status === "overdue")
    ) {
      includedInvoiceIds.push(invoice.id);
      includedInvoiceOutstandingCents += outstanding;
    }
  }

  return {
    completedPeriodPaymentsCents,
    remainingTermPaymentsCents,
    includedInvoiceOutstandingCents,
    includedInvoiceIds,
  };
}

export type EarlyTerminationInput = {
  activatedAt: Date;
  pauseMonthsUsed: number;
  asOf: Date;
  originalTier: DurationTier;
  tiers: DurationTier[];
  priceBeforeDurationDiscountCents: number;
  currency: string;
  amountPreviouslyPaidCents: number;
  paymentsAllocatedToRemainingTermCents?: number;
  includedInvoiceOutstandingCents?: number;
  includedInvoiceIds?: string[];
  additionalChargesCents?: number;
  creditsCents?: number;
  settlementPaymentsAlreadyReceivedCents?: number;
  deepClean: { used: boolean; retailPriceCents: number | null };
};

export type EarlyTerminationResult = {
  completedMonths: number;
  /** Deprecated response alias retained while old clients roll forward. */
  elapsedMonths: number;
  currentContractMonth: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  alreadyFullyServed: boolean;
  originalTier: DurationTier;
  replacementTier: DurationTier;
  /** Deprecated response alias retained while old clients roll forward. */
  reclassifiedTier: DurationTier;
  remainingMinimumMonths: number;
  originalMonthlyCents: number;
  replacementMonthlyCents: number;
  /** Deprecated response alias retained while old clients roll forward. */
  reclassifiedMonthlyCents: number;
  amountPreviouslyPaidCents: number;
  recalculatedConsumedPeriodCents: number;
  discountCorrectionCents: number;
  remainingMinimumTermAmountCents: number;
  /** Deprecated response alias retained while old clients roll forward. */
  remainingMinimumChargeCents: number;
  paymentsAllocatedToRemainingTermCents: number;
  includedInvoiceOutstandingCents: number;
  includedInvoiceIds: string[];
  additionalChargesCents: number;
  deepCleanRecoveryCents: number;
  creditsCents: number;
  settlementPaymentsAlreadyReceivedCents: number;
  rawTotalCents: number;
  creditReviewRequired: boolean;
  totalCents: number;
  currency: string;
};

export function calculateEarlyTermination(
  input: EarlyTerminationInput,
): EarlyTerminationResult {
  const cycle = determineContractCycleState(
    input.activatedAt,
    input.pauseMonthsUsed,
    input.asOf,
  );
  const alreadyFullyServed = cycle.completedMonths >= input.originalTier.months;
  const replacementTier = alreadyFullyServed
    ? input.originalTier
    : (selectReplacementTier(cycle.currentContractMonth, input.tiers) ?? input.originalTier);
  const originalMonthlyCents = tierMonthlyPriceCents(
    input.priceBeforeDurationDiscountCents,
    input.originalTier,
  );
  const replacementMonthlyCents = tierMonthlyPriceCents(
    input.priceBeforeDurationDiscountCents,
    replacementTier,
  );
  const amountPreviouslyPaidCents = Math.max(0, input.amountPreviouslyPaidCents);
  const recalculatedConsumedPeriodCents = alreadyFullyServed
    ? 0
    : cycle.completedMonths * replacementMonthlyCents;
  const discountCorrectionCents = alreadyFullyServed
    ? 0
    : recalculatedConsumedPeriodCents - amountPreviouslyPaidCents;
  const remainingMinimumMonths = alreadyFullyServed
    ? 0
    : Math.max(0, replacementTier.months - cycle.completedMonths);
  const remainingMinimumTermAmountCents = remainingMinimumMonths * replacementMonthlyCents;
  const paymentsAllocatedToRemainingTermCents = Math.max(
    0,
    input.paymentsAllocatedToRemainingTermCents ?? 0,
  );
  const additionalChargesCents = Math.max(0, input.additionalChargesCents ?? 0);
  const creditsCents = Math.max(0, input.creditsCents ?? 0);
  const settlementPaymentsAlreadyReceivedCents = Math.max(
    0,
    input.settlementPaymentsAlreadyReceivedCents ?? 0,
  );
  const deepCleanRecoveryCents = computeDeepCleanRecovery({
    used: input.deepClean.used,
    originalTierIncludesFreeDeepClean: input.originalTier.includesFreeDeepClean,
    replacementTierIncludesFreeDeepClean: replacementTier.includesFreeDeepClean,
    retailPriceCents: input.deepClean.retailPriceCents,
  });
  const rawTotalCents = discountCorrectionCents
    + remainingMinimumTermAmountCents
    + additionalChargesCents
    + deepCleanRecoveryCents
    - paymentsAllocatedToRemainingTermCents
    - creditsCents
    - settlementPaymentsAlreadyReceivedCents;
  const creditReviewRequired = rawTotalCents < 0;

  return {
    completedMonths: cycle.completedMonths,
    elapsedMonths: cycle.completedMonths,
    currentContractMonth: cycle.currentContractMonth,
    currentPeriodStart: cycle.currentPeriodStart.toISOString(),
    currentPeriodEnd: cycle.currentPeriodEnd.toISOString(),
    alreadyFullyServed,
    originalTier: input.originalTier,
    replacementTier,
    reclassifiedTier: replacementTier,
    remainingMinimumMonths,
    originalMonthlyCents,
    replacementMonthlyCents,
    reclassifiedMonthlyCents: replacementMonthlyCents,
    amountPreviouslyPaidCents,
    recalculatedConsumedPeriodCents,
    discountCorrectionCents,
    remainingMinimumTermAmountCents,
    remainingMinimumChargeCents: remainingMinimumTermAmountCents,
    paymentsAllocatedToRemainingTermCents,
    includedInvoiceOutstandingCents: Math.max(0, input.includedInvoiceOutstandingCents ?? 0),
    includedInvoiceIds: input.includedInvoiceIds ?? [],
    additionalChargesCents,
    deepCleanRecoveryCents,
    creditsCents,
    settlementPaymentsAlreadyReceivedCents,
    rawTotalCents,
    creditReviewRequired,
    totalCents: Math.max(0, rawTotalCents),
    currency: input.currency,
  };
}
