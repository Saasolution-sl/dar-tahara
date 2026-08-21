import "server-only";

import { createHash } from "node:crypto";
import type { Locale } from "@/i18n/config";
import { runApprovedRetention } from "@/lib/retention-control";
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

/**
 * Concept vocabulary across every supported locale. Customers ask the same business question in
 * different languages, so tokens are folded to a shared concept before fingerprinting. Without the
 * non-English terms a Dutch "kosten … sleutel" question clusters separately from the English
 * "physical key fee" question and produces a duplicate owner question for one business policy.
 */
const CONCEPT_VOCABULARY: Record<string, string[]> = {
  price: [
    "fee", "fees", "cost", "costs", "charge", "charges", "price", "pricing", "amount", "rate", "rates", "tariff",
    "kost", "kosten", "prijs", "prijzen", "tarief", "tarieven", "vergoeding", "bedrag",
    "frais", "cout", "couts", "coute", "prix", "tarif", "tarifs", "montant",
    "precio", "precios", "coste", "costes", "costo", "cuesta", "cuestan", "tarifa", "tarifas", "importe", "cuota",
    "gebuhr", "gebuhren", "kostet", "preis", "preise", "betrag",
    "taxa", "taxas", "custo", "custos", "custa", "custam", "preco", "precos", "valor",
    "رسوم", "رسم", "الرسوم", "تكلفة", "التكلفة", "سعر", "السعر", "ثمن", "مبلغ",
  ],
  storage: [
    "store", "stores", "stored", "storage", "hold", "holds", "holding", "keep", "keeps", "keeping",
    "management", "manage", "managing", "custody",
    "beheer", "beheren", "bewaren", "bewaart", "bewaring", "opslag", "houden",
    "garde", "garder", "conservation", "conserver", "stockage", "gestion",
    "guardar", "guarda", "almacenar", "almacenamiento", "custodia",
    "aufbewahrung", "aufbewahren", "lagerung", "verwaltung", "verwahrung",
    "guardas", "armazenamento", "armazenar", "gestao",
    "تخزين", "حفظ", "ادارة", "الاحتفاظ", "احتفاظ",
  ],
  key: [
    "key", "keys",
    "sleutel", "sleutels",
    "cle", "cles", "clef", "clefs",
    "llave", "llaves",
    "schlussel", "schlussels", "schlusseln",
    "chave", "chaves",
    "مفتاح", "المفتاح", "مفاتيح", "المفاتيح",
  ],
  lock: [
    "lock", "locks", "smartlock", "smartlocks",
    "slot", "sloten",
    "serrure", "serrures",
    "cerradura", "cerraduras",
    "schloss", "schlosser",
    "fechadura", "fechaduras",
    "قفل", "اقفال", "الاقفال",
  ],
  cancel: [
    "cancel", "cancels", "cancelled", "canceled", "cancelling", "cancellation", "terminate", "termination",
    "annuleren", "annulering", "opzeggen", "opzegging", "afzeggen",
    "annuler", "annulation", "resilier", "resiliation",
    "cancelar", "cancelacion", "anular",
    "stornieren", "stornierung", "kundigen", "kundigung", "absagen",
    "cancelamento",
    "الغاء", "إلغاء", "الغى",
  ],
  refund: [
    "refund", "refunds", "refundable", "reimbursement", "reimburse",
    "terugbetaling", "terugbetalen", "restitutie",
    "remboursement", "rembourser",
    "reembolso", "reembolsar", "devolucion",
    "ruckerstattung", "erstattung",
    "devolucao",
    "استرداد", "استرجاع", "تعويض",
  ],
  window: [
    "window", "windows", "glass",
    "raam", "ramen", "glas", "ruiten",
    "fenetre", "fenetres", "vitre", "vitres",
    "ventana", "ventanas", "cristal", "cristales",
    "fenster", "scheiben",
    "janela", "janelas", "vidro", "vidros",
    "نافذة", "نوافذ", "زجاج", "شبابيك",
  ],
  pause: [
    "pause", "paused", "pausing", "suspend", "suspension", "freeze",
    "pauzeren", "pauze", "onderbreken", "opschorten",
    "suspendre", "interrompre",
    "pausar", "pausa", "suspender",
    "pausieren", "aussetzen", "unterbrechen",
    "suspensao",
    "ايقاف", "تعليق", "توقف",
  ],
  subscription: [
    "subscription", "subscriptions", "membership",
    "abonnement", "abonnementen", "abonnements", "abo",
    "suscripcion", "membresia",
    "assinatura",
    "اشتراك", "الاشتراك",
  ],
};

const CONCEPT_BY_TOKEN = new Map<string, string>(
  Object.entries(CONCEPT_VOCABULARY).flatMap(([concept, tokens]) => tokens.map((token) => [token, concept] as const)),
);
const CONCEPT_NAMES = new Set(Object.keys(CONCEPT_VOCABULARY));

const STOP_WORDS = new Set([
  "the", "and", "that", "this", "with", "from", "your", "have", "does", "what", "how", "can", "you", "much",
  "is", "do", "to", "a", "physical", "dar", "tahara",
  "hoeveel", "het", "een", "van", "voor", "fysieke", "fysiek", "wat", "kan", "mijn",
  "combien", "pour", "une", "des", "les", "physique", "quel", "quelle", "mon",
  "cuanto", "cuanta", "para", "una", "los", "las", "fisica", "fisico", "mi",
  "wie", "viel", "fur", "eine", "physische", "physisch", "mein", "meine",
  "quanto", "uma", "para", "fisica", "meu", "minha",
  "كم", "هل", "ما", "من", "على", "في", "الى",
]);

/** Folds a customer message into its sorted, language-independent concept/keyword tokens. */
function conceptualTokens(message: string): string[] {
  const tokens = normalize(redactForReasoning(message))
    .split(" ")
    .map((token) => CONCEPT_BY_TOKEN.get(token) || token)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  return [...new Set(tokens)].sort();
}

/**
 * Canonical owner questions seeded per business policy. A captured gap is attached to the matching
 * seeded question instead of creating a second owner question for the same policy. Rules stay
 * conservative: every required concept must be present and no excluded concept may appear.
 */
const CANONICAL_TOPICS: Array<{ questionKey: string; required: string[]; excluded: string[] }> = [
  { questionKey: "refund-policy", required: ["refund"], excluded: [] },
  { questionKey: "included-windows", required: ["window"], excluded: ["refund", "cancel"] },
  { questionKey: "subscription-pause", required: ["pause", "subscription"], excluded: ["refund"] },
  { questionKey: "digital-lock-policy", required: ["lock"], excluded: ["refund", "cancel"] },
  { questionKey: "physical-key-fee", required: ["price", "key"], excluded: ["lock", "refund", "cancel"] },
  { questionKey: "cancellation-notice", required: ["cancel"], excluded: ["refund"] },
];

/** Returns the seeded owner question that already covers this message, or null when none applies. */
export function canonicalQuestionKey(message: string): string | null {
  const concepts = new Set(conceptualTokens(message).filter((token) => CONCEPT_NAMES.has(token)));
  const match = CANONICAL_TOPICS.find((topic) =>
    topic.required.every((concept) => concepts.has(concept))
    && !topic.excluded.some((concept) => concepts.has(concept)));
  return match?.questionKey || null;
}

export function knowledgeGapFingerprint(message: string, intent: AssistantIntent): string {
  const signature = `${intent}:${conceptualTokens(message).slice(0, 14).join(" ")}`;
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

  const lookupQuestion = (key: string) => serviceSelect<Array<{ id: string; source_gap_ids: unknown }>>(
    `knowledge_builder_questions?question_key=eq.${key}&select=id,source_gap_ids&limit=1`,
  ).catch(() => []);
  const gapQuestionKey = `gap-${fingerprint.slice(0, 20)}`;
  const canonicalKey = canonicalQuestionKey(input.message);
  let questions = await lookupQuestion(canonicalKey || gapQuestionKey);
  // Fall back to a gap-scoped question so a missing seed never mis-creates a canonical policy key.
  if (!questions[0] && canonicalKey) questions = await lookupQuestion(gapQuestionKey);
  const questionKey = gapQuestionKey;
  let questionId = questions[0]?.id || null;
  if (!questionId) {
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
    questionId = created[0]?.id || null;
  } else if (gapId) {
    const sourceGapIds = Array.isArray(questions[0]?.source_gap_ids)
      ? questions[0].source_gap_ids.filter((id): id is string => typeof id === "string")
      : [];
    if (!sourceGapIds.includes(gapId)) {
      await serviceUpdate("knowledge_builder_questions", `id=eq.${questionId}`, {
        source_gap_ids: [...sourceGapIds, gapId],
      }).catch(() => undefined);
    }
  }
  if (gapId && questionId) {
    await serviceUpdate("assistant_knowledge_gaps", `id=eq.${gapId}`, {
      status: "linked",
      linked_question_id: questionId,
    }).catch(() => undefined);
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
  return runApprovedRetention({
    categories: ["assistant_knowledge_gaps", "assistant_provider_events"],
    execute: (days) => serviceRpc<Record<string, number>>("cleanup_assistant_knowledge_retention", {
      knowledge_gap_retention_days: days.assistant_knowledge_gaps,
      provider_event_retention_days: days.assistant_provider_events,
    }),
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
