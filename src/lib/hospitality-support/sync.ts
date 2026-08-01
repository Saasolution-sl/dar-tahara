import "server-only";

import { randomUUID } from "node:crypto";
import {
  serviceInsert,
  serviceInsertIgnoreDuplicates,
  serviceRpc,
  serviceSelect,
  serviceUpdate,
  serviceUpsert,
} from "@/lib/supabase-rpc";
import { getSupportConversation } from "./client";
import { safeAttachmentFilename, safeIntegrationError, sha256, SUPPORT_ATTACHMENT_MIME_TYPES } from "./security";
import { mapHospitalitySupportStatus } from "./status-mapper";
import type { HospitalityConversation, SupportRequestRow } from "./types";

type WebhookEnvelope = {
  eventId: string;
  eventType: string;
  conversationId: string | null;
};

function stringValue(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return null;
}

export function parseHospitalityWebhook(payload: unknown, rawBody: string, headerEventType?: string | null): WebhookEnvelope {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : {};
  const conversation = (root.conversation && typeof root.conversation === "object" ? root.conversation : data.conversation) as Record<string, unknown> | undefined;
  const eventType = headerEventType || stringValue(root.event || root.type || root.eventType) || "unknown";
  const conversationId = headerEventType
    ? stringValue(root.id)
    : stringValue(root.conversationId || root.conversation_id || data.conversationId || data.conversation_id || conversation?.id);
  const eventId = stringValue(root.eventId || root.event_id || (!headerEventType && conversationId ? root.id : null)) ||
    `${eventType}:${conversationId || "unknown"}:${sha256(rawBody)}`;
  return { eventId, eventType, conversationId };
}

function latestSender(conversation: HospitalityConversation) {
  return conversation.threads.at(-1)?.type || null;
}

export async function syncConversation(
  request: SupportRequestRow,
  conversation?: HospitalityConversation,
): Promise<{ newCustomerVisibleReplies: number }> {
  if (!request.hospitality_support_conversation_id) throw new Error("support_conversation_missing");
  const authoritative = conversation || await getSupportConversation(request.hospitality_support_conversation_id);
  let newCustomerVisibleReplies = 0;
  for (const thread of authoritative.threads) {
    if (!thread.id) continue;
    const existing = await serviceSelect<Array<{ id: string }>>(
      `support_messages?support_request_id=eq.${encodeURIComponent(request.id)}&hospitality_support_message_id=eq.${encodeURIComponent(thread.id)}&select=id&limit=1`,
    );
    const rows = await serviceUpsert<Array<{ id: string }>>("support_messages", {
      support_request_id: request.id,
      customer_id: request.customer_id,
      hospitality_support_message_id: thread.id,
      entry_type: thread.type,
      visibility: "customer",
      sender_name: thread.senderName,
      sender_role: thread.senderRole,
      body: thread.body,
      attachment_metadata: thread.attachments,
      call_metadata: thread.callMetadata || {},
      created_at: thread.createdAt,
      updated_at: new Date().toISOString(),
    }, "support_request_id,hospitality_support_message_id");
    const messageId = rows[0]?.id;
    if (!existing.length && (thread.type === "support" || thread.type === "call")) {
      const notifications = await serviceInsertIgnoreDuplicates<Array<{ id: string }>>("support_notifications", {
        customer_id: request.customer_id,
        support_request_id: request.id,
        hospitality_support_message_id: thread.id,
        notification_type: thread.type === "call" ? "support_call_note" : "support_reply",
        safe_summary: `${request.public_reference}: ${request.subject}`.slice(0, 240),
        delivery_status: "portal_unread",
      }, "support_request_id,hospitality_support_message_id,notification_type");
      if (!notifications.length) continue;
      newCustomerVisibleReplies += 1;
      await serviceInsert("customer_activity", {
        customer_id: request.customer_id,
        event_type: thread.type === "call" ? "support_call_note_added" : "support_reply_received",
        resource_type: "support_request",
        resource_id: request.id,
        public_summary: `New update for ${request.public_reference}`,
        metadata: { support_reference: request.public_reference, content_logged: false },
      });
      const customers = await serviceSelect<Array<{ email: string; preferred_language: string }>>(
        `customers?id=eq.${encodeURIComponent(request.customer_id)}&select=email,preferred_language&limit=1`,
      );
      if (customers[0]) {
        await serviceInsert("notification_outbox", {
          customer_id: request.customer_id,
          template_key: "support_reply_received",
          locale: customers[0].preferred_language,
          channel: "email",
          recipient: customers[0].email,
          consent_confirmed: true,
          payload: {
            support_reference: request.public_reference,
            subject: request.subject,
            action_url: `/account/support/${request.id}`,
            hospitality_support_message_id: thread.id,
            content_logged: false,
          },
        });
      }
    }
    for (const attachment of thread.attachments) {
      if (!messageId || !attachment.url || !attachment.size || !SUPPORT_ATTACHMENT_MIME_TYPES.has(attachment.mimeType)) continue;
      await serviceUpsert("support_attachments", {
        support_request_id: request.id,
        support_message_id: messageId,
        customer_id: request.customer_id,
        hospitality_support_attachment_id: attachment.id,
        external_url: attachment.url,
        original_filename: attachment.fileName,
        safe_filename: safeAttachmentFilename(attachment.fileName),
        mime_type: attachment.mimeType,
        size_bytes: attachment.size,
        visibility: "customer",
      }, "support_request_id,hospitality_support_attachment_id");
    }
  }
  const sender = latestSender(authoritative);
  const status = mapHospitalitySupportStatus(authoritative.status, { latestSender: sender, tags: authoritative.tags });
  const supportThreads = authoritative.threads.filter((thread) => thread.type === "support" || thread.type === "call");
  const customerThreads = authoritative.threads.filter((thread) => thread.type === "customer");
  await serviceUpdate("support_requests", `id=eq.${encodeURIComponent(request.id)}`, {
    hospitality_support_ticket_number: authoritative.number,
    hospitality_support_customer_id: authoritative.customerId,
    status_internal: authoritative.status,
    status,
    assigned_department: authoritative.mailboxName,
    latest_sender: sender,
    last_message_at: authoritative.updatedAt,
    last_support_message_at: supportThreads.at(-1)?.createdAt || request.last_support_message_at,
    last_customer_message_at: customerThreads.at(-1)?.createdAt || request.last_customer_message_at,
    integration_status: "synced",
    ...(status === "resolved" ? { resolved_at: authoritative.updatedAt } : {}),
    ...(status === "closed" ? { closed_at: authoritative.updatedAt } : {}),
  });
  if (newCustomerVisibleReplies) {
    await serviceRpc("increment_support_unread", { p_support_request_id: request.id, p_count: newCustomerVisibleReplies });
  }
  await serviceInsert("audit_logs", {
    actor_user_id: null,
    action: "support_request_synchronized",
    resource_type: "support_request",
    resource_id: request.id,
    new_value: { status, messages_seen: authoritative.threads.length, content_logged: false },
  });
  return { newCustomerVisibleReplies };
}

export async function processHospitalityWebhook(payload: unknown, rawBody: string, headerEventType?: string | null): Promise<"processed" | "duplicate" | "ignored"> {
  const event = parseHospitalityWebhook(payload, rawBody, headerEventType);
  const inserted = await serviceInsertIgnoreDuplicates<Array<{ id: string }>>("support_sync_events", {
    external_event_id: event.eventId,
    event_type: event.eventType,
    processing_status: "received",
    correlation_id: randomUUID(),
  }, "external_event_id");
  if (!inserted.length) return "duplicate";
  const eventRowId = inserted[0].id;
  if (!event.conversationId) {
    await serviceUpdate("support_sync_events", `id=eq.${eventRowId}`, { processing_status: "ignored", processed_at: new Date().toISOString() });
    return "ignored";
  }
  const rows = await serviceSelect<SupportRequestRow[]>(
    `support_requests?hospitality_support_conversation_id=eq.${encodeURIComponent(event.conversationId)}&select=*&limit=1`,
  );
  if (!rows[0]) {
    await serviceUpdate("support_sync_events", `id=eq.${eventRowId}`, { processing_status: "ignored", processed_at: new Date().toISOString() });
    return "ignored";
  }
  await serviceUpdate("support_sync_events", `id=eq.${eventRowId}`, { support_request_id: rows[0].id });
  try {
    await syncConversation(rows[0]);
    await serviceUpdate("support_sync_events", `id=eq.${eventRowId}`, { processing_status: "processed", processed_at: new Date().toISOString() });
    await serviceInsert("audit_logs", {
      actor_user_id: null,
      action: "hospitality_support_webhook_received",
      resource_type: "support_request",
      resource_id: rows[0].id,
      new_value: { event_type: event.eventType, external_event_id: event.eventId, content_logged: false },
    });
    return "processed";
  } catch (error) {
    const errorCode = safeIntegrationError(error);
    await serviceUpdate("support_sync_events", `id=eq.${eventRowId}`, {
      processing_status: "retry_pending",
      error_message: errorCode,
    });
    await serviceUpdate("support_requests", `id=eq.${rows[0].id}`, { integration_status: "retry_pending" });
    await serviceInsert("audit_logs", {
      actor_user_id: null,
      action: "hospitality_support_integration_failed",
      resource_type: "support_request",
      resource_id: rows[0].id,
      new_value: { error_code: errorCode, event_type: event.eventType, content_logged: false },
    });
    throw error;
  }
}
