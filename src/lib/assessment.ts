import { isLocale, type Locale } from "@/i18n/config";
import { calculatePrice, frequencies, type FrequencyKey } from "./pricing";

export const ANNUAL_DISCOUNT_PERCENT = 5;
export const TERMS_VERSION = "2026-07-13";

export type BillingInterval = "monthly" | "annual";
export type TimeSlot = "morning" | "afternoon" | "flexible";
export type PropertyCondition = "excellent" | "standard" | "needs_attention" | "heavy";

export type AssessmentBookingInput = {
  locale: Locale;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string | null;
  countryCode: string;
  sizeM2: number;
  overMax: boolean;
  bedrooms: number;
  bathrooms: number;
  pets: boolean;
  petDetails: string | null;
  smoking: boolean;
  condition: PropertyCondition;
  accessNotes: string | null;
  frequency: FrequencyKey;
  billingInterval: BillingInterval;
  preferredDate: string;
  alternateDate: string | null;
  timeSlot: TimeSlot;
  propertyAccuracyAccepted: true;
  termsAccepted: true;
};

export type AssessmentQuote = {
  estimatedMonthlyCents: number | null;
  estimatedAnnualCents: number | null;
  assessmentPriceCents: number;
  annualSavingsCents: number | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONDITIONS = new Set<PropertyCondition>(["excellent", "standard", "needs_attention", "heavy"]);
const TIME_SLOTS = new Set<TimeSlot>(["morning", "afternoon", "flexible"]);
const BILLING = new Set<BillingInterval>(["monthly", "annual"]);

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().replace(/\s+/g, " ");
  return clean ? clean.slice(0, max) : null;
}

function numberInRange(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

function validDate(value: unknown, minDate: string): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) && value >= minDate ? value : null;
}

export function calculateAssessmentPriceCents(sizeM2: number, overMax = false): number {
  if (overMax || sizeM2 > 250) return 24_900;
  if (sizeM2 <= 75) return 7_900;
  if (sizeM2 <= 125) return 11_900;
  return 16_900;
}

export function calculateAssessmentQuote(
  sizeM2: number,
  frequency: FrequencyKey,
  overMax = false,
): AssessmentQuote {
  const price = overMax ? null : calculatePrice(sizeM2, frequency);
  const monthly = price?.status === "ok" ? Math.round(price.monthlyTotal * 100) : null;
  const annualBeforeDiscount = monthly === null ? null : monthly * 12;
  const annual = annualBeforeDiscount === null
    ? null
    : Math.round(annualBeforeDiscount * (1 - ANNUAL_DISCOUNT_PERCENT / 100));
  return {
    estimatedMonthlyCents: monthly,
    estimatedAnnualCents: annual,
    assessmentPriceCents: calculateAssessmentPriceCents(sizeM2, overMax),
    annualSavingsCents: annualBeforeDiscount === null || annual === null ? null : annualBeforeDiscount - annual,
  };
}

export type BookingValidation =
  | { ok: true; value: AssessmentBookingInput; quote: AssessmentQuote }
  | { ok: false; error: string };

export function validateAssessmentBooking(body: unknown, today = new Date()): BookingValidation {
  if (!body || typeof body !== "object") return { ok: false, error: "bad_request" };
  const b = body as Record<string, unknown>;
  const locale = typeof b.locale === "string" && isLocale(b.locale) ? b.locale : null;
  const fullName = cleanText(b.fullName, 160);
  const email = cleanText(b.email, 254)?.toLowerCase() ?? null;
  const phone = cleanText(b.phone, 40);
  const addressLine1 = cleanText(b.addressLine1, 220);
  const addressLine2 = cleanText(b.addressLine2, 220);
  const city = cleanText(b.city, 120);
  const postalCode = cleanText(b.postalCode, 24);
  const countryCode = cleanText(b.countryCode, 2)?.toUpperCase() ?? null;
  const overMax = b.overMax === true;
  const sizeM2 = numberInRange(b.sizeM2, 20, overMax ? 5000 : 250);
  const bedrooms = numberInRange(b.bedrooms, 0, 50);
  const bathrooms = numberInRange(b.bathrooms, 0, 50);
  const frequency = typeof b.frequency === "string" && b.frequency in frequencies
    ? (b.frequency as FrequencyKey)
    : null;
  const billingInterval = typeof b.billingInterval === "string" && BILLING.has(b.billingInterval as BillingInterval)
    ? (b.billingInterval as BillingInterval)
    : null;
  const condition = typeof b.condition === "string" && CONDITIONS.has(b.condition as PropertyCondition)
    ? (b.condition as PropertyCondition)
    : null;
  const timeSlot = typeof b.timeSlot === "string" && TIME_SLOTS.has(b.timeSlot as TimeSlot)
    ? (b.timeSlot as TimeSlot)
    : null;
  const minDate = today.toISOString().slice(0, 10);
  const preferredDate = validDate(b.preferredDate, minDate);
  const alternateDate = b.alternateDate ? validDate(b.alternateDate, minDate) : null;

  if (!locale || !fullName || !email || !EMAIL_RE.test(email) || !phone) {
    return { ok: false, error: "invalid_customer" };
  }
  if (!addressLine1 || !city || !countryCode || !sizeM2 || bedrooms === null || bathrooms === null) {
    return { ok: false, error: "invalid_property" };
  }
  if (!frequency || !billingInterval || !condition || !preferredDate || !timeSlot) {
    return { ok: false, error: "invalid_booking" };
  }
  if (b.pets === true && !cleanText(b.petDetails, 500)) {
    return { ok: false, error: "pet_details_required" };
  }
  if (b.propertyAccuracyAccepted !== true || b.termsAccepted !== true) {
    return { ok: false, error: "legal_acceptance_required" };
  }

  const value: AssessmentBookingInput = {
    locale,
    fullName,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    postalCode,
    countryCode,
    sizeM2,
    overMax,
    bedrooms,
    bathrooms,
    pets: b.pets === true,
    petDetails: cleanText(b.petDetails, 500),
    smoking: b.smoking === true,
    condition,
    accessNotes: cleanText(b.accessNotes, 1500),
    frequency,
    billingInterval,
    preferredDate,
    alternateDate,
    timeSlot,
    propertyAccuracyAccepted: true,
    termsAccepted: true,
  };
  return { ok: true, value, quote: calculateAssessmentQuote(sizeM2, frequency, overMax) };
}

export function formatMoneyFromCents(cents: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
