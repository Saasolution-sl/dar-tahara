"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";

const ROOM_LABELS: Record<string, string> = {
  living_room: "Living room", master_bedroom: "Master bedroom", bedroom_2: "Bedroom 2",
  bedroom_3: "Bedroom 3", guest_room: "Guest room", kitchen: "Kitchen", office: "Office",
  hallway: "Hallway", dining_room: "Dining room", other: "Other",
};

type Appointment = {
  id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  customers: { full_name: string };
  properties: { address_line1: string; address_line2: string | null; city: string };
  ac_units: { unit_code: string; room_type: string; room_label: string | null; brand: string | null; model: string | null; location_notes: string | null; photo_path: string | null };
  ac_maintenance_entitlements: { service_window_number: number };
};

type ApiData = { employeeNumber: string; appointments: Appointment[] };

function roomName(unit: Appointment["ac_units"]): string {
  return unit.room_label || ROOM_LABELS[unit.room_type] || unit.room_type;
}

export function AcMaintenanceWorklist() {
  const [data, setData] = React.useState<ApiData | null>(null);
  const [error, setError] = React.useState("");
  const [open, setOpen] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const response = await fetch("/api/ac-employee/appointments", { cache: "no-store" });
    const result = await response.json().catch(() => null);
    if (!response.ok) setError(result?.error || "Appointments could not be loaded.");
    else setData(result);
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  return (
    <section>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">Employee {data?.employeeNumber || ""}</p>
        <h2 className="mt-2 font-serif text-3xl">My AC maintenance visits</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Only air-conditioning maintenance visits assigned to you appear here.</p>
      </div>
      {error ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {!data ? <p className="mt-8 text-sm text-muted-foreground">Loading assigned visits...</p> : null}
      {data && data.appointments.length === 0 ? <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No assigned AC maintenance visits.</div> : null}
      <div className="mt-6 space-y-4">
        {(data?.appointments || []).map((appointment) => {
          const address = [appointment.properties.address_line1, appointment.properties.address_line2, appointment.properties.city].filter(Boolean).join(", ");
          return (
            <article key={appointment.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <button type="button" onClick={() => setOpen(open === appointment.id ? null : appointment.id)} className="grid w-full gap-3 p-5 text-left sm:grid-cols-[1.2fr_1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold">{appointment.customers.full_name}</p>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{roomName(appointment.ac_units)} &middot; {appointment.ac_units.unit_code}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Maintenance {appointment.ac_maintenance_entitlements.service_window_number} of 2
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">{open === appointment.id ? "Close" : "Open"}</span>
              </button>
              {open === appointment.id ? (
                <AcMaintenanceForm appointment={appointment} onComplete={async () => { setOpen(null); await load(); }} />
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AcMaintenanceForm({ appointment, onComplete }: { appointment: Appointment; onComplete: () => Promise<void> }) {
  const unit = appointment.ac_units;
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const raw = new FormData(event.currentTarget);
    const payload = {
      appointmentId: appointment.id,
      filterCondition: raw.get("filterCondition"),
      filterCleaned: raw.get("filterCleaned") === "on",
      exteriorCleaned: raw.get("exteriorCleaned") === "on",
      drainageInspected: raw.get("drainageInspected") === "on",
      issueDetected: raw.get("issueDetected") === "on",
      issueNotes: raw.get("issueNotes"),
      employeeNotes: raw.get("employeeNotes"),
    };
    const response = await fetch("/api/ac-employee/appointments/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);
    setSubmitting(false);
    if (!response.ok) { setMessage(result?.error || "This visit could not be submitted."); return; }
    setMessage("Maintenance report submitted.");
    await onComplete();
  }

  return (
    <form onSubmit={submit} className="space-y-6 border-t border-border bg-background/70 p-5 sm:p-7">
      <div className="rounded-xl bg-secondary/60 p-4 text-sm">
        <p className="font-semibold">Air-conditioning maintenance</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p>Unit: {roomName(unit)}</p>
          <p>Internal ID: {unit.unit_code}</p>
          {unit.brand ? <p>Brand: {unit.brand}</p> : null}
          {unit.model ? <p>Model: {unit.model}</p> : null}
        </div>
        {unit.location_notes ? <p className="mt-2">Location: {unit.location_notes}</p> : null}
        {unit.photo_path ? (
          <img src={unit.photo_path} alt={`${roomName(unit)} air-conditioning unit`} className="mt-3 max-h-48 rounded-lg object-cover" />
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">
          Service: semi-annual AC maintenance cleaning. Not a licensed HVAC repair — report technical issues below rather than attempting repairs.
        </p>
      </div>

      <fieldset>
        <legend className="font-serif text-xl">Maintenance checklist</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">
            Filter condition
            <input className="input mt-2" name="filterCondition" placeholder="e.g. Lightly soiled, cleaned" />
          </label>
          <Check name="filterCleaned" label="Filter cleaned" />
          <Check name="exteriorCleaned" label="Exterior cleaned" />
          <Check name="drainageInspected" label="Visible drainage inspected" />
          <Check name="issueDetected" label="Issue or unusual noise detected" />
          <label className="block text-sm font-medium sm:col-span-2">
            Issue notes (if any)
            <textarea className="input mt-2 min-h-20 resize-y" name="issueNotes" />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Employee notes
            <textarea className="input mt-2 min-h-20 resize-y" name="employeeNotes" />
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button disabled={submitting} className={buttonVariants({ variant: "primary", size: "lg" })}>
          {submitting ? "Submitting..." : "Complete report"}
        </button>
        {message ? <p role="status" className="max-w-xl text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </form>
  );
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input className="mt-1 size-4 accent-primary" type="checkbox" name={name} />
      <span>{label}</span>
    </label>
  );
}
