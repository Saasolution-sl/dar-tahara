"use client";

import { StatusActionButton } from "@/components/admin/status-action-button";

export function CustomerStatusAction({ id, status }: { id: string; status: string }) {
  const suspended = status === "suspended";
  return (
    <StatusActionButton
      active={suspended}
      activeLabel="Restore"
      inactiveLabel="Suspend"
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
