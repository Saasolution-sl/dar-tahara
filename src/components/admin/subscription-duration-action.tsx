"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

const TIER_MONTHS = [3, 6, 9, 12] as const;

export function SubscriptionDurationAction({
  id, contractDurationMonths, copy,
}: {
  id: string;
  contractDurationMonths: number | null;
  copy: DashboardCopy["durationAction"];
}) {
  const router = useRouter();
  const [value, setValue] = React.useState<string>(contractDurationMonths ? String(contractDurationMonths) : "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleChange(next: string) {
    setValue(next);
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/subscriptions/${id}/duration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_duration_months: next ? Number(next) : null }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || copy.actionFailed);
        setValue(contractDurationMonths ? String(contractDurationMonths) : "");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <select
        value={value}
        disabled={busy}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs font-semibold text-primary disabled:opacity-50",
        )}
      >
        <option value="">{copy.notSet}</option>
        {TIER_MONTHS.map((months) => (
          <option key={months} value={months}>{copy.months.replace("{n}", String(months))}</option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
