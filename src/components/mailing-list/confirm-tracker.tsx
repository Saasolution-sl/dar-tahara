"use client";

import * as React from "react";
import { track } from "@/lib/analytics";

/** Fires the confirmation analytics event once, client-side (no PII). */
export function ConfirmTracker({ locale }: { locale: string }) {
  React.useEffect(() => {
    track("mailing_list_confirmation_completed", { locale });
  }, [locale]);
  return null;
}
