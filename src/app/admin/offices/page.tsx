import { OfficesClient } from "@/components/admin/OfficesClient";
import { requireRole } from "@/lib/portal-auth";

export default async function OfficesPage() {
  await requireRole(["administrator"]);
  return <OfficesClient />;
}
