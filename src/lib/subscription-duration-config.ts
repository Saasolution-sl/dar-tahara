import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { DEFAULT_DURATION_TIERS, type DurationCode, type DurationTier } from "@/lib/subscription-duration";

/**
 * DB-backed admin configuration for subscription-duration tiers, with the
 * hardcoded defaults as a fallback — same shape as feature-flags.ts's
 * getFeatureFlags(). Not unit tested for the same reason getFeatureFlags()
 * isn't: it's a thin DB round trip with no logic of its own (the actual
 * pricing math lives in subscription-duration.ts, which is tested).
 */

type DurationTierRow = {
  code: DurationCode;
  months: number;
  discount_basis_points: number;
  pause_eligible: boolean;
  max_pause_months: number;
  max_pauses_per_contract: number;
  recommended: boolean;
  enabled: boolean;
  display_order: number;
};

function rowToTier(row: DurationTierRow): DurationTier {
  return {
    code: row.code,
    months: row.months as DurationTier["months"],
    discountPercentage: row.discount_basis_points / 100,
    pauseEligible: row.pause_eligible,
    maxPauseMonths: row.max_pause_months,
    maxPausesPerContract: row.max_pauses_per_contract,
    recommended: row.recommended,
    enabled: row.enabled,
    displayOrder: row.display_order,
    // The free deep-clean benefit belongs to the later billing/cancellation
    // bundle. Bundle 1 must not query a column that its migrations do not add.
    includesFreeDeepClean: false,
  };
}

/** All configured duration tiers (enabled and disabled), ordered for display. Falls back to defaults on any DB error. */
export async function getDurationTiers(): Promise<DurationTier[]> {
  try {
    const rows = await serviceSelect<DurationTierRow[]>(
      "subscription_duration_tiers?select=code,months,discount_basis_points,pause_eligible,max_pause_months,max_pauses_per_contract,recommended,enabled,display_order&order=display_order.asc",
    );
    if (rows.length === 0) return DEFAULT_DURATION_TIERS;
    return rows.map(rowToTier);
  } catch {
    return DEFAULT_DURATION_TIERS;
  }
}

/** Only the tiers a customer may currently select. */
export async function getEnabledDurationTiers(): Promise<DurationTier[]> {
  return (await getDurationTiers()).filter((tier) => tier.enabled);
}
