import { TeamProfilesClient } from "@/components/admin/TeamProfilesClient";
import { requireRole } from "@/lib/portal-auth";
import { dashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

export default async function TeamProfilesPage() {
  await requireRole(["administrator"]);
  return <TeamProfilesClient canInvite copy={dashboardCopy[await getRequestLocale()]} />;
}
