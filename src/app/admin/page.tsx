import { OperationsDashboard } from "@/components/dashboard/OperationsDashboard";
import { requireRole } from "@/lib/portal-auth";

export default async function AdminPage() {
  const context = await requireRole(["administrator"]);
  return <OperationsDashboard context={context} />;
}
