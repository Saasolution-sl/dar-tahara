import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type OfficeRow = { id: string; name: string; city: string | null; created_at: string };
type RegionalManagerAssignment = { user_id: string; office_id: string };
type StaffRow = { auth_user_id: string; full_name: string; email: string };

export async function GET() {
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [offices, assignments, regionalManagers] = await Promise.all([
    serviceSelect<OfficeRow[]>("offices?select=id,name,city,created_at&order=name.asc"),
    serviceSelect<RegionalManagerAssignment[]>("regional_manager_offices?select=user_id,office_id"),
    serviceSelect<StaffRow[]>("staff_members?role=eq.regional_manager&select=auth_user_id,full_name,email"),
  ]);

  const managerNames = new Map(regionalManagers.filter((r) => r.auth_user_id).map((r) => [r.auth_user_id as string, r.full_name]));
  const officesWithManagers = offices.map((office) => ({
    ...office,
    regionalManagers: assignments
      .filter((a) => a.office_id === office.id)
      .map((a) => ({ userId: a.user_id, name: managerNames.get(a.user_id) || a.user_id })),
  }));

  return NextResponse.json({ offices: officesWithManagers, regionalManagers });
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => null)) as { name?: string; city?: string } | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 200) : "";
  const city = typeof body?.city === "string" ? body.city.trim().slice(0, 200) : null;
  if (!name) return NextResponse.json({ error: "office_name_required" }, { status: 400 });

  const [office] = await serviceInsert<OfficeRow[]>("offices", { name, city });
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id, action: "office_created", resource_type: "office", resource_id: office.id,
    new_value: { name, city },
  });
  return NextResponse.json({ ok: true, office });
}
