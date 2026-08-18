"use client";

import * as React from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";

const LazyLaunchPopup = React.lazy(async () => {
  const imported = await import("./launch-popup");
  return { default: imported.LaunchPopup };
});

/**
 * The popup cannot appear before ten seconds, so keep its form, validation,
 * and Turnstile controller out of the critical hydration path.
 */
export function LaunchPopupLoader({ locale, dict }: { locale: Locale; dict: Dictionary["mailing"] }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const activate = () => setReady(true);
    const timeoutId = window.setTimeout(activate, 4_000);
    window.addEventListener("scroll", activate, { passive: true, once: true });
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", activate);
    };
  }, []);

  if (!ready) return null;
  return (
    <React.Suspense fallback={null}>
      <LazyLaunchPopup locale={locale} dict={dict} />
    </React.Suspense>
  );
}
