import { OfficesClient } from "@/components/admin/OfficesClient";
import { requireRole } from "@/lib/portal-auth";
import { dashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

export default async function OfficesPage() {
  await requireRole(["administrator"]);
  return <OfficesClient copy={dashboardCopy[await getRequestLocale()]} />;
}
