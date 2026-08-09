import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMaximum } from "@/lib/kpi/banding";
import { MAX_PAID_TRAVEL_MINUTES, exceedsMaxTravel } from "@/lib/kpi/constants";
import { average } from "@/lib/dashboard/math";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

async function averageTravelMinutes(scope: DashboardScope, range: PeriodRange): Promise<{ avg: number | null; exceeding: number; total: number }> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{ travel_minutes: number | null }>>(
    `service_visits?select=travel_minutes&status=eq.completed&travel_minutes=not.is.null&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}${filter}`,
  );
  const minutes = rows.map((r) => r.travel_minutes!).filter((m): m is number => m !== null);
  return { avg: average(minutes), exceeding: minutes.filter((m) => exceedsMaxTravel(m)).length, total: minutes.length };
}

export async function computeTravelPerformance(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { exceedingCount: number; totalVisits: number }> {
  const [current, previous] = await Promise.all([averageTravelMinutes(scope, range), averageTravelMinutes(scope, previousPeriodRange(range))]);
  return {
    id: "travel_performance",
    label: "Travel performance",
    value: current.avg !== null ? Math.round(current.avg) : null,
    unit: "min",
    target: `Max ${MAX_PAID_TRAVEL_MINUTES} min`,
    status: bandMaximum(current.avg, MAX_PAID_TRAVEL_MINUTES),
    trendPercent: trendPercent(current.avg, previous.avg),
    periodLabel: range.label,
    exceedingCount: current.exceeding,
    totalVisits: current.total,
  };
}
