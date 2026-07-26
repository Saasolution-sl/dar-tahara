import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MOROCCAN_CITIES,
  canonicalizeCity,
  searchCities,
  cityServiceStatus,
  displayCityName,
  findCity,
} from "./moroccan-cities";

test("every city has a unique id and a region", () => {
  const ids = new Set<string>();
  for (const c of MOROCCAN_CITIES) {
    assert.ok(!ids.has(c.id), `duplicate id ${c.id}`);
    ids.add(c.id);
    assert.ok(c.regionId && c.regionName, `${c.id} missing region`);
  }
});

test("the spec's minimum cities are present and active", () => {
  for (const id of ["casablanca", "tangier", "tetouan"]) {
    assert.equal(findCity(id)?.serviceAreaStatus, "active", `${id} should be active`);
  }
});

test("language variants and spellings all resolve to ONE canonical city", () => {
  for (const variant of ["Tanger", "Tangier", "Tánger", "طنجة", "  tangier  "]) {
    assert.equal(canonicalizeCity(variant)?.id, "tangier", `"${variant}" should map to tangier`);
  }
  assert.equal(canonicalizeCity("Casa")?.id, "casablanca");
  assert.equal(canonicalizeCity("الدار البيضاء")?.id, "casablanca");
  assert.equal(canonicalizeCity("Tétouan")?.id, "tetouan");
});

test("an unknown place resolves to undefined (→ manual city path)", () => {
  assert.equal(canonicalizeCity("Springfield"), undefined);
  assert.equal(canonicalizeCity(""), undefined);
  assert.equal(canonicalizeCity(undefined), undefined);
});

test("search matches name, alias and region; empty query lists active first", () => {
  assert.equal(searchCities("tan", "en")[0].id, "tangier");
  assert.equal(searchCities("casa", "en")[0].id, "casablanca");
  // Arabic alias search.
  assert.ok(searchCities("طنجة", "ar").some((c) => c.id === "tangier"));
  // Region search returns members of that region.
  assert.ok(searchCities("oriental", "en").some((c) => c.id === "nador"));
  // Empty query → active cities float to the top.
  assert.equal(searchCities("", "en")[0].serviceAreaStatus, "active");
});

test("display name is localized with a canonical fallback", () => {
  const tangier = findCity("tangier")!;
  assert.equal(displayCityName(tangier, "ar"), "طنجة");
  assert.equal(displayCityName(tangier, "fr"), "Tanger");
  assert.equal(displayCityName(tangier, "en"), "Tangier"); // no override → canonical
});

test("service status is looked up by id; unknown/manual is unsupported", () => {
  assert.equal(cityServiceStatus("casablanca"), "active");
  assert.equal(cityServiceStatus("kenitra"), "waiting_list");
  assert.equal(cityServiceStatus("__other__"), "unsupported");
  assert.equal(cityServiceStatus(undefined), "unsupported");
});
