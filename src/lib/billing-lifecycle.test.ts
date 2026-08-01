import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shouldSuspend,
  generatePaymentLinkToken,
  computePaymentLinkExpiry,
  computeExpiryInDays,
  computeExpiryInHours,
  isPaymentLinkExpired,
  nextCollectionStageAfterExpiry,
  attemptTypeForStripeAttempt,
} from "./billing-lifecycle";
import { DEFAULT_BILLING_POLICY } from "./billing-policy";

test("shouldSuspend is false below the configured threshold, true at and above it", () => {
  assert.equal(shouldSuspend(0, DEFAULT_BILLING_POLICY), false);
  assert.equal(shouldSuspend(1, DEFAULT_BILLING_POLICY), false);
  assert.equal(shouldSuspend(2, DEFAULT_BILLING_POLICY), true);
  assert.equal(shouldSuspend(3, DEFAULT_BILLING_POLICY), true);
});

test("shouldSuspend respects a configured, non-default threshold", () => {
  const policy = { ...DEFAULT_BILLING_POLICY, maxAutomaticAttemptsBeforeSuspension: 3 };
  assert.equal(shouldSuspend(2, policy), false);
  assert.equal(shouldSuspend(3, policy), true);
});

test("generatePaymentLinkToken produces long, unique, URL-safe tokens", () => {
  const a = generatePaymentLinkToken();
  const b = generatePaymentLinkToken();
  assert.notEqual(a, b);
  assert.ok(a.length >= 40);
  assert.match(a, /^[A-Za-z0-9_-]+$/);
});

test("computePaymentLinkExpiry adds exactly the configured window in days", () => {
  const now = new Date("2026-08-01T00:00:00Z");
  const expiry = computePaymentLinkExpiry(now, DEFAULT_BILLING_POLICY);
  assert.equal(expiry.toISOString(), "2026-08-08T00:00:00.000Z");
});

test("computeExpiryInDays adds exactly the given number of days, independent of any policy", () => {
  const now = new Date("2026-08-01T00:00:00Z");
  assert.equal(computeExpiryInDays(now, 14).toISOString(), "2026-08-15T00:00:00.000Z");
  assert.equal(computeExpiryInDays(now, 1).toISOString(), "2026-08-02T00:00:00.000Z");
});

test("computeExpiryInHours adds exactly the given number of hours", () => {
  const now = new Date("2026-08-01T00:00:00Z");
  assert.equal(computeExpiryInHours(now, 48).toISOString(), "2026-08-03T00:00:00.000Z");
});

test("isPaymentLinkExpired compares against the given 'now', not the real clock", () => {
  assert.equal(isPaymentLinkExpired("2026-08-08T00:00:00Z", new Date("2026-08-07T00:00:00Z")), false);
  assert.equal(isPaymentLinkExpired("2026-08-08T00:00:00Z", new Date("2026-08-08T00:00:00Z")), true);
  assert.equal(isPaymentLinkExpired("2026-08-08T00:00:00Z", new Date("2026-08-09T00:00:00Z")), true);
});

test("nextCollectionStageAfterExpiry advances first_notice -> second_notice -> seriously_overdue, then holds", () => {
  assert.equal(nextCollectionStageAfterExpiry("first_notice"), "second_notice");
  assert.equal(nextCollectionStageAfterExpiry("second_notice"), "seriously_overdue");
  assert.equal(nextCollectionStageAfterExpiry("seriously_overdue"), "seriously_overdue");
  assert.equal(nextCollectionStageAfterExpiry("escalation_eligible"), "escalation_eligible");
  assert.equal(nextCollectionStageAfterExpiry(null), null);
});

test("attemptTypeForStripeAttempt classifies Stripe's own attempt_count", () => {
  assert.equal(attemptTypeForStripeAttempt(1), "initial");
  assert.equal(attemptTypeForStripeAttempt(2), "stripe_retry");
  assert.equal(attemptTypeForStripeAttempt(5), "stripe_retry");
});
