import "server-only";

import type { Locale } from "@/i18n/config";
import { site, whatsappLink } from "@/lib/site";
import {
  isServiceRoleConfigured,
  serviceInsert,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";
import { redactSensitiveText } from "@/lib/whatsapp/security";

type ConversationRow = {
  id: string;
  language: Locale;
  last_intent: string | null;
  metadata: Record<string, unknown> | null;
};

type MessageRow = {
  role: string;
  body: string;
  created_at: string;
};

type HandoverRow = {
  id: string;
  reference: string;
};

export interface HandoverChannelAdapter {
  channel: "whatsapp" | "phone";
  destination: string;
  buildDestinationUrl(prefilledMessage: string): string;
}

const HANDOVER_ADAPTERS: Record<"whatsapp" | "phone", HandoverChannelAdapter> = {
  whatsapp: {
    channel: "whatsapp",
    destination: site.whatsappE164,
    buildDestinationUrl: (message) => whatsappLink(message),
  },
  phone: {
    channel: "phone",
    destination: site.phoneE164,
    buildDestinationUrl: () => `tel:${site.phoneE164}`,
  },
};

function clean(value: string, length: number): string {
  return redactSensitiveText(
    value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim(),
    length,
  );
}

function detectService(messages: MessageRow[]): string | null {
  const text = messages.map((message) => message.body).join(" ").toLowerCase();
  if (/\bweekly|hebdomadaire|wekelijks|semanal|wöchentlich|أسبوع/.test(text)) return "Weekly Cleaning";
  if (/\bbi.?weekly|twice per month|deux fois|twee keer|quincenal/.test(text)) return "Twice-per-month Cleaning";
  if (/\bmonthly|mensuel|maandelijks|mensual|monatlich|شهري/.test(text)) return "Monthly Cleaning";
  if (/\bassessment|évaluation|beoordeling|evaluación|bewertung|تقييم/.test(text)) return "Initial Home Assessment";
  return null;
}

function detectLocation(messages: MessageRow[]): string | null {
  const text = messages.map((message) => message.body).join(" ");
  return text.match(/\b(Tangier|Tanger|Tétouan|Tetouan|Rabat|Casablanca|Marrakesh|Marrakech)\b/i)?.[1] || null;
}

function summarize(messages: MessageRow[]): string {
  return messages.slice(-8).map((message) =>
    `${message.role === "customer" ? "Customer" : "Assistant"}: ${clean(message.body, 500)}`,
  ).join("\n").slice(0, 4_000);
}

function transcript(messages: MessageRow[]): string {
  return messages.map((message) =>
    `[${message.created_at}] ${message.role}: ${clean(message.body, 1_500)}`,
  ).join("\n").slice(0, 12_000);
}

function prefilledMessage(input: {
  reference: string;
  service: string | null;
  location: string | null;
  question: string;
}) {
  return [
    "Hello Dar Tahara,",
    "",
    "I was speaking with the website assistant.",
    "",
    `Reference:\n${input.reference}`,
    input.service ? `\nService:\n${input.service}` : "",
    input.location ? `\nCity:\n${input.location}` : "",
    `\nQuestion:\n${clean(input.question, 700)}`,
    "",
    "Thank you.",
  ].filter(Boolean).join("\n");
}

export async function createWebsiteHandover(input: {
  conversationId: string;
  sessionId: string;
  channel?: "whatsapp" | "phone";
}) {
  if (!isServiceRoleConfigured()) throw new Error("handover_not_configured");
  const conversations = await serviceSelect<ConversationRow[]>(
    `assistant_conversations?id=eq.${encodeURIComponent(input.conversationId)}&channel=eq.website&select=id,language,last_intent,metadata&limit=1`,
  );
  const conversation = conversations[0];
  if (!conversation || conversation.metadata?.session_id !== input.sessionId) throw new Error("handover_forbidden");
  const messages = await serviceSelect<MessageRow[]>(
    `assistant_messages?conversation_id=eq.${encodeURIComponent(input.conversationId)}&role=in.(customer,assistant)&select=role,body,created_at&order=created_at.asc&limit=50`,
  );
  if (!messages.length) throw new Error("handover_conversation_empty");

  const service = detectService(messages);
  const location = detectLocation(messages);
  const adapter = HANDOVER_ADAPTERS[input.channel || "whatsapp"];
  const summary = summarize(messages);
  const fullTranscript = transcript(messages);
  const latestQuestion = [...messages].reverse().find((message) => message.role === "customer")?.body || summary;
  const rows = await serviceInsert<HandoverRow[]>("handover_requests", {
    conversation_id: conversation.id,
    channel: adapter.channel,
    customer_language: conversation.language,
    detected_intent: conversation.last_intent,
    service,
    location,
    conversation_summary: summary,
    conversation_transcript: fullTranscript,
    destination: adapter.destination,
    provider_payload: { adapter: adapter.channel, version: 1 },
  });
  const handover = rows[0];
  if (!handover) throw new Error("handover_create_failed");

  await Promise.all([
    serviceInsert("conversation_summaries", {
      conversation_id: conversation.id,
      summary,
      language: conversation.language,
    }),
    serviceUpdate("assistant_conversations", `id=eq.${conversation.id}`, {
      status: "handoff_requested",
      handoff_reason: "customer_selected_handover",
      metadata: {
        ...conversation.metadata,
        handover_id: handover.id,
        handover_reference: handover.reference,
      },
    }),
  ]);

  const message = prefilledMessage({
    reference: handover.reference,
    service,
    location,
    question: latestQuestion,
  });
  return {
    id: handover.id,
    reference: handover.reference,
    whatsappUrl: HANDOVER_ADAPTERS.whatsapp.buildDestinationUrl(message),
    phoneUrl: HANDOVER_ADAPTERS.phone.buildDestinationUrl(message),
  };
}

export async function loadWebsiteSession(input: { conversationId: string; sessionId: string }) {
  const conversations = await serviceSelect<ConversationRow[]>(
    `assistant_conversations?id=eq.${encodeURIComponent(input.conversationId)}&channel=eq.website&select=id,language,last_intent,metadata&limit=1`,
  );
  const conversation = conversations[0];
  if (!conversation || conversation.metadata?.session_id !== input.sessionId) throw new Error("session_forbidden");
  const messages = await serviceSelect<MessageRow[]>(
    `assistant_messages?conversation_id=eq.${encodeURIComponent(input.conversationId)}&role=in.(customer,assistant)&select=role,body,created_at&order=created_at.asc&limit=100`,
  );
  return {
    id: conversation.id,
    language: conversation.language,
    intent: conversation.last_intent,
    messages,
  };
}
