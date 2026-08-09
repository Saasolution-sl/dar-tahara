import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { startOfTodayIso, endOfTodayIso } from "@/lib/dashboard/dateRange";

export type PlanningVisit = {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  customerName: string;
  staffName: string | null;
  address: string;
};

export async function getTodaysPlanning(scope: DashboardScope): Promise<PlanningVisit[]> {
  const filter = officeFilter(scope);
  const rows = await serviceSelect<Array<{
    id: string;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
    customers: { full_name: string } | null;
    staff_members: { full_name: string } | null;
    properties: { address_line1: string; city: string } | null;
  }>>(
    `service_visits?select=id,scheduled_start,scheduled_end,status,customers(full_name),staff_members(full_name),properties(address_line1,city)&scheduled_start=gte.${startOfTodayIso()}&scheduled_start=lte.${endOfTodayIso()}${filter}&order=scheduled_start.asc`,
  );

  return rows.map((row) => ({
    id: row.id,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    status: row.status,
    customerName: row.customers?.full_name || ", ",
    staffName: row.staff_members?.full_name || null,
    address: row.properties ? `${row.properties.address_line1}, ${row.properties.city}` : ", ",
  }));
}
