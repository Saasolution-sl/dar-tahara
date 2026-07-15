import { test } from "node:test";
import assert from "node:assert/strict";
import { computeLeadScore, deriveStage, SCORE_RULES } from "./scoring";
import type { LeadForSync } from "./types";

const base: LeadForSync = {
  id: "1", normalizedEmail: "a@b.co", email: "a@b.co", firstName: "A", lastName: "B",
};

test("empty lead scores zero", () => {
  const { score, breakdown } = computeLeadScore(base);
  assert.equal(score, 0);
  assert.equal(breakdown.length, 0);
});

test("verified + valid whatsapp + launch city + weekly stacks correctly", () => {
  const { score, breakdown } = computeLeadScore({
    ...base,
    emailVerified: true,
    whatsappPhone: "+212612345678",
    cleaningCity: "Tangier",
    desiredFrequency: "weekly",
  });
  // 20 (verified) + 10 (whatsapp) + 10 (address) + 15 (launch city) + 15 (weekly)
  assert.equal(score, 70);
  const rules = breakdown.map((b) => b.rule);
  assert.ok(rules.includes("emailVerified"));
  assert.ok(rules.includes("propertyInLaunchCity"));
  assert.ok(rules.includes("frequencyWeekly"));
});

test("non-launch city gets address points but not launch-city points", () => {
  const { breakdown } = computeLeadScore({ ...base, cleaningCity: "Agadir" });
  const rules = breakdown.map((b) => b.rule);
  assert.ok(rules.includes("propertyAddressCompleted"));
  assert.ok(!rules.includes("propertyInLaunchCity"));
});

test("frequency is mutually exclusive (only one bucket)", () => {
  const weekly = computeLeadScore({ ...base, desiredFrequency: "weekly" }).score;
  const monthly = computeLeadScore({ ...base, desiredFrequency: "monthly" }).score;
  assert.equal(weekly, SCORE_RULES.frequencyWeekly);
  assert.equal(monthly, SCORE_RULES.frequencyMonthly);
});

test("invalid whatsapp number scores no whatsapp points", () => {
  const { breakdown } = computeLeadScore({ ...base, whatsappPhone: "0612345678" });
  assert.ok(!breakdown.some((b) => b.rule === "validWhatsapp"));
});

test("multiple services awarded only for >1 service", () => {
  assert.equal(computeLeadScore({ ...base, desiredServices: ["a"] }).score, 0);
  assert.equal(computeLeadScore({ ...base, desiredServices: ["a", "b"] }).score, SCORE_RULES.multipleServices);
});

test("verified referrals are capped", () => {
  const { breakdown } = computeLeadScore({ ...base, verifiedReferralCount: 100 });
  const ref = breakdown.find((b) => b.rule === "perVerifiedReferral");
  assert.equal(ref?.points, SCORE_RULES.verifiedReferralCap);
});

test("start within one month + digital lock + referral signup", () => {
  const { score } = computeLeadScore({
    ...base,
    expectedStartPeriod: "within_1_month",
    hasDigitalLock: true,
    referredByCode: "ABCD1234",
  });
  assert.equal(score, SCORE_RULES.startWithinOneMonth + SCORE_RULES.digitalLock + SCORE_RULES.referralSignup);
});

test("deriveStage: unverified → submitted", () => {
  assert.equal(deriveStage(base, 0), "early_access_submitted");
});

test("deriveStage: verified outside launch city → waitlist", () => {
  assert.equal(deriveStage({ ...base, emailVerified: true, cleaningCity: "Agadir" }, 30), "service_area_waitlist");
});

test("deriveStage: verified + launch city + high score → MQL", () => {
  assert.equal(
    deriveStage({ ...base, emailVerified: true, cleaningCity: "Rabat" }, 60),
    "marketing_qualified_lead",
  );
});
