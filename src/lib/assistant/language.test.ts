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

test("keeps the selected language for ordinary and mixed-language messages", () => {
  const ordinary = resolveConversationLanguage({ message: "Thanks, my booking is DTH-2607-10001.", currentLanguage: "nl" });
  assert.equal(ordinary.locale, "nl");
  assert.equal(ordinary.languageChanged, false);

  const mixed = resolveConversationLanguage({ message: "Hola, I have una question about my booking.", currentLanguage: "es" });
  assert.equal(mixed.locale, "es");
  assert.equal(mixed.languageChanged, false);
});

test("changes language only after an explicit customer request", () => {
  const english = resolveConversationLanguage({ message: "Can we continue in English?", currentLanguage: "fr" });
  assert.equal(english.locale, "en");
  assert.equal(english.explicitChange, true);
  assert.equal(english.languageChanged, true);

  const spanish = resolveConversationLanguage({ message: "Podemos hablar en Español?", currentLanguage: "en" });
  assert.equal(spanish.locale, "es");
  assert.equal(spanish.explicitChange, true);
  assert.equal(spanish.languageChanged, true);
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

test("rejects a confident provider response in the wrong language", () => {
  assert.equal(responseMatchesConversationLanguage("Sure! Can you provide your address?", "fr"), false);
  assert.equal(responseMatchesConversationLanguage("Bien sûr ! Pouvez-vous me donner votre adresse ?", "fr"), true);
});
