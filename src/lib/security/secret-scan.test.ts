import assert from "node:assert/strict";
import test from "node:test";

import { formatSecretFinding, scanTextForSecrets } from "./secret-scan";

test("detects representative secret formats without returning their values", () => {
  const secret = ["sk", "live", "a".repeat(24)].join("_");
  const findings = scanTextForSecrets(`PAYMENT_KEY=${secret}`);

  assert.deepEqual(findings, [{ detector: "stripe-secret-key", line: 1 }]);
  assert.equal(formatSecretFinding("fixture.env", findings[0]), "fixture.env:1 [stripe-secret-key] possible secret");
  assert.equal(JSON.stringify(findings).includes(secret), false);
});

test("ignores placeholders and ordinary source text", () => {
  assert.deepEqual(scanTextForSecrets("API_KEY=replace-me\nconst label = 'public';"), []);
});

test("reports exact line numbers for multiple detector types", () => {
  const awsKey = ["AKIA", "A".repeat(16)].join("");
  const webhookSecret = ["whsec", "b".repeat(24)].join("_");
  const findings = scanTextForSecrets(`safe\n${awsKey}\n${webhookSecret}`);

  assert.deepEqual(findings, [
    { detector: "aws-access-key", line: 2 },
    { detector: "stripe-webhook-secret", line: 3 },
  ]);
});
