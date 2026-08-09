"use client";

import { StatusActionButton } from "@/components/admin/status-action-button";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

export function CustomerStatusAction({ id, status, copy }: { id: string; status: string; copy: DashboardCopy["statusAction"] }) {
  const suspended = status === "suspended";
  return (
    <StatusActionButton
      active={suspended}
      activeLabel={copy.restore}
      inactiveLabel={copy.suspend}
      failedLabel={copy.actionFailed}
      onToggle={() =>
        fetch(`/api/admin/customers/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: suspended ? "customer" : "suspended" }),
        })
      }
    />
  );
}
