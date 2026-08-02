import "server-only";

import { randomUUID } from "node:crypto";
import { validateFreeScoutBaseUrl } from "@/lib/whatsapp/freescout";
import { buildPortalMetadataNote, mapFreeScoutThread } from "./ticket-mapper";
import type {
  AddCustomerReplyInput,
  CreateConversationInput,
  CreatedConversation,
  HospitalityConversation,
} from "./types";

type ProviderConfig = {
  baseUrl: URL;
  apiKey: string;
  mailboxId: number;
  assigneeId?: number;
  timeoutMs: number;
};

function positiveInt(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function hospitalitySupportConfigured(): boolean {
  return Boolean(
    (process.env.HOSPITALITY_SUPPORT_BASE_URL || process.env.FREESCOUT_BASE_URL) &&
    (process.env.HOSPITALITY_SUPPORT_API_TOKEN || process.env.FREESCOUT_API_KEY) &&
    positiveInt(process.env.HOSPITALITY_SUPPORT_MAILBOX_ID || process.env.FREESCOUT_MAILBOX_ID),
  );
}

function config(): ProviderConfig {
  const base = process.env.HOSPITALITY_SUPPORT_BASE_URL || process.env.FREESCOUT_BASE_URL;
  const apiKey = process.env.HOSPITALITY_SUPPORT_API_TOKEN || process.env.FREESCOUT_API_KEY;
  const mailboxId = positiveInt(process.env.HOSPITALITY_SUPPORT_MAILBOX_ID || process.env.FREESCOUT_MAILBOX_ID);
  const assigneeId = positiveInt(process.env.HOSPITALITY_SUPPORT_DEFAULT_ASSIGNEE_ID || process.env.FREESCOUT_DEFAULT_ASSIGNEE_ID);
  if (!base || !apiKey || !mailboxId) throw new Error("hospitality_support_not_configured");
  return {
    baseUrl: validateFreeScoutBaseUrl(base),
    apiKey,
    mailboxId,
    assigneeId,
    timeoutMs: Math.max(1_000, Math.min(Number(process.env.HOSPITALITY_SUPPORT_TIMEOUT_MS) || 12_000, 30_000)),
  };
}

function apiUrl(path: string, provider: ProviderConfig): URL {
  return new URL(path.replace(/^\//, ""), provider.baseUrl.href.endsWith("/") ? provider.baseUrl : `${provider.baseUrl.href}/`);
}

function retryAfterMs(response: Response): number {
  const value = response.headers.get("retry-after");
  if (!value) return 500;
  const seconds = Number(value);
  return Number.isFinite(seconds) ? Math.min(seconds * 1_000, 2_000) : 500;
}

async function providerRequest(
  path: string,
  init: RequestInit,
  options: { safe?: boolean; correlationId?: string } = {},
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const provider = config();
  const correlationId = options.correlationId || randomUUID();
  const maxAttempts = options.safe ? 3 : 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), provider.timeoutMs);
    try {
      const response = await fetchImpl(apiUrl(path, provider), {
        ...init,
        headers: {
          "X-FreeScout-API-Key": provider.apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Correlation-ID": correlationId,
          ...(init.headers || {}),
        },
        signal: controller.signal,
        cache: "no-store",
      });
      if (response.ok) return response;
      if (attempt < maxAttempts && (response.status === 429 || response.status >= 500)) {
        await new Promise((resolve) => setTimeout(resolve, retryAfterMs(response)));
        continue;
      }
      throw new Error(`hospitality_support_http_${response.status}`);
    } catch (error) {
      if (attempt >= maxAttempts) {
        if (error instanceof Error && error.name === "AbortError") throw new Error("hospitality_support_timeout");
        throw error;
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error("hospitality_support_unavailable");
}

async function json<T>(response: Response): Promise<T> {
  return await response.json().catch(() => ({})) as T;
}

export async function createSupportConversation(
  input: CreateConversationInput,
  fetchImpl: typeof fetch = fetch,
): Promise<CreatedConversation> {
  const provider = config();
  const subject = `[${input.publicReference}] ${input.subject}`.slice(0, 190);
  const search = `api/conversations?subject=${encodeURIComponent(input.publicReference)}&customerEmail=${encodeURIComponent(input.customerEmail)}&status=active,pending,closed&pageSize=10`;
  const existingResponse = await providerRequest(search, { method: "GET" }, { safe: true }, fetchImpl).catch(() => null);
  if (existingResponse) {
    const existing = await json<{ _embedded?: { conversations?: Array<Record<string, unknown>> } }>(existingResponse);
    const match = existing._embedded?.conversations?.find((row) => String(row.subject || "").includes(input.publicReference));
    if (match?.id) {
      return {
        conversationId: String(match.id),
        ticketNumber: match.number ? String(match.number) : null,
        customerId: null,
      };
    }
  }

  const customerThread: Record<string, unknown> = {
    type: "customer",
    text: input.description,
    customer: { email: input.customerEmail, firstName: input.customerName },
    attachments: input.attachments.map((attachment) => ({
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      data: attachment.data,
    })),
  };
  const threads: Array<Record<string, unknown>> = [customerThread];
  if (provider.assigneeId) {
    threads.unshift({ type: "note", text: buildPortalMetadataNote(input), user: provider.assigneeId });
  }
  const response = await providerRequest("api/conversations", {
    method: "POST",
    body: JSON.stringify({
      type: "email",
      mailboxId: provider.mailboxId,
      subject,
      customer: { email: input.customerEmail, firstName: input.customerName },
      threads,
      imported: false,
      ...(provider.assigneeId ? { assignTo: provider.assigneeId } : {}),
      status: "active",
      tags: ["dar-tahara-portal", input.category],
    }),
  }, {}, fetchImpl);
  const conversationId = response.headers.get("resource-id");
  if (!conversationId) throw new Error("hospitality_support_missing_resource_id");
  const conversation = await getSupportConversation(conversationId, fetchImpl).catch(() => null);
  return {
    conversationId,
    ticketNumber: conversation?.number || null,
    customerId: conversation?.customerId || null,
  };
}

export async function addCustomerReply(
  input: AddCustomerReplyInput,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const response = await providerRequest(`api/conversations/${encodeURIComponent(input.conversationId)}/threads`, {
    method: "POST",
    body: JSON.stringify({
      type: "customer",
      text: input.text,
      customer: { email: input.customerEmail, firstName: input.customerName },
      imported: false,
      state: "published",
      status: "active",
      attachments: input.attachments.map((attachment) => ({
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        data: attachment.data,
      })),
    }),
  }, {}, fetchImpl);
  return response.headers.get("resource-id") || `customer-${randomUUID()}`;
}

export async function reopenConversation(conversationId: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  await providerRequest(`api/conversations/${encodeURIComponent(conversationId)}`, {
    method: "PUT",
    body: JSON.stringify({ status: "active" }),
  }, {}, fetchImpl);
}

export async function getSupportConversation(
  conversationId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<HospitalityConversation> {
  const response = await providerRequest(
    `api/conversations/${encodeURIComponent(conversationId)}?embed=threads,tags`,
    { method: "GET" },
    { safe: true },
    fetchImpl,
  );
  const data = await json<Record<string, unknown>>(response);
  const embedded = data._embedded && typeof data._embedded === "object" ? data._embedded as Record<string, unknown> : {};
  const threadRows = Array.isArray(embedded.threads) ? embedded.threads : Array.isArray(data.threads) ? data.threads : [];
  const tags = Array.isArray(data.tags) ? data.tags : Array.isArray(embedded.tags) ? embedded.tags : [];
  const customer = data.customer && typeof data.customer === "object" ? data.customer as Record<string, unknown> : {};
  const assignee = data.assignee && typeof data.assignee === "object" ? data.assignee as Record<string, unknown> : {};
  const mailbox = data.mailbox && typeof data.mailbox === "object" ? data.mailbox as Record<string, unknown> : {};
  return {
    id: String(data.id || conversationId),
    number: data.number ? String(data.number) : null,
    customerId: customer.id ? String(customer.id) : null,
    subject: String(data.subject || ""),
    status: String(data.status || "active"),
    mailboxName: typeof mailbox.name === "string" ? mailbox.name : process.env.HOSPITALITY_SUPPORT_DEPARTMENT_NAME || null,
    assigneeName: `${String(assignee.firstName || "")} ${String(assignee.lastName || "")}`.trim() || null,
    updatedAt: String(data.updatedAt || data.updated_at || new Date().toISOString()),
    createdAt: String(data.createdAt || data.created_at || new Date().toISOString()),
    tags: tags.map((tag) => typeof tag === "string" ? tag : String((tag as Record<string, unknown>).name || "")).filter(Boolean),
    threads: threadRows.map((thread) => mapFreeScoutThread(thread as Record<string, unknown>)).filter((thread): thread is NonNullable<typeof thread> => Boolean(thread)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export async function listCustomerConversations(customerEmail: string, fetchImpl: typeof fetch = fetch): Promise<HospitalityConversation[]> {
  const response = await providerRequest(
    `api/conversations?customerEmail=${encodeURIComponent(customerEmail)}&status=active,pending,closed&sortField=updatedAt&sortOrder=desc&pageSize=100`,
    { method: "GET" },
    { safe: true },
    fetchImpl,
  );
  const data = await json<{ _embedded?: { conversations?: Array<Record<string, unknown>> } }>(response);
  return await Promise.all((data._embedded?.conversations || []).map((row) => getSupportConversation(String(row.id), fetchImpl)));
}

export async function downloadSupportAttachment(externalUrl: string, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const provider = config();
  const target = new URL(externalUrl);
  if (target.origin !== provider.baseUrl.origin || target.username || target.password) {
    throw new Error("hospitality_support_attachment_url_rejected");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), provider.timeoutMs);
  try {
    const response = await fetchImpl(target, {
      headers: { "X-FreeScout-API-Key": provider.apiKey, Accept: "*/*" },
      signal: controller.signal,
      cache: "no-store",
      redirect: "manual",
    });
    if (!response.ok) throw new Error(`hospitality_support_http_${response.status}`);
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
