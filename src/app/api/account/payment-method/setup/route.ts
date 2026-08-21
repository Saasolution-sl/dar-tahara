import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { rateLimitShared } from "@/lib/rate-limit";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import {
  createPaymentMethodSetupCheckoutSession,
  createStripeCustomer,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import {
  serviceInsert,
  serviceUpdate,
} from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  }
  const auth = await authorizeApi(["applicant", "customer"]);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }
  const customerId = auth.context.customerId;
  if (!customerId) {
    return NextResponse.json(
      { error: "profile_not_found" },
      { status: 404 },
    );
  }

  const limit = await rateLimitShared(
    `payment-method-setup:${auth.context.user.id}:${clientIpFromHeaders(req.headers)}`,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 },
    );
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select(
      "email,full_name,preferred_language,stripe_customer_id,payment_method_ready_at",
    )
    .eq("id", customerId)
    .single();
  if (!customer) {
    return NextResponse.json(
      { error: "profile_not_found" },
      { status: 404 },
    );
  }
  if (customer.payment_method_ready_at) {
    return NextResponse.json(
      { error: "payment_method_already_ready" },
      { status: 409 },
    );
  }

  try {
    let stripeCustomerId = customer.stripe_customer_id;
    if (!stripeCustomerId) {
      const stripeCustomer = await createStripeCustomer({
        customerId,
        email: customer.email,
        name: customer.full_name,
      });
      stripeCustomerId = stripeCustomer.id;
      await serviceUpdate("customers", `id=eq.${customerId}`, {
        stripe_customer_id: stripeCustomerId,
      });
    }

    const locale = isLocale(customer.preferred_language)
      ? customer.preferred_language
      : "en";
    const session = await createPaymentMethodSetupCheckoutSession({
      customerId: stripeCustomerId,
      darTaharaCustomerId: customerId,
      locale,
      requestOrigin: req.nextUrl.origin,
    });
    if (!session.url) throw new Error("stripe_checkout_url_missing");

    await serviceInsert("audit_logs", {
      actor_user_id: auth.context.user.id,
      action: "customer_payment_method_setup_started",
      resource_type: "customer",
      resource_id: customerId,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
    });
    return NextResponse.json(
      { url: session.url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "[account-payment-method-setup]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "payment_unavailable" },
      { status: 502 },
    );
  }
}
