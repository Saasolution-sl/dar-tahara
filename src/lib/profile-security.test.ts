import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanCountryCode,
  cleanProfileText,
  validatePaymentCredentials,
} from "./profile-security";

test("payment details require the signed-in email and a plausible password", () => {
  assert.deepEqual(
    validatePaymentCredentials({
      accountEmail: "Customer@Example.com",
      enteredEmail: " customer@example.com ",
      password: "correct-password",
    }),
    {
      ok: true,
      email: "customer@example.com",
      password: "correct-password",
    },
  );

  assert.deepEqual(
    validatePaymentCredentials({
      accountEmail: "customer@example.com",
      enteredEmail: "other@example.com",
      password: "correct-password",
    }),
    { ok: false, error: "invalid_credentials" },
  );
  assert.deepEqual(
    validatePaymentCredentials({
      accountEmail: "customer@example.com",
      enteredEmail: "customer@example.com",
      password: "short",
    }),
    { ok: false, error: "invalid_credentials" },
  );
});

test("profile text and country values are normalized before persistence", () => {
  assert.equal(cleanProfileText("  Sofia  ", 20), "Sofia");
  assert.equal(cleanProfileText("123456", 4), "1234");
  assert.equal(cleanCountryCode(" ma "), "MA");
  assert.equal(cleanCountryCode("Morocco"), "");
  assert.equal(cleanCountryCode("1a"), "");
});
