import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, embeddedOfficeFilter, type DashboardScope } from "@/lib/dashboard/scope";

export type FinancialDashboard = {
  monthlyRevenueCents: number;
  mrrCents: number;
  revenueGrowthPercent: number | null;
  revenuePerOffice: Array<{ officeId: string; officeName: string; revenueCents: number }>;
  revenuePerEmployeeCents: number | null;
  revenuePerCustomerCents: number | null;
  outstandingPaymentsCents: number;
  subscriptionBreakdown: Array<{ frequency: string; revenueCents: number }>;
  projectedNextMonthCents: number;
};

function monthRange(monthsAgo: number): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** subscriptions.billing_interval is 'monthly' | 'annual', the payment cadence, distinct from cleaning frequency. */
function monthlyEquivalentCents(billedPriceCents: number, billingInterval: string): number {
  return billingInterval === "annual" ? Math.round(billedPriceCents / 12) : billedPriceCents;
}

export async function getFinancialDashboard(scope: DashboardScope): Promise<FinancialDashboard> {
  const filter = officeFilter(scope);
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(1);

  const [invoicesThisMonth, invoicesLastMonth, outstandingInvoices, activeSubs, offices, fieldStaffCount] = await Promise.all([
    serviceSelect<Array<{ amount_paid_cents: number; customers: { office_id: string | null } }>>(
      `invoices?select=amount_paid_cents,customers!inner(office_id)&status=eq.paid&created_at=gte.${thisMonth.start}&created_at=lt.${thisMonth.end}${embeddedOfficeFilter(scope, "customers.office_id")}`,
    ),
    serviceSelect<Array<{ amount_paid_cents: number; customers: { office_id: string | null } }>>(
      `invoices?select=amount_paid_cents,customers!inner(office_id)&status=eq.paid&created_at=gte.${lastMonth.start}&created_at=lt.${lastMonth.end}${embeddedOfficeFilter(scope, "customers.office_id")}`,
    ),
    serviceSelect<Array<{ amount_due_cents: number; amount_paid_cents: number; customers: { office_id: string | null } }>>(
      `invoices?select=amount_due_cents,amount_paid_cents,customers!inner(office_id)&status=eq.open${embeddedOfficeFilter(scope, "customers.office_id")}`,
    ),
    serviceSelect<Array<{ billed_price_cents: number; billing_interval: string; frequency: string; customers: { office_id: string | null } }>>(
      `subscriptions?select=billed_price_cents,billing_interval,frequency,customers!inner(office_id)&status=eq.active${embeddedOfficeFilter(scope, "customers.office_id")}`,
    ),
    serviceSelect<Array<{ id: string; name: string }>>(`offices?select=id,name${officeFilter(scope, "id")}&order=name.asc`),
    serviceSelect<Array<{ id: string }>>(`staff_members?select=id&role=in.(cleaner,inspector,coordinator)&active=eq.true${filter}`),
  ]);

  const monthlyRevenueCents = invoicesThisMonth.reduce((sum, row) => sum + row.amount_paid_cents, 0);
  const previousMonthRevenueCents = invoicesLastMonth.reduce((sum, row) => sum + row.amount_paid_cents, 0);
  const revenueGrowthPercent =
    previousMonthRevenueCents > 0 ? Math.round(((monthlyRevenueCents - previousMonthRevenueCents) / previousMonthRevenueCents) * 100) : null;

  const outstandingPaymentsCents = outstandingInvoices.reduce((sum, row) => sum + (row.amount_due_cents - row.amount_paid_cents), 0);

  const mrrCents = activeSubs.reduce((sum, sub) => sum + monthlyEquivalentCents(sub.billed_price_cents, sub.billing_interval), 0);

  const revenueByOffice = new Map<string, number>();
  for (const sub of activeSubs) {
    const officeId = sub.customers.office_id;
    if (!officeId) continue;
    revenueByOffice.set(officeId, (revenueByOffice.get(officeId) || 0) + monthlyEquivalentCents(sub.billed_price_cents, sub.billing_interval));
  }
  const revenuePerOffice = offices.map((office) => ({ officeId: office.id, officeName: office.name, revenueCents: revenueByOffice.get(office.id) || 0 }));

  const breakdownByFrequency = new Map<string, number>();
  for (const sub of activeSubs) {
    breakdownByFrequency.set(sub.frequency, (breakdownByFrequency.get(sub.frequency) || 0) + monthlyEquivalentCents(sub.billed_price_cents, sub.billing_interval));
  }

  return {
    monthlyRevenueCents,
    mrrCents,
    revenueGrowthPercent,
    revenuePerOffice,
    revenuePerEmployeeCents: fieldStaffCount.length ? Math.round(mrrCents / fieldStaffCount.length) : null,
    revenuePerCustomerCents: activeSubs.length ? Math.round(mrrCents / activeSubs.length) : null,
    outstandingPaymentsCents,
    subscriptionBreakdown: [...breakdownByFrequency.entries()].map(([frequency, revenueCents]) => ({ frequency, revenueCents })),
    // Simple next-month projection: current MRR carried forward. A real forecast
    // model (seasonality, churn-adjusted) is future work.
    projectedNextMonthCents: mrrCents,
  };
}
