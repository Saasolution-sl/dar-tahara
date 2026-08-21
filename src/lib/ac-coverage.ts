/**
 * Dar Tahara, AC coverage activation I/O.
 *
 * Generates the two-window maintenance ledger (ac-maintenance.ts's
 * generateBenefitWindows) and writes it for a unit that just became covered
 * (designated included, or a paid add-on just activated). Kept separate
 * from the pure ac-maintenance.ts/ac-entitlement.ts modules, which have no
 * Supabase dependency by design.
 */
import "server-only";
import { generateBenefitWindows } from "./ac-maintenance";
import { serviceInsert } from "./supabase-rpc";

/**
 * Creates both service-window entitlement rows for a newly-covered AC unit's
 * first benefit period. Idempotent per (ac_unit_id, benefit_period_start,
 * service_window_number) via the migration's unique constraint -- calling
 * this twice for the same coverage start is a database error, not a
 * duplicate ledger.
 */
export async function activateAcCoverage(input: {
  acUnitId: string;
  subscriptionId: string;
  coverageStartedAt: Date;
}): Promise<void> {
  const windows = generateBenefitWindows(input.coverageStartedAt);
  const benefitPeriodStart = windows.window1.start;
  const benefitPeriodEnd = windows.window2.end;
  await serviceInsert("ac_maintenance_entitlements", [
    {
      ac_unit_id: input.acUnitId,
      subscription_id: input.subscriptionId,
      benefit_period_start: benefitPeriodStart,
      benefit_period_end: benefitPeriodEnd,
      service_window_number: 1,
      service_window_start: windows.window1.start,
      service_window_end: windows.window1.end,
      status: "available",
    },
    {
      ac_unit_id: input.acUnitId,
      subscription_id: input.subscriptionId,
      benefit_period_start: benefitPeriodStart,
      benefit_period_end: benefitPeriodEnd,
      service_window_number: 2,
      service_window_start: windows.window2.start,
      service_window_end: windows.window2.end,
      status: "available",
    },
  ]);
}
