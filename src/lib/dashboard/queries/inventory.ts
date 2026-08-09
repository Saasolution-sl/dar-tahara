import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { officeFilter, type DashboardScope } from "@/lib/dashboard/scope";

export type InventoryOverview = {
  items: Array<{ id: string; name: string; category: string; quantity: number; unit: string; reorderThreshold: number; lowStock: boolean }>;
  lowStockCount: number;
  pendingRestockRequests: number;
};

export async function getInventoryOverview(scope: DashboardScope): Promise<InventoryOverview> {
  const filter = officeFilter(scope);

  const [items, restockRequests] = await Promise.all([
    serviceSelect<Array<{ id: string; name: string; category: string; quantity: number; unit: string; reorder_threshold: number }>>(
      `inventory_items?select=id,name,category,quantity,unit,reorder_threshold${filter}&order=category.asc,name.asc`,
    ),
    serviceSelect<Array<{ id: string }>>(`inventory_restock_requests?select=id&status=eq.pending${filter}`),
  ]);

  const mapped = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    reorderThreshold: item.reorder_threshold,
    lowStock: item.quantity <= item.reorder_threshold,
  }));

  return {
    items: mapped,
    lowStockCount: mapped.filter((item) => item.lowStock).length,
    pendingRestockRequests: restockRequests.length,
  };
}
