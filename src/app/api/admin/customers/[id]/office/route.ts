import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceUpdate } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { officeId?: string | null } | null;
  if (body?.officeId !== null && typeof body?.officeId !== "string") return NextResponse.json({ error: "bad_request" }, { status: 400 });

  await serviceUpdate("customers", `id=eq.${id}`, { office_id: body.officeId });
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id, action: "customer_office_assigned", resource_type: "customer", resource_id: id,
    new_value: { office_id: body.officeId },
  });
  return NextResponse.json({ ok: true });
}
