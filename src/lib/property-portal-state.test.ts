import assert from "node:assert/strict";
import test from "node:test";
import { propertyPortalState } from "./property-portal-state";

test("new properties remain hidden until the assessment fee is paid", () => {
  assert.equal(
    propertyPortalState({
      hasAssessment: true,
      paymentStatus: "unpaid",
      assessmentConfirmed: false,
    }),
    "hidden",
  );
  assert.equal(
    propertyPortalState({
      hasAssessment: true,
      paymentStatus: "paid",
      assessmentConfirmed: false,
    }),
    "pending",
  );
});

test("completed and legacy properties remain active", () => {
  assert.equal(
    propertyPortalState({
      hasAssessment: true,
      paymentStatus: "refunded",
      assessmentConfirmed: true,
    }),
    "active",
  );
  assert.equal(
    propertyPortalState({
      hasAssessment: false,
      paymentStatus: null,
      assessmentConfirmed: false,
    }),
    "active",
  );
});
