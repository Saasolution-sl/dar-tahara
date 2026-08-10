import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { LIVE_STATUSES, countLiveStatuses, type LiveStatusCounts } from "@/lib/dashboard/liveStatus";

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

/**
 * How many staff sit in each live status, for the "right now" tiles.
 *
 * Deliberately the same table and the same office filter the board uses, so
 * the Working tile and the number of Working cards on the board can never
 * disagree.
 */
export async function getLiveStatusCounts(scope: DashboardScope): Promise<LiveStatusCounts> {
  const rows = await serviceSelect<Array<{ status: string }>>(
    `staff_live_status?select=status${officeFilter(scope)}`,
  );
  return countLiveStatuses(rows);
}

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

/**
 * The Live operations board.
 *
 * Only genuinely live people appear: the default `statuses` excludes `finished`,
 * `sick` and `offline`, who are on the roster but not on a job. Without this
 * filter the board listed everyone who had ever clocked in today, which is why
 * it showed 16 cards under a tile that said 7.
 *
 * Pass `statuses` to drill into one bucket - that is how the "right now" tiles
 * link through to exactly the rows they counted.
 */
export async function getLiveOperationsBoard(
  scope: DashboardScope,
  statuses: readonly string[] = LIVE_STATUSES,
): Promise<LiveOpsRow[]> {
  const filter = officeFilter(scope);
  const statusFilter = statuses.length ? `&status=in.(${statuses.join(",")})` : "";
  const liveRows = await serviceSelect<LiveStatusRow[]>(
    `staff_live_status?select=staff_id,status,current_visit_id,next_visit_id,staff_members(full_name,employee_number)${filter}${statusFilter}&order=updated_at.desc`,
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
