import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/portal/portal-shell";
import { adminCopy } from "@/i18n/admin-copy";
import { requireRole } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { serviceSelect } from "@/lib/supabase-rpc";
import { resolveStatusFilter, ALL_STAFF_STATUSES } from "@/lib/dashboard/liveStatus";

type LiveRow = {
  staff_id: string;
  status: string;
  updated_at: string;
  current_visit_id: string | null;
  next_visit_id: string | null;
  staff_members: { full_name: string; employee_number: string | null } | null;
  offices: { name: string } | null;
};

type VisitRow = {
  id: string;
  scheduled_start: string;
  scheduled_end: string;
  customers: { full_name: string } | null;
  properties: { address_line1: string; city: string } | null;
};

/**
 * The staff behind every "right now" tile, and behind the Live operations board.
 *
 * `?status=` takes a single status (`working`), a comma-separated set, or one of
 * the shorthands `live` (the board's default), `on_shift` (working + driving,
 * the Employees working tile) and `all` (including everyone who has gone home).
 * No parameter means the same set the board shows, so landing here from the
 * board's heading and from a tile give consistent answers.
 */
export default async function LiveOperations({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["staff", "administrator"]);
  const locale = await getRequestLocale();
  const copy = adminCopy[locale];
  const c = copy.tables.liveOperations;
  const params = await searchParams;
  const statuses = resolveStatusFilter(params.status);

  const live = await serviceSelect<LiveRow[]>(
    `staff_live_status?select=staff_id,status,updated_at,current_visit_id,next_visit_id,staff_members(full_name,employee_number),offices(name)&status=in.(${statuses.join(",")})&order=updated_at.desc`,
  );

  // One follow-up query for every referenced visit rather than one per row.
  const visitIds = [
    ...new Set(
      live.flatMap((row) => [row.current_visit_id, row.next_visit_id]).filter((id): id is string => Boolean(id)),
    ),
  ];
  const visits = visitIds.length
    ? await serviceSelect<VisitRow[]>(
        `service_visits?id=in.(${visitIds.join(",")})&select=id,scheduled_start,scheduled_end,customers(full_name),properties(address_line1,city)`,
      )
    : [];
  const visitById = new Map(visits.map((visit) => [visit.id, visit]));

  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  const rows = live.map((row) => {
    const current = row.current_visit_id ? visitById.get(row.current_visit_id) : undefined;
    const next = row.next_visit_id ? visitById.get(row.next_visit_id) : undefined;
    return [
      row.staff_members?.full_name || "—",
      row.staff_members?.employee_number || "—",
      row.offices?.name || "—",
      <StatusBadge key={`${row.staff_id}-status`} value={row.status} />,
      current?.customers?.full_name || "—",
      current?.properties ? `${current.properties.address_line1}, ${current.properties.city}` : "—",
      current ? timeFormat.format(new Date(current.scheduled_end)) : "—",
      next ? `${next.customers?.full_name || "—"} · ${timeFormat.format(new Date(next.scheduled_start))}` : "—",
      timeFormat.format(new Date(row.updated_at)),
    ];
  });

  // Only meaningful when the caller narrowed the view - otherwise it repeats the heading.
  const isFiltered = statuses.length < ALL_STAFF_STATUSES.length;

  return (
    <div>
      <AdminTable title={c.title} headers={c.headers} emptyLabel={copy.common.noRecords} rows={rows} />
      <p className="mt-4 text-sm text-muted-foreground">
        {isFiltered ? `${c.showing} ${statuses.join(", ")}. ` : ""}
        {c.footnote}
      </p>
    </div>
  );
}
