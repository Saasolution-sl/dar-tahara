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

test("WhatsApp uses the portal cancellation and rescheduling policy in every language", () => {
  const cases = [
    ["en", "I want to cancel my subscription"],
    ["nl", "Ik wil mijn abonnement opzeggen"],
    ["fr", "Je veux annuler mon abonnement"],
    ["es", "Quiero cancelar mi suscripción"],
    ["de", "Ich möchte mein Abonnement kündigen"],
    ["pt", "Quero cancelar a subscrição"],
    ["ar", "أريد إلغاء الاشتراك"],
  ] as const;
  for (const [locale, message] of cases) {
    const answer = answerWhatsAppQuestion(message, locale);
    assert.equal(answer.intent, "cancel", locale);
    assert.match(answer.answer, /48|٤٨/, locale);
    assert.match(answer.answer, /portal|portaal|portail|بوابة/iu, locale);
  }

  const reschedule = answerWhatsAppQuestion("Please reschedule my cleaning", "en");
  assert.equal(reschedule.intent, "reschedule");
  assert.match(reschedule.answer, /twice per calendar year/i);
});

test("WhatsApp lists the corrected focus cities in every language", () => {
  const cases = [
    ["en", "Which cities do you serve?", /Tetouan.*Tangier.*Meknes.*Casablanca/i],
    ["nl", "Welke steden bedienen jullie?", /Tetouan.*Tanger.*Meknes.*Casablanca/i],
    ["fr", "Quelles villes desservez-vous ?", /Tétouan.*Tanger.*Meknès.*Casablanca/i],
    ["es", "¿En qué ciudades ofrecen servicio?", /Tetuán.*Tánger.*Mequinez.*Casablanca/i],
    ["de", "Welche Städte gehören zum Servicegebiet?", /Tétouan.*Tanger.*Meknès.*Casablanca/i],
    ["pt", "Em que cidades prestam serviço?", /Tetuão.*Tânger.*Meknès.*Casablanca/i],
    ["ar", "ما المدن التي تخدمونها؟", /تطوان.*طنجة.*مكناس.*الدار البيضاء/u],
  ] as const;
  for (const [locale, message, cities] of cases) {
    const answer = answerWhatsAppQuestion(message, locale);
    assert.equal(answer.intent, "cities", locale);
    assert.match(answer.answer, cities, locale);
  }
});
