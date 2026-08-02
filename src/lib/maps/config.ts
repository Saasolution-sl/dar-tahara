/**
 * Google Maps configuration and the single shared script loader.
 *
 * Two hard rules from the brief:
 *  - Maps is NEVER required to submit the form. If the key is missing, the
 *    quota is exhausted, the script is blocked or the network fails, callers
 *    fall back to manual entry. `mapsEnabled()` is the gate for that.
 *  - Exactly one loader, one script tag. Multiple Google Maps script inserts
 *    throw and can silently break the page.
 */

/** Public key — restricted by HTTP referrer, so shipping it to the browser is by design. */
export function mapsApiKey(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
}

/** Map ID is required by AdvancedMarkerElement (the non-deprecated marker API). */
export function mapsMapId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "";
}

/** Whether we should attempt to use Google at all. */
export function mapsEnabled(): boolean {
  return mapsApiKey().trim().length > 0;
}

/** Bias/restrict results to Morocco for property lookups. */
export const MOROCCO_COUNTRY_CODE = "ma";

/** Only the Place fields we actually consume — Places bills per field group. */
export const PLACE_FIELDS = [
  "id",
  "formattedAddress",
  "addressComponents",
  "location",
] as const;

export type MapsLoadState = "idle" | "loading" | "ready" | "error";

const SCRIPT_ID = "google-maps-js";
let loadPromise: Promise<void> | null = null;

/**
 * Load the Maps JS API once and reuse it. Resolves when `google.maps` is
 * usable; rejects when the key is absent or the script cannot load, so every
 * caller can fall back to manual entry instead of hanging on a spinner.
 *
 * `libraries=places,marker` covers Places (New) autocomplete and
 * AdvancedMarkerElement. Callers use `google.maps.importLibrary()` after this
 * bootstrap script resolves so new projects do not depend on legacy Places
 * classes that Google no longer makes available to new customers.
 */
export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("maps_ssr"));
  }
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const key = mapsApiKey();
  if (!key) return Promise.reject(new Error("maps_key_missing"));

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const onError = () => {
      // Allow a later retry (e.g. after a transient network failure).
      loadPromise = null;
      reject(new Error("maps_script_failed"));
    };

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src =
      "https://maps.googleapis.com/maps/api/js" +
      `?key=${encodeURIComponent(key)}` +
      "&libraries=places,marker" +
      "&loading=async" +
      "&v=weekly";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", onError, { once: true });
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Test seam — resets the memoised loader between tests. */
export function __resetMapsLoaderForTests(): void {
  loadPromise = null;
}
