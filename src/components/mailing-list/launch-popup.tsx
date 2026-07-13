"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import { track } from "@/lib/analytics";
import { DomeMark } from "@/components/brand/logo";
import { SubscribeForm } from "./subscribe-form";

const SUBSCRIBED_KEY = "dt_ml_subscribed";
const DISMISSED_KEY = "dt_ml_popup_dismissed_until";
const SESSION_SHOWN = "dt_ml_popup_shown";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const DELAY_MS = 10_000; // within the 8–12s window
const SCROLL_TRIGGER = 0.4; // or after 40% of the page is viewed

function safeGet(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function safeSet(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    /* storage blocked — degrade gracefully */
  }
}

export function LaunchPopup({ locale, dict }: { locale: Locale; dict: Dictionary["mailing"] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const ls = typeof window !== "undefined" ? window.localStorage : undefined;
    const ss = typeof window !== "undefined" ? window.sessionStorage : undefined;

    // Never show if already subscribed, dismissed recently, or shown this session.
    if (safeGet(ls, SUBSCRIBED_KEY) === "1") return;
    const until = Number(safeGet(ls, DISMISSED_KEY) || 0);
    if (until && Date.now() < until) return;
    if (safeGet(ss, SESSION_SHOWN) === "1") return;

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      safeSet(ss, SESSION_SHOWN, "1");
      setOpen(true);
      track("popup_shown", { source: "homepage_popup", locale });
      cleanup();
    };

    const timer = window.setTimeout(show, DELAY_MS);
    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      if (scrolled >= SCROLL_TRIGGER) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, [locale]);

  function dismiss() {
    setOpen(false);
    safeSet(typeof window !== "undefined" ? window.localStorage : undefined, DISMISSED_KEY, String(Date.now() + SEVEN_DAYS));
    track("popup_dismissed", { source: "homepage_popup" });
  }

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="false"
          aria-labelledby="dt-popup-title"
          className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-md p-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:p-0"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lift sm:p-7">
            <button
              type="button"
              onClick={dismiss}
              aria-label={dict.close}
              className="absolute end-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <DomeMark className="h-8 w-8 text-accent" />
            <h2 id="dt-popup-title" className="mt-4 font-serif text-xl text-foreground">
              {dict.popupHeadline}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{dict.popupBody}</p>

            <div className="mt-5">
              <SubscribeForm locale={locale} dict={dict} source="homepage_popup" variant="popup" />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
