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

/** Public key, restricted by HTTP referrer, so shipping it to the browser is by design. */
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

/** Only the Place fields we actually consume, Places bills per field group. */
export const PLACE_FIELDS = [
  "id",
  "formattedAddress",
  "addressComponents",
  "location",
] as const;

export type MapsLoadState = "idle" | "loading" | "ready" | "error";

type ImportLibraryFn = (name: string, ...args: unknown[]) => Promise<unknown>;
type GoogleWindow = { google?: { maps?: { importLibrary?: ImportLibraryFn } } };

let loadPromise: Promise<void> | null = null;

/**
 * Install Google's own dynamic-library-import bootstrap (verbatim from their
 * docs, minimally typed). This defines `google.maps.importLibrary` as a real,
 * callable stub SYNCHRONOUSLY, before any network request starts, unlike a
 * plain `<script src=".../js?loading=async">` tag, whose `load` event fires
 * once the outer file has downloaded but importLibrary isn't necessarily
 * attached yet. Resolving on that `load` event races the API's own internal
 * setup and intermittently throws "importLibrary is not a function", this
 * bootstrap sidesteps that entirely. Idempotent: calling it twice is a no-op
 * (the inner check on `d[l]` warns and skips reinstalling itself).
 */
function installBootstrap(key: string): void {
  /* eslint-disable */
  (function (g: any) {
    let h: any, a: any, k: any;
    const p = "The Google Maps JavaScript API",
      c = "google",
      l = "importLibrary",
      q = "__ib__",
      m = document;
    let b: any = window;
    b = b[c] || (b[c] = {});
    const d = b.maps || (b.maps = {});
    const r = new Set();
    const e = new URLSearchParams();
    const u = () =>
      h ||
      (h = new Promise((f: any, n: any) => {
        a = m.createElement("script");
        e.set("libraries", [...r] + "");
        for (k in g) e.set(k.replace(/[A-Z]/g, (t: string) => "_" + t[0].toLowerCase()), g[k]);
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + " could not load.")));
        a.nonce = (m.querySelector("script[nonce]") as HTMLScriptElement | null)?.nonce || "";
        m.head.append(a);
      }));
    d[l]
      ? console.warn(p + " only loads once. Ignoring:", g)
      : (d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n)));
  })({ key, v: "weekly" });
  /* eslint-enable */
}

/**
 * Load the Maps JS API once and reuse it. Resolves when `google.maps` is
 * genuinely usable (verified via a real `importLibrary("places")` call, not
 * just "a script tag fired its load event"); rejects when the key is absent
 * or loading fails, so every caller can fall back to manual entry instead of
 * hanging on a spinner.
 *
 * Callers use `google.maps.importLibrary()` for whatever library they need
 * (e.g. "places", "maps", "marker") after this resolves, new projects don't
 * depend on legacy classes Google no longer makes available to new customers.
 */
export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("maps_ssr"));
  }
  const w = window as unknown as GoogleWindow;
  if (loadPromise) return loadPromise;

  const key = mapsApiKey();
  if (!key) return Promise.reject(new Error("maps_key_missing"));

  loadPromise = (async () => {
    try {
      if (typeof w.google?.maps?.importLibrary !== "function") {
        installBootstrap(key);
      }
      await (window as unknown as GoogleWindow).google!.maps!.importLibrary!("places");
    } catch {
      // Allow a later retry (e.g. after a transient network failure).
      loadPromise = null;
      throw new Error("maps_script_failed");
    }
  })();

  return loadPromise;
}

/** Test seam, resets the memoised loader between tests. */
export function __resetMapsLoaderForTests(): void {
  loadPromise = null;
}
