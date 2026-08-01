import assert from "node:assert/strict";
import test from "node:test";
import { parseHospitalityWebhook } from "./sync";

test("webhook event parsing produces a stable idempotency identity", () => {
  const payload = { event:"convo.agent.reply.created", id:"evt-1", data:{ conversationId:42 } };
  assert.deepEqual(parseHospitalityWebhook(payload, JSON.stringify(payload)), {
    eventId:"evt-1", eventType:"convo.agent.reply.created", conversationId:"42",
  });
  const first = parseHospitalityWebhook({ type:"convo.status", conversation:{ id:42 } }, "same-body");
  const second = parseHospitalityWebhook({ type:"convo.status", conversation:{ id:42 } }, "same-body");
  assert.equal(first.eventId, second.eventId);
});

test("native FreeScout headers treat the root object as the conversation", () => {
  const rawBody = JSON.stringify({ id:42, number:184, status:"pending", updatedAt:"2026-08-01T12:00:00Z" });
  const event = parseHospitalityWebhook(JSON.parse(rawBody), rawBody, "convo.agent.reply.created");
  assert.equal(event.eventType, "convo.agent.reply.created");
  assert.equal(event.conversationId, "42");
  assert.match(event.eventId, /^convo\.agent\.reply\.created:42:[a-f0-9]{64}$/);
});
