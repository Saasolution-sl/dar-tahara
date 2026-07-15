/**
 * Map a validated early-access payload into the row shapes each Supabase table
 * expects, and into the LeadForSync the Mautic layer consumes. Pure — no I/O.
 *
 * Address handling: billing and property are ALWAYS stored separately, even when
 * the visitor ticks "use billing as property" (brief §12). When that box is set
 * and the billing country is Morocco, the property fields are copied from billing
 * here so both rows are fully populated.
 */
import type { EarlyAccessPayload } from "./schema";
import { normalizeEmail } from "./schema";
import { toE164 } from "./phone";
import { toLeadAttributionColumns, type Attribution } from "./attribution";
import type { LeadForSync } from "@/lib/mautic/types";

function clean(v: unknown, max = 500): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}
function upper2(v: unknown): string | undefined {
  const c = clean(v, 2);
  return c ? c.toUpperCase() : undefined;
}

/** Coarse size band for the Mautic summary field (exact m² stays in Supabase). */
export function propertySizeRange(sizeM2?: number): string | undefined {
  if (sizeM2 === undefined || Number.isNaN(sizeM2)) return undefined;
  if (sizeM2 < 60) return "under_60";
  if (sizeM2 < 100) return "60_100";
  if (sizeM2 < 150) return "100_150";
  if (sizeM2 < 250) return "150_250";
  return "over_250";
}

export function buildLeadRow(
  p: EarlyAccessPayload,
  attribution: { first?: Attribution; last?: Attribution },
): Record<string, unknown> {
  const email = normalizeEmail(p.email);
  const mobile = toE164(p.mobileNumber, p.countryCallingCode);
  const whatsapp = p.whatsappSameAsMobile
    ? mobile
    : toE164(p.whatsappNumber ?? p.mobileNumber, p.countryCallingCode);

  return {
    first_name: clean(p.firstName, 120),
    last_name: clean(p.lastName, 120),
    email,
    normalized_email: email,
    mobile_phone: mobile,
    whatsapp_phone: whatsapp,
    preferred_contact_method: p.preferredContactMethod ?? "whatsapp",
    preferred_language: p.preferredLanguage ?? p.locale ?? "en",
    residence_city: clean(p.residenceCity, 120),
    status: "pending",
    referred_by_code: clean(p.referralCode, 16),
    submitted_at: new Date().toISOString(),
    mautic_sync_status: "pending",
    ...toLeadAttributionColumns(attribution.first, attribution.last),
  };
}

export function buildBillingRow(leadId: string, p: EarlyAccessPayload): Record<string, unknown> {
  const invoiceEmail = p.invoiceEmailSameAsContact ? normalizeEmail(p.email) : clean(p.invoiceEmail, 254);
  return {
    lead_id: leadId,
    recipient_type: p.billingRecipientType ?? "private",
    billing_first_name: clean(p.billingFirstName, 120) ?? clean(p.firstName, 120),
    billing_last_name: clean(p.billingLastName, 120) ?? clean(p.lastName, 120),
    company_name: clean(p.companyName, 200),
    address_line_1: clean(p.billingAddressLine1),
    address_line_2: clean(p.billingAddressLine2),
    building_number: clean(p.billingBuildingNumber, 60),
    unit: clean(p.billingUnit, 60),
    postal_code: clean(p.billingPostalCode, 20),
    city: clean(p.billingCity, 120),
    region: clean(p.billingRegion, 120),
    country_code: upper2(p.billingCountry),
    tax_id: clean(p.taxId, 60),
    invoice_email: invoiceEmail,
  };
}

export function buildPropertyRow(leadId: string, p: EarlyAccessPayload): Record<string, unknown> {
  // Copy billing → property only when asked AND billing is in Morocco.
  const copy = Boolean(p.useBillingAsProperty && upper2(p.billingCountry) === "MA");
  return {
    lead_id: leadId,
    property_name: clean(p.propertyName, 120),
    address_line_1: copy ? clean(p.billingAddressLine1) : clean(p.propertyAddressLine1),
    address_line_2: copy ? clean(p.billingAddressLine2) : clean(p.propertyAddressLine2),
    residence_name: clean(p.residenceName, 120),
    building_number: copy ? clean(p.billingBuildingNumber, 60) : clean(p.propertyBuildingNumber, 60),
    unit_number: copy ? clean(p.billingUnit, 60) : clean(p.propertyUnitNumber, 60),
    floor: clean(p.propertyFloor, 40),
    postal_code: copy ? clean(p.billingPostalCode, 20) : clean(p.propertyPostalCode, 20),
    city: copy ? clean(p.billingCity, 120) : clean(p.propertyCity, 120),
    region: copy ? clean(p.billingRegion, 120) : clean(p.propertyRegion, 120),
    neighbourhood: clean(p.neighbourhood, 120),
    country_code: upper2(p.propertyCountry) ?? "MA",
    landmark: clean(p.landmark, 200),
    google_maps_url: clean(p.googleMapsUrl, 500),
    latitude: typeof p.latitude === "number" ? p.latitude : undefined,
    longitude: typeof p.longitude === "number" ? p.longitude : undefined,
    entry_notes: clean(p.entryNotes, 1000),
    property_type: p.propertyType,
    size_m2: typeof p.sizeM2 === "number" ? p.sizeM2 : undefined,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    kitchens: p.kitchens,
    living_rooms: p.livingRooms,
    number_of_floors: p.numberOfFloors,
    property_floor: clean(p.propertyFloorInfo, 40),
    elevator_status: p.elevatorStatus,
    outdoor_area: p.outdoorArea,
    occupancy_type: p.occupancyType,
    property_condition: p.propertyCondition,
    furnishing_status: p.furnishingStatus,
    pets_present: typeof p.petsPresent === "boolean" ? p.petsPresent : undefined,
    smoking_status: p.smokingStatus,
    authorized_by_submitter: Boolean(p.authorizedBySubmitter),
  };
}

export function buildServiceRow(
  leadId: string,
  propertyId: string | undefined,
  p: EarlyAccessPayload,
): Record<string, unknown> {
  return {
    lead_id: leadId,
    property_id: propertyId,
    service_types: p.serviceTypes ?? [],
    desired_frequency: p.desiredFrequency,
    expected_start_period: p.expectedStartPeriod,
    preferred_start_date: clean(p.preferredStartDate, 10),
    additional_notes: clean(p.serviceNotes, 1000),
  };
}

export function buildAccessRow(
  propertyId: string,
  p: EarlyAccessPayload,
): Record<string, unknown> {
  return {
    property_id: propertyId,
    access_method: p.accessMethod,
    has_digital_lock: p.accessMethod === "digital_lock" ? true : undefined,
    physical_key_terms_acknowledged: Boolean(p.physicalKeyTermsAcknowledged),
    third_party_details: clean(p.thirdPartyDetails, 500),
    access_notes: clean(p.accessNotes, 1000),
  };
}

/**
 * The consent rows to append. Operational-comms and marketing are SEPARATE rows;
 * marketing is only recorded when the visitor opted in (brief §16).
 */
export function buildConsentRows(
  leadId: string,
  p: EarlyAccessPayload,
  ctx: { policyVersion?: string; locale?: string; requestMetadata?: unknown },
): Array<Record<string, unknown>> {
  const common = {
    lead_id: leadId,
    policy_version: ctx.policyVersion ?? "1.0",
    locale: ctx.locale ?? p.locale ?? "en",
    source: "early_access_form",
    request_metadata: ctx.requestMetadata ?? null,
  };
  const rows: Array<Record<string, unknown>> = [
    { ...common, consent_type: "privacy_policy", granted: Boolean(p.acceptPrivacy) },
    { ...common, consent_type: "operational_comms", granted: Boolean(p.acceptOperationalComms) },
    { ...common, consent_type: "accuracy", granted: Boolean(p.confirmAccurate) },
    { ...common, consent_type: "authorization", granted: Boolean(p.confirmAuthorized) },
  ];
  if (p.marketingConsent) rows.push({ ...common, consent_type: "marketing", granted: true });
  return rows;
}

/** Assemble the LeadForSync the Mautic layer maps to contact fields. */
export function toLeadForSync(
  leadId: string,
  p: EarlyAccessPayload,
  row: Record<string, unknown>,
  extra: { emailVerified?: boolean; referralCode?: string | null; verifiedReferralCount?: number },
): LeadForSync {
  return {
    id: leadId,
    normalizedEmail: String(row.normalized_email ?? normalizeEmail(p.email)),
    email: String(row.email ?? p.email),
    firstName: String(row.first_name ?? p.firstName),
    lastName: String(row.last_name ?? p.lastName),
    mobilePhone: (row.mobile_phone as string) ?? null,
    whatsappPhone: (row.whatsapp_phone as string) ?? null,
    preferredContactMethod: (row.preferred_contact_method as string) ?? null,
    preferredLanguage: (row.preferred_language as string) ?? null,
    residenceCity: (row.residence_city as string) ?? null,
    status: extra.emailVerified ? "verified" : "pending",
    emailVerified: extra.emailVerified ?? false,
    referralCode: extra.referralCode ?? null,
    referredByCode: (row.referred_by_code as string) ?? null,
    verifiedReferralCount: extra.verifiedReferralCount ?? 0,
    billingRecipientType: p.billingRecipientType ?? null,
    billingCountry: upper2(p.billingCountry) ?? null,
    billingCity: clean(p.billingCity, 120) ?? null,
    cleaningCity: clean(p.useBillingAsProperty ? p.billingCity : p.propertyCity, 120) ?? null,
    cleaningRegion: clean(p.useBillingAsProperty ? p.billingRegion : p.propertyRegion, 120) ?? null,
    cleaningCountry: (upper2(p.propertyCountry) ?? "MA"),
    propertyType: p.propertyType ?? null,
    propertySizeRange: propertySizeRange(p.sizeM2) ?? null,
    occupancyType: p.occupancyType ?? null,
    propertyCondition: p.propertyCondition ?? null,
    desiredServices: p.serviceTypes ?? null,
    desiredFrequency: p.desiredFrequency ?? null,
    expectedStartPeriod: p.expectedStartPeriod ?? null,
    accessMethod: p.accessMethod ?? null,
    hasDigitalLock: p.accessMethod === "digital_lock" ? true : null,
    firstSourceCode: (row.first_source_code as string) ?? null,
    lastSourceCode: (row.last_source_code as string) ?? null,
    firstUtmSource: (row.first_utm_source as string) ?? null,
    firstUtmMedium: (row.first_utm_medium as string) ?? null,
    firstUtmCampaign: (row.first_utm_campaign as string) ?? null,
    firstUtmContent: (row.first_utm_content as string) ?? null,
    firstUtmTerm: (row.first_utm_term as string) ?? null,
    lastUtmSource: (row.last_utm_source as string) ?? null,
    lastUtmMedium: (row.last_utm_medium as string) ?? null,
    lastUtmCampaign: (row.last_utm_campaign as string) ?? null,
    lastUtmContent: (row.last_utm_content as string) ?? null,
  };
}
