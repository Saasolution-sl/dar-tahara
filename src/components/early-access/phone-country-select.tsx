"use client";

import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Locale } from "@/i18n/config";
import {
  searchCountries,
  findCountry,
  flagImageUrl,
  flagImageSrcSet,
  type PhoneCountry,
} from "@/lib/phone/countries";
import { cn } from "@/lib/utils";

/**
 * Flag image. Decorative: the country name is provided separately for screen
 * readers, so this carries an empty alt. A plain <img> is used rather than
 * next/image: these are 20px static PNGs on a third-party host, where the
 * optimisation round-trip would cost more than it saves. If the request is
 * blocked or fails, the element hides itself and the calling code still shows.
 */
function Flag({ iso2 }: { iso2: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagImageUrl(iso2, 20)}
      srcSet={flagImageSrcSet(iso2)}
      alt=""
      aria-hidden
      width={20}
      height={15}
      // Not lazy: these only enter the DOM when the selector is opened, so
      // deferring them just leaves a gap where the flag should be.
      loading="eager"
      decoding="async"
      className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
}

export type PhoneCountryCopy = {
  label: string;
  searchPlaceholder: string;
  noResults: string;
};

/**
 * International telephone country selector.
 *
 * Display is flag + calling code, both collapsed and in the list. The localized
 * country name is not shown, but is still carried for screen readers (a flag
 * glyph alone is not announceable) and is still searchable.
 *
 * Search matches country name, calling code and ISO code. The flag is
 * decorative: the value handed upward is the ISO alpha-2 code.
 */
export function PhoneCountrySelect({
  id,
  locale,
  value,
  onChange,
  copy,
  className,
}: {
  id: string;
  locale: Locale;
  /** ISO 3166-1 alpha-2 */
  value?: string;
  onChange: (country: PhoneCountry) => void;
  copy: PhoneCountryCopy;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const listId = `${id}-listbox`;

  const selected = findCountry(value, locale);
  const results = React.useMemo(() => searchCountries(query, locale, 10), [query, locale]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  React.useEffect(() => {
    if (open) window.requestAnimationFrame(() => inputRef.current?.focus());
    else setQuery("");
  }, [open]);

  function choose(c: PhoneCountry | undefined) {
    if (!c) return;
    onChange(c);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        // Screen readers get the full country name, not just the dial code.
        aria-label={selected ? `${copy.label}: ${selected.name} ${selected.callingCode}` : copy.label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); }
        }}
        className="inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? <Flag iso2={selected.iso2} /> : null}
          <span className="truncate" dir="ltr">{selected?.callingCode ?? "+"}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <div className="absolute z-40 mt-1 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-xl border border-border bg-background shadow-lift">
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              autoComplete="off"
              className="h-9 w-full rounded-lg border border-border bg-background ps-8 pe-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={copy.searchPlaceholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
                else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                else if (e.key === "Enter") { e.preventDefault(); choose(results[active]); }
                else if (e.key === "Escape") { e.preventDefault(); setOpen(false); buttonRef.current?.focus(); }
              }}
            />
          </div>

          <ul id={listId} role="listbox" aria-label={copy.label} className="max-h-64 overflow-auto p-1">
            {results.map((c, i) => (
              <li
                key={c.iso2}
                role="option"
                aria-selected={c.iso2 === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(c)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                  active === i ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                {/* Visible: flag + calling code only. The country name is kept
                    for screen readers, which cannot interpret a flag image. */}
                <span className="sr-only">{c.name}</span>
                <Flag iso2={c.iso2} />
                <span aria-hidden className="text-foreground" dir="ltr">{c.callingCode}</span>
              </li>
            ))}
            {results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">{copy.noResults}</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
