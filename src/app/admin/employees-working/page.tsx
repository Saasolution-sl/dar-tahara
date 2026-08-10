import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/portal/portal-shell";
import { adminCopy } from "@/i18n/admin-copy";
import { requireRole } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { serviceSelect } from "@/lib/supabase-rpc";

type LiveRow = {
  staff_id: string;
  status: string;
  updated_at: string;
  staff_members: { full_name: string; employee_number: string | null; role: string } | null;
  offices: { name: string } | null;
};

type VisitRow = {
  assigned_staff_id: string | null;
  cleaning_minutes: number | null;
  travel_minutes: number | null;
};

/**
 * The employees behind the "Employees working" tile.
 *
 * `working` and `driving` both count, matching getKpis() exactly - a driver on
 * the way to a job is on shift. If this page used a narrower rule the number on
 * the dashboard and the length of this list would disagree, which is worse than
 * either being wrong on its own.
 *
 * Averages come from that employee's completed visits over the last 30 days,
 * not from today: a single day is too small a sample to describe how long
 * someone usually takes.
 */
const ON_SHIFT = ["working", "driving"];
const AVERAGE_WINDOW_DAYS = 30;

function minutesLabel(value: number | null): string {
  if (value === null) return "—";
  const rounded = Math.round(value);
  if (rounded < 60) return `${rounded} min`;
  return `${Math.floor(rounded / 60)} h ${String(rounded % 60).padStart(2, "0")}`;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export default async function EmployeesWorking() {
  await requireRole(["staff", "administrator"]);
  const locale = await getRequestLocale();
  const copy = adminCopy[locale];
  const c = copy.tables.employeesWorking;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - AVERAGE_WINDOW_DAYS);

  const [live, visits] = await Promise.all([
    serviceSelect<LiveRow[]>(
      `staff_live_status?select=staff_id,status,updated_at,staff_members(full_name,employee_number,role),offices(name)&status=in.(${ON_SHIFT.join(",")})`,
    ),
    serviceSelect<VisitRow[]>(
      `service_visits?select=assigned_staff_id,cleaning_minutes,travel_minutes&status=eq.completed&assigned_staff_id=not.is.null&scheduled_start=gte.${since.toISOString()}`,
    ),
  ]);

  const byStaff = new Map<string, { cleaning: number[]; travel: number[] }>();
  for (const visit of visits) {
    const id = visit.assigned_staff_id as string;
    const entry = byStaff.get(id) || { cleaning: [], travel: [] };
    if (visit.cleaning_minutes !== null) entry.cleaning.push(visit.cleaning_minutes);
    if (visit.travel_minutes !== null) entry.travel.push(visit.travel_minutes);
    byStaff.set(id, entry);
  }

  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  const rows = live
    .sort((a, b) => (a.staff_members?.full_name || "").localeCompare(b.staff_members?.full_name || "", locale))
    .map((row) => {
      const stats = byStaff.get(row.staff_id) || { cleaning: [], travel: [] };
      return [
        row.staff_members?.full_name || "—",
        row.staff_members?.employee_number || "—",
        row.offices?.name || "—",
        <StatusBadge key={`${row.staff_id}-status`} value={row.status} />,
        minutesLabel(average(stats.cleaning)),
        minutesLabel(average(stats.travel)),
        String(stats.cleaning.length),
        timeFormat.format(new Date(row.updated_at)),
      ];
    });

  return (
    <div>
      <AdminTable
        title={c.title}
        headers={c.headers}
        emptyLabel={copy.common.noRecords}
        rows={rows}
      />
      <p className="mt-4 text-sm text-muted-foreground">{c.footnote}</p>
    </div>
  );
}
