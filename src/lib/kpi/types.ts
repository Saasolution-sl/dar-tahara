export type KpiStatus = "green" | "orange" | "red";

export type KpiResult = {
  id: string;
  label: string;
  value: number | null;
  unit?: string;
  /** Human-readable target description, e.g. "80–90%" or "Max 15 min". */
  target: string;
  status: KpiStatus;
  trendPercent?: number | null;
  periodLabel: string;
};

export type KpiBreakdown<T> = {
  key: string;
  label: string;
  data: T;
};
