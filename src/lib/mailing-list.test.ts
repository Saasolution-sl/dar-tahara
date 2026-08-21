import { test } from "node:test";
import assert from "node:assert/strict";
import { clientIpFromHeaders, normalizeEmail, isValidEmail, validateSubscribe, rateLimit } from "./mailing-list";

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Test.User@Example.COM "), "test.user@example.com");
});

test("isValidEmail accepts valid, rejects invalid", () => {
  assert.ok(isValidEmail("a@b.co"));
  assert.ok(isValidEmail(" Name.Surname@sub.domain.com "));
  assert.ok(!isValidEmail("not-an-email"));
  assert.ok(!isValidEmail("missing@dot"));
  assert.ok(!isValidEmail("@no-local.com"));
  assert.ok(!isValidEmail("spaces in@x.com"));
  assert.ok(!isValidEmail(""));
});

test("validateSubscribe: valid payload normalises fields", () => {
  const r = validateSubscribe({
    email: " USER@Example.com ",
    language: "nl",
    country: "nl",
    source: "homepage_footer",
    consent: true,
    firstName: "  Sam  ",
  });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.value.email, "user@example.com");
    assert.equal(r.value.countryCode, "NL");
    assert.equal(r.value.signupSource, "homepage_footer");
    assert.equal(r.value.firstName, "Sam");
  }
});

test("validateSubscribe: invalid email rejected", () => {
  const r = validateSubscribe({ email: "nope", consent: true });
  assert.deepEqual(r, { ok: false, error: "invalid_email" });
});

test("validateSubscribe: consent required (no pre-checked box)", () => {
  const r = validateSubscribe({ email: "a@b.co", consent: false });
  assert.deepEqual(r, { ok: false, error: "consent_required" });
});

test("validateSubscribe: unknown source falls back to homepage_popup", () => {
  const r = validateSubscribe({ email: "a@b.co", consent: true, source: "evil" });
  assert.ok(r.ok && r.value.signupSource === "homepage_popup");
});

test("validateSubscribe: bad body rejected", () => {
  assert.equal(validateSubscribe(null).ok, false);
  assert.equal(validateSubscribe("x").ok, false);
});

test("rateLimit allows a burst then blocks", () => {
  const key = `test-${Math.random()}`;
  const t0 = 1_000_000;
  for (let i = 0; i < 5; i++) {
    assert.equal(rateLimit(key, t0).allowed, true, `hit ${i} should pass`);
  }
  const blocked = rateLimit(key, t0);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterMs > 0);
  // After the window it resets.
  assert.equal(rateLimit(key, t0 + 61_000).allowed, true);
});

test("rateLimit supports a scoped higher-frequency policy", () => {
  const key = `autosave-${Math.random()}`;
  const t0 = Date.now();
  for (let i = 0; i < 20; i++) {
    assert.equal(rateLimit(key, t0, { windowMs: 60_000, max: 20 }).allowed, true);
  }
  assert.equal(rateLimit(key, t0, { windowMs: 60_000, max: 20 }).allowed, false);
});

test("client IP uses the trusted right-hand proxy hop, not a spoofed first value", () => {
  const headers = new Headers({ "x-forwarded-for": "198.51.100.99, 203.0.113.8" });
  assert.equal(clientIpFromHeaders(headers), "203.0.113.8");
});

test("client IP rejects malformed and out-of-range proxy values", () => {
  assert.equal(clientIpFromHeaders(new Headers({ "x-forwarded-for": "attacker" })), "unknown");
  assert.equal(clientIpFromHeaders(new Headers({ "x-forwarded-for": "999.2.3.4" })), "unknown");
  assert.equal(clientIpFromHeaders(new Headers({ "x-forwarded-for": "2001:db8:::1" })), "unknown");
});
