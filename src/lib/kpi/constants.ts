/**
 * Fixed operational baseline rules, used throughout the KPI engine (and
 * anywhere else that needs them). These are deliberately not configurable
 * via the database; they're the company's fixed operating rules, not
 * per-tenant settings.
 */

export const SQM_PER_HOUR = 25;
export const SECOND_CLEANER_THRESHOLD_SQM = 82.5;
export const MAX_WORKDAY_HOURS = 8;
export const MAX_PAID_TRAVEL_MINUTES = 15;

/** 25 m² = 1 hour, rounded up to the next full hour. */
export function expectedCleaningMinutes(sizeM2: number): number {
  return Math.ceil(sizeM2 / SQM_PER_HOUR) * 60;
}

/** Properties over 82.5 m² require a second cleaner. */
export function requiresSecondCleaner(sizeM2: number): boolean {
  return sizeM2 > SECOND_CLEANER_THRESHOLD_SQM;
}

export function exceedsMaxWorkday(scheduledMinutes: number): boolean {
  return scheduledMinutes > MAX_WORKDAY_HOURS * 60;
}

export function exceedsMaxTravel(travelMinutes: number): boolean {
  return travelMinutes > MAX_PAID_TRAVEL_MINUTES;
}
