import type { PlaceLike } from "./types";

/** Narrow structural type for a Places (New) Place after fetchFields(). */
export type GooglePlaceDetail = {
  id?: string;
  formattedAddress?: string;
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
  location?: { lat: () => number; lng: () => number } | { lat: number; lng: number };
};

/**
 * Adapt the camelCase Places (New) result to the deliberately small legacy-like
 * shape consumed by the existing country-aware address parser. Keeping this
 * boundary in one pure function lets every form share the same normalization.
 */
export function googlePlaceToPlaceLike(place: GooglePlaceDetail): PlaceLike {
  return {
    place_id: place.id,
    formatted_address: place.formattedAddress,
    address_components: place.addressComponents?.map((component) => ({
      long_name: component.longText ?? "",
      short_name: component.shortText ?? component.longText ?? "",
      types: component.types ?? [],
    })),
    geometry: place.location ? { location: place.location } : undefined,
  };
}
