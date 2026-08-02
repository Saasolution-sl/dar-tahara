import { CustomersTable } from "@/components/admin/customers-table";
import { requireRole } from "@/lib/portal-auth";

export default async function RegionalManagerCustomers() {
  const context = await requireRole(["regional_manager", "administrator"]);
  const scoped = context.roles.includes("administrator") ? undefined : context.officeIds;
  return <CustomersTable officeIds={scoped} />;
}
