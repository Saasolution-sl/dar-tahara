import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateDeepCleanPriceCents } from "./deep-clean-pricing";
import { calculatePrice } from "./pricing";

test("the paid deep-clean price is exactly double the once-per-month price, in cents", () => {
  for (const sizeM2 of [40, 68, 100, 120]) {
    const monthly = calculatePrice(sizeM2, "monthly");
    assert.equal(monthly.status, "ok");
    if (monthly.status !== "ok") return;
    assert.equal(calculateDeepCleanPriceCents(sizeM2), Math.round(monthly.monthlyTotal * 2 * 100));
  }
});

test("a 68m² home (€90/visit monthly) prices a deep clean at €180.00", () => {
  assert.equal(calculateDeepCleanPriceCents(68), 18000);
});

test("large homes above the tiered threshold still price via the area-surcharged monthly rate", () => {
  const sizeM2 = 183;
  const monthly = calculatePrice(sizeM2, "monthly");
  assert.equal(monthly.status, "ok");
  if (monthly.status !== "ok") return;
  assert.ok(monthly.areaSurcharge > 0);
  assert.equal(calculateDeepCleanPriceCents(sizeM2), Math.round(monthly.monthlyTotal * 2 * 100));
});

test("sizes requiring a custom quote return null rather than a guessed price", () => {
  assert.equal(calculateDeepCleanPriceCents(300), null);
});

test("invalid sizes return null", () => {
  assert.equal(calculateDeepCleanPriceCents(0), null);
  assert.equal(calculateDeepCleanPriceCents(Number.NaN), null);
});
