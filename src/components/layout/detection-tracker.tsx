"use client";

import * as React from "react";
import { localeCookieName } from "@/i18n/config";
import { track } from "@/lib/analytics";

/**
 * Fires `language_detected` once on a first visit (no saved NEXT_LOCALE cookie),
 * i.e. when the locale came from browser detection rather than a manual
 * choice. No PII — only the resolved locale.
 */
export function DetectionTracker({ locale }: { locale: string }) {
  React.useEffect(() => {
    const hasPref = document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith(`${localeCookieName}=`));
    if (!hasPref) {
      track("language_detected", { locale });
    }
  }, [locale]);
  return null;
}
