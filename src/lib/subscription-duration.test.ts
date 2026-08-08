import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_DURATION_TIERS,
  applyDurationDiscount,
  findAnchorTier,
  findDurationTier,
  type DurationTier,
} from "./subscription-duration";

function tier(months: 3 | 6 | 9 | 12): DurationTier {
  const t = DEFAULT_DURATION_TIERS.find((d) => d.months === months);
  assert.ok(t, `no default tier for ${months} months`);
  return t;
}

test("default tiers carry the spec's exact discount percentages", () => {
  assert.equal(tier(3).discountPercentage, 0);
  assert.equal(tier(6).discountPercentage, 5);
  assert.equal(tier(9).discountPercentage, 10);
  assert.equal(tier(12).discountPercentage, 15);
});

test("only 9- and 12-month tiers are pause eligible", () => {
  assert.equal(tier(3).pauseEligible, false);
  assert.equal(tier(6).pauseEligible, false);
  assert.equal(tier(9).pauseEligible, true);
  assert.equal(tier(12).pauseEligible, true);
  assert.equal(tier(9).maxPauseMonths, 2);
  assert.equal(tier(12).maxPauseMonths, 2);
  assert.equal(tier(9).maxPausesPerContract, 1);
  assert.equal(tier(12).maxPausesPerContract, 1);
});

test("only the 12-month tier is recommended", () => {
  assert.equal(tier(3).recommended, false);
  assert.equal(tier(6).recommended, false);
  assert.equal(tier(9).recommended, false);
  assert.equal(tier(12).recommended, true);
});

test("tiers are ordered shortest to longest by displayOrder", () => {
  const sorted = [...DEFAULT_DURATION_TIERS].sort((a, b) => a.displayOrder - b.displayOrder);
  assert.deepEqual(sorted.map((t) => t.months), [3, 6, 9, 12]);
});

test("findAnchorTier picks the tier with the largest discount percentage", () => {
  assert.equal(findAnchorTier(DEFAULT_DURATION_TIERS)?.months, 12);
  const noTwelve = DEFAULT_DURATION_TIERS.filter((t) => t.months !== 12);
  assert.equal(findAnchorTier(noTwelve)?.months, 9);
  assert.equal(findAnchorTier([]), null);
});

// Owner-confirmed real model (2026-07-30, second correction): the anchor
// (12 months, the largest discount) is the best REAL price on offer, its
// final price equals the plain frequency-adjusted price exactly, and every
// shorter tier genuinely costs more (reverse-derived via the tier-ratio
// formula), matching the original 2026-07-28 real pricing. What changed from
// that original model is DISCLOSURE only: `priceBeforeDurationDiscountCents`
// is no longer "the anchor's own raw input", it's reverse-derived from EACH
// tier's own final price using that tier's own percentage
// (`tierPrice / (1 − tier%)`), which is mathematically the SAME number
// (the 0%-discount / no-commitment price) regardless of which tier you ask.
// That makes `durationDiscountAmountCents` always ≥ 0, a real, positive
// discount at every tier including the anchor itself, never negative, so
// the "surcharge" framing/copy is gone for good without changing any real
// charged price. See subscription-duration.ts's doc comment.

test("the anchor's real charged price equals the input exactly, whatever the input", () => {
  for (const cents of [9_000, 15_300, 20_000, 12_345]) {
    const r = applyDurationDiscount(cents, tier(12), DEFAULT_DURATION_TIERS);
    assert.equal(r.discountedMonthlyCents, cents);
  }
});

test("priceBeforeDurationDiscountCents is the SAME value for every tier, given the same frequency-adjusted price", () => {
  const p = 15_300;
  const before3 = applyDurationDiscount(p, tier(3), DEFAULT_DURATION_TIERS).priceBeforeDurationDiscountCents;
  const before6 = applyDurationDiscount(p, tier(6), DEFAULT_DURATION_TIERS).priceBeforeDurationDiscountCents;
  const before9 = applyDurationDiscount(p, tier(9), DEFAULT_DURATION_TIERS).priceBeforeDurationDiscountCents;
  const before12 = applyDurationDiscount(p, tier(12), DEFAULT_DURATION_TIERS).priceBeforeDurationDiscountCents;
  assert.equal(before3, 18_000);
  assert.equal(before6, 18_000);
  assert.equal(before9, 18_000);
  assert.equal(before12, 18_000);
});

test("owner-confirmed real example: monthly frequency (no frequency discount)", () => {
  const p = 9_000; // €90.00, the plain frequency-adjusted price for monthly billing
  assert.equal(applyDurationDiscount(p, tier(12), DEFAULT_DURATION_TIERS).discountedMonthlyCents, 9_000);
  assert.equal(applyDurationDiscount(p, tier(9), DEFAULT_DURATION_TIERS).discountedMonthlyCents, 9_529); // round(9000*0.90/0.85)
  assert.equal(applyDurationDiscount(p, tier(6), DEFAULT_DURATION_TIERS).discountedMonthlyCents, 10_059); // round(9000*0.95/0.85)
  assert.equal(applyDurationDiscount(p, tier(3), DEFAULT_DURATION_TIERS).discountedMonthlyCents, 10_588); // round(9000*1.00/0.85)
});

test("owner-confirmed real example: biweekly frequency (15% frequency discount already applied), matches 211.75 x 0.85 x 0.85 = 153 worked example", () => {
  const p = 15_300; // €153.00, already includes the 15% biweekly frequency discount
  const r12 = applyDurationDiscount(p, tier(12), DEFAULT_DURATION_TIERS);
  assert.equal(r12.discountedMonthlyCents, 15_300); // the €153 target, unchanged
  assert.equal(r12.priceBeforeDurationDiscountCents, 18_000); // €180.00
  assert.equal(r12.durationDiscountAmountCents, 2_700); // €27.00 = 15% of €180

  assert.equal(applyDurationDiscount(p, tier(9), DEFAULT_DURATION_TIERS).discountedMonthlyCents, 16_200); // round(15300*0.90/0.85)
  assert.equal(applyDurationDiscount(p, tier(6), DEFAULT_DURATION_TIERS).discountedMonthlyCents, 17_100); // round(15300*0.95/0.85)
  assert.equal(applyDurationDiscount(p, tier(3), DEFAULT_DURATION_TIERS).discountedMonthlyCents, 18_000); // round(15300*1.00/0.85)
});

test("each shorter tier costs strictly more than the next-longer tier", () => {
  const p = 15_300;
  const price3 = applyDurationDiscount(p, tier(3), DEFAULT_DURATION_TIERS).discountedMonthlyCents;
  const price6 = applyDurationDiscount(p, tier(6), DEFAULT_DURATION_TIERS).discountedMonthlyCents;
  const price9 = applyDurationDiscount(p, tier(9), DEFAULT_DURATION_TIERS).discountedMonthlyCents;
  const price12 = applyDurationDiscount(p, tier(12), DEFAULT_DURATION_TIERS).discountedMonthlyCents;
  assert.ok(price3 > price6);
  assert.ok(price6 > price9);
  assert.ok(price9 > price12);
});

test("durationDiscountAmountCents is always >= 0, zero only at the 0%-discount tier, positive (a real discount) at every other tier including the anchor", () => {
  const p = 15_300;
  assert.equal(applyDurationDiscount(p, tier(3), DEFAULT_DURATION_TIERS).durationDiscountAmountCents, 0);
  assert.ok(applyDurationDiscount(p, tier(6), DEFAULT_DURATION_TIERS).durationDiscountAmountCents > 0);
  assert.ok(applyDurationDiscount(p, tier(9), DEFAULT_DURATION_TIERS).durationDiscountAmountCents > 0);
  assert.ok(applyDurationDiscount(p, tier(12), DEFAULT_DURATION_TIERS).durationDiscountAmountCents > 0);
});

test("the 3-month price is exactly 15% more than the 12-month (anchor) price, matches 'save 15%' marketing copy", () => {
  const p = 15_300;
  const price3 = applyDurationDiscount(p, tier(3), DEFAULT_DURATION_TIERS).discountedMonthlyCents;
  const price12 = applyDurationDiscount(p, tier(12), DEFAULT_DURATION_TIERS).discountedMonthlyCents;
  assert.equal(price12, Math.round(price3 * 0.85));
});

test("minimum contract value is the tier's own real charged price times its own months", () => {
  const p = 15_300;
  const r9 = applyDurationDiscount(p, tier(9), DEFAULT_DURATION_TIERS);
  assert.equal(r9.minimumContractValueCents, r9.discountedMonthlyCents * 9);
  const r12 = applyDurationDiscount(p, tier(12), DEFAULT_DURATION_TIERS);
  assert.equal(r12.minimumContractValueCents, r12.discountedMonthlyCents * 12);
});

test("findDurationTier only matches enabled tiers", () => {
  const disabled = { ...tier(6), enabled: false };
  const tiers = [tier(3), disabled, tier(9), tier(12)];
  assert.equal(findDurationTier(tiers, 3)?.code, "3_month");
  assert.equal(findDurationTier(tiers, 6), null);
  assert.equal(findDurationTier(tiers, 99), null);
});
