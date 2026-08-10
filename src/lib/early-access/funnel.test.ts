import { test } from "node:test";
import assert from "node:assert/strict";
import {
  abandonmentConfig,
  coarseClient,
  dueReminderNumber,
  emailAssociation,
  isOpaqueToken,
  isActiveTokenExpiry,
  likelyAbandonmentCategory,
  sanitizeEvent,
  sanitizePartialPayload,
  shouldMarkAbandoned,
  type ReminderCandidate,
} from "./funnel";

const config = abandonmentConfig({
  EARLY_ACCESS_ABANDONED_REMINDERS_ENABLED: "true",
  EARLY_ACCESS_ABANDONMENT_MINUTES: "45",
  EARLY_ACCESS_REMINDER_1_MINUTES: "180",
  EARLY_ACCESS_REMINDER_2_MINUTES: "1440",
  EARLY_ACCESS_RESUME_TOKEN_HOURS: "168",
});
const baseTime = Date.parse("2026-08-09T12:00:00.000Z");

function candidate(overrides: Partial<ReminderCandidate> = {}): ReminderCandidate {
  return {
    status: "onboarding_started",
    email_present: true,
    reminder_consent: true,
    reminder_count: 0,
    last_activity_at: new Date(baseTime - 46 * 60_000).toISOString(),
    abandoned_at: null,
    opted_out_at: null,
    completed_at: null,
    reminder_1_queued_at: null,
    reminder_2_queued_at: null,
    ...overrides,
  };
}

test("partial autosave has an explicit allowlist and strips secrets", () => {
  assert.deepEqual(sanitizePartialPayload({
    firstName: "Amina",
    email: "a@example.com",
    turnstileToken: "secret",
    signupSessionToken: "secret",
    companyWebsite: "bot",
    arbitrary: { nested: true },
  }), { firstName: "Amina", email: "a@example.com" });
});

test("email association requires a valid address and explicit reminder consent", () => {
  assert.deepEqual(emailAssociation({ email: "not-email", abandonedReminderConsent: true }), {
    email: undefined, normalizedEmail: undefined, emailPresent: false, reminderConsent: false,
  });
  assert.equal(emailAssociation({ email: " Person@Example.COM ", abandonedReminderConsent: false }).reminderConsent, false);
  assert.equal(emailAssociation({ email: " Person@Example.COM ", abandonedReminderConsent: true }).normalizedEmail, "person@example.com");
});

test("no email, no consent, completed and opted-out sessions never become abandoned", () => {
  assert.equal(shouldMarkAbandoned(candidate({ email_present: false }), baseTime, config), false);
  assert.equal(shouldMarkAbandoned(candidate({ reminder_consent: false }), baseTime, config), false);
  assert.equal(shouldMarkAbandoned(candidate({ completed_at: new Date(baseTime).toISOString() }), baseTime, config), false);
  assert.equal(shouldMarkAbandoned(candidate({ opted_out_at: new Date(baseTime).toISOString() }), baseTime, config), false);
});

test("session becomes eligible only after the inactivity threshold", () => {
  assert.equal(shouldMarkAbandoned(candidate({ last_activity_at: new Date(baseTime - 44 * 60_000).toISOString() }), baseTime, config), false);
  assert.equal(shouldMarkAbandoned(candidate(), baseTime, config), true);
});

test("first and second reminder timing has a hard maximum of two", () => {
  const abandonedAt = new Date(baseTime - 181 * 60_000).toISOString();
  assert.equal(dueReminderNumber(candidate({ status: "abandoned_eligible", abandoned_at: abandonedAt }), baseTime, config), 1);
  assert.equal(dueReminderNumber(candidate({
    status: "reminder_sent", abandoned_at: abandonedAt, reminder_count: 1,
    reminder_1_queued_at: new Date(baseTime - 1441 * 60_000).toISOString(),
  }), baseTime, config), 2);
  assert.equal(dueReminderNumber(candidate({
    status: "reminder_sent", abandoned_at: abandonedAt, reminder_count: 2,
    reminder_1_queued_at: new Date(baseTime - 2000 * 60_000).toISOString(),
  }), baseTime, config), null);
});

test("disabled reminders suppress every candidate", () => {
  assert.equal(dueReminderNumber(candidate({ status: "abandoned_eligible", abandoned_at: new Date(0).toISOString() }), baseTime, { ...config, remindersEnabled: false }), null);
});

test("events accept safe field names and strip arbitrary metadata and PII", () => {
  assert.deepEqual(sanitizeEvent({
    eventName: "early_access_validation_error",
    fieldName: "email",
    errorType: "required",
    metadata: { provider: "client", email: "person@example.com", full_payload: "secret" },
  })?.metadata, { provider: "client" });
  assert.equal(sanitizeEvent({ eventName: "early_access_field_focused", fieldName: "creditCard" })?.fieldName, undefined);
});

test("resume tokens reject manipulation and short guesses", () => {
  assert.equal(isOpaqueToken("short"), false);
  assert.equal(isOpaqueToken("A".repeat(43)), true);
  assert.equal(isOpaqueToken(`${"A".repeat(42)}!`), false);
});

test("expired and malformed token expirations are rejected", () => {
  assert.equal(isActiveTokenExpiry("2026-08-09T11:59:59Z", baseTime), false);
  assert.equal(isActiveTokenExpiry("not-a-date", baseTime), false);
  assert.equal(isActiveTokenExpiry("2026-08-09T12:00:01Z", baseTime), true);
});

test("coarse device metadata contains no full user agent", () => {
  assert.deepEqual(coarseClient("Mozilla/5.0 (iPhone) Version/17.0 Mobile Safari/604.1"), {
    deviceType: "mobile", browser: "Safari", operatingSystem: "iOS",
  });
});

test("likely abandonment category prioritizes technical and repeated validation failures", () => {
  assert.equal(likelyAbandonmentCategory([{ event_name: "early_access_api_error" }]), "technical_failure");
  assert.equal(likelyAbandonmentCategory([
    { event_name: "early_access_validation_error" }, { event_name: "early_access_validation_error" },
  ]), "validation_friction");
  assert.equal(likelyAbandonmentCategory([{ event_name: "early_access_started" }]), "voluntary_leave");
});
