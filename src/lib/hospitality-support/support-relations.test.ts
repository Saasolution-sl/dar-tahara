import assert from "node:assert/strict";
import test from "node:test";
import { relatedFieldsForCategory } from "./support-relations";

test("financial requests only ask for financial relationships", () => {
  assert.deepEqual(relatedFieldsForCategory("invoice"), ["invoice"]);
  assert.deepEqual(relatedFieldsForCategory("payment"), ["payment", "invoice"]);
});

test("service requests ask only for records that identify the affected service", () => {
  assert.deepEqual(relatedFieldsForCategory("cleaning_service"), ["property", "appointment"]);
  assert.deepEqual(relatedFieldsForCategory("subscription"), ["subscription"]);
  assert.deepEqual(relatedFieldsForCategory("appointment"), ["appointment"]);
});

test("property incidents include the smallest useful property context", () => {
  assert.deepEqual(relatedFieldsForCategory("smart_lock"), ["property"]);
  assert.deepEqual(relatedFieldsForCategory("damage_missing_item"), ["appointment", "property"]);
  assert.deepEqual(relatedFieldsForCategory("employee_feedback"), ["appointment", "property"]);
});

test("categories without a meaningful structured relationship show no dropdowns", () => {
  assert.deepEqual(relatedFieldsForCategory(""), []);
  assert.deepEqual(relatedFieldsForCategory("account_access"), []);
  assert.deepEqual(relatedFieldsForCategory("other"), []);
});
