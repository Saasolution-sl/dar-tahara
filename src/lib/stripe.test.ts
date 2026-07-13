import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyStripeSignature } from "./stripe";

test("Stripe webhook signatures verify against the unmodified raw body", () => {
  const body = JSON.stringify({ id: "evt_123", type: "checkout.session.completed" });
  const timestamp = 1_750_000_000;
  const secret = "whsec_test_value";
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  assert.equal(
    verifyStripeSignature(body, `t=${timestamp},v1=${signature}`, secret, timestamp * 1000),
    true,
  );
  assert.equal(
    verifyStripeSignature(`${body} `, `t=${timestamp},v1=${signature}`, secret, timestamp * 1000),
    false,
  );
});

test("Stripe webhook signatures reject stale timestamps", () => {
  const body = "{}";
  const secret = "whsec_test_value";
  const signature = createHmac("sha256", secret).update(`100.${body}`).digest("hex");
  assert.equal(verifyStripeSignature(body, `t=100,v1=${signature}`, secret, 1_000_000), false);
});
