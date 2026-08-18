import { AdminTable } from "@/components/admin/admin-table";
import { SubscriptionStatusAction } from "@/components/admin/subscription-status-action";
import { SubscriptionDurationAction } from "@/components/admin/subscription-duration-action";
import { serviceSelect } from "@/lib/supabase-rpc";
import { money } from "@/lib/portal-format";
import { adminCopy } from "@/i18n/admin-copy";
import { dashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

const CANCELLATION_LABELS: Record<string, string> = { requested: "Requested", confirmed: "Confirmed", settled: "Settled", voided: "Voided" };

export async function SubscriptionsTable({ officeIds }: { officeIds?: string[] } = {}) {
  const locale = await getRequestLocale();
  const copy = adminCopy[locale];
  const dCopy = dashboardCopy[locale];
  const c = copy.tables.subscriptions;
  if (officeIds && officeIds.length === 0) {
    return <AdminTable title={c.title} headers={c.headers} emptyLabel={copy.common.noRecords} rows={[]} />;
  }
  // !inner turns the embedded customers relation into a real join, which is
  // required for `customers.office_id=in.(...)` to filter the parent rows
  // (a plain embedded filter only trims the nested object, it doesn't
  // exclude the subscription row).
  const customersJoin = officeIds ? "customers!inner(full_name,office_id)" : "customers(full_name)";
  const officeFilter = officeIds ? `&customers.office_id=in.(${officeIds.join(",")})` : "";
  const rows = await serviceSelect<Array<{
    id: string; status: string; frequency: string; billing_interval: string; billed_price_cents: number;
    currency: string; cancellation_status: string | null; operational_status: string; contract_duration_months: number | null;
    customers: { full_name: string };
  }>>(
    `subscriptions?select=id,status,frequency,billing_interval,billed_price_cents,currency,cancellation_status,operational_status,contract_duration_months,${customersJoin}&order=created_at.desc&limit=500${officeFilter}`,
  );
  return (
    <AdminTable
      title={c.title}
      headers={c.headers}
      emptyLabel={copy.common.noRecords}
      rows={rows.map((r) => [
        r.customers.full_name,
        r.status,
        r.frequency,
        r.billing_interval,
        <SubscriptionDurationAction key={`${r.id}-duration`} id={r.id} contractDurationMonths={r.contract_duration_months} copy={dCopy.durationAction} />,
        money(r.billed_price_cents, r.currency),
        r.cancellation_status ? (CANCELLATION_LABELS[r.cancellation_status] || r.cancellation_status) : "Not available",
        <SubscriptionStatusAction key={r.id} id={r.id} operationalStatus={r.operational_status} copy={dCopy.statusAction} />,
      ])}
    />
  );
}
