import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/portal/portal-shell";
import { adminCopy } from "@/i18n/admin-copy";
import { requireRole } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { serviceSelect } from "@/lib/supabase-rpc";

type VisitRow = {
  id: string;
  scheduled_start: string;
  status: string;
  travel_minutes: number | null;
  cleaning_minutes: number | null;
  customer_rating: number | null;
  is_revisit: boolean;
  customers: { full_name: string } | null;
  staff_members: { full_name: string; employee_number: string | null } | null;
  offices: { name: string } | null;
};

/**
 * The visits behind most of the Operations Center's numbers.
 *
 * One page rather than eight near-identical ones: today's visits, completed,
 * running, delayed, cancelled, rated and revisits are all the same records
 * under a different filter, so the tiles link here with a query string.
 *
 * `running` covers working *and* driving, matching getKpis().
 */
const RUNNING = ["working", "driving"];
const RATED_WINDOW_DAYS = 30;

function dayBounds(): { start: string; end: string } {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function minutes(value: number | null): string {
  return value === null ? "—" : `${value} min`;
}

export default async function Visits({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string; rated?: string; revisit?: string }>;
}) {
  await requireRole(["staff", "administrator"]);
  const locale = await getRequestLocale();
  const copy = adminCopy[locale];
  const c = copy.tables.visits;
  const params = await searchParams;

  const filters: string[] = [];
  if (params.date === "today") {
    const { start, end } = dayBounds();
    filters.push(`&scheduled_start=gte.${start}`, `&scheduled_start=lt.${end}`);
  }
  if (params.status === "running") {
    filters.push(`&status=in.(${RUNNING.join(",")})`);
  } else if (params.status) {
    filters.push(`&status=eq.${encodeURIComponent(params.status)}`);
  }
  if (params.rated === "1") {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - RATED_WINDOW_DAYS);
    filters.push("&customer_rating=not.is.null", `&scheduled_start=gte.${since.toISOString()}`);
  }
  if (params.revisit === "1") filters.push("&is_revisit=is.true");

  const rows = await serviceSelect<VisitRow[]>(
    `service_visits?select=id,scheduled_start,status,travel_minutes,cleaning_minutes,customer_rating,is_revisit,customers(full_name),staff_members(full_name,employee_number),offices(name)&order=scheduled_start.desc&limit=500${filters.join("")}`,
  );

  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AdminTable
      title={c.title}
      headers={c.headers}
      emptyLabel={copy.common.noRecords}
      rows={rows.map((row) => [
        dateFormat.format(new Date(row.scheduled_start)),
        row.customers?.full_name || "—",
        row.staff_members?.full_name || "—",
        row.offices?.name || "—",
        <StatusBadge key={`${row.id}-status`} value={row.status} />,
        minutes(row.cleaning_minutes),
        minutes(row.travel_minutes),
        row.customer_rating ? `${row.customer_rating}★` : "—",
        row.is_revisit ? c.revisitYes : "—",
      ])}
    />
  );
}
