import assert from "node:assert/strict";
import test from "node:test";
import { addCustomerReply, createSupportConversation, getSupportConversation } from "./client";

function configure() {
  process.env.HOSPITALITY_SUPPORT_BASE_URL = "https://support.example.com/";
  process.env.HOSPITALITY_SUPPORT_API_TOKEN = "test-token";
  process.env.HOSPITALITY_SUPPORT_MAILBOX_ID = "4";
  process.env.HOSPITALITY_SUPPORT_DEFAULT_ASSIGNEE_ID = "9";
}

function cleanup() {
  delete process.env.HOSPITALITY_SUPPORT_BASE_URL;
  delete process.env.HOSPITALITY_SUPPORT_API_TOKEN;
  delete process.env.HOSPITALITY_SUPPORT_MAILBOX_ID;
  delete process.env.HOSPITALITY_SUPPORT_DEFAULT_ASSIGNEE_ID;
}

test("creates one FreeScout conversation with customer text, internal metadata and attachments", async () => {
  configure();
  const calls: Array<{ url:string; init:RequestInit }> = [];
  const mockFetch = async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.includes("api/conversations?subject=")) return new Response(JSON.stringify({ _embedded:{ conversations:[] } }), { status:200 });
    if (url.endsWith("api/conversations")) return new Response(null, { status:201, headers:{ "resource-id":"88" } });
    return new Response(JSON.stringify({ id:88, number:184, status:"active", subject:"Ticket", _embedded:{ threads:[] } }), { status:200 });
  };
  const created = await createSupportConversation({
    subject:"Broken lock", description:"The keypad is blank", customerName:"Amina", customerEmail:"amina@example.com",
    customerAccountId:"customer-1", customerReference:"customer-1", category:"smart_lock", preferredLanguage:"fr",
    externalReference:"DT-SUPPORT-customer-1-request-1", publicReference:"DT-2026-000184", portalUrl:"https://dartahara.com/account/support/request-1", relatedContext:{ propertyAddress:"Tangier" },
    attachments:[{ fileName:"photo.jpg", mimeType:"image/jpeg", data:"aGVsbG8=", size:5 }],
  }, mockFetch as typeof fetch);
  assert.equal(created.conversationId, "88");
  assert.equal(created.ticketNumber, "184");
  const createCall = calls.find((call) => call.url.endsWith("api/conversations"));
  const body = JSON.parse(String(createCall?.init.body));
  assert.equal(body.threads[0].type, "note");
  assert.equal(body.threads[1].type, "customer");
  assert.equal(body.threads[1].text, "The keypad is blank");
  assert.equal(body.threads[1].attachments[0].data, "aGVsbG8=");
  cleanup();
});

test("customer replies are appended to the same conversation and reactivate it", async () => {
  configure();
  let calledUrl = "";
  let body: Record<string, unknown> = {};
  const mockFetch = async (input: string | URL | Request, init: RequestInit = {}) => {
    calledUrl = String(input);
    body = JSON.parse(String(init.body));
    return new Response(null, { status:201, headers:{ "resource-id":"thread-9" } });
  };
  const id = await addCustomerReply({ conversationId:"88", customerEmail:"amina@example.com", customerName:"Amina", text:"Any update?", attachments:[], reopen:true }, mockFetch as typeof fetch);
  assert.match(calledUrl, /api\/conversations\/88\/threads$/);
  assert.equal(body.type, "customer");
  assert.equal(body.status, "active");
  assert.equal(id, "thread-9");
  cleanup();
});

test("conversation reads filter internal notes while preserving visible calls", async () => {
  configure();
  const mockFetch = async () => new Response(JSON.stringify({
    id:88, number:184, status:"pending", subject:"Lock", updatedAt:"2026-08-01T11:00:00Z",
    _embedded:{ threads:[
      { id:1, type:"customer", body:"Help", state:"published", createdAt:"2026-08-01T09:00:00Z" },
      { id:2, type:"note", body:"Private escalation", state:"published", createdAt:"2026-08-01T10:00:00Z" },
      { id:3, type:"note", body:"[CUSTOMER_VISIBLE_CALL] Called customer", state:"published", createdAt:"2026-08-01T10:30:00Z" },
    ] },
  }), { status:200 });
  const conversation = await getSupportConversation("88", mockFetch as typeof fetch);
  assert.deepEqual(conversation.threads.map((thread) => thread.id), ["1","3"]);
  assert.equal(conversation.threads[1].type, "call");
  cleanup();
});
