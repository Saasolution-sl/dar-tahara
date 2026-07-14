"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getConsent, setConsent, measurementId, CONSENT_EVENT, type ConsentValue } from "@/lib/consent";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Cookie/analytics consent banner. Shown only when analytics is configured and
 * the visitor has not yet chosen. Declining is a first-class option — the site
 * is fully functional either way and nothing loads until "Accept".
 */
export function ConsentBanner({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["consent"];
}) {
  const reduce = useReducedMotion();
  const [consent, setConsentState] = React.useState<ConsentValue | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const configured = Boolean(measurementId());

  React.useEffect(() => {
    setMounted(true);
    setConsentState(getConsent());
    const onChange = (e: Event) => setConsentState((e as CustomEvent<ConsentValue>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  const open = mounted && configured && consent === null;

  // Rendered/removed outright (no exit animation) so the fixed-position banner
  // can never linger as an invisible overlay intercepting clicks.
  if (!open) return null;

  return (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label={dict.aria}
          className="fixed inset-x-0 bottom-0 z-[90] mx-auto w-full max-w-3xl p-3 sm:p-5"
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/95 p-5 shadow-lift backdrop-blur-md sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <Cookie className="hidden h-6 w-6 shrink-0 text-accent sm:block" aria-hidden />
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
              {dict.message}{" "}
              <Link
                href={`/${locale}/privacy`}
                className="underline decoration-accent/50 underline-offset-2 transition-colors hover:text-accent"
              >
                {dict.privacy}
              </Link>
            </p>
            <div className="flex shrink-0 gap-2.5">
              <button
                type="button"
                onClick={() => setConsent("denied")}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 sm:flex-none")}
              >
                {dict.decline}
              </button>
              <button
                type="button"
                onClick={() => setConsent("granted")}
                className={cn(buttonVariants({ variant: "primary", size: "sm" }), "flex-1 sm:flex-none")}
              >
                {dict.accept}
              </button>
            </div>
          </div>
        </motion.div>
  );
}
