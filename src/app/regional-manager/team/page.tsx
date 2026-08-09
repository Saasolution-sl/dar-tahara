import { TeamProfilesClient } from "@/components/admin/TeamProfilesClient";
import { requireRole } from "@/lib/portal-auth";
import { dashboardCopy } from "@/i18n/dashboard-copy";
import { getRequestLocale } from "@/lib/request-locale";

export default async function RegionalManagerTeamProfiles() {
  await requireRole(["regional_manager", "administrator"]);
  return <TeamProfilesClient canInvite={false} copy={dashboardCopy[await getRequestLocale()]} />;
}
