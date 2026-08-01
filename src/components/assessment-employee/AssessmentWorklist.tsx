"use client";

import * as React from "react";
import {
  ASSESSMENT_ACCESS_METHODS,
  ASSESSMENT_OUTCOMES,
  ASSESSMENT_PROPERTY_TYPES,
  ASSESSMENT_SERVICES,
  CUSTOMER_ID_TYPES,
} from "@/lib/assessment-field-submission";
import { buttonVariants } from "@/components/ui/button";

type Assessment = {
  id: string;
  reference: string;
  status: string;
  scheduled_at: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  requested_frequency: string;
  customers: { full_name: string; email: string; phone: string };
  properties: {
    address_line1: string;
    address_line2: string | null;
    city: string;
    postal_code: string;
    declared_size_m2: number;
    declared_bedrooms: number;
    declared_bathrooms: number;
    pets: boolean;
    pet_details: string | null;
    smoking: boolean;
    declared_condition: string | null;
    access_notes: string | null;
  };
};

type ApiData = { employeeNumber: string; assessments: Assessment[] };
type Filter = "today" | "week" | "all";

const labels: Record<string, string> = {
  apartment: "Apartment", house: "House", villa: "Villa", riad: "Riad", office: "Office", other: "Other",
  customer_present: "Customer present", representative_present: "Representative present", smart_lock: "Smart lock",
  physical_key: "Physical key", concierge: "Concierge", eligible: "Eligible", requires_adjustment: "Requires adjustment",
  not_eligible: "Not eligible", national_id: "National ID", passport: "Passport", residence_permit: "Residence permit",
  company_representative_id: "Company representative ID", maintenance_cleaning: "Maintenance cleaning",
  deep_cleaning: "Deep cleaning", window_cleaning: "Window cleaning", laundry: "Laundry", linen_change: "Linen change",
  terrace_cleaning: "Terrace cleaning", post_construction_cleaning: "Post-construction cleaning",
  cleaning_supplies: "Cleaning supplies", toilet_paper_restocking: "Toilet paper restocking",
  smart_lock_access: "Smart-lock access", physical_key_handling: "Physical-key handling",
};

export function AssessmentWorklist() {
  const [data, setData] = React.useState<ApiData | null>(null);
  const [error, setError] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("week");
  const [open, setOpen] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const response = await fetch("/api/assessment-employee/assessments", { cache: "no-store" });
    const result = await response.json().catch(() => null);
    if (!response.ok) setError(result?.error || "Assessments could not be loaded.");
    else setData(result);
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  const visible = (data?.assessments || []).filter((assessment) => {
    if (filter === "all") return true;
    const value = assessment.scheduled_at || assessment.preferred_date;
    if (!value) return false;
    const date = new Date(value);
    const now = new Date();
    if (filter === "today") return date.toDateString() === now.toDateString();
    const end = new Date(now); end.setDate(end.getDate() + 7);
    return date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && date < end;
  });

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">Employee {data?.employeeNumber || ""}</p>
          <h2 className="mt-2 font-serif text-3xl">My assessments</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Only assessments assigned to you appear here. Complete every field with the customer before submitting it for manager review.</p>
        </div>
        <div className="flex rounded-xl border border-border bg-card p-1">
          {(["today", "week", "all"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-sm capitalize ${filter === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{value}</button>)}
        </div>
      </div>
      {error ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {!data ? <p className="mt-8 text-sm text-muted-foreground">Loading assigned assessments...</p> : null}
      {data && visible.length === 0 ? <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No assigned assessments for this period.</div> : null}
      <div className="mt-6 space-y-4">
        {visible.map((assessment) => {
          const scheduled = assessment.scheduled_at || assessment.preferred_date;
          const address = [assessment.properties.address_line1, assessment.properties.address_line2, assessment.properties.city].filter(Boolean).join(", ");
          return <article key={assessment.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <button type="button" onClick={() => setOpen(open === assessment.id ? null : assessment.id)} className="grid w-full gap-3 p-5 text-left sm:grid-cols-[1.2fr_1fr_auto] sm:items-center">
              <div><p className="font-semibold">{assessment.customers.full_name}</p><p className="mt-1 break-words text-sm text-muted-foreground">{address}</p></div>
              <div><p className="text-sm font-medium">{scheduled ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: assessment.scheduled_at ? "short" : undefined }).format(new Date(scheduled)) : "Not scheduled"}</p><p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{assessment.reference}</p></div>
              <span className="text-sm font-semibold text-primary">{open === assessment.id ? "Close" : "Open form"}</span>
            </button>
            {open === assessment.id ? <AssessmentForm assessment={assessment} onComplete={async () => { setOpen(null); await load(); }} /> : null}
          </article>;
        })}
      </div>
    </section>
  );
}

function AssessmentForm({ assessment, onComplete }: { assessment: Assessment; onComplete: () => Promise<void> }) {
  const property = assessment.properties;
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setMessage("");
    const raw = new FormData(event.currentTarget);
    const evidence = raw.get("identityEvidence");
    const payload = {
      propertyType: raw.get("propertyType"), verifiedSizeM2: raw.get("verifiedSizeM2"), verifiedBedrooms: raw.get("verifiedBedrooms"),
      verifiedBathrooms: raw.get("verifiedBathrooms"), accessMethod: raw.get("accessMethod"), airConditioningUnits: raw.get("airConditioningUnits"),
      kitchenCount: raw.get("kitchenCount"), livingSpaceCount: raw.get("livingSpaceCount"), outsideSpaces: raw.getAll("outsideSpaces"),
      verifiedCondition: raw.get("verifiedCondition"), services: raw.getAll("services"), recurringCleaningDurationMinutes: raw.get("recurringCleaningDurationMinutes"),
      proposedPlan: raw.get("proposedPlan"), proposedRecurringCents: Math.round(Number(raw.get("proposedRecurringEuros")) * 100),
      additionalServiceFeesCents: Math.round(Number(raw.get("additionalServiceFeesEuros")) * 100), initialDeepCleanRequired: raw.get("initialDeepCleanRequired") === "on",
      propertyConditionNotes: raw.get("propertyConditionNotes"), customerCleaningInstructions: raw.get("customerCleaningInstructions"), assessmentNotes: raw.get("assessmentNotes"),
      assessmentOutcome: raw.get("assessmentOutcome"), customerConfirmed: raw.get("customerConfirmed") === "on", customerConfirmationName: raw.get("customerConfirmationName"), customerIdType: raw.get("customerIdType"),
    };
    const request = new FormData(); request.set("assessmentId", assessment.id); request.set("payload", JSON.stringify(payload));
    if (evidence instanceof File) request.set("identityEvidence", evidence);
    const response = await fetch("/api/assessment-employee/assessments/complete", { method: "POST", body: request });
    const result = await response.json().catch(() => null);
    setSubmitting(false);
    if (!response.ok) { setMessage(result?.error || "Assessment could not be submitted."); return; }
    setMessage(`Submitted for manager review. Confirmation ${result.confirmationReference}.`);
    await onComplete();
  }

  return <form onSubmit={submit} className="space-y-8 border-t border-border bg-background/70 p-5 sm:p-7">
    <div className="rounded-xl bg-secondary/60 p-4 text-sm"><p className="font-semibold">Customer and declared details</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><p>{assessment.customers.email}</p><p>{assessment.customers.phone}</p><p>Declared: {property.declared_size_m2} m², {property.declared_bedrooms} bedrooms, {property.declared_bathrooms} bathrooms</p><p>Pets: {property.pets ? property.pet_details || "Yes" : "No"}; smoking: {property.smoking ? "Yes" : "No"}</p></div>{property.access_notes ? <p className="mt-2">Access notes: {property.access_notes}</p> : null}</div>
    <FieldSection title="1. Property findings" intro="Enter a value in every field. Use 0 where none are present.">
      <SelectField name="propertyType" label="Property type" options={ASSESSMENT_PROPERTY_TYPES} />
      <NumberField name="verifiedSizeM2" label="Verified size (m²)" min={20} defaultValue={property.declared_size_m2} />
      <NumberField name="verifiedBedrooms" label="Bedrooms" min={0} defaultValue={property.declared_bedrooms} />
      <NumberField name="verifiedBathrooms" label="Bathrooms" min={0} defaultValue={property.declared_bathrooms} />
      <SelectField name="accessMethod" label="Access method" options={ASSESSMENT_ACCESS_METHODS} />
      <NumberField name="airConditioningUnits" label="Air-conditioning units" min={0} defaultValue={0} />
      <NumberField name="kitchenCount" label="Kitchens" min={0} defaultValue={0} />
      <NumberField name="livingSpaceCount" label="Living spaces" min={0} defaultValue={0} />
      <TextField name="verifiedCondition" label="Verified condition" placeholder="For example: good, requires deep clean" />
      <fieldset className="sm:col-span-2"><legend className="text-sm font-medium">Outside spaces (select all, or None)</legend><div className="mt-2 flex flex-wrap gap-3">{["none", "balcony", "terrace", "garden", "courtyard", "roof"].map(value => <Check key={value} name="outsideSpaces" value={value} label={value} />)}</div></fieldset>
    </FieldSection>
    <FieldSection title="2. Services and proposal" intro="Confirm the recurring service and every extra-cost service separately.">
      <fieldset className="sm:col-span-2"><legend className="text-sm font-medium">Confirmed services</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{ASSESSMENT_SERVICES.map(value => <Check key={value} name="services" value={value} label={labels[value]} />)}</div></fieldset>
      <NumberField name="recurringCleaningDurationMinutes" label="Recurring visit duration (minutes)" min={15} defaultValue={120} />
      <NumberField name="proposedRecurringEuros" label="Recurring price (€)" min={0} step="0.01" defaultValue={0} />
      <NumberField name="additionalServiceFeesEuros" label="Additional services total (€)" min={0} step="0.01" defaultValue={0} />
      <SelectField name="assessmentOutcome" label="Assessment outcome" options={ASSESSMENT_OUTCOMES} />
      <Check name="initialDeepCleanRequired" label="Initial deep clean required" />
      <TextareaField name="proposedPlan" label="Proposed service plan" />
      <TextareaField name="propertyConditionNotes" label="Property condition notes" />
      <TextareaField name="customerCleaningInstructions" label="Customer instructions" />
      <TextareaField name="assessmentNotes" label="Internal assessment notes" />
    </FieldSection>
    <FieldSection title="3. Customer confirmation" intro="Review all findings and costs with the customer. Photograph the presented ID; the image remains private and is deleted after 90 days.">
      <TextField name="customerConfirmationName" label="Customer / representative full name" />
      <SelectField name="customerIdType" label="Presented ID type" options={CUSTOMER_ID_TYPES} />
      <label className="block text-sm font-medium sm:col-span-2">Photo of presented ID <span className="text-accent">*</span><input name="identityEvidence" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" required className="mt-2 block w-full rounded-xl border border-border bg-card p-3 text-sm" /><span className="mt-1 block text-xs font-normal text-muted-foreground">JPEG, PNG or WebP, maximum 10 MB.</span></label>
      <div className="sm:col-span-2"><Check name="customerConfirmed" label="The customer and I reviewed all property findings, services and prices, and the customer confirmed them." required /></div>
    </FieldSection>
    <div className="flex flex-wrap items-center gap-4"><button disabled={submitting} className={buttonVariants({ variant: "primary", size: "lg" })}>{submitting ? "Submitting securely..." : "Confirm and submit for manager review"}</button>{message ? <p role="status" className="max-w-xl text-sm text-muted-foreground">{message}</p> : null}</div>
  </form>;
}

function FieldSection({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) { return <fieldset><legend className="font-serif text-xl">{title}</legend><p className="mt-1 text-sm text-muted-foreground">{intro}</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div></fieldset>; }
function TextField({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) { return <label className="block text-sm font-medium">{label} <span className="text-accent">*</span><input className="input mt-2" name={name} placeholder={placeholder} required /></label>; }
function NumberField({ name, label, min, defaultValue, step = "1" }: { name: string; label: string; min: number; defaultValue: number; step?: string }) { return <label className="block text-sm font-medium">{label} <span className="text-accent">*</span><input className="input mt-2" name={name} type="number" min={min} step={step} defaultValue={defaultValue} required /></label>; }
function SelectField({ name, label, options }: { name: string; label: string; options: readonly string[] }) { return <label className="block text-sm font-medium">{label} <span className="text-accent">*</span><select className="input mt-2" name={name} defaultValue="" required><option value="" disabled>Select...</option>{options.map(value => <option key={value} value={value}>{labels[value] || value}</option>)}</select></label>; }
function TextareaField({ name, label }: { name: string; label: string }) { return <label className="block text-sm font-medium sm:col-span-2">{label} <span className="text-accent">*</span><textarea className="input mt-2 min-h-28 resize-y" name={name} required /></label>; }
function Check({ name, label, value, required = false }: { name: string; label: string; value?: string; required?: boolean }) { return <label className="flex items-start gap-2 text-sm"><input className="mt-1 size-4 accent-primary" type="checkbox" name={name} value={value} required={required} /><span className="capitalize">{label}</span></label>; }
