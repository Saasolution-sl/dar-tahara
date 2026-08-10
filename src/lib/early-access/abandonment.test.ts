import { test } from "node:test";
import assert from "node:assert/strict";
import { processAbandonmentCandidates, type AbandonmentDependencies } from "./abandonment";
import { abandonmentConfig } from "./funnel";
import type { SignupSessionRow } from "./funnel-server";

const now = Date.parse("2026-08-09T12:00:00.000Z");
const config = abandonmentConfig({
  EARLY_ACCESS_ABANDONED_REMINDERS_ENABLED: "true",
  EARLY_ACCESS_ABANDONMENT_MINUTES: "45",
  EARLY_ACCESS_REMINDER_1_MINUTES: "180",
  EARLY_ACCESS_REMINDER_2_MINUTES: "1440",
});

function row(overrides: Partial<SignupSessionRow> = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111", client_token_hash: "hash", lead_id: null,
    mautic_contact_id: null, email: "lead@example.com", normalized_email: "lead@example.com",
    email_present: true, reminder_consent: true, status: "onboarding_started" as const,
    current_step: "billing" as const, current_step_index: 1, highest_completed_step: 0,
    client_revision: 0,
    partial_payload: {}, locale: "en", started_at: new Date(now - 4 * 3_600_000).toISOString(),
    last_activity_at: new Date(now - 46 * 60_000).toISOString(), completed_at: null,
    abandoned_at: null, resumed_at: null, opted_out_at: null, reminder_count: 0,
    reminder_1_queued_at: null, reminder_2_queued_at: null, resume_token_hash: null,
    reminder_claimed_at: null, reminder_claimed_number: null,
    resume_token_expires_at: null, feedback_token_hash: null, feedback_token_expires_at: null,
    source_code: null, utm_source: null, utm_medium: null, utm_campaign: null, device_type: "mobile",
    ...overrides,
  };
}

function deps(overrides: Partial<AbandonmentDependencies> = {}): AbandonmentDependencies {
  return {
    now: () => now, config, loadCandidates: async () => [row()],
    markAbandoned: async () => {}, queueReminder: async () => {}, ...overrides,
  };
}

test("stale consented signup is marked abandoned but not reminded before delay", async () => {
  let marked = 0;
  let queued = 0;
  const result = await processAbandonmentCandidates(deps({
    markAbandoned: async () => { marked += 1; },
    queueReminder: async () => { queued += 1; },
  }));
  assert.equal(marked, 1);
  assert.equal(queued, 0);
  assert.deepEqual(result, { inspected: 1, markedAbandoned: 1, remindersQueued: 0, skipped: 1, failures: 0 });
});

test("existing abandoned candidate queues reminder one once", async () => {
  let queued: number[] = [];
  const result = await processAbandonmentCandidates(deps({
    loadCandidates: async () => [row({
      status: "abandoned_eligible", abandoned_at: new Date(now - 181 * 60_000).toISOString(),
    })],
    queueReminder: async (_row, reminder) => { queued.push(reminder); },
  }));
  assert.deepEqual(queued, [1]);
  assert.equal(result.remindersQueued, 1);
});

test("completion, opt-out and lack of consent suppress processing", async () => {
  let queued = 0;
  const result = await processAbandonmentCandidates(deps({
    loadCandidates: async () => [
      row({ completed_at: new Date(now).toISOString() }),
      row({ id: "22222222-2222-4222-8222-222222222222", opted_out_at: new Date(now).toISOString() }),
      row({ id: "33333333-3333-4333-8333-333333333333", reminder_consent: false }),
    ],
    queueReminder: async () => { queued += 1; },
  }));
  assert.equal(queued, 0);
  assert.equal(result.skipped, 3);
});

test("Mautic unavailable is recorded as retryable job failure without throwing", async () => {
  const result = await processAbandonmentCandidates(deps({
    loadCandidates: async () => [row({ status: "abandoned_eligible", abandoned_at: new Date(now - 181 * 60_000).toISOString() })],
    queueReminder: async () => { throw new Error("mautic unavailable"); },
  }));
  assert.equal(result.failures, 1);
  assert.equal(result.remindersQueued, 0);
});

test("database candidate failure is reported and does not crash the job", async () => {
  const result = await processAbandonmentCandidates(deps({ loadCandidates: async () => { throw new Error("db unavailable"); } }));
  assert.deepEqual(result, { inspected: 0, markedAbandoned: 0, remindersQueued: 0, skipped: 0, failures: 1 });
});

test("one failing candidate does not prevent a later reminder", async () => {
  const queued: string[] = [];
  const result = await processAbandonmentCandidates(deps({
    loadCandidates: async () => [
      row({ status: "abandoned_eligible", abandoned_at: new Date(now - 181 * 60_000).toISOString() }),
      row({ id: "22222222-2222-4222-8222-222222222222", status: "abandoned_eligible", abandoned_at: new Date(now - 181 * 60_000).toISOString() }),
    ],
    queueReminder: async (candidate) => {
      if (candidate.id.startsWith("1")) throw new Error("temporary");
      queued.push(candidate.id);
    },
  }));
  assert.equal(result.failures, 1);
  assert.equal(result.remindersQueued, 1);
  assert.equal(queued.length, 1);
});
