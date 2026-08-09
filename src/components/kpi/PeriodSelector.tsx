"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { KpiCopy } from "@/i18n/kpi-copy";
import { cn } from "@/lib/utils";

export function PeriodSelector({ current, from, to, copy }: { current: string; from?: string; to?: string; copy: KpiCopy["period"] }) {
  const PERIODS = [
    { value: "daily", label: copy.daily },
    { value: "weekly", label: copy.weekly },
    { value: "monthly", label: copy.monthly },
    { value: "quarterly", label: copy.quarterly },
    { value: "yearly", label: copy.yearly },
    { value: "custom", label: copy.custom },
  ] as const;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [customFrom, setCustomFrom] = React.useState(from || "");
  const [customTo, setCustomTo] = React.useState(to || "");

  function setPeriod(period: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    if (period !== "custom") {
      params.delete("from");
      params.delete("to");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", "custom");
    params.set("from", customFrom);
    params.set("to", customTo);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => setPeriod(p.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            current === p.value ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary",
          )}
        >
          {p.label}
        </button>
      ))}
      {current === "custom" ? (
        <div className="flex items-center gap-2">
          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="input py-1 text-xs" />
          <span className="text-xs text-muted-foreground">{copy.to}</span>
          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="input py-1 text-xs" />
          <button type="button" onClick={applyCustom} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            {copy.apply}
          </button>
        </div>
      ) : null}
    </div>
  );
}
