import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { buildFreeScoutBody, buildFreeScoutSubject, createFreeScoutTicket, validateFreeScoutBaseUrl, type FreeScoutTicketInput } from "./freescout";

const ORIGINAL = { ...process.env };
afterEach(() => {
  for (const key of Object.keys(process.env)) if (!(key in ORIGINAL)) delete process.env[key];
  Object.assign(process.env, ORIGINAL);
});

const input: FreeScoutTicketInput = {
  idempotencyKey: "whatsapp/00000000-0000-4000-8000-000000000001",
  category: "refund_or_payment_dispute",
  severity: "high",
  customerName: "Amina",
  customerEmail: "amina@example.com",
  whatsappReference: "abc123",
  preferredLanguage: "fr",
  city: "Tangier",
  propertyType: "Apartment",
  propertySize: "90 m²",
  cleaningFrequency: "biweekly",
  reason: "refund requested",
  latestQuestion: "Please review the charge.",
  summary: "Customer disputes a charge and requests human review.",
  transcript: "Customer: Please review the charge.",
  conversationId: "00000000-0000-4000-8000-000000000001",
  consentStatus: "granted",
  createdAt: "2026-07-14T12:00:00.000Z",
};

test("FreeScout ticket content separates customer data, bot summary and internal metadata", () => {
  assert.match(buildFreeScoutSubject(input), /^\[WhatsApp\] refund_or_payment_dispute – Amina – Tangier$/);
  const body = buildFreeScoutBody(input);
  assert.match(body, /CUSTOMER-PROVIDED INFORMATION/);
  assert.match(body, /BOT-GENERATED SUMMARY/);
  assert.match(body, /INTERNAL METADATA/);
  assert.match(body, /WHATSAPP TRANSCRIPT \(INTERNAL\)/);
});

test("FreeScout base URL rejects insecure and private SSRF targets", () => {
  assert.throws(() => validateFreeScoutBaseUrl("http://support.example.com"), /invalid_freescout_base_url/);
  assert.throws(() => validateFreeScoutBaseUrl("https://127.0.0.1"), /invalid_freescout_base_url/);
  assert.equal(validateFreeScoutBaseUrl("https://support.example.com/helpdesk").hostname, "support.example.com");
});

test("FreeScout API creates an email conversation with an internal note", async () => {
  process.env.FREESCOUT_BASE_URL = "https://support.example.com/";
  process.env.FREESCOUT_API_KEY = "test-api-key";
  process.env.FREESCOUT_MAILBOX_ID = "4";
  process.env.FREESCOUT_DEFAULT_ASSIGNEE_ID = "9";
  delete process.env.RESEND_API_KEY;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith("/35")) return new Response(JSON.stringify({ number: 812 }), { status: 200 });
    if (!init?.method) return new Response(JSON.stringify({ _embedded: { conversations: [] } }), { status: 200 });
    if (init.method === "POST") return new Response(null, { status: 201, headers: { "Resource-ID": "35" } });
    return new Response(null, { status: 500 });
  }) as typeof fetch;
  const result = await createFreeScoutTicket(input, mockFetch);
  assert.deepEqual(result, { method: "api", conversationId: "35", ticketNumber: "812", confirmationEmailSent: false });
  const create = calls.find((call) => call.init?.method === "POST");
  const body = JSON.parse(String(create?.init?.body));
  assert.equal(body.type, "email");
  assert.equal(body.customer.email, input.customerEmail);
  assert.equal(body.threads[0].type, "note");
  assert.equal(body.threads[1].type, "customer");
});

test("email-ingestion fallback uses Reply-To and an idempotency key", async () => {
  delete process.env.FREESCOUT_BASE_URL;
  delete process.env.FREESCOUT_API_KEY;
  process.env.FREESCOUT_SUPPORT_EMAIL = "support@example.com";
  process.env.FREESCOUT_FROM_EMAIL = "Dar Tahara <bot@example.com>";
  process.env.RESEND_API_KEY = "re_test";
  const calls: Array<RequestInit> = [];
  const mockFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    calls.push(init || {});
    return new Response(JSON.stringify({ id: `email-${calls.length}` }), { status: 200 });
  }) as typeof fetch;
  const result = await createFreeScoutTicket(input, mockFetch);
  assert.equal(result.method, "email");
  const request = JSON.parse(String(calls[0].body));
  assert.equal(request.reply_to, input.customerEmail);
  assert.match(String((calls[0].headers as Record<string, string>)["Idempotency-Key"]), /^freescout-ingestion\//);
});
