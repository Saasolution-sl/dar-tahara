import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, embeddedOfficeFilter, type DashboardScope } from "@/lib/dashboard/scope";
import { daysAgoIso } from "@/lib/dashboard/dateRange";
import { percent } from "@/lib/dashboard/math";

export type CustomerOverview = {
  activeCustomers: number;
  newCustomers30d: number;
  lostCustomers30d: number;
  retentionPercent: number | null;
  subscriptionTypeBreakdown: Array<{ frequency: string; count: number }>;
  customerLifetimeValueCents: number | null;
  averageRevenuePerCustomerCents: number | null;
  waitingList: number;
};

export async function getCustomerOverview(scope: DashboardScope): Promise<CustomerOverview> {
  const filter = officeFilter(scope);
  const since = daysAgoIso(30);

  const [customersAll, subs] = await Promise.all([
    serviceSelect<Array<{ status: string; created_at: string }>>(`customers?select=status,created_at${filter}`),
    serviceSelect<Array<{ frequency: string; billed_price_cents: number; status: string }>>(
      `subscriptions?select=frequency,billed_price_cents,status,customers!inner(office_id)${embeddedOfficeFilter(scope, "customers.office_id")}`,
    ),
  ]);

  const active = customersAll.filter((c) => c.status === "customer" || c.status === "approved").length;
  const newCustomers = customersAll.filter((c) => new Date(c.created_at) >= new Date(since)).length;
  const waitingList = customersAll.filter((c) => c.status === "applicant").length;
  const activeSubs = subs.filter((s) => s.status === "active");
  const cancelledSubs = subs.filter((s) => s.status === "cancelled");

  const totalActiveRevenue = activeSubs.reduce((sum, s) => sum + s.billed_price_cents, 0);
  const arpc = activeSubs.length ? Math.round(totalActiveRevenue / activeSubs.length) : null;

  const breakdown = new Map<string, number>();
  for (const sub of activeSubs) breakdown.set(sub.frequency, (breakdown.get(sub.frequency) || 0) + 1);

  return {
    activeCustomers: active,
    newCustomers30d: newCustomers,
    lostCustomers30d: cancelledSubs.length,
    retentionPercent: percent(active, active + cancelledSubs.length),
    subscriptionTypeBreakdown: [...breakdown.entries()].map(([frequency, count]) => ({ frequency, count })),
    // Rough proxy: average recurring charge annualized, not a cohort-based LTV model.
    customerLifetimeValueCents: arpc !== null ? arpc * 12 : null,
    averageRevenuePerCustomerCents: arpc,
    waitingList,
  };
}
