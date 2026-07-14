import "server-only";
import { safeError } from "./security";

export type FreeScoutTicketInput = {
  idempotencyKey: string;
  category: string;
  severity: "low" | "normal" | "high" | "urgent";
  customerName: string;
  customerEmail: string;
  whatsappReference: string;
  preferredLanguage: string;
  city?: string | null;
  propertyType?: string | null;
  propertySize?: string | null;
  cleaningFrequency?: string | null;
  reason: string;
  latestQuestion: string;
  summary: string;
  transcript: string;
  conversationId: string;
  consentStatus: string;
  createdAt: string;
};

export type FreeScoutTicketResult = {
  method: "api" | "email";
  conversationId: string;
  ticketNumber: string | null;
  confirmationEmailSent: boolean;
};

function numberEnv(name: string): number | undefined {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

export function validateFreeScoutBaseUrl(value: string): URL {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  const privateHost = hostname === "localhost" || hostname === "::1" || hostname.endsWith(".local") ||
    /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  if (url.protocol !== "https:" || privateHost || url.username || url.password) {
    throw new Error("invalid_freescout_base_url");
  }
  return url;
}

export function freeScoutMode(): "api" | "email" | "unconfigured" {
  if (process.env.FREESCOUT_BASE_URL && process.env.FREESCOUT_API_KEY && numberEnv("FREESCOUT_MAILBOX_ID") && numberEnv("FREESCOUT_DEFAULT_ASSIGNEE_ID")) return "api";
  if (process.env.FREESCOUT_SUPPORT_EMAIL && process.env.FREESCOUT_FROM_EMAIL && process.env.RESEND_API_KEY) return "email";
  return "unconfigured";
}

function clean(value: string | null | undefined, fallback = "Not provided"): string {
  return value?.trim() ? value.trim().slice(0, 2000) : fallback;
}

export function buildFreeScoutSubject(input: FreeScoutTicketInput): string {
  return `[WhatsApp] ${clean(input.category, "Support")} – ${clean(input.customerName, "WhatsApp contact")} – ${clean(input.city, "City not provided")}`.slice(0, 190);
}

export function buildFreeScoutBody(input: FreeScoutTicketInput): string {
  return [
    "CUSTOMER-PROVIDED INFORMATION",
    `Name: ${clean(input.customerName)}`,
    `Email: ${clean(input.customerEmail)}`,
    `WhatsApp reference: ${clean(input.whatsappReference)}`,
    `Preferred language: ${clean(input.preferredLanguage)}`,
    `City: ${clean(input.city)}`,
    `Property type: ${clean(input.propertyType)}`,
    `Property size: ${clean(input.propertySize)}`,
    `Cleaning frequency: ${clean(input.cleaningFrequency)}`,
    `Latest question: ${clean(input.latestQuestion)}`,
    "",
    "BOT-GENERATED SUMMARY",
    clean(input.summary),
    "",
    "INTERNAL METADATA",
    `Reason: ${clean(input.reason)}`,
    `Suggested priority: ${input.severity}`,
    `Internal conversation reference: ${input.conversationId}`,
    `Consent/notification status: ${clean(input.consentStatus)}`,
    `Date and time: ${input.createdAt}`,
    `Idempotency reference: ${input.idempotencyKey}`,
    "",
    "WHATSAPP TRANSCRIPT (INTERNAL)",
    clean(input.transcript),
  ].join("\n");
}

async function request(
  url: URL,
  init: RequestInit,
  fetchImpl: typeof fetch,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

async function sendConfirmationEmail(input: FreeScoutTicketInput, fetchImpl: typeof fetch): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FREESCOUT_FROM_EMAIL || process.env.MAILING_FROM_EMAIL;
  if (!apiKey || !from) return false;
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `whatsapp-confirmation/${input.idempotencyKey}`.slice(0, 256),
    },
    body: JSON.stringify({
      from,
      to: [input.customerEmail],
      subject: "Dar Tahara support request received",
      text: "Dar Tahara has received your support request from WhatsApp. Our team will continue the human-support conversation by email. Please reply to the support email you receive; replies are not automatically relayed to WhatsApp.",
    }),
    cache: "no-store",
  });
  return response.ok;
}

async function createViaApi(input: FreeScoutTicketInput, fetchImpl: typeof fetch): Promise<FreeScoutTicketResult> {
  const base = validateFreeScoutBaseUrl(process.env.FREESCOUT_BASE_URL as string);
  const apiKey = process.env.FREESCOUT_API_KEY as string;
  const mailboxId = numberEnv("FREESCOUT_MAILBOX_ID") as number;
  const assignee = numberEnv("FREESCOUT_DEFAULT_ASSIGNEE_ID");
  const subject = buildFreeScoutSubject(input);
  const search = new URL("api/conversations", base.href.endsWith("/") ? base : `${base.href}/`);
  search.searchParams.set("customerEmail", input.customerEmail);
  search.searchParams.set("subject", subject);
  search.searchParams.set("pageSize", "10");
  const headers = { "X-FreeScout-API-Key": apiKey, Accept: "application/json", "Content-Type": "application/json" };

  const existingResponse = await request(search, { headers }, fetchImpl);
  if (existingResponse.ok) {
    const existing = (await existingResponse.json().catch(() => ({}))) as {
      _embedded?: { conversations?: Array<{ id?: number; number?: number; subject?: string }> };
    };
    const match = existing._embedded?.conversations?.find((item) => item.subject === subject);
    if (match?.id) {
      return {
        method: "api",
        conversationId: String(match.id),
        ticketNumber: match.number ? String(match.number) : null,
        confirmationEmailSent: await sendConfirmationEmail(input, fetchImpl).catch(() => false),
      };
    }
  }

  const body = buildFreeScoutBody(input);
  const threads: Array<Record<string, unknown>> = [
    { type: "customer", text: clean(input.latestQuestion), customer: { email: input.customerEmail, firstName: input.customerName } },
  ];
  if (assignee) threads.unshift({ type: "note", text: body, user: assignee });
  const createUrl = new URL("api/conversations", base.href.endsWith("/") ? base : `${base.href}/`);
  const createResponse = await request(createUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "email",
      mailboxId,
      subject,
      customer: { email: input.customerEmail, firstName: input.customerName },
      threads,
      imported: false,
      ...(assignee ? { assignTo: assignee } : {}),
      status: "active",
    }),
  }, fetchImpl);
  if (!createResponse.ok) throw new Error(`freescout_http_${createResponse.status}`);
  const resourceId = createResponse.headers.get("resource-id");
  if (!resourceId) throw new Error("freescout_missing_resource_id");

  let ticketNumber: string | null = null;
  const detailUrl = new URL(`api/conversations/${encodeURIComponent(resourceId)}`, base.href.endsWith("/") ? base : `${base.href}/`);
  const detailResponse = await request(detailUrl, { headers }, fetchImpl).catch(() => null);
  if (detailResponse?.ok) {
    const detail = (await detailResponse.json().catch(() => ({}))) as { number?: number };
    ticketNumber = detail.number ? String(detail.number) : null;
  }
  return {
    method: "api",
    conversationId: resourceId,
    ticketNumber,
    confirmationEmailSent: await sendConfirmationEmail(input, fetchImpl).catch(() => false),
  };
}

async function createViaEmail(input: FreeScoutTicketInput, fetchImpl: typeof fetch): Promise<FreeScoutTicketResult> {
  const apiKey = process.env.RESEND_API_KEY as string;
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `freescout-ingestion/${input.idempotencyKey}`.slice(0, 256),
    },
    body: JSON.stringify({
      from: process.env.FREESCOUT_FROM_EMAIL,
      to: [process.env.FREESCOUT_SUPPORT_EMAIL],
      reply_to: input.customerEmail,
      subject: buildFreeScoutSubject(input),
      text: buildFreeScoutBody(input),
    }),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok || !data.id) throw new Error(`freescout_email_failed:${safeError(data.message)}`);
  return {
    method: "email",
    conversationId: `email:${data.id}`,
    ticketNumber: null,
    confirmationEmailSent: await sendConfirmationEmail(input, fetchImpl).catch(() => false),
  };
}

export async function createFreeScoutTicket(
  input: FreeScoutTicketInput,
  fetchImpl: typeof fetch = fetch,
): Promise<FreeScoutTicketResult> {
  const mode = freeScoutMode();
  if (mode === "api") return createViaApi(input, fetchImpl);
  if (mode === "email") return createViaEmail(input, fetchImpl);
  throw new Error("freescout_not_configured");
}
