import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DOORLOCK_INSTALLATION_PRICE_CENTS,
  buildAnnualInvoiceBreakdown,
  calculateAssessmentPriceCents,
  calculateAssessmentQuote,
  validateAssessmentBooking,
} from "./assessment";
import { DEFAULT_DURATION_TIERS } from "./subscription-duration";

test("assessment pricing uses transparent property-size tiers", () => {
  assert.equal(calculateAssessmentPriceCents(50), 7900);
  assert.equal(calculateAssessmentPriceCents(76), 11900);
  assert.equal(calculateAssessmentPriceCents(126), 16900);
  assert.equal(calculateAssessmentPriceCents(251, true), 24900);
});

test("annual billing gives a five-percent discount", () => {
  const quote = calculateAssessmentQuote(100, "biweekly");
  assert.equal(quote.estimatedMonthlyCents, 20_400);
  assert.equal(quote.estimatedAnnualCents, 232_560);
  assert.equal(quote.annualSavingsCents, 12_240);
  assert.equal(quote.dueTodayCents, quote.assessmentPriceCents);
  // No durationMonths supplied, pure backward-compatible default.
  assert.equal(quote.durationMonths, null);
  assert.equal(quote.durationDiscountPercent, 0);
  assert.equal(quote.priceBeforeDurationDiscountCents, null);
  assert.equal(quote.pauseEligible, false);
});

test("door-lock installation add-on adds 200 euro to due today", () => {
  const quote = calculateAssessmentQuote(75, "biweekly", false, true);
  assert.equal(quote.assessmentPriceCents, 7_900);
  assert.equal(quote.doorlockInstallationPriceCents, DOORLOCK_INSTALLATION_PRICE_CENTS);
  assert.equal(quote.dueTodayCents, 27_900);
});

// Corrected 2026-07-30 (second correction): the anchor (12 months, the
// largest discount) is the best REAL price on offer, its final price
// equals the plain frequency-adjusted price exactly, and every shorter tier
// genuinely costs more (matches the original 2026-07-28 real pricing).
// `priceBeforeDurationDiscountCents` is reverse-derived from EACH tier's own
// final price using that tier's own percentage, which lands on the SAME
// number (the 0%-discount / no-commitment price) for every tier, so
// `durationDiscountAmountCents` is always ≥ 0, a real discount at every
// tier including the anchor, never a surcharge. See
// subscription-duration.ts's doc comment.

test("3-month (0% tier) charges the real 'no commitment' price, higher than the plain frequency-adjusted preview, with zero duration discount", () => {
  // 100m² biweekly frequency-adjusted monthly is 20_400 cents (per the test above),
  // that's just the pre-duration PREVIEW; the real 3-month charge is higher.
  const threeMonth = calculateAssessmentQuote(100, "biweekly", false, false, 3);
  assert.equal(threeMonth.estimatedMonthlyCents, 24_000); // 20_400 / 0.85
  assert.equal(threeMonth.priceBeforeDurationDiscountCents, 24_000); // 0% tier, before equals its own real price
  assert.equal(threeMonth.durationDiscountAmountCents, 0);
  assert.equal(threeMonth.minimumContractValueCents, 72_000); // 24_000 * 3
  assert.equal(threeMonth.pauseEligible, false);
});

test("a 6-month commitment is a real discount that still stacks correctly with the annual-billing prepay discount", () => {
  const sixMonth = calculateAssessmentQuote(100, "biweekly", false, false, 6);
  assert.equal(sixMonth.priceBeforeDurationDiscountCents, 24_000); // same "before" as every other tier
  assert.equal(sixMonth.estimatedMonthlyCents, 22_800); // 20_400 * 0.95 / 0.85
  assert.ok(sixMonth.durationDiscountAmountCents! > 0); // a real discount, not a surcharge
  assert.equal(sixMonth.durationDiscountAmountCents, 24_000 - 22_800);
  const expectedAnnual = Math.round(22_800 * 12 * 0.95);
  assert.equal(sixMonth.estimatedAnnualCents, expectedAnnual);
});

test("12-month (the anchor) is the best real price, unchanged from the plain frequency-adjusted price, with the largest disclosed discount", () => {
  const quote = calculateAssessmentQuote(100, "biweekly", false, false, 12);
  assert.equal(quote.estimatedMonthlyCents, 20_400); // unchanged, the anchor
  assert.equal(quote.priceBeforeDurationDiscountCents, 24_000);
  assert.equal(quote.durationDiscountAmountCents, 3_600); // 24_000 - 20_400
  assert.equal(quote.pauseEligible, true);
});

test("each shorter duration costs strictly more than the next-longer one", () => {
  const price3 = calculateAssessmentQuote(100, "biweekly", false, false, 3).estimatedMonthlyCents!;
  const price6 = calculateAssessmentQuote(100, "biweekly", false, false, 6).estimatedMonthlyCents!;
  const price9 = calculateAssessmentQuote(100, "biweekly", false, false, 9).estimatedMonthlyCents!;
  const price12 = calculateAssessmentQuote(100, "biweekly", false, false, 12).estimatedMonthlyCents!;
  assert.ok(price3 > price6);
  assert.ok(price6 > price9);
  assert.ok(price9 > price12);
});

test("one-time fees are never duration-discounted", () => {
  const withDuration = calculateAssessmentQuote(75, "biweekly", false, true, 12);
  const withoutDuration = calculateAssessmentQuote(75, "biweekly", false, true);
  assert.equal(withDuration.assessmentPriceCents, withoutDuration.assessmentPriceCents);
  assert.equal(withDuration.doorlockInstallationPriceCents, withoutDuration.doorlockInstallationPriceCents);
  assert.equal(withDuration.dueTodayCents, withoutDuration.dueTodayCents);
});

test("disabled duration tiers are excluded from the quote", () => {
  const tiersWithout12MonthEnabled = DEFAULT_DURATION_TIERS.map((t) =>
    t.months === 12 ? { ...t, enabled: false } : t,
  );
  const quote = calculateAssessmentQuote(100, "biweekly", false, false, 12, tiersWithout12MonthEnabled);
  assert.equal(quote.durationMonths, null);
  assert.equal(quote.durationDiscountPercent, 0);
});

function baseBooking(overrides: Record<string, unknown> = {}) {
  return {
    locale: "en",
    fullName: "Test Person",
    email: "test@example.com",
    phone: "+212600000000",
    addressLine1: "1 Main Street",
    city: "Tangier",
    countryCode: "MA",
    sizeM2: 80,
    bedrooms: 2,
    bathrooms: 1,
    pets: false,
    smoking: false,
    condition: "standard",
    frequency: "monthly",
    billingInterval: "monthly",
    durationMonths: 12,
    preferredDate: "2026-07-20",
    timeSlot: "flexible",
    propertyAccuracyAccepted: true,
    termsAccepted: true,
    ...overrides,
  };
}

test("valid booking is normalized and priced server-side", () => {
  const result = validateAssessmentBooking({
    locale: "fr",
    fullName: "  Samira El Idrissi  ",
    email: " SAMIRA@EXAMPLE.COM ",
    phone: "+212600000000",
    addressLine1: "12 Avenue Mohammed VI",
    city: "Tangier",
    countryCode: "ma",
    sizeM2: 100,
    overMax: false,
    bedrooms: 3,
    bathrooms: 2,
    pets: false,
    smoking: false,
    condition: "standard",
    frequency: "biweekly",
    billingInterval: "annual",
    durationMonths: 9,
    preferredDate: "2026-07-20",
    timeSlot: "morning",
    propertyAccuracyAccepted: true,
    termsAccepted: true,
  }, new Date("2026-07-13T00:00:00Z"));
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value.fullName, "Samira El Idrissi");
    assert.equal(result.value.email, "samira@example.com");
    assert.equal(result.value.countryCode, "MA");
    assert.equal(result.value.durationMonths, 9);
    assert.equal(result.quote.assessmentPriceCents, 11_900);
    assert.equal(result.quote.durationMonths, 9);
    assert.equal(result.quote.durationDiscountPercent, 10);
    assert.equal(result.quote.pauseEligible, true);
    assert.equal(result.value.doorlockInstallationRequested, false);
  }
});

test("door-lock installation requires confirmed internet connection", () => {
  const result = validateAssessmentBooking(baseBooking({
    doorlockInstallationRequested: true,
    doorlockInternetConfirmed: false,
  }), new Date("2026-07-13T00:00:00Z"));
  assert.deepEqual(result, { ok: false, error: "doorlock_internet_required" });
});

test("unpaid booking input cannot bypass legal declarations", () => {
  const result = validateAssessmentBooking(baseBooking({
    propertyAccuracyAccepted: false,
  }), new Date("2026-07-13T00:00:00Z"));
  assert.deepEqual(result, { ok: false, error: "legal_acceptance_required" });
});

test("missing duration is rejected", () => {
  const result = validateAssessmentBooking(baseBooking({ durationMonths: undefined }), new Date("2026-07-13T00:00:00Z"));
  assert.deepEqual(result, { ok: false, error: "invalid_duration" });
});

test("a duration not offered by any enabled tier is rejected, server never trusts a client-sent duration blindly", () => {
  const result = validateAssessmentBooking(baseBooking({ durationMonths: 7 }), new Date("2026-07-13T00:00:00Z"));
  assert.deepEqual(result, { ok: false, error: "invalid_duration" });
});

test("a duration whose tier is disabled server-side is rejected even if the client sends a normally-valid month count", () => {
  const tiersWithout6MonthEnabled = DEFAULT_DURATION_TIERS.map((t) =>
    t.months === 6 ? { ...t, enabled: false } : t,
  );
  const result = validateAssessmentBooking(
    baseBooking({ durationMonths: 6 }),
    new Date("2026-07-13T00:00:00Z"),
    tiersWithout6MonthEnabled,
  );
  assert.deepEqual(result, { ok: false, error: "invalid_duration" });
});

test("buildAnnualInvoiceBreakdown reconciles exactly: subtotal - frequency - duration - annual = total", () => {
  // Real worked example: 120m² bi-weekly, 12-month duration, annual billing.
  const quote = calculateAssessmentQuote(120, "biweekly", false, false, 12);
  const breakdown = buildAnnualInvoiceBreakdown(quote, 15); // biweekly = 15% frequency discount
  assert.ok(breakdown);
  assert.equal(breakdown!.subtotalCents, 395_292);
  assert.equal(breakdown!.frequencyDiscountCents, 59_292);
  assert.equal(breakdown!.durationDiscountCents, 50_400);
  assert.equal(breakdown!.annualDiscountCents, 14_280);
  assert.equal(breakdown!.totalCents, 271_320);
  assert.equal(
    breakdown!.subtotalCents - breakdown!.frequencyDiscountCents - breakdown!.durationDiscountCents - breakdown!.annualDiscountCents,
    breakdown!.totalCents,
  );
});

test("buildAnnualInvoiceBreakdown returns null when the quote has no duration selected", () => {
  const quote = calculateAssessmentQuote(120, "biweekly");
  assert.equal(buildAnnualInvoiceBreakdown(quote, 15), null);
});

test("buildAnnualInvoiceBreakdown handles a 0%-frequency-discount plan (monthly cleaning) with no frequency line", () => {
  const quote = calculateAssessmentQuote(100, "monthly", false, false, 12);
  const breakdown = buildAnnualInvoiceBreakdown(quote, 0);
  assert.ok(breakdown);
  assert.equal(breakdown!.frequencyDiscountCents, 0);
  assert.equal(
    breakdown!.subtotalCents - breakdown!.frequencyDiscountCents - breakdown!.durationDiscountCents - breakdown!.annualDiscountCents,
    breakdown!.totalCents,
  );
});
