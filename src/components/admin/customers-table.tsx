import { AdminTable } from "@/components/admin/admin-table";
import { CustomerStatusAction } from "@/components/admin/customer-status-action";
import { OfficeAssignSelect } from "@/components/admin/office-assign-select";
import { serviceSelect } from "@/lib/supabase-rpc";
import { adminCopy } from "@/i18n/admin-copy";
import { dashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

export async function CustomersTable({ officeIds, canAssignOffice = false }: { officeIds?: string[]; canAssignOffice?: boolean } = {}) {
  const locale = await getRequestLocale();
  const copy = adminCopy[locale];
  const dCopy = dashboardCopy[locale];
  const c = copy.tables.customers;
  if (officeIds && officeIds.length === 0) {
    return <AdminTable title={c.title} headers={c.headers} emptyLabel={copy.common.noRecords} rows={[]} />;
  }
  const officeFilter = officeIds ? `&office_id=in.(${officeIds.join(",")})` : "";
  const [rows, offices] = await Promise.all([
    serviceSelect<Array<{ id: string; full_name: string; email: string; status: string; created_at: string; last_login_at: string | null; office_id: string | null }>>(
      `customers?select=id,full_name,email,status,created_at,last_login_at,office_id&order=created_at.desc&limit=500${officeFilter}`,
    ),
    canAssignOffice ? serviceSelect<Array<{ id: string; name: string }>>("offices?select=id,name&order=name.asc") : Promise.resolve([]),
  ]);
  return (
    <AdminTable
      title={c.title}
      headers={c.headers}
      emptyLabel={copy.common.noRecords}
      rows={rows.map((r) => [
        r.full_name,
        r.email,
        r.status,
        r.created_at.slice(0, 10),
        r.last_login_at?.slice(0, 10) || "Not available",
        <div key={r.id} className="flex flex-col gap-1">
          <CustomerStatusAction id={r.id} status={r.status} copy={dCopy.statusAction} />
          {canAssignOffice ? <OfficeAssignSelect targetId={r.id} kind="customer" currentOfficeId={r.office_id} offices={offices} copy={dCopy.officeAssign} /> : null}
        </div>,
      ])}
    />
  );
}
