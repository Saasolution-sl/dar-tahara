import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEarlyAccessReport, type ReportingEvent, type ReportingSession } from "./reporting";

const sessions: ReportingSession[] = [
  { id: "a", status: "completed", email_present: true, current_step: "review", current_step_index: 6, source_code: "qr", utm_source: null, referrer_host: null, device_type: "mobile", browser: "Safari", started_at: "2026-08-09T10:00:00Z", completed_at: "2026-08-09T10:10:00Z", abandoned_at: null, resumed_at: null, reminder_count: 0, completed_after_reminder: false },
  { id: "b", status: "reminder_sent", email_present: true, current_step: "billing", current_step_index: 1, source_code: null, utm_source: "instagram", referrer_host: null, device_type: "mobile", browser: "Instagram", started_at: "2026-08-09T11:00:00Z", completed_at: null, abandoned_at: "2026-08-09T11:50:00Z", resumed_at: null, reminder_count: 1, completed_after_reminder: false },
];
const events: ReportingEvent[] = [
  { signup_session_id: "a", event_name: "early_access_viewed", step_id: "contact", step_index: 0, field_name: null, error_type: null, duration_ms: null },
  { signup_session_id: "a", event_name: "early_access_started", step_id: "contact", step_index: 0, field_name: null, error_type: null, duration_ms: null },
  { signup_session_id: "a", event_name: "early_access_step_viewed", step_id: "contact", step_index: 0, field_name: null, error_type: null, duration_ms: null },
  { signup_session_id: "a", event_name: "early_access_step_completed", step_id: "contact", step_index: 0, field_name: null, error_type: null, duration_ms: 30_000 },
  { signup_session_id: "b", event_name: "early_access_viewed", step_id: "contact", step_index: 0, field_name: null, error_type: null, duration_ms: null },
  { signup_session_id: "b", event_name: "early_access_started", step_id: "contact", step_index: 0, field_name: null, error_type: null, duration_ms: null },
  { signup_session_id: "b", event_name: "early_access_validation_error", step_id: "billing", step_index: 1, field_name: "billingCity", error_type: "required", duration_ms: null },
  { signup_session_id: "b", event_name: "early_access_validation_error", step_id: "billing", step_index: 1, field_name: "billingCity", error_type: "required", duration_ms: null },
];

test("admin report computes session conversion without exposing form values", () => {
  const report = buildEarlyAccessReport(sessions, events, [{ reason: "too_long" }]);
  assert.equal(report.summary.viewed, 2);
  assert.equal(report.summary.started, 2);
  assert.equal(report.summary.completed, 1);
  assert.equal(report.summary.completionRate, 0.5);
  assert.equal(report.summary.reminder1, 1);
  assert.equal(report.summary.medianCompletionMinutes, 10);
  assert.deepEqual(report.errorFields[0], { label: "billingCity", count: 2 });
  assert.deepEqual(report.abandonmentCategories[0], { label: "validation_friction", count: 1 });
  assert.deepEqual(report.feedbackReasons[0], { label: "too_long", count: 1 });
});
