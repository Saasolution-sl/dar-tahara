/**
 * Analytics consent (GDPR / ePrivacy).
 *
 * Google Analytics is not loaded at all until the visitor explicitly accepts,
 * so no analytics cookies or network calls happen before consent. The choice is
 * remembered in localStorage and broadcast so the GA loader and the banner stay
 * in sync without a full reload.
 */
export type ConsentValue = "granted" | "denied";

const STORAGE_KEY = "dt_analytics_consent";
export const CONSENT_EVENT = "dt-consent-change";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Storage blocked → treat as "not decided"; we simply never load analytics.
    return null;
  }
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* storage blocked — the in-page event below still updates this session */
  }
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }));
}

/** The GA4 measurement id, or undefined when analytics is not configured. */
export function measurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined;
}
