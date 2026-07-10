import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePrice,
  getPricePerVisit,
  formatEuro,
  normaliseSize,
  type PriceBreakdown,
} from "./pricing";

/** Narrow to an "ok" breakdown or fail the test with a helpful message. */
function ok(size: number, freq: Parameters<typeof calculatePrice>[1]): PriceBreakdown {
  const r = calculatePrice(size, freq);
  assert.equal(r.status, "ok", `expected ok for ${size}m² ${freq}, got ${r.status}`);
  return r as PriceBreakdown;
}

test("base price per visit by tier", () => {
  assert.equal(getPricePerVisit(50), 50);
  assert.equal(getPricePerVisit(51), 90);
  assert.equal(getPricePerVisit(75), 90);
  assert.equal(getPricePerVisit(76), 120);
  assert.equal(getPricePerVisit(100), 120);
  assert.equal(getPricePerVisit(101), 140);
  assert.equal(getPricePerVisit(125), 140);
  assert.equal(getPricePerVisit(126), null);
});

test("50 m² once per month returns €50", () => {
  assert.equal(ok(50, "monthly").monthlyTotal, 50);
});

test("51 m² once per month returns €90", () => {
  assert.equal(ok(51, "monthly").monthlyTotal, 90);
});

test("75 m² bi-weekly returns €153", () => {
  const r = ok(75, "biweekly");
  assert.equal(r.subtotal, 180);
  assert.equal(r.discountAmount, 27);
  assert.equal(r.monthlyTotal, 153);
  assert.equal(r.effectivePricePerVisit, 76.5);
});

test("76 m² bi-weekly returns €204", () => {
  assert.equal(ok(76, "biweekly").monthlyTotal, 204);
});

test("100 m² weekly returns €384", () => {
  assert.equal(ok(100, "weekly").monthlyTotal, 384);
});

test("125 m² weekly returns €448", () => {
  assert.equal(ok(125, "weekly").monthlyTotal, 448);
});

test("126 m² returns custom quotation status", () => {
  assert.equal(calculatePrice(126, "monthly").status, "custom");
  assert.equal(calculatePrice(250, "weekly").status, "custom");
});

test("invalid and negative input is rejected", () => {
  assert.equal(calculatePrice(NaN, "monthly").status, "invalid");
  assert.equal(calculatePrice(Number.POSITIVE_INFINITY, "monthly").status, "invalid");
  assert.equal(calculatePrice(0, "monthly").status, "invalid");
  assert.equal(calculatePrice(-40, "monthly").status, "invalid");
  // Non-numeric values coming from an input field.
  assert.equal(calculatePrice("abc" as unknown as number, "monthly").status, "invalid");
});

test("decimal property sizes are handled consistently (matched by upper bound)", () => {
  assert.equal(getPricePerVisit(50.5), 90);
  assert.equal(getPricePerVisit(75.9), 120);
  assert.equal(ok(68.4, "biweekly").pricePerVisit, 90);
  assert.equal(ok(50.0, "monthly").monthlyTotal, 50);
  // 50.0000001 should still fall to the next tier deterministically.
  assert.equal(getPricePerVisit(50.0000001), 90);
});

test("all documented pricing examples pass", () => {
  const monthly = { 50: 50, 75: 90, 100: 120, 125: 140 } as const;
  for (const [size, total] of Object.entries(monthly)) {
    assert.equal(ok(Number(size), "monthly").monthlyTotal, total);
  }
  const biweekly = { 50: 85, 75: 153, 100: 204, 125: 238 } as const;
  for (const [size, total] of Object.entries(biweekly)) {
    assert.equal(ok(Number(size), "biweekly").monthlyTotal, total);
  }
  const weekly = { 50: 160, 75: 288, 100: 384, 125: 448 } as const;
  for (const [size, total] of Object.entries(weekly)) {
    assert.equal(ok(Number(size), "weekly").monthlyTotal, total);
  }
});

test("effective price per visit examples", () => {
  assert.equal(ok(50, "biweekly").effectivePricePerVisit, 42.5);
  assert.equal(ok(50, "weekly").effectivePricePerVisit, 40);
});

test("formatEuro shows decimals only when needed", () => {
  assert.equal(formatEuro(153), "€153");
  assert.equal(formatEuro(76.5), "€76.50");
  assert.equal(formatEuro(42.5), "€42.50");
  assert.equal(formatEuro(50), "€50");
  assert.equal(formatEuro(50, true), "€50.00");
});

test("normaliseSize clamps to range and rejects non-numbers", () => {
  assert.equal(normaliseSize(10), 20);
  assert.equal(normaliseSize(300), 250);
  assert.equal(normaliseSize(68), 68);
  assert.equal(normaliseSize(NaN), null);
});
