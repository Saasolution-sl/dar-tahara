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

/**
 * Above this size the tiered price no longer grows in bands; instead the
 * top-tier monthly price is taken as a base and a per-m² surcharge is added
 * for every square metre beyond the threshold.
 */
export const LARGE_HOME_THRESHOLD_M2 = 125;

export type FrequencyKey = "monthly" | "biweekly" | "weekly" | "irregular";

/**
 * Per-m² surcharge applied to the area above LARGE_HOME_THRESHOLD_M2, by
 * frequency. For the recurring plans this is a monthly add-on; for the
 * irregular (per-stay) plan it is charged per cleaning at the full rate.
 * Example: 183 m² bi-weekly = €238 base + (183 − 125) × €0.90.
 */
export const extraPerM2Rate: Record<FrequencyKey, number> = {
  monthly: 1.0,
  biweekly: 0.9,
  weekly: 0.85,
  irregular: 1.0,
};

/** Beyond this size the online estimator defers to a bespoke quotation. */
export const CUSTOM_QUOTE_THRESHOLD_M2 = 250;

/** Slider / input bounds for the property-size control. */
export const SIZE_LIMITS = { min: 20, max: 250, step: 1 } as const;

export const frequencies: Record<
  FrequencyKey,
  {
    visitsPerMonth: number;
    discountPercentage: number;
    recommended?: boolean;
    /** Irregular / on-demand plan billed per cleaning (Airbnb & rentals). */
    irregular?: boolean;
    /** Whether cleaning materials & consumables are bundled into the price. */
    materialsIncluded: boolean;
  }
> = {
  monthly: { visitsPerMonth: 1, discountPercentage: 0, materialsIncluded: true },
  biweekly: { visitsPerMonth: 2, discountPercentage: 15, recommended: true, materialsIncluded: true },
  weekly: { visitsPerMonth: 4, discountPercentage: 20, materialsIncluded: true },
  // Airbnb / short-stay rentals: a per-week price (one cleaning), no discount,
  // with basic materials, cleaning supplies and toilet paper included.
  irregular: { visitsPerMonth: 1, discountPercentage: 0, irregular: true, materialsIncluded: true },
};

/** Stable order for rendering frequency options. */
export const frequencyOrder: FrequencyKey[] = ["monthly", "biweekly", "weekly", "irregular"];

/** The top base tier price per visit (used as the base for large homes). */
const TOP_TIER_PRICE_PER_VISIT = Math.max(
  pricingTiers[pricingTiers.length - 1].pricePerVisit,
  MINIMUM_PRICE_PER_VISIT,
);

export type PriceBreakdown = {
  status: "ok";
  sizeM2: number;
  pricePerVisit: number;
  frequency: FrequencyKey;
  visitsPerMonth: number;
  discountPercentage: number;
  subtotal: number;
  discountAmount: number;
  /** Square metres beyond LARGE_HOME_THRESHOLD_M2 (0 for standard homes). */
  extraM2: number;
  /** Per-m² surcharge rate applied to the extra area (0 for standard homes). */
  extraRatePerM2: number;
  /** Total surcharge for the extra area (0 for standard homes). */
  areaSurcharge: number;
  monthlyTotal: number;
  effectivePricePerVisit: number;
  /** Irregular / on-demand plan: `monthlyTotal` is the per-cleaning price. */
  irregular: boolean;
  /** Whether cleaning materials & consumables are included in the price. */
  materialsIncluded: boolean;
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
  if (sizeM2 > LARGE_HOME_THRESHOLD_M2) return null;
  const tier = pricingTiers.find((t) => sizeM2 <= t.maxM2);
  if (!tier) return null;
  return Math.max(tier.pricePerVisit, MINIMUM_PRICE_PER_VISIT);
}

/**
 * Core price calculation.
 *
 *   subtotal              = pricePerVisit × visitsPerMonth
 *   discountAmount        = subtotal × (discountPercentage / 100)
 *   discountedBase        = subtotal − discountAmount
 *   areaSurcharge         = max(0, sizeM2 − 125) × extraPerM2Rate[frequency]
 *   monthlyTotal          = discountedBase + areaSurcharge
 *   effectivePricePerVisit = monthlyTotal / visitsPerMonth
 *
 * For homes over 125 m² the top base tier price (€140/visit) is used as the
 * base and the per-m² surcharge covers the additional area.
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

  const isLarge = sizeM2 > LARGE_HOME_THRESHOLD_M2;
  const pricePerVisit = isLarge
    ? TOP_TIER_PRICE_PER_VISIT
    : (getPricePerVisit(sizeM2) as number);

  const freqCfg = frequencies[frequency];
  const { visitsPerMonth, discountPercentage } = freqCfg;
  const subtotal = round2(pricePerVisit * visitsPerMonth);
  const discountAmount = round2(subtotal * (discountPercentage / 100));
  const discountedBase = round2(subtotal - discountAmount);

  const extraM2 = isLarge ? round2(sizeM2 - LARGE_HOME_THRESHOLD_M2) : 0;
  const extraRatePerM2 = isLarge ? extraPerM2Rate[frequency] : 0;
  const areaSurcharge = round2(extraM2 * extraRatePerM2);

  const monthlyTotal = round2(discountedBase + areaSurcharge);
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
    extraM2,
    extraRatePerM2,
    areaSurcharge,
    monthlyTotal,
    effectivePricePerVisit,
    irregular: freqCfg.irregular ?? false,
    materialsIncluded: freqCfg.materialsIncluded,
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
