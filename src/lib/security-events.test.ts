import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSecurityEvent } from "./security-events";

test("security events are structured, UTC timestamped and metadata bounded", () => {
  const event = buildSecurityEvent({
    type: "authorization_denied",
    severity: "medium",
    actorId: "user-1",
    metadata: { route_class: "admin", ignored: { secret: true }, long: "x".repeat(500) },
  }, new Date("2026-08-21T10:00:00Z"));
  assert.equal(event.occurredAt, "2026-08-21T10:00:00.000Z");
  assert.equal(event.metadata.route_class, "admin");
  assert.equal("ignored" in event.metadata, false);
  assert.equal(String(event.metadata.long).length, 200);
  assert.match(event.eventId, /^[0-9a-f-]{36}$/);
});
