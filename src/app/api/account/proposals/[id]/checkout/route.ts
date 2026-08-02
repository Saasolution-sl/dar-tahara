import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { featureEnabled } from "@/lib/feature-flags";
import {
  serviceInsert,
  serviceInsertIgnoreDuplicates,
  serviceSelect,
  serviceUpdate,
  serviceUpsert,
} from "@/lib/supabase-rpc";
import {
  createAuthorizedSubscriptionSchedule,
  retrievePaymentIntent,
  setCustomerDefaultPaymentMethod,
} from "@/lib/stripe";
import { isSameOrigin } from "@/lib/request-security";
import {
  nextFridayPaymentAt,
  SUBSCRIPTION_PAYMENT_CONSENT_VERSION,
} from "@/lib/subscription-activation";

type Proposal = {
  id: string;
  assessment_id: string;
  customer_id: string;
  property_id: string;
  status: string;
  billing_interval: "monthly" | "annual";
  frequency: string;
  recurring_amount_cents: number;
  initial_amount_cents: number;
  additional_fees_cents: number;
  discount_basis_points: number;
  currency: string;
  expires_at: string | null;
  contract_duration_months: 3 | 6 | 9 | 12;
  duration_discount_basis_points: number;
  price_before_duration_discount_cents: number;
  minimum_contract_value_cents: number;
  pause_eligible: boolean;
  pricing_snapshot: unknown;
  pricing_version: string | null;
  terms_version: string;
  customers: {
    stripe_customer_id: string | null;
  };
};

type AssessmentPayment = {
  status: string;
  payment_status: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_method_id: string | null;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  }
  const auth = await authorizeApi(["applicant", "customer"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!(await featureEnabled("subscription_checkout_enabled"))) {
    return NextResponse.json({ error: "checkout_disabled" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (body.automaticPaymentAuthorized !== true) {
    return NextResponse.json(
      { error: "automatic_payment_authorization_required" },
      { status: 400 },
    );
  }
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const rows = await serviceSelect<Proposal[]>(
    `subscription_proposals?id=eq.${id}&customer_id=eq.${auth.context.customerId}&select=*,customers(stripe_customer_id)&limit=1`,
  );
  const proposal = rows[0];
  if (
    !proposal
    || proposal.status !== "ready"
    || (proposal.expires_at && Date.parse(proposal.expires_at) <= Date.now())
  ) {
    return NextResponse.json(
      { error: "proposal_not_available" },
      { status: 409 },
    );
  }
  if (
    !(await featureEnabled(
      proposal.billing_interval === "annual"
        ? "annual_subscription_enabled"
        : "monthly_subscription_enabled",
    ))
  ) {
    return NextResponse.json(
      { error: "billing_interval_disabled" },
      { status: 403 },
    );
  }

  const assessmentRows = await serviceSelect<AssessmentPayment[]>(
    `home_assessments?id=eq.${proposal.assessment_id}&customer_id=eq.${proposal.customer_id}&select=status,payment_status,stripe_customer_id,stripe_payment_intent_id,stripe_payment_method_id&limit=1`,
  );
  const assessment = assessmentRows[0];
  if (
    !assessment
    || assessment.status !== "approved"
    || assessment.payment_status !== "paid"
    || !assessment.stripe_payment_intent_id
  ) {
    return NextResponse.json(
      { error: "assessment_approval_and_payment_required" },
      { status: 409 },
    );
  }

  const stripeCustomerId =
    proposal.customers.stripe_customer_id || assessment.stripe_customer_id;
  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: "assessment_payment_method_unavailable" },
      { status: 409 },
    );
  }

  let paymentMethodId = assessment.stripe_payment_method_id;
  try {
    const paymentIntent = await retrievePaymentIntent(
      assessment.stripe_payment_intent_id,
    );
    if (
      paymentIntent.status !== "succeeded"
      || paymentIntent.customer !== stripeCustomerId
      || !paymentIntent.payment_method
    ) {
      return NextResponse.json(
        { error: "assessment_payment_method_unavailable" },
        { status: 409 },
      );
    }
    paymentMethodId = paymentIntent.payment_method;
    await setCustomerDefaultPaymentMethod({
      customerId: stripeCustomerId,
      paymentMethodId,
      idempotencyKey: `assessment_default_payment_method_${proposal.assessment_id}`,
    });
  } catch (error) {
    console.error(
      "[subscription-authorization] assessment payment method verification failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "assessment_payment_method_unavailable" },
      { status: 409 },
    );
  }

  const annualMultiplier = 12 * (1 - proposal.discount_basis_points / 10_000);
  const monthlyPrice = proposal.billing_interval === "annual"
    ? Math.round(proposal.recurring_amount_cents / annualMultiplier)
    : proposal.recurring_amount_cents;
  const [subscription] = await serviceUpsert<{
    id: string;
    stripe_subscription_schedule_id: string | null;
    first_payment_scheduled_for: string | null;
  }[]>(
    "subscriptions",
    {
      customer_id: proposal.customer_id,
      property_id: proposal.property_id,
      assessment_id: proposal.assessment_id,
      status: "pending_payment",
      frequency: proposal.frequency,
      billing_interval: proposal.billing_interval,
      monthly_price_cents: monthlyPrice,
      billed_price_cents: proposal.recurring_amount_cents,
      currency: proposal.currency,
      stripe_customer_id: stripeCustomerId,
      stripe_payment_method_id: paymentMethodId,
      contract_duration_months: proposal.contract_duration_months,
      duration_discount_basis_points: proposal.duration_discount_basis_points,
      price_before_duration_discount_cents:
        proposal.price_before_duration_discount_cents,
      minimum_contract_value_cents: proposal.minimum_contract_value_cents,
      pause_eligible: proposal.pause_eligible,
      pricing_snapshot: proposal.pricing_snapshot,
      pricing_version: proposal.pricing_version,
      terms_version: proposal.terms_version,
      auto_renew: true,
    },
    "assessment_id",
  );
  if (!subscription) {
    return NextResponse.json(
      { error: "subscription_creation_failed" },
      { status: 502 },
    );
  }

  const authorizedAt = new Date();
  const requestedFirstPaymentAt = nextFridayPaymentAt(authorizedAt);
  let schedule;
  try {
    schedule = await createAuthorizedSubscriptionSchedule({
      subscriptionId: subscription.id,
      assessmentId: proposal.assessment_id,
      proposalId: proposal.id,
      customerId: stripeCustomerId,
      paymentMethodId,
      frequencyLabel: proposal.frequency,
      billingInterval: proposal.billing_interval,
      amountCents: proposal.recurring_amount_cents,
      initialAmountCents:
        proposal.initial_amount_cents + proposal.additional_fees_cents,
      currency: proposal.currency,
      startsAt: requestedFirstPaymentAt,
      contractDurationMonths: proposal.contract_duration_months,
    });
  } catch (error) {
    console.error(
      "[subscription-authorization] Stripe schedule creation failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "automatic_payment_scheduling_failed" },
      { status: 502 },
    );
  }

  const scheduleStartUnix =
    schedule.start_date || schedule.phases?.[0]?.start_date;
  const firstPaymentAt = scheduleStartUnix
    ? new Date(scheduleStartUnix * 1000)
    : requestedFirstPaymentAt;
  const authorizedAtIso = authorizedAt.toISOString();
  const firstPaymentIso = firstPaymentAt.toISOString();
  const clientIp = (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || ""
  ).slice(0, 100) || null;
  const userAgent = (req.headers.get("user-agent") || "").slice(0, 500) || null;

  await serviceInsertIgnoreDuplicates(
    "subscription_payment_authorizations",
    {
      proposal_id: proposal.id,
      subscription_id: subscription.id,
      assessment_id: proposal.assessment_id,
      customer_id: proposal.customer_id,
      automatic_payments_authorized: true,
      consent_version: SUBSCRIPTION_PAYMENT_CONSENT_VERSION,
      terms_version: proposal.terms_version,
      amount_cents: proposal.recurring_amount_cents,
      currency: proposal.currency,
      billing_interval: proposal.billing_interval,
      first_payment_scheduled_for: firstPaymentIso,
      stripe_payment_method_id: paymentMethodId,
      client_ip: clientIp,
      user_agent: userAgent,
      authorized_at: authorizedAtIso,
    },
    "proposal_id",
  );
  await Promise.all([
    serviceUpdate("home_assessments", `id=eq.${proposal.assessment_id}`, {
      stripe_payment_method_id: paymentMethodId,
    }),
    serviceUpdate("subscriptions", `id=eq.${subscription.id}`, {
      stripe_subscription_schedule_id: schedule.id,
      stripe_payment_method_id: paymentMethodId,
      first_payment_scheduled_for: firstPaymentIso,
      payment_authorized_at: authorizedAtIso,
    }),
    serviceUpdate("subscription_proposals", `id=eq.${proposal.id}`, {
      status: "accepted",
      accepted_at: authorizedAtIso,
    }),
    serviceInsert("assessment_events", {
      assessment_id: proposal.assessment_id,
      event_type: "automatic_subscription_payment_authorized",
      from_status: "approved",
      to_status: "approved",
      actor_type: "customer",
      actor_reference: auth.context.user.id,
      metadata: {
        proposal_id: proposal.id,
        subscription_id: subscription.id,
        first_payment_scheduled_for: firstPaymentIso,
        consent_version: SUBSCRIPTION_PAYMENT_CONSENT_VERSION,
      },
    }),
    serviceInsert("audit_logs", {
      actor_user_id: auth.context.user.id,
      action: "subscription_automatic_payment_authorized",
      resource_type: "subscription_proposal",
      resource_id: proposal.id,
      new_value: {
        status: "accepted",
        subscription_id: subscription.id,
        stripe_subscription_schedule_id: schedule.id,
        first_payment_scheduled_for: firstPaymentIso,
        consent_version: SUBSCRIPTION_PAYMENT_CONSENT_VERSION,
      },
    }),
    serviceInsert("customer_activity", {
      customer_id: proposal.customer_id,
      event_type: "subscription_payment_scheduled",
      resource_type: "subscription",
      resource_id: subscription.id,
      public_summary: `Automatic subscription payment scheduled for ${firstPaymentIso.slice(0, 10)}.`,
      metadata: { first_payment_scheduled_for: firstPaymentIso },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    subscriptionId: subscription.id,
    firstPaymentScheduledFor: firstPaymentIso,
  });
}
