"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import { localeCookieName, locales, localeMeta, type Locale } from "@/i18n/config";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Locale switcher for routes that aren't under the `/[locale]/...` segment
 * (the customer portal, the admin panel): locale lives only in the
 * NEXT_LOCALE cookie there, so switching sets the cookie and asks the router
 * to re-fetch the current route's server payload instead of navigating.
 */
export function AppLocaleSwitcher({ locale, label = "Language", className }: { locale: Locale; label?: string; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function select(target: Locale) {
    setOpen(false);
    if (target === locale) return;
    document.cookie = `${localeCookieName}=${target};path=/;max-age=31536000;samesite=lax`;
    track("language_changed", { from: locale, to: target });
    router.refresh();
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm text-foreground transition-colors hover:bg-secondary"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <ul role="listbox" className="absolute end-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-lift">
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                type="button"
                onClick={() => select(l)}
                lang={localeMeta[l].hreflang}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-secondary",
                  l === locale ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span>{localeMeta[l].nativeLabel}</span>
                {l === locale ? <Check className="h-4 w-4 text-accent" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
