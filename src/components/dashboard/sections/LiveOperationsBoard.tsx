"use client";

import * as React from "react";
import Link from "next/link";

import type { LiveOpsRow } from "@/lib/dashboard/queries/liveOps";
import { statusColor } from "@/lib/dashboard/chartColors";
import { LIVE_STATUSES } from "@/lib/dashboard/liveStatus";
import type { DashboardCopy } from "@/i18n/dashboard-copy";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function LiveOperationsBoard({ rows, copy }: { rows: LiveOpsRow[]; copy: DashboardCopy }) {
  const c = copy.liveOps;
  const [filter, setFilter] = React.useState<string | null>(null);

  /**
   * One pill per status that actually has someone in it, plus All.
   *
   * Empty statuses are left out rather than shown as a dead "Waiting 0": the
   * point of the row is to shorten the board, and a pill you can only click to
   * get an empty grid does the opposite.
   */
  const tabs = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) counts.set(row.status, (counts.get(row.status) || 0) + 1);
    return LIVE_STATUSES.filter((status) => counts.has(status)).map((status) => ({
      status: status as string,
      label: c.status[status] || status,
      count: counts.get(status)!,
    }));
  }, [rows, c.status]);

  const visible = filter ? rows.filter((row) => row.status === filter) : rows;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">{c.title}</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === null ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary",
            )}
          >
            {c.all} {rows.length}
          </button>
          {tabs.map((tab) => (
            <button
              key={tab.status}
              type="button"
              onClick={() => setFilter(tab.status)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === tab.status ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor[tab.status] || "#94a3b8" }} />
              {tab.label} {tab.count}
            </button>
          ))}
          <Link href="/admin/live-operations?status=all" className="ms-1 text-xs text-primary underline-offset-4 hover:underline">
            {c.viewAll}
          </Link>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">{c.noStaffLive}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((row) => (
            <article key={row.staffId} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                  style={{ boxShadow: `0 0 0 2px ${statusColor[row.status] || "#94a3b8"}` }}
                >
                  {initials(row.fullName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.fullName}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor[row.status] || "#94a3b8" }} />
                    {c.status[row.status as keyof typeof c.status] || row.status}
                  </p>
                </div>
              </div>

              {row.currentJob ? (
                <div className="mt-3 rounded-xl bg-secondary/40 p-3 text-sm">
                  <p className="font-medium">{row.currentJob.customerName}</p>
                  <p className="text-xs text-muted-foreground">{row.currentJob.address}</p>
                  {row.progressPercent !== null ? (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${row.progressPercent}%` }} />
                    </div>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    ETA {new Intl.DateTimeFormat("en", { timeStyle: "short" }).format(new Date(row.currentJob.scheduledEnd))}
                    {row.travelMinutes !== null ? ` · ${row.travelMinutes}${c.travelSuffix}` : ""}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">{c.noActiveJob}</p>
              )}

              {row.nextJob ? (
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  {c.next}: {row.nextJob.customerName} · {new Intl.DateTimeFormat("en", { timeStyle: "short" }).format(new Date(row.nextJob.scheduledStart))}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
