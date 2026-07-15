/**
 * Shared types for the Mautic integration. No runtime code, no secrets — safe to
 * import from anywhere (including tests).
 */

/** The subset of a Supabase marketing_leads row the sync layer needs. */
export type LeadForSync = {
  id: string;
  normalizedEmail: string;
  email: string;
  firstName: string;
  lastName: string;
  mobilePhone?: string | null;
  whatsappPhone?: string | null;
  preferredContactMethod?: string | null;
  preferredLanguage?: string | null;
  residenceCity?: string | null;

  status?: string | null;
  emailVerified?: boolean;

  referralCode?: string | null;
  referredByCode?: string | null;
  verifiedReferralCount?: number | null;

  // Marketing-relevant summaries (exact addresses stay in Supabase).
  billingRecipientType?: string | null;
  billingCountry?: string | null;
  billingCity?: string | null;
  cleaningCity?: string | null;
  cleaningRegion?: string | null;
  cleaningCountry?: string | null;
  propertyType?: string | null;
  propertySizeRange?: string | null;
  occupancyType?: string | null;
  propertyCondition?: string | null;

  desiredServices?: string[] | null;
  desiredFrequency?: string | null;
  expectedStartPeriod?: string | null;
  accessMethod?: string | null;
  hasDigitalLock?: boolean | null;

  // Attribution.
  firstSourceCode?: string | null;
  lastSourceCode?: string | null;
  firstUtmSource?: string | null;
  firstUtmMedium?: string | null;
  firstUtmCampaign?: string | null;
  firstUtmContent?: string | null;
  firstUtmTerm?: string | null;
  lastUtmSource?: string | null;
  lastUtmMedium?: string | null;
  lastUtmCampaign?: string | null;
  lastUtmContent?: string | null;
};

/** Mautic contact payload — a flat map of field alias → value. */
export type MauticContactFields = Record<string, string | number | boolean>;

export type MauticContact = {
  id: number;
  fields?: unknown;
};

/** Outcome of a single sync attempt, mirrored into marketing_leads.mautic_sync_status. */
export type SyncStatus =
  | "synchronized"
  | "failed"
  | "retry_scheduled"
  | "permanently_failed";

export type SyncResult = {
  status: SyncStatus;
  mauticContactId?: number;
  /** True when the failure is transient and a later retry is worthwhile. */
  retryable: boolean;
  error?: string;
  /** Which high-level step failed, for logging without leaking PII. */
  failedStep?: "upsert" | "tags" | "segment";
};

export class MauticApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Transient (network/5xx/429/timeout) vs permanent (4xx auth/validation). */
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "MauticApiError";
  }
}
