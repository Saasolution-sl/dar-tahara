import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";

export type LiveOpsRow = {
  staffId: string;
  fullName: string;
  employeeNumber: string;
  status: string;
  currentJob: { customerName: string; address: string; scheduledEnd: string } | null;
  nextJob: { customerName: string; scheduledStart: string } | null;
  travelMinutes: number | null;
  progressPercent: number | null;
};

type LiveStatusRow = {
  staff_id: string;
  status: string;
  current_visit_id: string | null;
  next_visit_id: string | null;
  staff_members: { full_name: string; employee_number: string } | null;
};

type VisitRow = {
  id: string;
  scheduled_start: string;
  scheduled_end: string;
  travel_minutes: number | null;
  cleaning_minutes: number | null;
  actual_start: string | null;
  customers: { full_name: string } | null;
  properties: { address_line1: string; city: string } | null;
};

export async function getLiveOperationsBoard(scope: DashboardScope): Promise<LiveOpsRow[]> {
  const filter = officeFilter(scope);
  const liveRows = await serviceSelect<LiveStatusRow[]>(
    `staff_live_status?select=staff_id,status,current_visit_id,next_visit_id,staff_members(full_name,employee_number)${filter}&order=updated_at.desc`,
  );

  const visitIds = [...new Set(liveRows.flatMap((row) => [row.current_visit_id, row.next_visit_id]).filter((id): id is string => Boolean(id)))];
  const visits = visitIds.length
    ? await serviceSelect<VisitRow[]>(
        `service_visits?id=in.(${visitIds.join(",")})&select=id,scheduled_start,scheduled_end,travel_minutes,cleaning_minutes,actual_start,customers(full_name),properties(address_line1,city)`,
      )
    : [];
  const visitById = new Map(visits.map((visit) => [visit.id, visit]));

  return liveRows
    .filter((row) => row.staff_members)
    .map((row) => {
      const current = row.current_visit_id ? visitById.get(row.current_visit_id) : undefined;
      const next = row.next_visit_id ? visitById.get(row.next_visit_id) : undefined;

      let progressPercent: number | null = null;
      if (current?.actual_start && row.status === "working") {
        const elapsedMinutes = (Date.now() - new Date(current.actual_start).getTime()) / 60000;
        const totalMinutes = current.cleaning_minutes || 60;
        progressPercent = Math.max(0, Math.min(100, Math.round((elapsedMinutes / totalMinutes) * 100)));
      }

      return {
        staffId: row.staff_id,
        fullName: row.staff_members!.full_name,
        employeeNumber: row.staff_members!.employee_number,
        status: row.status,
        currentJob: current
          ? {
              customerName: current.customers?.full_name || ", ",
              address: current.properties ? `${current.properties.address_line1}, ${current.properties.city}` : ", ",
              scheduledEnd: current.scheduled_end,
            }
          : null,
        nextJob: next ? { customerName: next.customers?.full_name || ", ", scheduledStart: next.scheduled_start } : null,
        travelMinutes: current?.travel_minutes ?? null,
        progressPercent,
      };
    });
}
