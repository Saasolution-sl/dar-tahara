"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Persist a manual language choice for one year (priority 1 on future visits). */
function saveLocalePreference(target: Locale) {
  try {
    document.cookie = `NEXT_LOCALE=${target};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* cookies may be blocked — detection still falls back to browser/geo */
  }
}

export function LanguageSwitcher({
  locale,
  label = "Language",
  className,
}: {
  locale: Locale;
  label?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /** Swap the leading locale segment while preserving the rest of the path. */
  function pathFor(target: Locale) {
    const segments = (pathname || "/").split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-3 text-sm text-foreground transition-colors hover:bg-secondary"
      >
        <Globe className="h-[1.05rem] w-[1.05rem]" />
        <span className="uppercase">{locale}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-lift"
        >
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <Link
                href={pathFor(l)}
                onClick={() => {
                  if (l !== locale) {
                    saveLocalePreference(l);
                    track("language_changed", { from: locale, to: l });
                  }
                  setOpen(false);
                }}
                lang={localeMeta[l].hreflang}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary",
                  l === locale ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span>{localeMeta[l].nativeLabel}</span>
                {l === locale ? <Check className="h-4 w-4 text-accent" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
