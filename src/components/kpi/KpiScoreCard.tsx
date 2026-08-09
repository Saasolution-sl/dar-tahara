import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import type { KpiResult } from "@/lib/kpi/types";
import type { KpiCopy } from "@/i18n/kpi-copy";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = { green: "#22c55e", orange: "#f59e0b", red: "#ef4444" };
const STATUS_BORDER: Record<string, string> = { green: "border-emerald-300/60", orange: "border-amber-300/60", red: "border-red-300/60" };

export function KpiScoreCard({ kpi, copy }: { kpi: KpiResult; copy: KpiCopy }) {
  const translated = copy.kpis[kpi.id as keyof typeof copy.kpis];
  const label = translated?.label ?? kpi.label;
  const target = translated?.target ?? kpi.target;
  return (
    <div className={cn("flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-md", STATUS_BORDER[kpi.status])}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_DOT[kpi.status] }} title={kpi.status} />
      </div>
      <p className="mt-3 font-serif text-3xl text-foreground">
        {kpi.value === null ? "Not available" : <AnimatedNumber value={kpi.value} format={kpi.unit === "/5" ? "rating" : "integer"} />}
        {kpi.value !== null && kpi.unit ? <span className="ms-1 text-lg text-muted-foreground">{kpi.unit}</span> : null}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{copy.targetPrefix} {target}</p>
      {kpi.trendPercent !== null && kpi.trendPercent !== undefined ? (
        <p className={cn("mt-1 text-xs font-medium", kpi.trendPercent >= 0 ? "text-emerald-600" : "text-red-600")}>
          {kpi.trendPercent >= 0 ? "▲" : "▼"} {Math.abs(kpi.trendPercent)}% {copy.vsPreviousPeriod}
        </p>
      ) : null}
    </div>
  );
}
