import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { ACTIVE_DEEP_CLEAN_REQUEST_STATUSES, validateDeepCleanRequest } from "@/lib/deep-clean-eligibility";
import { calculateDeepCleanPriceCents } from "@/lib/deep-clean-pricing";
import { createDeepCleanCheckoutSession } from "@/lib/stripe";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { getDurationTiers } from "@/lib/subscription-duration-config";
import { findDurationTier } from "@/lib/subscription-duration";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

type SubscriptionRow = {
  id: string;
  customer_id: string;
  status: string;
  contract_duration_months: number | null;
  deep_clean_free_used: boolean;
  properties: { declared_size_m2: number };
  customers: { email: string; full_name: string; preferred_language: Locale };
};

export async function POST(req: NextRequest) {
  const auth = await authorizeApi(["customer", "staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const subscriptionId = typeof body.subscriptionId === "string" ? body.subscriptionId : "";
  if (!/^[0-9a-f-]{36}$/i.test(subscriptionId)) return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });

  const rows = await serviceSelect<SubscriptionRow[]>(
    `subscriptions?id=eq.${subscriptionId}&select=id,customer_id,status,contract_duration_months,deep_clean_free_used,properties(declared_size_m2),customers(email,full_name,preferred_language)&limit=1`,
  );
  const subscription = rows[0];
  if (!subscription || subscription.customer_id !== auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const existing = await serviceSelect<Array<{ id: string }>>(
    `deep_clean_requests?subscription_id=eq.${subscriptionId}&status=in.(${ACTIVE_DEEP_CLEAN_REQUEST_STATUSES.join(",")})&select=id&limit=1`,
  );

  const tiers = await getDurationTiers();
  const tier = subscription.contract_duration_months ? findDurationTier(tiers, subscription.contract_duration_months) : null;

  const result = validateDeepCleanRequest(
    {
      status: subscription.status,
      contractIncludesFreeDeepClean: tier?.includesFreeDeepClean ?? false,
      deepCleanFreeUsed: subscription.deep_clean_free_used,
    },
    existing.length > 0,
    body,
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const priceCents = result.value.isFree ? 0 : calculateDeepCleanPriceCents(subscription.properties.declared_size_m2);
  if (priceCents === null) return NextResponse.json({ error: "custom_quote_required" }, { status: 409 });

  const [created] = await serviceInsert<Array<{ id: string }>>("deep_clean_requests", {
    subscription_id: subscriptionId,
    customer_id: auth.context.customerId,
    requested_date: result.value.requestedDate,
    is_free: result.value.isFree,
    price_cents: priceCents,
    payment_status: result.value.isFree ? "not_required" : "pending",
    status: "submitted",
  });
  const requestId = created?.id;
  const locale = subscription.customers.preferred_language;

  if (result.value.isFree || !requestId) {
    await sendTransactionalEmail({
      template: "deep_clean_request_confirmation", locale,
      email: subscription.customers.email, name: subscription.customers.full_name,
      date: result.value.requestedDate,
    });
    return NextResponse.json({ ok: true, id: requestId, isFree: true });
  }

  try {
    const session = await createDeepCleanCheckoutSession({
      deepCleanRequestId: requestId,
      customerEmail: subscription.customers.email,
      locale,
      amountCents: priceCents,
      requestedDate: result.value.requestedDate,
      requestOrigin: req.nextUrl.origin,
    });
    await serviceUpdate("deep_clean_requests", `id=eq.${requestId}`, { stripe_checkout_session_id: session.id });
    return NextResponse.json({ ok: true, id: requestId, isFree: false, checkoutUrl: session.url });
  } catch {
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
