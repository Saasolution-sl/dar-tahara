"use client";

import { StatusActionButton } from "@/components/admin/status-action-button";

export function SubscriptionStatusAction({ id, operationalStatus }: { id: string; operationalStatus: string }) {
  const suspended = operationalStatus === "suspended_manual";
  const manageable = operationalStatus === "active" || operationalStatus === "suspended_manual";
  if (!manageable) return <span className="text-xs text-muted-foreground">Automated</span>;
  return (
    <StatusActionButton
      active={suspended}
      activeLabel="Restore"
      inactiveLabel="Suspend"
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
