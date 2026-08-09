import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum } from "@/lib/kpi/banding";
import { average } from "@/lib/dashboard/math";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit target given in the spec, inferred baseline. */
const TARGET_COMPLETION_PERCENT = 90;

export type OperationalPerformanceSummary = {
  completed: number;
  cancelled: number;
  delayed: number;
  revisited: number;
  total: number;
  avgCleaningMinutes: number | null;
  avgTravelMinutes: number | null;
  completionPercent: number | null;
};

async function operationalSummary(scope: DashboardScope, range: PeriodRange): Promise<OperationalPerformanceSummary> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{ status: string; is_revisit: boolean; cleaning_minutes: number | null; travel_minutes: number | null }>>(
    `service_visits?select=status,is_revisit,cleaning_minutes,travel_minutes&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}${filter}`,
  );

  const completed = rows.filter((r) => r.status === "completed");
  const cancelled = rows.filter((r) => r.status === "cancelled");
  const delayed = rows.filter((r) => r.status === "delayed");
  const revisited = rows.filter((r) => r.is_revisit);

  return {
    completed: completed.length,
    cancelled: cancelled.length,
    delayed: delayed.length,
    revisited: revisited.length,
    total: rows.length,
    avgCleaningMinutes: average(completed.map((r) => r.cleaning_minutes).filter((v): v is number => v !== null)),
    avgTravelMinutes: average(completed.map((r) => r.travel_minutes).filter((v): v is number => v !== null)),
    completionPercent: rows.length ? Math.round((completed.length / rows.length) * 100) : null,
  };
}

export async function computeOperationalPerformance(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { summary: OperationalPerformanceSummary }> {
  const [summary, previousSummary] = await Promise.all([operationalSummary(scope, range), operationalSummary(scope, previousPeriodRange(range))]);
  return {
    id: "operational_performance",
    label: "Operational performance",
    value: summary.completionPercent,
    unit: "%",
    target: `≥${TARGET_COMPLETION_PERCENT}% completed`,
    status: bandMinimum(summary.completionPercent, TARGET_COMPLETION_PERCENT),
    trendPercent: trendPercent(summary.completionPercent, previousSummary.completionPercent),
    periodLabel: range.label,
    summary,
  };
}
