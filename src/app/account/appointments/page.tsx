import {
  AppointmentsView,
  type AppointmentPropertyOption,
  type AppointmentRow,
} from "@/components/portal/appointments-view";
import { portalCopy } from "@/i18n/portal-copy";
import type { Locale } from "@/i18n/config";
import {
  appointmentCalendarDate,
  appointmentDisplayState,
  appointmentTiming,
  isUpcoming,
  sortAppointments,
  type AppointmentDisplayState,
} from "@/lib/appointment-state";
import { requireCustomerPortal } from "@/lib/feature-flags";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { createClient } from "@/lib/supabase/server";

type PropertyRow = { id: string; address_line1: string; city: string };
type BookingRow = {
  id: string;
  status: string;
  service_window_start: string;
  service_window_end: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  assigned_staff_id: string | null;
  property_id: string;
  properties: PropertyRow[] | PropertyRow | null;
};

const ALL_STATES: AppointmentDisplayState[] = [
  "planning",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "awaiting_update",
];

function firstProperty(properties: PropertyRow[] | PropertyRow | null | undefined) {
  return Array.isArray(properties) ? properties[0] : properties;
}

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) || undefined;
}

/** `YYYY-MM` for the month `offset` months away from `anchor`. */
function shiftMonth(anchor: string, offset: number) {
  const [year, month] = anchor.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Weekday header labels starting on Monday, and the offset that puts day 1 of
 * `anchor` under the right column. Monday-first matches the Monday-to-Sunday
 * service week the rest of the portal already speaks in.
 */
function monthGrid(anchor: string, locale: Locale) {
  const [year, month] = anchor.split("-").map(Number);
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  // 2026-01-05 is a Monday - any known Monday works as the cycle start.
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    weekdayFormat.format(new Date(Date.UTC(2026, 0, 5 + index))),
  );

  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const leadingBlanks = (firstOfMonth.getUTCDay() + 6) % 7; // Sunday(0) -> 6
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dayFormat = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: "UTC" });
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      date: `${anchor}-${String(day).padStart(2, "0")}`,
      dayLabel: dayFormat.format(new Date(Date.UTC(year, month - 1, day))),
    };
  });

  return { weekdayLabels, leadingBlanks, monthDays };
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string | string[];
    month?: string | string[];
    property?: string | string[];
    state?: string | string[];
  }>;
}) {
  await requireCustomerPortal();
  const context = await requireAuth();
  const locale = await getRequestLocale();
  const c = portalCopy[locale];
  const db = await createClient();
  const customerId = context.customerId || "00000000-0000-0000-0000-000000000000";

  // RLS (`service_bookings_read_own`) already scopes this to the signed-in
  // customer; the explicit filter keeps the intent visible and the index used.
  const { data } = await db
    .from("service_bookings")
    .select(
      "id,status,service_window_start,service_window_end,scheduled_start,scheduled_end,assigned_staff_id,property_id,properties(id,address_line1,city)",
    )
    .eq("customer_id", customerId)
    .order("service_window_start", { ascending: true });

  const bookings = (data || []) as BookingRow[];
  const params = await searchParams;
  const now = new Date();

  const propertyLabelOf = (booking: BookingRow) => {
    const property = firstProperty(booking.properties);
    return property ? `${property.address_line1}, ${property.city}` : booking.property_id;
  };

  const properties: AppointmentPropertyOption[] = Array.from(
    new Map(
      bookings.map((booking) => [
        booking.property_id,
        { value: booking.property_id, label: propertyLabelOf(booking) },
      ]),
    ).values(),
  ).sort((left, right) => left.label.localeCompare(right.label, locale));

  const requestedProperty = one(params.property);
  const selectedProperty = properties.some((option) => option.value === requestedProperty)
    ? requestedProperty || null
    : null;
  const requestedState = one(params.state) as AppointmentDisplayState | undefined;
  const selectedState =
    requestedState && ALL_STATES.includes(requestedState) ? requestedState : null;
  const view = one(params.view) === "agenda" ? "agenda" : "month";

  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const shortWindowFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  const visible = bookings.filter((booking) => {
    if (selectedProperty && booking.property_id !== selectedProperty) return false;
    if (selectedState && appointmentDisplayState(booking, now) !== selectedState) return false;
    return true;
  });

  const rows: AppointmentRow[] = sortAppointments(visible, view === "agenda" ? "desc" : "asc").map(
    (booking) => {
      const timing = appointmentTiming(booking);
      const calendarDate = appointmentCalendarDate(booking);
      return {
        id: booking.id,
        state: appointmentDisplayState(booking, now),
        timing,
        calendarDate,
        dateLabel: dateFormat.format(new Date(`${calendarDate}T00:00:00Z`)),
        timeLabel: booking.scheduled_start
          ? timeFormat.format(new Date(booking.scheduled_start))
          : null,
        windowLabel: `${shortWindowFormat.format(
          new Date(`${booking.service_window_start}T00:00:00Z`),
        )} – ${shortWindowFormat.format(new Date(`${booking.service_window_end}T00:00:00Z`))}`,
        propertyId: booking.property_id,
        propertyLabel: propertyLabelOf(booking),
        employeeNumber: null,
        upcoming: isUpcoming(booking, now),
      };
    },
  );

  // Default the grid to the month holding the soonest upcoming appointment, so
  // a customer whose next visit is next month does not land on an empty grid.
  const fallbackMonth =
    rows.find((row) => row.upcoming)?.calendarDate.slice(0, 7) ||
    rows[0]?.calendarDate.slice(0, 7) ||
    now.toISOString().slice(0, 7);
  const requestedMonth = one(params.month);
  const monthAnchor = /^\d{4}-\d{2}$/.test(requestedMonth || "")
    ? (requestedMonth as string)
    : fallbackMonth;
  const { weekdayLabels, leadingBlanks, monthDays } = monthGrid(monthAnchor, locale);
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${monthAnchor}-01T00:00:00Z`));

  return (
    <AppointmentsView
      copy={c}
      rows={rows}
      properties={properties}
      selectedProperty={selectedProperty}
      selectedState={selectedState}
      view={view}
      monthLabel={monthLabel}
      previousMonth={shiftMonth(monthAnchor, -1)}
      nextMonth={shiftMonth(monthAnchor, 1)}
      weekdayLabels={weekdayLabels}
      monthDays={monthDays}
      leadingBlanks={leadingBlanks}
    />
  );
}
