import type { DashboardRole } from "@/lib/dashboard/scope";

export type WidgetSection =
  | "kpis"
  | "live_operations"
  | "planning"
  | "map"
  | "quality"
  | "employees"
  | "customers"
  | "financial"
  | "inventory"
  | "ai_insights";

export type WidgetDefinition = {
  id: string;
  title: string;
  section: WidgetSection;
  /** Roles allowed to ever receive this widget's data. Hidden entirely for everyone else. */
  allowedRoles: readonly DashboardRole[];
};

const ALL_ROLES: readonly DashboardRole[] = ["administrator", "regional_manager", "manager"];
const FINANCIAL_ROLES: readonly DashboardRole[] = ["administrator", "regional_manager"];

/**
 * The full widget catalog. Order here is the default layout order; a user's
 * saved dashboard_layouts row can reorder/hide within their own allowed set,
 * but can never reveal a widget outside allowedRoles (enforced server-side
 * in OperationsDashboard, not just by omission from this list).
 */
export const WIDGET_REGISTRY: readonly WidgetDefinition[] = [
  { id: "kpi_overview", title: "Today's overview", section: "kpis", allowedRoles: ALL_ROLES },
  { id: "live_operations_board", title: "Live operations", section: "live_operations", allowedRoles: ALL_ROLES },
  { id: "todays_planning", title: "Today's planning", section: "planning", allowedRoles: ALL_ROLES },
  { id: "operations_map", title: "Live map", section: "map", allowedRoles: ALL_ROLES },
  { id: "quality_center", title: "Quality center", section: "quality", allowedRoles: ALL_ROLES },
  { id: "employee_leaderboard", title: "Employee performance", section: "employees", allowedRoles: ALL_ROLES },
  { id: "customer_overview", title: "Customer overview", section: "customers", allowedRoles: FINANCIAL_ROLES },
  { id: "financial_dashboard", title: "Financial dashboard", section: "financial", allowedRoles: FINANCIAL_ROLES },
  { id: "inventory_panel", title: "Inventory", section: "inventory", allowedRoles: ALL_ROLES },
  { id: "ai_insights_panel", title: "AI insights", section: "ai_insights", allowedRoles: ALL_ROLES },
] as const;

export type UserWidgetPreference = { id: string; visible: boolean };

/**
 * Widgets a given role may ever see, in default order. Never trust a
 * client-supplied widget id list, always start from this, then apply the
 * user's saved order/visibility as a pure reorder/filter on top.
 */
export function visibleWidgetsForRole(role: DashboardRole): WidgetDefinition[] {
  return WIDGET_REGISTRY.filter((widget) => widget.allowedRoles.includes(role));
}

/** Applies a saved layout (order + visibility) on top of the role-filtered registry. Never adds widgets back. */
export function applyUserLayout(
  allowed: WidgetDefinition[],
  saved: UserWidgetPreference[] | null,
): WidgetDefinition[] {
  if (!saved || saved.length === 0) return allowed;
  const byId = new Map(allowed.map((widget) => [widget.id, widget]));
  const ordered: WidgetDefinition[] = [];
  for (const pref of saved) {
    const widget = byId.get(pref.id);
    if (widget && pref.visible) {
      ordered.push(widget);
      byId.delete(pref.id);
    } else {
      byId.delete(pref.id);
    }
  }
  // Any allowed widget the user never customized (e.g. new widget added later) still appears, appended.
  for (const widget of byId.values()) ordered.push(widget);
  return ordered;
}
