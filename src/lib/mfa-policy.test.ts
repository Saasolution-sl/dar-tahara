import assert from "node:assert/strict";
import { test } from "node:test";
import {
  hasPrivilegedRole,
  privilegedMfaEnforced,
  privilegedSessionNeedsStepUp,
} from "./mfa-policy";

test("all operational and administrative roles are privileged", () => {
  for (const role of ["staff", "assessment", "manager", "regional_manager", "administrator"] as const) {
    assert.equal(hasPrivilegedRole([role]), true);
  }
  assert.equal(hasPrivilegedRole(["customer"]), false);
});

test("privileged MFA defaults on in production and supports an explicit emergency override", () => {
  assert.equal(privilegedMfaEnforced({ NODE_ENV: "production" }), true);
  assert.equal(privilegedMfaEnforced({ NODE_ENV: "development" }), false);
  assert.equal(privilegedMfaEnforced({ NODE_ENV: "production", REQUIRE_PRIVILEGED_AAL2: "false" }), false);
  assert.equal(privilegedMfaEnforced({ NODE_ENV: "test", REQUIRE_PRIVILEGED_AAL2: "true" }), true);
});

test("only a privileged AAL1 session requires step-up", () => {
  const enabled = { REQUIRE_PRIVILEGED_AAL2: "true" };
  assert.equal(privilegedSessionNeedsStepUp(["administrator"], "aal1", enabled), true);
  assert.equal(privilegedSessionNeedsStepUp(["administrator"], "aal2", enabled), false);
  assert.equal(privilegedSessionNeedsStepUp(["customer"], "aal1", enabled), false);
});
