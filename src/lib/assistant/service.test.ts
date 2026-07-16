import test from "node:test";
import assert from "node:assert/strict";
import { answerAssistant } from "./service";
import { classifyIntent, retrieveKnowledge } from "./retrieval";

test("assistant retrieves approved knowledge for Initial Home Assessment", () => {
  const results = retrieveKnowledge("How does the first visit assessment work?", "en");
  assert.equal(results[0].article.id, "initial-home-assessment");
});

test("assistant answers assessment questions from grounded knowledge", async () => {
  const reply = await answerAssistant({
    channel: "website",
    locale: "en",
    message: "How does the Initial Home Assessment work?",
  });
  assert.equal(reply.intent, "assessment_explanation");
  assert.match(reply.answer, /prepaid onboarding visit|Initial Home Assessment/i);
  assert.ok(reply.sources.some((source) => source.id === "initial-home-assessment"));
});

test("assistant pricing uses shared pricing tool instead of prompt-only numbers", async () => {
  const reply = await answerAssistant({
    channel: "website",
    locale: "en",
    message: "Can you calculate the price for 75 m2 bi-weekly?",
  });
  assert.equal(reply.intent, "pricing");
  assert.match(reply.answer, /€153|153/);
  assert.ok(reply.toolCalls.some((call) => call.name === "calculate_price" && call.status === "success"));
});

test("assistant escalates refund disputes to a specialist", async () => {
  assert.equal(classifyIntent("I dispute this charge and want a refund"), "cancellation");
  const reply = await answerAssistant({
    channel: "website",
    locale: "en",
    message: "I dispute this charge and want a refund immediately",
  });
  assert.equal(reply.handoffRequired, true);
  assert.equal(reply.handoffReason, "sensitive_or_disputed_issue");
  assert.match(reply.answer, /specialist/i);
});

test("assistant does not expose personal booking details without verification", async () => {
  const reply = await answerAssistant({
    channel: "website",
    locale: "en",
    message: "What is the status of my booking DTH-2607-10001?",
  });
  assert.equal(reply.handoffRequired, true);
  assert.match(reply.answer, /specialist|verified|verification/i);
});

test("assistant responds to short greetings in the detected language", async () => {
  const cases = [
    ["nl", "Goedemorgen", /Goedendag|Waarmee/],
    ["fr", "Bonjour", /Bonjour|aider/],
    ["es", "Hola", /Hola|ayudarte/],
    ["de", "Hallo", /Guten Tag|helfen/],
    ["pt", "Oi", /Olá|ajudar/],
    ["ar", "السلام عليكم", /مرحب|مساعد/],
    ["en", "Hello", /Hello|help/],
  ] as const;
  for (const [locale, message, expected] of cases) {
    const reply = await answerAssistant({ channel: "website", locale: "en", message });
    assert.equal(reply.locale, locale);
    assert.equal(reply.languageConfirmed, true);
    assert.match(reply.answer, expected);
  }
});

test("assistant keeps and explicitly changes the conversation language", async () => {
  const retained = await answerAssistant({
    channel: "website",
    locale: "en",
    sessionLanguage: "nl",
    message: "Thanks, I have another question.",
  });
  assert.equal(retained.locale, "nl");
  assert.equal(retained.languageChanged, false);

  const changed = await answerAssistant({
    channel: "website",
    locale: "fr",
    sessionLanguage: "fr",
    message: "Can we continue in English?",
  });
  assert.equal(changed.locale, "en");
  assert.equal(changed.languageChanged, true);
  assert.match(changed.answer, /continue in English/);

  const changedToSpanish = await answerAssistant({
    channel: "website",
    locale: "en",
    sessionLanguage: "en",
    message: "¿Podemos hablar en Español?",
  });
  assert.equal(changedToSpanish.locale, "es");
  assert.equal(changedToSpanish.intent, "language_change");
  assert.equal(changedToSpanish.languageChanged, true);
  assert.match(changedToSpanish.answer, /continuar en español/i);
});

test("assistant answers in the language actively selected in the website UI", async () => {
  const reply = await answerAssistant({
    channel: "website",
    locale: "es",
    sessionLanguage: "nl",
    selectedLanguage: "es",
    message: "Hello",
  });
  assert.equal(reply.locale, "es");
  assert.equal(reply.languageChanged, true);
  assert.match(reply.answer, /Hola|ayudarte/);
});

test("assistant answers normal knowledge questions in every supported non-English language", async () => {
  const cases = [
    { locale: "nl", message: "Wat is inbegrepen in de schoonmaakservice?", source: "included-services", answer: /schoonmaak|inbegrepen/i },
    { locale: "fr", message: "Comment fonctionne la première visite ?", source: "initial-home-assessment", answer: /visite|évaluation/i },
    { locale: "es", message: "¿Qué servicios están incluidos?", source: "included-services", answer: /servicios|limpieza/i },
    { locale: "de", message: "Wie funktioniert die erste Bewertung?", source: "initial-home-assessment", answer: /Ersteinschätzung|Besuch/i },
    { locale: "pt", message: "Como funciona a primeira avaliação?", source: "initial-home-assessment", answer: /Avaliação|visita/i },
    { locale: "ar", message: "ما هي الخدمات المشمولة؟", source: "included-services", answer: /الخدمات|التنظيف/u },
  ] as const;

  for (const expected of cases) {
    const reply = await answerAssistant({ channel: "website", locale: "en", message: expected.message });
    assert.equal(reply.locale, expected.locale, expected.message);
    assert.equal(reply.handoffRequired, false, expected.message);
    assert.ok(reply.sources.some((source) => source.id === expected.source), expected.message);
    assert.match(reply.answer, expected.answer, expected.message);
    assert.doesNotMatch(reply.answer, /onjuiste informatie|information incorrecte|información incorrecta|falsche Auskunft|informação incorreta|معلومة غير دقيقة/iu);
  }
});

test("multilingual retrieval selects the factual article instead of human handoff guidance", () => {
  const cases = [
    ["Quels services sont inclus dans le nettoyage ?", "fr", "included-services"],
    ["¿Cómo puedo pagar con tarjeta?", "es", "payments-stripe"],
    ["Muss ich während der Reinigung zu Hause sein?", "de", "access-presence-keys"],
    ["Qual é o desconto anual?", "pt", "billing-monthly-annual"],
    ["كم هو سعر التنظيف؟", "ar", "pricing-rules"],
  ] as const;
  for (const [message, locale, source] of cases) {
    const results = retrieveKnowledge(message, locale);
    assert.equal(results[0]?.article.id, source, message);
    assert.notEqual(results[0]?.article.id, "human-handoff", message);
  }
});

test("assistant asks for language selection instead of defaulting to English", async () => {
  const reply = await answerAssistant({ channel: "website", locale: "en", message: "DTH-2607-10001 12345" });
  assert.equal(reply.languageConfirmed, false);
  assert.match(reply.answer, /Which language|In welke taal|بأي لغة/);
});
