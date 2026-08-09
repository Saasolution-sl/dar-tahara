import { OperationsDashboard } from "@/components/dashboard/OperationsDashboard";
import { requireRole } from "@/lib/portal-auth";

export default async function RegionalManagerPage() {
  const context = await requireRole(["regional_manager", "administrator"]);
  return <OperationsDashboard context={context} />;
}
