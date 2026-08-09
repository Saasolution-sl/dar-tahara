/**
 * Customer-facing state for a `service_bookings` row.
 *
 * The table's own `status` is the operational truth (planning → confirmed →
 * in_progress → completed / cancelled). Two things it does not encode, which
 * the customer portal needs:
 *
 * 1. Whether an exact time is known yet. `scheduled_start`/`scheduled_end` are
 *    nullable (both-or-neither, enforced by a CHECK constraint) - until
 *    planning assigns a slot, all the customer can be told is the service
 *    window. Showing an empty time rather than saying "week of X" reads as
 *    missing data, so the two cases are distinguished explicitly.
 * 2. Whether a still-open booking's window has already passed. That is
 *    deliberately surfaced as `awaiting_update` rather than "missed": a past
 *    window with no completion far more often means the record has not been
 *    updated yet than that the visit did not happen, and telling a customer
 *    their cleaning was missed on that basis would be wrong.
 * 3. Whether the subscription paying for it is suspended for non-payment. That
 *    lives on `subscriptions`, not on the booking, so it is passed in:
 *      - still to come  -> `suspended`, the visit is on hold
 *      - window elapsed -> `forfeited`, the turn was lost and is not made up
 *    A visit already `completed` or `cancelled` keeps that state: it was
 *    settled before the suspension and rewriting history would be wrong.
 *
 * Every view derives state through this one function. When each page decided
 * for itself, the same booking could read `confirmed` in one place and
 * suspended in another.
 */

export type BookingStatus =
  | "planning"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type AppointmentDisplayState =
  | "planning"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "awaiting_update"
  | "suspended"
  | "forfeited";

export type AppointmentTiming = "exact" | "window";

export type AppointmentBookingInput = {
  status: string;
  service_window_start: string;
  service_window_end: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
};

/** Statuses that are finished - a past window means nothing for these. */
const SETTLED: ReadonlySet<string> = new Set(["completed", "cancelled"]);

export function appointmentTiming(booking: AppointmentBookingInput): AppointmentTiming {
  return booking.scheduled_start ? "exact" : "window";
}

/**
 * The moment used to sort and place the booking on a calendar: the exact
 * start when known, otherwise the first day of the service window.
 */
export function appointmentSortKey(booking: AppointmentBookingInput): string {
  return booking.scheduled_start || `${booking.service_window_start}T00:00:00.000Z`;
}

/** The calendar day (YYYY-MM-DD) a booking should appear on. */
export function appointmentCalendarDate(booking: AppointmentBookingInput): string {
  return (booking.scheduled_start || booking.service_window_start).slice(0, 10);
}

export type AppointmentStateOptions = {
  /** The subscription paying for this booking is suspended for non-payment. */
  subscriptionSuspended?: boolean;
};

export function appointmentDisplayState(
  booking: AppointmentBookingInput,
  now: Date = new Date(),
  options: AppointmentStateOptions = {},
): AppointmentDisplayState {
  const status = booking.status;

  // Settled first: a visit that already happened, or was called off, is not
  // rewritten by a suspension that came afterwards.
  if (SETTLED.has(status)) return status as AppointmentDisplayState;

  const windowElapsed =
    new Date(`${booking.service_window_end}T23:59:59.999Z`).getTime() < now.getTime();

  if (options.subscriptionSuspended) {
    return windowElapsed ? "forfeited" : "suspended";
  }

  if (status === "in_progress") return "in_progress";
  if (windowElapsed) return "awaiting_update";

  return status === "confirmed" ? "confirmed" : "planning";
}

/**
 * Upcoming = still going to happen. A suspended visit is deliberately excluded:
 * it is on hold, not scheduled, so counting it as upcoming would let the
 * overview promise a visit that will not take place until the invoice is paid.
 */
export function isUpcoming(
  booking: AppointmentBookingInput,
  now: Date = new Date(),
  options: AppointmentStateOptions = {},
): boolean {
  const state = appointmentDisplayState(booking, now, options);
  return state === "planning" || state === "confirmed" || state === "in_progress";
}

/**
 * The one appointment to surface on the account overview: the soonest that has
 * not finished. When something is booked for today this is that day's first
 * visit, which is what the tile is for; on a day with nothing booked it looks
 * ahead rather than showing an empty card.
 *
 * Deliberately built from the same `isUpcoming` / `appointmentSortKey` pair the
 * calendar uses, so the tile and the Appointments page can never disagree about
 * which visit comes next.
 */
export function nextAppointment<T extends AppointmentBookingInput>(
  bookings: T[],
  now: Date = new Date(),
): T | null {
  return sortAppointments(
    bookings.filter((booking) => isUpcoming(booking, now)),
    "asc",
  )[0] || null;
}

/** Whether the booking lands on `now`'s calendar day (UTC, as stored). */
export function isOnDay(booking: AppointmentBookingInput, now: Date = new Date()): boolean {
  return appointmentCalendarDate(booking) === now.toISOString().slice(0, 10);
}

/** Newest-first for past appointments, soonest-first for upcoming ones. */
export function sortAppointments<T extends AppointmentBookingInput>(
  bookings: T[],
  direction: "asc" | "desc",
): T[] {
  return [...bookings].sort((left, right) => {
    const comparison = appointmentSortKey(left).localeCompare(appointmentSortKey(right));
    return direction === "asc" ? comparison : -comparison;
  });
}
