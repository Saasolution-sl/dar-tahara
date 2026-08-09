import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import type { DashboardScope } from "@/lib/dashboard/scope";
import { scopedOffices } from "@/lib/kpi/officeGroups";
import { bandMinimum } from "@/lib/kpi/banding";
import { trendPercent, previousPeriodRange, type PeriodRange } from "@/lib/kpi/periods";
import type { KpiResult } from "@/lib/kpi/types";

/** No explicit target given in the spec, inferred baseline: net-positive growth. */
const TARGET_GROWTH_PERCENT = 0;
/** Informational threshold for flagging an office as an expansion opportunity. */
const EXPANSION_GROWTH_THRESHOLD_PERCENT = 10;

export type CityGrowth = {
  officeId: string;
  city: string;
  newCustomers: number;
  lostCustomers: number;
  netGrowth: number;
  growthPercent: number | null;
  expansionOpportunity: boolean;
};

async function growthByCity(scope: DashboardScope, range: PeriodRange): Promise<CityGrowth[]> {
  const offices = await scopedOffices(scope);
  const startIso = range.start.toISOString();
  const endIso = range.end.toISOString();

  return Promise.all(
    offices.map(async (office) => {
      const [newCustomers, lostCustomers, baseCustomers] = await Promise.all([
        serviceSelect<Array<{ id: string }>>(`customers?select=id&office_id=eq.${office.id}&created_at=gte.${startIso}&created_at=lte.${endIso}`),
        serviceSelect<Array<{ customers: { office_id: string | null } }>>(
          `subscriptions?select=customers!inner(office_id)&cancelled_at=gte.${startIso}&cancelled_at=lte.${endIso}&customers.office_id=eq.${office.id}`,
        ),
        serviceSelect<Array<{ id: string }>>(`customers?select=id&office_id=eq.${office.id}&status=in.(customer,approved)&created_at=lt.${startIso}`),
      ]);

      const netGrowth = newCustomers.length - lostCustomers.length;
      const growthPercent = baseCustomers.length ? Math.round((netGrowth / baseCustomers.length) * 1000) / 10 : null;

      return {
        officeId: office.id,
        city: office.city || office.name,
        newCustomers: newCustomers.length,
        lostCustomers: lostCustomers.length,
        netGrowth,
        growthPercent,
        expansionOpportunity: growthPercent !== null && growthPercent >= EXPANSION_GROWTH_THRESHOLD_PERCENT,
      };
    }),
  );
}

export async function computeRegionalGrowth(scope: DashboardScope, range: PeriodRange): Promise<KpiResult & { cities: CityGrowth[] }> {
  const [cities, previousCities] = await Promise.all([growthByCity(scope, range), growthByCity(scope, previousPeriodRange(range))]);
  const totalNetGrowth = cities.reduce((sum, c) => sum + c.netGrowth, 0);
  const previousTotalNetGrowth = previousCities.reduce((sum, c) => sum + c.netGrowth, 0);

  return {
    id: "regional_growth",
    label: "Regional growth",
    value: totalNetGrowth,
    unit: "net customers",
    target: "Net positive",
    status: bandMinimum(totalNetGrowth, TARGET_GROWTH_PERCENT),
    trendPercent: trendPercent(totalNetGrowth, previousTotalNetGrowth),
    periodLabel: range.label,
    cities,
  };
}
