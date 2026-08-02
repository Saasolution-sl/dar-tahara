import { SubscriptionsTable } from "@/components/admin/subscriptions-table";
import { requireRole } from "@/lib/portal-auth";

export default async function RegionalManagerSubscriptions() {
  const context = await requireRole(["regional_manager", "administrator"]);
  const scoped = context.roles.includes("administrator") ? undefined : context.officeIds;
  return <SubscriptionsTable officeIds={scoped} />;
}
