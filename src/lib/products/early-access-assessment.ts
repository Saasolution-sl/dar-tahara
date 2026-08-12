/**
 * The Early Access Assessment: a fixed-price product sold only during the
 * early-access campaign.
 *
 * DISTINCT FROM the standard Initial Home Assessment, which is size-tiered at
 * EUR 79 / 119 / 169 / 249 via `calculateAssessmentPriceCents` in
 * `@/lib/assessment`. That function is untouched and still governs every normal
 * booking. Confusing the two would either undercharge a full-price customer or
 * overcharge an early-access one, so they are deliberately separate modules
 * with separate product codes rather than a flag on one price function.
 *
 * The price is fixed regardless of property size and regardless of how many
 * referrals the buyer has: referral rewards apply ONLY to the Smart Lock
 * (brief §8). Nothing in this file should ever consult a referral count.
 */

export const EARLY_ACCESS_ASSESSMENT_OFFER = {
  productCode: "early_access_assessment",
  currency: "EUR",
  /**
   * EUR 39.99 in minor units. Money is integer cents everywhere in the referral
   * and checkout path; there is deliberately no float euro field here, unlike
   * the Smart Lock offer which predates that convention.
   */
  priceCents: 3_999,
  /** One-time payment, never a subscription line. */
  billing: "one_time",
} as const;

export type EarlyAccessAssessmentOffer = typeof EARLY_ACCESS_ASSESSMENT_OFFER;

/**
 * Whether a paid amount matches the early-access assessment.
 *
 * Used when qualifying a referral from a Stripe event: a payment only qualifies
 * a referral if it is *this* product at *this* price. Checking the amount as
 * well as the product code means a mispriced or tampered checkout session
 * cannot qualify a referral, and it costs nothing to verify.
 */
export function isEarlyAccessAssessmentPayment(input: {
  productCode: string | null | undefined;
  amountCents: number | null | undefined;
}): boolean {
  return (
    input.productCode === EARLY_ACCESS_ASSESSMENT_OFFER.productCode &&
    input.amountCents === EARLY_ACCESS_ASSESSMENT_OFFER.priceCents
  );
}
