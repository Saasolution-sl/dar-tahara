import test from "node:test";
import assert from "node:assert/strict";
import { buildHandoffSummary, evaluateHumanHandoff } from "./handoff";
import { EMPTY_SUGGESTION_STATE } from "./suggestions";

const base = { retrieved: [], state: EMPTY_SUGGESTION_STATE };

test("unclear cleaning feedback is clarified before escalation", () => {
  const result = evaluateHumanHandoff({ ...base, message: "The cleaning was not good.", intent: "service_explanation" });
  assert.equal(result.required, false);
  assert.equal(result.nextAction, "ask_clarifying_question");
  assert.equal(result.topic, "service_issue");
});

test("manual payment investigation and explicit human requests allow handoff", () => {
  const payment = evaluateHumanHandoff({ ...base, message: "My card was charged twice.", intent: "payment" });
  assert.equal(payment.required, true);
  assert.equal(payment.reason, "payment_investigation");
  const human = evaluateHumanHandoff({ ...base, message: "I want to speak to a person.", intent: "human_handoff" });
  assert.equal(human.required, true);
  assert.equal(human.reason, "customer_explicitly_requests_human");
});

test("ordinary questions containing the word support do not trigger human handoff", () => {
  const result = evaluateHumanHandoff({
    ...base,
    message: "How does your laundry support work?",
    intent: "service_explanation",
  });
  assert.equal(result.required, false);
  assert.equal(result.nextAction, "answer");
});

test("technical bugs get troubleshooting before handoff", () => {
  const first = evaluateHumanHandoff({ ...base, message: "The booking page crashes after payment.", intent: "booking_guidance" });
  assert.equal(first.required, false);
  assert.equal(first.topic, "technical_bug");
  const unresolved = evaluateHumanHandoff({
    ...base,
    message: "It still crashes with the same error.",
    intent: "booking_guidance",
    state: { ...EMPTY_SUGGESTION_STATE, unresolvedTopics: ["technical_bug"], clarificationAttempts: { technical_bug: 2 } },
  });
  assert.equal(unresolved.required, true);
  assert.equal(unresolved.reason, "technical_bug");
});

test("handoff summary preserves useful references and completed troubleshooting", () => {
  const summary = buildHandoffSummary({
    locale: "en",
    intent: "payment",
    reason: "payment_investigation",
    message: "It still fails. Booking DTH-2607-10001. I want a refund.",
    history: [{ role: "user", content: "I refreshed and tried an incognito private window." }],
  });
  assert.equal(summary.bookingReference, "DTH-2607-10001");
  assert.equal(summary.customerRequestedOutcome, "refund");
  assert.deepEqual(summary.troubleshootingCompleted.sort(), ["page_refresh", "private_window"]);
});
