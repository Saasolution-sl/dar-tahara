import assert from "node:assert/strict";
import test from "node:test";
import { buildPortalMetadataNote, isCustomerVisibleThread, mapFreeScoutThread } from "./ticket-mapper";

test("internal notes and drafts never become portal messages", () => {
  assert.equal(isCustomerVisibleThread({ type:"note", body:"Escalate internally" }), false);
  assert.equal(isCustomerVisibleThread({ type:"message", body:"Draft", state:"draft" }), false);
  assert.equal(isCustomerVisibleThread({ type:"customer", body:"Help", state:"published" }), true);
});

test("only explicitly customer-visible call notes are exposed", () => {
  const hidden = mapFreeScoutThread({ id:1, type:"note", body:"Private QA score", state:"published" });
  const visible = mapFreeScoutThread({ id:2, type:"note", body:"[CUSTOMER_VISIBLE_CALL] We agreed to call Monday.", state:"published", createdAt:"2026-08-01T10:00:00Z" });
  assert.equal(hidden, null);
  assert.equal(visible?.type, "call");
  assert.equal(visible?.body, "We agreed to call Monday.");
});

test("provider HTML is converted to readable text and never interpreted as portal markup", () => {
  const message = mapFreeScoutThread({ id:3, type:"message", body:"<p>Hello &amp; welcome</p><script>alert(1)</script>", state:"published" });
  assert.equal(message?.body, "Hello & welcome\n\nalert(1)");
});

test("provider payload mapping separates customer text from internal account metadata", () => {
  const note = buildPortalMetadataNote({
    subject:"Broken lock", description:"The keypad is blank", customerName:"Amina", customerEmail:"amina@example.com",
    customerAccountId:"customer-1", customerReference:"customer-1", category:"smart_lock", preferredLanguage:"fr",
    externalReference:"DT-SUPPORT-customer-1-request-1", publicReference:"DT-2026-000184", portalUrl:"https://dartahara.com/account/support/request-1", relatedContext:{ propertyAddress:"Tangier" }, attachments:[],
  });
  assert.match(note, /INTERNAL/);
  assert.match(note, /DT-2026-000184/);
  assert.doesNotMatch(note, /keypad is blank/i);
});
