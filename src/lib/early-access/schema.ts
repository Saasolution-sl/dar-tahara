/**
 * Early-access form — shape, option vocabularies and validation.
 *
 * Pure and framework-agnostic: the same module validates on the client (for UX)
 * and on the server (for trust). The server NEVER relies on the client having
 * validated. Option values here are the canonical stored forms and MUST match
 * the Mautic select/multiselect field options (deploy/mautic/provision.sh §1).
 */

// ── Option vocabularies ────────────────────────────────────────────────────────
export const CONTACT_METHODS = ["email", "whatsapp", "telephone"] as const;
export const RECIPIENT_TYPES = ["private", "business"] as const;
export const MOROCCAN_CITIES = [
  "Tetouan", "Tangier", "Rabat", "Meknes", "Fes", "Marrakech",
  "Al Hoceima", "Nador", "Casablanca", "Agadir",
] as const;
export const OTHER_CITY_VALUE = "__other__";
export const PROPERTY_TYPES = [
  "apartment", "house", "villa", "holiday_home", "short_term_rental", "riad", "office", "other",
] as const;
export const OUTDOOR_AREAS = ["none", "balcony", "terrace", "garden", "courtyard", "multiple"] as const;
export const OCCUPANCY_TYPES = [
  "primary_residence", "secondary_residence", "holiday_home",
  "short_term_rental", "long_term_rental", "empty",
] as const;
export const PROPERTY_CONDITIONS = [
  "maintained", "standard", "empty_a_while", "deep_clean", "renovation_dust", "unsure",
] as const;
export const FURNISHING_STATUSES = ["fully_furnished", "partially_furnished", "unfurnished"] as const;
export const TRISTATE = ["yes", "no", "unknown"] as const;
export const SERVICE_TYPES = [
  "standard_cleaning", "deep_cleaning", "recurring_cleaning", "holiday_home_prep",
  "arrival_prep", "departure_cleaning", "airbnb_turnover", "move_in", "move_out",
  "property_inspection", "laundry", "linen_change", "window_cleaning", "fridge_cleaning",
  "oven_cleaning", "balcony_terrace", "property_care", "other",
] as const;
export const FREQUENCIES = [
  "one_time", "weekly", "biweekly", "monthly", "before_arrival", "after_departure", "on_demand", "not_sure",
] as const;
export const START_PERIODS = [
  "asap", "within_1_month", "within_3_months", "within_6_months", "later", "no_fixed_date",
] as const;
export const ACCESS_METHODS = [
  "digital_lock", "physical_key", "person_present", "concierge", "lockbox", "property_manager", "other",
] as const;

export const STEPS = [
  "contact", "billing", "property_address", "property_info",
  "services", "access", "review",
] as const;
export type StepId = (typeof STEPS)[number];

// ── Payload shape (what the client submits) ────────────────────────────────────
export type EarlyAccessPayload = {
  // Step 1 — contact
  firstName: string;
  lastName: string;
  email: string;
  countryCallingCode?: string;   // e.g. "+212"
  mobileNumber?: string;
  whatsappSameAsMobile?: boolean;
  whatsappNumber?: string;
  preferredContactMethod?: string;
  preferredLanguage?: string;
  residenceCity?: string;        // Moroccan city name, including a custom "Other" value

  // Step 2 — billing
  billingRecipientType?: string;
  billingFirstName?: string;
  billingLastName?: string;
  companyName?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingBuildingNumber?: string;
  billingUnit?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingRegion?: string;
  billingCountry?: string;       // ISO-3166 alpha-2
  taxId?: string;
  invoiceEmail?: string;
  invoiceEmailSameAsContact?: boolean;

  // Step 3 — property address (Morocco)
  useBillingAsProperty?: boolean;
  propertyName?: string;
  propertyAddressLine1?: string;
  propertyAddressLine2?: string;
  residenceName?: string;
  propertyBuildingNumber?: string;
  propertyUnitNumber?: string;
  propertyFloor?: string;
  propertyPostalCode?: string;
  propertyCity?: string;
  propertyRegion?: string;
  neighbourhood?: string;
  propertyCountry?: string;      // defaults MA
  landmark?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  entryNotes?: string;
  authorizedBySubmitter?: boolean;

  // Step 4 — property info
  propertyType?: string;
  sizeM2?: number;
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  livingRooms?: number;
  numberOfFloors?: number;
  propertyFloorInfo?: string;
  elevatorStatus?: string;
  outdoorArea?: string;
  occupancyType?: string;
  propertyCondition?: string;
  furnishingStatus?: string;
  petsPresent?: boolean;
  smokingStatus?: string;

  // Step 5 — services
  serviceTypes?: string[];
  desiredFrequency?: string;
  expectedStartPeriod?: string;
  preferredStartDate?: string;   // ISO date
  serviceNotes?: string;

  // Step 6 — access
  accessMethod?: string;
  physicalKeyTermsAcknowledged?: boolean;
  thirdPartyDetails?: string;
  accessNotes?: string;

  // Step 7 — review & consent
  confirmAccurate?: boolean;
  confirmAuthorized?: boolean;
  acceptPrivacy?: boolean;
  acceptOperationalComms?: boolean;
  marketingConsent?: boolean;    // OPTIONAL — separate from operational

  // Hidden attribution + anti-spam (not user-entered)
  src?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referralCode?: string;
  locale?: string;
  turnstileToken?: string;
  // Honeypot: must stay empty; a bot that fills every field trips it.
  companyWebsite?: string;
  // Milliseconds the form was on screen before submit (bot heuristic).
  elapsedMs?: number;
};

export type FieldErrors = Partial<Record<string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
export function isValidEmail(raw: string): boolean {
  const e = normalizeEmail(raw);
  return e.length <= 254 && EMAIL_RE.test(e);
}

function oneOf<T extends readonly string[]>(set: T, v: unknown): v is T[number] {
  return typeof v === "string" && (set as readonly string[]).includes(v);
}
function nonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Validate a single step. Returns field-keyed error codes (i18n keys, not
 * sentences) so the UI can localise them. Empty object = the step is valid.
 */
export function validateStep(step: StepId, p: EarlyAccessPayload): FieldErrors {
  const e: FieldErrors = {};
  switch (step) {
    case "contact":
      if (!nonEmpty(p.firstName)) e.firstName = "required";
      if (!nonEmpty(p.lastName)) e.lastName = "required";
      if (!nonEmpty(p.email)) e.email = "required";
      else if (!isValidEmail(p.email)) e.email = "invalid_email";
      if (p.preferredContactMethod && !oneOf(CONTACT_METHODS, p.preferredContactMethod))
        e.preferredContactMethod = "invalid";
      if (
        p.residenceCity !== undefined
        && p.residenceCity !== ""
        && (!nonEmpty(p.residenceCity)
          || p.residenceCity.trim().length > 120
          || p.residenceCity === OTHER_CITY_VALUE)
      ) e.residenceCity = "invalid";
      // A WhatsApp/phone number is required unless the sole method is email.
      if (p.preferredContactMethod !== "email" && !nonEmpty(p.mobileNumber) && !nonEmpty(p.whatsappNumber))
        e.mobileNumber = "phone_required";
      break;

    case "billing":
      if (p.billingRecipientType && !oneOf(RECIPIENT_TYPES, p.billingRecipientType))
        e.billingRecipientType = "invalid";
      if (p.billingRecipientType === "business" && !nonEmpty(p.companyName))
        e.companyName = "required";
      if (!nonEmpty(p.billingAddressLine1)) e.billingAddressLine1 = "required";
      if (!nonEmpty(p.billingCity)) e.billingCity = "required";
      if (!nonEmpty(p.billingCountry)) e.billingCountry = "required";
      if (p.invoiceEmail && !isValidEmail(p.invoiceEmail)) e.invoiceEmail = "invalid_email";
      break;

    case "property_address":
      // When copying billing, the property fields are filled from billing at
      // submit time, so only require them when NOT copying.
      if (!p.useBillingAsProperty) {
        if (!nonEmpty(p.propertyAddressLine1)) e.propertyAddressLine1 = "required";
        if (!nonEmpty(p.propertyCity)) e.propertyCity = "required";
      }
      if (p.googleMapsUrl && !/^https?:\/\//i.test(p.googleMapsUrl)) e.googleMapsUrl = "invalid_url";
      if (!p.authorizedBySubmitter) e.authorizedBySubmitter = "authorization_required";
      break;

    case "property_info":
      if (p.propertyType && !oneOf(PROPERTY_TYPES, p.propertyType)) e.propertyType = "invalid";
      if (p.occupancyType && !oneOf(OCCUPANCY_TYPES, p.occupancyType)) e.occupancyType = "invalid";
      if (p.sizeM2 !== undefined && (Number.isNaN(p.sizeM2) || p.sizeM2 < 0)) e.sizeM2 = "invalid";
      break;

    case "services":
      if (!p.serviceTypes || p.serviceTypes.length === 0) e.serviceTypes = "select_one";
      else if (!p.serviceTypes.every((s) => oneOf(SERVICE_TYPES, s))) e.serviceTypes = "invalid";
      if (p.desiredFrequency && !oneOf(FREQUENCIES, p.desiredFrequency)) e.desiredFrequency = "invalid";
      if (p.expectedStartPeriod && !oneOf(START_PERIODS, p.expectedStartPeriod))
        e.expectedStartPeriod = "invalid";
      break;

    case "access":
      if (!nonEmpty(p.accessMethod)) e.accessMethod = "required";
      else if (!oneOf(ACCESS_METHODS, p.accessMethod)) e.accessMethod = "invalid";
      // Physical-key handling requires an explicit acknowledgement of the terms.
      if (p.accessMethod === "physical_key" && !p.physicalKeyTermsAcknowledged)
        e.physicalKeyTermsAcknowledged = "acknowledgement_required";
      break;

    case "review":
      if (!p.confirmAccurate) e.confirmAccurate = "required";
      if (!p.confirmAuthorized) e.confirmAuthorized = "required";
      if (!p.acceptPrivacy) e.acceptPrivacy = "required";
      if (!p.acceptOperationalComms) e.acceptOperationalComms = "required";
      // marketingConsent is intentionally NOT required.
      break;
  }
  return e;
}

/** Validate every step; used server-side. Returns the merged errors + validity. */
export function validateAll(p: EarlyAccessPayload): { ok: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {};
  for (const step of STEPS) Object.assign(errors, validateStep(step, p));
  return { ok: Object.keys(errors).length === 0, errors };
}
