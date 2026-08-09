/**
 * Backfills the KPI Baseline framework's new HR data domains onto the demo
 * staff already created by seed-operations-data.ts: hire_date on existing
 * demo staff, a handful of already-departed demo staff (for retention/flow
 * KPI realism), 30 days of staff_attendance, and a few staff_sick_leave
 * records spanning different duration classes.
 *
 * Run manually:
 *   SUPABASE_URL=... SUPABASE_SECRET_KEY=... npx tsx scripts/seed-kpi-baseline-data.ts
 */
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "sadyszicqxqslskotyta";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !secret) throw new Error("Missing SUPABASE_URL / SUPABASE_SECRET_KEY.");
if (!url.includes(PRODUCTION_PROJECT_REF)) throw new Error(`Refusing to run against a project other than ${PRODUCTION_PROJECT_REF}.`);

const db = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });

function rand<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const FIRST_NAMES = ["Amine", "Youssef", "Salma", "Fatima", "Karim", "Nadia", "Hicham", "Imane", "Reda", "Sara", "Omar", "Layla", "Anas", "Meryem", "Bilal"];
const LAST_NAMES = ["El Amrani", "Benali", "Chraibi", "Idrissi", "Bennis", "Tazi", "Fassi", "Alaoui", "Bakkali", "Ziani"];
function randomName(): string {
  return `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
}

const ATTENDANCE_WEIGHTS: Array<{ status: "present" | "late" | "absent" | "no_show"; weight: number }> = [
  { status: "present", weight: 85 },
  { status: "late", weight: 10 },
  { status: "absent", weight: 4 },
  { status: "no_show", weight: 1 },
];
function weightedAttendanceStatus(): "present" | "late" | "absent" | "no_show" {
  const total = ATTENDANCE_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const entry of ATTENDANCE_WEIGHTS) {
    if (roll < entry.weight) return entry.status;
    roll -= entry.weight;
  }
  return "present";
}

async function main() {
  console.log(`Seeding KPI baseline demo data into ${url}...`);

  const { data: demoStaff, error: staffError } = await db
    .from("staff_members")
    .select("id, office_id, role")
    .like("email", "%@demo.dartahara.com")
    .eq("active", true);
  if (staffError) throw staffError;
  if (!demoStaff || demoStaff.length === 0) throw new Error("No demo staff found, run scripts/seed-operations-data.ts first.");

  console.log(`Found ${demoStaff.length} active demo staff.`);

  // 1) Backfill hire_date on existing demo staff.
  for (const staff of demoStaff) {
    const hireDate = toDateString(daysAgo(randInt(90, 720)));
    const { error } = await db.from("staff_members").update({ hire_date: hireDate }).eq("id", staff.id);
    if (error) throw error;
  }
  console.log("Backfilled hire_date on demo staff.");

  // 2) A few already-departed demo staff per office, for retention/flow KPI realism.
  const officeIds = [...new Set(demoStaff.map((s) => s.office_id).filter((id): id is string => Boolean(id)))];
  let departedCount = 0;
  for (const officeId of officeIds) {
    const departures = randInt(1, 3);
    for (let i = 0; i < departures; i++) {
      const fullName = randomName();
      const hireDate = daysAgo(randInt(200, 720));
      const leaveDate = daysAgo(randInt(1, 180));
      if (leaveDate <= hireDate) continue;
      const { error } = await db.from("staff_members").insert({
        full_name: fullName,
        email: `${fullName.toLowerCase().replace(/\s+/g, ".")}.${Math.random().toString(36).slice(2, 6)}@demo.dartahara.com`,
        phone: `+2126${randInt(10000000, 99999999)}`,
        role: rand(["cleaner", "inspector", "coordinator"] as const),
        employee_number: `DEP-DEMO-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        active: false,
        office_id: officeId,
        hire_date: toDateString(hireDate),
        leave_date: toDateString(leaveDate),
      });
      if (error) throw error;
      departedCount++;
    }
  }
  console.log(`Added ${departedCount} already-departed demo staff.`);

  // 3) 30 days of attendance for active demo staff (skip weekends).
  const attendanceRows: Array<Record<string, unknown>> = [];
  for (const staff of demoStaff) {
    for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
      const date = daysAgo(dayOffset);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const status = weightedAttendanceStatus();
      const scheduledStart = new Date(date);
      scheduledStart.setHours(8, 0, 0, 0);
      const actualStart = new Date(scheduledStart);
      if (status === "late") actualStart.setMinutes(actualStart.getMinutes() + randInt(11, 45));
      else if (status === "present") actualStart.setMinutes(actualStart.getMinutes() + randInt(-5, 8));

      attendanceRows.push({
        staff_id: staff.id,
        office_id: staff.office_id,
        date: toDateString(date),
        status,
        scheduled_start: scheduledStart.toISOString(),
        actual_start: status === "absent" || status === "no_show" ? null : actualStart.toISOString(),
      });
    }
  }
  // Batch insert in chunks to stay well under any request-size limits.
  for (let i = 0; i < attendanceRows.length; i += 500) {
    const { error } = await db.from("staff_attendance").upsert(attendanceRows.slice(i, i + 500), { onConflict: "staff_id,date" });
    if (error) throw error;
  }
  console.log(`Inserted ${attendanceRows.length} attendance records.`);

  // 4) A handful of sick-leave records per office, spanning different duration classes.
  const DURATION_SAMPLES = [1, 1, 2, 3, 5, 7, 10, 16];
  let sickLeaveCount = 0;
  for (const officeId of officeIds) {
    const officeStaff = demoStaff.filter((s) => s.office_id === officeId);
    if (officeStaff.length === 0) continue;
    const reportCount = randInt(3, 6);
    for (let i = 0; i < reportCount; i++) {
      const staff = rand(officeStaff);
      const durationDays = rand(DURATION_SAMPLES);
      const startDate = daysAgo(randInt(1, 28));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays - 1);
      const { error } = await db.from("staff_sick_leave").insert({
        staff_id: staff.id,
        office_id: officeId,
        start_date: toDateString(startDate),
        end_date: toDateString(endDate),
      });
      if (error) throw error;
      sickLeaveCount++;
    }
  }
  console.log(`Inserted ${sickLeaveCount} sick-leave records.`);

  console.log("KPI baseline seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
