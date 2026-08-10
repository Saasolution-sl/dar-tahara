import { findCity, OTHER_CITY_ID } from "@/lib/geo/moroccan-cities";
import { isValidEmail, normalizeEmail } from "./schema";

export const EARLY_ACCESS_CONSENT_VERSION = "early-access-marketing-v1";
export const EARLY_ACCESS_SOURCE = "early_access";

/**
 * Consents the Early Access form collects, in one place because they are
 * written by the database function and asserted by its test. The displayed
 * wording covers marketing *and* incomplete-onboarding reminders, so both are
 * recorded separately in the audit trail rather than as a single blanket yes.
 */
export const EARLY_ACCESS_CONSENT_TYPES = ["marketing", "onboarding_reminder"] as const;

export type EarlyAccessLeadPayload = {
  firstName: string;
  email: string;
  cityId: string;
  manualCity?: string;
  marketingConsent: boolean;
  locale?: string;
  src?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referralCode?: string;
  firstTouch?: unknown;
  turnstileToken?: string;
  companyWebsite?: string;
  elapsedMs?: number;
  signupSessionId?: string;
  signupSessionToken?: string;
};

export type LeadFieldErrors = Partial<Record<"firstName" | "email" | "cityId" | "manualCity" | "marketingConsent", string>>;

export function validateEarlyAccessLead(payload: EarlyAccessLeadPayload): {
  ok: boolean;
  errors: LeadFieldErrors;
  normalized?: { firstName: string; email: string; cityId: string; city: string };
} {
  const errors: LeadFieldErrors = {};
  const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : "";
  const city = typeof payload.cityId === "string" ? findCity(payload.cityId) : undefined;
  const isOtherCity = payload.cityId === OTHER_CITY_ID;
  const manualCity = typeof payload.manualCity === "string" ? payload.manualCity.trim() : "";

  if (!firstName) errors.firstName = "required";
  else if (firstName.length > 120) errors.firstName = "invalid";
  if (!email) errors.email = "required";
  else if (!isValidEmail(email)) errors.email = "invalid_email";
  if (!city && !isOtherCity) errors.cityId = "required";
  if (isOtherCity && !manualCity) errors.manualCity = "required";
  else if (isOtherCity && manualCity.length > 120) errors.manualCity = "invalid";
  if (payload.marketingConsent !== true) errors.marketingConsent = "consent_required";

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    errors,
    ...(ok && (city || isOtherCity) ? {
      normalized: {
        firstName,
        email,
        cityId: city?.id ?? OTHER_CITY_ID,
        city: city?.canonicalName ?? manualCity,
      },
    } : {}),
  };
}
