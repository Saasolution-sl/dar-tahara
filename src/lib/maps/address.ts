/**
 * Parse a Google Place into our structured address, and decide what is still
 * missing.
 *
 * Google's address_components are a loose, country-dependent bag: Morocco often
 * returns no postal_code, no street_number, and puts the district in any of
 * `neighborhood`, `sublocality` or `political`. So this module is defensive by
 * design — it extracts what exists, never invents, and reports the gaps so the
 * UI can ask for exactly those and nothing more.
 */
import { canonicalizeCity } from "@/lib/geo/moroccan-cities";
import {
  isValidCoordinate,
  roundCoordinate,
  type PlaceLike,
  type StructuredAddress,
} from "./types";

/** First component whose `types` include any of the wanted types. */
function pick(
  components: NonNullable<PlaceLike["address_components"]>,
  wanted: string[],
  form: "long" | "short" = "long",
): string | undefined {
  for (const type of wanted) {
    const hit = components.find((c) => c.types.includes(type));
    if (hit) {
      const v = form === "short" ? hit.short_name : hit.long_name;
      if (v && v.trim()) return v.trim();
    }
  }
  return undefined;
}

/** Read lat/lng whether the geometry uses accessor functions or plain numbers. */
function readLatLng(place: PlaceLike): { lat?: number; lng?: number } {
  const loc = place.geometry?.location;
  if (!loc) return {};
  const lat = typeof (loc as { lat: unknown }).lat === "function"
    ? (loc as { lat: () => number }).lat()
    : (loc as { lat: number }).lat;
  const lng = typeof (loc as { lng: unknown }).lng === "function"
    ? (loc as { lng: () => number }).lng()
    : (loc as { lng: number }).lng;
  return isValidCoordinate(lat, lng)
    ? { lat: roundCoordinate(lat as number), lng: roundCoordinate(lng as number) }
    : {};
}

/**
 * Convert a Google Place into a StructuredAddress. When the country is Morocco
 * the locality is additionally resolved against the canonical city taxonomy, so
 * "Tanger"/"Tangier"/"طنجة" all land on the same city id and region.
 */
export function parsePlace(place: PlaceLike): StructuredAddress {
  const comps = place.address_components ?? [];
  const { lat, lng } = readLatLng(place);

  const countryCode = pick(comps, ["country"], "short")?.toUpperCase() ?? "";
  const streetNumber = pick(comps, ["street_number"]);
  const streetName = pick(comps, ["route"]);
  const neighborhood = pick(comps, [
    "neighborhood",
    "sublocality_level_1",
    "sublocality",
  ]);
  const localityName = pick(comps, [
    "locality",
    "postal_town",
    "administrative_area_level_2",
  ]);
  const regionName = pick(comps, ["administrative_area_level_1"]);
  const postalCode = pick(comps, ["postal_code"]);

  const address: StructuredAddress = {
    streetName,
    streetNumber,
    // Line 1 mirrors how the address is written locally: name then number.
    addressLine1: [streetName, streetNumber].filter(Boolean).join(" ") || undefined,
    neighborhood,
    cityDisplayName: localityName,
    regionName,
    postalCode,
    countryCode,
    formattedAddress: place.formatted_address?.trim() || undefined,
    placeId: place.place_id || undefined,
    latitude: lat,
    longitude: lng,
  };

  if (countryCode === "MA") {
    // Try the locality first, then the district and region — Google sometimes
    // returns only a sublocality for addresses inside a big city.
    const city =
      canonicalizeCity(localityName) ??
      canonicalizeCity(neighborhood) ??
      canonicalizeCity(regionName);
    if (city) {
      address.cityId = city.id;
      address.cityDisplayName = city.canonicalName;
      address.regionId = city.regionId;
      address.regionName = city.regionName;
    } else if (localityName) {
      // Recognised as Moroccan but outside the taxonomy — keep it as an
      // unverified manual city for review rather than inventing a match.
      address.manualCityName = localityName;
    }
  }

  return address;
}

/**
 * Components a Moroccan property address genuinely needs, and which of them
 * Google did not supply. The postal code is deliberately NOT required: large
 * parts of Morocco have no reliable per-address code, and demanding one would
 * block real customers.
 */
export const REQUIRED_PROPERTY_FIELDS = ["addressLine1", "cityDisplayName"] as const;

/** Fields worth asking for when absent, in priority order. Never blocking. */
export const NICE_TO_HAVE_FIELDS = [
  "streetNumber",
  "neighborhood",
  "postalCode",
] as const;

export type MissingFields = {
  /** Must be filled before the step can be completed. */
  required: string[];
  /** Worth prompting for, but the customer can continue without them. */
  optional: string[];
};

export function missingAddressFields(a: Partial<StructuredAddress>): MissingFields {
  const empty = (v: unknown) => typeof v !== "string" || v.trim() === "";
  return {
    required: REQUIRED_PROPERTY_FIELDS.filter((f) => empty(a[f])),
    optional: NICE_TO_HAVE_FIELDS.filter((f) => empty(a[f])),
  };
}

/** True when the address has enough to submit — Google availability is irrelevant. */
export function isSubmittableAddress(a: Partial<StructuredAddress>): boolean {
  return missingAddressFields(a).required.length === 0;
}
