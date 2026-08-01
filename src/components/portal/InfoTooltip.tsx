"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Small "?" button that reveals an explanatory popover on click. */
export function InfoTooltip({ text, label = "More information" }: { text: string; label?: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "ms-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-muted-foreground/40 text-[10px] font-semibold leading-none text-muted-foreground align-middle",
          "hover:border-primary hover:text-primary",
        )}
      >
        ?
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute start-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-3 text-xs leading-relaxed text-foreground shadow-lift"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
