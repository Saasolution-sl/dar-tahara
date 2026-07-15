import { test } from "node:test";
import assert from "node:assert/strict";
import { syncLeadToMautic, MAX_SYNC_ATTEMPTS } from "./sync";
import { MauticApiError, type LeadForSync } from "./types";
import type { MauticClient } from "./client";

const lead: LeadForSync = {
  id: "22222222-2222-2222-2222-222222222222",
  normalizedEmail: "lead@example.com",
  email: "lead@example.com",
  firstName: "Lina",
  lastName: "B",
  emailVerified: true,
};

/** Minimal fake MauticClient; only the methods sync uses are implemented. */
function fakeClient(overrides: Partial<Record<keyof MauticClient, unknown>>): MauticClient {
  const defaults = {
    upsertContactByEmail: async () => ({ contact: { id: 100 }, created: true }),
    addTags: async () => {},
    addToSegment: async () => {},
  };
  return { ...defaults, ...overrides } as unknown as MauticClient;
}

test("happy path → synchronized with contact id", async () => {
  const r = await syncLeadToMautic(lead, fakeClient({}));
  assert.equal(r.status, "synchronized");
  assert.equal(r.mauticContactId, 100);
  assert.equal(r.retryable, false);
});

test("adds requested segments after upsert", async () => {
  const added: number[] = [];
  const client = fakeClient({
    addToSegment: async (_cid: number, sid: number) => {
      added.push(sid);
    },
  });
  const r = await syncLeadToMautic(lead, client, { segmentIds: [3, 9] });
  assert.equal(r.status, "synchronized");
  assert.deepEqual(added, [3, 9]);
});

test("transient upsert failure on first attempt → retry_scheduled", async () => {
  const client = fakeClient({
    upsertContactByEmail: async () => {
      throw new MauticApiError("boom", 503, true);
    },
  });
  const r = await syncLeadToMautic(lead, client, { priorAttempts: 0 });
  assert.equal(r.status, "retry_scheduled");
  assert.equal(r.retryable, true);
  assert.equal(r.failedStep, "upsert");
  // Error is redacted — no PII, just the class + status.
  assert.equal(r.error, "MauticApiError status=503");
});

test("transient failure on the final attempt → permanently_failed", async () => {
  const client = fakeClient({
    upsertContactByEmail: async () => {
      throw new MauticApiError("boom", 500, true);
    },
  });
  const r = await syncLeadToMautic(lead, client, { priorAttempts: MAX_SYNC_ATTEMPTS - 1 });
  assert.equal(r.status, "permanently_failed");
  assert.equal(r.retryable, false);
});

test("permanent failure (auth/validation) → failed, not retried", async () => {
  const client = fakeClient({
    upsertContactByEmail: async () => {
      throw new MauticApiError("unauthorized", 401, false);
    },
  });
  const r = await syncLeadToMautic(lead, client, { priorAttempts: 0 });
  assert.equal(r.status, "failed");
  assert.equal(r.retryable, false);
});

test("tag failure still reports the contact id (contact was created)", async () => {
  const client = fakeClient({
    upsertContactByEmail: async () => ({ contact: { id: 55 }, created: true }),
    addTags: async () => {
      throw new MauticApiError("boom", 503, true);
    },
  });
  const r = await syncLeadToMautic(lead, client, { priorAttempts: 0 });
  assert.equal(r.status, "retry_scheduled");
  assert.equal(r.mauticContactId, 55);
  assert.equal(r.failedStep, "tags");
});

test("unknown (non-Mautic) error is treated as retryable and redacted", async () => {
  const client = fakeClient({
    upsertContactByEmail: async () => {
      throw new TypeError("some internal detail with maybe-PII");
    },
  });
  const r = await syncLeadToMautic(lead, client, { priorAttempts: 0 });
  assert.equal(r.status, "retry_scheduled");
  assert.equal(r.error, "TypeError"); // message body never leaks
});
