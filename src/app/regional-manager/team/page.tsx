import { TeamProfilesClient } from "@/components/admin/TeamProfilesClient";
import { requireRole } from "@/lib/portal-auth";

export default async function RegionalManagerTeamProfiles() {
  await requireRole(["regional_manager", "administrator"]);
  return <TeamProfilesClient canInvite={false} />;
}
