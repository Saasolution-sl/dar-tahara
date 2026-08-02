"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export function OfficeAssignSelect({
  targetId,
  kind,
  currentOfficeId,
  offices,
}: {
  targetId: string;
  kind: "customer" | "staff";
  currentOfficeId: string | null;
  offices: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const endpoint = kind === "customer" ? `/api/admin/customers/${targetId}/office` : `/api/admin/team/${targetId}/office`;

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setBusy(true);
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ officeId: event.target.value || null }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <select
      className="input mt-1 py-1 text-xs"
      defaultValue={currentOfficeId || ""}
      onChange={handleChange}
      disabled={busy}
      aria-label="Office"
    >
      <option value="">No office</option>
      {offices.map((office) => (
        <option key={office.id} value={office.id}>{office.name}</option>
      ))}
    </select>
  );
}
