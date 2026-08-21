"use client";

import * as React from "react";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";

export function SelectIncludedAcButton({
  acUnitId, label, copy,
}: {
  acUnitId: string;
  label: string;
  copy: PortalCopy["acMaintenance"];
}) {
  const [status, setStatus] = React.useState<"idle" | "submitting">("idle");
  const [error, setError] = React.useState("");

  async function select() {
    setStatus("submitting");
    setError("");
    const res = await fetch(`/api/account/ac-units/${acUnitId}/select-included`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setError(copy.errors[data.error || ""] || copy.errors.bad_request);
      setStatus("idle");
      return;
    }
    location.reload();
  }

  return (
    <div>
      <button onClick={select} disabled={status === "submitting"} className={buttonVariants({ variant: "outline", size: "sm" })}>
        {label} — {copy.selectIncluded}
      </button>
      {error ? <p className="mt-1.5 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
