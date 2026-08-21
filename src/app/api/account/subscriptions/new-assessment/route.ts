import { NextRequest, NextResponse } from "next/server";
import { TERMS_VERSION, validateAssessmentBooking } from "@/lib/assessment";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { rateLimitShared } from "@/lib/rate-limit";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import {
  isServiceRoleConfigured,
  serviceDelete,
  serviceInsert,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";
import { createAssessmentCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getDurationTiers } from "@/lib/subscription-duration-config";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

type CustomerRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  preferred_language: Locale;
  stripe_customer_id: string | null;
  payment_method_ready_at: string | null;
};

type IdRow = { id: string; reference?: string };

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  }

  const auth = await authorizeApi(["applicant", "customer"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const customerId = auth.context.customerId;
  if (!customerId) {
    return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  }
  if (!isServiceRoleConfigured() || !isStripeConfigured()) {
    return NextResponse.json({ error: "application_not_configured" }, { status: 503 });
  }

  const limit = await rateLimitShared(
    `account-new-assessment:${auth.context.user.id}:${clientIpFromHeaders(req.headers)}`,
  );
  if (!limit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const customers = await serviceSelect<CustomerRow[]>(
    `customers?id=eq.${customerId}&select=id,email,full_name,phone,preferred_language,stripe_customer_id,payment_method_ready_at&limit=1`,
  );
  const customer = customers[0];
  if (!customer?.phone) {
    return NextResponse.json({ error: "profile_incomplete" }, { status: 409 });
  }
  if (!customer.stripe_customer_id || !customer.payment_method_ready_at) {
    return NextResponse.json({ error: "payment_details_required" }, { status: 409 });
  }

  const submittedBody = (await req.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const durationTiers = await getDurationTiers();
  const parsed = validateAssessmentBooking(
    {
      ...(submittedBody || {}),
      locale: customer.preferred_language,
      fullName: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      doorlockInstallationRequested: false,
      doorlockInternetConfirmed: false,
    },
    new Date(),
    durationTiers,
  );
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { value, quote } = parsed;
  let propertyId: string | null = null;
  let assessmentId: string | null = null;
  let checkoutCreated = false;
  try {
    const [property] = await serviceInsert<IdRow[]>("properties", {
      customer_id: customerId,
      address_line1: value.addressLine1,
      address_line2: value.addressLine2,
      city: value.city,
      postal_code: value.postalCode,
      country_code: value.countryCode,
      declared_size_m2: value.sizeM2,
      declared_bedrooms: value.bedrooms,
      declared_bathrooms: value.bathrooms,
      pets: value.pets,
      pet_details: value.petDetails,
      smoking: value.smoking,
      declared_condition: value.condition,
      access_notes: value.accessNotes,
    });
    propertyId = property.id;

    const [assessment] = await serviceInsert<IdRow[]>("home_assessments", {
      customer_id: customerId,
      property_id: propertyId,
      requested_frequency: value.frequency,
      requested_billing_interval: value.billingInterval,
      requested_duration_months: value.durationMonths,
      estimated_monthly_cents: quote.estimatedMonthlyCents,
      estimated_annual_cents: quote.estimatedAnnualCents,
      assessment_price_cents: quote.assessmentPriceCents,
      doorlock_installation_requested: false,
      doorlock_internet_confirmed: false,
      doorlock_installation_price_cents: 0,
      preferred_date: value.preferredDate,
      alternate_date: value.alternateDate,
      preferred_time_slot: value.timeSlot,
      terms_version: TERMS_VERSION,
      legal_acceptance: {
        propertyAccuracy: true,
        terms: true,
        acceptedAt: new Date().toISOString(),
        ip: clientIpFromHeaders(req.headers),
        userAgent: req.headers.get("user-agent")?.slice(0, 500) || null,
        source: "customer_portal_new_subscription",
      },
      status: "awaiting_payment",
      payment_status: "unpaid",
      submitted_at: new Date().toISOString(),
      next_action: "assessment_payment",
    });
    assessmentId = assessment.id;
    const reference = assessment.reference || assessment.id;

    const session = await createAssessmentCheckoutSession({
      assessmentId,
      reference,
      customerEmail: customer.email,
      stripeCustomerId: customer.stripe_customer_id,
      locale: customer.preferred_language,
      amountCents: quote.assessmentPriceCents,
      preferredDate: value.preferredDate,
      requestOrigin: req.nextUrl.origin,
      returnToAccount: true,
    });
    if (!session.url) throw new Error("stripe_checkout_url_missing");
    checkoutCreated = true;

    await serviceUpdate("home_assessments", `id=eq.${assessmentId}`, {
      stripe_checkout_session_id: session.id,
    });
    const bookkeeping = await Promise.allSettled([
      serviceInsert("assessment_events", {
        assessment_id: assessmentId,
        event_type: "payment_started",
        to_status: "awaiting_payment",
        actor_type: "customer",
        actor_reference: session.id,
      }),
      serviceInsert("audit_logs", {
        actor_user_id: auth.context.user.id,
        action: "customer_new_property_assessment_checkout_started",
        resource_type: "home_assessment",
        resource_id: assessmentId,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
      }),
    ]);
    if (bookkeeping.some((result) => result.status === "rejected")) {
      console.warn("[account-new-subscription-assessment] bookkeeping_failed");
    }

    return NextResponse.json(
      { checkoutUrl: session.url, reference },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    // The property must never leak into the portal if Stripe checkout could
    // not be created. These deletes are a rollback of this request only.
    if (!checkoutCreated && assessmentId) {
      await serviceDelete("home_assessments", `id=eq.${assessmentId}`).catch(() => undefined);
    }
    if (!checkoutCreated && propertyId) {
      await serviceDelete("properties", `id=eq.${propertyId}`).catch(() => undefined);
    }
    console.error(
      "[account-new-subscription-assessment]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
