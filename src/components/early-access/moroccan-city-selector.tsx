"use client";

import * as React from "react";
import { Search, MapPin, Info } from "lucide-react";
import type { Locale } from "@/i18n/config";
import {
  searchCities,
  findCity,
  displayCityName,
  OTHER_CITY_ID,
  type ServiceAreaStatus,
} from "@/lib/geo/moroccan-cities";
import { cn } from "@/lib/utils";
import { FieldShell, TextInput } from "./fields";

// NB: this component is meant to be wrapped by an EXTERNAL <FieldShell>, the
// same way AddressAutocomplete is used elsewhere in the form. It must NOT
// render its own internal FieldShell around the search input: FieldShell
// clones its direct child and stamps the field's `id` onto it, and here the
// direct child would be the icon-positioning wrapper <div>, not the <input> —
// producing two DOM nodes sharing the same id (invalid HTML, and it breaks the
// label's htmlFor association, since the label ends up pointing at the div).

export type CitySelectorCopy = {
  searchPlaceholder: string;
  notListed: string;
  manualLabel: string;
  manualPlaceholder: string;
  status: Record<Exclude<ServiceAreaStatus, "active">, string>;
};

export type CitySelection = {
  cityId?: string;          // canonical id, or OTHER_CITY_ID, or undefined
  cityName?: string;        // resolved canonical/localized display name for storage
  regionName?: string;      // canonical region — fills the "Province or region" box
  manualName?: string;      // set only for the "not listed" path
};

/**
 * Standardized Moroccan city selector: a searchable combobox over the canonical
 * taxonomy (matches name, alias and region in any language), plus a "my city is
 * not listed" path that captures an unverified manual name. A non-active service
 * area is surfaced as a calm note and NEVER blocks the customer.
 */
export function MoroccanCitySelector({
  id,
  locale,
  value,
  manualName,
  onChange,
  copy,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  id: string;
  locale: Locale;
  value?: string;
  manualName?: string;
  onChange: (sel: CitySelection) => void;
  copy: CitySelectorCopy;
  /** Injected by the wrapping <FieldShell> via cloneElement — forwarded to the real input. */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listId = `${id}-listbox`;

  const selectedCity = findCity(value);
  const isOther = value === OTHER_CITY_ID;

  // Results = matching canonical cities, with the "not listed" escape hatch last.
  const cities = React.useMemo(() => searchCities(query, locale), [query, locale]);
  const rows: Array<{ kind: "city"; id: string } | { kind: "other" }> = [
    ...cities.map((c) => ({ kind: "city" as const, id: c.id })),
    { kind: "other" as const },
  ];

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function pickCity(cityId: string) {
    const city = findCity(cityId);
    onChange({
      cityId,
      cityName: city ? displayCityName(city, locale) : undefined,
      // The province belongs in the "Province or region" field, not in the
      // dropdown label — selecting a city fills that box for the customer.
      regionName: city?.regionName,
    });
    setOpen(false);
    setQuery("");
  }
  function pickOther() {
    onChange({ cityId: OTHER_CITY_ID, cityName: manualName, manualName });
    setOpen(false);
    setQuery("");
  }
  function choose(index: number) {
    const row = rows[index];
    if (!row) return;
    row.kind === "other" ? pickOther() : pickCity(row.id);
  }

  // What the collapsed input shows when not actively searching. City only — the
  // province is shown in its own field below.
  const collapsedLabel = isOther
    ? copy.notListed
    : selectedCity
      ? displayCityName(selectedCity, locale)
      : "";

  const status: ServiceAreaStatus | null = selectedCity ? selectedCity.serviceAreaStatus : null;

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={copy.searchPlaceholder}
          value={open ? query : collapsedLabel}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, rows.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); choose(active); }
            else if (e.key === "Escape") { setOpen(false); }
          }}
        />
      </div>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-background p-1 shadow-lift"
        >
          {cities.map((c, i) => (
            <li
              key={c.id}
              role="option"
              aria-selected={active === i}
              onMouseEnter={() => setActive(i)}
              onClick={() => pickCity(c.id)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm",
                active === i ? "bg-secondary" : "hover:bg-secondary/60",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="truncate text-foreground">{c.displayName}</span>
              </span>
              {c.serviceAreaStatus !== "active" ? (
                <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[0.65rem] font-medium text-accent">
                  {copy.status[c.serviceAreaStatus]}
                </span>
              ) : null}
            </li>
          ))}
          <li
            role="option"
            aria-selected={active === cities.length}
            onMouseEnter={() => setActive(cities.length)}
            onClick={pickOther}
            className={cn(
              "mt-1 cursor-pointer rounded-lg border-t border-border px-3 py-2 text-sm text-primary",
              active === cities.length ? "bg-secondary" : "hover:bg-secondary/60",
            )}
          >
            {copy.notListed}
          </li>
        </ul>
      ) : null}

      {status && status !== "active" ? (
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-accent/[0.06] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
          {copy.status[status]}
        </p>
      ) : null}

      {isOther ? (
        <div className="mt-3">
          <FieldShell id={`${id}-manual`} label={copy.manualLabel} required>
            <TextInput
              value={manualName ?? ""}
              placeholder={copy.manualPlaceholder}
              maxLength={120}
              autoComplete="address-level2"
              onChange={(e) => onChange({ cityId: OTHER_CITY_ID, cityName: e.target.value, manualName: e.target.value })}
            />
          </FieldShell>
        </div>
      ) : null}
    </div>
  );
}
