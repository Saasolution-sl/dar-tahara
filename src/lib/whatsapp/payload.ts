export type MetaMessageEvent = {
  kind: "message";
  externalEventId: string;
  sender: string;
  displayName: string | null;
  messageType: string;
  text: string | null;
  timestamp: string | null;
};

export type MetaStatusEvent = {
  kind: "status";
  externalEventId: string;
  messageId: string;
  recipient: string | null;
  status: "sent" | "delivered" | "read" | "failed" | "unknown";
  timestamp: string | null;
};

export type MetaWebhookEvent = MetaMessageEvent | MetaStatusEvent;

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function messageText(message: JsonRecord): string | null {
  const type = text(message.type);
  if (type === "text") return text(record(message.text)?.body);
  if (type === "button") return text(record(message.button)?.text) || text(record(message.button)?.payload);
  if (type === "interactive") {
    const interactive = record(message.interactive);
    const reply = record(interactive?.button_reply) || record(interactive?.list_reply);
    return text(reply?.title) || text(reply?.id);
  }
  return null;
}

export function parseMetaWebhook(payload: unknown): MetaWebhookEvent[] {
  const root = record(payload);
  if (!root || (root.object && root.object !== "whatsapp_business_account")) return [];
  const result: MetaWebhookEvent[] = [];
  for (const entryValue of array(root.entry)) {
    const entry = record(entryValue);
    for (const changeValue of array(entry?.changes)) {
      const value = record(record(changeValue)?.value);
      const contacts = array(value?.contacts).map(record).filter(Boolean) as JsonRecord[];
      for (const messageValue of array(value?.messages)) {
        const message = record(messageValue);
        const id = text(message?.id);
        const sender = text(message?.from);
        if (!message || !id || !sender) continue;
        const contact = contacts.find((item) => text(item.wa_id) === sender) || contacts[0];
        result.push({
          kind: "message",
          externalEventId: id,
          sender,
          displayName: text(record(contact?.profile)?.name),
          messageType: text(message.type) || "unknown",
          text: messageText(message),
          timestamp: text(message.timestamp),
        });
      }
      for (const statusValue of array(value?.statuses)) {
        const status = record(statusValue);
        const messageId = text(status?.id);
        const state = text(status?.status);
        const timestamp = text(status?.timestamp);
        if (!status || !messageId) continue;
        result.push({
          kind: "status",
          externalEventId: `${messageId}:${state || "unknown"}:${timestamp || "none"}`,
          messageId,
          recipient: text(status.recipient_id),
          status: state === "sent" || state === "delivered" || state === "read" || state === "failed" ? state : "unknown",
          timestamp,
        });
      }
    }
  }
  return result;
}
