"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { getConsent, measurementId, CONSENT_EVENT, type ConsentValue } from "@/lib/consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google Analytics 4 with Consent Mode v2.
 *
 * - Nothing is loaded unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set AND the
 *   visitor has accepted analytics — so no GA cookies/requests pre-consent.
 * - Consent defaults are denied; only `analytics_storage` is upgraded on accept
 *   (advertising signals stay denied — we do not run ads).
 * - The App Router does not trigger page loads on client navigation, so
 *   subsequent route changes send an explicit `page_view` (the first one is sent
 *   by `config` itself, so it is never duplicated).
 */
export function GoogleAnalytics() {
  const id = measurementId();
  const pathname = usePathname();
  const [consent, setConsentState] = React.useState<ConsentValue | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const lastSent = React.useRef<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setConsentState(getConsent());
    const onChange = (e: Event) => setConsentState((e as CustomEvent<ConsentValue>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  const enabled = Boolean(id) && consent === "granted";

  React.useEffect(() => {
    if (!enabled) return;
    // The very first page after GA loads is reported by `config`; only report
    // client-side navigations after that.
    if (lastSent.current === null) {
      lastSent.current = pathname;
      return;
    }
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [enabled, pathname]);

  if (!mounted || !enabled || !id) return null;

  return (
    <>
      <Script
        id="ga-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ window.dataLayer.push(arguments); }
          window.gtag = window.gtag || gtag;
          window.gtag('consent','default',{
            ad_storage:'denied',
            ad_user_data:'denied',
            ad_personalization:'denied',
            analytics_storage:'denied'
          });
          window.gtag('consent','update',{ analytics_storage:'granted' });
          window.gtag('js', new Date());
          window.gtag('config','${id}',{ anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
