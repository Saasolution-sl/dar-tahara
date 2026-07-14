import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DOORLOCK_INSTALLATION_PRICE_CENTS,
  calculateAssessmentPriceCents,
  calculateAssessmentQuote,
  validateAssessmentBooking,
} from "./assessment";

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
});

test("door-lock installation add-on adds 200 euro to due today", () => {
  const quote = calculateAssessmentQuote(75, "biweekly", false, true);
  assert.equal(quote.assessmentPriceCents, 7_900);
  assert.equal(quote.doorlockInstallationPriceCents, DOORLOCK_INSTALLATION_PRICE_CENTS);
  assert.equal(quote.dueTodayCents, 27_900);
});

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
    assert.equal(result.quote.assessmentPriceCents, 11_900);
    assert.equal(result.value.doorlockInstallationRequested, false);
  }
});

test("door-lock installation requires confirmed internet connection", () => {
  const result = validateAssessmentBooking({
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
    preferredDate: "2026-07-20",
    timeSlot: "flexible",
    doorlockInstallationRequested: true,
    doorlockInternetConfirmed: false,
    propertyAccuracyAccepted: true,
    termsAccepted: true,
  }, new Date("2026-07-13T00:00:00Z"));
  assert.deepEqual(result, { ok: false, error: "doorlock_internet_required" });
});

test("unpaid booking input cannot bypass legal declarations", () => {
  const result = validateAssessmentBooking({
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
    preferredDate: "2026-07-20",
    timeSlot: "flexible",
    propertyAccuracyAccepted: false,
    termsAccepted: true,
  }, new Date("2026-07-13T00:00:00Z"));
  assert.deepEqual(result, { ok: false, error: "legal_acceptance_required" });
});
