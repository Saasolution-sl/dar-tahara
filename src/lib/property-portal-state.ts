export type PropertyPortalState = "hidden" | "pending" | "active";

/**
 * A newly requested property must not appear in the customer portal until
 * Stripe has confirmed the assessment payment. Once paid, it remains a
 * disabled pending row until a staff member completes the assessment.
 *
 * Properties without an assessment are treated as legacy active records so
 * existing customer data is never made invisible by this rollout.
 */
export function propertyPortalState(input: {
  hasAssessment: boolean;
  paymentStatus: string | null;
  assessmentConfirmed: boolean;
}): PropertyPortalState {
  if (!input.hasAssessment || input.assessmentConfirmed) return "active";
  return input.paymentStatus === "paid" ? "pending" : "hidden";
}
