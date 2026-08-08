import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

const STATUSES = new Set(["suspended_manual", "active"]);

type SubscriptionRow = {
  id: string;
  customer_id: string;
  operational_status: string;
  customers: { office_id: string | null };
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator", "manager", "regional_manager"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { operational_status?: string; reason?: string } | null;
  const operationalStatus = body?.operational_status;
  if (!operationalStatus || !STATUSES.has(operationalStatus)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const rows = await serviceSelect<SubscriptionRow[]>(
    `subscriptions?id=eq.${id}&select=id,customer_id,operational_status,customers(office_id)&limit=1`,
  );
  const subscription = rows[0];
  if (!subscription) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (auth.context.roles.includes("regional_manager") && !auth.context.roles.includes("administrator")) {
    const officeId = subscription.customers?.office_id;
    if (!officeId || !auth.context.officeIds.includes(officeId)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  if (subscription.operational_status === operationalStatus) return NextResponse.json({ ok: true, operational_status: operationalStatus });

  // Only manual suspensions/restores go through this route: automated
  // non-payment suspension (billing-collection job) and cancellation-pending
  // states manage themselves and must not be clobbered here.
  if (subscription.operational_status !== "active" && subscription.operational_status !== "suspended_manual") {
    return NextResponse.json({ error: "not_manually_manageable" }, { status: 409 });
  }

  const reason = body?.reason || "manual_admin_action";

  if (operationalStatus === "suspended_manual") {
    await serviceUpdate("subscriptions", `id=eq.${id}`, {
      operational_status: "suspended_manual", suspended_at: new Date().toISOString(), suspension_reason: reason,
    });
    await serviceInsert("subscription_suspensions", {
      subscription_id: id, customer_id: subscription.customer_id, reason,
    });
  } else {
    await serviceUpdate("subscriptions", `id=eq.${id}`, {
      operational_status: "active", suspended_at: null, suspension_reason: null, suspension_invoice_id: null,
    });
    await serviceUpdate("subscription_suspensions", `subscription_id=eq.${id}&ended_at=is.null`, {
      ended_at: new Date().toISOString(), restored_by: "admin",
    });
  }

  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: operationalStatus === "suspended_manual" ? "subscription_suspended" : "subscription_restored",
    resource_type: "subscription",
    resource_id: id,
    previous_value: { operational_status: subscription.operational_status },
    new_value: { operational_status: operationalStatus, reason },
  });

  return NextResponse.json({ ok: true, operational_status: operationalStatus });
}
