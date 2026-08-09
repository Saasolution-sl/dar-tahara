"use client";

import * as React from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import { loadGoogleMaps, mapsEnabled, mapsMapId } from "@/lib/maps/config";
import { isValidCoordinate, roundCoordinate, type LocationSource } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

export type MapPickerCopy = {
  pinTitle: string;
  pinHelp: string;
  useMyLocation: string;
  locating: string;
  locationDenied: string;
  mapUnavailable: string;
  adjusted: string;
};

export type ConfirmedLocation = {
  latitude: number;
  longitude: number;
  pinAdjustedByCustomer: boolean;
  locationSource: LocationSource;
};

/* Narrow shapes for the Google objects used here. */
type LatLngLiteral = { lat: number; lng: number };
type GMap = {
  setCenter: (p: LatLngLiteral) => void;
  setZoom: (z: number) => void;
  addListener: (ev: string, cb: (e: { latLng?: { lat: () => number; lng: () => number } }) => void) => void;
};
type GMarker = { position: LatLngLiteral | null; map: GMap | null };
type AdvancedMarker = GMarker & { addListener: (ev: string, cb: () => void) => void };
/* Everything here comes from `google.maps.importLibrary()`, not the raw
 * `google.maps` global: under `loading=async`, the global namespace is not
 * guaranteed to be populated until the owning library has been imported. */
type GMapsLib = {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMap;
};
type GMarkerLib = {
  AdvancedMarkerElement: new (opts: Record<string, unknown>) => AdvancedMarker;
};

function importLibrary<T>(name: string): Promise<T> {
  const w = window as unknown as { google?: { maps?: { importLibrary?: (n: string) => Promise<T> } } };
  const fn = w.google?.maps?.importLibrary;
  if (!fn) return Promise.reject(new Error("maps_not_loaded"));
  return fn(name);
}

const DEFAULT_ZOOM = 17;

/**
 * Interactive property-location confirmation: a map with a draggable pin.
 * Street View was removed: the imagery was frequently blank or mismatched
 * for Moroccan addresses, and dropping it cuts a Maps API load per pin move.
 *
 * The pin: not the geocoded address: is the operational truth: it is where
 * the cleaning team should actually enter. Dragging or tapping moves it and
 * flags the location as customer-adjusted.
 *
 * Reverse geocoding is intentionally left to the caller and only fires on
 * drag END, never continuously during a drag (cost + rate limits).
 */
export function PropertyMapPicker({
  latitude,
  longitude,
  onConfirm,
  onRequestReverseGeocode,
  copy,
  className,
}: {
  latitude?: number;
  longitude?: number;
  onConfirm: (loc: ConfirmedLocation) => void;
  onRequestReverseGeocode?: (lat: number, lng: number) => void;
  copy: MapPickerCopy;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(!mapsEnabled());
  const [ready, setReady] = React.useState(false);
  const [adjusted, setAdjusted] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [geoDenied, setGeoDenied] = React.useState(false);

  const mapDivRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<GMap | null>(null);
  const markerRef = React.useRef<AdvancedMarker | null>(null);

  const hasCoords = isValidCoordinate(latitude, longitude);

  /** Publish a new confirmed position. */
  const commit = React.useCallback(
    (lat: number, lng: number, source: LocationSource, byCustomer: boolean) => {
      const rlat = roundCoordinate(lat);
      const rlng = roundCoordinate(lng);
      if (byCustomer) setAdjusted(true);
      onConfirm({
        latitude: rlat,
        longitude: rlng,
        pinAdjustedByCustomer: byCustomer,
        locationSource: source,
      });
      if (byCustomer) onRequestReverseGeocode?.(rlat, rlng);
    },
    [onConfirm, onRequestReverseGeocode],
  );
  // `onConfirm` is typically an inline arrow at the call site, so `commit`'s
  // identity changes on every parent render. The main effect below awaits
  // `importLibrary()` for "maps"/"marker" (a real network fetch on first use)
  // before constructing the map: if that effect depended on `commit`
  // directly, an unrelated keystroke elsewhere in the same form step would
  // tear it down mid-fetch (React runs the cleanup, `alive` flips false) and
  // silently abort map construction, leaving the container permanently
  // empty. Reading the latest commit through a ref lets the effect skip
  // `commit` in its deps without ever calling a stale closure.
  const commitRef = React.useRef(commit);
  commitRef.current = commit;

  // Initialise the map once coordinates exist: never before, so no Maps
  // request is made for a customer who hasn't chosen an address yet.
  React.useEffect(() => {
    if (!mapsEnabled() || !hasCoords || mapRef.current) return;
    let alive = true;
    loadGoogleMaps()
      .then(() => Promise.all([importLibrary<GMapsLib>("maps"), importLibrary<GMarkerLib>("marker")]))
      .then(([mapsLib, markerLib]) => {
        if (!alive || !mapDivRef.current) return;
        const center = { lat: latitude as number, lng: longitude as number };
        const map = new mapsLib.Map(mapDivRef.current, {
          center,
          zoom: DEFAULT_ZOOM,
          mapId: mapsMapId() || undefined,
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          // Requires a deliberate gesture, so the page still scrolls on mobile.
          gestureHandling: "cooperative",
        });
        mapRef.current = map;

        const marker = new markerLib.AdvancedMarkerElement({
          map,
          position: center,
          gmpDraggable: true,
          title: copy.pinTitle,
        });
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const p = marker.position as LatLngLiteral | null;
          if (p) commitRef.current(p.lat, p.lng, "map_pin", true);
        });
        map.addListener("click", (e) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (typeof lat === "number" && typeof lng === "number") {
            marker.position = { lat, lng };
            commitRef.current(lat, lng, "map_pin", true);
          }
        });

        setReady(true);
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
    // `commit` is deliberately excluded: see commitRef above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCoords, latitude, longitude, copy.pinTitle]);

  // Recentre when a new address is chosen upstream.
  React.useEffect(() => {
    if (!ready || !hasCoords) return;
    const p = { lat: latitude as number, lng: longitude as number };
    mapRef.current?.setCenter(p);
    if (markerRef.current) markerRef.current.position = p;
  }, [latitude, longitude, ready, hasCoords]);

  /** Browser geolocation: only ever on an explicit press. */
  function useMyLocation() {
    if (!("geolocation" in navigator)) { setGeoDenied(true); return; }
    setLocating(true);
    setGeoDenied(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        commit(pos.coords.latitude, pos.coords.longitude, "browser_geolocation", true);
        const p = { lat: roundCoordinate(pos.coords.latitude), lng: roundCoordinate(pos.coords.longitude) };
        mapRef.current?.setCenter(p);
        if (markerRef.current) markerRef.current.position = p;
      },
      () => { setLocating(false); setGeoDenied(true); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  if (failed) {
    return (
      <p className={cn("rounded-xl bg-secondary/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground", className)}>
        {copy.mapUnavailable}
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-sm font-medium text-foreground">{copy.pinTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy.pinHelp}</p>
      </div>

      <div
        ref={mapDivRef}
        role="application"
        aria-label={copy.pinTitle}
        className="h-64 w-full overflow-hidden rounded-2xl border border-border bg-secondary/40 sm:h-80"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Crosshair className="h-3.5 w-3.5" aria-hidden />}
          {locating ? copy.locating : copy.useMyLocation}
        </button>
        {adjusted ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {copy.adjusted}
          </span>
        ) : null}
      </div>

      {geoDenied ? (
        <p role="status" className="text-xs leading-relaxed text-muted-foreground">
          {copy.locationDenied}
        </p>
      ) : null}
    </div>
  );
}
