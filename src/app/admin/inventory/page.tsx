import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/portal/portal-shell";
import { adminCopy } from "@/i18n/admin-copy";
import { requireRole } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { serviceSelect } from "@/lib/supabase-rpc";

type ItemRow = {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  reorder_threshold: number;
  offices: { name: string } | null;
};

type RestockRow = {
  id: string;
  quantity_requested: number;
  status: string;
  created_at: string;
  inventory_items: { name: string; unit: string } | null;
  offices: { name: string } | null;
};

/**
 * Stock behind the inventory tiles.
 *
 * `?low=1` shows only items at or below their reorder threshold, which is the
 * same comparison the low-stock tile counts. `?restock=pending` switches to the
 * restock requests instead, since that tile counts a different table.
 */
export default async function Inventory({
  searchParams,
}: {
  searchParams: Promise<{ low?: string; restock?: string }>;
}) {
  await requireRole(["staff", "administrator"]);
  const locale = await getRequestLocale();
  const copy = adminCopy[locale];
  const params = await searchParams;
  const dateFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  if (params.restock) {
    const r = copy.tables.restockRequests;
    const filter = params.restock === "pending" ? "&status=eq.pending" : "";
    const rows = await serviceSelect<RestockRow[]>(
      `inventory_restock_requests?select=id,quantity_requested,status,created_at,inventory_items(name,unit),offices(name)&order=created_at.desc&limit=500${filter}`,
    );
    return (
      <AdminTable
        title={r.title}
        headers={r.headers}
        emptyLabel={copy.common.noRecords}
        rows={rows.map((row) => [
          dateFormat.format(new Date(row.created_at)),
          row.inventory_items?.name || "—",
          `${row.quantity_requested} ${row.inventory_items?.unit || ""}`.trim(),
          row.offices?.name || "—",
          <StatusBadge key={`${row.id}-status`} value={row.status} />,
        ])}
      />
    );
  }

  const c = copy.tables.inventory;
  const items = await serviceSelect<ItemRow[]>(
    `inventory_items?select=id,category,name,quantity,unit,reorder_threshold,offices(name)&order=name.asc&limit=500`,
  );
  // Filtered here rather than in the query: PostgREST cannot compare two
  // columns, and the tile's rule is quantity <= reorder_threshold.
  const rows = params.low === "1" ? items.filter((i) => i.quantity <= i.reorder_threshold) : items;

  return (
    <AdminTable
      title={c.title}
      headers={c.headers}
      emptyLabel={copy.common.noRecords}
      rows={rows.map((row) => [
        row.name,
        row.category.replaceAll("_", " "),
        row.offices?.name || "—",
        `${row.quantity} ${row.unit}`,
        String(row.reorder_threshold),
        row.quantity <= row.reorder_threshold ? (
          <StatusBadge key={`${row.id}-low`} value={c.lowStockBadge} />
        ) : (
          "—"
        ),
      ])}
    />
  );
}
