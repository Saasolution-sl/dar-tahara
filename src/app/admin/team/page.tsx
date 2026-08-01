import { TeamProfilesClient } from "@/components/admin/TeamProfilesClient";
import { requireRole } from "@/lib/portal-auth";

export default async function TeamProfilesPage() {
  await requireRole(["administrator"]);
  return <TeamProfilesClient />;
}
