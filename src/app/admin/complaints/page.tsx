import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/portal/portal-shell";
import { adminCopy } from "@/i18n/admin-copy";
import { requireRole } from "@/lib/portal-auth";
import { shortDate } from "@/lib/portal-format";
import { getRequestLocale } from "@/lib/request-locale";
import { serviceSelect } from "@/lib/supabase-rpc";

type ComplaintRow = {
  id: string;
  category: string;
  status: string;
  is_recurring: boolean;
  created_at: string;
  resolved_at: string | null;
  customers: { full_name: string } | null;
  offices: { name: string } | null;
};

/**
 * The records behind the Operations Center's complaint tiles. Those tiles link
 * here with `?status=pending` or `?recurring=1`, so the number a manager clicks
 * and the list they land on are the same set.
 */
export default async function Complaints({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; recurring?: string }>;
}) {
  await requireRole(["staff", "administrator"]);
  const locale = await getRequestLocale();
  const copy = adminCopy[locale];
  const c = copy.tables.complaints;
  const params = await searchParams;

  const filters = [
    params.status === "pending" || params.status === "resolved"
      ? `&status=eq.${params.status}`
      : "",
    params.recurring === "1" ? "&is_recurring=is.true" : "",
  ].join("");

  const rows = await serviceSelect<ComplaintRow[]>(
    `customer_complaints?select=id,category,status,is_recurring,created_at,resolved_at,customers(full_name),offices(name)&order=created_at.desc&limit=500${filters}`,
  );

  return (
    <AdminTable
      title={c.title}
      headers={c.headers}
      emptyLabel={copy.common.noRecords}
      rows={rows.map((row) => [
        shortDate(row.created_at, locale),
        row.customers?.full_name || "—",
        row.category.replaceAll("_", " "),
        row.offices?.name || "—",
        <StatusBadge key={`${row.id}-status`} value={row.status} />,
        row.is_recurring ? c.recurringYes : "—",
        row.resolved_at ? shortDate(row.resolved_at, locale) : "—",
      ])}
    />
  );
}
