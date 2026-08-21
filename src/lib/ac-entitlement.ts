/**
 * Dar Tahara, AC maintenance entitlement validation.
 *
 * Pure, no Supabase/Stripe dependency (same split as deep-clean-eligibility.ts
 * / pause-eligibility.ts). The caller resolves ownership (customer ->
 * property -> AC unit -> entitlement) and the current subscription status,
 * then passes all of that in here as plain data. This is what makes
 * switching the included AC after a visit unable to unlock a second free
 * visit, regardless of what a client request claims.
 */

export type AcUnitStatus =
  | "active" | "pending_activation" | "pending_cancellation"
  | "inactive" | "retired" | "replaced";

export type AcEntitlementStatus = "available" | "booked" | "completed" | "expired" | "cancelled";

export type AcUnitForBookingCheck = {
  id: string;
  propertyId: string;
  status: AcUnitStatus;
};

export type EntitlementForBookingCheck = {
  id: string;
  acUnitId: string;
  status: AcEntitlementStatus;
  serviceWindowStart: string;
  serviceWindowEnd: string;
};

export type AcBookingValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Validates that a specific entitlement can be consumed by a booking right
 * now, for a specific AC unit, on a property the customer actually owns.
 * The caller must resolve `customerOwnsProperty` server-side (never trust a
 * client-supplied ac_unit_id/entitlement_id/property_id combination).
 */
export function validateAcMaintenanceBooking(
  property: { id: string; customerOwnsProperty: boolean },
  acUnit: AcUnitForBookingCheck,
  entitlement: EntitlementForBookingCheck,
  subscriptionStatus: string,
  today = new Date(),
): AcBookingValidationResult {
  if (!property.customerOwnsProperty) return { ok: false, error: "not_found" };
  if (acUnit.propertyId !== property.id) return { ok: false, error: "ac_unit_property_mismatch" };
  if (acUnit.status !== "active") return { ok: false, error: "ac_unit_not_active" };
  if (entitlement.acUnitId !== acUnit.id) return { ok: false, error: "entitlement_ac_unit_mismatch" };
  if (entitlement.status !== "available") return { ok: false, error: "entitlement_not_available" };
  if (subscriptionStatus !== "active") return { ok: false, error: "subscription_not_active" };
  const todayStr = today.toISOString().slice(0, 10);
  if (todayStr < entitlement.serviceWindowStart) return { ok: false, error: "service_window_not_open" };
  return { ok: true };
}

export type AcReplacementReason =
  | "removed" | "replaced" | "moved_property" | "incorrect_before_maintenance" | "admin_correction";

const VALID_REPLACEMENT_REASONS: readonly string[] = [
  "removed", "replaced", "moved_property", "incorrect_before_maintenance", "admin_correction",
];

export type AcReplacementValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * The included AC cannot casually change between visits: only through one of
 * these authorized reasons. Every valid replacement retires the current
 * included unit and expects the caller to create a brand new AC record for
 * the replacement, never rewriting the retired unit's own history (its
 * completed/available entitlements stay attached to it).
 */
export function validateAcReplacement(
  currentIncludedUnit: { status: AcUnitStatus; hasCompletedMaintenance: boolean },
  reason: string,
): AcReplacementValidationResult {
  if (!VALID_REPLACEMENT_REASONS.includes(reason)) {
    return { ok: false, error: "invalid_replacement_reason" };
  }
  if (currentIncludedUnit.status !== "active") {
    return { ok: false, error: "included_unit_not_active" };
  }
  if (reason === "incorrect_before_maintenance" && currentIncludedUnit.hasCompletedMaintenance) {
    return { ok: false, error: "maintenance_already_performed" };
  }
  return { ok: true };
}
