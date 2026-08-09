import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMaximum } from "@/lib/kpi/banding";
import { average } from "@/lib/dashboard/math";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

const TARGET_COMPLAINT_PERCENT = 2;

export type ComplaintsSummary = {
  total: number;
  open: number;
  resolved: number;
  avgResolutionHours: number | null;
  categories: Array<{ category: string; count: number }>;
  repeatComplaints: number;
  completedVisits: number;
  complaintPercent: number | null;
};

async function complaintsSummary(scope: DashboardScope, range: PeriodRange): Promise<ComplaintsSummary> {
  const filter = officeFilter(scope);
  const [complaints, completedVisits] = await Promise.all([
    serviceSelect<Array<{ status: string; category: string; is_recurring: boolean; created_at: string; resolved_at: string | null }>>(
      `customer_complaints?select=status,category,is_recurring,created_at,resolved_at&created_at=gte.${range.start.toISOString()}&created_at=lte.${range.end.toISOString()}${filter}`,
    ),
    serviceSelect<Array<{ id: string }>>(
      `service_visits?select=id&status=eq.completed&scheduled_start=gte.${range.start.toISOString()}&scheduled_start=lte.${range.end.toISOString()}${filter}`,
    ),
  ]);

  const categoryMap = new Map<string, number>();
  const resolutionHours: number[] = [];
  let open = 0;
  let resolved = 0;
  let repeatComplaints = 0;

  for (const complaint of complaints) {
    categoryMap.set(complaint.category, (categoryMap.get(complaint.category) || 0) + 1);
    if (complaint.status === "pending") open++;
    if (complaint.status === "resolved") {
      resolved++;
      if (complaint.resolved_at) resolutionHours.push((new Date(complaint.resolved_at).getTime() - new Date(complaint.created_at).getTime()) / 3600000);
    }
    if (complaint.is_recurring) repeatComplaints++;
  }

  return {
    total: complaints.length,
    open,
    resolved,
    avgResolutionHours: average(resolutionHours),
    categories: [...categoryMap.entries()].map(([category, count]) => ({ category, count })),
    repeatComplaints,
    completedVisits: completedVisits.length,
    complaintPercent: completedVisits.length ? Math.round((complaints.length / completedVisits.length) * 1000) / 10 : null,
  };
}

export async function computeComplaintKpi(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { summary: ComplaintsSummary }> {
  const [summary, previousSummary] = await Promise.all([complaintsSummary(scope, range), complaintsSummary(scope, previousPeriodRange(range))]);
  return {
    id: "complaints",
    label: "Complaints",
    value: summary.complaintPercent,
    unit: "%",
    target: `<${TARGET_COMPLAINT_PERCENT}%`,
    status: bandMaximum(summary.complaintPercent, TARGET_COMPLAINT_PERCENT),
    trendPercent: trendPercent(summary.complaintPercent, previousSummary.complaintPercent),
    periodLabel: range.label,
    summary,
  };
}
