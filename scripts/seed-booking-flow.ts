/**
 * Generates fake service_bookings *derived from real subscription terms*, to
 * exercise the intended chain end to end:
 *
 *   subscription terms -> booking -> schedule -> scheduled personnel
 *
 * The point is not to have rows on a page. It is to check that each step is
 * actually derivable from the one before it, using only columns that exist:
 *
 *   1. terms      subscriptions.frequency (weekly | biweekly | monthly)
 *                 decides the cadence; activated_at / current_period_start
 *                 decides where the series begins.
 *   2. booking    a service window (service_window_start..end, a Monday-to-
 *                 Sunday week) with no time and nobody assigned - status
 *                 'planning'. This is all the customer can be told at first.
 *   3. schedule   an exact slot lands (scheduled_start/scheduled_end, which the
 *                 schema enforces as both-or-neither) and status -> 'confirmed'.
 *   4. personnel  assigned_staff_id is filled from staff_members.
 *
 * Bookings are produced across all four stages so every step of the chain is
 * represented, and the script prints which stage each row reached.
 *
 * Run (target must be stated explicitly - there is no default):
 *   $env:SEED_TARGET="staging"; npx tsx scripts/seed-booking-flow.ts
 *
 * Cleanup (this script's rows only):
 *   $env:SEED_TARGET="staging"; $env:SEED_CLEANUP="1"; npx tsx scripts/seed-booking-flow.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const MARKER = "SEED:booking-flow";
const TOTAL_BOOKINGS = 10;
const PROJECT_REFS = {
  staging: "ehzrroohsmwdkebezhiy",
  production: "sadyszicqxqslskotyta",
} as const;

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const requestedTarget = process.env.SEED_TARGET;
if (requestedTarget !== "staging" && requestedTarget !== "production") {
  throw new Error('Set SEED_TARGET to "staging" or "production". There is no default.');
}
const target: keyof typeof PROJECT_REFS = requestedTarget;

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!url || !secret) throw new Error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY.");

// The declared target and what .env.local actually points at must agree, so a
// stale env file can never redirect a "staging" run into production.
if (!url.includes(PROJECT_REFS[target])) {
  throw new Error(
    `SEED_TARGET=${target} expects project ${PROJECT_REFS[target]}, but .env.local points at ${url}. Refusing to run.`,
  );
}

const db = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

/** Cadence in days implied by the subscription's own frequency term. */
const CADENCE_DAYS: Record<string, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 28,
  irregular: 28,
};

/**
 * How the ten bookings are distributed across the chain. `cadenceSteps` is in
 * multiples of the subscription's own cadence relative to this week, so a
 * weekly subscription and a monthly one both produce a sensible series from the
 * same plan.
 *
 *   stage 2  booking    window only, nothing scheduled  -> 'planning'
 *   stage 3  schedule   exact slot, nobody assigned yet -> 'confirmed'
 *   stage 4  personnel  slot + assigned employee        -> 'confirmed'
 *   past     history    the completed end of the chain  -> 'completed'
 */
const STAGE_PLAN: Array<{
  cadenceSteps: number;
  scheduled: boolean;
  personnel: boolean;
  status: string;
  label: string;
}> = [
  { cadenceSteps: -3, scheduled: true, personnel: true, status: "completed", label: "past" },
  { cadenceSteps: -2, scheduled: true, personnel: true, status: "completed", label: "past" },
  { cadenceSteps: -1, scheduled: true, personnel: true, status: "completed", label: "past" },
  { cadenceSteps: 0, scheduled: true, personnel: true, status: "in_progress", label: "4 personnel" },
  { cadenceSteps: 1, scheduled: true, personnel: true, status: "confirmed", label: "4 personnel" },
  { cadenceSteps: 2, scheduled: true, personnel: true, status: "confirmed", label: "4 personnel" },
  { cadenceSteps: 3, scheduled: true, personnel: false, status: "confirmed", label: "3 schedule" },
  { cadenceSteps: 4, scheduled: true, personnel: false, status: "confirmed", label: "3 schedule" },
  { cadenceSteps: 5, scheduled: false, personnel: false, status: "planning", label: "2 booking" },
  { cadenceSteps: 6, scheduled: false, personnel: false, status: "planning", label: "2 booking" },
];

type Subscription = {
  id: string;
  customer_id: string;
  property_id: string;
  assessment_id: string;
  status: string;
  frequency: string;
  activated_at: string | null;
  current_period_start: string | null;
  created_at: string;
};

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  copy.setUTCDate(copy.getUTCDate() - ((copy.getUTCDay() + 6) % 7)); // back to Monday
  return copy;
}
function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}
function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}
function at(date: Date, hours: number, minutes = 0): string {
  const copy = new Date(date);
  copy.setUTCHours(hours, minutes, 0, 0);
  return copy.toISOString();
}

async function cleanup() {
  const { data } = await db
    .from("service_bookings")
    .select("id,source_invoice_id")
    .eq("notes", MARKER);
  if (data?.length) {
    await db.from("service_bookings").delete().eq("notes", MARKER);
    await db.from("invoices").delete().in("id", data.map((row) => row.source_invoice_id));
  }
  await db.from("invoices").delete().eq("invoice_number", MARKER);
  console.log(`Removed ${data?.length || 0} booking(s) and their invoices.`);
}

async function main() {
  console.log(`Target: ${target} (${PROJECT_REFS[target]})\n`);

  if (process.env.SEED_CLEANUP) {
    await cleanup();
    return;
  }

  const { data: subsData, error: subsError } = await db
    .from("subscriptions")
    .select(
      "id,customer_id,property_id,assessment_id,status,frequency,activated_at,current_period_start,created_at",
    )
    .in("status", ["active", "paused"])
    .order("created_at");
  if (subsError) throw new Error(`subscriptions: ${JSON.stringify(subsError)}`);

  const subs = (subsData || []) as Subscription[];
  if (!subs.length) throw new Error("No active or paused subscriptions to derive bookings from.");

  // A single employee makes the personnel step untestable - every booking would
  // resolve to the same person. Top up to three so assignment visibly varies.
  for (const number of ["EMP-STG-001", "EMP-STG-002", "EMP-STG-003"]) {
    await db
      .from("staff_members")
      .upsert(
        { full_name: `Staging Cleaner ${number.slice(-3)}`, role: "cleaner", employee_number: number, active: true },
        { onConflict: "employee_number" },
      );
  }

  const { data: staffData } = await db
    .from("staff_members")
    .select("id,employee_number")
    .eq("active", true)
    .order("employee_number");
  const staff = (staffData || []) as Array<{ id: string; employee_number: string }>;
  if (!staff.length) {
    console.warn("No active staff_members: stage 4 (personnel) cannot be exercised.\n");
  }

  await cleanup();

  const now = new Date();
  const rows: Array<Record<string, unknown>> = [];

  // Round-robin across subscriptions so every set of terms is represented, and
  // walk each one's own cadence outward from its anchor.
  for (let index = 0; index < TOTAL_BOOKINGS; index += 1) {
    const sub = subs[index % subs.length];
    const cadence = CADENCE_DAYS[sub.frequency] ?? 28;

    // Each booking's position in the series is stated up front rather than
    // inferred from its date, so all four links of the chain are always
    // represented no matter where the subscription's anchor happens to fall.
    const stage = STAGE_PLAN[index];
    const windowStart = addDays(startOfWeek(now), cadence * stage.cadenceSteps);
    const windowEnd = addDays(windowStart, 6);

    const scheduled = stage.scheduled;
    const withStaff = stage.personnel && staff.length > 0;
    const status = stage.status;

    rows.push({
      customer_id: sub.customer_id,
      property_id: sub.property_id,
      subscription_id: sub.id,
      assessment_id: sub.assessment_id,
      status,
      service_window_start: ymd(windowStart),
      service_window_end: ymd(windowEnd),
      scheduled_start: scheduled ? at(addDays(windowStart, 1), 9) : null,
      scheduled_end: scheduled ? at(addDays(windowStart, 1), 11, 30) : null,
      assigned_staff_id: withStaff ? staff[index % staff.length].id : null,
      notes: MARKER,
      _frequency: sub.frequency,
      _stage: stage.label,
      _employee: withStaff ? staff[index % staff.length].employee_number : null,
    });
  }

  console.log("stage chain: terms -> booking -> schedule -> personnel\n");
  let created = 0;

  for (const row of rows) {
    const { _frequency, _stage, _employee, ...booking } = row;

    // Each booking needs its own invoice: source_invoice_id is NOT NULL UNIQUE.
    const { data: invoice, error: invoiceError } = await db
      .from("invoices")
      .insert({
        customer_id: booking.customer_id,
        subscription_id: booking.subscription_id,
        status: "paid",
        amount_due_cents: 4500,
        amount_paid_cents: 4500,
        currency: "eur",
        invoice_number: MARKER,
      })
      .select("id")
      .single();
    if (invoiceError || !invoice) throw new Error(`invoices: ${JSON.stringify(invoiceError)}`);

    const { error } = await db
      .from("service_bookings")
      .insert({ ...booking, source_invoice_id: (invoice as { id: string }).id });
    if (error) throw new Error(`service_bookings: ${JSON.stringify(error)}`);

    console.log(
      `  ${String(_frequency).padEnd(9)} ${booking.service_window_start} → ${booking.service_window_end}` +
        `  ${String(booking.status).padEnd(12)}` +
        `  slot=${booking.scheduled_start ? String(booking.scheduled_start).slice(11, 16) : "  -  "}` +
        `  staff=${String(_employee || "-").padEnd(12)}` +
        `  ${_stage}`,
    );
    created += 1;
  }

  console.log(`\nCreated ${created} bookings across ${subs.length} subscriptions.`);
}

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  process.exit(1);
});
