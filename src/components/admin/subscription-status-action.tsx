"use client";

import { StatusActionButton } from "@/components/admin/status-action-button";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

export function SubscriptionStatusAction({ id, operationalStatus, copy }: { id: string; operationalStatus: string; copy: DashboardCopy["statusAction"] }) {
  const suspended = operationalStatus === "suspended_manual";
  const manageable = operationalStatus === "active" || operationalStatus === "suspended_manual";
  if (!manageable) return <span className="text-xs text-muted-foreground">{copy.automated}</span>;
  return (
    <StatusActionButton
      active={suspended}
      activeLabel={copy.restore}
      inactiveLabel={copy.suspend}
      failedLabel={copy.actionFailed}
      onToggle={() =>
        fetch(`/api/admin/subscriptions/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operational_status: suspended ? "active" : "suspended_manual" }),
        })
      }
    />
  );
}
