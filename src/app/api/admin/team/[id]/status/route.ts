import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

// Roles a manager (not administrator) may deactivate/reactivate. Managers
// cannot act on other managers, regional managers, or administrators.
const MANAGER_MANAGEABLE_ROLES = new Set(["cleaner", "inspector", "coordinator", "assessment"]);

type StaffRow = { id: string; auth_user_id: string | null; active: boolean; role: string; office_id: string | null };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator", "manager", "regional_manager"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { active?: boolean } | null;
  if (typeof body?.active !== "boolean") return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const active = body.active;

  const rows = await serviceSelect<StaffRow[]>(`staff_members?id=eq.${id}&select=id,auth_user_id,active,role,office_id&limit=1`);
  const staff = rows[0];
  if (!staff) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (staff.auth_user_id === auth.context.user.id) return NextResponse.json({ error: "cannot_act_on_self" }, { status: 400 });

  const isAdministrator = auth.context.roles.includes("administrator");
  if (!isAdministrator) {
    if (auth.context.roles.includes("regional_manager")) {
      if (!staff.office_id || !auth.context.officeIds.includes(staff.office_id)) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }
    if (!MANAGER_MANAGEABLE_ROLES.has(staff.role)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  if (staff.active === active) return NextResponse.json({ ok: true, active });

  await serviceUpdate("staff_members", `id=eq.${id}`, { active });
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: active ? "staff_reactivated" : "staff_deactivated",
    resource_type: "staff_member",
    resource_id: id,
    previous_value: { active: staff.active },
    new_value: { active },
  });

  return NextResponse.json({ ok: true, active });
}
