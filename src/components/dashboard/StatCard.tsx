import type { ReactNode } from "react";
import { AnimatedNumber, type NumberFormatKind } from "@/components/dashboard/AnimatedNumber";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  format,
  suffix,
  trend,
  tone = "default",
  icon,
  children,
}: {
  label: string;
  value: number | null;
  format?: NumberFormatKind;
  suffix?: string;
  trend?: { value: number; label: string } | null;
  tone?: "default" | "warning" | "critical" | "success";
  icon?: ReactNode;
  children?: ReactNode;
}) {
  const toneClass = {
    default: "border-border",
    warning: "border-amber-300/60",
    critical: "border-red-300/60",
    success: "border-emerald-300/60",
  }[tone];

  return (
    <div className={cn("flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-md", toneClass)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground/70">{icon}</span> : null}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-serif text-3xl text-foreground">
          {value === null ? "Not available" : <AnimatedNumber value={value} format={format} />}
          {value !== null && suffix ? <span className="ms-1 text-lg text-muted-foreground">{suffix}</span> : null}
        </p>
        {children}
      </div>
      {trend ? (
        <p className={cn("mt-2 text-xs font-medium", trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
          {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
        </p>
      ) : null}
    </div>
  );
}
