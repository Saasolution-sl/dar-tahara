import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { setStripeSubscriptionCancelAtPeriodEnd } from "@/lib/stripe";

export const runtime = "nodejs";

type SubscriptionRow = {
  id: string;
  customer_id: string;
  status: string;
  billing_interval: "monthly" | "annual";
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  auto_renew: boolean;
  renewal_invoice_id: string | null;
  renewal_status: string | null;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  }
  const auth = await authorizeApi(["customer"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const rows = await serviceSelect<SubscriptionRow[]>(
    `subscriptions?id=eq.${id}&select=id,customer_id,status,billing_interval,stripe_subscription_id,current_period_end,auto_renew,renewal_invoice_id,renewal_status&limit=1`,
  );
  const subscription = rows[0];
  if (!subscription || subscription.customer_id !== auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (subscription.billing_interval !== "annual") {
    return NextResponse.json({ error: "not_prepaid" }, { status: 422 });
  }
  if (subscription.status === "cancelled") {
    return NextResponse.json({ error: "already_cancelled" }, { status: 409 });
  }
  if (!subscription.auto_renew || subscription.renewal_status === "disabled") {
    return NextResponse.json({
      ok: true,
      effectiveAt: subscription.current_period_end,
      duplicate: true,
    });
  }

  if (subscription.stripe_subscription_id) {
    await setStripeSubscriptionCancelAtPeriodEnd({
      subscriptionId: subscription.stripe_subscription_id,
      cancelAtPeriodEnd: true,
      idempotencyKey: `disable_prepaid_renewal_${subscription.id}`,
    });
  }

  const now = new Date().toISOString();
  if (subscription.renewal_invoice_id) {
    await serviceUpdate(
      "invoices",
      `id=eq.${subscription.renewal_invoice_id}&status=in.(draft,open,overdue)`,
      { status: "void" },
    );
    await serviceUpdate(
      "payment_links",
      `invoice_id=eq.${subscription.renewal_invoice_id}&status=eq.active`,
      { status: "invalidated", invalidated_at: now },
    );
  }
  await serviceUpdate("subscriptions", `id=eq.${subscription.id}`, {
    auto_renew: false,
    cancel_at_period_end: true,
    renewal_status: "disabled",
    renewal_payment_due_at: null,
    termination_reason: "prepaid_non_renewal",
    cancellation_effective_at: subscription.current_period_end,
  });
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: "prepaid_renewal_disabled",
    resource_type: "subscription",
    resource_id: subscription.id,
    previous_value: {
      auto_renew: subscription.auto_renew,
      renewal_status: subscription.renewal_status,
    },
    new_value: {
      auto_renew: false,
      renewal_status: "disabled",
      effective_at: subscription.current_period_end,
    },
  });

  return NextResponse.json({
    ok: true,
    effectiveAt: subscription.current_period_end,
  });
}
