/**
 * Dar Tahara, deep-clean add-on pricing.
 *
 * One deep clean is free for 12-month subscribers (once per contract); every
 * other subscriber, and a 12-month subscriber who has already used their
 * free one, pays for it. Per the owner's spec, the paid price is exactly
 * double the property's once-per-month (monthly frequency) recurring price:
 * a 100% surcharge on top of that reference price.
 */

import { calculatePrice } from "@/lib/pricing";

/**
 * The paid deep-clean price for a given property size, in cents.
 * Returns `null` when the size requires a bespoke quote (mirrors
 * `calculatePrice`'s own "custom" / "invalid" outcomes, never guess a price
 * for a size the base pricing engine itself can't price).
 */
export function calculateDeepCleanPriceCents(sizeM2: number): number | null {
  const result = calculatePrice(sizeM2, "monthly");
  if (result.status !== "ok") return null;
  return Math.round(result.monthlyTotal * 2 * 100);
}
