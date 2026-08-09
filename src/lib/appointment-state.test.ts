import assert from "node:assert/strict";
import test from "node:test";
import {
  appointmentCalendarDate,
  appointmentDisplayState,
  appointmentSortKey,
  appointmentTiming,
  isOnDay,
  isUpcoming,
  nextAppointment,
  sortAppointments,
  type AppointmentBookingInput,
} from "./appointment-state";

const NOW = new Date("2026-08-15T12:00:00.000Z");

function booking(overrides: Partial<AppointmentBookingInput> = {}): AppointmentBookingInput {
  return {
    status: "confirmed",
    service_window_start: "2026-08-17",
    service_window_end: "2026-08-23",
    scheduled_start: null,
    scheduled_end: null,
    ...overrides,
  };
}

test("settled statuses pass through regardless of how old the window is", () => {
  const old = { service_window_start: "2026-01-05", service_window_end: "2026-01-11" };
  assert.equal(appointmentDisplayState(booking({ status: "completed", ...old }), NOW), "completed");
  assert.equal(appointmentDisplayState(booking({ status: "cancelled", ...old }), NOW), "cancelled");
});

test("an open booking whose window has passed reads as awaiting_update, never as missed", () => {
  const state = appointmentDisplayState(
    booking({ status: "confirmed", service_window_start: "2026-08-03", service_window_end: "2026-08-09" }),
    NOW,
  );
  assert.equal(state, "awaiting_update");
});

test("a future window keeps its own planning/confirmed status", () => {
  assert.equal(appointmentDisplayState(booking({ status: "planning" }), NOW), "planning");
  assert.equal(appointmentDisplayState(booking({ status: "confirmed" }), NOW), "confirmed");
});

test("in_progress is never overridden by an elapsed window", () => {
  const state = appointmentDisplayState(
    booking({ status: "in_progress", service_window_start: "2026-08-03", service_window_end: "2026-08-09" }),
    NOW,
  );
  assert.equal(state, "in_progress");
});

test("the window's final day still counts as upcoming", () => {
  const sameDay = booking({ service_window_start: "2026-08-10", service_window_end: "2026-08-15" });
  assert.equal(appointmentDisplayState(sameDay, NOW), "confirmed");
  assert.equal(isUpcoming(sameDay, NOW), true);
});

test("timing distinguishes an exact slot from a window-only booking", () => {
  assert.equal(appointmentTiming(booking()), "window");
  assert.equal(
    appointmentTiming(
      booking({ scheduled_start: "2026-08-18T09:00:00.000Z", scheduled_end: "2026-08-18T11:00:00.000Z" }),
    ),
    "exact",
  );
});

test("calendar date and sort key prefer the exact slot, falling back to the window start", () => {
  assert.equal(appointmentCalendarDate(booking()), "2026-08-17");
  assert.equal(appointmentSortKey(booking()), "2026-08-17T00:00:00.000Z");

  const exact = booking({ scheduled_start: "2026-08-19T14:30:00.000Z", scheduled_end: "2026-08-19T16:30:00.000Z" });
  assert.equal(appointmentCalendarDate(exact), "2026-08-19");
  assert.equal(appointmentSortKey(exact), "2026-08-19T14:30:00.000Z");
});

test("sorting orders both directions off the same key", () => {
  const first = booking({ service_window_start: "2026-08-17", service_window_end: "2026-08-23" });
  const second = booking({ service_window_start: "2026-09-14", service_window_end: "2026-09-20" });

  assert.deepEqual(
    sortAppointments([second, first], "asc").map((entry) => entry.service_window_start),
    ["2026-08-17", "2026-09-14"],
  );
  assert.deepEqual(
    sortAppointments([first, second], "desc").map((entry) => entry.service_window_start),
    ["2026-09-14", "2026-08-17"],
  );
});

test("nextAppointment prefers today's visit over a later one", () => {
  const today = booking({ service_window_start: "2026-08-15", service_window_end: "2026-08-21" });
  const later = booking({ service_window_start: "2026-08-24", service_window_end: "2026-08-30" });

  assert.equal(nextAppointment([later, today], NOW), today);
});

test("nextAppointment skips finished and elapsed appointments", () => {
  const done = booking({
    status: "completed",
    service_window_start: "2026-08-17",
    service_window_end: "2026-08-23",
  });
  const elapsed = booking({ service_window_start: "2026-08-03", service_window_end: "2026-08-09" });
  const real = booking({ service_window_start: "2026-08-24", service_window_end: "2026-08-30" });

  assert.equal(nextAppointment([done, elapsed, real], NOW), real);
});

test("nextAppointment returns null when nothing is upcoming", () => {
  assert.equal(nextAppointment([], NOW), null);
  assert.equal(
    nextAppointment(
      [booking({ status: "cancelled", service_window_start: "2026-08-24" })],
      NOW,
    ),
    null,
  );
});

test("an in-progress visit still counts as the next appointment", () => {
  const running = booking({
    status: "in_progress",
    service_window_start: "2026-08-10",
    service_window_end: "2026-08-16",
    scheduled_start: "2026-08-15T09:00:00.000Z",
    scheduled_end: "2026-08-15T11:00:00.000Z",
  });
  assert.equal(nextAppointment([running], NOW), running);
});

test("isOnDay recognises the current day from the exact slot or the window start", () => {
  assert.equal(
    isOnDay(booking({ scheduled_start: "2026-08-15T09:00:00.000Z", scheduled_end: "2026-08-15T11:00:00.000Z" }), NOW),
    true,
  );
  assert.equal(isOnDay(booking({ service_window_start: "2026-08-15" }), NOW), true);
  assert.equal(isOnDay(booking({ service_window_start: "2026-08-17" }), NOW), false);
});

test("sorting does not mutate the caller's array", () => {
  const input = [booking({ service_window_start: "2026-09-14" }), booking({ service_window_start: "2026-08-17" })];
  sortAppointments(input, "asc");
  assert.equal(input[0].service_window_start, "2026-09-14");
});

test("a suspended subscription puts a still-future visit on hold", () => {
  const state = appointmentDisplayState(booking({ status: "confirmed" }), NOW, {
    subscriptionSuspended: true,
  });
  assert.equal(state, "suspended");
});

test("a suspended subscription forfeits a visit whose window has passed", () => {
  const state = appointmentDisplayState(
    booking({ status: "confirmed", service_window_start: "2026-08-03", service_window_end: "2026-08-09" }),
    NOW,
    { subscriptionSuspended: true },
  );
  assert.equal(state, "forfeited");
});

test("suspension never rewrites a visit that was already completed or cancelled", () => {
  const old = { service_window_start: "2026-01-05", service_window_end: "2026-01-11" };
  assert.equal(
    appointmentDisplayState(booking({ status: "completed", ...old }), NOW, { subscriptionSuspended: true }),
    "completed",
  );
  assert.equal(
    appointmentDisplayState(booking({ status: "cancelled", ...old }), NOW, { subscriptionSuspended: true }),
    "cancelled",
  );
});

test("an in-progress visit on a suspended subscription still reads as suspended", () => {
  // The subscription is unpaid, so the portal must not imply work is underway.
  const state = appointmentDisplayState(booking({ status: "in_progress" }), NOW, {
    subscriptionSuspended: true,
  });
  assert.equal(state, "suspended");
});

test("suspended and forfeited visits are not counted as upcoming", () => {
  const future = booking({ status: "confirmed" });
  assert.equal(isUpcoming(future, NOW), true);
  assert.equal(isUpcoming(future, NOW, { subscriptionSuspended: true }), false);
});
