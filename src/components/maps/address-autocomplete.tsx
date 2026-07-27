"use client";

import * as React from "react";
import { Search, Loader2, PencilLine } from "lucide-react";
import { loadGoogleMaps, mapsEnabled, PLACE_FIELDS } from "@/lib/maps/config";
import type { PlaceLike } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

export type AddressAutocompleteCopy = {
  searchPlaceholder: string;
  searching: string;
  noResults: string;
  manualLink: string;
  unavailable: string;
};

type Prediction = { placeId: string; primary: string; secondary: string };

/* Minimal shapes for the Google objects we touch — avoids pulling in the full
 * @types/google.maps dependency for four call sites. */
type GAutocompleteService = {
  getPlacePredictions: (
    req: Record<string, unknown>,
    cb: (res: unknown[] | null, status: string) => void,
  ) => void;
};
type GPlacesService = {
  getDetails: (
    req: Record<string, unknown>,
    cb: (place: PlaceLike | null, status: string) => void,
  ) => void;
};
type GMaps = {
  places: {
    AutocompleteService: new () => GAutocompleteService;
    PlacesService: new (el: HTMLElement) => GPlacesService;
    AutocompleteSessionToken: new () => object;
    PlacesServiceStatus: { OK: string };
  };
};

function gmaps(): GMaps | null {
  const w = window as unknown as { google?: { maps?: GMaps } };
  return w.google?.maps ?? null;
}

/**
 * Google Places address search.
 *
 * Cost note: predictions and the final getDetails share ONE session token, so
 * the whole lookup bills as a single (free) Autocomplete session rather than
 * one charged request per keystroke. The token is discarded after each
 * selection — reusing it would silently re-bill.
 *
 * Availability note: if the key is missing, the script is blocked or Places
 * errors, this degrades to a plain input and surfaces the manual-entry link.
 * Google is never required to complete the form.
 */
export function AddressAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  onManual,
  copy,
  countryRestriction,
  disabled,
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (place: PlaceLike) => void;
  onManual: () => void;
  copy: AddressAutocompleteCopy;
  /** ISO-3166 alpha-2, lowercased — restricts results (e.g. "ma"). */
  countryRestriction?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(!mapsEnabled());
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Prediction[]>([]);
  const [active, setActive] = React.useState(0);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const serviceRef = React.useRef<GAutocompleteService | null>(null);
  const placesRef = React.useRef<GPlacesService | null>(null);
  const tokenRef = React.useRef<object | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = `${id}-listbox`;

  // Load the script lazily — only when this field is actually rendered.
  React.useEffect(() => {
    if (!mapsEnabled()) return;
    let alive = true;
    loadGoogleMaps()
      .then(() => {
        if (!alive) return;
        const m = gmaps();
        if (!m) { setFailed(true); return; }
        serviceRef.current = new m.places.AutocompleteService();
        // PlacesService needs a DOM node; a detached div is fine and avoids
        // requiring a visible map just to fetch place details.
        placesRef.current = new m.places.PlacesService(document.createElement("div"));
        setReady(true);
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  React.useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  function ensureToken() {
    const m = gmaps();
    if (!m) return null;
    if (!tokenRef.current) tokenRef.current = new m.places.AutocompleteSessionToken();
    return tokenRef.current;
  }

  function search(q: string) {
    const svc = serviceRef.current;
    const m = gmaps();
    if (!svc || !m || q.trim().length < 3) { setItems([]); return; }
    setBusy(true);
    const req: Record<string, unknown> = {
      input: q,
      sessionToken: ensureToken(),
    };
    if (countryRestriction) req.componentRestrictions = { country: countryRestriction };

    svc.getPlacePredictions(req, (res, status) => {
      setBusy(false);
      if (status !== m.places.PlacesServiceStatus.OK || !res) { setItems([]); return; }
      setItems(
        res.slice(0, 6).map((r) => {
          const p = r as {
            place_id: string;
            structured_formatting?: { main_text?: string; secondary_text?: string };
            description?: string;
          };
          return {
            placeId: p.place_id,
            primary: p.structured_formatting?.main_text ?? p.description ?? "",
            secondary: p.structured_formatting?.secondary_text ?? "",
          };
        }),
      );
      setActive(0);
    });
  }

  function onInput(v: string) {
    onChange(v);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Debounced: one request per pause, not per keystroke.
    debounceRef.current = setTimeout(() => search(v), 250);
  }

  function choose(index: number) {
    const item = items[index];
    const svc = placesRef.current;
    const m = gmaps();
    if (!item || !svc || !m) return;
    setBusy(true);
    svc.getDetails(
      { placeId: item.placeId, fields: [...PLACE_FIELDS], sessionToken: ensureToken() },
      (place, status) => {
        setBusy(false);
        setOpen(false);
        // The session ends with getDetails — a new lookup must start a new one.
        tokenRef.current = null;
        if (status === m.places.PlacesServiceStatus.OK && place) onSelect(place);
      },
    );
  }

  const usable = ready && !failed && !disabled;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          id={id}
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-busy={busy}
          autoComplete="off"
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-border bg-background ps-9 pe-9 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          placeholder={failed ? copy.unavailable : copy.searchPlaceholder}
          value={value}
          onChange={(e) => (usable ? onInput(e.target.value) : onChange(e.target.value))}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!items.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); choose(active); }
            else if (e.key === "Escape") { setOpen(false); }
          }}
        />
        {busy ? (
          <Loader2
            className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>

      {/* Manual entry is always offered — never a dead end. */}
      <button
        type="button"
        onClick={onManual}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        <PencilLine className="h-3.5 w-3.5" aria-hidden />
        {copy.manualLink}
      </button>

      {open && usable && items.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-background p-1 shadow-lift"
        >
          {items.map((it, i) => (
            <li
              key={it.placeId}
              role="option"
              aria-selected={active === i}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(i)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-2 text-sm",
                active === i ? "bg-secondary" : "hover:bg-secondary/60",
              )}
            >
              <span className="block truncate text-foreground">{it.primary}</span>
              {it.secondary ? (
                <span className="block truncate text-xs text-muted-foreground">{it.secondary}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {open && usable && !busy && value.trim().length >= 3 && items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{copy.noResults}</p>
      ) : null}
    </div>
  );
}
