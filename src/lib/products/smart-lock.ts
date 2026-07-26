/**
 * Digital smart-lock upsell — the SINGLE source of truth for the offer.
 *
 * The form, review summary, backend persistence, Mautic mapping and analytics
 * all derive the price, currency and product code from here. Never hardcode the
 * value 200 anywhere else. Changing the price is a one-line change in this file.
 *
 * The offer is a PRODUCT INTEREST captured during early access — never a paid
 * order. No money is collected here; installation is always subject to a later
 * door/lock compatibility review.
 */

export const DIGITAL_SMART_LOCK_OFFER = {
  productCode: "digital_smart_lock_installation",
  currency: "EUR",
  price: 200,
  installationIncluded: true,
} as const;

export type SmartLockOffer = typeof DIGITAL_SMART_LOCK_OFFER;

/**
 * The customer's choice on the upsell. Stored + mapped to Mautic verbatim.
 *
 * There is deliberately no "send me more information" option: the offer copy is
 * already explicit and an explainer video covers the rest, so the extra choice
 * only added a low-intent branch to follow up on.
 */
export const SMART_LOCK_INTERESTS = [
  "purchase_interested",
  "already_has_lock",
  "not_interested",
] as const;
export type SmartLockInterest = (typeof SMART_LOCK_INTERESTS)[number];

/** Whether the lock can actually be fitted — decided later, never at signup. */
export const SMART_LOCK_COMPATIBILITY = [
  "not_checked",
  "pending_review",
  "compatible",
  "not_compatible",
] as const;
export type SmartLockCompatibility = (typeof SMART_LOCK_COMPATIBILITY)[number];

/** Internal follow-up workflow status. Never shown verbatim to the customer. */
export const SMART_LOCK_FOLLOWUP_STATUSES = [
  "no_action_required",
  "information_requested",
  "compatibility_review_required",
  "installation_interest_registered",
  "contact_attempted",
  "assessment_required",
  "compatible",
  "not_compatible",
  "quote_or_order_pending",
  "completed",
] as const;
export type SmartLockFollowupStatus = (typeof SMART_LOCK_FOLLOWUP_STATUSES)[number];

/**
 * Format the offer price for display. Euro symbol + integer value in Latin
 * digits, so it stays "€200" and never reverses or converts under any locale
 * (including RTL Arabic). The euro currency and the value are preserved
 * everywhere — the offer is never shown in another currency.
 */
export function formatSmartLockPrice(): string {
  return `€${DIGITAL_SMART_LOCK_OFFER.price}`;
}

/** True only for the paid-interest choice, so callers never assume a purchase. */
export function isSmartLockPurchaseInterest(
  interest: SmartLockInterest | undefined | null,
): interest is "purchase_interested" {
  return interest === "purchase_interested";
}

/** Initial compatibility state implied by the customer's choice (never "compatible"). */
export function initialCompatibilityFor(
  interest: SmartLockInterest,
): SmartLockCompatibility {
  return interest === "purchase_interested" || interest === "already_has_lock"
    ? "pending_review"
    : "not_checked";
}

/** Initial internal follow-up status implied by the customer's choice. */
export function initialFollowupFor(
  interest: SmartLockInterest,
): SmartLockFollowupStatus {
  switch (interest) {
    case "purchase_interested":
      return "installation_interest_registered";
    case "already_has_lock":
      return "compatibility_review_required";
    case "not_interested":
      return "no_action_required";
  }
}
