/**
 * Dar Tahara, deep-clean request eligibility and validation.
 *
 * Pure, no Supabase/Stripe dependency (same split as pause-eligibility.ts).
 * The caller fetches the subscription row, its duration tier, the property
 * size, and whether a non-terminal request already exists, then passes all
 * of that in here.
 */

export const ACTIVE_DEEP_CLEAN_REQUEST_STATUSES = ["submitted", "under_review", "approved", "scheduled"] as const;

export type SubscriptionForDeepCleanCheck = {
  status: string;
  /** Whether the subscription's current contract tier includes a complimentary deep clean, read from `DurationTier.includesFreeDeepClean`, not a hardcoded term check. */
  contractIncludesFreeDeepClean: boolean;
  deepCleanFreeUsed: boolean;
};

export type DeepCleanRequestValue = { requestedDate: string; isFree: boolean };

export type DeepCleanEligibilityResult =
  | { ok: true; value: DeepCleanRequestValue }
  | { ok: false; error: string };

function validDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return Number.isFinite(Date.parse(`${value}T00:00:00Z`)) ? value : null;
}

export function validateDeepCleanRequest(
  subscription: SubscriptionForDeepCleanCheck,
  hasNonTerminalRequest: boolean,
  body: unknown,
  today = new Date(),
): DeepCleanEligibilityResult {
  if (subscription.status !== "active") return { ok: false, error: "subscription_not_active" };
  if (hasNonTerminalRequest) return { ok: false, error: "deep_clean_request_already_pending" };

  if (!body || typeof body !== "object") return { ok: false, error: "bad_request" };
  const b = body as Record<string, unknown>;
  const requestedDate = validDate(b.requestedDate);
  if (!requestedDate) return { ok: false, error: "invalid_dates" };

  const todayStr = today.toISOString().slice(0, 10);
  if (requestedDate < todayStr) return { ok: false, error: "start_date_in_past" };

  const isFree = subscription.contractIncludesFreeDeepClean && !subscription.deepCleanFreeUsed;
  return { ok: true, value: { requestedDate, isFree } };
}
