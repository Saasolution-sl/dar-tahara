import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { MAX_WORKDAY_HOURS } from "@/lib/kpi/constants";
import { bandRange } from "@/lib/kpi/banding";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit target given in the spec, inferred baseline: healthy utilization sits in this band (too low wastes capacity, too high risks overbooking). */
const TARGET_RANGE: [number, number] = [70, 95];

export type CapacityUtilizationSummary = {
  availableHours: number;
  bookedHours: number;
  unusedHours: number;
  overbookedHours: number;
  utilizationPercent: number | null;
};

async function capacitySummary(scope: DashboardScope, range: PeriodRange): Promise<CapacityUtilizationSummary> {
  const filter = officeFilter(scope);
  const [staff, visits] = await Promise.all([
    serviceSelect<Array<{ id: string }>>(`staff_members?select=id&role=in.(cleaner,inspector,coordinator)&active=eq.true${filter}`),
    serviceSelect<Array<{ scheduled_start: string; scheduled_end: string }>>(
      `service_visits?select=scheduled_start,scheduled_end&status=neq.cancelled&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}${filter}`,
    ),
  ]);

  const workdays = Math.max(1, Math.ceil((range.end.getTime() - range.start.getTime()) / 86400000));
  const availableHours = staff.length * workdays * MAX_WORKDAY_HOURS;
  const bookedHours = visits.reduce((sum, v) => sum + (new Date(v.scheduled_end).getTime() - new Date(v.scheduled_start).getTime()) / 3600000, 0);

  return {
    availableHours,
    bookedHours: Math.round(bookedHours),
    unusedHours: Math.max(0, Math.round(availableHours - bookedHours)),
    overbookedHours: Math.max(0, Math.round(bookedHours - availableHours)),
    utilizationPercent: availableHours ? Math.round((bookedHours / availableHours) * 100) : null,
  };
}

export async function computeCapacityUtilization(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { summary: CapacityUtilizationSummary }> {
  const [summary, previousSummary] = await Promise.all([capacitySummary(scope, range), capacitySummary(scope, previousPeriodRange(range))]);
  return {
    id: "capacity_utilization",
    label: "Capacity utilization",
    value: summary.utilizationPercent,
    unit: "%",
    target: `${TARGET_RANGE[0]}–${TARGET_RANGE[1]}%`,
    status: bandRange(summary.utilizationPercent, TARGET_RANGE),
    trendPercent: trendPercent(summary.utilizationPercent, previousSummary.utilizationPercent),
    periodLabel: range.label,
    summary,
  };
}
