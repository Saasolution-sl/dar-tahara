import assert from "node:assert/strict";
import test from "node:test";
import { evaluateRetentionRules, type RetentionRule } from "./retention-control";

const approved: RetentionRule = {
  category: "records",
  retention_days: 30,
  legal_basis: "Approved records schedule",
  enabled: true,
  approved_by: "Records owner",
  approved_at: "2026-01-01T00:00:00.000Z",
  next_review_at: "2027-01-01T00:00:00.000Z",
};
const now = new Date("2026-08-21T00:00:00.000Z");

test("approved retention rules are executable", () => {
  assert.deepEqual(evaluateRetentionRules(["records"], [approved], [], now), {
    allowed: true,
    daysByCategory: { records: 30 },
  });
});

test("disabled or unapproved rules fail closed", () => {
  const decision = evaluateRetentionRules(["records"], [{ ...approved, enabled: false }], [], now);
  assert.deepEqual(decision, { allowed: false, code: "retention_rule_unapproved", categories: ["records"] });
});

test("overdue reviews fail closed", () => {
  const decision = evaluateRetentionRules(["records"], [{ ...approved, next_review_at: "2026-01-02T00:00:00.000Z" }], [], now);
  assert.deepEqual(decision, { allowed: false, code: "retention_review_overdue", categories: ["records"] });
});

test("an active category legal hold blocks bulk deletion", () => {
  const decision = evaluateRetentionRules(["records"], [approved], [{
    subject_type: "retention_category",
    subject_reference: "records",
    expires_at: null,
  }], now);
  assert.deepEqual(decision, { allowed: false, code: "active_legal_hold", categories: ["records"] });
});
