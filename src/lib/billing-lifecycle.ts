/**
 * Dar Tahara, failed-payment recovery / service-suspension pure logic.
 *
 * Pure, no Supabase/Stripe dependency, so this stays directly unit-testable
 * (same split as pricing.ts / subscription-duration.ts / pause-eligibility.ts).
 * The caller (the Stripe webhook route, the collection job) is responsible
 * for all DB/Stripe I/O, this module only decides what should happen given
 * known state.
 *
 * Retry timing itself is Stripe's own (Smart Retries, configured in the
 * Stripe Dashboard), this module reacts to Stripe's own `attempt_count` on
 * each `invoice.payment_failed` event; it never schedules a retry itself.
 */

import { randomBytes } from "node:crypto";
import type { BillingPolicy } from "@/lib/billing-policy";

export type CollectionStage = "first_notice" | "second_notice" | "seriously_overdue" | "escalation_eligible" | null;

/** True once Stripe's own failed-attempt count has reached the configured suspension threshold. */
export function shouldSuspend(failedAttemptCount: number, policy: BillingPolicy): boolean {
  return failedAttemptCount >= policy.maxAutomaticAttemptsBeforeSuspension;
}

/** A cryptographically random, unguessable, single-purpose payment-link token. */
export function generatePaymentLinkToken(): string {
  return randomBytes(32).toString("base64url");
}

/** `now` plus a whole number of days, the shared basis for every link/settlement expiry in this module. */
export function computeExpiryInDays(now: Date, days: number): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

/** `now` plus a whole number of hours, used for the shorter cancellation-preview quote window. */
export function computeExpiryInHours(now: Date, hours: number): Date {
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

/** When a freshly-generated payment link should expire, per policy. */
export function computePaymentLinkExpiry(now: Date, policy: BillingPolicy): Date {
  return computeExpiryInDays(now, policy.paymentLinkWindowDays);
}

export function isPaymentLinkExpired(expiresAt: string | Date, now: Date): boolean {
  return new Date(expiresAt).getTime() <= now.getTime();
}

/** The collection stage an unpaid invoice advances to once its current notice window has expired. */
export function nextCollectionStageAfterExpiry(current: CollectionStage): CollectionStage {
  if (current === "first_notice") return "second_notice";
  if (current === "second_notice") return "seriously_overdue";
  return current;
}

/**
 * Stripe's own `attempt_count` on the invoice object is the source of truth
 * for how many times a charge has been tried, this reflects it directly
 * rather than keeping a second, independently-incremented counter that could
 * drift out of sync with what Stripe actually did.
 */
export function attemptTypeForStripeAttempt(attemptCount: number): "initial" | "stripe_retry" {
  return attemptCount <= 1 ? "initial" : "stripe_retry";
}
