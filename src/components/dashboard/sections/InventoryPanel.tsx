import type { InventoryOverview } from "@/lib/dashboard/queries/inventory";
import { StatCard } from "@/components/dashboard/StatCard";
import type { DashboardCopy } from "@/i18n/dashboard-copy";
import { cn } from "@/lib/utils";

export function InventoryPanel({ data, copy }: { data: InventoryOverview; copy: DashboardCopy }) {
  const c = copy.inventory;
  return (
    <section>
      <h2 className="font-serif text-2xl">{c.title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={c.trackedItems} value={data.items.length} href="/admin/inventory" />
        <StatCard label={c.lowStock} value={data.lowStockCount} tone={data.lowStockCount > 0 ? "warning" : "default"} href="/admin/inventory?low=1" />
        <StatCard label={c.pendingRestocks} value={data.pendingRestockRequests} href="/admin/inventory?restock=pending" />
      </div>

      {data.items.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.items.map((item) => {
            const ratio = item.reorderThreshold > 0 ? Math.min(1, item.quantity / (item.reorderThreshold * 2)) : 1;
            return (
              <div key={item.id} className={cn("rounded-2xl border bg-card p-4 shadow-soft", item.lowStock ? "border-amber-300/60" : "border-border")}>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">{item.name}</p>
                  <span className="text-xs text-muted-foreground">{c.category[item.category as keyof typeof c.category] || item.category}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.quantity} {item.unit} {item.lowStock ? <span className="font-semibold text-amber-600">· {c.lowStockSuffix}</span> : null}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className={cn("h-full rounded-full transition-all", item.lowStock ? "bg-amber-500" : "bg-primary")}
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">{c.noneTracked}</p>
      )}
    </section>
  );
}
