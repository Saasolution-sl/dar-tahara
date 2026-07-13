import { NextRequest, NextResponse } from "next/server";
import { TERMS_VERSION, validateAssessmentBooking } from "@/lib/assessment";
import { createAssessmentCheckoutSession } from "@/lib/stripe";
import { isServiceRoleConfigured, serviceInsert, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type IdRow = { id: string; reference?: string };

export async function POST(req: NextRequest) {
  if (!isServiceRoleConfigured() || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "checkout_not_configured" }, { status: 503 });
  }
  const parsed = validateAssessmentBooking(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
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
      preferred_date: value.preferredDate,
      alternate_date: value.alternateDate,
      preferred_time_slot: value.timeSlot,
      terms_version: TERMS_VERSION,
      legal_acceptance: {
        propertyAccuracy: true,
        terms: true,
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
      preferredDate: value.preferredDate,
      requestOrigin: req.nextUrl.origin,
    });
    await serviceUpdate("home_assessments", `id=eq.${assessment.id}`, { stripe_checkout_session_id: session.id });
    return NextResponse.json({ checkoutUrl: session.url, reference: assessment.reference });
  } catch (error) {
    console.error("[assessment-checkout]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
