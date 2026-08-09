"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/** Generic Suspend/Restore-style toggle button used by the customer, subscription and team status actions. */
export function StatusActionButton({
  active,
  activeLabel,
  inactiveLabel,
  onToggle,
  failedLabel = "action_failed",
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onToggle: () => Promise<Response>;
  failedLabel?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleClick() {
    setBusy(true);
    setError("");
    try {
      const response = await onToggle();
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || failedLabel);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={cn(
          "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
          active
            ? "border-red-200 text-red-600 hover:bg-red-50"
            : "border-border text-primary hover:bg-secondary",
        )}
      >
        {busy ? "…" : active ? activeLabel : inactiveLabel}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
