import { KpiBaselinePage } from "@/components/kpi/KpiBaselinePage";
import { requireRole } from "@/lib/portal-auth";

export default async function AdminKpisPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const context = await requireRole(["administrator"]);
  const params = await searchParams;
  return <KpiBaselinePage context={context} searchParams={params} />;
}
