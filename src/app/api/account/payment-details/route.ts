import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import {
  clientIpFromHeaders,
  rateLimit,
} from "@/lib/mailing-list";
import { authorizeApi } from "@/lib/portal-auth";
import { validatePaymentCredentials } from "@/lib/profile-security";
import { isSameOrigin } from "@/lib/request-security";
import {
  createBillingPortalSession,
  retrieveStripeCustomerPaymentDetails,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { serviceInsert } from "@/lib/supabase-rpc";

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
  if (!auth.context.customerId) {
    return NextResponse.json(
      { error: "profile_not_found" },
      { status: 404 },
    );
  }

  const limit = rateLimit(
    `payment-details:${auth.context.user.id}:${clientIpFromHeaders(req.headers)}`,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const credentials = validatePaymentCredentials({
    accountEmail: auth.context.user.email,
    enteredEmail: body.email,
    password: body.password,
  });
  if (!credentials.ok) {
    return NextResponse.json(
      { error: credentials.error },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: verified, error: credentialError } =
    await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
  if (
    credentialError ||
    !verified.user ||
    verified.user.id !== auth.context.user.id
  ) {
    return NextResponse.json(
      { error: "invalid_credentials" },
      { status: 400 },
    );
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("stripe_customer_id,preferred_language")
    .eq("id", auth.context.customerId)
    .single();
  if (!customer?.stripe_customer_id) {
    return NextResponse.json(
      { paymentMethod: null, portalUrl: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "payment_unavailable" },
      { status: 503 },
    );
  }

  const locale = isLocale(customer.preferred_language)
    ? customer.preferred_language
    : "en";
  try {
    const [paymentMethod, portal] = await Promise.all([
      retrieveStripeCustomerPaymentDetails(customer.stripe_customer_id),
      createBillingPortalSession({
        customerId: customer.stripe_customer_id,
        locale,
        returnUrl: `${req.nextUrl.origin}/account/profile`,
      }),
    ]);
    await serviceInsert("audit_logs", {
      actor_user_id: auth.context.user.id,
      action: "customer_payment_details_viewed",
      resource_type: "customer",
      resource_id: auth.context.customerId,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
    });
    return NextResponse.json(
      { paymentMethod, portalUrl: portal.url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "[account-payment-details]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "payment_unavailable" },
      { status: 502 },
    );
  }
}
