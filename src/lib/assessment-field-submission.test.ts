import assert from "node:assert/strict";
import test from "node:test";
import { validateAssessmentFieldSubmission } from "./assessment-field-submission";

function complete() {
  return {
    propertyType: "apartment",
    verifiedSizeM2: 95,
    verifiedBedrooms: 3,
    verifiedBathrooms: 2,
    accessMethod: "customer_present",
    airConditioningUnits: 0,
    kitchenCount: 1,
    livingSpaceCount: 1,
    outsideSpaces: [],
    verifiedCondition: "standard",
    services: ["maintenance_cleaning"],
    recurringCleaningDurationMinutes: 180,
    proposedPlan: "Bi-weekly maintenance cleaning",
    proposedRecurringCents: 28000,
    additionalServiceFeesCents: 0,
    initialDeepCleanRequired: false,
    propertyConditionNotes: "Property inspected room by room.",
    customerCleaningInstructions: "Use the smart lock at the main entrance.",
    assessmentNotes: "All required steps discussed with the customer.",
    assessmentOutcome: "eligible",
    customerConfirmed: true,
    customerConfirmationName: "Test Customer",
    customerIdType: "national_id",
  };
}

test("a complete assessment accepts explicit zero counts", () => {
  const result = validateAssessmentFieldSubmission(complete());
  assert.equal(result.ok, true);
});

test("all property, service, notes and customer confirmation fields are mandatory", () => {
  for (const key of ["airConditioningUnits", "services", "assessmentNotes", "customerConfirmationName"] as const) {
    const input = complete();
    if (key === "services") input.services = [];
    else if (key === "airConditioningUnits") (input as Record<string, unknown>)[key] = null;
    else (input as Record<string, unknown>)[key] = "";
    assert.equal(validateAssessmentFieldSubmission(input).ok, false, key);
  }
});

test("customer identity confirmation cannot be self-asserted without the confirmation checkbox", () => {
  assert.deepEqual(
    validateAssessmentFieldSubmission({ ...complete(), customerConfirmed: false }),
    { ok: false, error: "assessment_customer_confirmation_required" },
  );
});
