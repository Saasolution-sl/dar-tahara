/**
 * Dar Tahara — subscription-duration pricing.
 *
 * A second, independent discount axis alongside the existing per-frequency
 * discount in pricing.ts: how long the customer commits to (3/6/9/12 months),
 * as opposed to how often they clean. Applied after the frequency discount,
 * before the existing annual-billing prepay discount in assessment.ts (which
 * still stacks on top when billingInterval === "annual").
 *
 * Pure, no Supabase dependency — see subscription-duration-config.ts for the
 * DB-backed admin configuration, kept in a separate file so this one stays
 * directly unit-testable (same split as pricing.ts vs. feature-flags.ts).
 */

export type DurationCode = "3_month" | "6_month" | "9_month" | "12_month";

export type DurationTier = {
  code: DurationCode;
  months: 3 | 6 | 9 | 12;
  discountPercentage: number;
  pauseEligible: boolean;
  maxPauseMonths: number;
  maxPausesPerContract: number;
  recommended: boolean;
  enabled: boolean;
  displayOrder: number;
  /**
   * Whether this tier includes one complimentary deep clean per contract.
   * Read as data everywhere a benefit-eligibility decision is made (the
   * customer portal, the deep-clean-request route, the early-termination
   * calculator's benefit-recovery check) instead of a scattered
   * `contractDurationMonths === 12` conditional.
   */
  includesFreeDeepClean: boolean;
};

/** Seeded into `subscription_duration_tiers` by migration; also the fallback used if the DB is unreachable. */
export const DEFAULT_DURATION_TIERS: DurationTier[] = [
  {
    code: "3_month", months: 3, discountPercentage: 0,
    pauseEligible: false, maxPauseMonths: 0, maxPausesPerContract: 0,
    recommended: false, enabled: true, displayOrder: 0, includesFreeDeepClean: false,
  },
  {
    code: "6_month", months: 6, discountPercentage: 5,
    pauseEligible: false, maxPauseMonths: 0, maxPausesPerContract: 0,
    recommended: false, enabled: true, displayOrder: 1, includesFreeDeepClean: false,
  },
  {
    code: "9_month", months: 9, discountPercentage: 10,
    pauseEligible: true, maxPauseMonths: 2, maxPausesPerContract: 1,
    recommended: false, enabled: true, displayOrder: 2, includesFreeDeepClean: false,
  },
  {
    code: "12_month", months: 12, discountPercentage: 15,
    pauseEligible: true, maxPauseMonths: 2, maxPausesPerContract: 1,
    recommended: true, enabled: true, displayOrder: 3, includesFreeDeepClean: false,
  },
];

/** Stable order for rendering duration options, shortest to longest. */
export const durationOrder: DurationCode[] = ["3_month", "6_month", "9_month", "12_month"];

export function findDurationTier(tiers: DurationTier[], months: number): DurationTier | null {
  return tiers.find((tier) => tier.months === months && tier.enabled) ?? null;
}

/**
 * The tier the frequency-adjusted monthly price is already anchored to: the
 * longest/best-discounted enabled tier (today the 12-month, 15% tier). Its
 * price equals the plain frequency-adjusted price with no further change —
 * this is what a customer actually pays at the best tier, and what the real
 * per-tier price is reverse-derived from. Computed dynamically (not
 * hardcoded to "12 months") so it still makes sense if the admin-configured
 * tiers ever change.
 */
export function findAnchorTier(tiers: DurationTier[]): DurationTier | null {
  const enabled = tiers.filter((tier) => tier.enabled);
  if (enabled.length === 0) return null;
  return enabled.reduce((best, tier) => (tier.discountPercentage > best.discountPercentage ? tier : best));
}

export type DurationDiscountResult = {
  /**
   * This tier's own implied list price — what it would cost with 0% duration
   * discount (the same figure a 0%-tier customer actually pays). Constant
   * across every tier for a given frequency-adjusted price; NOT the same as
   * `frequencyAdjustedMonthlyCents` unless this tier IS the anchor.
   */
  priceBeforeDurationDiscountCents: number;
  /** Amount saved vs. this tier's own implied list price — always ≥ 0, a real discount, never a surcharge. Zero only for a 0%-discount tier. */
  durationDiscountAmountCents: number;
  discountedMonthlyCents: number;
  minimumContractValueCents: number;
};

/**
 * Prices a duration tier relative to the anchor tier (the one with the
 * largest discountPercentage — today 12 months, 15%), which is defined to
 * cost exactly the frequency-adjusted price with no adjustment. Every other
 * tier's price is derived by applying the ratio between its own percentage
 * and the anchor's:
 *
 *   tierPrice = frequencyAdjustedMonthlyPrice
 *                 × (1 − tier.discountPercentage) / (1 − anchorTier.discountPercentage)
 *
 * so shorter/less-discounted tiers genuinely cost more than the anchor — the
 * anchor tier is the best real price on offer, exactly as marketed.
 *
 * For DISCLOSURE, `priceBeforeDurationDiscountCents` is NOT this tier's raw
 * input price — it's reverse-derived from this tier's OWN final price using
 * this tier's OWN percentage (`tierPrice / (1 − tier.discountPercentage)`).
 * This value is mathematically constant across every tier (it always equals
 * `frequencyAdjustedMonthlyPrice / (1 − anchorTier.discountPercentage)`,
 * independent of which tier you ask), so every tier's "before" figure is the
 * same number — the 0%-discount price — and `durationDiscountAmountCents`
 * (the gap between that and the tier's real price) is therefore always ≥ 0,
 * a genuine discount at every tier, never negative/a surcharge.
 *
 * Rounds only once, at the final tier price — never on an intermediate
 * value, so the anchor tier's own price always comes back out exactly equal
 * to the input with zero rounding drift.
 */
export function applyDurationDiscount(
  frequencyAdjustedMonthlyCents: number,
  tier: DurationTier,
  tiers: DurationTier[],
): DurationDiscountResult {
  const anchor = findAnchorTier(tiers) ?? tier;
  const ratio = (1 - tier.discountPercentage / 100) / (1 - anchor.discountPercentage / 100);
  const discountedMonthlyCents = Math.round(frequencyAdjustedMonthlyCents * ratio);
  const priceBeforeDurationDiscountCents =
    tier.discountPercentage > 0 ? Math.round(discountedMonthlyCents / (1 - tier.discountPercentage / 100)) : discountedMonthlyCents;
  const durationDiscountAmountCents = priceBeforeDurationDiscountCents - discountedMonthlyCents;
  const minimumContractValueCents = discountedMonthlyCents * tier.months;
  return {
    priceBeforeDurationDiscountCents,
    durationDiscountAmountCents,
    discountedMonthlyCents,
    minimumContractValueCents,
  };
}
