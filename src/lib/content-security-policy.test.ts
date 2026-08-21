import assert from "node:assert/strict";
import { test } from "node:test";
import { applyContentSecurityPolicy, buildContentSecurityPolicy } from "./content-security-policy";

test("CSP defaults to restrictive report-only staging with known browser origins", () => {
  const policy = buildContentSecurityPolicy({ supabaseUrl: "https://project.supabase.co", reportUri: "/api/security/csp-report" });
  assert.match(policy, /default-src 'self'/);
  assert.match(policy, /object-src 'none'/);
  assert.match(policy, /frame-ancestors 'self'/);
  assert.match(policy, /https:\/\/project\.supabase\.co/);
  assert.match(policy, /wss:\/\/project\.supabase\.co/);
  assert.match(policy, /report-uri \/api\/security\/csp-report/);
  assert.doesNotMatch(policy, /http:\/\//);
});

test("CSP rejects unsafe report destinations", () => {
  assert.doesNotMatch(buildContentSecurityPolicy({ reportUri: "javascript:alert(1)" }), /report-uri/);
});

test("CSP enforcement requires an explicit deployment flag", () => {
  const prior = process.env.CSP_ENFORCE;
  delete process.env.CSP_ENFORCE;
  try {
    const staged = applyContentSecurityPolicy(new Response());
    assert.ok(staged.headers.has("content-security-policy-report-only"));
    process.env.CSP_ENFORCE = "true";
    const enforced = applyContentSecurityPolicy(new Response());
    assert.ok(enforced.headers.has("content-security-policy"));
    assert.equal(enforced.headers.has("content-security-policy-report-only"), false);
  } finally {
    if (prior) process.env.CSP_ENFORCE = prior;
    else delete process.env.CSP_ENFORCE;
  }
});
