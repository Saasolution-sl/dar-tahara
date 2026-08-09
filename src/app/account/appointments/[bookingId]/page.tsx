import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalCard } from "@/components/portal/portal-shell";
import { portalCopy } from "@/i18n/portal-copy";
import {
  appointmentDisplayState,
  appointmentTiming,
  type AppointmentDisplayState,
} from "@/lib/appointment-state";
import { requireCustomerPortal } from "@/lib/feature-flags";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

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

const STATE_TONE: Record<AppointmentDisplayState, string> = {
  planning: "bg-secondary text-secondary-foreground",
  confirmed: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-muted text-muted-foreground",
  awaiting_update: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  await requireCustomerPortal();
  const context = await requireAuth();
  const locale = await getRequestLocale();
  const c = portalCopy[locale];
  const ac = c.appointments;
  const db = await createClient();
  const customerId = context.customerId || "00000000-0000-0000-0000-000000000000";
  const { bookingId } = await params;

  // Ownership is enforced server-side by both the RLS policy and this filter -
  // a booking belonging to another customer is a 404, not a partial render.
  const { data } = await db
    .from("service_bookings")
    .select(
      "id,status,service_window_start,service_window_end,scheduled_start,scheduled_end,assigned_staff_id,property_id,properties(id,address_line1,city)",
    )
    .eq("id", bookingId)
    .eq("customer_id", customerId)
    .maybeSingle();

  const booking = data as BookingRow | null;
  if (!booking) notFound();

  const employeeNumber = booking.assigned_staff_id
    ? (
        await db
          .from("staff_members")
          .select("id,employee_number")
          .eq("id", booking.assigned_staff_id)
          .maybeSingle()
      ).data?.employee_number || null
    : null;

  const state = appointmentDisplayState(booking);
  const timing = appointmentTiming(booking);
  const property = Array.isArray(booking.properties)
    ? booking.properties[0]
    : booking.properties;

  const dateFormat = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const windowFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  const windowRange = `${windowFormat.format(
    new Date(`${booking.service_window_start}T00:00:00Z`),
  )} – ${windowFormat.format(new Date(`${booking.service_window_end}T00:00:00Z`))}`;
  const scheduledValue =
    booking.scheduled_start && booking.scheduled_end
      ? `${dateFormat.format(new Date(booking.scheduled_start))}, ${timeFormat.format(
          new Date(booking.scheduled_start),
        )} – ${timeFormat.format(new Date(booking.scheduled_end))}`
      : ac.timeToBeConfirmed;

  return (
    <div>
      <Link
        href="/account/appointments"
        className="text-sm text-primary transition-colors hover:underline"
      >
        ← {ac.backToList}
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl">{ac.details}</h1>
        <span
          className={cn(
            "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
            STATE_TONE[state],
          )}
        >
          {ac.states[state]}
        </span>
      </div>

      <div className="mt-7 space-y-5">
        <PortalCard title={ac.details}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label={ac.reference} value={booking.id.slice(0, 8).toUpperCase()} />
            <Field
              label={ac.property}
              value={
                property ? `${property.address_line1}, ${property.city}` : booking.property_id
              }
            />
            <Field label={ac.windowLabel} value={windowRange} />
            <Field label={ac.scheduledFor} value={scheduledValue} />
            <Field label={ac.teamMember} value={employeeNumber || ac.timeToBeConfirmed} />
          </dl>
          {timing === "window" ? (
            <p className="mt-4 text-sm text-muted-foreground">{ac.windowNote}</p>
          ) : null}
        </PortalCard>

        {/*
          The cleaning report itself is recorded in HospitalityOps, which this
          site is not yet connected to. Rather than render an empty shell that
          looks broken, the section states plainly that the report is not
          available yet - the drop-in point is this card's body.
        */}
        <PortalCard title={ac.reportTitle}>
          <p className="text-sm text-muted-foreground">{ac.reportPending}</p>
        </PortalCard>
      </div>
    </div>
  );
}
