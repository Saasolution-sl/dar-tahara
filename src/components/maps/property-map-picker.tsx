"use client";

import * as React from "react";
import { MapPin, Crosshair, Loader2, EyeOff } from "lucide-react";
import { loadGoogleMaps, mapsEnabled, mapsMapId } from "@/lib/maps/config";
import { isValidCoordinate, roundCoordinate, type LocationSource } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

export type MapPickerCopy = {
  pinTitle: string;
  pinHelp: string;
  useMyLocation: string;
  locating: string;
  locationDenied: string;
  streetViewNote: string;
  streetViewUnavailable: string;
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
type GPanorama = { setPosition: (p: LatLngLiteral) => void; setVisible: (v: boolean) => void };
type GMapsNS = {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMap;
  marker: {
    AdvancedMarkerElement: new (opts: Record<string, unknown>) => GMarker & {
      addListener: (ev: string, cb: () => void) => void;
    };
  };
  StreetViewService: new () => {
    getPanorama: (
      req: Record<string, unknown>,
      cb: (data: unknown, status: string) => void,
    ) => void;
  };
  StreetViewPanorama: new (el: HTMLElement, opts: Record<string, unknown>) => GPanorama;
  StreetViewStatus: { OK: string };
};

function ns(): GMapsNS | null {
  const w = window as unknown as { google?: { maps?: GMapsNS } };
  return w.google?.maps ?? null;
}

const DEFAULT_ZOOM = 17;

/**
 * Interactive property-location confirmation: a map with a draggable pin, and
 * Street View beside it (below it on mobile).
 *
 * The pin — not the geocoded address — is the operational truth: it is where
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
  const [svState, setSvState] = React.useState<"idle" | "ok" | "none">("idle");

  const mapDivRef = React.useRef<HTMLDivElement>(null);
  const svDivRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<GMap | null>(null);
  const markerRef = React.useRef<(GMarker & { addListener: (e: string, cb: () => void) => void }) | null>(null);
  const panoRef = React.useRef<GPanorama | null>(null);

  const hasCoords = isValidCoordinate(latitude, longitude);

  /** Publish a new confirmed position and refresh Street View for it. */
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
      updateStreetView(rlat, rlng);
      if (byCustomer) onRequestReverseGeocode?.(rlat, rlng);
    },
    // updateStreetView is stable via refs; onConfirm/onRequest come from props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onConfirm, onRequestReverseGeocode],
  );

  /** Look for a nearby panorama; hide the pane cleanly when there is none. */
  function updateStreetView(lat: number, lng: number) {
    const m = ns();
    if (!m || !svDivRef.current) return;
    const svc = new m.StreetViewService();
    svc.getPanorama({ location: { lat, lng }, radius: 60 }, (_data, status) => {
      if (status !== m.StreetViewStatus.OK) {
        setSvState("none");
        panoRef.current?.setVisible(false);
        return;
      }
      setSvState("ok");
      if (!panoRef.current && svDivRef.current) {
        panoRef.current = new m.StreetViewPanorama(svDivRef.current, {
          position: { lat, lng },
          pov: { heading: 0, pitch: 0 },
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
        });
      } else {
        panoRef.current?.setPosition({ lat, lng });
      }
      panoRef.current?.setVisible(true);
    });
  }

  // Initialise the map once coordinates exist — never before, so no Maps
  // request is made for a customer who hasn't chosen an address yet.
  React.useEffect(() => {
    if (!mapsEnabled() || !hasCoords || mapRef.current) return;
    let alive = true;
    loadGoogleMaps()
      .then(() => {
        if (!alive || !mapDivRef.current) return;
        const m = ns();
        if (!m) { setFailed(true); return; }
        const center = { lat: latitude as number, lng: longitude as number };
        const map = new m.Map(mapDivRef.current, {
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

        const marker = new m.marker.AdvancedMarkerElement({
          map,
          position: center,
          gmpDraggable: true,
          title: copy.pinTitle,
        });
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const p = marker.position as LatLngLiteral | null;
          if (p) commit(p.lat, p.lng, "map_pin", true);
        });
        map.addListener("click", (e) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (typeof lat === "number" && typeof lng === "number") {
            marker.position = { lat, lng };
            commit(lat, lng, "map_pin", true);
          }
        });

        setReady(true);
        updateStreetView(center.lat, center.lng);
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [hasCoords, latitude, longitude, commit, copy.pinTitle]);

  // Recentre when a new address is chosen upstream.
  React.useEffect(() => {
    if (!ready || !hasCoords) return;
    const p = { lat: latitude as number, lng: longitude as number };
    mapRef.current?.setCenter(p);
    if (markerRef.current) markerRef.current.position = p;
    updateStreetView(p.lat, p.lng);
  }, [latitude, longitude, ready, hasCoords]);

  /** Browser geolocation — only ever on an explicit press. */
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

      {/* Desktop: map | Street View. Mobile: stacked. */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div
          ref={mapDivRef}
          role="application"
          aria-label={copy.pinTitle}
          className="h-64 w-full overflow-hidden rounded-2xl border border-border bg-secondary/40 sm:h-72"
        />
        <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border bg-secondary/40 sm:h-72">
          <div ref={svDivRef} className={cn("h-full w-full", svState !== "ok" && "invisible")} />
          {svState !== "ok" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
              <EyeOff className="h-5 w-5 text-muted-foreground" aria-hidden />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {svState === "none" ? copy.streetViewUnavailable : ""}
              </p>
            </div>
          ) : null}
        </div>
      </div>

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

      <p className="text-xs leading-relaxed text-muted-foreground">{copy.streetViewNote}</p>
    </div>
  );
}
