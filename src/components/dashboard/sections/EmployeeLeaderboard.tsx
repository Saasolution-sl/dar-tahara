"use client";

import * as React from "react";
import type { EmployeeStat } from "@/lib/dashboard/queries/employees";
import type { DashboardCopy } from "@/i18n/dashboard-copy";
import { cn } from "@/lib/utils";

type SortKey = "avgRating" | "jobsCompleted" | "avgTravelMinutes" | "punctualityPercent";

export function EmployeeLeaderboard({ stats, copy }: { stats: EmployeeStat[]; copy: DashboardCopy }) {
  const c = copy.employees;
  const SORT_OPTIONS: Array<{ key: SortKey; label: string; ascending?: boolean }> = [
    { key: "avgRating", label: c.sort.highestRated },
    { key: "jobsCompleted", label: c.sort.mostJobs },
    { key: "avgTravelMinutes", label: c.sort.lowestTravel, ascending: true },
    { key: "punctualityPercent", label: c.sort.mostPunctual },
  ];
  const [sortKey, setSortKey] = React.useState<SortKey>("avgRating");
  const option = SORT_OPTIONS.find((o) => o.key === sortKey)!;

  const sorted = [...stats].sort((a, b) => {
    const av = a[sortKey] ?? (option.ascending ? Infinity : -Infinity);
    const bv = b[sortKey] ?? (option.ascending ? Infinity : -Infinity);
    return option.ascending ? av - bv : bv - av;
  });

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">{c.title}</h2>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortKey(opt.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                sortKey === opt.key ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">{c.noData}</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">{c.headers.rank}</th>
                <th className="p-4">{c.headers.employee}</th>
                <th className="p-4">{c.headers.jobs}</th>
                <th className="p-4">{c.headers.rating}</th>
                <th className="p-4">{c.headers.avgCleaning}</th>
                <th className="p-4">{c.headers.avgTravel}</th>
                <th className="p-4">{c.headers.punctuality}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((row, index) => (
                <tr key={row.staffId}>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{index + 1}</td>
                  <td className="p-4 font-medium">{row.fullName}<span className="ms-1.5 text-xs text-muted-foreground">{row.employeeNumber}</span></td>
                  <td className="p-4">{row.jobsCompleted}</td>
                  <td className="p-4">{row.avgRating !== null ? `${row.avgRating.toFixed(1)}★` : "Not available"}</td>
                  <td className="p-4">{row.avgCleaningMinutes !== null ? `${Math.round(row.avgCleaningMinutes)}min` : "Not available"}</td>
                  <td className="p-4">{row.avgTravelMinutes !== null ? `${Math.round(row.avgTravelMinutes)}min` : "Not available"}</td>
                  <td className="p-4">{row.punctualityPercent !== null ? `${row.punctualityPercent}%` : "Not available"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
