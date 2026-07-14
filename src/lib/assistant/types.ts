import type { Locale } from "@/i18n/config";

export type AssistantChannel = "website" | "whatsapp";
export type AssistantRole = "customer" | "assistant" | "human" | "system";
export type AssistantStatus = "open" | "handoff_requested" | "human_active" | "closed";

export type KnowledgeVisibility = "public" | "internal";
export type KnowledgeStatus = "draft" | "approved" | "archived";

export type KnowledgeArticle = {
  id: string;
  title: string;
  category:
    | "company"
    | "services"
    | "assessment"
    | "pricing"
    | "billing"
    | "payments"
    | "policies"
    | "access"
    | "support";
  language: Locale | "all";
  status: KnowledgeStatus;
  version: number;
  effectiveDate: string;
  lastReviewedDate: string;
  source: string;
  visibility: KnowledgeVisibility;
  keywords: string[];
  relatedQuestions: string[];
  summary: string;
  content: string;
};

export type RetrievedKnowledge = {
  article: KnowledgeArticle;
  score: number;
  matchedKeywords: string[];
};

export type AssistantIntent =
  | "general_faq"
  | "service_explanation"
  | "assessment_explanation"
  | "pricing"
  | "billing"
  | "payment"
  | "booking_guidance"
  | "booking_status"
  | "reschedule"
  | "cancellation"
  | "complaint"
  | "human_handoff"
  | "language_change"
  | "privacy"
  | "opt_out"
  | "unknown";

export type AssistantInput = {
  channel: AssistantChannel;
  message: string;
  locale: Locale;
  conversationId?: string | null;
  sessionId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  contact?: string | null;
  websitePath?: string | null;
  /** Compact, server-built context. Customer text inside remains untrusted. */
  contextSummary?: string | null;
};

export type AssistantToolCall = {
  name: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
  status: "success" | "failed" | "skipped";
};

export type AssistantReply = {
  conversationId: string;
  locale: Locale;
  intent: AssistantIntent;
  answer: string;
  confidence: number;
  modelName?: string;
  tokenUsage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  handoffRequired: boolean;
  handoffReason?: string;
  sources: Array<{
    id: string;
    title: string;
    category: KnowledgeArticle["category"];
    source: string;
    version: number;
  }>;
  suggestedActions: Array<{
    label: string;
    action: "ask" | "open_calculator" | "open_booking" | "handoff";
    value: string;
  }>;
  toolCalls: AssistantToolCall[];
};
