"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import type { MapMarker } from "@/lib/dashboard/queries/mapData";
import { statusColor } from "@/lib/dashboard/chartColors";
import type { DashboardCopy } from "@/i18n/dashboard-copy";

const MOROCCO_CENTER = { lat: 33.5, lng: -6.5 };

declare global {
  interface Window {
    /** Google Maps calls this on any auth failure (bad key, referrer, billing). */
    gm_authFailure?: () => void;
  }
}

/**
 * A plain SVG data-URI pin: deliberately not `google.maps.Symbol` (which
 * needs the `google` global at render time) and not AdvancedMarker (which
 * needs a Map ID). This keeps the marker rendering independent of both.
 */
function pinIcon(color: string): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="12" fill="${color}" stroke="white" stroke-width="2"/></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}` };
}

function MapPlaceholder({ title, heading, body }: { title: string; heading: string; body: string }) {
  return (
    <section>
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-4 flex min-h-72 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">{heading}</p>
        <p className="max-w-md text-xs text-muted-foreground">{body}</p>
      </div>
    </section>
  );
}

/**
 * Watches for a Google Maps authentication failure.
 *
 * `@vis.gl/react-google-maps` defines `APILoadingStatus.AUTH_FAILURE` and will
 * render its own message for it, but nothing in the library ever *sets* that
 * status - it never installs Google's `gm_authFailure` hook. So a rejected key
 * (wrong HTTP referrer, billing disabled, API not enabled) loads the script
 * fine, fails at auth, logs to the console and leaves a blank grey box on the
 * dashboard with no explanation. Installing the hook ourselves is what turns
 * that into something readable.
 *
 * The previous handler is preserved and restored so this composes with anything
 * else on the page that cares.
 */
function useMapAuthFailure(): boolean {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const previous = window.gm_authFailure;
    window.gm_authFailure = () => {
      setFailed(true);
      previous?.();
    };
    return () => {
      window.gm_authFailure = previous;
    };
  }, []);

  return failed;
}

export function OperationsMap({ markers, copy }: { markers: MapMarker[]; copy: DashboardCopy }) {
  const c = copy.map;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const authFailed = useMapAuthFailure();

  if (!apiKey) {
    return <MapPlaceholder title={c.title} heading={c.unavailableTitle} body={c.unavailableBody} />;
  }

  // A key that exists but is refused is a different problem from a missing one,
  // and needs a different instruction, so it gets its own message.
  if (authFailed) {
    return <MapPlaceholder title={c.title} heading={c.rejectedTitle} body={c.rejectedBody} />;
  }

  const center =
    markers.length > 0
      ? { lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length, lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length }
      : MOROCCO_CENTER;

  return (
    <section>
      <h2 className="font-serif text-2xl">{c.title}</h2>
      <div className="mt-4 h-96 overflow-hidden rounded-2xl border border-border shadow-soft">
        <APIProvider apiKey={apiKey}>
          <Map defaultCenter={center} defaultZoom={markers.length > 0 ? 11 : 6} gestureHandling="greedy" disableDefaultUI reuseMaps>
            {markers.map((marker) => (
              <Marker
                key={`${marker.kind}-${marker.id}`}
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.label}
                icon={pinIcon(marker.kind === "staff" ? statusColor[marker.status || "offline"] || "#94a3b8" : "#2f5233")}
                label={{ text: marker.kind === "staff" ? "S" : "C", color: "white", fontSize: "11px", fontWeight: "bold" }}
              />
            ))}
          </Map>
        </APIProvider>
      </div>
    </section>
  );
}
