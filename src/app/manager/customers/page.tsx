import { CustomersTable } from "@/components/admin/customers-table";
import { requireRole } from "@/lib/portal-auth";

export default async function ManagerCustomers() {
  await requireRole(["manager", "administrator"]);
  return <CustomersTable />;
}
