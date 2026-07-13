"use client";

import * as React from "react";
import { track } from "@/lib/analytics";

/**
 * Fires `language_detected` once on a first visit (no saved NEXT_LOCALE cookie),
 * i.e. when the locale came from browser/geo detection rather than a manual
 * choice. No PII — only the resolved locale.
 */
export function DetectionTracker({ locale }: { locale: string }) {
  React.useEffect(() => {
    const hasPref = document.cookie.split("; ").some((c) => c.startsWith("NEXT_LOCALE="));
    if (!hasPref) {
      track("language_detected", { locale });
    }
  }, [locale]);
  return null;
}
