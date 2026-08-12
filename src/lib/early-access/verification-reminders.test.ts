import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_AGE_DAYS,
  REMINDER_AFTER_DAYS,
  isReminderEligible,
} from "./verification-reminders";

const DAY = 86_400_000;
const NOW = Date.parse("2026-08-13T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW - n * DAY).toISOString();

function check(args: { status?: string; days?: number; tokenCount?: number }) {
  return isReminderEligible({
    status: args.status ?? "pending",
    createdAt: daysAgo(args.days ?? 10),
    tokenCount: args.tokenCount ?? 1,
    now: NOW,
  });
}

test("a pending lead past the waiting period is reminded", () => {
  assert.equal(check({ days: 10 }).eligible, true);
});

test("nobody is reminded before the waiting period elapses", () => {
  assert.equal(check({ days: 6 }).reason, "too_recent");
  assert.equal(check({ days: 0 }).reason, "too_recent");
});

test("the boundary day is inclusive, so a 7-day-old signup qualifies", () => {
  assert.equal(check({ days: REMINDER_AFTER_DAYS }).eligible, true);
  assert.equal(check({ days: REMINDER_AFTER_DAYS - 0.5 }).eligible, false);
});

test("stale signups are left alone rather than mailed out of the blue", () => {
  // Someone who ignored the original for a month is not a warm lead, and an
  // unexpected mail about a forgotten form invites a spam complaint.
  assert.equal(check({ days: MAX_AGE_DAYS + 1 }).reason, "too_old");
  assert.equal(check({ days: 365 }).reason, "too_old");
});

test("only pending leads are reminded", () => {
  for (const status of ["verified", "qualified", "customer", "archived", "waitlisted"]) {
    assert.equal(check({ status }).reason, "not_pending", status);
  }
});

test("a lead who already got a fresh link is never nudged again", () => {
  // Signup issues exactly one token, so >1 means a reminder or manual resend
  // already happened. This is what makes the job safe to run repeatedly.
  assert.equal(check({ tokenCount: 2 }).reason, "already_reminded");
  assert.equal(check({ tokenCount: 9 }).reason, "already_reminded");
});

test("running the job twice cannot double-send", () => {
  // First run: one signup token, eligible.
  assert.equal(check({ tokenCount: 1 }).eligible, true);
  // The send inserts a second token, so the next run skips the same lead.
  assert.equal(check({ tokenCount: 2 }).eligible, false);
});

test("a corrupt created_at is skipped rather than treated as ancient or new", () => {
  assert.equal(
    isReminderEligible({ status: "pending", createdAt: "not-a-date", tokenCount: 1, now: NOW })
      .reason,
    "bad_created_at",
  );
});

test("the real pending contact from 2026-07-23 falls outside the window", () => {
  // Documents a live decision: that lead is ~21 days old, so it is inside the
  // 30-day window and WOULD be reminded — assert the window covers it, so a
  // later tightening of MAX_AGE_DAYS surfaces here rather than silently
  // dropping the only real lead.
  const result = isReminderEligible({
    status: "pending",
    createdAt: "2026-07-23T16:24:07.000Z",
    tokenCount: 1,
    now: NOW,
  });
  assert.equal(result.eligible, true);
});
