import { createHmac } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decryptSensitive,
  encryptSensitive,
  hashWhatsAppIdentifier,
  redactSensitiveText,
  secureTokenEqual,
  verifyMetaSignature,
} from "./security";

test("Meta webhook signatures are verified in constant-time compatible form", () => {
  const raw = JSON.stringify({ object: "whatsapp_business_account" });
  const secret = "test-meta-secret";
  const signature = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
  assert.equal(verifyMetaSignature(raw, signature, secret), true);
  assert.equal(verifyMetaSignature(`${raw} `, signature, secret), false);
  assert.equal(verifyMetaSignature(raw, null, secret), false);
  assert.equal(verifyMetaSignature(raw, "sha256=abc", secret), false);
});

test("webhook verification token comparison rejects missing and altered values", () => {
  assert.equal(secureTokenEqual("expected", "expected"), true);
  assert.equal(secureTokenEqual("Expected", "expected"), false);
  assert.equal(secureTokenEqual(null, "expected"), false);
});

test("WhatsApp identifiers are HMACed and sensitive text is AES-GCM encrypted", () => {
  const encryptionSecret = "a sufficiently long independent encryption secret";
  const encrypted = encryptSensitive("+212600000000", encryptionSecret);
  assert.doesNotMatch(encrypted, /212600000000/);
  assert.equal(decryptSensitive(encrypted, encryptionSecret), "+212600000000");
  assert.equal(hashWhatsAppIdentifier("212600000000", "hash-secret"), hashWhatsAppIdentifier("212600000000", "hash-secret"));
  assert.notEqual(hashWhatsAppIdentifier("212600000000", "hash-secret"), hashWhatsAppIdentifier("212600000001", "hash-secret"));
});

test("payment data, passwords and likely access codes are redacted", () => {
  const redacted = redactSensitiveText("125 m² costs 140; card 4242 4242 4242 4242 CVV 123 password=hunter2 lock 998877");
  assert.doesNotMatch(redacted, /4242 4242/);
  assert.doesNotMatch(redacted, /hunter2/);
  assert.doesNotMatch(redacted, /998877/);
  assert.match(redacted, /125 m² costs 140/);
});
