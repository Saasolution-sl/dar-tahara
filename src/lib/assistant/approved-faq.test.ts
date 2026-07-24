import test from "node:test";
import assert from "node:assert/strict";
import { locales } from "@/i18n/config";
import { APPROVED_FAQ_COPY, approvedFaqAnswer, approvedFaqKey } from "./approved-faq";

test("approved FAQ questions map to the intended concise answer", () => {
  const cases = [
    ["How does the first visit work?", "first_visit"],
    ["Is the first cleaning prepaid?", "first_cleaning_prepaid"],
    ["How do digital locks work?", "digital_locks"],
    ["Can you hold a physical key?", "physical_key"],
    ["Do I need to be home?", "presence"],
    ["Where are you located?", "location"],
    ["What cleaning products do you use?", "cleaning_products"],
    ["How are visits scheduled?", "visit_scheduling"],
  ] as const;
  for (const [message, key] of cases) {
    assert.equal(approvedFaqKey({ message }), key, message);
    const answer = approvedFaqAnswer({ message, locale: "en" });
    assert.equal(answer, APPROVED_FAQ_COPY.en[key]);
    assert.ok((answer?.length || 0) < 900, message);
  }
});

test("approved FAQ suggestion buttons have answers in every language", () => {
  const suggestionIds = [
    "general-assessment",
    "next-first-clean",
    "access-digital-lock",
    "access-physical-key",
    "access-home",
    "access-schedule",
  ];
  for (const locale of locales) {
    for (const selectedSuggestionId of suggestionIds) {
      const answer = approvedFaqAnswer({ message: "", locale, selectedSuggestionId });
      assert.ok(answer && answer.length > 80, `${locale}:${selectedSuggestionId}`);
      assert.ok(answer.length < 900, `${locale}:${selectedSuggestionId}`);
    }
  }
});
