import assert from "node:assert/strict";
import test from "node:test";
import { buildAuthCallbackUrl, buildAuthErrorUrl } from "./auth-redirect";

test("buildAuthCallbackUrl preserves a safe destination", () => {
  assert.equal(
    buildAuthCallbackUrl("https://www.dartahara.com", "/account/profile", "signup"),
    "https://www.dartahara.com/auth/callback?next=%2Faccount%2Fprofile&from=signup",
  );
});

test("auth redirects reject external destinations", () => {
  assert.equal(
    buildAuthCallbackUrl("https://www.dartahara.com", "//attacker.example", "login"),
    "https://www.dartahara.com/auth/callback?next=%2Faccount&from=login",
  );
  assert.equal(
    buildAuthErrorUrl(
      "https://www.dartahara.com",
      "https://attacker.example",
      "unexpected",
    ).toString(),
    "https://www.dartahara.com/login?error=oauth&next=%2Faccount",
  );
});
