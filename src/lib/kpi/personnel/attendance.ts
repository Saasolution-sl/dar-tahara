import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum } from "@/lib/kpi/banding";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit target given in the spec, inferred baseline. */
const TARGET_PRESENT_PERCENT = 95;

export type AttendanceBreakdown = { present: number; late: number; absent: number; noShow: number; total: number };

async function attendanceBreakdown(scope: DashboardScope, range: PeriodRange): Promise<AttendanceBreakdown> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{ status: string }>>(
    `staff_attendance?select=status&date=gte.${range.start.toISOString().slice(0, 10)}&date=lte.${range.end.toISOString().slice(0, 10)}${filter}`,
  );
  const result: AttendanceBreakdown = { present: 0, late: 0, absent: 0, noShow: 0, total: rows.length };
  for (const row of rows) {
    if (row.status === "present") result.present++;
    else if (row.status === "late") result.late++;
    else if (row.status === "absent") result.absent++;
    else if (row.status === "no_show") result.noShow++;
  }
  return result;
}

export async function computeAttendance(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { breakdown: AttendanceBreakdown }> {
  const [breakdown, previousBreakdown] = await Promise.all([attendanceBreakdown(scope, range), attendanceBreakdown(scope, previousPeriodRange(range))]);
  const presentPercent = breakdown.total ? Math.round(((breakdown.present + breakdown.late) / breakdown.total) * 100) : null;
  const previousPresentPercent = previousBreakdown.total ? Math.round(((previousBreakdown.present + previousBreakdown.late) / previousBreakdown.total) * 100) : null;

  return {
    id: "attendance",
    label: "Attendance",
    value: presentPercent,
    unit: "%",
    target: `${TARGET_PRESENT_PERCENT}% present`,
    status: bandMinimum(presentPercent, TARGET_PRESENT_PERCENT),
    trendPercent: trendPercent(presentPercent, previousPresentPercent),
    periodLabel: range.label,
    breakdown,
  };
}
