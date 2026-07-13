import { test } from "node:test";
import assert from "node:assert/strict";
import { answerWhatsAppQuestion, detectWhatsAppLocale } from "./whatsapp";

test("WhatsApp assistant detects supported languages", () => {
  assert.equal(detectWhatsAppLocale("Combien coûte l'abonnement ?"), "fr");
  assert.equal(detectWhatsAppLocale("كم تستغرق الزيارة الأولى؟"), "ar");
  assert.equal(detectWhatsAppLocale("Can I change frequency?"), "en");
});

test("WhatsApp assistant answers before escalating", () => {
  const answer = answerWhatsAppQuestion("What happens during the Home Assessment?");
  assert.equal(answer.intent, "assessment");
  assert.match(answer.answer, /premium onboarding/i);
  const fallback = answerWhatsAppQuestion("Tell me something unexpected");
  assert.equal(fallback.intent, "fallback");
  assert.match(fallback.answer, /specialist/i);
});
