"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";

type Assessment = {
  id: string; reference: string; status: string; payment_status: string; scheduled_at: string | null; assessment_completed_at: string | null;
  assigned_staff_id: string | null; customer_identity_confirmed_at: string | null; customer_confirmation_reference: string | null;
  assessment_outcome: string | null; assessment_notes: string | null; proposed_plan: string | null; proposed_recurring_cents: number | null;
  additional_service_fees_cents: number | null; recurring_cleaning_duration_minutes: number | null;
  customers: { full_name: string; email: string };
  properties: { address_line1: string; city: string; property_type: string | null; verified_size_m2: number | null; verified_bedrooms: number | null; verified_bathrooms: number | null; access_method: string | null; air_conditioning_units: number | null; kitchen_count: number | null; living_space_count: number | null; outside_spaces: string[] | null; selected_services: string[] | null };
};
type Staff = { id: string; full_name: string; employee_number: string; role: string };

export function ManagerOperations() {
  const [rows, setRows] = React.useState<Assessment[]>([]); const [staff, setStaff] = React.useState<Staff[]>([]);
  const [open, setOpen] = React.useState<string | null>(null); const [error, setError] = React.useState(""); const [loading, setLoading] = React.useState(true);
  const load = React.useCallback(async () => { setLoading(true); const response = await fetch("/api/manager/operations", { cache: "no-store" }); const data = await response.json().catch(() => null); setLoading(false); if (!response.ok) setError(data?.error || "Operations could not be loaded."); else { setRows(data.assessments); setStaff(data.staff); } }, []);
  React.useEffect(() => { void load(); }, [load]);
  async function action(id: string, value: "approve" | "reject", notes: string) { setError(""); const response = await fetch("/api/admin/assessments/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: value, notes }) }); const data = await response.json().catch(() => null); if (!response.ok) { setError(data?.error || "Review action failed."); return; } await load(); }

  return <section><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">Quality control</p><h2 className="mt-2 font-serif text-3xl">Operations review</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Verify payment, assignment, scheduling, personnel steps, property findings, customer confirmation and pricing before approving a proposal.</p></div>
    {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
    {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading operations...</p> : null}
    <div className="mt-6 space-y-4">{rows.map(row => { const employee = staff.find(item => item.id === row.assigned_staff_id); const checklist = checks(row, employee); return <article key={row.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><button type="button" onClick={() => setOpen(open === row.id ? null : row.id)} className="grid w-full gap-3 p-5 text-left md:grid-cols-[1.1fr_1fr_1fr_auto] md:items-center"><div><p className="font-semibold">{row.customers.full_name}</p><p className="text-sm text-muted-foreground">{row.properties.address_line1}, {row.properties.city}</p></div><div><p className="text-sm font-medium">{row.reference}</p><p className="text-xs uppercase tracking-wide text-muted-foreground">{row.status.replaceAll("_", " ")}</p></div><div><p className="text-sm">{employee ? `${employee.full_name} · ${employee.employee_number}` : "No employee assigned"}</p><p className="text-xs text-muted-foreground">{row.scheduled_at ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.scheduled_at)) : "Not scheduled"}</p></div><span className="text-sm font-semibold text-primary">{open === row.id ? "Close" : `${checklist.filter(item => item.ok).length}/${checklist.length} checks`}</span></button>
      {open === row.id ? <ManagerReview row={row} checklist={checklist} onAction={action} /> : null}</article>; })}</div>
    {!loading && rows.length === 0 ? <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No assessments require operational review.</div> : null}
  </section>;
}

function checks(row: Assessment, employee?: Staff) { const p = row.properties; return [
  { label: "Assessment fee paid", ok: row.payment_status === "paid" },
  { label: "Assessment employee assigned with employee ID", ok: Boolean(employee?.employee_number && ["assessment", "inspector"].includes(employee.role)) },
  { label: "Visit scheduled", ok: Boolean(row.scheduled_at) },
  { label: "All property findings recorded (zero is accepted)", ok: Boolean(p.property_type && p.verified_size_m2 !== null && p.verified_bedrooms !== null && p.verified_bathrooms !== null && p.access_method && p.air_conditioning_units !== null && p.kitchen_count !== null && p.living_space_count !== null && Array.isArray(p.outside_spaces)) },
  { label: "Services and proposal recorded", ok: Boolean(p.selected_services?.length && row.proposed_plan && row.recurring_cleaning_duration_minutes && row.proposed_recurring_cents !== null && row.additional_service_fees_cents !== null) },
  { label: "Employee notes and outcome recorded", ok: Boolean(row.assessment_notes && row.assessment_outcome) },
  { label: "Customer ID confirmation securely recorded", ok: Boolean(row.customer_identity_confirmed_at && row.customer_confirmation_reference) },
  { label: "Employee submitted the assessment", ok: Boolean(row.assessment_completed_at && ["assessment_completed", "pending_review", "approved", "rejected"].includes(row.status)) },
]; }

function ManagerReview({ row, checklist, onAction }: { row: Assessment; checklist: Array<{ label: string; ok: boolean }>; onAction: (id: string, value: "approve" | "reject", notes: string) => Promise<void> }) {
  const [notes, setNotes] = React.useState(""); const [busy, setBusy] = React.useState(false); const ready = checklist.every(item => item.ok) && ["assessment_completed", "pending_review"].includes(row.status);
  async function act(value: "approve" | "reject") { setBusy(true); await onAction(row.id, value, notes); setBusy(false); }
  return <div className="border-t border-border bg-background/70 p-5 sm:p-7"><h3 className="font-serif text-xl">Required quality checks</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{checklist.map(item => <div key={item.label} className={`flex gap-3 rounded-xl border p-3 text-sm ${item.ok ? "border-primary/30 bg-primary/5" : "border-amber-300 bg-amber-50"}`}><span aria-hidden>{item.ok ? "✓" : "!"}</span><span>{item.label}</span></div>)}</div>
    <div className="mt-6 grid gap-4 rounded-xl bg-secondary/50 p-4 sm:grid-cols-3"><div><p className="text-xs uppercase text-muted-foreground">Outcome</p><p className="mt-1 font-medium">{row.assessment_outcome?.replaceAll("_", " ") || "—"}</p></div><div><p className="text-xs uppercase text-muted-foreground">Recurring amount</p><p className="mt-1 font-medium">{row.proposed_recurring_cents === null ? "—" : money(row.proposed_recurring_cents)}</p></div><div><p className="text-xs uppercase text-muted-foreground">Extra services</p><p className="mt-1 font-medium">{row.additional_service_fees_cents === null ? "—" : money(row.additional_service_fees_cents)}</p></div></div>
    <label className="mt-5 block text-sm font-medium">Manager review note<textarea value={notes} onChange={event => setNotes(event.target.value)} className="input mt-2 min-h-24 resize-y" placeholder="Required when rejecting; recommended for any correction." /></label>
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={!ready || busy} onClick={() => void act("approve")} className={buttonVariants({ variant: "primary", size: "md" })}>Approve proposal</button><button type="button" disabled={busy || !notes.trim() || !["assessment_completed", "pending_review"].includes(row.status)} onClick={() => void act("reject")} className={buttonVariants({ variant: "outline", size: "md" })}>Reject with note</button>{!ready ? <p className="self-center text-sm text-amber-700">Approval unlocks only when all checks pass.</p> : null}</div>
  </div>;
}
function money(cents: number) { return new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(cents / 100); }
