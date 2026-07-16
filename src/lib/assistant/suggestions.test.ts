import test from "node:test";
import assert from "node:assert/strict";
import type { HandoffEvaluation } from "./handoff";
import {
  advanceSuggestionState,
  deriveMissingInformation,
  EMPTY_SUGGESTION_STATE,
  generateConversationSuggestions,
} from "./suggestions";

const answerEvaluation: HandoffEvaluation = { required: false, reason: null, confidence: 0.96, nextAction: "answer", topic: null };

test("weekly pricing generates property-size replies and changes after selection", () => {
  const history: Array<{ role: "user" | "assistant"; content: string }> = [];
  const missing = deriveMissingInformation({ conversationHistory: history, latestUserMessage: "How much does weekly cleaning cost?", detectedIntent: "pricing", evaluation: answerEvaluation });
  const first = generateConversationSuggestions({
    conversationHistory: history,
    latestUserMessage: "How much does weekly cleaning cost?",
    latestAssistantResponse: "How large is the property?",
    detectedIntent: "pricing",
    missingInformation: missing,
    conversationLanguage: "en",
    availableActions: ["ask"],
    state: EMPTY_SUGGESTION_STATE,
    evaluation: answerEvaluation,
  });
  assert.deepEqual(first.map((item) => item.id), ["size-0-50", "size-51-75", "size-76-100", "size-over-100"]);
  const state = advanceSuggestionState({
    state: EMPTY_SUGGESTION_STATE,
    selectedSuggestionId: "size-76-100",
    suggestions: first,
    evaluation: answerEvaluation,
    latestUserMessage: "My property is between 76 and 100 m²",
  });
  const next = generateConversationSuggestions({
    conversationHistory: [{ role: "user", content: "How much does weekly cleaning cost?" }],
    latestUserMessage: "My property is between 76 and 100 m²",
    latestAssistantResponse: "Thank you.",
    detectedIntent: "pricing",
    missingInformation: [],
    conversationLanguage: "en",
    availableActions: ["ask"],
    state,
    evaluation: answerEvaluation,
  });
  assert.ok(next.every((item) => !item.id.startsWith("size-")));
  assert.ok(next.some((item) => item.id === "next-included"));
  assert.ok(next.every((item) => item.id !== "size-76-100"));
});

test("French suggestions stay French and selected suggestions are not repeated", () => {
  const evaluation: HandoffEvaluation = { required: false, reason: null, confidence: 0.94, nextAction: "ask_clarifying_question", topic: "service_issue" };
  const suggestions = generateConversationSuggestions({
    conversationHistory: [], latestUserMessage: "Le nettoyage n’était pas bon.", latestAssistantResponse: "Que s’est-il passé ?",
    detectedIntent: "complaint", missingInformation: ["issue_category"], conversationLanguage: "fr", availableActions: ["ask"],
    state: { ...EMPTY_SUGGESTION_STATE, selectedSuggestionIds: ["issue-damage"] }, evaluation,
  });
  assert.ok(suggestions.length >= 3);
  assert.ok(suggestions.every((item) => !/Something|another issue|team did not/i.test(item.label)));
  assert.ok(suggestions.every((item) => item.id !== "issue-damage"));
});
