import { OperationsDashboard } from "@/components/dashboard/OperationsDashboard";
import { requireRole } from "@/lib/portal-auth";

export default async function ManagerPage() {
  const context = await requireRole(["manager", "administrator"]);
  return <OperationsDashboard context={context} />;
}
