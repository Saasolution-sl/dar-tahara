import { CustomersTable } from "@/components/admin/customers-table";
import { requireRole } from "@/lib/portal-auth";

export default async function Customers() {
  await requireRole(["administrator"]);
  return <CustomersTable canAssignOffice />;
}
