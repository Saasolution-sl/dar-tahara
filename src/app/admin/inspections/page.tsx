import { AdminTable } from "@/components/admin/admin-table";
import { adminCopy } from "@/i18n/admin-copy";
import { requireRole } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { serviceSelect } from "@/lib/supabase-rpc";

type InspectionRow = {
  id: string;
  score: number;
  first_time_right: boolean;
  notes: string | null;
  created_at: string;
  staff_members: { full_name: string; employee_number: string | null } | null;
  service_visits: { scheduled_start: string; customers: { full_name: string } | null } | null;
};

/**
 * The inspections behind the quality score and first-time-right tiles.
 *
 * Defaults to the last 30 days, matching the window getKpis() averages over -
 * an all-time list would not explain the number on the dashboard.
 */
const WINDOW_DAYS = 30;

export default async function Inspections({
  searchParams,
}: {
  searchParams: Promise<{ ftr?: string; all?: string }>;
}) {
  await requireRole(["staff", "administrator"]);
  const locale = await getRequestLocale();
  const copy = adminCopy[locale];
  const c = copy.tables.inspections;
  const params = await searchParams;

  const filters: string[] = [];
  if (params.all !== "1") {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - WINDOW_DAYS);
    filters.push(`&created_at=gte.${since.toISOString()}`);
  }
  if (params.ftr === "0") filters.push("&first_time_right=is.false");

  const rows = await serviceSelect<InspectionRow[]>(
    `quality_inspections?select=id,score,first_time_right,notes,created_at,staff_members(full_name,employee_number),service_visits(scheduled_start,customers(full_name))&order=created_at.desc&limit=500${filters.join("")}`,
  );

  const dateFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <AdminTable
        title={c.title}
        headers={c.headers}
        emptyLabel={copy.common.noRecords}
        rows={rows.map((row) => [
          dateFormat.format(new Date(row.created_at)),
          row.service_visits?.customers?.full_name || "—",
          row.staff_members?.full_name || "—",
          `${Number(row.score).toFixed(1)}/100`,
          row.first_time_right ? c.ftrYes : c.ftrNo,
          row.notes || "—",
        ])}
      />
      <p className="mt-4 text-sm text-muted-foreground">{c.footnote}</p>
    </div>
  );
}
