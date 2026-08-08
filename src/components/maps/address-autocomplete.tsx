"use client";

import * as React from "react";
import { Search, Loader2, PencilLine } from "lucide-react";
import { loadGoogleMaps, mapsEnabled, PLACE_FIELDS } from "@/lib/maps/config";
import { googlePlaceToPlaceLike, type GooglePlaceDetail } from "@/lib/maps/google-place";
import type { PlaceLike } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

export type AddressAutocompleteCopy = {
  searchPlaceholder: string;
  searching: string;
  noResults: string;
  manualLink: string;
  unavailable: string;
};

type GPlace = GooglePlaceDetail & {
  fetchFields: (request: { fields: string[] }) => Promise<void>;
};
type GPlacePrediction = {
  placeId?: string;
  text: { toString: () => string };
  toPlace: () => GPlace;
};
type GPlacesLibrary = {
  AutocompleteSessionToken: new () => object;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: Record<string, unknown>) => Promise<{
      suggestions: Array<{ placePrediction?: GPlacePrediction | null }>;
    }>;
  };
};
type GMaps = {
  importLibrary: (name: "places") => Promise<GPlacesLibrary>;
};
type Prediction = {
  placeId: string;
  primary: string;
  secondary: string;
  prediction: GPlacePrediction;
};

/* Minimal shapes for the Google objects we touch: avoids pulling in the full
 * @types/google.maps dependency for four call sites. */

function gmaps(): GMaps | null {
  const w = window as unknown as { google?: { maps?: GMaps } };
  return w.google?.maps ?? null;
}

/**
 * Google Places address search.
 *
 * Cost note: predictions and the final fetchFields call share one session
 * token, grouping the query and selection under Google's session pricing. The
 * token is discarded after each selection; reusing it would invalidate that
 * pricing behavior.
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
  /** ISO-3166 alpha-2, lowercased: restricts results (e.g. "ma"). */
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
  const libraryRef = React.useRef<GPlacesLibrary | null>(null);
  const tokenRef = React.useRef<object | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = React.useRef(0);
  const listId = `${id}-listbox`;

  // Load the script lazily: only when this field is actually rendered.
  React.useEffect(() => {
    if (!mapsEnabled()) return;
    let alive = true;
    loadGoogleMaps()
      .then(async () => {
        if (!alive) return;
        const m = gmaps();
        if (!m) { setFailed(true); return; }
        libraryRef.current = await m.importLibrary("places");
        if (!alive) return;
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
    const library = libraryRef.current;
    if (!library) return null;
    if (!tokenRef.current) tokenRef.current = new library.AutocompleteSessionToken();
    return tokenRef.current;
  }

  async function search(q: string) {
    const library = libraryRef.current;
    if (!library || q.trim().length < 3) { setItems([]); return; }
    const requestId = ++requestIdRef.current;
    setBusy(true);
    const req: Record<string, unknown> = {
      input: q,
      sessionToken: ensureToken(),
    };
    if (countryRestriction) req.includedRegionCodes = [countryRestriction.toLowerCase()];

    try {
      const { suggestions } = await library.AutocompleteSuggestion.fetchAutocompleteSuggestions(req);
      if (requestId !== requestIdRef.current) return;
      setBusy(false);
      setItems(
        suggestions.flatMap(({ placePrediction }) => {
          if (!placePrediction) return [];
          const label = placePrediction.text.toString();
          return [{
            placeId: placePrediction.placeId ?? label,
            primary: label,
            secondary: "",
            prediction: placePrediction,
          }];
        }).slice(0, 6),
      );
      setActive(0);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setBusy(false);
      setItems([]);
      setFailed(true);
    }
  }

  function onInput(v: string) {
    onChange(v);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Debounced: one request per pause, not per keystroke.
    debounceRef.current = setTimeout(() => { void search(v); }, 250);
  }

  async function choose(index: number) {
    const item = items[index];
    if (!item) return;
    setBusy(true);
    try {
      const place = item.prediction.toPlace();
      await place.fetchFields({ fields: [...PLACE_FIELDS] });
      setOpen(false);
      onSelect(googlePlaceToPlaceLike(place));
    } catch {
      setFailed(true);
      setItems([]);
    } finally {
      setBusy(false);
      // fetchFields concludes the billing session. The next lookup gets a new token.
      tokenRef.current = null;
    }
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
            else if (e.key === "Enter") { e.preventDefault(); void choose(active); }
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
      <span className="sr-only" role="status" aria-live="polite">
        {busy ? copy.searching : ""}
      </span>

      {/* Manual entry is always offered: never a dead end. */}
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
              onClick={() => { void choose(i); }}
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
          <li
            role="presentation"
            aria-hidden
            className="border-t border-border px-3 py-1.5 text-end text-[0.65rem] font-medium text-muted-foreground"
          >
            Powered by Google
          </li>
        </ul>
      ) : null}

      {open && usable && !busy && value.trim().length >= 3 && items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{copy.noResults}</p>
      ) : null}
    </div>
  );
}
