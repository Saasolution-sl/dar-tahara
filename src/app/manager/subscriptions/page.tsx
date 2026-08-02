import { SubscriptionsTable } from "@/components/admin/subscriptions-table";
import { requireRole } from "@/lib/portal-auth";

export default async function ManagerSubscriptions() {
  await requireRole(["manager", "administrator"]);
  return <SubscriptionsTable />;
}
