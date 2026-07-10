/**
 * Dar Tahara — pricing engine.
 *
 * Single source of truth for all pricing rules and the pure calculation used
 * by the UI and the tests. Change prices, tiers, discounts or limits here —
 * no calculation logic lives in the components.
 */

/** Base price per individual cleaning visit, by property size (m²). */
export const pricingTiers = [
  { minM2: 0, maxM2: 50, pricePerVisit: 50 },
  { minM2: 51, maxM2: 75, pricePerVisit: 90 },
  { minM2: 76, maxM2: 100, pricePerVisit: 120 },
  { minM2: 101, maxM2: 125, pricePerVisit: 140 },
] as const;

/** The absolute minimum charged per cleaning visit. */
export const MINIMUM_PRICE_PER_VISIT = 50;

/** Above this size a fixed price is not offered — a custom quote is required. */
export const CUSTOM_QUOTE_THRESHOLD_M2 = 125;

/** Slider / input bounds for the property-size control. */
export const SIZE_LIMITS = { min: 20, max: 250, step: 1 } as const;

export type FrequencyKey = "monthly" | "biweekly" | "weekly";

export const frequencies: Record<
  FrequencyKey,
  { visitsPerMonth: number; discountPercentage: number; recommended?: boolean }
> = {
  monthly: { visitsPerMonth: 1, discountPercentage: 0 },
  biweekly: { visitsPerMonth: 2, discountPercentage: 15, recommended: true },
  weekly: { visitsPerMonth: 4, discountPercentage: 20 },
};

/** Stable order for rendering frequency options. */
export const frequencyOrder: FrequencyKey[] = ["monthly", "biweekly", "weekly"];

export type PriceBreakdown = {
  status: "ok";
  sizeM2: number;
  pricePerVisit: number;
  frequency: FrequencyKey;
  visitsPerMonth: number;
  discountPercentage: number;
  subtotal: number;
  discountAmount: number;
  monthlyTotal: number;
  effectivePricePerVisit: number;
};

export type PriceResult =
  | PriceBreakdown
  | { status: "custom"; sizeM2: number }
  | { status: "invalid"; reason: "not-a-number" | "out-of-range" };

/** Round to 2 decimals, guarding against binary floating-point dust. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Resolve the base price per visit for a given size, honouring the minimum.
 * Tier matching is by upper bound so decimal sizes are handled consistently
 * (e.g. 50.5 m² falls into the 51–75 tier).
 * Returns `null` when the size requires a custom quote.
 */
export function getPricePerVisit(sizeM2: number): number | null {
  if (sizeM2 > CUSTOM_QUOTE_THRESHOLD_M2) return null;
  const tier = pricingTiers.find((t) => sizeM2 <= t.maxM2);
  if (!tier) return null;
  return Math.max(tier.pricePerVisit, MINIMUM_PRICE_PER_VISIT);
}

/**
 * Core price calculation.
 *
 *   subtotal              = pricePerVisit × visitsPerMonth
 *   discountAmount        = subtotal × (discountPercentage / 100)
 *   monthlyTotal          = subtotal − discountAmount
 *   effectivePricePerVisit = monthlyTotal / visitsPerMonth
 */
export function calculatePrice(
  sizeM2: number,
  frequency: FrequencyKey,
): PriceResult {
  if (typeof sizeM2 !== "number" || !Number.isFinite(sizeM2)) {
    return { status: "invalid", reason: "not-a-number" };
  }
  if (sizeM2 <= 0) {
    return { status: "invalid", reason: "out-of-range" };
  }
  if (sizeM2 > CUSTOM_QUOTE_THRESHOLD_M2) {
    return { status: "custom", sizeM2 };
  }

  const pricePerVisit = getPricePerVisit(sizeM2);
  if (pricePerVisit === null) {
    return { status: "custom", sizeM2 };
  }

  const { visitsPerMonth, discountPercentage } = frequencies[frequency];
  const subtotal = round2(pricePerVisit * visitsPerMonth);
  const discountAmount = round2(subtotal * (discountPercentage / 100));
  const monthlyTotal = round2(subtotal - discountAmount);
  const effectivePricePerVisit = round2(monthlyTotal / visitsPerMonth);

  return {
    status: "ok",
    sizeM2,
    pricePerVisit,
    frequency,
    visitsPerMonth,
    discountPercentage,
    subtotal,
    discountAmount,
    monthlyTotal,
    effectivePricePerVisit,
  };
}

/**
 * Format a euro amount. Shows two decimals only when there is a fractional
 * part (e.g. €153, but €76.50), keeping results clean and readable.
 */
export function formatEuro(amount: number, forceDecimals = false): string {
  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  const fractionDigits = forceDecimals || hasFraction ? 2 : 0;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/**
 * Clamp and normalise a raw size input to the allowed slider range.
 * Returns `null` for values that are not valid numbers.
 */
export function normaliseSize(raw: number): number | null {
  if (!Number.isFinite(raw)) return null;
  const clamped = Math.min(Math.max(raw, SIZE_LIMITS.min), SIZE_LIMITS.max);
  return clamped;
}
