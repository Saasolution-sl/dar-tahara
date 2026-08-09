import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, embeddedOfficeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { daysAgoIso } from "@/lib/dashboard/dateRange";
import { average, percent } from "@/lib/dashboard/math";

export type QualityCenter = {
  avgInspectionScore: number | null;
  avgCustomerRating: number | null;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  recurringComplaints: number;
  firstTimeRightPercent: number | null;
  revisitPercent: number | null;
  ratingTrend: Array<{ date: string; avgRating: number | null }>;
};

export async function getQualityCenter(scope: DashboardScope): Promise<QualityCenter> {
  const filter = officeFilter(scope);
  const since = daysAgoIso(30);

  const [inspections, complaints, visits] = await Promise.all([
    serviceSelect<Array<{ score: number; first_time_right: boolean }>>(
      `quality_inspections?select=score,first_time_right,service_visits!inner(office_id)&created_at=gte.${since}${embeddedOfficeFilter(scope, "service_visits.office_id")}`,
    ),
    serviceSelect<Array<{ status: string; is_recurring: boolean }>>(
      `customer_complaints?select=status,is_recurring&created_at=gte.${since}${filter}`,
    ),
    serviceSelect<Array<{ customer_rating: number | null; is_revisit: boolean; scheduled_start: string }>>(
      `service_visits?select=customer_rating,is_revisit,scheduled_start&scheduled_start=gte.${since}${filter}&order=scheduled_start.asc`,
    ),
  ]);

  const ratedVisits = visits.filter((visit): visit is typeof visit & { customer_rating: number } => visit.customer_rating !== null);

  const trendByWeek = new Map<string, number[]>();
  for (const visit of ratedVisits) {
    const weekStart = new Date(visit.scheduled_start);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    trendByWeek.set(key, [...(trendByWeek.get(key) || []), visit.customer_rating]);
  }

  return {
    avgInspectionScore: average(inspections.map((i) => i.score)),
    avgCustomerRating: average(ratedVisits.map((v) => v.customer_rating)),
    totalComplaints: complaints.length,
    resolvedComplaints: complaints.filter((c) => c.status === "resolved").length,
    pendingComplaints: complaints.filter((c) => c.status === "pending").length,
    recurringComplaints: complaints.filter((c) => c.is_recurring).length,
    firstTimeRightPercent: percent(inspections.filter((i) => i.first_time_right).length, inspections.length),
    revisitPercent: percent(visits.filter((v) => v.is_revisit).length, visits.length),
    ratingTrend: [...trendByWeek.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, ratings]) => ({ date, avgRating: average(ratings) })),
  };
}
