import assert from "node:assert/strict";
import { test } from "node:test";
import { filterRecordsByUnit, invoiceUnitId } from "./invoice-unit";

const subscriptions = [
  { id: "subscription-a1", properties: { id: "unit-a" } },
  { id: "subscription-a2", properties: [{ id: "unit-a" }] },
  { id: "subscription-b", properties: { id: "unit-b" } },
  { id: "legacy-subscription", properties: null },
];

test("invoice unit identity follows the property across renewed subscriptions", () => {
  assert.equal(invoiceUnitId(subscriptions[0]), "unit-a");
  assert.equal(invoiceUnitId(subscriptions[1]), "unit-a");
  assert.equal(invoiceUnitId(subscriptions[3]), "legacy-subscription");
});

test("unit filtering includes every subscription for the selected property", () => {
  assert.deepEqual(
    filterRecordsByUnit(subscriptions, "unit-a").map((subscription) => subscription.id),
    ["subscription-a1", "subscription-a2"],
  );
  assert.equal(filterRecordsByUnit(subscriptions, null), subscriptions);
  assert.deepEqual(filterRecordsByUnit(subscriptions, "missing"), []);
});
