import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { startOfTodayIso, endOfTodayIso } from "@/lib/dashboard/dateRange";

export type MapMarker = {
  id: string;
  kind: "staff" | "customer";
  lat: number;
  lng: number;
  label: string;
  status?: string;
};

export async function getMapMarkers(scope: DashboardScope): Promise<MapMarker[]> {
  const filter = officeFilter(scope);
  const [staff, visits] = await Promise.all([
    serviceSelect<Array<{ staff_id: string; lat: number | null; lng: number | null; status: string; staff_members: { full_name: string } | null }>>(
      `staff_live_status?select=staff_id,lat,lng,status,staff_members(full_name)${filter}`,
    ),
    serviceSelect<Array<{ id: string; lat: number | null; lng: number | null; customers: { full_name: string } | null }>>(
      `service_visits?select=id,lat,lng,customers(full_name)&scheduled_start=gte.${startOfTodayIso()}&scheduled_start=lte.${endOfTodayIso()}${filter}`,
    ),
  ]);

  const staffMarkers: MapMarker[] = staff
    .filter((row) => row.lat !== null && row.lng !== null && row.staff_members)
    .map((row) => ({ id: row.staff_id, kind: "staff", lat: row.lat!, lng: row.lng!, label: row.staff_members!.full_name, status: row.status }));

  const customerMarkers: MapMarker[] = visits
    .filter((row) => row.lat !== null && row.lng !== null)
    .map((row) => ({ id: row.id, kind: "customer", lat: row.lat!, lng: row.lng!, label: row.customers?.full_name || ", " }));

  return [...staffMarkers, ...customerMarkers];
}
