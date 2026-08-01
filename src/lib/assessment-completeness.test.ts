import assert from "node:assert/strict";
import test from "node:test";
import {
  validateAssessmentCompletion,
  type AssessmentCompletionInput,
} from "./assessment-completeness";

function completeInput(
  overrides: Partial<AssessmentCompletionInput> = {},
): AssessmentCompletionInput {
  return {
    scheduledAt: "2026-08-03T09:00:00.000Z",
    completedAt: "2026-08-03T11:00:00.000Z",
    employeeId: "00000000-0000-0000-0000-000000000001",
    employeeNumber: "EMP-1001",
    findings: {
      propertyType: "apartment",
      sizeM2: 90,
      rooms: 3,
      accessMethod: "customer_present",
      airConditioningUnits: 0,
      kitchenCount: 1,
      livingSpaceCount: 1,
      outsideSpaces: [],
    },
    ...overrides,
  };
}

test("zero is a completed and valid assessment count", () => {
  assert.equal(validateAssessmentCompletion(completeInput()), null);
});

test("an assessment cannot complete without a scheduled date", () => {
  assert.equal(
    validateAssessmentCompletion(completeInput({ scheduledAt: null })),
    "assessment_schedule_required",
  );
});

test("an assessment cannot complete without an identified employee", () => {
  assert.equal(
    validateAssessmentCompletion(completeInput({ employeeId: null })),
    "assessment_employee_required",
  );
  assert.equal(
    validateAssessmentCompletion(completeInput({ employeeNumber: " " })),
    "assessment_employee_number_required",
  );
});

test("approval requires an earlier completed assessment", () => {
  assert.equal(
    validateAssessmentCompletion(completeInput({ completedAt: null }), true),
    "assessment_completion_required",
  );
});

test("all property findings must be explicit", () => {
  const input = completeInput();
  assert.equal(
    validateAssessmentCompletion({
      ...input,
      findings: {
        ...input.findings!,
        airConditioningUnits: null,
      },
    }),
    "assessment_property_fields_required",
  );
});
