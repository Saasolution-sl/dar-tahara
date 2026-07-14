import { NextRequest, NextResponse } from "next/server";
import { TERMS_VERSION, validateAssessmentBooking } from "@/lib/assessment";
import { createAssessmentCheckoutSession } from "@/lib/stripe";
import { isServiceRoleConfigured, serviceInsert, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";
import { rateLimit, clientIpFromHeaders } from "@/lib/mailing-list";

export const runtime = "nodejs";

type IdRow = { id: string; reference?: string };
export type AssessmentCheckoutResult =
  | { ok: true; checkoutUrl: string; reference?: string }
  | { ok: false; error: string; status: number };

export async function createAssessmentCheckout(
  body: unknown,
  req: NextRequest,
): Promise<AssessmentCheckoutResult> {
  if (!isServiceRoleConfigured() || !process.env.STRIPE_SECRET_KEY) {
    return { ok: false, error: "checkout_not_configured", status: 503 };
  }
  // Rate-limit checkout-session creation per IP (curbs abuse & rapid double-clicks).
  const rl = rateLimit(`assessment-checkout:${clientIpFromHeaders(req.headers)}`);
  if (!rl.allowed) return { ok: false, error: "rate_limited", status: 429 };
  const parsed = validateAssessmentBooking(body);
  if (!parsed.ok) {
    const details = body && typeof body === "object" ? body as Record<string, unknown> : {};
    console.warn("[assessment-checkout-validation]", {
      error: parsed.error,
      locale: typeof details.locale === "string" ? details.locale : null,
      frequency: typeof details.frequency === "string" ? details.frequency : null,
      preferredDate: typeof details.preferredDate === "string" ? details.preferredDate : null,
      sizeM2: typeof details.sizeM2 === "number" || typeof details.sizeM2 === "string" ? details.sizeM2 : null,
      hasCustomer: Boolean(details.fullName && details.email && details.phone),
      hasAddress: Boolean(details.addressLine1 && details.city && details.countryCode),
      legalAccepted: details.propertyAccuracyAccepted === true && details.termsAccepted === true,
    });
    return { ok: false, error: parsed.error, status: 400 };
  }
  const { value, quote } = parsed;
  try {
    const [customer] = await serviceUpsert<IdRow[]>("customers", {
      email: value.email,
      full_name: value.fullName,
      phone: value.phone,
      preferred_language: value.locale,
    }, "email");
    const [property] = await serviceInsert<IdRow[]>("properties", {
      customer_id: customer.id,
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
    const [assessment] = await serviceInsert<IdRow[]>("home_assessments", {
      customer_id: customer.id,
      property_id: property.id,
      requested_frequency: value.frequency,
      requested_billing_interval: value.billingInterval,
      estimated_monthly_cents: quote.estimatedMonthlyCents,
      estimated_annual_cents: quote.estimatedAnnualCents,
      assessment_price_cents: quote.assessmentPriceCents,
      doorlock_installation_requested: value.doorlockInstallationRequested,
      doorlock_internet_confirmed: value.doorlockInternetConfirmed,
      doorlock_installation_price_cents: quote.doorlockInstallationPriceCents,
      preferred_date: value.preferredDate,
      alternate_date: value.alternateDate,
      preferred_time_slot: value.timeSlot,
      terms_version: TERMS_VERSION,
      legal_acceptance: {
        propertyAccuracy: true,
        terms: true,
        doorlockInternetConfirmed: value.doorlockInternetConfirmed,
        acceptedAt: new Date().toISOString(),
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) || null,
      },
    });
    const session = await createAssessmentCheckoutSession({
      assessmentId: assessment.id,
      reference: assessment.reference || assessment.id,
      customerEmail: value.email,
      locale: value.locale,
      amountCents: quote.assessmentPriceCents,
      doorlockInstallationPriceCents: quote.doorlockInstallationPriceCents,
      preferredDate: value.preferredDate,
      requestOrigin: req.nextUrl.origin,
    });
    await serviceUpdate("home_assessments", `id=eq.${assessment.id}`, { stripe_checkout_session_id: session.id });
    if (!session.url) return { ok: false, error: "checkout_failed", status: 502 };
    return { ok: true, checkoutUrl: session.url, reference: assessment.reference };
  } catch (error) {
    console.error("[assessment-checkout]", error instanceof Error ? error.message : "unknown");
    return { ok: false, error: "checkout_failed", status: 500 };
  }
}

export async function POST(req: NextRequest) {
  const result = await createAssessmentCheckout(await req.json().catch(() => null), req);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ checkoutUrl: result.checkoutUrl, reference: result.reference });
}
