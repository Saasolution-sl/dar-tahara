"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/portal/portal-shell";
import { cn } from "@/lib/utils";

export type SubscriptionPropertySummary = {
  id: string;
  addressLine1: string;
  city: string;
  propertyType: string;
  subscriptionCount: number;
  proposalCount: number;
  statuses: string[];
};

export function SubscriptionPropertyAccordion({
  rows,
  children,
  initialExpandedId,
  subscriptionLabel,
  proposalLabel,
}: {
  rows: SubscriptionPropertySummary[];
  children: React.ReactNode;
  initialExpandedId?: string;
  subscriptionLabel: string;
  proposalLabel: string;
}) {
  const [expanded, setExpanded] = React.useState<string | null>(
    initialExpandedId || null,
  );
  const panels = React.Children.toArray(children);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {rows.map((row, index) => {
        const open = expanded === row.id;
        const panelId = `subscription-property-${row.id}`;

        return (
          <section
            key={row.id}
            className={cn(index > 0 && "border-t border-border")}
          >
            <button
              type="button"
              onClick={() => setExpanded(open ? null : row.id)}
              className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 text-left transition-colors hover:bg-secondary/30 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
              aria-expanded={open}
              aria-controls={panelId}
            >
              <span className="min-w-0">
                <span className="block break-words font-medium">
                  {row.addressLine1}
                  {row.city ? `, ${row.city}` : ""}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {row.propertyType}
                </span>
              </span>

              <span className="col-span-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:col-span-1">
                <span>
                  {row.subscriptionCount} {subscriptionLabel}
                </span>
                {row.proposalCount > 0 ? (
                  <span>
                    {row.proposalCount} {proposalLabel}
                  </span>
                ) : null}
                {row.statuses.map((status) => (
                  <StatusBadge key={status} value={status} />
                ))}
              </span>

              <ChevronDown
                className={cn(
                  "col-start-2 row-start-1 h-4 w-4 shrink-0 justify-self-end text-muted-foreground transition-transform sm:col-start-auto sm:row-start-auto sm:ms-2",
                  open && "rotate-180",
                )}
              />
            </button>

            {open ? (
              <div
                id={panelId}
                className="border-t border-border bg-secondary/20 p-4 md:p-5"
              >
                {panels[index]}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
