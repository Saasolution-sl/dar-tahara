import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AC_ADDON_PRICE_CENTS,
  computeAdditionalAcCount,
  computeAcAddonCents,
  generateBenefitWindows,
} from "./ac-maintenance";

test("additional AC count excludes the included unit", () => {
  assert.equal(computeAdditionalAcCount(0), 0);
  assert.equal(computeAdditionalAcCount(1), 0);
  assert.equal(computeAdditionalAcCount(2), 1);
  assert.equal(computeAdditionalAcCount(3), 2);
  assert.equal(computeAdditionalAcCount(6), 5);
});

test("AC add-on pricing matches the spec's worked table exactly", () => {
  // 0 AC / 1 AC -> 0, 2 AC -> 4 EUR, 3 AC -> 8 EUR, 6 AC -> 20 EUR (cents).
  assert.equal(computeAcAddonCents(computeAdditionalAcCount(0)), 0);
  assert.equal(computeAcAddonCents(computeAdditionalAcCount(1)), 0);
  assert.equal(computeAcAddonCents(computeAdditionalAcCount(2)), 400);
  assert.equal(computeAcAddonCents(computeAdditionalAcCount(3)), 800);
  assert.equal(computeAcAddonCents(computeAdditionalAcCount(6)), 2000);
});

test("never charges for the included unit alone", () => {
  assert.equal(computeAcAddonCents(0), 0);
});

test("AC_ADDON_PRICE_CENTS is the single source of the per-unit price", () => {
  assert.equal(AC_ADDON_PRICE_CENTS, 400);
  assert.equal(computeAcAddonCents(1), AC_ADDON_PRICE_CENTS);
});

test("benefit windows match the spec's worked example exactly", () => {
  const windows = generateBenefitWindows(new Date("2026-09-15T00:00:00.000Z"));
  assert.deepEqual(windows.window1, { start: "2026-09-15", end: "2027-03-14" });
  assert.deepEqual(windows.window2, { start: "2027-03-15", end: "2027-09-14" });
});

test("benefit windows never overlap and cover the full 12-month period", () => {
  const windows = generateBenefitWindows(new Date("2026-01-31T00:00:00.000Z"));
  assert.ok(windows.window1.start < windows.window1.end);
  assert.ok(windows.window2.start < windows.window2.end);
  assert.ok(windows.window1.end < windows.window2.start);
});

test("benefit windows clamp cleanly across a leap-year February", () => {
  const windows = generateBenefitWindows(new Date("2027-08-31T00:00:00.000Z"));
  // 6 months from 31 Aug 2027 clamps to the last day of Feb 2028 (leap year).
  assert.equal(windows.window2.start, "2028-02-29");
});
