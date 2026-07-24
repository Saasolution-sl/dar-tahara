import test from "node:test";
import assert from "node:assert/strict";
import type { Locale } from "@/i18n/config";
import { knowledgeArticles } from "./knowledge";
import { localizeRetrievedKnowledge } from "./knowledge-localizations";

const translatedLocales: Locale[] = ["nl", "fr", "es", "de", "pt", "ar"];

test("every core knowledge article has a deterministic translation in every non-English locale", () => {
  for (const locale of translatedLocales) {
    for (const article of knowledgeArticles) {
      const [localized] = localizeRetrievedKnowledge([{ article, score: 1, matchedKeywords: [] }], locale);
      assert.equal(localized.article.language, locale, `${locale}:${article.id}`);
      assert.notEqual(localized.article.title, article.title, `${locale}:${article.id}:title`);
      assert.notEqual(localized.article.content, article.content, `${locale}:${article.id}:content`);
    }
  }
});

test("Supabase English rows use their slug to find the deterministic translation", () => {
  const canonical = knowledgeArticles.find((article) => article.id === "included-services");
  assert.ok(canonical);
  const [localized] = localizeRetrievedKnowledge([{
    article: {
      ...canonical,
      id: "00000000-0000-0000-0000-000000000001",
      language: "en",
      source: "Supabase knowledge_entries:included-services",
    },
    score: 1,
    matchedKeywords: [],
  }], "fr");
  assert.equal(localized.article.language, "fr");
  assert.match(localized.article.content, /nettoyage/i);
});

test("company overview uses the corrected focus cities in every language", () => {
  const canonical = knowledgeArticles.find((article) => article.id === "company-overview");
  assert.ok(canonical);
  assert.match(canonical.content, /Tetouan, Tangier, Meknes, and Casablanca/);
  assert.doesNotMatch(canonical.content, /Rabat|Marrakech/);

  const expectedCities: Record<Locale, RegExp> = {
    en: /Tetouan.*Tangier.*Meknes.*Casablanca/i,
    nl: /Tetouan.*Tanger.*Meknes.*Casablanca/i,
    fr: /Tétouan.*Tanger.*Meknès.*Casablanca/i,
    es: /Tetuán.*Tánger.*Mequinez.*Casablanca/i,
    de: /Tétouan.*Tanger.*Meknès.*Casablanca/i,
    pt: /Tetuão.*Tânger.*Meknès.*Casablanca/i,
    ar: /تطوان.*طنجة.*مكناس.*الدار البيضاء/u,
  };
  for (const locale of translatedLocales) {
    const [localized] = localizeRetrievedKnowledge([{ article: canonical, score: 1, matchedKeywords: [] }], locale);
    assert.match(localized.article.content, expectedCities[locale], locale);
  }
});
