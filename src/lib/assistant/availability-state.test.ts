import test from "node:test";
import assert from "node:assert/strict";
import { readAssistantAvailability, shouldShowAssistantLauncher } from "./availability-state";

test("frontend visibility follows the server-provided assistant state", () => {
  assert.equal(shouldShowAssistantLauncher(true), true);
  assert.equal(shouldShowAssistantLauncher(false), false);
  assert.equal(readAssistantAvailability({ enabled: false, code: "AI_ASSISTANT_DISABLED" }), false);
  assert.equal(readAssistantAvailability({ enabled: true }), true);
  assert.equal(readAssistantAvailability({ enabled: "false" }), null);
});
