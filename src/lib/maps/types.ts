/**
 * Address and location shapes shared by the Google-backed address search, the
 * property map picker and the form payload.
 *
 * Two deliberate rules encoded here:
 *  1. The address Google returns and the location the customer CONFIRMS are
 *     separate. The confirmed pin is the operational truth (where the cleaner
 *     actually walks in); the geocoded result is only a starting point.
 *  2. Every component is optional except the country, because Google frequently
 *     omits postal codes, neighbourhoods and building numbers in Morocco —
 *     and a missing component must never block a registration.
 */

export type StructuredAddress = {
  addressLine1?: string;
  addressLine2?: string;
  streetName?: string;
  streetNumber?: string;
  buildingName?: string;
  apartmentOrUnit?: string;
  floor?: string;
  neighborhood?: string;
  cityId?: string;
  cityDisplayName?: string;
  manualCityName?: string;
  regionId?: string;
  regionName?: string;
  /** Kept as a string so leading zeros survive. */
  postalCode?: string;
  countryCode: string;
  formattedAddress?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
};

/** How the confirmed coordinates were arrived at. */
export type LocationSource =
  | "google_place"
  | "map_pin"
  | "browser_geolocation"
  | "manual";

export type PropertyLocation = {
  placeId?: string;
  formattedAddress?: string;
  /** Where the address search put it. */
  selectedLatitude?: number;
  selectedLongitude?: number;
  /** Where the customer confirmed the entrance is — the operational location. */
  confirmedLatitude: number;
  confirmedLongitude: number;
  pinAdjustedByCustomer: boolean;
  locationSource: LocationSource;
};

/** The subset of a Google Place we consume. Keeping this narrow is also a cost
 * control: Places bills by the field groups requested. */
export type PlaceLike = {
  place_id?: string;
  formatted_address?: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry?: { location?: { lat: () => number; lng: () => number } | { lat: number; lng: number } };
};

/** Coordinates are only meaningful within these ranges; anything else is a bug. */
export function isValidLatitude(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= -90 && v <= 90;
}
export function isValidLongitude(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= -180 && v <= 180;
}
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

/**
 * Round to ~1 m precision. Storing full float precision from a dragged pin is
 * false accuracy and needlessly identifying; six decimals is the documented
 * column precision on both latitude and longitude.
 */
export function roundCoordinate(v: number): number {
  return Math.round(v * 1e6) / 1e6;
}
