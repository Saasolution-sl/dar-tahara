"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { PortalCopy } from "@/i18n/portal-copy";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/portal/portal-shell";

export type PortalPropertyRow = {
  id: string;
  portalState: "pending" | "active";
  addressLine1: string;
  city: string;
  propertyType: string | null;
  sizeM2: number;
  rooms: number;
  accessMethod: string | null;
  airConditioningUnits: number;
  kitchenCount: number;
  livingSpaceCount: number;
  outsideSpaces: string[];
  frequency: string | null;
  pets: boolean;
  employeeNumber: string | null;
  assessmentReference: string | null;
  /** Already locale-formatted (e.g. "Jul 29, 2026"), not a raw ISO date. */
  assessmentSubmittedAt: string | null;
  assessmentScheduledAt: string | null;
  assessmentAcceptedAt: string | null;
};

function Finding({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

export function PropertiesTable({ rows, copy, statusLabel }: { rows: PortalPropertyRow[]; copy: PortalCopy["properties"]; statusLabel: string }) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-4">{copy.columnAddress}</th>
            <th className="p-4">{copy.columnType}</th>
            <th className="p-4">{statusLabel}</th>
            <th className="p-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const open = expanded === row.id;
            const pending = row.portalState === "pending";
            return (
              <React.Fragment key={row.id}>
                <tr
                  onClick={() => {
                    if (!pending) setExpanded(open ? null : row.id);
                  }}
                  className={cn(
                    pending
                      ? "cursor-not-allowed bg-secondary/55 text-muted-foreground opacity-70"
                      : "cursor-pointer hover:bg-secondary/30",
                  )}
                  aria-expanded={open}
                  aria-disabled={pending}
                >
                  <td className="p-4 font-medium">{row.addressLine1}, {row.city}</td>
                  <td className="p-4">{row.propertyType || copy.pendingLabel}</td>
                  <td className="p-4"><StatusBadge value={pending ? "pending" : "active"} /></td>
                  <td className="p-4 text-end">
                    {pending ? null : <ChevronDown className={cn("ms-auto h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />}
                  </td>
                </tr>
                {open ? (
                  <tr>
                    <td colSpan={4} className="bg-secondary/20 p-5">
                      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <Finding label={copy.sizeLabel} value={`${row.sizeM2} m²`} />
                        <Finding label={copy.airConditioningLabel} value={row.airConditioningUnits} />
                        <Finding label={copy.accessLabel} value={row.accessMethod || copy.pendingLabel} />
                        <Finding label={copy.roomsLabel} value={row.rooms} />
                        <Finding label={copy.kitchensLabel} value={row.kitchenCount} />
                        <Finding label={copy.livingSpacesLabel} value={row.livingSpaceCount} />
                        <Finding label={copy.outsideSpacesLabel} value={row.outsideSpaces.length ? row.outsideSpaces.join(", ") : copy.noneLabel} />
                        <Finding label={copy.petsLabel} value={row.pets ? copy.yesLabel : copy.noLabel} />
                        <Finding label={copy.employeeIdLabel} value={row.employeeNumber || copy.pendingLabel} />
                        <Finding label={copy.assessmentIdLabel} value={row.assessmentReference || copy.pendingLabel} />
                        <Finding label={copy.submittedLabel} value={row.assessmentSubmittedAt || copy.pendingLabel} />
                        <Finding label={copy.scheduledLabel} value={row.assessmentScheduledAt || copy.pendingLabel} />
                        <Finding label={copy.acceptedLabel} value={row.assessmentAcceptedAt || copy.pendingLabel} />
                        <Finding label={copy.frequencyLabel} value={row.frequency || copy.pendingLabel} />
                      </dl>
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
