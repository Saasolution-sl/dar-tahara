import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { cleanCountryCode, cleanProfileText } from "@/lib/profile-security";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpsert } from "@/lib/supabase-rpc";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["customer_company"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const registrationCountry = cleanCountryCode(body.registrationCountry);
  const legalName = cleanProfileText(body.legalName, 200);
  const chamber = cleanProfileText(body.chamberOfCommerceNumber, 100);
  const taxId = cleanProfileText(body.taxIdentificationNumber, 100);
  const billingEmail = cleanProfileText(body.billingEmail, 254).toLowerCase();
  const billingPhone = cleanProfileText(body.billingPhone, 40);
  const representativeName = cleanProfileText(body.representativeName, 160);
  const representativeTitle = cleanProfileText(body.representativeTitle, 160);
  const addressLine1 = cleanProfileText(body.registeredAddressLine1, 200);
  const city = cleanProfileText(body.registeredCity, 120);
  const postalCode = cleanProfileText(body.registeredPostalCode, 30);
  const employeeCountRaw = cleanProfileText(body.employeeCount, 12);
  const employeeCount = employeeCountRaw ? Number(employeeCountRaw) : null;

  if (!registrationCountry || !legalName || !chamber || !taxId || !EMAIL_RE.test(billingEmail) || !billingPhone || !representativeName || !representativeTitle || !addressLine1 || !city || !postalCode || (employeeCount !== null && (!Number.isInteger(employeeCount) || employeeCount < 1))) {
    return NextResponse.json({ error: "invalid_company_profile" }, { status: 400 });
  }

  const previous = await serviceSelect<Record<string, unknown>[]>(
    `company_profiles?customer_id=eq.${auth.context.customerId}&select=*&limit=1`,
  );
  const update = {
    customer_id: auth.context.customerId,
    legal_name: legalName,
    trade_name: cleanProfileText(body.tradeName, 200) || null,
    chamber_of_commerce_number: chamber,
    tax_identification_number: taxId,
    registration_country: registrationCountry,
    registered_address: {
      line1: addressLine1,
      line2: cleanProfileText(body.registeredAddressLine2, 200) || null,
      city,
      postal_code: postalCode,
      country: registrationCountry,
    },
    billing_email: billingEmail,
    billing_phone: billingPhone,
    authorized_representative_name: representativeName,
    authorized_representative_title: representativeTitle,
    website: cleanProfileText(body.website, 300) || null,
    employee_count: employeeCount,
  };
  await serviceUpsert("company_profiles", update, "customer_id");
  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: "company_profile_updated",
    resource_type: "company_profile",
    resource_id: auth.context.customerId,
    previous_value: previous[0] || null,
    new_value: update,
  });
  return NextResponse.json({ ok: true });
}
