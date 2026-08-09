import type { KpiStatus } from "./types";

/**
 * The spec gives single-value targets for most KPIs (not bands), so these
 * default margins define what counts as "orange" vs "red" beyond the target.
 * Disclosed default, adjustable: 5% shortfall/overage = orange, beyond = red
 * for min/max targets; 10 points beyond a range = orange, beyond = red.
 * `null` (no data yet) is treated as orange, attention needed, not a
 * confirmed failure.
 */

export function bandMinimum(value: number | null, target: number, orangeMarginPct = 5): KpiStatus {
  if (value === null) return "orange";
  if (value >= target) return "green";
  const shortfallPct = target === 0 ? 100 : ((target - value) / target) * 100;
  return shortfallPct <= orangeMarginPct ? "orange" : "red";
}

export function bandMaximum(value: number | null, target: number, orangeMarginPct = 25): KpiStatus {
  if (value === null) return "orange";
  if (value <= target) return "green";
  const overagePct = target === 0 ? 100 : ((value - target) / target) * 100;
  return overagePct <= orangeMarginPct ? "orange" : "red";
}

export function bandRange(value: number | null, [lo, hi]: [number, number], orangeMargin = 10): KpiStatus {
  if (value === null) return "orange";
  if (value >= lo && value <= hi) return "green";
  const distance = value < lo ? lo - value : value - hi;
  return distance <= orangeMargin ? "orange" : "red";
}
