import assert from "node:assert/strict";
import test from "node:test";
import {
  EARLY_ACCESS_ASSESSMENT_OFFER,
  isEarlyAccessAssessmentPayment,
} from "@/lib/products/early-access-assessment";
import { calculateAssessmentPriceCents } from "@/lib/assessment";
import {
  canTransition,
  countQualified,
  countsTowardReward,
  evaluateQualification,
  evaluateReversal,
  type ReferralFraudStatus,
  type ReferralStatus,
} from "@/lib/referral/lifecycle";

const base = {
  currentStatus: "PAYMENT_PENDING" as ReferralStatus,
  fraudStatus: "CLEAR" as ReferralFraudStatus,
  paymentSettled: true,
  isSelfReferral: false,
  alreadyReferred: false,
};

test("the early-access product is EUR 39.99 and separate from the tiered assessment", () => {
  assert.equal(EARLY_ACCESS_ASSESSMENT_OFFER.priceCents, 3_999);
  // The standard assessment must be untouched by introducing this product.
  assert.equal(calculateAssessmentPriceCents(50), 7_900);
  assert.equal(calculateAssessmentPriceCents(100), 11_900);
  assert.equal(calculateAssessmentPriceCents(300), 24_900);
  // And they must never be confusable by price.
  assert.notEqual(calculateAssessmentPriceCents(50), EARLY_ACCESS_ASSESSMENT_OFFER.priceCents);
});

test("only the right product at the right price qualifies a referral", () => {
  assert.equal(
    isEarlyAccessAssessmentPayment({ productCode: "early_access_assessment", amountCents: 3_999 }),
    true,
  );
  // A tampered or mispriced session must not qualify anyone.
  assert.equal(
    isEarlyAccessAssessmentPayment({ productCode: "early_access_assessment", amountCents: 1 }),
    false,
  );
  assert.equal(
    isEarlyAccessAssessmentPayment({ productCode: "digital_smart_lock_installation", amountCents: 3_999 }),
    false,
  );
  assert.equal(isEarlyAccessAssessmentPayment({ productCode: null, amountCents: null }), false);
});

test("a settled payment qualifies a pending referral", () => {
  assert.deepEqual(evaluateQualification(base), { qualify: true });
});

test("nothing short of a settled payment qualifies", () => {
  // Clicks, signups and abandoned checkouts (brief §3).
  for (const currentStatus of ["CLICKED", "SIGNED_UP", "PAYMENT_PENDING"] as ReferralStatus[]) {
    const d = evaluateQualification({ ...base, currentStatus, paymentSettled: false });
    assert.equal(d.qualify, false);
    assert.equal((d as { reason: string }).reason, "payment_not_settled");
  }
});

test("self-referral is blocked, not merely rejected", () => {
  const d = evaluateQualification({ ...base, isSelfReferral: true });
  assert.equal(d.qualify, false);
  assert.equal((d as { reason: string }).reason, "self_referral");
  assert.equal((d as { suggestedFraudStatus: string }).suggestedFraudStatus, "BLOCKED");
});

test("a customer cannot be credited to two referrers", () => {
  const d = evaluateQualification({ ...base, alreadyReferred: true });
  assert.equal(d.qualify, false);
  assert.equal((d as { reason: string }).reason, "duplicate_referral");
  // Flagged for a human rather than silently binned: households exist.
  assert.equal((d as { suggestedFraudStatus: string }).suggestedFraudStatus, "REVIEW");
});

test("a repeated webhook cannot qualify the same referral twice", () => {
  const first = evaluateQualification(base);
  assert.equal(first.qualify, true);
  // The same event arriving again finds the referral already QUALIFIED.
  const second = evaluateQualification({ ...base, currentStatus: "QUALIFIED" });
  assert.equal(second.qualify, false);
  assert.equal((second as { reason: string }).reason, "already_qualified");
});

test("BLOCKED withholds the reward; REVIEW does not", () => {
  assert.equal(countsTowardReward("QUALIFIED", "CLEAR"), true);
  assert.equal(countsTowardReward("QUALIFIED", "REVIEW"), true);
  assert.equal(countsTowardReward("QUALIFIED", "BLOCKED"), false);
  // Nothing else earns, however clean it looks.
  for (const s of ["CLICKED", "SIGNED_UP", "PAYMENT_PENDING", "REJECTED", "REVOKED"] as ReferralStatus[]) {
    assert.equal(countsTowardReward(s, "CLEAR"), false, s);
  }
});

test("countQualified is what the reward engine should be handed", () => {
  const n = countQualified([
    { status: "QUALIFIED", fraudStatus: "CLEAR" },
    { status: "QUALIFIED", fraudStatus: "REVIEW" },
    { status: "QUALIFIED", fraudStatus: "BLOCKED" },
    { status: "REVOKED", fraudStatus: "CLEAR" },
    { status: "PAYMENT_PENDING", fraudStatus: "CLEAR" },
  ]);
  assert.equal(n, 2);
});

test("refund revokes; chargeback revokes and flags for review", () => {
  const refund = evaluateReversal({ currentStatus: "QUALIFIED", reason: "refund" });
  assert.equal(refund.revoke, true);
  assert.equal(refund.fraudStatus, undefined);

  const chargeback = evaluateReversal({ currentStatus: "QUALIFIED", reason: "chargeback" });
  assert.equal(chargeback.revoke, true);
  assert.equal(chargeback.fraudStatus, "REVIEW");
});

test("revocation is idempotent under repeated reversal events", () => {
  const again = evaluateReversal({ currentStatus: "REVOKED", reason: "refund" });
  assert.equal(again.revoke, false);
  assert.equal(again.skipReason, "already_revoked");
});

test("an admin can restore a rejected or revoked referral", () => {
  assert.equal(canTransition("REVOKED", "QUALIFIED").allowed, true);
  assert.equal(canTransition("REJECTED", "QUALIFIED").allowed, true);
});

test("re-qualifying an already qualified referral is refused by the state machine", () => {
  const move = canTransition("QUALIFIED", "QUALIFIED");
  assert.equal(move.allowed, false);
  // Distinct from an illegal move, so idempotent callers can treat it as success.
  assert.equal((move as { reason: string }).reason, "already_in_state");
});

test("the funnel cannot be walked backwards", () => {
  assert.equal(canTransition("QUALIFIED", "SIGNED_UP").allowed, false);
  assert.equal(canTransition("PAYMENT_PENDING", "CLICKED").allowed, false);
  assert.equal(canTransition("SIGNED_UP", "CLICKED").allowed, false);
});
