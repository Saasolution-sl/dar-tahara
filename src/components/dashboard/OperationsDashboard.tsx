import type { AuthContext } from "@/lib/portal-auth";
import { getDashboardScope, type DashboardRole } from "@/lib/dashboard/scope";
import { visibleWidgetsForRole, applyUserLayout, type UserWidgetPreference } from "@/lib/dashboard/widgets";
import { serviceSelect } from "@/lib/supabase-rpc";
import { DashboardLayoutEditor } from "@/components/dashboard/DashboardLayoutEditor";

import { KpiOverview } from "@/components/dashboard/sections/KpiOverview";
import { LiveOperationsBoard } from "@/components/dashboard/sections/LiveOperationsBoard";
import { TodaysPlanning } from "@/components/dashboard/sections/TodaysPlanning";
import { OperationsMap } from "@/components/dashboard/sections/OperationsMap";
import { QualityCenter } from "@/components/dashboard/sections/QualityCenter";
import { EmployeeLeaderboard } from "@/components/dashboard/sections/EmployeeLeaderboard";
import { CustomerOverview } from "@/components/dashboard/sections/CustomerOverview";
import { FinancialDashboard } from "@/components/dashboard/sections/FinancialDashboard";
import { InventoryPanel } from "@/components/dashboard/sections/InventoryPanel";
import { AiInsightsPanel } from "@/components/dashboard/sections/AiInsightsPanel";

import { getTopKpis } from "@/lib/dashboard/queries/kpis";
import { getLiveOperationsBoard } from "@/lib/dashboard/queries/liveOps";
import { getTodaysPlanning } from "@/lib/dashboard/queries/planning";
import { getMapMarkers } from "@/lib/dashboard/queries/mapData";
import { getQualityCenter } from "@/lib/dashboard/queries/quality";
import { getEmployeePerformance } from "@/lib/dashboard/queries/employees";
import { getCustomerOverview } from "@/lib/dashboard/queries/customers";
import { getFinancialDashboard } from "@/lib/dashboard/queries/financial";
import { getInventoryOverview } from "@/lib/dashboard/queries/inventory";
import { getAiInsights } from "@/lib/dashboard/aiInsights";
import { dashboardCopy, type DashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

function roleLabel(role: DashboardRole, copy: DashboardCopy): string {
  if (role === "administrator") return copy.roleLabel.administrator;
  if (role === "regional_manager") return copy.roleLabel.regional_manager;
  return copy.roleLabel.manager;
}

function widgetTitle(id: string, copy: DashboardCopy, fallback: string): string {
  const titles: Record<string, string> = {
    kpi_overview: copy.kpiOverview.title,
    live_operations_board: copy.liveOps.title,
    todays_planning: copy.planning.title,
    operations_map: copy.map.title,
    quality_center: copy.quality.title,
    employee_leaderboard: copy.employees.title,
    customer_overview: copy.customers.title,
    financial_dashboard: copy.financial.title,
    inventory_panel: copy.inventory.title,
    ai_insights_panel: copy.aiInsights.title,
  };
  return titles[id] || fallback;
}

export async function OperationsDashboard({ context }: { context: AuthContext }) {
  const scope = getDashboardScope(context);
  if (!scope) return null;

  const copy = dashboardCopy[await getRequestLocale()];
  const allowed = visibleWidgetsForRole(scope.role);
  const savedRows = await serviceSelect<Array<{ widgets: UserWidgetPreference[] }>>(
    `dashboard_layouts?select=widgets&user_id=eq.${context.user.id}&dashboard_key=eq.operations&limit=1`,
  );
  const savedLayout = savedRows[0]?.widgets || null;
  const ordered = applyUserLayout(allowed, savedLayout);

  const sections = await Promise.all(
    ordered.map(async (widget) => {
      switch (widget.id) {
        case "kpi_overview":
          return <KpiOverview key={widget.id} data={await getTopKpis(scope)} copy={copy} />;
        case "live_operations_board":
          return <LiveOperationsBoard key={widget.id} rows={await getLiveOperationsBoard(scope)} copy={copy} />;
        case "todays_planning":
          return <TodaysPlanning key={widget.id} visits={await getTodaysPlanning(scope)} copy={copy} />;
        case "operations_map":
          return <OperationsMap key={widget.id} markers={await getMapMarkers(scope)} copy={copy} />;
        case "quality_center":
          return <QualityCenter key={widget.id} data={await getQualityCenter(scope)} copy={copy} />;
        case "employee_leaderboard":
          return <EmployeeLeaderboard key={widget.id} stats={await getEmployeePerformance(scope)} copy={copy} />;
        case "customer_overview":
          return <CustomerOverview key={widget.id} data={await getCustomerOverview(scope)} copy={copy} />;
        case "financial_dashboard":
          return <FinancialDashboard key={widget.id} data={await getFinancialDashboard(scope)} copy={copy} />;
        case "inventory_panel":
          return <InventoryPanel key={widget.id} data={await getInventoryOverview(scope)} copy={copy} />;
        case "ai_insights_panel":
          return <AiInsightsPanel key={widget.id} insights={await getAiInsights(scope)} copy={copy} />;
        default:
          return null;
      }
    }),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">{copy.eyebrow}</p>
          <h1 className="mt-1 font-serif text-3xl">{roleLabel(scope.role, copy)}</h1>
        </div>
        <DashboardLayoutEditor
          widgets={allowed.map((widget) => ({ id: widget.id, title: widgetTitle(widget.id, copy, widget.title) }))}
          initialLayout={savedLayout || allowed.map((widget) => ({ id: widget.id, visible: true }))}
          copy={copy.customize}
        />
      </div>
      {sections}
    </div>
  );
}
