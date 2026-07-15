"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { getConsent, CONSENT_EVENT, type ConsentValue } from "@/lib/consent";

declare global {
  interface Window {
    // Mautic's tracker global (name set to `mt` by the loader snippet below).
    mt?: (...args: unknown[]) => void;
  }
}

/**
 * Mautic contact tracking, consent-gated exactly like GoogleAnalytics.
 *
 * - Loads mtc.js from NEXT_PUBLIC_MAUTIC_BASE_URL only when tracking is enabled
 *   AND the visitor has accepted analytics — so no Mautic cookie or request
 *   happens before consent (brief §26/§32).
 * - Loads asynchronously via next/script afterInteractive, so it never blocks
 *   render and the page is fully usable if Mautic is blocked or down (§38).
 * - Sends a pageview on load and on each client-side route change. It sends only
 *   the URL/path — never an email, phone, address or any submitted field (§26).
 * - Identification after submission is handled server-side (the API creates the
 *   Mautic contact); we do not push PII into the browser tracker.
 */
export function MauticTracking() {
  const base = process.env.NEXT_PUBLIC_MAUTIC_BASE_URL;
  const enabledFlag = process.env.NEXT_PUBLIC_MAUTIC_TRACKING_ENABLED === "true";
  const pathname = usePathname();
  const [consent, setConsent] = React.useState<ConsentValue | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const lastSent = React.useRef<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setConsent(getConsent());
    const onChange = (e: Event) => setConsent((e as CustomEvent<ConsentValue>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  const enabled = enabledFlag && Boolean(base) && consent === "granted";

  React.useEffect(() => {
    if (!enabled) return;
    // The loader's own first `send` covers the initial page; only report
    // subsequent client-side navigations, and never the same path twice.
    if (lastSent.current === null) {
      lastSent.current = pathname;
      return;
    }
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    window.mt?.("send", "pageview", { url: window.location.href });
  }, [enabled, pathname]);

  if (!mounted || !enabled || !base) return null;

  const src = `${base.replace(/\/$/, "")}/mtc.js`;

  return (
    <Script id="mautic-tracking" strategy="afterInteractive">
      {`
        (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
          w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
          a=d.createElement(t);m=d.getElementsByTagName(t)[0];
          a.async=1;a.src=u;m.parentNode.insertBefore(a,m);
        })(window,document,'script','${src}','mt');
        mt('send','pageview');
      `}
    </Script>
  );
}
