import type { CreateConversationInput, HospitalityThread } from "./types";

function clean(value: string | null | undefined, max = 1000): string {
  return value?.trim() ? value.trim().slice(0, max) : "Not provided";
}

export function buildPortalMetadataNote(input: CreateConversationInput): string {
  const related = Object.entries(input.relatedContext)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${clean(value, 300)}`);
  return [
    "DAR TAHARA CUSTOMER PORTAL METADATA (INTERNAL)",
    `External reference: ${input.externalReference}`,
    `Public reference: ${input.publicReference}`,
    `Customer account ID: ${input.customerAccountId}`,
    `Customer reference: ${input.customerReference}`,
    `Category: ${input.category}`,
    `Preferred language: ${input.preferredLanguage}`,
    `Preferred contact: ${clean(input.preferredContactMethod, 100)}`,
    `Phone: ${clean(input.phone, 100)}`,
    `Source: ${process.env.HOSPITALITY_SUPPORT_PORTAL_SOURCE || "dar-tahara-customer-portal"}`,
    `Portal URL: ${input.portalUrl}`,
    ...related,
  ].join("\n");
}

export function isCustomerVisibleThread(thread: { type?: string; body?: string; text?: string; state?: string }): boolean {
  const type = (thread.type || "").toLowerCase();
  if (thread.state && thread.state !== "published") return false;
  if (type === "customer" || type === "message") return true;
  if (type !== "note") return false;
  const body = thread.body || thread.text || "";
  return body.startsWith("[CUSTOMER_VISIBLE_CALL]");
}

function providerBodyToText(value: string): string {
  return value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .trim();
}

export function mapFreeScoutThread(thread: Record<string, unknown>): HospitalityThread | null {
  const raw = {
    type: typeof thread.type === "string" ? thread.type : "",
    body: typeof thread.body === "string" ? thread.body : typeof thread.text === "string" ? thread.text : "",
    state: typeof thread.state === "string" ? thread.state : undefined,
  };
  if (!isCustomerVisibleThread(raw)) return null;
  const isCustomer = raw.type === "customer";
  const isCall = raw.type === "note";
  const createdBy = thread.createdBy && typeof thread.createdBy === "object" ? thread.createdBy as Record<string, unknown> : {};
  const customer = thread.customer && typeof thread.customer === "object" ? thread.customer as Record<string, unknown> : {};
  const first = String((isCustomer ? customer.firstName : createdBy.firstName) || "").trim();
  const last = String((isCustomer ? customer.lastName : createdBy.lastName) || "").trim();
  const senderName = `${first} ${last}`.trim() || (isCustomer ? "Customer" : "Dar Tahara Support");
  const attachmentRows = Array.isArray(thread.attachments) ? thread.attachments : [];
  return {
    id: String(thread.id || ""),
    type: isCall ? "call" : isCustomer ? "customer" : "support",
    body: providerBodyToText(isCall ? raw.body.replace(/^\[CUSTOMER_VISIBLE_CALL\]\s*/i, "") : raw.body),
    senderName,
    senderRole: isCall ? "Support call" : isCustomer ? "Customer" : "Dar Tahara Support",
    createdAt: String(thread.createdAt || thread.created_at || new Date().toISOString()),
    attachments: attachmentRows.map((value) => {
      const item = value as Record<string, unknown>;
      return {
        id: String(item.id || item.fileName || ""),
        fileName: String(item.fileName || item.filename || "attachment"),
        mimeType: String(item.mimeType || item.mime_type || "application/octet-stream"),
        size: Number(item.size || 0),
        ...(typeof item.url === "string" ? { url: item.url } : typeof item.fileUrl === "string" ? { url: item.fileUrl } : {}),
      };
    }),
    ...(isCall ? { callMetadata: { customerVisible: true } } : {}),
  };
}
