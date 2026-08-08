import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DIGITAL_SMART_LOCK_OFFER,
  SMART_LOCK_INTERESTS,
  formatSmartLockPrice,
  isSmartLockPurchaseInterest,
  initialCompatibilityFor,
  initialFollowupFor,
} from "./smart-lock";

test("the offer is the single source of truth: €200, EUR, installation included", () => {
  assert.equal(DIGITAL_SMART_LOCK_OFFER.price, 200);
  assert.equal(DIGITAL_SMART_LOCK_OFFER.currency, "EUR");
  assert.equal(DIGITAL_SMART_LOCK_OFFER.installationIncluded, true);
  assert.equal(DIGITAL_SMART_LOCK_OFFER.productCode, "digital_smart_lock_installation");
});

test("price renders as €200 with the value pulled from config (never hardcoded)", () => {
  assert.equal(formatSmartLockPrice(), `€${DIGITAL_SMART_LOCK_OFFER.price}`);
  assert.equal(formatSmartLockPrice(), "€200");
});

test("only the purchase choice is a purchase; the others never imply an order", () => {
  assert.equal(isSmartLockPurchaseInterest("purchase_interested"), true);
  for (const i of SMART_LOCK_INTERESTS.filter((x) => x !== "purchase_interested")) {
    assert.equal(isSmartLockPurchaseInterest(i), false);
  }
  assert.equal(isSmartLockPurchaseInterest(undefined), false);
});

test("initial compatibility is never 'compatible' at signup", () => {
  assert.equal(initialCompatibilityFor("purchase_interested"), "pending_review");
  assert.equal(initialCompatibilityFor("already_has_lock"), "pending_review");
  assert.equal(initialCompatibilityFor("not_interested"), "not_checked");
});

test("each interest maps to a distinct internal follow-up status", () => {
  assert.equal(initialFollowupFor("purchase_interested"), "installation_interest_registered");
  assert.equal(initialFollowupFor("already_has_lock"), "compatibility_review_required");
  assert.equal(initialFollowupFor("not_interested"), "no_action_required");
});

test("there is no 'more information' choice, three clear options only", () => {
  assert.deepEqual([...SMART_LOCK_INTERESTS], [
    "purchase_interested",
    "already_has_lock",
    "not_interested",
  ]);
});
