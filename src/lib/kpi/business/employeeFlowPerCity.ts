import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import type { DashboardScope } from "@/lib/dashboard/scope";
import { scopedOffices } from "@/lib/kpi/officeGroups";
import { average } from "@/lib/dashboard/math";
import { bandMinimum } from "@/lib/kpi/banding";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit target given in the spec, inferred baseline: net-positive (or stable) headcount. */
const TARGET_NET_FLOW = 0;

export type CityEmployeeFlow = {
  officeId: string;
  city: string;
  hired: number;
  leaving: number;
  activeEmployees: number;
  avgEmploymentDurationDays: number | null;
  turnoverPercent: number | null;
};

async function flowByCity(scope: DashboardScope, range: PeriodRange): Promise<CityEmployeeFlow[]> {
  const offices = await scopedOffices(scope);
  const startDate = range.start.toISOString().slice(0, 10);
  const endDate = range.end.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  return Promise.all(
    offices.map(async (office) => {
      const rows = await serviceSelect<Array<{ hire_date: string | null; leave_date: string | null }>>(
        `staff_members?select=hire_date,leave_date&office_id=eq.${office.id}`,
      );

      let hired = 0;
      let leaving = 0;
      let activeAtStart = 0;
      let activeNow = 0;
      const durations: number[] = [];
      for (const row of rows) {
        if (row.hire_date && row.hire_date >= startDate && row.hire_date <= endDate) hired++;
        if (row.leave_date && row.leave_date >= startDate && row.leave_date <= endDate) leaving++;
        if (row.hire_date && row.hire_date <= startDate && (!row.leave_date || row.leave_date >= startDate)) activeAtStart++;
        if (!row.leave_date) activeNow++;
        if (row.hire_date) durations.push(Math.round((new Date(row.leave_date || today).getTime() - new Date(row.hire_date).getTime()) / 86400000));
      }

      return {
        officeId: office.id,
        city: office.city || office.name,
        hired,
        leaving,
        activeEmployees: activeNow,
        avgEmploymentDurationDays: average(durations),
        turnoverPercent: activeAtStart ? Math.round((leaving / activeAtStart) * 100) : null,
      };
    }),
  );
}

export async function computeEmployeeFlowPerCity(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { cities: CityEmployeeFlow[] }> {
  const [cities, previousCities] = await Promise.all([flowByCity(scope, range), flowByCity(scope, previousPeriodRange(range))]);
  const netFlow = cities.reduce((sum, c) => sum + (c.hired - c.leaving), 0);
  const previousNetFlow = previousCities.reduce((sum, c) => sum + (c.hired - c.leaving), 0);

  return {
    id: "employee_flow_per_city",
    label: "Employee flow per city",
    value: netFlow,
    unit: "net hires",
    target: "Net positive or stable",
    status: bandMinimum(netFlow, TARGET_NET_FLOW),
    trendPercent: trendPercent(netFlow, previousNetFlow),
    periodLabel: range.label,
    cities,
  };
}
