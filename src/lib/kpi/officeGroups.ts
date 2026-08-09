import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";

export type OfficeGroup = { id: string; name: string; city: string | null };

/** Offices in scope, all offices for administrator/manager, only the regional manager's own offices otherwise. */
export async function scopedOffices(scope: DashboardScope): Promise<OfficeGroup[]> {
  return serviceSelect<OfficeGroup[]>(`offices?select=id,name,city${officeFilter(scope, "id")}&order=name.asc`);
}
