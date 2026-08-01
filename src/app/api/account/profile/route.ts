import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { authorizeApi } from "@/lib/portal-auth";
import {
  cleanCountryCode,
  cleanProfileText,
} from "@/lib/profile-security";
import { isSameOrigin } from "@/lib/request-security";
import {
  serviceInsert,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";

export async function PATCH(req: NextRequest) {
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

  const body = (await req.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const firstName = cleanProfileText(body.firstName, 100);
  const lastName = cleanProfileText(body.lastName, 100);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const phone = cleanProfileText(body.phone, 40);
  const preferredLanguage = cleanProfileText(body.preferredLanguage, 8);
  const rawCountryOfResidence = cleanProfileText(
    body.countryOfResidence,
    20,
  );
  const rawBillingCountry = cleanProfileText(body.billingCountryCode, 20);
  const countryOfResidence = cleanCountryCode(body.countryOfResidence);
  const billingCountryCode = cleanCountryCode(body.billingCountryCode);

  if (
    !fullName ||
    !phone ||
    !isLocale(preferredLanguage) ||
    (rawCountryOfResidence && !countryOfResidence) ||
    (rawBillingCountry && !billingCountryCode)
  ) {
    return NextResponse.json(
      { error: "invalid_profile" },
      { status: 400 },
    );
  }

  const billingAddress = {
    line1: cleanProfileText(body.billingAddressLine1, 160),
    line2: cleanProfileText(body.billingAddressLine2, 160),
    city: cleanProfileText(body.billingCity, 120),
    postal_code: cleanProfileText(body.billingPostalCode, 20),
    country: billingCountryCode,
  };
  const update = {
    first_name: firstName || null,
    last_name: lastName || null,
    full_name: fullName,
    phone,
    whatsapp_number: cleanProfileText(body.whatsapp, 40) || null,
    preferred_language: preferredLanguage,
    country_of_residence: countryOfResidence || null,
    billing_address: billingAddress,
    marketing_consent: body.marketingConsent === true,
  };
  const previous = await serviceSelect<Record<string, unknown>[]>(
    `customers?id=eq.${auth.context.customerId}&select=first_name,last_name,full_name,phone,whatsapp_number,preferred_language,country_of_residence,billing_address,marketing_consent&limit=1`,
  );
  await serviceUpdate(
    "customers",
    `id=eq.${auth.context.customerId}`,
    update,
  );
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: "customer_profile_updated",
    resource_type: "customer",
    resource_id: auth.context.customerId,
    previous_value: previous[0] || null,
    new_value: update,
    user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
  });
  return NextResponse.json({ ok: true });
}
