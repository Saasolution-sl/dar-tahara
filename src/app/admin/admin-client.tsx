"use client";

import * as React from "react";
import { RefreshCw, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { AdminCopy } from "@/i18n/admin-copy";

type Assessment = {
  id: string;
  reference: string;
  status: string;
  payment_status: string;
  submitted_at: string | null;
  preferred_date: string | null;
  scheduled_at: string | null;
  requested_frequency: string;
  requested_billing_interval: string;
  estimated_monthly_cents: number | null;
  assigned_staff_id: string | null;
  assigned_cleaner_id: string | null;
  assigned_inspector_id: string | null;
  customers: { full_name: string; email: string; phone: string };
  properties: {
    address_line1: string;
    city: string;
    declared_size_m2: number;
  };
};

export function AdminClient({ copy }: { copy: AdminCopy }) {
  const c = copy.assessments;
  const labels = c.statusLabels;
  const [rows, setRows] = React.useState<Assessment[]>([]);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    const response = await fetch("/api/admin/assessments", {
      cache: "no-store",
    });
    if (!response.ok) {
      setError(
        response.status === 401
          ? copy.common.notAuthorized
          : copy.common.dataUnavailable,
      );
      return;
    }
    setRows(await response.json());
    setError("");
  }, [copy.common]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function action(
    row: Assessment,
    name: string,
    extra: Record<string, unknown> = {},
  ) {
    let notes = "";
    if (
      ["complete", "request_info", "approve", "reject", "cancel"].includes(
        name,
      )
    ) {
      notes = window.prompt(c.prompts.notes) || "";
    }
    if (name === "schedule") {
      const date = window.prompt(c.prompts.scheduleDate);
      if (!date) return;
      extra.scheduledAt = new Date(date).toISOString();
    }
    setBusy(row.id);
    const response = await fetch("/api/admin/assessments/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, action: name, notes, ...extra }),
    });
    if (!response.ok) {
      setError((await response.json()).error || copy.common.actionFailed);
    }
    await load();
    setBusy("");
  }

  async function assign(row: Assessment) {
    const employeeId = window.prompt(
      c.prompts.cleanerId,
      row.assigned_staff_id ||
        row.assigned_inspector_id ||
        row.assigned_cleaner_id ||
        "",
    );
    if (employeeId === null) return;
    await action(row, "assign", { employeeId });
  }

  const visible = rows.filter(
    (row) =>
      (status === "all" || row.status === status) &&
      `${row.reference} ${row.customers.full_name} ${row.customers.email} ${row.properties.city} ${row.properties.address_line1}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">{c.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} {c.subtitleSuffix}
          </p>
        </div>
        <button
          onClick={load}
          className={buttonVariants({ variant: "outline", size: "md" })}
        >
          <RefreshCw className="h-4 w-4" />
          {copy.common.refresh}
        </button>
      </header>

      {error ? (
        <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={c.searchPlaceholder}
            className="input pl-10"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="input"
        >
          <option value="all">{copy.common.allStatuses}</option>
          {Object.entries(labels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">{c.columns.reference}</th>
              <th className="p-4">{c.columns.customer}</th>
              <th className="p-4">{c.columns.property}</th>
              <th className="p-4">{c.columns.submitted}</th>
              <th className="p-4">{c.columns.status}</th>
              <th className="p-4">{c.columns.nextAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((row) => (
              <tr key={row.id}>
                <td className="p-4 font-mono text-xs">{row.reference}</td>
                <td className="p-4">
                  <p className="font-medium">{row.customers.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.customers.email}
                  </p>
                </td>
                <td className="p-4">
                  {row.properties.address_line1}, {row.properties.city}
                  <p className="text-xs text-muted-foreground">
                    {row.properties.declared_size_m2} m² ·{" "}
                    {row.requested_frequency}
                  </p>
                </td>
                <td className="p-4">
                  {row.submitted_at?.slice(0, 10) ||
                    row.preferred_date ||
                    "—"}
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {labels[row.status] || row.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {row.status === "submitted" ? (
                      <button
                        disabled={busy === row.id}
                        onClick={() => action(row, "review")}
                        className={buttonVariants({
                          variant: "primary",
                          size: "sm",
                        })}
                      >
                        {c.actions.startReview}
                      </button>
                    ) : null}
                    {["under_review", "contacted"].includes(row.status) ? (
                      <>
                        <button
                          onClick={() => action(row, "contact")}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          {c.actions.contacted}
                        </button>
                        <button
                          onClick={() => action(row, "schedule")}
                          className={buttonVariants({
                            variant: "primary",
                            size: "sm",
                          })}
                        >
                          {c.actions.schedule}
                        </button>
                        <button
                          onClick={() => action(row, "request_info")}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          {c.actions.requestInfo}
                        </button>
                      </>
                    ) : null}
                    {["assessment_scheduled", "assessment"].includes(
                      row.status,
                    ) ? (
                      <button
                        onClick={() => action(row, "complete")}
                        className={buttonVariants({
                          variant: "primary",
                          size: "sm",
                        })}
                      >
                        {c.actions.complete}
                      </button>
                    ) : null}
                    {["assessment_completed", "pending_review"].includes(
                      row.status,
                    ) ? (
                      <>
                        <button
                          onClick={() => action(row, "approve")}
                          className={buttonVariants({
                            variant: "primary",
                            size: "sm",
                          })}
                        >
                          {c.actions.approve}
                        </button>
                        <button
                          onClick={() => action(row, "reject")}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          {c.actions.reject}
                        </button>
                      </>
                    ) : null}
                    <button
                      onClick={() => assign(row)}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      {c.actions.assign}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visible.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-muted-foreground"
                >
                  {c.noMatch}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
