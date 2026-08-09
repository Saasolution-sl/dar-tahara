import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum } from "@/lib/kpi/banding";
import { average } from "@/lib/dashboard/math";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

const TARGET_RATING = 4.8;

async function averageRating(scope: DashboardScope, range: PeriodRange): Promise<number | null> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{ customer_rating: number }>>(
    `service_visits?select=customer_rating&customer_rating=not.is.null&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}${filter}`,
  );
  return average(rows.map((r) => r.customer_rating));
}

export async function computeCustomerSatisfaction(scope: DashboardScope, range: PeriodRange): Promise<KpiResult> {
  const [current, previous] = await Promise.all([averageRating(scope, range), averageRating(scope, previousPeriodRange(range))]);
  return {
    id: "customer_satisfaction",
    label: "Customer satisfaction",
    value: current !== null ? Math.round(current * 100) / 100 : null,
    unit: "/5",
    target: `≥${TARGET_RATING}/5`,
    status: bandMinimum(current, TARGET_RATING),
    trendPercent: trendPercent(current, previous),
    periodLabel: range.label,
  };
}
