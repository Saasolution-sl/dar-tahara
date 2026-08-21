import assert from "node:assert/strict";
import test from "node:test";
import { evaluateIso27001Drift, type DriftCheck } from "./iso27001-drift";

const checks: DriftCheck[] = [{ id: "CONTROL", file: "control.txt", required: ["enabled", "fail closed"] }];

test("drift report passes only when every required marker remains", () => {
  assert.deepEqual(evaluateIso27001Drift({ "control.txt": "enabled and fail closed" }, checks), [{
    id: "CONTROL",
    file: "control.txt",
    status: "pass",
    missing: [],
  }]);
});

test("controlled negative test detects a removed safeguard", () => {
  assert.deepEqual(evaluateIso27001Drift({ "control.txt": "enabled" }, checks)[0], {
    id: "CONTROL",
    file: "control.txt",
    status: "fail",
    missing: ["fail closed"],
  });
});
