import { test } from "node:test";
import assert from "node:assert/strict";
import { reconcileAcQuantity } from "./ac-billing-sync";

test("no Stripe item and no paid units: nothing to do", () => {
  assert.deepEqual(reconcileAcQuantity(0, null), { matches: true });
});

test("no Stripe item but paid units exist: item must be added", () => {
  assert.deepEqual(reconcileAcQuantity(1, null), { matches: false, action: "add", targetQuantity: 1 });
  assert.deepEqual(reconcileAcQuantity(3, null), { matches: false, action: "add", targetQuantity: 3 });
});

test("Stripe item exists and matches the database exactly: nothing to do", () => {
  assert.deepEqual(reconcileAcQuantity(2, { quantity: 2 }), { matches: true });
});

test("Stripe quantity is stale: must be updated to the database's count", () => {
  assert.deepEqual(reconcileAcQuantity(3, { quantity: 2 }), { matches: false, action: "update", targetQuantity: 3 });
  assert.deepEqual(reconcileAcQuantity(1, { quantity: 4 }), { matches: false, action: "update", targetQuantity: 1 });
});

test("database has zero paid units but Stripe still has an item: item must be removed", () => {
  assert.deepEqual(reconcileAcQuantity(0, { quantity: 1 }), { matches: false, action: "remove" });
});

test("negative or fractional input never produces a negative target", () => {
  assert.deepEqual(reconcileAcQuantity(-5, { quantity: 1 }), { matches: false, action: "remove" });
});
