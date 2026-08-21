import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createReceiverServer } from "./server.mjs";

const token = "receiver-test-token-with-thirty-two-characters";
const event = {
  eventId: "00000000-0000-4000-8000-000000000001",
  occurredAt: "2026-08-22T00:00:00.000Z",
  type: "control_drift_detected",
  severity: "high",
  source: "application",
  actorId: null,
  correlationId: "test",
  metadata: { route_class: "verification" },
};
let directory;
let server;
let baseUrl;
let emailCalls = 0;

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "security-receiver-"));
  server = createReceiverServer({
    token,
    dataDir: directory,
    resendKey: "test",
    alertEmail: "security@example.test",
    fromEmail: "alerts@example.test",
    fetchImpl: async () => { emailCalls += 1; return new Response(null, { status: 202 }); },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(directory, { recursive: true });
});

function request(path, suppliedToken = token) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${suppliedToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
}

test("rejects unauthenticated delivery", async () => {
  assert.equal((await request("/api/internal/security-log", "x".repeat(token.length))).status, 401);
});

test("writes chained JSONL records", async () => {
  assert.equal((await request("/api/internal/security-log")).status, 202);
  assert.equal((await request("/api/internal/security-log")).status, 202);
  const files = await import("node:fs/promises").then((module) => module.readdir(directory));
  const log = files.find((file) => file.endsWith(".jsonl"));
  const records = (await readFile(join(directory, log), "utf8")).trim().split("\n").map(JSON.parse);
  assert.equal(records.length, 2);
  assert.equal(records[1].previousHash, records[0].recordHash);
});

test("delivers high-severity alert email", async () => {
  const response = await request("/api/internal/security-alert");
  assert.equal(response.status, 202);
  assert.equal(emailCalls, 1);
});
