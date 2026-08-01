import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDeepCleanRequest, type SubscriptionForDeepCleanCheck } from "./deep-clean-eligibility";

const TODAY = new Date("2026-08-01T00:00:00Z");

function sub(overrides: Partial<SubscriptionForDeepCleanCheck> = {}): SubscriptionForDeepCleanCheck {
  return { status: "active", contractIncludesFreeDeepClean: true, deepCleanFreeUsed: false, ...overrides };
}

test("a subscriber on a tier that includes a free deep clean, who hasn't used it, gets it for free", () => {
  const result = validateDeepCleanRequest(sub(), false, { requestedDate: "2026-09-01" }, TODAY);
  assert.ok(result.ok);
  if (result.ok) assert.equal(result.value.isFree, true);
});

test("a subscriber who already used their free deep clean pays", () => {
  const result = validateDeepCleanRequest(sub({ deepCleanFreeUsed: true }), false, { requestedDate: "2026-09-01" }, TODAY);
  assert.ok(result.ok);
  if (result.ok) assert.equal(result.value.isFree, false);
});

test("a subscriber on a tier that does not include a free deep clean always pays, even if never used", () => {
  const result = validateDeepCleanRequest(sub({ contractIncludesFreeDeepClean: false }), false, { requestedDate: "2026-09-01" }, TODAY);
  assert.ok(result.ok);
  if (result.ok) assert.equal(result.value.isFree, false);
});

test("an inactive subscription is rejected", () => {
  const result = validateDeepCleanRequest(sub({ status: "paused" }), false, { requestedDate: "2026-09-01" }, TODAY);
  assert.deepEqual(result, { ok: false, error: "subscription_not_active" });
});

test("a conflicting non-terminal request is rejected", () => {
  const result = validateDeepCleanRequest(sub(), true, { requestedDate: "2026-09-01" }, TODAY);
  assert.deepEqual(result, { ok: false, error: "deep_clean_request_already_pending" });
});

test("a past requested date is rejected", () => {
  const result = validateDeepCleanRequest(sub(), false, { requestedDate: "2026-07-01" }, TODAY);
  assert.deepEqual(result, { ok: false, error: "start_date_in_past" });
});

test("today is a valid requested date", () => {
  const result = validateDeepCleanRequest(sub(), false, { requestedDate: "2026-08-01" }, TODAY);
  assert.ok(result.ok);
});

test("a malformed date is rejected", () => {
  const result = validateDeepCleanRequest(sub(), false, { requestedDate: "not-a-date" }, TODAY);
  assert.deepEqual(result, { ok: false, error: "invalid_dates" });
});
