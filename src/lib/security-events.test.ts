import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSecurityEvent, emitSecurityEvent } from "./security-events";

test("security events are structured, UTC timestamped and metadata bounded", () => {
  const event = buildSecurityEvent({
    type: "authorization_denied",
    severity: "medium",
    actorId: "user-1",
    metadata: {
      route_class: "admin",
      ignored: { secret: true },
      long: "x".repeat(500),
      access_token: "must-not-survive",
      customer_email: "person@example.test",
    },
  }, new Date("2026-08-21T10:00:00Z"));
  assert.equal(event.occurredAt, "2026-08-21T10:00:00.000Z");
  assert.equal(event.metadata.route_class, "admin");
  assert.equal("ignored" in event.metadata, false);
  assert.equal("access_token" in event.metadata, false);
  assert.equal("customer_email" in event.metadata, false);
  assert.equal(String(event.metadata.long).length, 200);
  assert.match(event.eventId, /^[0-9a-f-]{36}$/);
});

test("external security delivery uses the configured bearer token", async () => {
  const priorUrl = process.env.SECURITY_LOG_SINK_URL;
  const priorToken = process.env.SECURITY_EVENT_DELIVERY_TOKEN;
  const priorFetch = globalThis.fetch;
  let authorization: string | null = null;
  process.env.SECURITY_LOG_SINK_URL = "https://security-sink.example.test/events";
  process.env.SECURITY_EVENT_DELIVERY_TOKEN = "delivery-token-with-at-least-thirty-two-characters";
  globalThis.fetch = async (_input, init) => {
    authorization = new Headers(init?.headers).get("authorization");
    return new Response(null, { status: 202 });
  };
  try {
    await emitSecurityEvent({ type: "control_drift_detected", severity: "low" });
    assert.equal(authorization, `Bearer ${process.env.SECURITY_EVENT_DELIVERY_TOKEN}`);
  } finally {
    globalThis.fetch = priorFetch;
    if (priorUrl === undefined) delete process.env.SECURITY_LOG_SINK_URL;
    else process.env.SECURITY_LOG_SINK_URL = priorUrl;
    if (priorToken === undefined) delete process.env.SECURITY_EVENT_DELIVERY_TOKEN;
    else process.env.SECURITY_EVENT_DELIVERY_TOKEN = priorToken;
  }
});
