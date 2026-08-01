import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect } from "@/lib/supabase-rpc";
import { getDurationTiers } from "@/lib/subscription-duration-config";
import { findDurationTier } from "@/lib/subscription-duration";
import { ACTIVE_PAUSE_REQUEST_STATUSES, validatePauseRequest } from "@/lib/pause-eligibility";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { track } from "@/lib/analytics";

export const runtime = "nodejs";

type SubscriptionRow = {
  id: string;
  customer_id: string;
  status: string;
  contract_duration_months: number | null;
  pause_eligible: boolean;
  pause_used: boolean;
  current_contract_end_date: string | null;
  customers: { email: string; full_name: string; preferred_language: string };
};

export async function POST(req: NextRequest) {
  const auth = await authorizeApi(["customer", "staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const subscriptionId = typeof body.subscriptionId === "string" ? body.subscriptionId : "";
  if (!/^[0-9a-f-]{36}$/i.test(subscriptionId)) return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });

  const rows = await serviceSelect<SubscriptionRow[]>(
    `subscriptions?id=eq.${subscriptionId}&select=id,customer_id,status,contract_duration_months,pause_eligible,pause_used,current_contract_end_date,customers(email,full_name,preferred_language)&limit=1`,
  );
  const subscription = rows[0];
  if (!subscription || subscription.customer_id !== auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const tiers = await getDurationTiers();
  const tier = subscription.contract_duration_months
    ? findDurationTier(tiers, subscription.contract_duration_months)
    : null;

  const existing = await serviceSelect<Array<{ id: string }>>(
    `pause_requests?subscription_id=eq.${subscriptionId}&status=in.(${ACTIVE_PAUSE_REQUEST_STATUSES.join(",")})&select=id&limit=1`,
  );

  const result = validatePauseRequest(
    {
      status: subscription.status,
      pauseEligible: subscription.pause_eligible,
      pauseUsed: subscription.pause_used,
      currentContractEndDate: subscription.current_contract_end_date,
    },
    existing.length > 0,
    tier?.maxPauseMonths ?? 0,
    body,
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const [created] = await serviceInsert<Array<{ id: string }>>("pause_requests", {
    subscription_id: subscriptionId,
    customer_id: auth.context.customerId,
    reason_category: result.value.reasonCategory,
    reason_description: result.value.reasonDescription,
    requested_start_date: result.value.requestedStartDate,
    requested_end_date: result.value.requestedEndDate,
    status: "submitted",
  });

  const locale = subscription.customers.preferred_language as import("@/i18n/config").Locale;
  await sendTransactionalEmail({
    template: "pause_request_confirmation",
    locale,
    email: subscription.customers.email,
    name: subscription.customers.full_name,
    date: result.value.requestedStartDate,
    details: result.value.requestedEndDate,
  });

  return NextResponse.json({ ok: true, id: created?.id });
}
