import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum } from "@/lib/kpi/banding";
import { average } from "@/lib/dashboard/math";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit target given in the spec, inferred baseline. */
const TARGET_RETENTION_PERCENT = 90;

export type RetentionSummary = {
  newEmployees: number;
  leavingEmployees: number;
  avgEmploymentDurationDays: number | null;
  retentionPercent: number | null;
  turnoverPercent: number | null;
};

async function retentionSummary(scope: DashboardScope, range: PeriodRange): Promise<RetentionSummary> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{ hire_date: string | null; leave_date: string | null }>>(
    `staff_members?select=hire_date,leave_date${filter}`,
  );

  const startDate = range.start.toISOString().slice(0, 10);
  const endDate = range.end.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  let newEmployees = 0;
  let leavingEmployees = 0;
  let activeAtStart = 0;
  const durations: number[] = [];

  for (const row of rows) {
    if (row.hire_date && row.hire_date >= startDate && row.hire_date <= endDate) newEmployees++;
    if (row.leave_date && row.leave_date >= startDate && row.leave_date <= endDate) leavingEmployees++;
    if (row.hire_date && row.hire_date <= startDate && (!row.leave_date || row.leave_date >= startDate)) activeAtStart++;
    if (row.hire_date) {
      const end = row.leave_date || today;
      durations.push(Math.round((new Date(end).getTime() - new Date(row.hire_date).getTime()) / 86400000));
    }
  }

  const turnoverPercent = activeAtStart ? Math.round((leavingEmployees / activeAtStart) * 100) : null;
  return {
    newEmployees,
    leavingEmployees,
    avgEmploymentDurationDays: average(durations),
    retentionPercent: turnoverPercent !== null ? 100 - turnoverPercent : null,
    turnoverPercent,
  };
}

export async function computeEmployeeRetention(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { summary: RetentionSummary }> {
  const [summary, previousSummary] = await Promise.all([retentionSummary(scope, range), retentionSummary(scope, previousPeriodRange(range))]);
  return {
    id: "employee_retention",
    label: "Employee retention",
    value: summary.retentionPercent,
    unit: "%",
    target: `≥${TARGET_RETENTION_PERCENT}%`,
    status: bandMinimum(summary.retentionPercent, TARGET_RETENTION_PERCENT),
    trendPercent: trendPercent(summary.retentionPercent, previousSummary.retentionPercent),
    periodLabel: range.label,
    summary,
  };
}
