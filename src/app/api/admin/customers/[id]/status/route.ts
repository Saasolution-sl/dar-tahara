import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

const STATUSES = new Set(["suspended", "customer"]);

type CustomerRow = { id: string; status: string; office_id: string | null };

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator", "manager", "regional_manager"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { status?: string; reason?: string } | null;
  const status = body?.status;
  if (!status || !STATUSES.has(status)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const rows = await serviceSelect<CustomerRow[]>(`customers?id=eq.${id}&select=id,status,office_id&limit=1`);
  const customer = rows[0];
  if (!customer) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (auth.context.roles.includes("regional_manager") && !auth.context.roles.includes("administrator")) {
    if (!customer.office_id || !auth.context.officeIds.includes(customer.office_id)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  if (customer.status === status) return NextResponse.json({ ok: true, status });

  await serviceUpdate("customers", `id=eq.${id}`, { status });
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: status === "suspended" ? "customer_suspended" : "customer_restored",
    resource_type: "customer",
    resource_id: id,
    previous_value: { status: customer.status },
    new_value: { status, reason: body?.reason || null },
  });

  return NextResponse.json({ ok: true, status });
}
