import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceDelete, serviceInsert, serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: officeId } = await params;
  const body = (await req.json().catch(() => null)) as { userId?: string } | null;
  const userId = body?.userId;
  if (!userId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const staffRows = await serviceSelect<Array<{ auth_user_id: string | null; role: string }>>(
    `staff_members?auth_user_id=eq.${userId}&select=auth_user_id,role&limit=1`,
  );
  if (staffRows[0]?.role !== "regional_manager") return NextResponse.json({ error: "not_a_regional_manager" }, { status: 400 });

  await serviceInsert("regional_manager_offices", { user_id: userId, office_id: officeId, granted_by: auth.context.user.id });
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id, action: "regional_manager_office_assigned", resource_type: "office", resource_id: officeId,
    new_value: { user_id: userId },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: officeId } = await params;
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  await serviceDelete("regional_manager_offices", `user_id=eq.${userId}&office_id=eq.${officeId}`);
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id, action: "regional_manager_office_unassigned", resource_type: "office", resource_id: officeId,
    previous_value: { user_id: userId },
  });
  return NextResponse.json({ ok: true });
}
