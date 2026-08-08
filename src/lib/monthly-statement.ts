/**
 * Dar Tahara, combined monthly statement for monthly-billed units.
 *
 * Stripe still invoices each monthly-billing-interval subscription
 * separately (unchanged), this is a pure, portal-side aggregation layer
 * that groups a customer's per-unit invoices by calendar month so they see
 * one combined statement instead of one row per unit. Annually-billed
 * subscriptions are deliberately out of scope here, they stay as individual
 * invoices (see the invoices page, not this module).
 */

import { frequencies, type FrequencyKey } from "./pricing";

export type MonthlyUnit = {
  subscriptionId: string;
  propertyLabel: string;
  frequency: string;
  status: string;
  /** The unit must have existed by a given month to appear in that month's statement. */
  createdAt: string;
  /** Monthly list price before any subscription-duration discount/surcharge; null if no fixed-duration contract was chosen. */
  originalPriceCents?: number | null;
};

export type MonthlyInvoiceLine = {
  subscriptionId: string;
  periodStart: string;
  amountCents: number;
  currency: string;
  /** Stripe's own invoice id for this charge, so a bookkeeper can match it to their bank/card statement. */
  stripeInvoiceId?: string | null;
};

export type StatementLine = {
  subscriptionId: string;
  propertyLabel: string;
  frequency: string;
  onHold: boolean;
  amountCents: number;
  originalPriceCents?: number | null;
  stripeInvoiceId?: string | null;
};

export type MonthlyStatement = {
  /** "2026-07" */
  monthKey: string;
  totalCents: number;
  currency: string;
  lines: StatementLine[];
};

function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** True once a unit existed by the end of the given "YYYY-MM" month. */
function existedByMonth(createdAt: string, monthKey: string): boolean {
  return monthKeyOf(createdAt) <= monthKey;
}

/**
 * Build one combined statement per calendar month that has at least one
 * monthly-billed invoice, with every monthly unit that existed by that month
 * represented as a line, units with no invoice that month appear as
 * `onHold: true, amountCents: 0` (paused / not charged), never silently
 * omitted.
 */
export function buildMonthlyStatements(
  units: MonthlyUnit[],
  invoices: MonthlyInvoiceLine[],
): MonthlyStatement[] {
  const monthKeys = Array.from(new Set(invoices.map((inv) => monthKeyOf(inv.periodStart)))).sort().reverse();
  const currency = invoices[0]?.currency || "eur";

  return monthKeys.map((monthKey) => {
    const invoicesThisMonth = new Map(
      invoices.filter((inv) => monthKeyOf(inv.periodStart) === monthKey).map((inv) => [inv.subscriptionId, inv]),
    );
    const lines: StatementLine[] = units
      .filter((unit) => existedByMonth(unit.createdAt, monthKey) || invoicesThisMonth.has(unit.subscriptionId))
      .map((unit) => {
        const invoice = invoicesThisMonth.get(unit.subscriptionId);
        return {
          subscriptionId: unit.subscriptionId,
          propertyLabel: unit.propertyLabel,
          frequency: unit.frequency,
          onHold: !invoice,
          amountCents: invoice?.amountCents ?? 0,
          originalPriceCents: unit.originalPriceCents ?? null,
          stripeInvoiceId: invoice?.stripeInvoiceId ?? null,
        };
      });
    const totalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
    return { monthKey, totalCents, currency, lines };
  });
}

export type LineDiscountBreakdown = {
  subscriptionId: string;
  /** The true pre-discount list price: frequency discount and duration discount both reversed back out. */
  trueListPriceCents: number;
  frequencyDiscountCents: number;
  durationDiscountCents: number;
};

/**
 * Real total price already stacks a frequency discount (pricing.ts, static
 * per-frequency %) and a subscription-duration discount (the tier picked at
 * signup, persisted per subscription). This reconstructs both as separate,
 * disclosable amounts: reverses the frequency discount using pricing.ts's
 * current config (safe, those percentages are hardcoded, not admin-editable,
 * so they can't have silently drifted since the subscription was created),
 * then reads the duration discount straight back out of the gap between the
 * stored pre-duration price and what was actually charged (price-versioned
 * at signup, so it's correct even if admin-configured tiers change later).
 * A line with no recorded pre-duration price (legacy, no duration ever
 * chosen) contributes its charged amount with zero discount shown, never a
 * guessed breakdown. On-hold (unbilled) lines are excluded entirely.
 */
export function buildLineDiscountBreakdowns(lines: StatementLine[]): LineDiscountBreakdown[] {
  return lines
    .filter((line) => !line.onHold)
    .map((line) => {
      const preDurationCents = line.originalPriceCents ?? line.amountCents;
      const freqPct = frequencies[line.frequency as FrequencyKey]?.discountPercentage ?? 0;
      const trueListPriceCents = freqPct > 0 ? Math.round(preDurationCents / (1 - freqPct / 100)) : preDurationCents;
      return {
        subscriptionId: line.subscriptionId,
        trueListPriceCents,
        frequencyDiscountCents: trueListPriceCents - preDurationCents,
        durationDiscountCents: preDurationCents - line.amountCents,
      };
    });
}

export type StatementDiscountBreakdown = {
  subtotalCents: number;
  frequencyDiscountCents: number;
  durationDiscountCents: number;
};

/** Aggregates {@link buildLineDiscountBreakdowns} across every charged line in the statement. */
export function buildStatementDiscountBreakdown(lines: StatementLine[]): StatementDiscountBreakdown {
  return buildLineDiscountBreakdowns(lines).reduce(
    (acc, line) => ({
      subtotalCents: acc.subtotalCents + line.trueListPriceCents,
      frequencyDiscountCents: acc.frequencyDiscountCents + line.frequencyDiscountCents,
      durationDiscountCents: acc.durationDiscountCents + line.durationDiscountCents,
    }),
    { subtotalCents: 0, frequencyDiscountCents: 0, durationDiscountCents: 0 },
  );
}
