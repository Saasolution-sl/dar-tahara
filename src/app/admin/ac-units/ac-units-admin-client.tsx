"use client";
import * as React from "react";
import { Search, RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { AdminCopy } from "@/i18n/admin-copy";

type AcUnit = {
  id: string; unit_code: string; room_type: string; room_label: string | null;
  coverage_type: "included" | "paid_addon"; status: string;
  customers: { full_name: string; email: string };
  properties: { address_line1: string; city: string };
  maintenanceCompleted: number; maintenanceTotal: number; billingMismatch: boolean;
};

export function AcUnitsAdminClient({ copy }: { copy: AdminCopy }) {
  const c = copy.acUnits;
  const [rows, setRows] = React.useState<AcUnit[]>([]);
  const [query, setQuery] = React.useState("");
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/ac-units", { cache: "no-store" });
    if (!r.ok) { setError(r.status === 401 ? copy.common.notAuthorized : copy.common.dataUnavailable); return; }
    setRows(await r.json());
    setError("");
  }, [copy.common]);
  React.useEffect(() => { load(); }, [load]);

  async function retire(unit: AcUnit) {
    const reason = window.prompt(c.prompts.retireReason);
    if (!reason) return;
    setBusy(unit.id);
    const r = await fetch(`/api/admin/ac-units/${unit.id}/retire`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }),
    });
    if (!r.ok) setError((await r.json().catch(() => ({}))).error || copy.common.actionFailed);
    await load();
    setBusy("");
  }

  async function replace(unit: AcUnit) {
    const reason = window.prompt(c.prompts.replaceReason);
    if (!reason) return;
    const targetUnitId = window.prompt(c.prompts.replaceTargetUnitId);
    if (!targetUnitId) return;
    setBusy(unit.id);
    const r = await fetch(`/api/admin/ac-units/${unit.id}/replace`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason, newIncludedAcUnitId: targetUnitId }),
    });
    if (!r.ok) setError((await r.json().catch(() => ({}))).error || copy.common.actionFailed);
    await load();
    setBusy("");
  }

  const visible = rows.filter((r) =>
    `${r.customers.full_name} ${r.customers.email} ${r.unit_code}`.toLowerCase().includes(query.toLowerCase()),
  );

  const activeRows = rows.filter((r) => r.status === "active");
  const includedCount = activeRows.filter((r) => r.coverage_type === "included").length;
  const paidCount = activeRows.filter((r) => r.coverage_type === "paid_addon").length;
  const mismatchCount = activeRows.filter((r) => r.billingMismatch).length;
  const dueThisMonth = activeRows.filter((r) => r.maintenanceTotal > 0 && r.maintenanceCompleted < r.maintenanceTotal).length;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">{c.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rows.length} {c.subtitleSuffix}</p>
        </div>
        <button onClick={load} className={buttonVariants({ variant: "outline", size: "md" })}>
          <RefreshCw className="h-4 w-4" />{copy.common.refresh}
        </button>
      </header>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{includedCount}</p>
          <p className="text-xs text-muted-foreground">Included AC units</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{paidCount}</p>
          <p className="text-xs text-muted-foreground">Paid AC units &middot; €{(paidCount * 4).toFixed(2)}/month</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{dueThisMonth}</p>
          <p className="text-xs text-muted-foreground">Units with maintenance outstanding</p>
        </div>
        <div className={`rounded-xl border p-4 ${mismatchCount > 0 ? "border-red-300 bg-red-500/5" : "border-border bg-card"}`}>
          <p className="text-2xl font-semibold">{mismatchCount}</p>
          <p className="text-xs text-muted-foreground">Stripe/database mismatches</p>
        </div>
      </div>
      {error ? <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="mt-7">
        <label className="relative block max-w-sm">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.searchPlaceholder} className="input pl-10" />
        </label>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">{c.columns.customer}</th>
              <th className="p-4">{c.columns.property}</th>
              <th className="p-4">{c.columns.unit}</th>
              <th className="p-4">{c.columns.coverage}</th>
              <th className="p-4">{c.columns.status}</th>
              <th className="p-4">{c.columns.maintenance}</th>
              <th className="p-4">{c.columns.billing}</th>
              <th className="p-4">{c.columns.nextAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((row) => (
              <tr key={row.id}>
                <td className="p-4">
                  <p className="font-medium">{row.customers.full_name}</p>
                  <p className="text-xs text-muted-foreground">{row.customers.email}</p>
                </td>
                <td className="p-4">{row.properties.address_line1}, {row.properties.city}</td>
                <td className="p-4">
                  <p className="font-medium">{row.room_label || row.room_type}</p>
                  <p className="text-xs text-muted-foreground">{row.unit_code}</p>
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {c.coverageLabels[row.coverage_type]}
                  </span>
                </td>
                <td className="p-4 capitalize">{row.status}</td>
                <td className="p-4">{row.maintenanceCompleted} / {row.maintenanceTotal}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.billingMismatch ? "bg-red-500/10 text-red-700" : "bg-primary/10 text-primary"}`}>
                    {row.billingMismatch ? c.billingMismatchLabel : c.billingOkLabel}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {row.coverage_type === "paid_addon" && row.status === "active" ? (
                      <button disabled={busy === row.id} onClick={() => retire(row)} className={buttonVariants({ variant: "outline", size: "sm" })}>{c.actions.retire}</button>
                    ) : null}
                    {row.coverage_type === "included" && row.status === "active" ? (
                      <button disabled={busy === row.id} onClick={() => replace(row)} className={buttonVariants({ variant: "outline", size: "sm" })}>{c.actions.replace}</button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!visible.length ? <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">{c.noMatch}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
