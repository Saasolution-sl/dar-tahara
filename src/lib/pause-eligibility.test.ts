import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePauseRequest, monthsCoveredByPause, type SubscriptionForPauseCheck } from "./pause-eligibility";

const TODAY = new Date("2026-08-01T00:00:00Z");

function eligibleSub(overrides: Partial<SubscriptionForPauseCheck> = {}): SubscriptionForPauseCheck {
  return {
    status: "active",
    pauseEligible: true,
    pauseUsed: false,
    currentContractEndDate: "2027-08-01",
    ...overrides,
  };
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    reasonCategory: "construction",
    reasonDescription: "Full villa renovation, cleaning is impossible during works.",
    requestedStartDate: "2026-09-01",
    requestedEndDate: "2026-10-15",
    ...overrides,
  };
}

test("a valid request from an eligible subscription is accepted", () => {
  const result = validatePauseRequest(eligibleSub(), false, 2, validBody(), TODAY);
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value.reasonCategory, "construction");
    assert.equal(result.value.requestedStartDate, "2026-09-01");
    assert.equal(result.value.requestedEndDate, "2026-10-15");
  }
});

test("3- and 6-month subscriptions (pauseEligible=false) are rejected", () => {
  const result = validatePauseRequest(eligibleSub({ pauseEligible: false }), false, 2, validBody(), TODAY);
  assert.deepEqual(result, { ok: false, error: "not_pause_eligible" });
});

test("9- and 12-month subscriptions (pauseEligible=true) reach the field validation stage", () => {
  const result = validatePauseRequest(eligibleSub({ pauseEligible: true }), false, 2, validBody(), TODAY);
  assert.ok(result.ok);
});

test("a subscription that already used its pause is rejected", () => {
  const result = validatePauseRequest(eligibleSub({ pauseUsed: true }), false, 2, validBody(), TODAY);
  assert.deepEqual(result, { ok: false, error: "pause_already_used" });
});

test("an inactive subscription is rejected", () => {
  const result = validatePauseRequest(eligibleSub({ status: "past_due" }), false, 2, validBody(), TODAY);
  assert.deepEqual(result, { ok: false, error: "subscription_not_active" });
});

test("a conflicting non-terminal pause request is rejected", () => {
  const result = validatePauseRequest(eligibleSub(), true, 2, validBody(), TODAY);
  assert.deepEqual(result, { ok: false, error: "pause_request_already_pending" });
});

test("maximum pause is enforced from the tier's own max_pause_months", () => {
  // 2 months allowed: Sep 1 -> Nov 1 is exactly the boundary (allowed); Sep 1 -> Nov 2 exceeds it.
  const atLimit = validatePauseRequest(eligibleSub(), false, 2, validBody({ requestedEndDate: "2026-11-01" }), TODAY);
  assert.ok(atLimit.ok);
  const overLimit = validatePauseRequest(eligibleSub(), false, 2, validBody({ requestedEndDate: "2026-11-02" }), TODAY);
  assert.deepEqual(overLimit, { ok: false, error: "exceeds_max_pause_months" });
});

test("a tier with maxPauseMonths=0 (3- or 6-month misconfigured as eligible) allows no range at all", () => {
  const result = validatePauseRequest(eligibleSub(), false, 0, validBody(), TODAY);
  assert.deepEqual(result, { ok: false, error: "exceeds_max_pause_months" });
});

test("requested start date cannot be before today", () => {
  const result = validatePauseRequest(eligibleSub(), false, 2, validBody({ requestedStartDate: "2026-07-01", requestedEndDate: "2026-08-15" }), TODAY);
  assert.deepEqual(result, { ok: false, error: "start_date_in_past" });
});

test("today's date is a valid start date (not treated as 'in the past')", () => {
  const result = validatePauseRequest(eligibleSub(), false, 2, validBody({ requestedStartDate: "2026-08-01", requestedEndDate: "2026-09-01" }), TODAY);
  assert.ok(result.ok);
});

test("end date must be after start date", () => {
  const result = validatePauseRequest(eligibleSub(), false, 2, validBody({ requestedStartDate: "2026-09-10", requestedEndDate: "2026-09-10" }), TODAY);
  assert.deepEqual(result, { ok: false, error: "end_before_start" });
});

test("requested range cannot extend beyond the current contract end date", () => {
  const result = validatePauseRequest(
    eligibleSub({ currentContractEndDate: "2026-09-20" }), false, 2,
    validBody({ requestedStartDate: "2026-09-01", requestedEndDate: "2026-09-25" }), TODAY,
  );
  assert.deepEqual(result, { ok: false, error: "outside_contract_period" });
});

test("a null contract end date (unknown) does not block an otherwise valid request", () => {
  const result = validatePauseRequest(eligibleSub({ currentContractEndDate: null }), false, 2, validBody(), TODAY);
  assert.ok(result.ok);
});

test("an unknown reason category is rejected, never trust a client-sent free-text category", () => {
  const result = validatePauseRequest(eligibleSub(), false, 2, validBody({ reasonCategory: "vacation" }), TODAY);
  assert.deepEqual(result, { ok: false, error: "invalid_reason_category" });
});

test("holiday/travel is not a valid reason category at all (not just rejected by an admin later)", () => {
  for (const bogus of ["holiday", "travel", "vacation", "no_guests", "financial_difficulty"]) {
    const result = validatePauseRequest(eligibleSub(), false, 2, validBody({ reasonCategory: bogus }), TODAY);
    assert.equal(result.ok, false);
  }
});

test("an empty reason description is rejected", () => {
  const result = validatePauseRequest(eligibleSub(), false, 2, validBody({ reasonDescription: "   " }), TODAY);
  assert.deepEqual(result, { ok: false, error: "reason_description_required" });
});

test("malformed dates are rejected", () => {
  const result = validatePauseRequest(eligibleSub(), false, 2, validBody({ requestedStartDate: "not-a-date" }), TODAY);
  assert.deepEqual(result, { ok: false, error: "invalid_dates" });
});

test("monthsCoveredByPause covers every full calendar month between start (inclusive) and end (exclusive, the resume date)", () => {
  assert.deepEqual(monthsCoveredByPause("2026-08-01", "2026-10-01"), ["2026-08", "2026-09"]);
});

test("monthsCoveredByPause handles a single-month pause", () => {
  assert.deepEqual(monthsCoveredByPause("2026-08-15", "2026-09-15"), ["2026-08"]);
});

test("monthsCoveredByPause handles a pause spanning a year boundary", () => {
  assert.deepEqual(monthsCoveredByPause("2026-12-01", "2027-02-01"), ["2026-12", "2027-01"]);
});
