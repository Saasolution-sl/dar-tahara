import "server-only";
import { randomUUID } from "node:crypto";
import { isLocale, type Locale } from "@/i18n/config";
import { answerAssistant } from "@/lib/assistant/service";
import {
  isServiceRoleConfigured,
  serviceInsert,
  serviceInsertIgnoreDuplicates,
  serviceRpc,
  serviceSelect,
  serviceUpdate,
  serviceUpsert,
} from "@/lib/supabase-rpc";
import { detectWhatsAppLocale } from "@/lib/whatsapp";
import { whatsappCopy } from "./copy";
import { normalizeSupportEmail } from "./email";
import { classifyEscalation, looksLikePromptInjection, looksLikeSpam, type EscalationDecision } from "./escalation";
import { createFreeScoutTicket, type FreeScoutTicketInput } from "./freescout";
import { sendMetaText } from "./meta";
import type { MetaWebhookEvent } from "./payload";
import {
  decryptSensitive,
  encryptSensitive,
  hashWhatsAppIdentifier,
  redactSensitiveText,
  safeError,
  sha256,
} from "./security";

type QueuePayload = Record<string, unknown> & { kind: string };
type WebhookRow = {
  id: string;
  external_event_id: string;
  payload: QueuePayload;
  correlation_id: string;
  attempt_count: number;
};

type ContactRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  email_verified: boolean;
  preferred_language: Locale;
  consent_status: string;
  blocked_until: string | null;
  abuse_count: number;
};

type ConversationRow = {
  id: string;
  contact_id: string;
  status: string;
  detected_language: Locale;
  current_intent: string | null;
  escalation_status: string;
  failed_resolution_attempts: number;
  conversation_summary: string | null;
  customer_profile: Record<string, unknown>;
};

type EscalationRow = {
  id: string;
  reason: string;
  category: string;
  severity: "low" | "normal" | "high" | "urgent";
  customer_summary: string;
  internal_summary: string;
  status: string;
  idempotency_key: string;
  attempt_count: number;
};

function log(event: string, metadata: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ scope: "whatsapp", event, ...metadata }));
}

async function audit(conversationId: string | null, correlationId: string, eventType: string, metadata: Record<string, unknown> = {}) {
  log(eventType, { correlationId, conversationId, ...metadata });
  await serviceInsert("bot_audit_logs", {
    conversation_id: conversationId,
    event_type: eventType,
    event_metadata: metadata,
    correlation_id: correlationId,
  }).catch(() => undefined);
}

function queuedPayload(event: MetaWebhookEvent): QueuePayload {
  if (event.kind === "status") {
    return {
      kind: "status",
      messageId: event.messageId,
      status: event.status,
      timestamp: event.timestamp,
      recipientHash: event.recipient ? hashWhatsAppIdentifier(event.recipient) : null,
    };
  }
  return {
    kind: "message",
    senderEncrypted: encryptSensitive(event.sender),
    senderHash: hashWhatsAppIdentifier(event.sender),
    displayName: event.displayName?.slice(0, 160) || null,
    messageType: event.messageType.slice(0, 40),
    textEncrypted: event.text ? encryptSensitive(event.text) : null,
    textRedacted: event.text ? redactSensitiveText(event.text) : null,
    timestamp: event.timestamp,
  };
}

export async function enqueueMetaWebhookEvents(events: MetaWebhookEvent[]): Promise<number> {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  if (!events.length) return 0;
  const rows = events.map((event) => {
    const payload = queuedPayload(event);
    return {
      provider: "meta_whatsapp",
      external_event_id: event.externalEventId,
      payload_hash: sha256(JSON.stringify(payload)),
      payload,
      processing_status: "pending",
    };
  });
  const inserted = await serviceInsertIgnoreDuplicates<Array<{ id: string }>>(
    "webhook_events",
    rows,
    "provider,external_event_id",
  );
  log("webhook_queued", { received: events.length, inserted: inserted.length });
  return inserted.length;
}

async function markEvent(row: WebhookRow, status: "processed" | "ignored" | "retry_pending" | "failed", error?: unknown) {
  const attempts = row.attempt_count || 1;
  const terminal = attempts >= 6;
  const nextStatus = status === "retry_pending" && terminal ? "failed" : status;
  const nextRetry = nextStatus === "retry_pending"
    ? new Date(Date.now() + Math.min(60 * 60_000, 30_000 * 2 ** Math.max(0, attempts - 1))).toISOString()
    : null;
  await serviceUpdate("webhook_events", `id=eq.${encodeURIComponent(row.id)}`, {
    processing_status: nextStatus,
    processed_at: nextStatus === "processed" || nextStatus === "ignored" || nextStatus === "failed" ? new Date().toISOString() : null,
    next_retry_at: nextRetry,
    error_message: error ? safeError(error) : null,
  });
}

function localeFrom(value: unknown, fallback: Locale = "en"): Locale {
  return typeof value === "string" && isLocale(value) ? value : fallback;
}

async function storeOutbound(
  conversation: ConversationRow,
  recipient: string,
  body: string,
  locale: Locale,
  correlationId: string,
  metadata: { aiGenerated?: boolean; modelName?: string; tokenUsage?: Record<string, unknown> } = {},
) {
  try {
    const sent = await sendMetaText(recipient, body);
    await serviceInsertIgnoreDuplicates("whatsapp_messages", {
      conversation_id: conversation.id,
      external_message_id: sent.id,
      direction: "outbound",
      message_type: "text",
      message_body_encrypted: encryptSensitive(body),
      message_body_redacted: redactSensitiveText(body),
      language: locale,
      delivery_status: "sent",
      ai_generated: metadata.aiGenerated || false,
      model_name: metadata.modelName || null,
      token_usage: metadata.tokenUsage || {},
    }, "external_message_id");
    await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, {
      last_bot_message_at: new Date().toISOString(),
    });
    await audit(conversation.id, correlationId, "whatsapp_response_sent", { externalMessageIdHash: sha256(sent.id), attempts: sent.attempts });
  } catch (error) {
    const externalId = `outbound:${conversation.id}:${sha256(body)}`;
    await serviceInsertIgnoreDuplicates("webhook_events", {
      provider: "meta_whatsapp",
      external_event_id: externalId,
      payload_hash: sha256(externalId),
      payload: {
        kind: "outbound",
        conversationId: conversation.id,
        recipientEncrypted: encryptSensitive(recipient),
        bodyEncrypted: encryptSensitive(body),
        locale,
        aiGenerated: metadata.aiGenerated || false,
        modelName: metadata.modelName || null,
        tokenUsage: metadata.tokenUsage || {},
      },
      processing_status: "retry_pending",
      next_retry_at: new Date(Date.now() + 30_000).toISOString(),
      error_message: safeError(error),
    }, "provider,external_event_id");
    await audit(conversation.id, correlationId, "whatsapp_response_failed", { queuedForRetry: true, error: safeError(error) });
  }
}

async function processOutbound(row: WebhookRow) {
  const payload = row.payload;
  const conversationId = String(payload.conversationId || "");
  const recipient = decryptSensitive(String(payload.recipientEncrypted || ""));
  const body = decryptSensitive(String(payload.bodyEncrypted || ""));
  const rows = await serviceSelect<ConversationRow[]>(
    `whatsapp_conversations?id=eq.${encodeURIComponent(conversationId)}&select=*&limit=1`,
  );
  const conversation = rows[0];
  if (!conversation) throw new Error("outbound_conversation_not_found");
  const sent = await sendMetaText(recipient, body);
  await serviceInsertIgnoreDuplicates("whatsapp_messages", {
    conversation_id: conversation.id,
    external_message_id: sent.id,
    direction: "outbound",
    message_type: "text",
    message_body_encrypted: encryptSensitive(body),
    message_body_redacted: redactSensitiveText(body),
    language: localeFrom(payload.locale),
    delivery_status: "sent",
    ai_generated: Boolean(payload.aiGenerated),
    model_name: typeof payload.modelName === "string" ? payload.modelName : null,
    token_usage: typeof payload.tokenUsage === "object" ? payload.tokenUsage : {},
  }, "external_message_id");
  await audit(conversation.id, row.correlation_id, "whatsapp_retry_completed", { attempts: row.attempt_count });
}

async function findOrCreateContact(payload: QueuePayload): Promise<ContactRow> {
  const senderHash = String(payload.senderHash || "");
  const rows = await serviceUpsert<ContactRow[]>("whatsapp_contacts", {
    whatsapp_user_id: senderHash,
    phone_number_encrypted: payload.senderEncrypted,
    phone_number_hash: senderHash,
    display_name: payload.displayName || undefined,
    last_contact_at: new Date().toISOString(),
  }, "whatsapp_user_id");
  return rows[0];
}

async function findOrCreateConversation(contact: ContactRow, locale: Locale): Promise<ConversationRow> {
  const existing = await serviceSelect<ConversationRow[]>(
    `whatsapp_conversations?contact_id=eq.${contact.id}&status=in.(active,awaiting_customer,awaiting_email,escalated)&select=*&order=last_customer_message_at.desc.nullslast&limit=1`,
  );
  if (existing[0]) return existing[0];
  const inserted = await serviceInsert<ConversationRow[]>("whatsapp_conversations", {
    contact_id: contact.id,
    status: "active",
    detected_language: locale,
    service_window_expires_at: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
  });
  return inserted[0];
}

async function recentContext(conversationId: string): Promise<{ summary: string; transcript: string; count: number }> {
  const rows = await serviceSelect<Array<{ direction: string; message_body_encrypted: string | null; message_body_redacted: string | null; created_at: string }>>(
    `whatsapp_messages?conversation_id=eq.${conversationId}&select=direction,message_body_encrypted,message_body_redacted,created_at&order=created_at.desc&limit=12`,
  ).catch(() => []);
  const lines = rows.reverse().map((item) => {
    let body = item.message_body_redacted || "[content unavailable]";
    if (item.message_body_encrypted) body = redactSensitiveText(decryptSensitive(item.message_body_encrypted), 800);
    return `${item.direction === "inbound" ? "Customer" : "Assistant"}: ${body}`;
  });
  return { summary: lines.slice(-6).join("\n").slice(0, 3500), transcript: lines.join("\n").slice(0, 12_000), count: rows.length };
}

async function startEscalation(
  contact: ContactRow,
  conversation: ConversationRow,
  decision: EscalationDecision,
  latestMessage: string,
  recipient: string,
  locale: Locale,
  correlationId: string,
) {
  const context = await recentContext(conversation.id);
  const inserted = await serviceInsertIgnoreDuplicates<EscalationRow[]>("support_escalations", {
    conversation_id: conversation.id,
    contact_id: contact.id,
    reason: decision.reason,
    category: decision.category,
    severity: decision.severity,
    customer_summary: redactSensitiveText(latestMessage, 1500),
    internal_summary: context.summary,
    customer_email: contact.email,
    status: "awaiting_email",
    idempotency_key: `whatsapp/${conversation.id}`,
  }, "idempotency_key");
  const escalation = inserted[0] || (await serviceSelect<EscalationRow[]>(
    `support_escalations?idempotency_key=eq.${encodeURIComponent(`whatsapp/${conversation.id}`)}&select=*&limit=1`,
  ))[0];
  await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, {
    status: "awaiting_email",
    escalation_status: "awaiting_email",
    assigned_ticket_id: escalation?.id || null,
    current_intent: decision.category,
  });
  await audit(conversation.id, correlationId, "escalation_triggered", { category: decision.category, severity: decision.severity });
  await storeOutbound(conversation, recipient, whatsappCopy(locale).emailRequest, locale, correlationId);
  await audit(conversation.id, correlationId, "email_requested", { reason: decision.reason });
}

async function createTicket(
  contact: ContactRow,
  conversation: ConversationRow,
  escalation: EscalationRow,
  latestMessage: string,
  recipient: string,
  locale: Locale,
  correlationId: string,
) {
  await serviceUpdate("support_escalations", `id=eq.${escalation.id}`, {
    status: "creating_ticket",
    attempt_count: escalation.attempt_count + 1,
    last_error: null,
  });
  await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, {
    status: "awaiting_customer",
    escalation_status: "creating_ticket",
  });
  const context = await recentContext(conversation.id);
  const profile = conversation.customer_profile || {};
  const ticketInput: FreeScoutTicketInput = {
    idempotencyKey: escalation.idempotency_key,
    category: escalation.category,
    severity: escalation.severity,
    customerName: contact.display_name || "WhatsApp contact",
    customerEmail: contact.email as string,
    whatsappReference: hashWhatsAppIdentifier(recipient).slice(0, 16),
    preferredLanguage: locale,
    city: typeof profile.city === "string" ? profile.city : null,
    propertyType: typeof profile.propertyType === "string" ? profile.propertyType : null,
    propertySize: typeof profile.propertySize === "string" ? profile.propertySize : null,
    cleaningFrequency: typeof profile.cleaningFrequency === "string" ? profile.cleaningFrequency : null,
    reason: escalation.reason,
    latestQuestion: redactSensitiveText(latestMessage, 1500),
    summary: escalation.internal_summary || context.summary,
    transcript: context.transcript,
    conversationId: conversation.id,
    consentStatus: contact.consent_status,
    createdAt: new Date().toISOString(),
  };
  try {
    const result = await createFreeScoutTicket(ticketInput);
    await serviceUpdate("support_escalations", `id=eq.${escalation.id}`, {
      status: "escalated",
      freescout_conversation_id: result.conversationId,
      freescout_ticket_number: result.ticketNumber,
      customer_email: contact.email,
      customer_notified_at: new Date().toISOString(),
      next_retry_at: null,
      last_error: null,
    });
    await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, {
      status: "escalated",
      escalation_status: "escalated",
      assigned_ticket_id: escalation.id,
    });
    await storeOutbound(conversation, recipient, whatsappCopy(locale).ticketCreated, locale, correlationId);
    await audit(conversation.id, correlationId, "freescout_ticket_created", {
      method: result.method,
      ticketNumber: result.ticketNumber,
      confirmationEmailSent: result.confirmationEmailSent,
    });
  } catch (error) {
    const nextRetry = new Date(Date.now() + Math.min(60 * 60_000, 30_000 * 2 ** escalation.attempt_count)).toISOString();
    await serviceUpdate("support_escalations", `id=eq.${escalation.id}`, {
      status: "retry_pending",
      next_retry_at: nextRetry,
      last_error: safeError(error),
    });
    await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, {
      status: "awaiting_customer",
      escalation_status: "retry_pending",
    });
    await storeOutbound(conversation, recipient, whatsappCopy(locale).ticketPending, locale, correlationId);
    await audit(conversation.id, correlationId, "freescout_ticket_failed", { error: safeError(error), nextRetry });
  }
}

async function processStatus(row: WebhookRow) {
  const status = String(row.payload.status || "unknown");
  const delivery = status === "sent" || status === "delivered" || status === "read" || status === "failed" ? status : "ignored";
  await serviceUpdate("whatsapp_messages", `external_message_id=eq.${encodeURIComponent(String(row.payload.messageId || ""))}`, {
    delivery_status: delivery,
  });
  await audit(null, row.correlation_id, `delivery_status_${delivery}`, { externalMessageIdHash: sha256(String(row.payload.messageId || "")) });
}

async function processMessage(row: WebhookRow) {
  const payload = row.payload;
  const sender = decryptSensitive(String(payload.senderEncrypted || ""));
  const message = payload.textEncrypted ? decryptSensitive(String(payload.textEncrypted)) : "";
  const messageType = String(payload.messageType || "unknown");
  const contact = await findOrCreateContact(payload);
  const detected = message ? detectWhatsAppLocale(message) : contact.preferred_language;
  const locale = detected;
  const conversation = await findOrCreateConversation(contact, locale);
  const copy = whatsappCopy(locale);

  if (contact.blocked_until && new Date(contact.blocked_until).getTime() > Date.now()) {
    await audit(conversation.id, row.correlation_id, "blocked_contact_ignored", {});
    return;
  }

  const inserted = await serviceInsertIgnoreDuplicates<Array<{ id: string }>>("whatsapp_messages", {
    conversation_id: conversation.id,
    external_message_id: row.external_event_id,
    direction: "inbound",
    message_type: ["text", "button", "interactive", "image", "audio", "video", "document", "sticker", "location", "contacts"].includes(messageType) ? messageType : "unknown",
    message_body_encrypted: message ? encryptSensitive(message) : null,
    message_body_redacted: message ? redactSensitiveText(message) : null,
    language: locale,
    delivery_status: message ? "received" : "ignored",
    ai_generated: false,
  }, "external_message_id");
  if (!inserted.length) {
    await audit(conversation.id, row.correlation_id, "duplicate_message_ignored", { externalMessageIdHash: sha256(row.external_event_id) });
    return;
  }

  await serviceUpdate("whatsapp_contacts", `id=eq.${contact.id}`, {
    preferred_language: detected,
    last_contact_at: new Date().toISOString(),
  });
  await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, {
    detected_language: detected,
    last_customer_message_at: new Date().toISOString(),
    service_window_expires_at: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
  });
  await audit(conversation.id, row.correlation_id, "message_parsed", { messageType, locale: detected });

  if (conversation.escalation_status === "escalated") {
    await storeOutbound(conversation, sender, copy.ticketCreated, locale, row.correlation_id);
    return;
  }
  if (conversation.escalation_status === "creating_ticket" || conversation.escalation_status === "retry_pending") {
    await storeOutbound(conversation, sender, copy.ticketPending, locale, row.correlation_id);
    return;
  }

  if (!message || !["text", "button", "interactive"].includes(messageType)) {
    await storeOutbound(conversation, sender, copy.unsupported, locale, row.correlation_id);
    return;
  }

  const maxLength = Number(process.env.WHATSAPP_MAX_MESSAGE_LENGTH || 3000);
  if (message.length > maxLength) {
    await storeOutbound(conversation, sender, copy.tooLong, locale, row.correlation_id);
    return;
  }

  const recentMinute = new Date(Date.now() - 60_000).toISOString();
  const recent = await serviceSelect<Array<{ id: string }>>(
    `whatsapp_messages?conversation_id=eq.${conversation.id}&direction=eq.inbound&created_at=gte.${encodeURIComponent(recentMinute)}&select=id&limit=50`,
  ).catch(() => []);
  const limit = Number(process.env.WHATSAPP_RATE_LIMIT_PER_MINUTE || 12);
  if (recent.length > limit) {
    await storeOutbound(conversation, sender, copy.rateLimited, locale, row.correlation_id);
    await audit(conversation.id, row.correlation_id, "rate_limit_applied", { count: recent.length });
    return;
  }

  if (looksLikeSpam(message)) {
    const abuseCount = contact.abuse_count + 1;
    const shouldBlock = abuseCount >= 3;
    await serviceUpdate("whatsapp_contacts", `id=eq.${contact.id}`, {
      abuse_count: abuseCount,
      blocked_until: shouldBlock ? new Date(Date.now() + 15 * 60_000).toISOString() : null,
    });
    if (shouldBlock) {
      await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, { status: "blocked" });
      await storeOutbound(conversation, sender, copy.blocked, locale, row.correlation_id);
    }
    await audit(conversation.id, row.correlation_id, "spam_detected", { abuseCount, blocked: shouldBlock });
    return;
  }

  if (looksLikePromptInjection(message)) {
    await audit(conversation.id, row.correlation_id, "prompt_injection_detected", {});
  }

  if (conversation.escalation_status === "awaiting_email") {
    const email = normalizeSupportEmail(message);
    if (!email) {
      await storeOutbound(conversation, sender, copy.invalidEmail, locale, row.correlation_id);
      return;
    }
    const updatedContacts = await serviceUpdate<ContactRow[]>("whatsapp_contacts", `id=eq.${contact.id}`, {
      email,
      email_verified: false,
      consent_status: "granted",
      consent_timestamp: new Date().toISOString(),
    });
    const escalations = await serviceSelect<EscalationRow[]>(
      `support_escalations?conversation_id=eq.${conversation.id}&status=in.(awaiting_email,escalation_required,retry_pending)&select=*&order=created_at.desc&limit=1`,
    );
    const escalation = escalations[0];
    if (!escalation) throw new Error("awaiting_email_without_escalation");
    await serviceUpdate("support_escalations", `id=eq.${escalation.id}`, { status: "email_received", customer_email: email });
    await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, { escalation_status: "email_received" });
    await createTicket(updatedContacts[0] || { ...contact, email }, { ...conversation, escalation_status: "email_received" }, escalation, message, sender, locale, row.correlation_id);
    return;
  }

  const deterministic = classifyEscalation(message, conversation.failed_resolution_attempts);
  if (deterministic.required) {
    await startEscalation(contact, conversation, deterministic, message, sender, locale, row.correlation_id);
    return;
  }

  const context = await recentContext(conversation.id);
  const reply = await answerAssistant({
    channel: "whatsapp",
    message,
    locale,
    conversationId: conversation.id,
    customerName: contact.display_name,
    contact: String(payload.senderHash || ""),
    contextSummary: conversation.conversation_summary || context.summary,
  });
  await audit(conversation.id, row.correlation_id, "intent_classified", { intent: reply.intent, confidence: reply.confidence });
  const threshold = Number(process.env.ASSISTANT_CONFIDENCE_THRESHOLD || 0.62);
  if (reply.handoffRequired || reply.confidence < threshold) {
    await startEscalation(contact, conversation, {
      required: true,
      category: reply.handoffReason || "low_confidence",
      reason: reply.handoffReason || "low_confidence_classification",
      severity: "normal",
    }, message, sender, locale, row.correlation_id);
    return;
  }
  await storeOutbound(conversation, sender, reply.answer, locale, row.correlation_id, {
    aiGenerated: Boolean(reply.modelName),
    modelName: reply.modelName,
    tokenUsage: reply.tokenUsage,
  });
  await serviceUpdate("whatsapp_conversations", `id=eq.${conversation.id}`, {
    current_intent: reply.intent,
    conversation_summary: context.count >= 10 ? context.summary : conversation.conversation_summary,
    failed_resolution_attempts: reply.intent === "unknown" ? conversation.failed_resolution_attempts + 1 : 0,
  });
}

async function processClaimedEvent(row: WebhookRow) {
  if (row.payload.kind === "status") return processStatus(row);
  if (row.payload.kind === "message") return processMessage(row);
  if (row.payload.kind === "outbound") return processOutbound(row);
  throw new Error("unsupported_queued_event");
}

export async function drainWhatsAppQueue(maxJobs = 10): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;
  for (let index = 0; index < Math.max(1, Math.min(maxJobs, 50)); index += 1) {
    const claimed = await serviceRpc<WebhookRow[]>("claim_next_whatsapp_webhook_event").catch(() => []);
    const row = claimed[0];
    if (!row) break;
    try {
      await processClaimedEvent(row);
      await markEvent(row, "processed");
      processed += 1;
    } catch (error) {
      await markEvent(row, "retry_pending", error).catch(() => undefined);
      await audit(null, row.correlation_id, "webhook_processing_failed", { error: safeError(error), attempt: row.attempt_count });
      failed += 1;
    }
  }
  return { processed, failed };
}

export async function retryEscalation(escalationId: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(escalationId)) throw new Error("invalid_escalation_id");
  const escalations = await serviceSelect<EscalationRow[]>(
    `support_escalations?id=eq.${escalationId}&status=in.(ticket_creation_failed,retry_pending)&select=*&limit=1`,
  );
  const escalation = escalations[0];
  if (!escalation) throw new Error("retry_not_available");
  await serviceUpdate("support_escalations", `id=eq.${escalation.id}`, {
    status: "retry_pending",
    next_retry_at: new Date().toISOString(),
    last_error: null,
  });
}

export async function retryDueEscalations(limit = 10): Promise<{ attempted: number }> {
  const now = encodeURIComponent(new Date().toISOString());
  const rows = await serviceSelect<Array<EscalationRow & { conversation_id: string; contact_id: string; customer_email: string | null }>>(
    `support_escalations?status=eq.retry_pending&next_retry_at=lte.${now}&select=*&order=next_retry_at&limit=${Math.max(1, Math.min(limit, 25))}`,
  ).catch(() => []);
  let attempted = 0;
  for (const escalation of rows) {
    const [contacts, conversations] = await Promise.all([
      serviceSelect<Array<ContactRow & { phone_number_encrypted: string | null }>>(
        `whatsapp_contacts?id=eq.${escalation.contact_id}&select=*&limit=1`,
      ),
      serviceSelect<ConversationRow[]>(
        `whatsapp_conversations?id=eq.${escalation.conversation_id}&select=*&limit=1`,
      ),
    ]);
    const contact = contacts[0];
    const conversation = conversations[0];
    if (!contact?.email || !contact.phone_number_encrypted || !conversation) continue;
    await createTicket(
      contact,
      conversation,
      escalation,
      escalation.customer_summary,
      decryptSensitive(contact.phone_number_encrypted),
      contact.preferred_language,
      randomUUID(),
    );
    attempted += 1;
  }
  return { attempted };
}

export async function runWhatsAppRetention(): Promise<Record<string, number>> {
  const messageDays = Number(process.env.WHATSAPP_MESSAGE_RETENTION_DAYS || 90);
  const auditDays = Number(process.env.WHATSAPP_AUDIT_RETENTION_DAYS || 365);
  return serviceRpc("cleanup_whatsapp_retention", {
    message_retention_days: messageDays,
    audit_retention_days: auditDays,
  });
}
