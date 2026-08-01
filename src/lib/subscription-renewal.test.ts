import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeNextPrepaidTerm,
  computePrepaidRenewalDueAt,
  determinePrepaidRenewalAction,
} from "./subscription-renewal";

test("prepaid renewal payment is due about one month before the next term", () => {
  const end = new Date("2026-12-31T00:00:00Z");
  assert.equal(
    computePrepaidRenewalDueAt(end, 30).toISOString(),
    "2026-12-01T00:00:00.000Z",
  );
  assert.equal(determinePrepaidRenewalAction({
    billingInterval: "annual",
    subscriptionStatus: "active",
    autoRenew: true,
    currentTermEnd: end,
    renewalStatus: null,
    asOf: new Date("2026-12-01T00:00:00Z"),
    leadDays: 30,
  }), "request_payment");
});

test("unpaid or disabled renewal ends only after the current paid term", () => {
  const base = {
    billingInterval: "annual" as const,
    subscriptionStatus: "active",
    currentTermEnd: new Date("2026-12-31T00:00:00Z"),
    asOf: new Date("2026-12-31T00:00:00Z"),
    leadDays: 30,
  };
  assert.equal(determinePrepaidRenewalAction({
    ...base,
    autoRenew: true,
    renewalStatus: "payment_requested",
  }), "end_after_current_term");
  assert.equal(determinePrepaidRenewalAction({
    ...base,
    autoRenew: false,
    renewalStatus: "disabled",
  }), "end_after_current_term");
});

test("paid renewal activates a new twelve-month term at the boundary", () => {
  const currentEnd = new Date("2026-12-31T00:00:00Z");
  assert.equal(determinePrepaidRenewalAction({
    billingInterval: "annual",
    subscriptionStatus: "active",
    autoRenew: true,
    currentTermEnd: currentEnd,
    renewalStatus: "paid",
    asOf: currentEnd,
    leadDays: 30,
  }), "activate_paid_term");
  const next = computeNextPrepaidTerm(currentEnd);
  assert.equal(next.start.toISOString(), "2026-12-31T00:00:00.000Z");
  assert.equal(next.end.toISOString(), "2027-12-31T00:00:00.000Z");
});

test("monthly subscriptions never enter prepaid renewal", () => {
  assert.equal(determinePrepaidRenewalAction({
    billingInterval: "monthly",
    subscriptionStatus: "active",
    autoRenew: true,
    currentTermEnd: new Date("2026-12-31T00:00:00Z"),
    renewalStatus: null,
    asOf: new Date("2026-12-01T00:00:00Z"),
    leadDays: 30,
  }), "none");
});
