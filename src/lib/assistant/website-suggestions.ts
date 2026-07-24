import "server-only";

import { createHash } from "node:crypto";
import type { Locale } from "@/i18n/config";
import {
  isServiceRoleConfigured,
  serviceRpc,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";
import { redactSensitiveText } from "@/lib/whatsapp/security";
import { generateEmbedding, vectorLiteral } from "./embeddings";
import type { AssistantIntent } from "./types";
import type { WebsiteRetrievalRecord } from "./website-retrieval";

export type KnowledgeSuggestionAdminRow = {
  id: string;
  question: string;
  answer: string;
  source_url: string;
  source_page: string;
  language: Locale;
  extracted_text: string;
  confidence_score: number;
  content_hash: string;
  status: "pending_review" | "approved" | "rejected";
  occurrence_count: number;
  first_found_at: string;
  last_found_at: string;
  reviewer: string | null;
  review_date: string | null;
  admin_notes: string | null;
  approved_article_id: string | null;
  metadata: Record<string, unknown>;
};

function fingerprint(value: string): string {
  const normalized = value.toLocaleLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  return createHash("sha256").update(normalized).digest("hex");
}

function categoryForIntent(intent: AssistantIntent): string {
  if (intent === "service_explanation") return "services";
  if (intent === "assessment_explanation") return "assessment";
  if (intent === "pricing") return "pricing";
  if (intent === "billing") return "billing";
  if (intent === "payment") return "payments";
  if (["cancellation", "reschedule", "privacy", "opt_out"].includes(intent)) return "policies";
  if (["booking_guidance", "booking_status"].includes(intent)) return "access";
  if (intent === "general_faq") return "company";
  return "support";
}

export async function createWebsiteKnowledgeSuggestion(input: {
  question: string;
  answer: string;
  locale: Locale;
  intent: AssistantIntent;
  confidence: number;
  source: WebsiteRetrievalRecord;
  conversationId: string;
}): Promise<string | null> {
  if (!isServiceRoleConfigured()) return null;
  const question = redactSensitiveText(input.question, 2_000);
  const answer = redactSensitiveText(input.answer, 5_000);
  const embedding = await generateEmbedding(`${question}\n${answer}`);
  return serviceRpc<string>("upsert_knowledge_suggestion", {
    p_question: question,
    p_answer: answer,
    p_source_id: input.source.source_id,
    p_source_version_id: input.source.version_id,
    p_source_url: input.source.canonical_url,
    p_source_page: input.source.title,
    p_language: input.locale,
    p_extracted_text: input.source.content.slice(0, 12_000),
    p_confidence_score: Math.max(0, Math.min(1, input.confidence)),
    p_content_hash: input.source.content_hash,
    p_question_fingerprint: fingerprint(question),
    p_suggestion_embedding: vectorLiteral(embedding?.vector),
    p_embedding_model: embedding?.model || null,
    p_metadata: {
      category: categoryForIntent(input.intent),
      intent: input.intent,
      conversation_id: input.conversationId,
      embedding_id: input.source.embedding_id,
      created_automatically: true,
      customer_content_redacted: true,
    },
  }).catch((error) => {
    console.warn(JSON.stringify({
      scope: "assistant_website_suggestions",
      event: "knowledge_suggestion_failed",
      failureCode: error instanceof Error ? error.message.split(":", 1)[0].slice(0, 160) : "unknown_error",
      conversationId: input.conversationId,
      contentLogged: false,
    }));
    return null;
  });
}

export async function loadWebsiteKnowledgeSuggestions(
  status: "pending_review" | "approved" | "rejected" | "all" = "pending_review",
): Promise<KnowledgeSuggestionAdminRow[]> {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  const filter = status === "all" ? "" : `status=eq.${status}&`;
  return serviceSelect<KnowledgeSuggestionAdminRow[]>(
    `knowledge_suggestions?${filter}select=id,question,answer,source_url,source_page,language,extracted_text,confidence_score,content_hash,status,occurrence_count,first_found_at,last_found_at,reviewer,review_date,admin_notes,approved_article_id,metadata&order=last_found_at.desc&limit=100`,
  );
}

export async function reviewWebsiteKnowledgeSuggestion(input: {
  id: string;
  action: "approve" | "reject";
  reviewerId: string;
  notes?: string;
}): Promise<void> {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  if (!/^[0-9a-f-]{36}$/i.test(input.id)) throw new Error("invalid_suggestion_id");
  if (input.action === "approve") {
    await serviceRpc("approve_knowledge_suggestion", {
      p_suggestion_id: input.id,
      p_reviewer_id: input.reviewerId,
      p_admin_notes: input.notes?.trim().slice(0, 2_000) || null,
    });
    return;
  }
  await serviceUpdate("knowledge_suggestions", `id=eq.${input.id}&status=eq.pending_review`, {
    status: "rejected",
    reviewer: input.reviewerId,
    review_date: new Date().toISOString(),
    admin_notes: input.notes?.trim().slice(0, 2_000) || null,
  });
}

export async function loadKnowledgeEngineAnalytics() {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  const [suggestions, sources, feedback, messages, articles] = await Promise.all([
    serviceSelect<Array<{ status: string }>>("knowledge_suggestions?select=status&limit=5000").catch(() => []),
    serviceSelect<Array<{ status: string; current_version_id: string | null; last_error: string | null }>>(
      "website_sources?select=status,current_version_id,last_error&limit=5000",
    ).catch(() => []),
    serviceSelect<Array<{ rating: string }>>("assistant_feedback?select=rating&limit=5000").catch(() => []),
    serviceSelect<Array<{ intent: string | null; metadata: Record<string, unknown> | null }>>(
      "assistant_messages?role=eq.assistant&select=intent,metadata&order=created_at.desc&limit=5000",
    ).catch(() => []),
    serviceSelect<Array<{ source_review_required: boolean; quality_score: number }>>(
      "knowledge_articles?status=eq.approved&select=source_review_required,quality_score&limit=5000",
    ).catch(() => []),
  ]);
  const helpful = feedback.filter((item) => ["helpful", "correct"].includes(item.rating)).length;
  const rated = feedback.length;
  const intentCounts = new Map<string, number>();
  const pageCounts = new Map<string, number>();
  const articleCounts = new Map<string, number>();
  let failedQuestions = 0;
  for (const row of messages) {
    const intent = row.intent || String(row.metadata?.intent || "unknown");
    intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
    const path = typeof row.metadata?.website_path === "string" ? row.metadata.website_path : null;
    if (path) pageCounts.set(path, (pageCounts.get(path) || 0) + 1);
    if (row.metadata?.answer_category === "missing_business_knowledge") failedQuestions += 1;
    const sources = Array.isArray(row.metadata?.sources) ? row.metadata.sources : [];
    for (const source of sources) {
      const id = source && typeof source === "object" && typeof (source as { id?: unknown }).id === "string"
        ? (source as { id: string }).id
        : null;
      if (id) articleCounts.set(id, (articleCounts.get(id) || 0) + 1);
    }
  }
  return {
    pendingSuggestions: suggestions.filter((item) => item.status === "pending_review").length,
    approvedSuggestions: suggestions.filter((item) => item.status === "approved").length,
    indexedPages: sources.filter((item) => item.status === "active" && item.current_version_id).length,
    failedPages: sources.filter((item) => item.status === "error" || item.last_error).length,
    feedbackScore: rated ? Math.round((helpful / rated) * 1000) / 10 : null,
    knowledgeCoverage: articles.length
      ? Math.round((articles.filter((item) => Number(item.quality_score) >= 0.6).length / articles.length) * 1000) / 10
      : 0,
    websiteChangesAwaitingReview: articles.filter((item) => item.source_review_required).length,
    failedQuestions,
    topQuestions: [...intentCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    mostVisitedPages: [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    mostUsedArticles: [...articleCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
  };
}
