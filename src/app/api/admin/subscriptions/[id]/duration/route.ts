import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { getDurationTiers } from "@/lib/subscription-duration-config";
import { findDurationTier } from "@/lib/subscription-duration";

export const runtime = "nodejs";

type SubscriptionRow = {
  id: string;
  contract_duration_months: number | null;
  pause_eligible: boolean;
  customers: { office_id: string | null };
};

/**
 * Lets a manager/admin set (or clear) a subscription's duration tier from the
 * dashboard instead of editing the database directly. contract_duration_months
 * feeds the duration-discount pricing math (subscription-duration.ts) and
 * future invoice totals, so this is a real billing change, not cosmetic -
 * gated the same way subscription status changes are, and audit-logged.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator", "manager", "regional_manager"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { contract_duration_months?: number | null } | null;
  const requestedMonths = body ? body.contract_duration_months : undefined;
  if (requestedMonths !== null && ![3, 6, 9, 12].includes(requestedMonths as number)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const rows = await serviceSelect<SubscriptionRow[]>(
    `subscriptions?id=eq.${id}&select=id,contract_duration_months,pause_eligible,customers(office_id)&limit=1`,
  );
  const subscription = rows[0];
  if (!subscription) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (auth.context.roles.includes("regional_manager") && !auth.context.roles.includes("administrator")) {
    const officeId = subscription.customers?.office_id;
    if (!officeId || !auth.context.officeIds.includes(officeId)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  let pauseEligible = false;
  if (requestedMonths !== null) {
    const tiers = await getDurationTiers();
    const tier = findDurationTier(tiers, requestedMonths as number);
    if (!tier) return NextResponse.json({ error: "tier_not_available" }, { status: 400 });
    pauseEligible = tier.pauseEligible;
  }

  await serviceUpdate("subscriptions", `id=eq.${id}`, {
    contract_duration_months: requestedMonths,
    pause_eligible: pauseEligible,
  });

  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: "subscription_duration_changed",
    resource_type: "subscription",
    resource_id: id,
    previous_value: { contract_duration_months: subscription.contract_duration_months, pause_eligible: subscription.pause_eligible },
    new_value: { contract_duration_months: requestedMonths, pause_eligible: pauseEligible },
  });

  return NextResponse.json({ ok: true, contract_duration_months: requestedMonths, pause_eligible: pauseEligible });
}
