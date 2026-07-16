import "server-only";

import { createHash } from "node:crypto";
import type { Locale } from "@/i18n/config";
import { isServiceRoleConfigured, serviceInsert, serviceRpc, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { redactForReasoning } from "./reasoning-provider";
import type { AssistantIntent, RetrievedKnowledge } from "./types";

export type KnowledgeQuestionStatus =
  | "draft_question"
  | "awaiting_owner_answer"
  | "owner_answered"
  | "needs_clarification"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "superseded"
  | "archived";

export type KnowledgeBuilderQuestion = {
  id: string;
  question_key: string;
  question: string;
  why_it_matters: string;
  current_knowledge: string;
  missing_information: string;
  suggested_answer_format: string;
  category: string;
  subcategory: string | null;
  priority: number;
  blocks_customer_support: boolean;
  status: KnowledgeQuestionStatus;
  owner_answer: string | null;
  normalized_short_answer: string | null;
  normalized_detailed_answer: string | null;
  answer_language: Locale;
  updated_at: string;
};

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

const CLUSTER_CONCEPTS: Array<[RegExp, string]> = [
  [/\b(?:fee|fees|cost|costs|charge|charges|price|pricing|amount)\b/giu, "price"],
  [/\b(?:store|stores|stored|storage|hold|holds|holding|keep|keeps|keeping|management)\b/giu, "storage"],
  [/\b(?:key|keys)\b/giu, "key"],
  [/\b(?:cancel|cancels|cancellation|terminate|termination|stop)\b/giu, "cancel"],
  [/\b(?:refund|refunds|refundable|reimbursement)\b/giu, "refund"],
  [/\b(?:window|windows|glass)\b/giu, "window"],
];

export function knowledgeGapFingerprint(message: string, intent: AssistantIntent): string {
  const stop = new Set(["the", "and", "that", "this", "with", "from", "your", "have", "does", "what", "how", "can", "you", "much", "is", "do", "to", "a", "physical", "dar", "tahara"]);
  const conceptual = CLUSTER_CONCEPTS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), normalize(redactForReasoning(message)));
  const tokens = conceptual.split(" ").filter((token) => token.length > 2 && !stop.has(token));
  const signature = `${intent}:${[...new Set(tokens)].sort().slice(0, 14).join(" ")}`;
  return createHash("sha256").update(signature).digest("hex");
}

function categoryForIntent(intent: AssistantIntent): string {
  if (intent === "pricing") return "Pricing";
  if (["payment", "billing"].includes(intent)) return "Payments and billing";
  if (["booking_guidance", "booking_status", "reschedule", "cancellation"].includes(intent)) return "Bookings";
  if (intent === "service_explanation") return "Cleaning services";
  if (intent === "assessment_explanation") return "Initial assessment";
  return "Unsupported requests";
}

export async function captureKnowledgeGap(input: {
  message: string;
  locale: Locale;
  intent: AssistantIntent;
  retrieved: RetrievedKnowledge[];
}): Promise<string | null> {
  if (!isServiceRoleConfigured()) return null;
  const fingerprint = knowledgeGapFingerprint(input.message, input.intent);
  const sanitized = redactForReasoning(input.message).replace(/\s+/g, " ").trim().slice(0, 500);
  const existing = await serviceSelect<Array<{ id: string; occurrence_count: number; sample_questions: unknown }>>(
    `assistant_knowledge_gaps?fingerprint=eq.${fingerprint}&select=id,occurrence_count,sample_questions&limit=1`,
  );
  let gapId = existing[0]?.id || null;
  if (existing[0]) {
    const samples = Array.isArray(existing[0].sample_questions) ? existing[0].sample_questions.filter((item): item is string => typeof item === "string") : [];
    await serviceUpdate("assistant_knowledge_gaps", `id=eq.${existing[0].id}`, {
      occurrence_count: existing[0].occurrence_count + 1,
      sample_questions: [...new Set([...samples, sanitized])].slice(-5),
      last_seen_at: new Date().toISOString(),
      metadata: { source_ids: input.retrieved.map((item) => item.article.id), content_redacted: true },
    });
  } else {
    const inserted = await serviceInsert<Array<{ id: string }>>("assistant_knowledge_gaps", {
      fingerprint,
      normalized_question: normalize(sanitized),
      sample_questions: [sanitized],
      language: input.locale,
      intent: input.intent,
      category: categoryForIntent(input.intent),
      metadata: { source_ids: input.retrieved.map((item) => item.article.id), content_redacted: true },
    });
    gapId = inserted[0]?.id || null;
    if (!gapId) throw new Error("knowledge_gap_insert_returned_no_id");
  }

  const questionKey = `gap-${fingerprint.slice(0, 20)}`;
  const questions = await serviceSelect<Array<{ id: string }>>(
    `knowledge_builder_questions?question_key=eq.${questionKey}&select=id&limit=1`,
  ).catch(() => []);
  if (!questions.length) {
    const known = input.retrieved.map((item) => item.article.summary).filter(Boolean).join(" ").slice(0, 1200);
    const created = await serviceInsert<Array<{ id: string }>>("knowledge_builder_questions", {
      question_key: questionKey,
      question: `What approved Dar Tahara answer should be used for this customer question: “${sanitized}”?`,
      why_it_matters: "A customer asked this and the assistant could not form a safe answer from approved knowledge.",
      current_knowledge: known || "No directly applicable approved knowledge was retrieved.",
      missing_information: "The exact customer-facing policy, conditions, exclusions, and whether staff action is required.",
      suggested_answer_format: "- Short customer answer:\n- Conditions:\n- Exclusions:\n- When staff action is required:",
      category: categoryForIntent(input.intent),
      subcategory: input.intent,
      priority: 70,
      blocks_customer_support: false,
      source_gap_ids: gapId ? [gapId] : [],
    }).catch(() => []);
    if (gapId && created[0]?.id) {
      await serviceUpdate("assistant_knowledge_gaps", `id=eq.${gapId}`, { status: "linked", linked_question_id: created[0].id }).catch(() => undefined);
    }
  }
  return gapId;
}

export async function loadKnowledgeBuilderDashboard() {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  const [questions, gaps, audit, providerEvents, articles, conversations] = await Promise.all([
    serviceSelect<KnowledgeBuilderQuestion[]>("knowledge_builder_questions?select=*&order=blocks_customer_support.desc,priority.desc,updated_at.asc&limit=200"),
    serviceSelect<Array<Record<string, unknown>>>("assistant_knowledge_gaps?select=*&order=occurrence_count.desc,last_seen_at.desc&limit=100"),
    serviceSelect<Array<{ action: string; metadata: Record<string, unknown> | null; created_at: string }>>("assistant_audit_logs?select=action,metadata,created_at&order=created_at.desc&limit=1000"),
    serviceSelect<Array<Record<string, unknown>>>("assistant_provider_events?select=provider,operation,success,latency_ms,total_tokens,failure_code,created_at&order=created_at.desc&limit=200").catch(() => []),
    serviceSelect<Array<{ status: string; category: string; last_reviewed_date: string | null; metadata: Record<string, unknown> | null }>>("knowledge_articles?select=status,category,last_reviewed_date,metadata&limit=500"),
    serviceSelect<Array<{ status: string; last_message_at: string; metadata: Record<string, unknown> | null }>>("assistant_conversations?select=status,last_message_at,metadata&order=last_message_at.desc&limit=500"),
  ]);
  const actionCount = (name: string) => audit.filter((event) => event.action === name).length;
  const oldThreshold = Date.now() - 180 * 24 * 60 * 60 * 1000;
  const abandonmentThreshold = Date.now() - 24 * 60 * 60 * 1000;
  return {
    questions,
    gaps,
    providerEvents,
    analytics: {
      unansweredQuestions: gaps.reduce((sum, gap) => sum + Number(gap.occurrence_count || 0), 0),
      escalations: actionCount("escalation_offered"),
      clarifications: actionCount("clarification_requested"),
      selfServiceResolutions: actionCount("self_service_completed"),
      lowConfidenceAnswers: audit.filter((event) => event.action === "intent_detected" && Number(event.metadata?.confidence || 1) < 0.65).length,
      repeatedRephrasedQuestions: gaps.filter((gap) => Number(gap.occurrence_count || 0) > 1).length,
      customerAbandonments: conversations.filter((conversation) => conversation.status === "open"
        && new Date(conversation.last_message_at).getTime() < abandonmentThreshold
        && conversation.metadata?.answer_category === "needs_customer_clarification").length,
      awaitingOwnerAnswer: questions.filter((question) => question.status === "awaiting_owner_answer").length,
      awaitingApproval: questions.filter((question) => question.status === "pending_approval").length,
      contradictoryEntries: articles.filter((article) => article.metadata?.contradiction_detected === true).length,
      outdatedEntries: articles.filter((article) => article.last_reviewed_date && new Date(article.last_reviewed_date).getTime() < oldThreshold).length,
      categoryCoverage: Object.entries(articles.reduce<Record<string, number>>((acc, article) => {
        if (article.status === "approved") acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {})).sort((a, b) => a[1] - b[1]),
    },
  };
}

export async function runAssistantKnowledgeRetention() {
  return serviceRpc<Record<string, number>>("cleanup_assistant_knowledge_retention", {
    knowledge_gap_retention_days: Math.max(1, Number(process.env.ASSISTANT_KNOWLEDGE_GAP_RETENTION_DAYS || 365)),
    provider_event_retention_days: Math.max(1, Number(process.env.ASSISTANT_PROVIDER_EVENT_RETENTION_DAYS || 90)),
  });
}

export async function updateKnowledgeBuilderQuestion(input: {
  id: string;
  action: "answer" | "approve" | "reject" | "needs_clarification" | "archive" | "supersede";
  answer?: string;
  actorUserId: string;
}) {
  const rows = await serviceSelect<KnowledgeBuilderQuestion[]>(`knowledge_builder_questions?id=eq.${encodeURIComponent(input.id)}&select=*&limit=1`);
  const question = rows[0];
  if (!question) throw new Error("knowledge_question_not_found");
  if (input.action === "answer") {
    const answer = (input.answer || "").trim().slice(0, 12_000);
    if (answer.length < 3) throw new Error("knowledge_answer_required");
    await serviceUpdate("knowledge_builder_questions", `id=eq.${question.id}`, {
      owner_answer: answer,
      normalized_short_answer: answer.split(/\n\n|\r?\n/)[0].slice(0, 500),
      normalized_detailed_answer: answer,
      owner_answered_by: input.actorUserId,
      answered_at: new Date().toISOString(),
      status: "pending_approval",
    });
    await serviceInsert("assistant_audit_logs", {
      actor_type: "admin",
      actor_reference: input.actorUserId,
      action: "knowledge_owner_answer_saved",
      subject_table: "knowledge_builder_questions",
      subject_id: question.id,
      metadata: { content_logged: false, next_status: "pending_approval" },
    });
    return;
  }
  if (input.action === "approve") {
    await serviceRpc("approve_knowledge_builder_question", {
      p_question_id: question.id,
      p_reviewer_id: input.actorUserId,
    });
    return;
  }
  const status: KnowledgeQuestionStatus = input.action === "needs_clarification" ? "needs_clarification"
    : input.action === "archive" ? "archived"
      : input.action === "supersede" ? "superseded"
        : "rejected";
  await serviceUpdate("knowledge_builder_questions", `id=eq.${question.id}`, { status, reviewer_id: input.actorUserId });
  await serviceInsert("assistant_audit_logs", {
    actor_type: "admin",
    actor_reference: input.actorUserId,
    action: `knowledge_question_${status}`,
    subject_table: "knowledge_builder_questions",
    subject_id: question.id,
    metadata: { content_logged: false },
  });
}
