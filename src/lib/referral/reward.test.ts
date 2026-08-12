import assert from "node:assert/strict";
import test from "node:test";
import { DIGITAL_SMART_LOCK_OFFER } from "@/lib/products/smart-lock";
import {
  MAX_REWARD_TENTHS,
  REFERRALS_FOR_MAX,
  calculateReferralReward,
  discountTenthsFor,
} from "@/lib/referral/reward";

test("the two representations of the Smart Lock price agree", () => {
  // Guards the one place drift could silently mis-price every reward.
  assert.equal(DIGITAL_SMART_LOCK_OFFER.priceCents, DIGITAL_SMART_LOCK_OFFER.price * 100);
});

test("discount percentage follows 2.5 points per referral and caps at 25", () => {
  const cases: Array<[number, number]> = [
    [0, 0], [1, 2.5], [2, 5], [5, 12.5], [9, 22.5],
    [10, 25], [11, 25], [100, 25],
  ];
  for (const [referrals, percent] of cases) {
    assert.equal(discountTenthsFor(referrals) / 10, percent, `${referrals} referrals`);
  }
});

test("€200 lock: the money the brief specifies, to the cent", () => {
  const cases: Array<[number, number, number]> = [
    // referrals, discountCents, finalCents
    [0, 0, 20_000],
    [1, 500, 19_500],
    [2, 1_000, 19_000],
    [5, 2_500, 17_500],
    [10, 5_000, 15_000],
    [11, 5_000, 15_000],
  ];
  for (const [referrals, discountCents, finalCents] of cases) {
    const r = calculateReferralReward(referrals, 20_000);
    assert.equal(r.discountCents, discountCents, `${referrals} referrals discount`);
    assert.equal(r.finalCents, finalCents, `${referrals} referrals final`);
  }
});

test("the reward tracks a different base price without any hardcoded euro figure", () => {
  // 25% of €149.99 is €37.4975. Rounding the discount half-up would give €37.50
  // and leave €112.49 — a hair BELOW 75% of base. The independent floor wins, so
  // the discount gives up the half cent rather than the price breaching its
  // limit. This is the case that makes the floor worth having separately from
  // the percentage cap.
  const r = calculateReferralReward(10, 14_999);
  assert.equal(r.discountCents, 3_749);
  assert.equal(r.finalCents, 11_250);
  assert.ok(r.finalCents >= Math.ceil(14_999 * 0.75));

  // A price whose 2.5% lands on a half cent must still round predictably.
  const odd = calculateReferralReward(1, 999);
  assert.equal(odd.discountCents, 25); // 24.975 -> 25
  assert.equal(odd.finalCents, 974);
});

test("rounding can never breach the 75% floor at any base price", () => {
  for (let base = 1; base <= 2_000; base++) {
    const r = calculateReferralReward(REFERRALS_FOR_MAX, base);
    assert.ok(
      r.finalCents >= Math.ceil((base * (1000 - MAX_REWARD_TENTHS)) / 1000),
      `base ${base} fell below the floor`,
    );
    assert.equal(r.discountCents + r.finalCents, base, `base ${base} did not reconcile`);
  }
});

test("discount and final price always reconcile to the base", () => {
  for (let referrals = 0; referrals <= 15; referrals++) {
    const r = calculateReferralReward(referrals);
    assert.equal(r.discountCents + r.finalCents, r.baseCents);
    assert.ok(r.discountCents >= 0 && r.finalCents >= 0);
  }
});

test("progress towards the ceiling is reported without the caller doing arithmetic", () => {
  const six = calculateReferralReward(6, 20_000);
  assert.equal(six.discountPercent, 15);
  assert.equal(six.discountCents, 3_000);
  assert.equal(six.referralsUntilMax, 4);
  assert.equal(six.atMaximum, false);
  assert.equal(six.nextDiscountPercent, 17.5); // the brief's worked example
  assert.equal(six.nextRewardCents, 500);

  const nine = calculateReferralReward(9, 20_000);
  assert.equal(nine.referralsUntilMax, 1);
  assert.equal(nine.nextDiscountPercent, 25);

  const max = calculateReferralReward(10, 20_000);
  assert.equal(max.atMaximum, true);
  assert.equal(max.referralsUntilMax, 0);
  // Nothing further is promised once the ceiling is reached (brief §6).
  assert.equal(max.nextDiscountPercent, null);
  assert.equal(max.nextRewardCents, null);
});

test("referrals beyond the ceiling change nothing but are still reported honestly", () => {
  const twelve = calculateReferralReward(12, 20_000);
  assert.equal(twelve.qualifiedReferrals, 12, "the real count is preserved for display");
  assert.equal(twelve.countedReferrals, 10, "only ten count toward money");
  assert.equal(twelve.finalCents, 15_000);
  assert.equal(twelve.atMaximum, true);
});

test("a negative or non-integer count is a caller bug, not a discount", () => {
  assert.throws(() => calculateReferralReward(-1), RangeError);
  assert.throws(() => calculateReferralReward(1.5), TypeError);
  assert.throws(() => calculateReferralReward(Number.NaN), TypeError);
  // A float base price would reintroduce exactly the error this module avoids.
  assert.throws(() => calculateReferralReward(1, 199.99), TypeError);
});

test("a zero base price cannot produce a negative price or a phantom saving", () => {
  const r = calculateReferralReward(10, 0);
  assert.equal(r.discountCents, 0);
  assert.equal(r.finalCents, 0);
});

test("the ceiling is derived, so changing the rate moves the referral count with it", () => {
  // Documents the constant relationship rather than the literal 10.
  assert.equal(REFERRALS_FOR_MAX, 10);
  assert.equal(calculateReferralReward(REFERRALS_FOR_MAX).atMaximum, true);
  assert.equal(calculateReferralReward(REFERRALS_FOR_MAX - 1).atMaximum, false);
});
