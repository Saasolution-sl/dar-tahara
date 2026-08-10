import { STEPS, isValidEmail, normalizeEmail, type EarlyAccessPayload, type StepId } from "./schema";

export const FUNNEL_EVENTS = [
  "early_access_viewed",
  "early_access_started",
  "early_access_submitted",
  "early_access_success",
  "early_access_error",
  "early_access_step_viewed",
  "early_access_step_completed",
  "early_access_field_focused",
  "early_access_field_completed",
  "early_access_validation_error",
  "early_access_api_error",
  "early_access_abandoned",
  "early_access_resumed",
  "early_access_completed",
  "early_access_feedback_submitted",
  "onboarding_offered",
  "onboarding_started",
  "onboarding_step_viewed",
  "onboarding_step_completed",
  "onboarding_abandoned",
  "onboarding_completed",
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];
export type SignupSessionStatus =
  | "in_progress"
  | "early_access_registered"
  | "onboarding_started"
  | "onboarding_completed"
  | "completed"
  | "abandoned_eligible"
  | "reminder_sent"
  | "resumed"
  | "opted_out";

export const FEEDBACK_REASONS = [
  "just_looking",
  "too_long",
  "price_unclear",
  "not_ready",
  "address_difficult",
  "technical_problem",
  "unclear",
  "privacy_concern",
  "service_unavailable",
  "changed_mind",
  "other",
] as const;
export type FeedbackReason = (typeof FEEDBACK_REASONS)[number];

export const SESSION_STORAGE_KEY = "dt_ea_signup_session_v1";

/**
 * The only form keys allowed into backend autosave. This is deliberately
 * explicit: a future client cannot smuggle Turnstile tokens, honeypot content,
 * session credentials or arbitrary objects into partial_payload.
 */
export const AUTOSAVE_FIELDS = [
  "firstName", "lastName", "email", "phoneCountry", "countryCallingCode",
  "mobileNumber", "whatsappSameAsMobile", "whatsappNumber",
  "preferredContactMethod", "preferredLanguage", "residenceCity",
  "billingRecipientType", "billingFirstName", "billingLastName", "companyName",
  "billingAddressLine1", "billingAddressLine2", "billingBuildingNumber", "billingUnit",
  "billingPostalCode", "billingCity", "billingRegion", "billingCountry", "taxId",
  "invoiceEmail", "invoiceEmailSameAsContact", "billingPlaceId",
  "billingFormattedAddress", "billingManualAddress",
  "propertyName", "propertyAddressLine1", "propertyAddressLine2", "residenceName",
  "propertyBuildingNumber", "propertyUnitNumber", "propertyFloor", "propertyPostalCode",
  "propertyCity", "propertyCityId", "propertyCityManualName", "propertyRegion",
  "neighbourhood", "propertyCountry", "landmark", "googleMapsUrl", "latitude",
  "longitude", "propertySelectedLatitude", "propertySelectedLongitude",
  "propertyPinAdjusted", "propertyLocationSource", "propertyPlaceId",
  "propertyFormattedAddress", "propertyManualAddress", "entryNotes",
  "authorizedBySubmitter", "propertyType", "sizeM2", "bedrooms", "bathrooms",
  "kitchens", "livingRooms", "numberOfFloors", "elevatorStatus", "outdoorArea",
  "occupancyType", "propertyCondition", "furnishingStatus", "petsPresent",
  "smokingStatus", "serviceTypes", "desiredFrequency", "expectedStartPeriod",
  "preferredStartDate", "serviceNotes", "accessMethod",
  "physicalKeyTermsAcknowledged", "digitalLockInternetAcknowledged",
  "thirdPartyDetails", "accessNotes", "smartLockInterest", "existingLockBrand",
  "existingLockModel", "confirmAccurate", "confirmAuthorized", "acceptPrivacy",
  "acceptOperationalComms", "marketingConsent", "abandonedReminderConsent",
  "src", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm",
  "referralCode", "locale",
] as const satisfies readonly (keyof EarlyAccessPayload)[];

const AUTOSAVE_FIELD_SET = new Set<string>(AUTOSAVE_FIELDS);
const EVENT_SET = new Set<string>(FUNNEL_EVENTS);
const STEP_SET = new Set<string>(STEPS);
const FEEDBACK_SET = new Set<string>(FEEDBACK_REASONS);

export type FunnelEventInput = {
  eventName: FunnelEventName;
  idempotencyKey?: string;
  stepId?: StepId;
  stepIndex?: number;
  fieldName?: string;
  errorType?: string;
  errorCode?: string;
  durationMs?: number;
  totalDurationMs?: number;
  metadata?: Record<string, string | number | boolean>;
};

export type SessionCredentials = { id: string; token: string };

export function isFunnelEventName(value: unknown): value is FunnelEventName {
  return typeof value === "string" && EVENT_SET.has(value);
}

export function isStepId(value: unknown): value is StepId {
  return typeof value === "string" && STEP_SET.has(value);
}

export function isFeedbackReason(value: unknown): value is FeedbackReason {
  return typeof value === "string" && FEEDBACK_SET.has(value);
}

export function isSessionId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value);
}

export function isOpaqueToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{32,200}$/.test(value);
}

export function isActiveTokenExpiry(value: unknown, now = Date.now()): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) && Date.parse(value) > now;
}

function cleanScalar(value: unknown): string | number | boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value.slice(0, 2000);
  return undefined;
}

export function sanitizePartialPayload(input: unknown): Partial<EarlyAccessPayload> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!AUTOSAVE_FIELD_SET.has(key)) continue;
    if (Array.isArray(value)) {
      out[key] = value.slice(0, 12).flatMap((item) => {
        const clean = cleanScalar(item);
        return clean === undefined ? [] : [clean];
      });
      continue;
    }
    const clean = cleanScalar(value);
    if (clean !== undefined) out[key] = clean;
  }
  return out as Partial<EarlyAccessPayload>;
}

export function safeFieldName(value: unknown): string | undefined {
  return typeof value === "string" && AUTOSAVE_FIELD_SET.has(value) ? value : undefined;
}

function safeShort(value: unknown, max = 80): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim().slice(0, max);
  return /^[A-Za-z0-9_.:/-]*$/.test(clean) ? clean || undefined : undefined;
}

export function sanitizeEvent(input: unknown): FunnelEventInput | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  if (!isFunnelEventName(raw.eventName)) return null;
  const stepId = isStepId(raw.stepId) ? raw.stepId : undefined;
  const stepIndex = Number.isInteger(raw.stepIndex) && Number(raw.stepIndex) >= 0 && Number(raw.stepIndex) < STEPS.length
    ? Number(raw.stepIndex) : stepId ? STEPS.indexOf(stepId) : undefined;
  const metadata: Record<string, string | number | boolean> = {};
  const allowedMetadata = new Set(["provider", "http_status", "retryable", "attempt", "reason", "manual"]);
  if (raw.metadata && typeof raw.metadata === "object" && !Array.isArray(raw.metadata)) {
    for (const [key, value] of Object.entries(raw.metadata as Record<string, unknown>)) {
      if (!allowedMetadata.has(key)) continue;
      const clean = cleanScalar(value);
      if (clean !== undefined) metadata[key] = typeof clean === "string" ? clean.slice(0, 80) : clean;
    }
  }
  return {
    eventName: raw.eventName,
    idempotencyKey: safeShort(raw.idempotencyKey, 120),
    stepId,
    stepIndex,
    fieldName: safeFieldName(raw.fieldName),
    errorType: safeShort(raw.errorType),
    errorCode: safeShort(raw.errorCode),
    durationMs: clampDuration(raw.durationMs, 86_400_000),
    totalDurationMs: clampDuration(raw.totalDurationMs, 604_800_000),
    metadata,
  };
}

function clampDuration(value: unknown, max: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function emailAssociation(payload: Partial<EarlyAccessPayload>): {
  email?: string;
  normalizedEmail?: string;
  emailPresent: boolean;
  reminderConsent: boolean;
} {
  const email = typeof payload.email === "string" ? payload.email.trim().slice(0, 320) : "";
  const valid = isValidEmail(email);
  return {
    email: valid ? email : undefined,
    normalizedEmail: valid ? normalizeEmail(email) : undefined,
    emailPresent: valid,
    reminderConsent: valid && payload.abandonedReminderConsent === true,
  };
}

export function coarseClient(userAgent: string | null | undefined): {
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  operatingSystem: string;
} {
  const ua = userAgent ?? "";
  const deviceType = /ipad|tablet|kindle/i.test(ua)
    ? "tablet" as const
    : /mobile|iphone|android/i.test(ua)
      ? "mobile" as const
      : ua ? "desktop" as const : "unknown" as const;
  const browser = /instagram/i.test(ua) ? "Instagram"
    : /edg\//i.test(ua) ? "Edge"
      : /samsungbrowser/i.test(ua) ? "Samsung Internet"
        : /crios|chrome/i.test(ua) ? "Chrome"
          : /firefox|fxios/i.test(ua) ? "Firefox"
            : /safari/i.test(ua) ? "Safari" : "Other";
  const operatingSystem = /iphone|ipad|ios/i.test(ua) ? "iOS"
    : /android/i.test(ua) ? "Android"
      : /windows/i.test(ua) ? "Windows"
        : /mac os|macintosh/i.test(ua) ? "macOS"
          : /linux/i.test(ua) ? "Linux" : "Other";
  return { deviceType, browser, operatingSystem };
}

export type AbandonmentConfig = {
  inactivityMinutes: number;
  firstReminderDelayMinutes: number;
  secondReminderDelayMinutes: number;
  resumeTokenHours: number;
  remindersEnabled: boolean;
};

export function abandonmentConfig(env: Record<string, string | undefined> = process.env): AbandonmentConfig {
  const number = (key: string, fallback: number, min: number, max: number) => {
    const parsed = Number(env[key]);
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
  };
  return {
    inactivityMinutes: number("EARLY_ACCESS_ABANDONMENT_MINUTES", 45, 30, 1440),
    firstReminderDelayMinutes: number("EARLY_ACCESS_REMINDER_1_MINUTES", 180, 60, 10080),
    secondReminderDelayMinutes: number("EARLY_ACCESS_REMINDER_2_MINUTES", 1440, 60, 20160),
    resumeTokenHours: number("EARLY_ACCESS_RESUME_TOKEN_HOURS", 168, 1, 720),
    remindersEnabled: env.EARLY_ACCESS_ABANDONED_REMINDERS_ENABLED === "true",
  };
}

export type ReminderCandidate = {
  status: SignupSessionStatus;
  email_present: boolean;
  reminder_consent: boolean;
  reminder_count: number;
  last_activity_at: string;
  abandoned_at: string | null;
  opted_out_at: string | null;
  completed_at: string | null;
  reminder_1_queued_at: string | null;
  reminder_2_queued_at: string | null;
};

export function shouldMarkAbandoned(row: ReminderCandidate, now: number, config: AbandonmentConfig): boolean {
  // Joining the list is already a successful conversion. Abandonment only
  // begins after the visitor explicitly opens the optional detailed onboarding.
  if (!(row.status === "onboarding_started" || row.status === "resumed")) return false;
  if (row.completed_at || row.opted_out_at || !row.email_present || !row.reminder_consent) return false;
  return now - Date.parse(row.last_activity_at) >= config.inactivityMinutes * 60_000;
}

export function dueReminderNumber(row: ReminderCandidate, now: number, config: AbandonmentConfig): 1 | 2 | null {
  if (!config.remindersEnabled || !row.email_present || !row.reminder_consent) return null;
  if (row.completed_at || row.opted_out_at || row.reminder_count >= 2 || !row.abandoned_at) return null;
  if (!(row.status === "abandoned_eligible" || row.status === "reminder_sent")) return null;
  if (row.reminder_count === 0) {
    return now - Date.parse(row.abandoned_at) >= config.firstReminderDelayMinutes * 60_000 ? 1 : null;
  }
  if (row.reminder_count === 1 && row.reminder_1_queued_at) {
    const dueAfterFirst = Date.parse(row.reminder_1_queued_at) + config.secondReminderDelayMinutes * 60_000;
    const dueAfterLatestAbandonment = Date.parse(row.abandoned_at) + config.firstReminderDelayMinutes * 60_000;
    return now >= Math.max(dueAfterFirst, dueAfterLatestAbandonment) ? 2 : null;
  }
  return null;
}

export function likelyAbandonmentCategory(events: Array<{ event_name: string; error_type?: string | null }>):
  "technical_failure" | "validation_friction" | "voluntary_leave" | "unknown" {
  if (events.some((event) => event.event_name === "early_access_api_error")) return "technical_failure";
  const validationCount = events.filter((event) => event.event_name === "early_access_validation_error").length;
  if (validationCount >= 2) return "validation_friction";
  if (events.some((event) => ["onboarding_started", "early_access_started"].includes(event.event_name))) return "voluntary_leave";
  return "unknown";
}
