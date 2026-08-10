import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, embeddedOfficeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { startOfTodayIso, endOfTodayIso, daysAgoIso } from "@/lib/dashboard/dateRange";
import { average } from "@/lib/dashboard/math";
import { countLiveStatuses, type LiveStatusCounts } from "@/lib/dashboard/liveStatus";

export type TopKpis = {
  /**
   * Right now, from `staff_live_status` - the same rows the Live operations
   * board renders. `live.working` is the Working tile, `live.finished` is the
   * Finished tile, and `live.live` equals the number of cards on the board.
   */
  live: LiveStatusCounts;
  /** Today's plan, from `service_visits`. A different question, so a different group. */
  todaysVisits: number;
  completedToday: number;
  delayedToday: number;
  cancelledToday: number;
  avgCustomerRating: number | null;
  avgCleaningMinutes: number | null;
  avgTravelMinutes: number | null;
  openComplaints: number;
  qualityScore: number | null;
};

export async function getTopKpis(scope: DashboardScope): Promise<TopKpis> {
  const dayStart = startOfTodayIso();
  const dayEnd = endOfTodayIso();
  const filter = officeFilter(scope);

  const [visitsToday, ratedVisits, staffLive, complaints, inspections] = await Promise.all([
    serviceSelect<Array<{ status: string; travel_minutes: number | null; cleaning_minutes: number | null }>>(
      `service_visits?select=status,travel_minutes,cleaning_minutes&scheduled_start=gte.${dayStart}&scheduled_start=lte.${dayEnd}${filter}`,
    ),
    serviceSelect<Array<{ customer_rating: number }>>(
      `service_visits?select=customer_rating&customer_rating=not.is.null&scheduled_start=gte.${daysAgoIso(30)}${filter}`,
    ),
    serviceSelect<Array<{ status: string }>>(`staff_live_status?select=status${filter}`),
    serviceSelect<Array<{ id: string }>>(`customer_complaints?select=id&status=eq.pending${filter}`),
    serviceSelect<Array<{ score: number }>>(
      `quality_inspections?select=score,service_visits!inner(office_id)&created_at=gte.${daysAgoIso(30)}${embeddedOfficeFilter(scope, "service_visits.office_id")}`,
    ),
  ]);

  return {
    live: countLiveStatuses(staffLive),
    todaysVisits: visitsToday.length,
    completedToday: visitsToday.filter((v) => v.status === "completed").length,
    delayedToday: visitsToday.filter((v) => v.status === "delayed").length,
    cancelledToday: visitsToday.filter((v) => v.status === "cancelled").length,
    avgCustomerRating: average(ratedVisits.map((v) => v.customer_rating)),
    avgCleaningMinutes: average(visitsToday.map((v) => v.cleaning_minutes).filter((v): v is number => v !== null)),
    avgTravelMinutes: average(visitsToday.map((v) => v.travel_minutes).filter((v): v is number => v !== null)),
    openComplaints: complaints.length,
    qualityScore: average(inspections.map((i) => i.score)),
  };
}
