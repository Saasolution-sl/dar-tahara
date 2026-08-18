"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import { localeCookieName, locales, localeMeta, type Locale } from "@/i18n/config";
import { track } from "@/lib/analytics";
import { saveSelectedAssistantLanguage } from "@/lib/assistant/client-language";
import { cn } from "@/lib/utils";

/** Persist a manual language choice for one year (priority 1 on future visits). */
function saveLocalePreference(target: Locale) {
  try {
    document.cookie = `${localeCookieName}=${target};path=/;max-age=31536000;samesite=lax`;
    saveSelectedAssistantLanguage(target);
  } catch {
    /* Cookies may be blocked; detection still falls back to the browser language. */
  }
}

export function LanguageSwitcher({
  locale,
  label = "Language",
  className,
  presentation = "dropdown",
  onNavigate,
}: {
  locale: Locale;
  label?: string;
  className?: string;
  presentation?: "dropdown" | "inline";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const optionsId = React.useId();
  const isInline = presentation === "inline";

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
    <div className={cn(isInline ? "w-full" : "relative", className)} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={optionsId}
        aria-label={
          isInline
            ? `${label}: ${localeMeta[locale].nativeLabel}`
            : `${label}: ${locale.toUpperCase()} — ${localeMeta[locale].nativeLabel}`
        }
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "items-center border border-border text-foreground transition-colors hover:bg-secondary",
          isInline
            ? "flex min-h-11 w-full gap-3 rounded-xl px-3 text-start text-base"
            : "inline-flex h-10 gap-1.5 rounded-full px-3 text-sm",
        )}
      >
        <Globe className="h-[1.05rem] w-[1.05rem] shrink-0" aria-hidden />
        {isInline ? (
          <>
            <span className="min-w-0 flex-1 font-medium">{label}</span>
            <span className="truncate text-sm text-muted-foreground">
              {localeMeta[locale].nativeLabel}
            </span>
          </>
        ) : (
          <span className="uppercase">{locale}</span>
        )}
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={optionsId}
          role="listbox"
          aria-label={label}
          className={cn(
            "mt-2 overflow-hidden rounded-2xl border border-border bg-card p-1.5",
            isInline ? "w-full" : "absolute end-0 z-50 w-48 shadow-lift",
          )}
        >
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <Link
                href={pathFor(l)}
                onClick={() => {
                  document.documentElement.lang = localeMeta[l].hreflang;
                  document.documentElement.dir = localeMeta[l].dir;
                  if (l !== locale) {
                    saveLocalePreference(l);
                    track("language_changed", { from: locale, to: l });
                  }
                  setOpen(false);
                  onNavigate?.();
                }}
                lang={localeMeta[l].hreflang}
                dir={isInline ? "ltr" : localeMeta[l].dir}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary",
                  isInline ? "flex-row-reverse text-right" : "text-start",
                  l === locale ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span dir={localeMeta[l].dir}>{localeMeta[l].nativeLabel}</span>
                {l === locale ? <Check className="h-4 w-4 text-accent" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
