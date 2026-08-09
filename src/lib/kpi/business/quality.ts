import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, embeddedOfficeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum, bandMaximum } from "@/lib/kpi/banding";
import { average, percent } from "@/lib/dashboard/math";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit numeric targets given in the spec for these three sub-metrics, inferred baselines. */
const TARGET_FIRST_TIME_RIGHT_PERCENT = 90;
const TARGET_REWORK_PERCENT = 5;
const TARGET_INSPECTION_SCORE = 85;

export type QualitySummary = {
  firstTimeRightPercent: number | null;
  reworkPercent: number | null;
  avgInspectionScore: number | null;
};

async function qualitySummary(scope: DashboardScope, range: PeriodRange): Promise<QualitySummary> {
  const filter = officeFilter(scope);
  const [inspections, visits] = await Promise.all([
    serviceSelect<Array<{ score: number; first_time_right: boolean }>>(
      `quality_inspections?select=score,first_time_right,service_visits!inner(office_id)&created_at=gte.${range.start.toISOString()}&created_at=lte.${range.end.toISOString()}${embeddedOfficeFilter(scope, "service_visits.office_id")}`,
    ),
    serviceSelect<Array<{ is_revisit: boolean }>>(
      `service_visits?select=is_revisit&status=eq.completed&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}${filter}`,
    ),
  ]);

  return {
    firstTimeRightPercent: percent(inspections.filter((i) => i.first_time_right).length, inspections.length),
    reworkPercent: percent(visits.filter((v) => v.is_revisit).length, visits.length),
    avgInspectionScore: average(inspections.map((i) => i.score)),
  };
}

export async function computeQualityKpi(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { summary: QualitySummary }> {
  const [summary, previousSummary] = await Promise.all([qualitySummary(scope, range), qualitySummary(scope, previousPeriodRange(range))]);
  return {
    id: "quality",
    label: "Quality",
    value: summary.avgInspectionScore !== null ? Math.round(summary.avgInspectionScore) : null,
    unit: "/100",
    target: `≥${TARGET_INSPECTION_SCORE} inspection score, ≥${TARGET_FIRST_TIME_RIGHT_PERCENT}% first time right, <${TARGET_REWORK_PERCENT}% rework`,
    status: bandMinimum(summary.avgInspectionScore, TARGET_INSPECTION_SCORE),
    trendPercent: trendPercent(summary.avgInspectionScore, previousSummary.avgInspectionScore),
    periodLabel: range.label,
    summary,
  };
}

export function bandFirstTimeRight(value: number | null) {
  return bandMinimum(value, TARGET_FIRST_TIME_RIGHT_PERCENT);
}
export function bandRework(value: number | null) {
  return bandMaximum(value, TARGET_REWORK_PERCENT);
}
