import type { Locale } from "@/i18n/config";
import { knowledgeArticles } from "./knowledge";
import type { AssistantIntent, RetrievedKnowledge } from "./types";

const STOP_WORDS = new Set([
  "the", "and", "for", "you", "your", "with", "that", "this", "are", "can",
  "how", "what", "when", "waar", "wat", "hoe", "pour", "avec", "que", "una",
  "und", "der", "die", "das", "uma", "com", "هل", "ما", "في",
]);

const INTENT_KEYWORDS: Record<AssistantIntent, string[]> = {
  general_faq: ["question", "help", "info", "about"],
  service_explanation: ["included", "service", "cleaning", "linen", "laundry", "products", "materials", "pets"],
  assessment_explanation: ["assessment", "first visit", "initial", "deep clean", "revised quote"],
  pricing: ["price", "cost", "estimate", "m2", "square", "calculator", "how much", "quote"],
  billing: ["monthly", "annual", "yearly", "discount", "5%", "subscription"],
  payment: ["payment", "stripe", "checkout", "card", "pay", "failed"],
  booking_guidance: ["book", "booking", "appointment", "date", "schedule"],
  booking_status: ["status", "reference", "confirmed"],
  reschedule: ["reschedule", "change date", "postpone", "move appointment"],
  cancellation: ["cancel", "stop", "pause", "refund"],
  complaint: ["complaint", "damage", "unsafe", "misconduct", "angry", "legal"],
  human_handoff: ["human", "specialist", "person", "agent", "staff"],
  language_change: ["language", "english", "dutch", "français", "arabic", "spanish", "german", "portuguese"],
  privacy: ["privacy", "data", "delete", "export", "personal"],
  opt_out: ["unsubscribe", "opt out", "stop messaging", "marketing"],
  unknown: [],
};

function normalize(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}%]+/gu, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export function classifyIntent(message: string): AssistantIntent {
  const n = normalize(message);
  if (/\bdth\b|booking reference|reservation reference/.test(n) || (n.includes("booking") && n.includes("status"))) {
    return "booking_status";
  }
  let best: { intent: AssistantIntent; score: number } = { intent: "unknown", score: 0 };
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as Array<[AssistantIntent, string[]]>) {
    const score = keywords.reduce((total, keyword) => total + (n.includes(normalize(keyword)) ? keyword.length : 0), 0);
    if (score > best.score) best = { intent, score };
  }
  return best.score > 0 ? best.intent : "unknown";
}

export function retrieveKnowledge(message: string, locale: Locale, limit = 4): RetrievedKnowledge[] {
  const words = tokens(message);
  const normalizedMessage = normalize(message);

  return knowledgeArticles
    .filter((article) => article.status === "approved" && article.visibility === "public")
    .map((article) => {
      const haystack = normalize([
        article.title,
        article.summary,
        article.content,
        article.category,
        article.keywords.join(" "),
        article.relatedQuestions.join(" "),
      ].join(" "));
      const matchedKeywords = article.keywords.filter((keyword) => normalizedMessage.includes(normalize(keyword)));
      const tokenScore = words.reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
      const keywordScore = matchedKeywords.reduce((score, keyword) => score + keyword.length / 4, 0);
      const languageBoost = article.language === locale ? 2 : article.language === "all" ? 1 : 0;
      return { article, score: tokenScore + keywordScore + languageBoost, matchedKeywords };
    })
    .filter((result) => result.score > 1)
    .sort((a, b) => b.score - a.score || b.article.version - a.article.version)
    .slice(0, limit);
}

export function fallbackSources(locale: Locale): RetrievedKnowledge[] {
  return retrieveKnowledge("human support Dar Tahara specialist", locale, 2);
}
