/**
 * Dar Tahara, AC maintenance pricing and benefit-window scheduling.
 *
 * Pure, no Supabase/Stripe dependency (same split as subscription-duration.ts
 * / deep-clean-pricing.ts). The included unit is always the customer's
 * designated included AC; every other registered unit is a paid add-on.
 */

import { addUtcMonthsClamped } from "./early-termination-calculator";

/**
 * Fixed monthly price per paid additional AC unit, in cents (EUR — matching
 * every other price in the app; nothing here is MAD, see
 * subscription-duration.ts's currency conventions). Single source: no other
 * module or component should hardcode 400.
 */
export const AC_ADDON_PRICE_CENTS = 400;

/** How many of a property's registered AC units are paid add-ons. The first (the included unit) is never counted here. */
export function computeAdditionalAcCount(totalUnits: number): number {
  return Math.max(Math.trunc(totalUnits) - 1, 0);
}

/** Monthly AC add-on charge in cents for a given count of paid units. Zero when there are none: never charge for the included unit. */
export function computeAcAddonCents(paidUnitCount: number): number {
  return Math.max(Math.trunc(paidUnitCount), 0) * AC_ADDON_PRICE_CENTS;
}

export type BenefitWindow = { start: string; end: string };
export type BenefitWindows = { window1: BenefitWindow; window2: BenefitWindow };

/**
 * Splits one rolling 12-month AC maintenance benefit period into two ~6-month
 * service windows, so both included visits can't be front-loaded on day one
 * (spec: roughly semi-annual preventative maintenance). Matches the
 * documented example exactly: coverage starting 15 September gives windows
 * 15 Sep-14 Mar and 15 Mar-14 Sep, non-overlapping. Uses the same
 * month-end-clamped calendar arithmetic already proven in
 * early-termination-calculator.ts rather than reimplementing it.
 */
export function generateBenefitWindows(coverageStartedAt: Date): BenefitWindows {
  const periodEnd = addUtcMonthsClamped(coverageStartedAt, 12);
  const midpoint = addUtcMonthsClamped(coverageStartedAt, 6);
  return {
    window1: { start: toDateString(coverageStartedAt), end: toDateString(dayBefore(midpoint)) },
    window2: { start: toDateString(midpoint), end: toDateString(dayBefore(periodEnd)) },
  };
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayBefore(date: Date): Date {
  return new Date(date.getTime() - 24 * 60 * 60 * 1000);
}
