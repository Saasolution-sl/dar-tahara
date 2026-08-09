import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult, KpiStatus } from "@/lib/kpi/types";

export type SickLeaveDurationClass = "1_day" | "2_3_days" | "4_7_days" | "8_14_days" | "15_plus_days";

export type SickLeaveSummary = {
  reportCount: number;
  totalSickDays: number;
  avgDurationDays: number | null;
  durationClasses: Record<SickLeaveDurationClass, number>;
  perCity: Array<{ city: string; reportCount: number; totalSickDays: number }>;
  perEmployee: Array<{ staffId: string; fullName: string; reportCount: number; totalSickDays: number; aboveCompanyAverage: boolean }>;
};

function durationClassOf(days: number): SickLeaveDurationClass {
  if (days <= 1) return "1_day";
  if (days <= 3) return "2_3_days";
  if (days <= 7) return "4_7_days";
  if (days <= 14) return "8_14_days";
  return "15_plus_days";
}

function daysBetween(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

async function sickLeaveSummary(scope: DashboardScope, range: PeriodRange): Promise<SickLeaveSummary> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{
    staff_id: string; start_date: string; end_date: string;
    staff_members: { full_name: string } | null;
    offices: { city: string | null } | null;
  }>>(
    `staff_sick_leave?select=staff_id,start_date,end_date,staff_members(full_name),offices(city)&start_date=gte.${range.start.toISOString().slice(0, 10)}&start_date=lte.${range.end.toISOString().slice(0, 10)}${filter}`,
  );

  const durationClasses: Record<SickLeaveDurationClass, number> = { "1_day": 0, "2_3_days": 0, "4_7_days": 0, "8_14_days": 0, "15_plus_days": 0 };
  const perCityMap = new Map<string, { reportCount: number; totalSickDays: number }>();
  const perEmployeeMap = new Map<string, { fullName: string; reportCount: number; totalSickDays: number }>();
  let totalSickDays = 0;

  for (const row of rows) {
    const days = daysBetween(row.start_date, row.end_date);
    totalSickDays += days;
    durationClasses[durationClassOf(days)]++;

    const city = row.offices?.city || "Unknown";
    const cityEntry = perCityMap.get(city) || { reportCount: 0, totalSickDays: 0 };
    cityEntry.reportCount++;
    cityEntry.totalSickDays += days;
    perCityMap.set(city, cityEntry);

    const employeeEntry = perEmployeeMap.get(row.staff_id) || { fullName: row.staff_members?.full_name || ", ", reportCount: 0, totalSickDays: 0 };
    employeeEntry.reportCount++;
    employeeEntry.totalSickDays += days;
    perEmployeeMap.set(row.staff_id, employeeEntry);
  }

  const companyAverageReports = perEmployeeMap.size ? rows.length / perEmployeeMap.size : 0;

  return {
    reportCount: rows.length,
    totalSickDays,
    avgDurationDays: rows.length ? Math.round((totalSickDays / rows.length) * 10) / 10 : null,
    durationClasses,
    perCity: [...perCityMap.entries()].map(([city, v]) => ({ city, ...v })),
    perEmployee: [...perEmployeeMap.entries()].map(([staffId, v]) => ({
      staffId,
      ...v,
      aboveCompanyAverage: v.reportCount > companyAverageReports,
    })),
  };
}

export async function computeSickLeave(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { summary: SickLeaveSummary }> {
  const [summary, previousSummary] = await Promise.all([sickLeaveSummary(scope, range), sickLeaveSummary(scope, previousPeriodRange(range))]);
  const trend = trendPercent(summary.totalSickDays, previousSummary.totalSickDays);

  // No fixed numeric target for this KPI in the spec, status reflects the
  // trend direction (rising sickness = worse), not a target comparison.
  let status: KpiStatus = "green";
  if (trend !== null) {
    if (trend > 20) status = "red";
    else if (trend > 0) status = "orange";
  }

  return {
    id: "sick_leave",
    label: "Sick leave",
    value: summary.totalSickDays,
    unit: "days",
    target: "Stable or declining trend",
    status,
    trendPercent: trend,
    periodLabel: range.label,
    summary,
  };
}
