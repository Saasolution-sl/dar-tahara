import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, embeddedOfficeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { bandMinimum } from "@/lib/kpi/banding";
import { average } from "@/lib/dashboard/math";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit numeric target given in the spec for the 0–100 scale, inferred baseline. */
const TARGET_SCORE = 80;

export type EmployeeQualityScore = {
  staffId: string;
  fullName: string;
  completedJobs: number;
  avgRating: number | null;
  complaints: number;
  avgInspectionScore: number | null;
  reworkRate: number | null;
  score: number;
};

async function employeeScores(scope: DashboardScope, range: PeriodRange): Promise<EmployeeQualityScore[]> {
  const filter = officeFilter(scope);
  const startIso = range.start.toISOString();
  const endIso = range.end.toISOString();

  const [visits, inspections, complaints] = await Promise.all([
    serviceSelect<Array<{ id: string; assigned_staff_id: string | null; status: string; customer_rating: number | null; is_revisit: boolean; staff_members: { full_name: string } | null }>>(
      `service_visits?select=id,assigned_staff_id,status,customer_rating,is_revisit,staff_members(full_name)&scheduled_start=gte.${startIso}&scheduled_start=lte.${endIso}&assigned_staff_id=not.is.null${filter}`,
    ),
    serviceSelect<Array<{ score: number; service_visits: { assigned_staff_id: string | null; office_id: string | null } }>>(
      `quality_inspections?select=score,service_visits!inner(assigned_staff_id,office_id)&created_at=gte.${startIso}&created_at=lte.${endIso}${embeddedOfficeFilter(scope, "service_visits.office_id")}`,
    ),
    serviceSelect<Array<{ service_visits: { assigned_staff_id: string | null; office_id: string | null } | null }>>(
      `customer_complaints?select=service_visits!inner(assigned_staff_id,office_id)&created_at=gte.${startIso}&created_at=lte.${endIso}${embeddedOfficeFilter(scope, "service_visits.office_id")}`,
    ),
  ]);

  type Accumulator = { fullName: string; completed: number; ratings: number[]; revisits: number; total: number };
  const byStaff = new Map<string, Accumulator>();
  for (const visit of visits) {
    if (!visit.assigned_staff_id) continue;
    const entry = byStaff.get(visit.assigned_staff_id) || { fullName: visit.staff_members?.full_name || ", ", completed: 0, ratings: [], revisits: 0, total: 0 };
    entry.total++;
    if (visit.status === "completed") {
      entry.completed++;
      if (visit.customer_rating !== null) entry.ratings.push(visit.customer_rating);
      if (visit.is_revisit) entry.revisits++;
    }
    byStaff.set(visit.assigned_staff_id, entry);
  }

  const inspectionScoresByStaff = new Map<string, number[]>();
  for (const inspection of inspections) {
    const staffId = inspection.service_visits?.assigned_staff_id;
    if (!staffId) continue;
    inspectionScoresByStaff.set(staffId, [...(inspectionScoresByStaff.get(staffId) || []), inspection.score]);
  }

  const complaintsByStaff = new Map<string, number>();
  for (const complaint of complaints) {
    const staffId = complaint.service_visits?.assigned_staff_id;
    if (!staffId) continue;
    complaintsByStaff.set(staffId, (complaintsByStaff.get(staffId) || 0) + 1);
  }

  const results: EmployeeQualityScore[] = [];
  for (const [staffId, entry] of byStaff) {
    const avgRating = average(entry.ratings);
    const avgInspectionScore = average(inspectionScoresByStaff.get(staffId) || []);
    const complaintCount = complaintsByStaff.get(staffId) || 0;
    const reworkRate = entry.completed ? entry.revisits / entry.completed : null;

    const ratingComponent = avgRating !== null ? (avgRating / 5) * 100 : 100;
    const inspectionComponent = avgInspectionScore ?? 100;
    const complaintComponent = entry.completed ? Math.max(0, 100 - (complaintCount / entry.completed) * 1000) : 100;
    const reworkComponent = reworkRate !== null ? Math.max(0, 100 - reworkRate * 100) : 100;
    const score = Math.round((ratingComponent + inspectionComponent + complaintComponent + reworkComponent) / 4);

    results.push({
      staffId,
      fullName: entry.fullName,
      completedJobs: entry.completed,
      avgRating,
      complaints: complaintCount,
      avgInspectionScore,
      reworkRate,
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export async function computeEmployeeQualityScore(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { employees: EmployeeQualityScore[] }> {
  const [employees, previousEmployees] = await Promise.all([employeeScores(scope, range), employeeScores(scope, previousPeriodRange(range))]);
  const companyAverage = average(employees.map((e) => e.score));
  const previousCompanyAverage = average(previousEmployees.map((e) => e.score));

  return {
    id: "employee_quality_score",
    label: "Employee quality score",
    value: companyAverage !== null ? Math.round(companyAverage) : null,
    unit: "/100",
    target: `≥${TARGET_SCORE}`,
    status: bandMinimum(companyAverage, TARGET_SCORE),
    trendPercent: trendPercent(companyAverage, previousCompanyAverage),
    periodLabel: range.label,
    employees,
  };
}
