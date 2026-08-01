import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceInsert, serviceSelect, serviceUpsert } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function GET() {
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const profiles = await serviceSelect("staff_members?role=in.(assessment,manager)&select=id,auth_user_id,full_name,email,phone,role,employee_number,active,created_at&order=created_at.desc");
  return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim().slice(0, 200) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 320) : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim().slice(0, 50) : "";
  const role = body?.role === "manager" || body?.role === "assessment" ? body.role : null;
  if (!fullName || !/^\S+@\S+\.\S+$/.test(email) || !phone || !role) return NextResponse.json({ error: "team_profile_fields_required" }, { status: 400 });

  const employeeNumber = `${role === "manager" ? "MGR" : "ASM"}-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const admin = createAdminClient();
  const invited = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/reset-password`,
    data: { full_name: fullName, invited_profile: role },
  });
  if (invited.error || !invited.data.user) {
    return NextResponse.json({ error: invited.error?.message || "team_invitation_failed" }, { status: 409 });
  }
  try {
    await serviceUpsert("staff_members", { auth_user_id: invited.data.user.id, full_name: fullName, email, phone, role, employee_number: employeeNumber, active: true }, "email");
    await serviceUpsert("user_roles", { user_id: invited.data.user.id, role, granted_by: auth.context.user.id }, "user_id,role");
    await serviceInsert("audit_logs", { actor_user_id: auth.context.user.id, action: "team_profile_invited", resource_type: "staff_member", resource_id: invited.data.user.id, new_value: { role, employeeNumber, email } });
    return NextResponse.json({ ok: true, employeeNumber });
  } catch (error) {
    await admin.auth.admin.deleteUser(invited.data.user.id).catch(() => undefined);
    console.error("[admin-team]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "team_profile_creation_failed" }, { status: 502 });
  }
}
