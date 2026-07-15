/**
 * Pure mapping from a Supabase lead to Mautic contact fields, tags and segment
 * selection. No I/O, no secrets, no env — everything here is deterministic and
 * unit-tested. The field aliases MUST match the custom fields provisioned in
 * Mautic (deploy/mautic/provision.sh §1); a typo here silently drops a value.
 */
import type { LeadForSync, MauticContactFields } from "./types";

/** Drop null/undefined/empty so we never overwrite a Mautic value with blank. */
function put(
  target: MauticContactFields,
  alias: string,
  value: string | number | boolean | null | undefined,
): void {
  if (value === null || value === undefined) return;
  if (typeof value === "string" && value.trim() === "") return;
  target[alias] = value;
}

/**
 * Map a lead to the Mautic contact field payload.
 *
 * First-touch attribution (first_utm_*, first_source_code) is included ONLY when
 * present on the lead; the caller is responsible for never re-sending changed
 * first-touch values. Last-touch is always sent so it reflects the latest visit.
 */
export function mapLeadToMauticFields(lead: LeadForSync): MauticContactFields {
  const f: MauticContactFields = {};

  // Core identity — Mautic's built-in aliases.
  put(f, "firstname", lead.firstName);
  put(f, "lastname", lead.lastName);
  put(f, "email", lead.normalizedEmail || lead.email);
  put(f, "mobile", lead.mobilePhone ?? undefined);

  // Custom identity/contact.
  put(f, "whatsapp_phone", lead.whatsappPhone ?? undefined);
  put(f, "preferred_language", lead.preferredLanguage ?? undefined);
  put(f, "preferred_contact_method", lead.preferredContactMethod ?? undefined);
  put(f, "country_of_residence", lead.residenceCountry ?? undefined);

  // Billing / property summaries.
  put(f, "billing_recipient_type", lead.billingRecipientType ?? undefined);
  put(f, "billing_country", lead.billingCountry ?? undefined);
  put(f, "billing_city", lead.billingCity ?? undefined);
  put(f, "cleaning_city", lead.cleaningCity ?? undefined);
  put(f, "cleaning_region", lead.cleaningRegion ?? undefined);
  put(f, "cleaning_country", lead.cleaningCountry ?? undefined);
  put(f, "property_type", lead.propertyType ?? undefined);
  put(f, "property_size_range", lead.propertySizeRange ?? undefined);
  put(f, "occupancy_type", lead.occupancyType ?? undefined);
  put(f, "property_condition", lead.propertyCondition ?? undefined);

  // Service interest. Mautic multiselect expects a "|"-joined value.
  if (lead.desiredServices && lead.desiredServices.length > 0) {
    f["desired_services"] = lead.desiredServices.join("|");
  }
  put(f, "desired_frequency", lead.desiredFrequency ?? undefined);
  put(f, "expected_start_period", lead.expectedStartPeriod ?? undefined);
  put(f, "access_method", lead.accessMethod ?? undefined);
  if (typeof lead.hasDigitalLock === "boolean") {
    f["has_digital_lock"] = lead.hasDigitalLock;
  }

  // Lifecycle.
  put(f, "early_access_status", lead.status ?? undefined);
  if (typeof lead.emailVerified === "boolean") {
    f["email_verified"] = lead.emailVerified;
  }

  // Referral.
  put(f, "referral_code", lead.referralCode ?? undefined);
  put(f, "referred_by_code", lead.referredByCode ?? undefined);
  if (typeof lead.verifiedReferralCount === "number") {
    f["verified_referral_count"] = lead.verifiedReferralCount;
  }

  // Attribution — first-touch (only when set) and last-touch (always current).
  put(f, "first_source_code", lead.firstSourceCode ?? undefined);
  put(f, "last_source_code", lead.lastSourceCode ?? undefined);
  put(f, "first_utm_source", lead.firstUtmSource ?? undefined);
  put(f, "first_utm_medium", lead.firstUtmMedium ?? undefined);
  put(f, "first_utm_campaign", lead.firstUtmCampaign ?? undefined);
  put(f, "first_utm_content", lead.firstUtmContent ?? undefined);
  put(f, "first_utm_term", lead.firstUtmTerm ?? undefined);
  put(f, "last_utm_source", lead.lastUtmSource ?? undefined);
  put(f, "last_utm_medium", lead.lastUtmMedium ?? undefined);
  put(f, "last_utm_campaign", lead.lastUtmCampaign ?? undefined);
  put(f, "last_utm_content", lead.lastUtmContent ?? undefined);

  // Link back to the system of record.
  put(f, "supabase_lead_id", lead.id);

  return f;
}

const PROPERTY_TAG: Record<string, string> = {
  apartment: "property-apartment",
  house: "property-house",
  villa: "property-villa",
  short_term_rental: "property-airbnb",
  holiday_home: "property-holiday-home",
  riad: "property-riad",
};

const FREQUENCY_TAG: Record<string, string> = {
  weekly: "frequency-weekly",
  biweekly: "frequency-biweekly",
  monthly: "frequency-monthly",
  one_time: "frequency-one-time",
  on_demand: "frequency-on-demand",
};

const ACCESS_TAG: Record<string, string> = {
  digital_lock: "access-digital-lock",
  physical_key: "access-physical-key",
  lockbox: "access-lockbox",
};

/** Map a src channel (utm_source or a source code prefix) to a source-* tag. */
const SOURCE_TAG: Record<string, string> = {
  whatsapp: "source-whatsapp",
  facebook: "source-facebook",
  instagram: "source-instagram",
  tiktok: "source-tiktok",
  telegram: "source-telegram",
  email: "source-email",
  qr: "source-qr",
  partner: "source-partner",
  influencer: "source-influencer",
};

/**
 * The standardized tags for a lead. Always includes the campaign tags, plus the
 * verification state and any facet tags derivable from the lead. Returns a
 * de-duplicated list following the documented naming convention (§20).
 */
export function tagsForLead(lead: LeadForSync): string[] {
  const tags = new Set<string>(["dar-tahara", "early-access", "early-access-2026"]);

  tags.add(lead.emailVerified ? "verified-lead" : "unverified-lead");
  if (lead.status === "qualified") tags.add("qualified-lead");
  if (lead.status === "waitlisted") tags.add("waitlisted-lead");

  const src = (lead.firstUtmSource || lead.lastUtmSource || "").toLowerCase();
  if (SOURCE_TAG[src]) tags.add(SOURCE_TAG[src]);

  if (lead.propertyType && PROPERTY_TAG[lead.propertyType]) tags.add(PROPERTY_TAG[lead.propertyType]);
  if (lead.desiredFrequency && FREQUENCY_TAG[lead.desiredFrequency]) tags.add(FREQUENCY_TAG[lead.desiredFrequency]);
  if (lead.accessMethod && ACCESS_TAG[lead.accessMethod]) tags.add(ACCESS_TAG[lead.accessMethod]);

  return [...tags];
}
