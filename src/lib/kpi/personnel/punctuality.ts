import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum } from "@/lib/kpi/banding";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

const GRACE_MINUTES = 10;
const TARGET_ON_TIME_PERCENT = 98;

export type PunctualityBreakdown = { onTime: number; lateArrival: number; earlyFinish: number; lateFinish: number; total: number };

async function punctualityBreakdown(scope: DashboardScope, range: PeriodRange): Promise<PunctualityBreakdown> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{ scheduled_start: string; scheduled_end: string; actual_start: string | null; actual_end: string | null }>>(
    `service_visits?select=scheduled_start,scheduled_end,actual_start,actual_end&status=eq.completed&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}${filter}`,
  );

  const result: PunctualityBreakdown = { onTime: 0, lateArrival: 0, earlyFinish: 0, lateFinish: 0, total: 0 };
  for (const row of rows) {
    if (!row.actual_start || !row.actual_end) continue;
    result.total++;
    const startDeltaMinutes = (new Date(row.actual_start).getTime() - new Date(row.scheduled_start).getTime()) / 60000;
    if (startDeltaMinutes > GRACE_MINUTES) {
      result.lateArrival++;
      continue;
    }
    const endDeltaMinutes = (new Date(row.actual_end).getTime() - new Date(row.scheduled_end).getTime()) / 60000;
    if (endDeltaMinutes < -GRACE_MINUTES) result.earlyFinish++;
    else if (endDeltaMinutes > GRACE_MINUTES) result.lateFinish++;
    else result.onTime++;
  }
  return result;
}

export async function computePunctuality(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { breakdown: PunctualityBreakdown }> {
  const [breakdown, previousBreakdown] = await Promise.all([punctualityBreakdown(scope, range), punctualityBreakdown(scope, previousPeriodRange(range))]);
  const onTimePercent = breakdown.total ? Math.round((breakdown.onTime / breakdown.total) * 100) : null;
  const previousOnTimePercent = previousBreakdown.total ? Math.round((previousBreakdown.onTime / previousBreakdown.total) * 100) : null;

  return {
    id: "punctuality",
    label: "Punctuality",
    value: onTimePercent,
    unit: "%",
    target: `${TARGET_ON_TIME_PERCENT}% on time`,
    status: bandMinimum(onTimePercent, TARGET_ON_TIME_PERCENT),
    trendPercent: trendPercent(onTimePercent, previousOnTimePercent),
    periodLabel: range.label,
    breakdown,
  };
}
