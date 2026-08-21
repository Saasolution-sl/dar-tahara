import assert from "node:assert/strict";
import { test } from "node:test";
import { rateLimitKeyDigest } from "./rate-limit";

test("shared rate-limit keys are stable HMAC digests without raw identifiers", () => {
  const secret = "a".repeat(32);
  const key = "login:203.0.113.8";
  const digest = rateLimitKeyDigest(key, secret);
  assert.match(digest, /^[0-9a-f]{64}$/);
  assert.equal(digest.includes("203.0.113.8"), false);
  assert.equal(digest, rateLimitKeyDigest(key, secret));
  assert.notEqual(digest, rateLimitKeyDigest(key, "b".repeat(32)));
});

test("shared rate-limit HMAC requires a strong deployment secret", () => {
  assert.throws(() => rateLimitKeyDigest("login:test", "short"), /too_short/);
});
