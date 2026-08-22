import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeCspReport } from "./csp-report";

test("keeps only origins and a coarse route class", () => {
  const result = sanitizeCspReport({
    "document-uri": "https://www.dartahara.com/account/support/secret-ticket?token=secret#private",
    "blocked-uri": "https://cdn.example.com/customer/123/script.js?email=private@example.com",
    "source-file": "https://www.dartahara.com/_next/static/chunk.js?v=secret",
    "violated-directive": "script-src-elem",
    "effective-directive": "script-src-elem",
    disposition: "report",
    "status-code": 200,
    "line-number": 42,
  });

  assert.deepEqual(result, {
    violated_directive: "script-src-elem",
    effective_directive: "script-src-elem",
    disposition: "report",
    status_code: 200,
    document_origin: "https://www.dartahara.com",
    blocked_origin: "https://cdn.example.com",
    source_origin: "https://www.dartahara.com",
    route_class: "customer_portal",
    line_number: 42,
  });
  assert.doesNotMatch(JSON.stringify(result), /secret-ticket|token|private@example|customer\/123/);
});
test("rejects non-network schemes and malformed values", () => {
  const result = sanitizeCspReport({
    "document-uri": "not a URL",
    "blocked-uri": "javascript:alert(1)",
    "source-file": "file:///etc/passwd",
    "status-code": "not-a-number",
    "line-number": -2,
  });
  assert.equal(result.document_origin, null);
  assert.equal(result.blocked_origin, null);
  assert.equal(result.source_origin, null);
  assert.equal(result.route_class, "unknown");
  assert.equal(result.status_code, null);
  assert.equal(result.line_number, null);
});
