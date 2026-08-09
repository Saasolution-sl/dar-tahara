import { KpiBaselinePage } from "@/components/kpi/KpiBaselinePage";
import { requireRole } from "@/lib/portal-auth";

export default async function ManagerKpisPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const context = await requireRole(["manager", "administrator"]);
  const params = await searchParams;
  return <KpiBaselinePage context={context} searchParams={params} />;
}
