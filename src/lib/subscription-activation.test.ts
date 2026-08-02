import { test } from "node:test";
import assert from "node:assert/strict";
import {
  nextFridayPaymentAt,
  serviceWindowAfterPayment,
} from "./subscription-activation";

test("next Friday payment uses the Amsterdam business day during summer time", () => {
  assert.equal(
    nextFridayPaymentAt(new Date("2026-07-30T10:00:00Z")).toISOString(),
    "2026-07-31T10:00:00.000Z",
  );
});

test("authorization on Friday always rolls to the following Friday", () => {
  assert.equal(
    nextFridayPaymentAt(new Date("2026-07-31T08:00:00Z")).toISOString(),
    "2026-08-07T10:00:00.000Z",
  );
});

test("next Friday payment observes Amsterdam winter time", () => {
  assert.equal(
    nextFridayPaymentAt(new Date("2026-12-02T09:00:00Z")).toISOString(),
    "2026-12-04T11:00:00.000Z",
  );
});

test("a successful Friday payment creates the following Monday to Sunday service window", () => {
  assert.deepEqual(
    serviceWindowAfterPayment(new Date("2026-07-31T10:00:00Z")),
    { start: "2026-08-03", end: "2026-08-09" },
  );
});
