/**
 * Dar Tahara — subscription pause-request eligibility and validation.
 *
 * Pure, no Supabase/Stripe dependency, so this stays directly unit-testable
 * (same split as pricing.ts / subscription-duration.ts). The caller (an API
 * route) is responsible for fetching the subscription row, the applicable
 * duration tier's max_pause_months, and whether a non-terminal pause request
 * already exists for this subscription, then passing all of that in here —
 * this module never touches the database itself.
 */

export type PauseReasonCategory =
  | "construction"
  | "major_renovation"
  | "property_damage"
  | "inaccessible"
  | "other";

const REASON_CATEGORIES = new Set<PauseReasonCategory>([
  "construction", "major_renovation", "property_damage", "inaccessible", "other",
]);

/** Non-terminal pause-request statuses — only one may exist per subscription at a time. */
export const ACTIVE_PAUSE_REQUEST_STATUSES = ["submitted", "under_review", "approved", "active"] as const;

export type SubscriptionForPauseCheck = {
  status: string;
  pauseEligible: boolean;
  pauseUsed: boolean;
  /** The contract's current end date (already extended by any prior pause) — the requested range must fall within it. */
  currentContractEndDate: string | null;
};

export type PauseRequestValue = {
  reasonCategory: PauseReasonCategory;
  reasonDescription: string;
  requestedStartDate: string;
  requestedEndDate: string;
};

export type PauseEligibilityResult =
  | { ok: true; value: PauseRequestValue }
  | { ok: false; error: string };

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().replace(/\s+/g, " ");
  return clean ? clean.slice(0, max) : null;
}

function validDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return Number.isFinite(Date.parse(`${value}T00:00:00Z`)) ? value : null;
}

function addMonthsUTC(dateStr: string, months: number): Date {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

/**
 * Validates a customer's pause-request submission against the subscription's
 * current state and the applicable tier's pause entitlement. Every check the
 * spec lists explicitly: active subscription, pause-eligible tier, not
 * already used, no conflicting request, dates not before today, range not
 * exceeding the tier's max pause months, and — if the contract end date is
 * known — the requested range must fall within the active contract.
 */
export function validatePauseRequest(
  subscription: SubscriptionForPauseCheck,
  hasNonTerminalRequest: boolean,
  maxPauseMonths: number,
  body: unknown,
  today = new Date(),
): PauseEligibilityResult {
  if (subscription.status !== "active") return { ok: false, error: "subscription_not_active" };
  if (!subscription.pauseEligible) return { ok: false, error: "not_pause_eligible" };
  if (subscription.pauseUsed) return { ok: false, error: "pause_already_used" };
  if (hasNonTerminalRequest) return { ok: false, error: "pause_request_already_pending" };

  if (!body || typeof body !== "object") return { ok: false, error: "bad_request" };
  const b = body as Record<string, unknown>;

  const reasonCategory = typeof b.reasonCategory === "string" && REASON_CATEGORIES.has(b.reasonCategory as PauseReasonCategory)
    ? (b.reasonCategory as PauseReasonCategory)
    : null;
  const reasonDescription = cleanText(b.reasonDescription, 2000);
  const requestedStartDate = validDate(b.requestedStartDate);
  const requestedEndDate = validDate(b.requestedEndDate);

  if (!reasonCategory) return { ok: false, error: "invalid_reason_category" };
  if (!reasonDescription) return { ok: false, error: "reason_description_required" };
  if (!requestedStartDate || !requestedEndDate) return { ok: false, error: "invalid_dates" };

  const todayStr = today.toISOString().slice(0, 10);
  if (requestedStartDate < todayStr) return { ok: false, error: "start_date_in_past" };
  if (requestedEndDate <= requestedStartDate) return { ok: false, error: "end_before_start" };

  const maxEndDate = addMonthsUTC(requestedStartDate, maxPauseMonths).toISOString().slice(0, 10);
  if (requestedEndDate > maxEndDate) return { ok: false, error: "exceeds_max_pause_months" };

  if (subscription.currentContractEndDate && requestedEndDate > subscription.currentContractEndDate) {
    return { ok: false, error: "outside_contract_period" };
  }

  return {
    ok: true,
    value: { reasonCategory, reasonDescription, requestedStartDate, requestedEndDate },
  };
}

/**
 * "YYYY-MM" for every calendar month an approved pause window actually
 * covers — `startDate` inclusive, `endDate` exclusive (the end date is the
 * resume date, not itself a paused month; e.g. 2026-08-01 → 2026-10-01
 * covers August and September, resuming October 1st).
 */
export function monthsCoveredByPause(startDate: string, endDate: string): string[] {
  const months: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (cursor < end) {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}
