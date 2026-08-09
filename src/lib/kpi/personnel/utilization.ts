import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandRange } from "@/lib/kpi/banding";
import { MAX_WORKDAY_HOURS, MAX_PAID_TRAVEL_MINUTES } from "@/lib/kpi/constants";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

const TARGET_RANGE: [number, number] = [80, 90];

/**
 * (Cleaning time + paid travel time) / available working hours.
 * "Available working hours" is measured only over the days a staff member
 * actually had a visit scheduled (no formal work-calendar/days-off concept
 * exists yet), at MAX_WORKDAY_HOURS per worked day.
 */
async function utilizationPercent(scope: DashboardScope, range: PeriodRange): Promise<number | null> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{ assigned_staff_id: string | null; scheduled_start: string; cleaning_minutes: number | null; travel_minutes: number | null; status: string }>>(
    `service_visits?select=assigned_staff_id,scheduled_start,cleaning_minutes,travel_minutes,status&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}&assigned_staff_id=not.is.null${filter}`,
  );

  const workedDaysByStaff = new Map<string, Set<string>>();
  let productiveMinutes = 0;
  for (const row of rows) {
    if (!row.assigned_staff_id) continue;
    const day = row.scheduled_start.slice(0, 10);
    const days = workedDaysByStaff.get(row.assigned_staff_id) || new Set<string>();
    days.add(day);
    workedDaysByStaff.set(row.assigned_staff_id, days);
    if (row.status === "completed") {
      productiveMinutes += row.cleaning_minutes || 0;
      productiveMinutes += Math.min(row.travel_minutes || 0, MAX_PAID_TRAVEL_MINUTES);
    }
  }

  let availableMinutes = 0;
  for (const days of workedDaysByStaff.values()) availableMinutes += days.size * MAX_WORKDAY_HOURS * 60;
  if (availableMinutes === 0) return null;
  return Math.round((productiveMinutes / availableMinutes) * 100);
}

export async function computeEmployeeUtilization(scope: DashboardScope, range: PeriodRange): Promise<KpiResult> {
  const [current, previous] = await Promise.all([utilizationPercent(scope, range), utilizationPercent(scope, previousPeriodRange(range))]);
  return {
    id: "employee_utilization",
    label: "Employee utilization",
    value: current,
    unit: "%",
    target: "80–90%",
    status: bandRange(current, TARGET_RANGE),
    trendPercent: trendPercent(current, previous),
    periodLabel: range.label,
  };
}
