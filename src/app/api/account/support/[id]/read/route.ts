import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceUpdate } from "@/lib/supabase-rpc";
import { requireOwnedSupportRequest } from "@/lib/hospitality-support/repository";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["applicant", "customer", "customer_company"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  const { id } = await context.params;
  try {
    await requireOwnedSupportRequest(auth.context.customerId, id);
  } catch {
    return NextResponse.json({ error: "support_request_not_found" }, { status: 404 });
  }
  const now = new Date().toISOString();
  await Promise.all([
    serviceUpdate("support_requests", `id=eq.${id}`, { customer_unread_count: 0 }),
    serviceUpdate("support_notifications", `support_request_id=eq.${id}&customer_id=eq.${auth.context.customerId}&read_at=is.null`, { delivery_status: "read", read_at: now }),
    serviceInsert("audit_logs", {
      actor_user_id: auth.context.user.id,
      action: "support_request_marked_read",
      resource_type: "support_request",
      resource_id: id,
      new_value: { read_at: now, content_logged: false },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
