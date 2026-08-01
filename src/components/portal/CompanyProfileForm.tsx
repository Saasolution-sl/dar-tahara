"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import { buttonVariants } from "@/components/ui/button";

export type EditableCompanyProfile = {
  legalName: string;
  tradeName: string;
  chamberOfCommerceNumber: string;
  taxIdentificationNumber: string;
  registrationCountry: string;
  registeredAddressLine1: string;
  registeredAddressLine2: string;
  registeredCity: string;
  registeredPostalCode: string;
  billingEmail: string;
  billingPhone: string;
  representativeName: string;
  representativeTitle: string;
  website: string;
  employeeCount: string;
};

const english = {
  title: "Company information",
  intro: "All legal and billing information is required before a company account is complete.",
  legalName: "Registered legal name",
  tradeName: "Trading name (optional)",
  chamber: "Chamber of Commerce ID",
  taxId: "Tax identification number",
  country: "Registration country",
  address1: "Registered address",
  address2: "Suite, floor or unit (optional)",
  city: "Registered city",
  postal: "Postal code",
  billingEmail: "Billing email",
  billingPhone: "Billing phone",
  representative: "Authorized representative",
  representativeTitle: "Representative’s title",
  website: "Website (optional)",
  employees: "Number of employees (optional)",
  save: "Save company information",
  saving: "Saving...",
  saved: "Company information saved.",
  error: "Company information could not be saved. Check every required field.",
};

const dutch = {
  ...english,
  title: "Bedrijfsgegevens",
  intro: "Alle wettelijke en facturatiegegevens zijn verplicht voordat een bedrijfsaccount volledig is.",
  legalName: "Statutaire bedrijfsnaam",
  tradeName: "Handelsnaam (optioneel)",
  chamber: "Kamer van Koophandel-ID",
  taxId: "Fiscaal identificatienummer",
  country: "Registratieland",
  address1: "Vestigingsadres",
  address2: "Unit of verdieping (optioneel)",
  city: "Vestigingsplaats",
  postal: "Postcode",
  billingEmail: "Facturatie-e-mail",
  billingPhone: "Facturatietelefoon",
  representative: "Bevoegde vertegenwoordiger",
  representativeTitle: "Functie van vertegenwoordiger",
  website: "Website (optioneel)",
  employees: "Aantal werknemers (optioneel)",
  save: "Bedrijfsgegevens opslaan",
  saving: "Opslaan...",
  saved: "Bedrijfsgegevens opgeslagen.",
  error: "De bedrijfsgegevens konden niet worden opgeslagen. Controleer alle verplichte velden.",
};

export function CompanyProfileForm({ locale, initial }: { locale: Locale; initial: EditableCompanyProfile }) {
  const copy = locale === "nl" ? dutch : english;
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const response = await fetch("/api/account/company-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    setState(response.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h3 className="font-serif text-lg">{copy.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{copy.intro}</p>
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <CompanyField label={copy.legalName} name="legalName" value={initial.legalName} required />
        <CompanyField label={copy.tradeName} name="tradeName" value={initial.tradeName} />
        <CompanyField label={copy.chamber} name="chamberOfCommerceNumber" value={initial.chamberOfCommerceNumber} required />
        <CompanyField label={copy.taxId} name="taxIdentificationNumber" value={initial.taxIdentificationNumber} required />
        <CompanyField label={copy.country} name="registrationCountry" value={initial.registrationCountry} required maxLength={2} />
        <CompanyField label={copy.city} name="registeredCity" value={initial.registeredCity} required />
        <CompanyField label={copy.address1} name="registeredAddressLine1" value={initial.registeredAddressLine1} required className="sm:col-span-2" />
        <CompanyField label={copy.address2} name="registeredAddressLine2" value={initial.registeredAddressLine2} />
        <CompanyField label={copy.postal} name="registeredPostalCode" value={initial.registeredPostalCode} required />
        <CompanyField label={copy.billingEmail} name="billingEmail" value={initial.billingEmail} required type="email" />
        <CompanyField label={copy.billingPhone} name="billingPhone" value={initial.billingPhone} required type="tel" />
        <CompanyField label={copy.representative} name="representativeName" value={initial.representativeName} required />
        <CompanyField label={copy.representativeTitle} name="representativeTitle" value={initial.representativeTitle} required />
        <CompanyField label={copy.website} name="website" value={initial.website} type="url" />
        <CompanyField label={copy.employees} name="employeeCount" value={initial.employeeCount} type="number" min={1} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={state === "saving"} className={buttonVariants({ variant: "primary", size: "md" })}>
          {state === "saving" ? copy.saving : copy.save}
        </button>
        {state === "saved" ? <p role="status" className="text-sm text-primary">{copy.saved}</p> : null}
        {state === "error" ? <p role="alert" className="text-sm text-red-600">{copy.error}</p> : null}
      </div>
    </form>
  );
}

function CompanyField({ label, name, value, required = false, className, type = "text", maxLength = 200, min }: { label: string; name: string; value: string; required?: boolean; className?: string; type?: string; maxLength?: number; min?: number }) {
  return (
    <label className={className ? `block text-sm font-medium ${className}` : "block text-sm font-medium"}>
      {label}{required ? <span className="text-accent"> *</span> : null}
      <input className="input mt-2" name={name} defaultValue={value} required={required} type={type} maxLength={type === "number" ? undefined : maxLength} min={min} />
    </label>
  );
}
