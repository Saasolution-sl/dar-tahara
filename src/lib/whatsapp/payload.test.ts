import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMetaWebhook } from "./payload";

test("Meta payload parser handles text, button, list, media and delivery statuses", () => {
  const events = parseMetaWebhook({
    object: "whatsapp_business_account",
    entry: [{ changes: [{ value: {
      contacts: [{ wa_id: "212600000000", profile: { name: "Amina" } }],
      messages: [
        { id: "m1", from: "212600000000", type: "text", text: { body: "Salam" }, timestamp: "1" },
        { id: "m2", from: "212600000000", type: "button", button: { text: "Support" }, timestamp: "2" },
        { id: "m3", from: "212600000000", type: "interactive", interactive: { list_reply: { id: "pricing", title: "Pricing" } }, timestamp: "3" },
        { id: "m4", from: "212600000000", type: "image", image: { id: "media" }, timestamp: "4" },
      ],
      statuses: [{ id: "out1", status: "delivered", recipient_id: "212600000000", timestamp: "5" }],
    } }] }],
  });
  assert.equal(events.length, 5);
  assert.deepEqual(events.slice(0, 4).map((event) => event.kind === "message" ? event.text : null), ["Salam", "Support", "Pricing", null]);
  assert.equal(events[3].kind === "message" && events[3].messageType, "image");
  assert.equal(events[4].kind === "status" && events[4].status, "delivered");
});

test("malformed and unsupported webhook objects are ignored safely", () => {
  assert.deepEqual(parseMetaWebhook(null), []);
  assert.deepEqual(parseMetaWebhook({ object: "instagram", entry: [] }), []);
  assert.deepEqual(parseMetaWebhook({ entry: [{ changes: [{ value: { messages: [{ id: "missing-sender" }] } }] }] }), []);
});
