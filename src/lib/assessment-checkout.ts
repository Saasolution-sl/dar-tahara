import "server-only";
import type { NextRequest } from "next/server";
import { TERMS_VERSION, validateAssessmentBooking } from "@/lib/assessment";
import { isServiceRoleConfigured, serviceInsert, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";
import { rateLimit, clientIpFromHeaders } from "@/lib/mailing-list";
import { featureEnabled } from "@/lib/feature-flags";
import { getDurationTiers } from "@/lib/subscription-duration-config";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Shared assessment-checkout logic. Lives in a lib module (not a route file)
 * because Next.js 15 forbids route files from exporting anything other than HTTP
 * handlers + config, both /api/assessment/checkout and /api/assessment/visit
 * call this.
 */

type IdRow = { id: string; reference?: string };
export type AssessmentCheckoutResult =
  | { ok: true; applicationUrl: string; reference: string }
  | { ok: false; error: string; status: number };

export async function createAssessmentCheckout(
  body: unknown,
  req: NextRequest,
): Promise<AssessmentCheckoutResult> {
  if (!await featureEnabled("initial_assessment_booking_enabled")) {
    return { ok: false, error: "assessment_booking_disabled", status: 403 };
  }
  if (!isServiceRoleConfigured()) {
    return { ok: false, error: "application_not_configured", status: 503 };
  }
  // Rate-limit checkout-session creation per IP (curbs abuse & rapid double-clicks).
  const rl = rateLimit(`assessment-checkout:${clientIpFromHeaders(req.headers)}`);
  if (!rl.allowed) return { ok: false, error: "rate_limited", status: 429 };
  const durationTiers = await getDurationTiers();
  const parsed = validateAssessmentBooking(body, new Date(), durationTiers);
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
      status: "applicant",
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
      requested_duration_months: value.durationMonths,
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
      status: "submitted",
      payment_status: "unpaid",
      submitted_at: new Date().toISOString(),
      next_action: "staff_review",
    });
    let authUserId: string | null = null;
    if (await featureEnabled("customer_registration_enabled")) {
      try {
        const admin = createAdminClient();
        const { data, error } = await admin.auth.admin.inviteUserByEmail(value.email, {
          redirectTo: `${req.nextUrl.origin}/auth/callback?next=/account/assessments`,
          data: { full_name: value.fullName, preferred_language: value.locale },
        });
        if (!error && data.user) authUserId = data.user.id;
      } catch (error) {
        console.warn("[assessment-invite]", error instanceof Error ? error.message : "invite_failed");
      }
    }
    if (authUserId) {
      await serviceUpdate("customers", `id=eq.${customer.id}`, { auth_user_id: authUserId });
      await serviceInsert("user_roles", { user_id: authUserId, role: "applicant" });
    }
    await Promise.all([
      serviceInsert("assessment_events", { assessment_id: assessment.id, event_type: "submitted", to_status: "submitted", actor_type: "customer" }),
      serviceInsert("notification_outbox", { customer_id: customer.id, template_key: "assessment_submitted", locale: value.locale, channel: "email", recipient: value.email, consent_confirmed: true, payload: { reference: assessment.reference } }),
    ]);
    const reference = assessment.reference || assessment.id;
    return { ok: true, applicationUrl: `/${value.locale}/assessment/confirmation?application=submitted&reference=${encodeURIComponent(reference)}`, reference };
  } catch (error) {
    console.error("[assessment-checkout]", error instanceof Error ? error.message : "unknown");
    return { ok: false, error: "application_failed", status: 500 };
  }
}
