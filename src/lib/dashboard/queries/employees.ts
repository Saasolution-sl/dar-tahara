import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { daysAgoIso } from "@/lib/dashboard/dateRange";
import { average, percent } from "@/lib/dashboard/math";

export type EmployeeStat = {
  staffId: string;
  fullName: string;
  employeeNumber: string;
  jobsCompleted: number;
  avgRating: number | null;
  avgCleaningMinutes: number | null;
  avgTravelMinutes: number | null;
  punctualityPercent: number | null;
  sickDays: number;
};

type VisitRow = {
  assigned_staff_id: string | null;
  status: string;
  customer_rating: number | null;
  cleaning_minutes: number | null;
  travel_minutes: number | null;
  scheduled_start: string;
  actual_start: string | null;
  staff_members: { full_name: string; employee_number: string } | null;
};

const ON_TIME_GRACE_MINUTES = 10;

export async function getEmployeePerformance(scope: DashboardScope): Promise<EmployeeStat[]> {
  const filter = officeFilter(scope);
  const since = daysAgoIso(30);

  const [visits, sickStatuses] = await Promise.all([
    serviceSelect<VisitRow[]>(
      `service_visits?select=assigned_staff_id,status,customer_rating,cleaning_minutes,travel_minutes,scheduled_start,actual_start,staff_members(full_name,employee_number)&scheduled_start=gte.${since}&assigned_staff_id=not.is.null${filter}`,
    ),
    serviceSelect<Array<{ staff_id: string }>>(`staff_live_status?select=staff_id&status=eq.sick${filter}`),
  ]);

  const byStaff = new Map<string, VisitRow[]>();
  for (const visit of visits) {
    if (!visit.assigned_staff_id) continue;
    byStaff.set(visit.assigned_staff_id, [...(byStaff.get(visit.assigned_staff_id) || []), visit]);
  }
  const sickByStaff = new Set(sickStatuses.map((row) => row.staff_id));

  const stats: EmployeeStat[] = [];
  for (const [staffId, rows] of byStaff) {
    const completed = rows.filter((row) => row.status === "completed");
    const ratings = completed.map((row) => row.customer_rating).filter((rating): rating is number => rating !== null);
    const onTime = completed.filter(
      (row) => row.actual_start && new Date(row.actual_start).getTime() <= new Date(row.scheduled_start).getTime() + ON_TIME_GRACE_MINUTES * 60000,
    );

    stats.push({
      staffId,
      fullName: rows[0].staff_members?.full_name || ", ",
      employeeNumber: rows[0].staff_members?.employee_number || ", ",
      jobsCompleted: completed.length,
      avgRating: average(ratings),
      avgCleaningMinutes: average(completed.map((row) => row.cleaning_minutes).filter((v): v is number => v !== null)),
      avgTravelMinutes: average(completed.map((row) => row.travel_minutes).filter((v): v is number => v !== null)),
      punctualityPercent: percent(onTime.length, completed.length),
      sickDays: sickByStaff.has(staffId) ? 1 : 0,
    });
  }

  return stats.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
}
