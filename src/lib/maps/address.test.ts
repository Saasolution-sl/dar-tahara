import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parsePlace,
  missingAddressFields,
  isSubmittableAddress,
} from "./address";
import { isValidCoordinate, roundCoordinate } from "./types";
import type { PlaceLike } from "./types";

/** A typical Moroccan result: no postal code, no street number. */
function tangierPlace(): PlaceLike {
  return {
    place_id: "PLACE_TANGIER",
    formatted_address: "Rue de Belgique, Tanger, Morocco",
    address_components: [
      { long_name: "Rue de Belgique", short_name: "Rue de Belgique", types: ["route"] },
      { long_name: "Iberia", short_name: "Iberia", types: ["neighborhood", "political"] },
      { long_name: "Tanger", short_name: "Tanger", types: ["locality", "political"] },
      {
        long_name: "Tanger-Tetouan-Al Hoceima",
        short_name: "Tanger-Tetouan-Al Hoceima",
        types: ["administrative_area_level_1", "political"],
      },
      { long_name: "Morocco", short_name: "MA", types: ["country", "political"] },
    ],
    geometry: { location: { lat: () => 35.7716123456, lng: () => -5.8339987654 } },
  };
}

test("parses a Moroccan place and canonicalizes the city", () => {
  const a = parsePlace(tangierPlace());
  assert.equal(a.countryCode, "MA");
  assert.equal(a.streetName, "Rue de Belgique");
  assert.equal(a.neighborhood, "Iberia");
  // "Tanger" resolves to the canonical city, not the raw Google string.
  assert.equal(a.cityId, "tangier");
  assert.equal(a.cityDisplayName, "Tangier");
  assert.equal(a.regionId, "tanger_tetouan_al_hoceima");
  assert.equal(a.placeId, "PLACE_TANGIER");
  // Coordinates rounded to ~1 m.
  assert.equal(a.latitude, 35.771612);
  assert.equal(a.longitude, -5.833999);
});

test("a missing postal code or street number never blocks submission", () => {
  const a = parsePlace(tangierPlace());
  assert.equal(a.postalCode, undefined);
  assert.equal(a.streetNumber, undefined);

  const missing = missingAddressFields(a);
  assert.deepEqual(missing.required, [], "nothing essential should be missing");
  assert.ok(missing.optional.includes("postalCode"));
  assert.ok(missing.optional.includes("streetNumber"));
  assert.equal(isSubmittableAddress(a), true);
});

test("an address with no street line or city is not submittable", () => {
  const bare = parsePlace({ address_components: [], geometry: undefined });
  const missing = missingAddressFields(bare);
  assert.ok(missing.required.includes("addressLine1"));
  assert.ok(missing.required.includes("cityDisplayName"));
  assert.equal(isSubmittableAddress(bare), false);
});

test("a Moroccan city outside the taxonomy is kept as an unverified manual name", () => {
  const p: PlaceLike = {
    formatted_address: "Ifrane, Morocco",
    address_components: [
      { long_name: "Avenue de la Marche Verte", short_name: "Av. Marche Verte", types: ["route"] },
      { long_name: "Ifrane", short_name: "Ifrane", types: ["locality", "political"] },
      { long_name: "Morocco", short_name: "MA", types: ["country", "political"] },
    ],
  };
  const a = parsePlace(p);
  assert.equal(a.cityId, undefined, "must not be forced into the canonical list");
  assert.equal(a.manualCityName, "Ifrane");
  assert.equal(isSubmittableAddress(a), true, "an unlisted city still registers");
});

test("a foreign billing address parses without Moroccan canonicalization", () => {
  const p: PlaceLike = {
    formatted_address: "Keizersgracht 1, 1015 Amsterdam, Netherlands",
    address_components: [
      { long_name: "1", short_name: "1", types: ["street_number"] },
      { long_name: "Keizersgracht", short_name: "Keizersgracht", types: ["route"] },
      { long_name: "Amsterdam", short_name: "Amsterdam", types: ["locality", "political"] },
      { long_name: "1015", short_name: "1015", types: ["postal_code"] },
      { long_name: "Netherlands", short_name: "NL", types: ["country", "political"] },
    ],
    geometry: { location: { lat: 52.375, lng: 4.885 } },
  };
  const a = parsePlace(p);
  assert.equal(a.countryCode, "NL");
  assert.equal(a.cityId, undefined);
  assert.equal(a.cityDisplayName, "Amsterdam");
  assert.equal(a.addressLine1, "Keizersgracht 1");
  assert.equal(a.postalCode, "1015");
  assert.equal(a.latitude, 52.375);
});

test("postal codes keep leading zeros (stored as strings)", () => {
  const p: PlaceLike = {
    address_components: [
      { long_name: "01234", short_name: "01234", types: ["postal_code"] },
      { long_name: "Somewhere", short_name: "Somewhere", types: ["locality"] },
      { long_name: "Spain", short_name: "ES", types: ["country"] },
    ],
  };
  assert.equal(parsePlace(p).postalCode, "01234");
});

test("bad geometry is dropped rather than stored as a wrong coordinate", () => {
  const p: PlaceLike = {
    address_components: [{ long_name: "Morocco", short_name: "MA", types: ["country"] }],
    geometry: { location: { lat: 999, lng: -5.8 } },
  };
  const a = parsePlace(p);
  assert.equal(a.latitude, undefined);
  assert.equal(a.longitude, undefined);
});

test("coordinate validation and rounding", () => {
  assert.equal(isValidCoordinate(35.77, -5.83), true);
  assert.equal(isValidCoordinate(91, 0), false);
  assert.equal(isValidCoordinate(0, 181), false);
  assert.equal(isValidCoordinate(NaN, 0), false);
  assert.equal(roundCoordinate(35.7716123456), 35.771612);
});
