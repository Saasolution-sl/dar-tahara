/**
 * Referral reward arithmetic for the Dar Tahara Smart Lock.
 *
 * Every qualified referral earns 2.5 percentage points off the Smart Lock, to a
 * ceiling of 25% at ten referrals. Nothing here knows about €5 or €50: those are
 * consequences of the current €200 base price, not rules. Change the price in
 * `DIGITAL_SMART_LOCK_OFFER` and the money follows.
 *
 * Two invariants this module exists to hold:
 *
 *   1. **Integer minor units only.** 2.5% of a float euro amount is not exact in
 *      binary floating point, and the error compounds once you subtract and
 *      re-add. Percentages are carried as *tenths of a percent* (25 = 2.5%) so
 *      the whole calculation stays in integers until the final division.
 *   2. **Server-side truth.** The caller supplies a qualified-referral COUNT and
 *      a base price, never a percentage or an amount. A client cannot post a
 *      discount into existence, per brief §22.
 */

import { DIGITAL_SMART_LOCK_OFFER } from "@/lib/products/smart-lock";

/** Reward earned per qualified referral, in tenths of a percent. 25 = 2.5%. */
export const REWARD_PER_REFERRAL_TENTHS = 25;

/** Ceiling, in tenths of a percent. 250 = 25%. */
export const MAX_REWARD_TENTHS = 250;

/** Referrals needed to reach the ceiling. Derived, never hardcoded as 10. */
export const REFERRALS_FOR_MAX = MAX_REWARD_TENTHS / REWARD_PER_REFERRAL_TENTHS;

/**
 * The lowest fraction of the base price a referral reward may ever produce,
 * in tenths of a percent of the base. 750 = 75%, the complement of the 25% cap.
 * Enforced as its own floor rather than trusted to fall out of the percentage
 * maths, so a future change to the cap cannot silently sell the lock cheaper
 * than intended (brief §9).
 */
export const MIN_PRICE_FRACTION_TENTHS = 1000 - MAX_REWARD_TENTHS;

export type ReferralReward = {
  /** Qualified referrals actually counted, after clamping at the ceiling. */
  countedReferrals: number;
  /** Qualified referrals supplied, uncapped, for display ("12 referrals"). */
  qualifiedReferrals: number;
  /** Discount in tenths of a percent, e.g. 150 for 15%. */
  discountTenths: number;
  /** Discount as a decimal percentage for display, e.g. 15 or 17.5. */
  discountPercent: number;
  baseCents: number;
  discountCents: number;
  finalCents: number;
  /** True once the ceiling is reached; no further referral changes the price. */
  atMaximum: boolean;
  /** Referrals still needed to reach the ceiling. 0 once there. */
  referralsUntilMax: number;
  /** What the next single referral would take the discount to, or null at max. */
  nextDiscountPercent: number | null;
  /** Extra money the next single referral would save, or null at max. */
  nextRewardCents: number | null;
};

function assertUsableCount(qualifiedReferrals: number): number {
  if (!Number.isFinite(qualifiedReferrals) || !Number.isInteger(qualifiedReferrals)) {
    throw new TypeError(`qualifiedReferrals must be an integer, received ${qualifiedReferrals}`);
  }
  // Negative counts are a caller bug, not a discount. Failing loudly beats
  // quietly computing a surcharge.
  if (qualifiedReferrals < 0) {
    throw new RangeError(`qualifiedReferrals must not be negative, received ${qualifiedReferrals}`);
  }
  return qualifiedReferrals;
}

function assertUsableBase(baseCents: number): number {
  if (!Number.isInteger(baseCents) || baseCents < 0) {
    throw new TypeError(`baseCents must be a non-negative integer, received ${baseCents}`);
  }
  return baseCents;
}

/** Discount in tenths of a percent for a referral count, clamped at the ceiling. */
export function discountTenthsFor(qualifiedReferrals: number): number {
  const counted = assertUsableCount(qualifiedReferrals);
  return Math.min(counted * REWARD_PER_REFERRAL_TENTHS, MAX_REWARD_TENTHS);
}

/**
 * Apply a tenths-of-a-percent discount to a cent amount.
 *
 * Rounds half up on the DISCOUNT, so a customer is never shown a saving smaller
 * than the percentage implies. The floor below re-checks the resulting price, so
 * rounding can never breach the 75% limit.
 */
function discountCentsFor(baseCents: number, tenths: number): number {
  return Math.round((baseCents * tenths) / 1000);
}

/**
 * The full reward for a referral count against a Smart Lock base price.
 *
 * `baseCents` defaults to the configured offer, so callers that just want "the
 * current Smart Lock" cannot accidentally pass a stale literal.
 */
export function calculateReferralReward(
  qualifiedReferrals: number,
  baseCents: number = DIGITAL_SMART_LOCK_OFFER.priceCents,
): ReferralReward {
  const qualified = assertUsableCount(qualifiedReferrals);
  const base = assertUsableBase(baseCents);

  const countedReferrals = Math.min(qualified, REFERRALS_FOR_MAX);
  const discountTenths = discountTenthsFor(qualified);

  const rawDiscountCents = discountCentsFor(base, discountTenths);

  // Independent floor. Even if the cap, the per-referral rate and rounding all
  // conspired, the lock cannot be sold below 75% of base.
  const minFinalCents = Math.ceil((base * MIN_PRICE_FRACTION_TENTHS) / 1000);
  const discountCents = Math.min(rawDiscountCents, base - minFinalCents);
  const finalCents = base - discountCents;

  const atMaximum = discountTenths >= MAX_REWARD_TENTHS;
  const referralsUntilMax = Math.max(REFERRALS_FOR_MAX - qualified, 0);

  const nextTenths = atMaximum
    ? null
    : Math.min(discountTenths + REWARD_PER_REFERRAL_TENTHS, MAX_REWARD_TENTHS);
  const nextRewardCents =
    nextTenths === null ? null : discountCentsFor(base, nextTenths) - discountCents;

  return {
    countedReferrals,
    qualifiedReferrals: qualified,
    discountTenths,
    discountPercent: discountTenths / 10,
    baseCents: base,
    discountCents,
    finalCents,
    atMaximum,
    referralsUntilMax,
    nextDiscountPercent: nextTenths === null ? null : nextTenths / 10,
    nextRewardCents,
  };
}
