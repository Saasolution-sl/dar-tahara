import test from "node:test";
import assert from "node:assert/strict";
import {
  LANGUAGE_CONFIDENCE_THRESHOLD,
  detectLanguage,
  resolveConversationLanguage,
  responseMatchesConversationLanguage,
} from "./language";
import type { Locale } from "@/i18n/config";

const LONG_MESSAGES: Array<[Locale, string]> = [
  ["en", "Hello, I would like a quote for my home, please."],
  ["nl", "Goedemiddag, ik wil graag een offerte voor mijn woning."],
  ["fr", "Bonjour, je voudrais un devis pour ma maison."],
  ["es", "Hola, quisiera un presupuesto para mi casa."],
  ["de", "Guten Tag, ich hätte gerne ein Angebot für mein Haus."],
  ["pt", "Olá, gostaria de pedir um orçamento para a minha casa."],
  ["ar", "السلام عليكم، أريد الحصول على عرض سعر لمنزلي."],
];

test("detects every supported language above the confidence threshold", () => {
  for (const [locale, message] of LONG_MESSAGES) {
    const result = detectLanguage(message);
    assert.equal(result.locale, locale, message);
    assert.ok(result.confidence > LANGUAGE_CONFIDENCE_THRESHOLD, `${message}: ${result.confidence}`);
  }
});

test("distinguishes common Spanish and Portuguese service questions", () => {
  const spanish = detectLanguage("¿Qué servicios están incluidos en la limpieza?");
  const portuguese = detectLanguage("Quais serviços estão incluídos na limpeza?");
  assert.equal(spanish.locale, "es");
  assert.ok(spanish.confidence > LANGUAGE_CONFIDENCE_THRESHOLD);
  assert.equal(portuguese.locale, "pt");
  assert.ok(portuguese.confidence > LANGUAGE_CONFIDENCE_THRESHOLD);
});

test("detects very short greetings without guessing through the statistical model", () => {
  const greetings: Array<[Locale, string]> = [
    ["en", "Hello"],
    ["nl", "Goedemorgen"],
    ["fr", "Bonjour"],
    ["es", "Hola"],
    ["de", "Hallo"],
    ["pt", "Oi"],
    ["ar", "السلام عليكم"],
  ];
  for (const [locale, message] of greetings) {
    assert.deepEqual(detectLanguage(message), { locale, confidence: 0.99, source: locale === "ar" ? "short-signal" : "short-signal" });
  }
});

test("ordinary short questions are answered in the language they were asked in", () => {
  const questions: Array<[Locale, string]> = [
    ["en", "How often do you clean?"],
    ["nl", "Hoe vaak komen jullie schoonmaken?"],
    ["fr", "À quelle fréquence faites-vous le ménage ?"],
    ["es", "¿Con qué frecuencia limpian?"],
    ["de", "Wie oft reinigen Sie?"],
    ["pt", "Com que frequência vocês limpam?"],
    ["ar", "كم مرة تقومون بالتنظيف؟"],
    ["en", "What time does the cleaner arrive?"],
    ["en", "Do you clean apartments in Rabat?"],
  ];
  for (const [locale, message] of questions) {
    const decision = resolveConversationLanguage({ message, fallbackLanguage: locale });
    assert.equal(decision.locale, locale, message);
    assert.equal(decision.needsClarification, false, message);
  }
});

test("a written message the lexicon cannot place keeps the language the customer is reading", () => {
  const decision = resolveConversationLanguage({ message: "Agdal, Rabat, third floor.", fallbackLanguage: "nl" });
  assert.equal(decision.locale, "nl");
  assert.equal(decision.needsClarification, false);
  assert.equal(decision.languageChanged, false);
});

test("a message with no words still asks which language to use", () => {
  const decision = resolveConversationLanguage({ message: "DTH-2607-10001 12345", fallbackLanguage: "en" });
  assert.equal(decision.locale, null);
  assert.equal(decision.needsClarification, true);
});

test("uses the latest confidently detected customer language and keeps mixed messages stable", () => {
  const ordinary = resolveConversationLanguage({ message: "Thanks, my booking is DTH-2607-10001.", currentLanguage: "nl" });
  assert.equal(ordinary.locale, "en");
  assert.equal(ordinary.languageChanged, true);

  const mixed = resolveConversationLanguage({ message: "Hola, I have una question about my booking.", currentLanguage: "es" });
  assert.equal(mixed.locale, "en");
  assert.equal(mixed.languageChanged, true);
});

test("recognizes explicit customer language requests", () => {
  const english = resolveConversationLanguage({ message: "Can we continue in English?", currentLanguage: "fr" });
  assert.equal(english.locale, "en");
  assert.equal(english.explicitChange, true);
  assert.equal(english.languageChanged, true);

  const spanish = resolveConversationLanguage({ message: "Podemos hablar en Español?", currentLanguage: "en" });
  assert.equal(spanish.locale, "es");
  assert.equal(spanish.explicitChange, true);
  assert.equal(spanish.languageChanged, true);
});

test("an actively selected UI language overrides the persisted conversation language", () => {
  const result = resolveConversationLanguage({
    message: "Hello",
    currentLanguage: "nl",
    selectedLanguage: "es",
  });
  assert.equal(result.locale, "es");
  assert.equal(result.explicitChange, true);
  assert.equal(result.languageChanged, true);
});

test("asks for language selection when confidence is low", () => {
  const result = resolveConversationLanguage({ message: "DTH-2607-10001 12345" });
  assert.equal(result.locale, null);
  assert.equal(result.needsClarification, true);
  assert.ok(result.confidence <= LANGUAGE_CONFIDENCE_THRESHOLD);
});

test("accepts a bare language name after asking for clarification", () => {
  const result = resolveConversationLanguage({ message: "Français", selectionPending: true });
  assert.equal(result.locale, "fr");
  assert.equal(result.explicitChange, true);
  assert.equal(result.needsClarification, false);
});

test("recognizes an English human-support request without misclassifying it as Spanish", () => {
  const result = detectLanguage("I want to speak to a person about my cleaning.");
  assert.equal(result.locale, "en");
  assert.ok(result.confidence > LANGUAGE_CONFIDENCE_THRESHOLD);
});

test("rejects a confident provider response in the wrong language", () => {
  assert.equal(responseMatchesConversationLanguage("Sure! Can you provide your address?", "fr"), false);
  assert.equal(responseMatchesConversationLanguage("Bien sûr ! Pouvez-vous me donner votre adresse ?", "fr"), true);
});
