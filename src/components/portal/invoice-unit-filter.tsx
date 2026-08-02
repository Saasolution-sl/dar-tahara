"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type InvoiceUnitOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  allUnitsLabel: string;
  options: InvoiceUnitOption[];
  selectedUnit: string | null;
};

export function InvoiceUnitFilter({
  label,
  allUnitsLabel,
  options,
  selectedUnit,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateUnit(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("unit", value);
    else params.delete("unit");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="mt-7 max-w-sm">
      <label htmlFor="invoice-unit-filter" className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <select
        id="invoice-unit-filter"
        value={selectedUnit || ""}
        onChange={(event) => updateUnit(event.target.value)}
        disabled={isPending}
        className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-wait disabled:opacity-70"
      >
        <option value="">{allUnitsLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
