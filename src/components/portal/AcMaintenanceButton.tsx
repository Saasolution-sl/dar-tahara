"use client";

import * as React from "react";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";

export function AcMaintenanceButton({
  acUnitId, entitlementId, copy,
}: {
  acUnitId: string;
  entitlementId: string;
  copy: PortalCopy["acMaintenance"];
}) {
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = React.useState("");

  async function book() {
    setStatus("submitting");
    setError("");
    const res = await fetch(`/api/account/ac-units/${acUnitId}/maintenance-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entitlementId }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setError(copy.errors[data.error || ""] || copy.errors.bad_request);
      setStatus("idle");
      return;
    }
    setStatus("done");
    setTimeout(() => location.reload(), 1000);
  }

  if (status === "done") return <p className="text-xs text-muted-foreground">{copy.bookSuccess}</p>;

  return (
    <div>
      <button onClick={book} disabled={status === "submitting"} className={buttonVariants({ variant: "primary", size: "sm" })}>
        {status === "submitting" ? copy.bookSubmitting : copy.bookMaintenance}
      </button>
      {error ? <p className="mt-1.5 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
