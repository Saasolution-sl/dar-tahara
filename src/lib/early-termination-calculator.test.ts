import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addUtcMonthsClamped,
  calculateEarlyTermination,
  computeDeepCleanRecovery,
  determineContractCycleState,
  evaluateEarlyTerminationEligibility,
  selectReplacementTier,
  summarizeSettlementInvoiceAllocations,
  tierMonthlyPriceCents,
} from "./early-termination-calculator";
import { DEFAULT_DURATION_TIERS } from "./subscription-duration";

const TIERS = DEFAULT_DURATION_TIERS;
const tier = (months: number) => TIERS.find((candidate) => candidate.months === months)!;

test("the exact worked example produces 106728 cents", () => {
  const result = calculateEarlyTermination({
    activatedAt: new Date("2026-01-01T00:00:00Z"),
    pauseMonthsUsed: 0,
    asOf: new Date("2026-04-01T00:00:00Z"),
    originalTier: tier(12),
    tiers: TIERS,
    priceBeforeDurationDiscountCents: 33_882,
    currency: "eur",
    amountPreviouslyPaidCents: 86_400,
    deepClean: { used: false, retailPriceCents: null },
  });

  assert.equal(result.completedMonths, 3);
  assert.equal(result.currentContractMonth, 4);
  assert.equal(result.replacementTier.months, 6);
  assert.equal(result.originalMonthlyCents, 28_800);
  assert.equal(result.replacementMonthlyCents, 32_188);
  assert.equal(result.amountPreviouslyPaidCents, 86_400);
  assert.equal(result.recalculatedConsumedPeriodCents, 96_564);
  assert.equal(result.discountCorrectionCents, 10_164);
  assert.equal(result.remainingMinimumMonths, 3);
  assert.equal(result.remainingMinimumTermAmountCents, 96_564);
  assert.equal(result.totalCents, 106_728);
});

test("billing-cycle boundary distinguishes the end of month 3 from the start of month 4", () => {
  const activatedAt = new Date("2026-01-01T00:00:00Z");
  const beforeAnniversary = determineContractCycleState(
    activatedAt,
    0,
    new Date("2026-03-31T23:59:59.999Z"),
  );
  const anniversary = determineContractCycleState(
    activatedAt,
    0,
    new Date("2026-04-01T00:00:00Z"),
  );
  assert.equal(beforeAnniversary.completedMonths, 2);
  assert.equal(beforeAnniversary.currentContractMonth, 3);
  assert.equal(selectReplacementTier(beforeAnniversary.currentContractMonth, TIERS)?.months, 3);
  assert.equal(anniversary.completedMonths, 3);
  assert.equal(anniversary.currentContractMonth, 4);
  assert.equal(selectReplacementTier(anniversary.currentContractMonth, TIERS)?.months, 6);
});

test("replacement boundaries select the configured shortest covering tier", () => {
  assert.equal(selectReplacementTier(1, TIERS)?.months, 3);
  assert.equal(selectReplacementTier(3, TIERS)?.months, 3);
  assert.equal(selectReplacementTier(4, TIERS)?.months, 6);
  assert.equal(selectReplacementTier(6, TIERS)?.months, 6);
  assert.equal(selectReplacementTier(7, TIERS)?.months, 9);
  assert.equal(selectReplacementTier(10, TIERS)?.months, 12);
});

test("calendar month arithmetic clamps leap-year and month-end anniversaries", () => {
  assert.equal(addUtcMonthsClamped(new Date("2024-01-31T10:00:00Z"), 1).toISOString(), "2024-02-29T10:00:00.000Z");
  assert.equal(addUtcMonthsClamped(new Date("2025-01-31T10:00:00Z"), 1).toISOString(), "2025-02-28T10:00:00.000Z");
  const leap = determineContractCycleState(
    new Date("2024-01-31T10:00:00Z"),
    0,
    new Date("2024-02-29T10:00:00Z"),
  );
  assert.equal(leap.completedMonths, 1);
  assert.equal(leap.currentContractMonth, 2);
});

test("a mid-month or prorated first period is not completed before its billing anniversary", () => {
  const activatedAt = new Date("2026-01-15T12:00:00Z");
  const beforeFirstAnniversary = determineContractCycleState(
    activatedAt,
    0,
    new Date("2026-02-15T11:59:59Z"),
  );
  const firstAnniversary = determineContractCycleState(
    activatedAt,
    0,
    new Date("2026-02-15T12:00:00Z"),
  );
  assert.equal(beforeFirstAnniversary.completedMonths, 0);
  assert.equal(beforeFirstAnniversary.currentContractMonth, 1);
  assert.equal(firstAnniversary.completedMonths, 1);
  assert.equal(firstAnniversary.currentContractMonth, 2);
});

test("a used pause extends the contract clock instead of consuming a contract month", () => {
  const state = determineContractCycleState(
    new Date("2026-01-01T00:00:00Z"),
    2,
    new Date("2026-06-01T00:00:00Z"),
  );
  assert.equal(state.completedMonths, 3);
  assert.equal(state.currentContractMonth, 4);
  assert.equal(state.currentPeriodStart.toISOString(), "2026-06-01T00:00:00.000Z");
});

test("eligibility permits monthly fixed terms and rejects prepaid, expired, and terminated contracts", () => {
  const base = {
    contractDurationMonths: 12,
    activatedAt: new Date("2026-01-01T00:00:00Z"),
    contractEndAt: new Date("2027-01-01T00:00:00Z"),
    asOf: new Date("2026-04-01T00:00:00Z"),
    subscriptionStatus: "active",
    cancellationStatus: null,
  };
  assert.deepEqual(evaluateEarlyTerminationEligibility({ ...base, billingMethod: "monthly" }), { eligible: true });
  assert.equal(evaluateEarlyTerminationEligibility({ ...base, billingMethod: "prepaid" }).eligible, false);
  assert.deepEqual(
    evaluateEarlyTerminationEligibility({ ...base, billingMethod: "prepaid" }),
    { eligible: false, reason: "prepaid_contract" },
  );
  assert.deepEqual(
    evaluateEarlyTerminationEligibility({
      ...base,
      billingMethod: "monthly",
      asOf: new Date("2027-01-01T00:00:00Z"),
    }),
    { eligible: false, reason: "outside_minimum_term" },
  );
  assert.deepEqual(
    evaluateEarlyTerminationEligibility({
      ...base,
      billingMethod: "monthly",
      cancellationStatus: "confirmed",
    }),
    { eligible: false, reason: "already_terminated" },
  );
  assert.deepEqual(
    evaluateEarlyTerminationEligibility({
      ...base,
      billingMethod: "monthly",
      contractDurationMonths: null,
    }),
    { eligible: false, reason: "no_fixed_term_contract" },
  );
  assert.deepEqual(
    evaluateEarlyTerminationEligibility({
      ...base,
      billingMethod: "monthly",
      asOf: new Date("2025-12-31T23:59:59Z"),
    }),
    { eligible: false, reason: "contract_not_started" },
  );
});

test("administrator waiver bypasses the settlement flow", () => {
  const result = evaluateEarlyTerminationEligibility({
    billingMethod: "monthly",
    contractDurationMonths: 12,
    activatedAt: new Date("2026-01-01T00:00:00Z"),
    contractEndAt: new Date("2027-01-01T00:00:00Z"),
    asOf: new Date("2026-04-01T00:00:00Z"),
    subscriptionStatus: "active",
    cancellationStatus: null,
    administratorWaiver: true,
  });
  assert.deepEqual(result, { eligible: false, reason: "administrator_waiver" });
});

test("invoice allocation absorbs unpaid month 4 without adding it twice", () => {
  const allocation = summarizeSettlementInvoiceAllocations([
    {
      id: "month-3",
      status: "paid",
      amountDueCents: 28_800,
      amountPaidCents: 28_800,
      periodStart: new Date("2026-03-01T00:00:00Z"),
      periodEnd: new Date("2026-04-01T00:00:00Z"),
    },
    {
      id: "month-4",
      status: "open",
      amountDueCents: 28_800,
      amountPaidCents: 0,
      periodStart: new Date("2026-04-01T00:00:00Z"),
      periodEnd: new Date("2026-05-01T00:00:00Z"),
    },
  ], new Date("2026-04-01T00:00:00Z"));
  assert.equal(allocation.completedPeriodPaymentsCents, 28_800);
  assert.equal(allocation.remainingTermPaymentsCents, 0);
  assert.equal(allocation.includedInvoiceOutstandingCents, 28_800);
  assert.deepEqual(allocation.includedInvoiceIds, ["month-4"]);
});

test("a partial month-4 payment is deducted from the replacement remaining term", () => {
  const allocation = summarizeSettlementInvoiceAllocations([{
    id: "month-4",
    status: "open",
    amountDueCents: 28_800,
    amountPaidCents: 10_000,
    periodStart: new Date("2026-04-01T00:00:00Z"),
    periodEnd: new Date("2026-05-01T00:00:00Z"),
  }], new Date("2026-04-01T00:00:00Z"));
  assert.equal(allocation.remainingTermPaymentsCents, 10_000);
  assert.equal(allocation.includedInvoiceOutstandingCents, 18_800);
});

test("void invoices are not allocated or included", () => {
  const allocation = summarizeSettlementInvoiceAllocations([{
    id: "voided",
    status: "void",
    amountDueCents: 28_800,
    amountPaidCents: 0,
    periodStart: new Date("2026-04-01T00:00:00Z"),
    periodEnd: new Date("2026-05-01T00:00:00Z"),
  }], new Date("2026-04-01T00:00:00Z"));
  assert.deepEqual(allocation.includedInvoiceIds, []);
  assert.equal(allocation.includedInvoiceOutstandingCents, 0);
});

test("negative results are held at zero and flagged for administrator credit review", () => {
  const result = calculateEarlyTermination({
    activatedAt: new Date("2026-01-01T00:00:00Z"),
    pauseMonthsUsed: 0,
    asOf: new Date("2026-04-01T00:00:00Z"),
    originalTier: tier(12),
    tiers: TIERS,
    priceBeforeDurationDiscountCents: 33_882,
    currency: "eur",
    amountPreviouslyPaidCents: 999_999,
    deepClean: { used: false, retailPriceCents: null },
  });
  assert.equal(result.totalCents, 0);
  assert.equal(result.creditReviewRequired, true);
  assert.ok(result.rawTotalCents < 0);
});

test("tier prices and recoverable benefits remain data driven", () => {
  assert.equal(tierMonthlyPriceCents(33_882, tier(12)), 28_800);
  assert.equal(tierMonthlyPriceCents(33_882, tier(6)), 32_188);
  assert.equal(computeDeepCleanRecovery({
    used: true,
    originalTierIncludesFreeDeepClean: true,
    replacementTierIncludesFreeDeepClean: false,
    retailPriceCents: 30_000,
  }), 30_000);
});
