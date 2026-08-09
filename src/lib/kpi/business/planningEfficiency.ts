import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum } from "@/lib/kpi/banding";
import { average } from "@/lib/dashboard/math";
import { MAX_WORKDAY_HOURS, MAX_PAID_TRAVEL_MINUTES, exceedsMaxTravel } from "@/lib/kpi/constants";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit target given in the spec for the composite score, inferred baseline. */
const TARGET_PLANNER_EFFICIENCY = 80;

export type PlanningEfficiencySummary = {
  avgTravelMinutes: number | null;
  avgIdleMinutesPerWorkday: number | null;
  scheduleUtilizationPercent: number | null;
  travelViolationPercent: number | null;
  plannerEfficiency: number | null;
};

async function planningSummary(scope: DashboardScope, range: PeriodRange): Promise<PlanningEfficiencySummary> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{
    assigned_staff_id: string | null; scheduled_start: string; scheduled_end: string; travel_minutes: number | null; status: string;
  }>>(
    `service_visits?select=assigned_staff_id,scheduled_start,scheduled_end,travel_minutes,status&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}&assigned_staff_id=not.is.null${filter}&order=scheduled_start.asc`,
  );

  const completed = rows.filter((r) => r.status === "completed" && r.travel_minutes !== null);
  const avgTravelMinutes = average(completed.map((r) => r.travel_minutes!));
  const travelViolationPercent = completed.length ? Math.round((completed.filter((r) => exceedsMaxTravel(r.travel_minutes!)).length / completed.length) * 100) : null;

  // Group visits by staff + calendar day to measure idle time between consecutive jobs and total scheduled minutes.
  const byStaffDay = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.assigned_staff_id}|${row.scheduled_start.slice(0, 10)}`;
    byStaffDay.set(key, [...(byStaffDay.get(key) || []), row]);
  }

  const idleMinutesPerDay: number[] = [];
  const scheduledMinutesPerDay: number[] = [];
  for (const dayVisits of byStaffDay.values()) {
    const sorted = [...dayVisits].sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start));
    let scheduledMinutes = 0;
    let idleMinutes = 0;
    for (let i = 0; i < sorted.length; i++) {
      scheduledMinutes += (new Date(sorted[i].scheduled_end).getTime() - new Date(sorted[i].scheduled_start).getTime()) / 60000;
      if (i > 0) {
        const gapMinutes = (new Date(sorted[i].scheduled_start).getTime() - new Date(sorted[i - 1].scheduled_end).getTime()) / 60000;
        idleMinutes += Math.max(0, gapMinutes - (sorted[i - 1].travel_minutes || 0));
      }
    }
    idleMinutesPerDay.push(idleMinutes);
    scheduledMinutesPerDay.push(scheduledMinutes);
  }

  const avgIdleMinutesPerWorkday = average(idleMinutesPerDay);
  const scheduleUtilizationPercent = scheduledMinutesPerDay.length
    ? Math.round((average(scheduledMinutesPerDay)! / (MAX_WORKDAY_HOURS * 60)) * 100)
    : null;

  const idleRatio = avgIdleMinutesPerWorkday !== null ? avgIdleMinutesPerWorkday / (MAX_WORKDAY_HOURS * 60) : null;
  const plannerEfficiency =
    idleRatio !== null && travelViolationPercent !== null ? Math.max(0, Math.round(100 - idleRatio * 100 - travelViolationPercent)) : null;

  return {
    avgTravelMinutes: avgTravelMinutes !== null ? Math.round(avgTravelMinutes) : null,
    avgIdleMinutesPerWorkday: avgIdleMinutesPerWorkday !== null ? Math.round(avgIdleMinutesPerWorkday) : null,
    scheduleUtilizationPercent,
    travelViolationPercent,
    plannerEfficiency,
  };
}

export async function computePlanningEfficiency(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { summary: PlanningEfficiencySummary }> {
  const [summary, previousSummary] = await Promise.all([planningSummary(scope, range), planningSummary(scope, previousPeriodRange(range))]);
  return {
    id: "planning_efficiency",
    label: "Planning efficiency",
    value: summary.plannerEfficiency,
    unit: "/100",
    target: `≥${TARGET_PLANNER_EFFICIENCY}, travel ≤${MAX_PAID_TRAVEL_MINUTES}min`,
    status: bandMinimum(summary.plannerEfficiency, TARGET_PLANNER_EFFICIENCY),
    trendPercent: trendPercent(summary.plannerEfficiency, previousSummary.plannerEfficiency),
    periodLabel: range.label,
    summary,
  };
}
