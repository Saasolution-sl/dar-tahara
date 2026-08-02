import { TeamProfilesClient } from "@/components/admin/TeamProfilesClient";
import { requireRole } from "@/lib/portal-auth";

export default async function ManagerTeamProfiles() {
  await requireRole(["manager", "administrator"]);
  return <TeamProfilesClient canInvite={false} />;
}
