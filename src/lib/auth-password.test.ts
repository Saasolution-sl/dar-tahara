import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyPasswordUpdateError } from "./auth-password";

test("password update errors expose safe, actionable categories", () => {
  assert.equal(classifyPasswordUpdateError({ code: "weak_password" }), "weak_password");
  assert.equal(classifyPasswordUpdateError({ code: "same_password" }), "same_password");
  assert.equal(classifyPasswordUpdateError({ code: "session_not_found" }), "invalid_session");
  assert.equal(classifyPasswordUpdateError({ code: "session_expired" }), "invalid_session");
  assert.equal(classifyPasswordUpdateError({ name: "AuthSessionMissingError" }), "invalid_session");
  assert.equal(classifyPasswordUpdateError({ code: "unexpected_failure" }), "update_failed");
  assert.equal(classifyPasswordUpdateError({}), "update_failed");
});
