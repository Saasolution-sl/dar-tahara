import "server-only";

import type { Locale } from "@/i18n/config";
import { isServiceRoleConfigured, serviceRpc } from "@/lib/supabase-rpc";
import { generateEmbedding, vectorLiteral } from "./embeddings";
import type { RetrievedKnowledge } from "./types";

export type WebsiteRetrievalRecord = {
  embedding_id: string;
  source_id: string;
  version_id: string;
  canonical_url: string;
  title: string;
  page_type: string;
  language: Locale;
  content: string;
  content_hash: string;
  similarity: number;
};

const CATEGORY_BY_PAGE: Record<string, RetrievedKnowledge["article"]["category"]> = {
  services: "services",
  pricing: "pricing",
  faq: "support",
  terms: "policies",
  privacy: "policies",
  early_access: "company",
  about: "company",
  home: "company",
  blog: "company",
};

export function hasHighConfidenceKnowledge(entries: RetrievedKnowledge[]): boolean {
  if (!entries.length) return false;
  const threshold = Number(process.env.ASSISTANT_KNOWLEDGE_HIGH_CONFIDENCE_SCORE || 5);
  return entries[0].score >= threshold;
}

export async function retrieveOfficialWebsite(
  queries: string[],
  locale: Locale,
  limit = 5,
): Promise<{ entries: RetrievedKnowledge[]; records: WebsiteRetrievalRecord[] }> {
  if (!isServiceRoleConfigured()) return { entries: [], records: [] };
  const query = queries.join(" ").replace(/\s+/g, " ").trim().slice(0, 500);
  if (!query) return { entries: [], records: [] };
  const embedding = await generateEmbedding(query);
  const records = await serviceRpc<WebsiteRetrievalRecord[]>("search_website_content", {
    p_query_text: query,
    p_query_embedding: vectorLiteral(embedding?.vector),
    p_language: locale,
    p_match_count: Math.min(10, Math.max(1, limit)),
  }).catch(() => []);
  const minimum = Number(process.env.ASSISTANT_WEBSITE_MATCH_THRESHOLD || 0.18);
  const filtered = records.filter((record) => Number(record.similarity) >= minimum);
  return {
    records: filtered,
    entries: filtered.map((record) => ({
      article: {
        id: record.embedding_id,
        title: record.title,
        category: CATEGORY_BY_PAGE[record.page_type] || "support",
        language: record.language,
        status: "approved",
        version: 1,
        effectiveDate: new Date().toISOString(),
        lastReviewedDate: new Date().toISOString(),
        source: `Official website:${record.canonical_url}`,
        visibility: "public",
        keywords: [],
        relatedQuestions: [],
        summary: record.content.slice(0, 240),
        content: record.content,
      },
      score: Math.max(2, Number(record.similarity) * 10),
      matchedKeywords: [],
    })),
  };
}
