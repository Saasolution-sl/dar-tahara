export type KpiPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export type PeriodRangeLabelKey = "today" | "this_week" | "this_month" | "previous_period";

/**
 * `label` is an English fallback (used for custom/quarterly/yearly ranges,
 * which embed dates/numbers that don't need translation). `labelKey` is set
 * for the four fixed cases so the UI layer can look up a translated string.
 */
export type PeriodRange = { start: Date; end: Date; label: string; labelKey?: PeriodRangeLabelKey };

export function resolvePeriodRange(period: KpiPeriod, custom?: { from: string; to: string }): PeriodRange {
  const now = new Date();

  if (period === "custom" && custom?.from && custom?.to) {
    const start = new Date(custom.from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(custom.to);
    end.setHours(23, 59, 59, 999);
    return { start, end, label: `${custom.from} – ${custom.to}` };
  }

  if (period === "daily") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end, label: "Today", labelKey: "today" };
  }

  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end, label: "This week", labelKey: "this_week" };
  }

  if (period === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end, label: "This month", labelKey: "this_month" };
  }

  if (period === "quarterly") {
    const quarter = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), quarter * 3, 1);
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
    return { start, end, label: `Q${quarter + 1} ${now.getFullYear()}` };
  }

  // yearly
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end, label: `${now.getFullYear()}` };
}

/** The immediately-preceding period of the same duration, for trend deltas. */
export function previousPeriodRange(range: PeriodRange): PeriodRange {
  const durationMs = range.end.getTime() - range.start.getTime();
  const end = new Date(range.start.getTime() - 1);
  const start = new Date(end.getTime() - durationMs);
  return { start, end, label: "Previous period", labelKey: "previous_period" };
}

export function trendPercent(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
