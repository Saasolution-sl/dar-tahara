import assert from "node:assert/strict";
import { test } from "node:test";
import { googlePlaceToPlaceLike } from "./google-place";
import { parsePlace } from "./address";

test("adapts a Places New result for the shared address parser", () => {
  const normalized = googlePlaceToPlaceLike({
    id: "new-place-id",
    formattedAddress: "10 Avenue Mohammed VI, Rabat, Morocco",
    addressComponents: [
      { longText: "10", shortText: "10", types: ["street_number"] },
      { longText: "Avenue Mohammed VI", shortText: "Av. Mohammed VI", types: ["route"] },
      { longText: "Rabat", shortText: "Rabat", types: ["locality", "political"] },
      { longText: "Morocco", shortText: "MA", types: ["country", "political"] },
    ],
    location: { lat: () => 34.020882, lng: () => -6.84165 },
  });

  const address = parsePlace(normalized);
  assert.equal(address.placeId, "new-place-id");
  assert.equal(address.addressLine1, "Avenue Mohammed VI 10");
  assert.equal(address.cityDisplayName, "Rabat");
  assert.equal(address.countryCode, "MA");
  assert.equal(address.latitude, 34.020882);
  assert.equal(address.longitude, -6.84165);
});

test("missing optional Places fields remain absent instead of being invented", () => {
  const normalized = googlePlaceToPlaceLike({
    id: "partial-place",
    addressComponents: [{ longText: "Morocco", shortText: "MA", types: ["country"] }],
  });

  assert.equal(normalized.formatted_address, undefined);
  assert.equal(normalized.geometry, undefined);
  assert.equal(normalized.address_components?.[0]?.short_name, "MA");
});
