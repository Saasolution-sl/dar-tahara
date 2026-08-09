import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum } from "@/lib/kpi/banding";
import { expectedCleaningMinutes } from "@/lib/kpi/constants";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

const WITHIN_TARGET_TOLERANCE_PCT = 10;
/** No explicit target given in the spec for this KPI's 3-way split, inferred baseline: 90% of visits at-or-faster-than-expected. */
const ON_TARGET_PERCENT_TARGET = 90;

export type CleaningPerformanceBreakdown = { faster: number; withinTarget: number; longer: number; total: number };

async function performanceBreakdown(scope: DashboardScope, range: PeriodRange): Promise<CleaningPerformanceBreakdown> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{ cleaning_minutes: number | null; properties: { declared_size_m2: number } | null }>>(
    `service_visits?select=cleaning_minutes,properties(declared_size_m2)&status=eq.completed&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}${filter}`,
  );

  let faster = 0;
  let withinTarget = 0;
  let longer = 0;
  for (const row of rows) {
    if (row.cleaning_minutes === null || !row.properties) continue;
    const expected = expectedCleaningMinutes(row.properties.declared_size_m2);
    const toleranceMinutes = expected * (WITHIN_TARGET_TOLERANCE_PCT / 100);
    if (row.cleaning_minutes < expected - toleranceMinutes) faster++;
    else if (row.cleaning_minutes > expected + toleranceMinutes) longer++;
    else withinTarget++;
  }
  return { faster, withinTarget, longer, total: faster + withinTarget + longer };
}

export async function computeCleaningPerformance(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { breakdown: CleaningPerformanceBreakdown }> {
  const [breakdown, previousBreakdown] = await Promise.all([performanceBreakdown(scope, range), performanceBreakdown(scope, previousPeriodRange(range))]);
  const onTargetPercent = breakdown.total ? Math.round(((breakdown.faster + breakdown.withinTarget) / breakdown.total) * 100) : null;
  const previousOnTargetPercent = previousBreakdown.total ? Math.round(((previousBreakdown.faster + previousBreakdown.withinTarget) / previousBreakdown.total) * 100) : null;

  return {
    id: "cleaning_performance",
    label: "Cleaning performance",
    value: onTargetPercent,
    unit: "%",
    target: `≥${ON_TARGET_PERCENT_TARGET}% at/faster than expected`,
    status: bandMinimum(onTargetPercent, ON_TARGET_PERCENT_TARGET),
    trendPercent: trendPercent(onTargetPercent, previousOnTargetPercent),
    periodLabel: range.label,
    breakdown,
  };
}
