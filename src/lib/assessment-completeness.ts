export type AssessmentPropertyFindings = {
  propertyType: string | null;
  sizeM2: number | null;
  rooms: number | null;
  accessMethod: string | null;
  airConditioningUnits: number | null;
  kitchenCount: number | null;
  livingSpaceCount: number | null;
  outsideSpaces: string[] | null;
};

export type AssessmentCompletionInput = {
  scheduledAt: string | null;
  completedAt: string | null;
  employeeId: string | null;
  employeeNumber: string | null;
  findings: AssessmentPropertyFindings | null;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function isNonNegativeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function validateAssessmentCompletion(
  input: AssessmentCompletionInput,
  requirePreviouslyCompleted = false,
) {
  if (!input.scheduledAt || !Number.isFinite(Date.parse(input.scheduledAt))) {
    return "assessment_schedule_required";
  }
  if (!input.employeeId) return "assessment_employee_required";
  if (!hasText(input.employeeNumber)) {
    return "assessment_employee_number_required";
  }
  if (requirePreviouslyCompleted && !input.completedAt) {
    return "assessment_completion_required";
  }
  if (!input.findings) return "assessment_property_fields_required";

  const findings = input.findings;
  if (
    !hasText(findings.propertyType) ||
    !hasText(findings.accessMethod) ||
    !isNonNegativeNumber(findings.sizeM2) ||
    !isNonNegativeNumber(findings.rooms) ||
    !isNonNegativeNumber(findings.airConditioningUnits) ||
    !isNonNegativeNumber(findings.kitchenCount) ||
    !isNonNegativeNumber(findings.livingSpaceCount) ||
    !Array.isArray(findings.outsideSpaces)
  ) {
    return "assessment_property_fields_required";
  }

  return null;
}
