export const ASSESSMENT_PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "riad",
  "office",
  "other",
] as const;

export const ASSESSMENT_ACCESS_METHODS = [
  "customer_present",
  "representative_present",
  "smart_lock",
  "physical_key",
  "concierge",
  "other",
] as const;

export const ASSESSMENT_OUTCOMES = [
  "eligible",
  "requires_adjustment",
  "not_eligible",
] as const;

export const ASSESSMENT_SERVICES = [
  "maintenance_cleaning",
  "deep_cleaning",
  "window_cleaning",
  "laundry",
  "linen_change",
  "terrace_cleaning",
  "post_construction_cleaning",
  "cleaning_supplies",
  "toilet_paper_restocking",
  "smart_lock_access",
  "physical_key_handling",
] as const;

export const CUSTOMER_ID_TYPES = [
  "national_id",
  "passport",
  "residence_permit",
  "company_representative_id",
] as const;

export type AssessmentFieldSubmission = {
  propertyType: string;
  verifiedSizeM2: number;
  verifiedBedrooms: number;
  verifiedBathrooms: number;
  accessMethod: string;
  airConditioningUnits: number;
  kitchenCount: number;
  livingSpaceCount: number;
  outsideSpaces: string[];
  verifiedCondition: string;
  services: string[];
  recurringCleaningDurationMinutes: number;
  proposedPlan: string;
  proposedRecurringCents: number;
  additionalServiceFeesCents: number;
  initialDeepCleanRequired: boolean;
  propertyConditionNotes: string;
  customerCleaningInstructions: string;
  assessmentNotes: string;
  assessmentOutcome: string;
  customerConfirmationName: string;
  customerIdType: string;
};

export type AssessmentFieldValidation =
  | { ok: true; value: AssessmentFieldSubmission }
  | { ok: false; error: string };

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function number(value: unknown, min: number, max: number) {
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : Number.NaN;
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export function validateAssessmentFieldSubmission(body: unknown): AssessmentFieldValidation {
  if (!body || typeof body !== "object") return { ok: false, error: "bad_request" };
  const input = body as Record<string, unknown>;
  const propertyType = text(input.propertyType, 80);
  const accessMethod = text(input.accessMethod, 80);
  const assessmentOutcome = text(input.assessmentOutcome, 80);
  const verifiedCondition = text(input.verifiedCondition, 80);
  const proposedPlan = text(input.proposedPlan, 2000);
  const propertyConditionNotes = text(input.propertyConditionNotes, 5000);
  const customerCleaningInstructions = text(input.customerCleaningInstructions, 3000);
  const assessmentNotes = text(input.assessmentNotes, 5000);
  const customerConfirmationName = text(input.customerConfirmationName, 200);
  const customerIdType = text(input.customerIdType, 80);
  const services = Array.isArray(input.services)
    ? input.services.filter((item): item is string =>
        typeof item === "string" && (ASSESSMENT_SERVICES as readonly string[]).includes(item),
      )
    : [];
  const outsideSpaces = Array.isArray(input.outsideSpaces)
    ? input.outsideSpaces
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, 80))
        .filter(Boolean)
    : null;

  const verifiedSizeM2 = number(input.verifiedSizeM2, 20, 5000);
  const verifiedBedrooms = number(input.verifiedBedrooms, 0, 50);
  const verifiedBathrooms = number(input.verifiedBathrooms, 0, 50);
  const airConditioningUnits = number(input.airConditioningUnits, 0, 100);
  const kitchenCount = number(input.kitchenCount, 0, 50);
  const livingSpaceCount = number(input.livingSpaceCount, 0, 50);
  const recurringCleaningDurationMinutes = number(input.recurringCleaningDurationMinutes, 15, 1440);
  const proposedRecurringCents = number(input.proposedRecurringCents, 0, 10_000_000);
  const additionalServiceFeesCents = number(input.additionalServiceFeesCents, 0, 10_000_000);

  if (!(ASSESSMENT_PROPERTY_TYPES as readonly string[]).includes(propertyType) || !(ASSESSMENT_ACCESS_METHODS as readonly string[]).includes(accessMethod)) {
    return { ok: false, error: "assessment_property_fields_required" };
  }
  if ([verifiedSizeM2, verifiedBedrooms, verifiedBathrooms, airConditioningUnits, kitchenCount, livingSpaceCount].some((value) => value === null) || outsideSpaces === null) {
    return { ok: false, error: "assessment_property_fields_required" };
  }
  if (!verifiedCondition || !proposedPlan || !propertyConditionNotes || !customerCleaningInstructions || !assessmentNotes || services.length === 0 || recurringCleaningDurationMinutes === null || proposedRecurringCents === null || additionalServiceFeesCents === null || !(ASSESSMENT_OUTCOMES as readonly string[]).includes(assessmentOutcome)) {
    return { ok: false, error: "assessment_service_fields_required" };
  }
  if (input.customerConfirmed !== true || !customerConfirmationName || !(CUSTOMER_ID_TYPES as readonly string[]).includes(customerIdType)) {
    return { ok: false, error: "assessment_customer_confirmation_required" };
  }

  return {
    ok: true,
    value: {
      propertyType,
      verifiedSizeM2: verifiedSizeM2!,
      verifiedBedrooms: verifiedBedrooms!,
      verifiedBathrooms: verifiedBathrooms!,
      accessMethod,
      airConditioningUnits: airConditioningUnits!,
      kitchenCount: kitchenCount!,
      livingSpaceCount: livingSpaceCount!,
      outsideSpaces,
      verifiedCondition,
      services: Array.from(new Set(services)),
      recurringCleaningDurationMinutes: recurringCleaningDurationMinutes!,
      proposedPlan,
      proposedRecurringCents: proposedRecurringCents!,
      additionalServiceFeesCents: additionalServiceFeesCents!,
      initialDeepCleanRequired: input.initialDeepCleanRequired === true,
      propertyConditionNotes,
      customerCleaningInstructions,
      assessmentNotes,
      assessmentOutcome,
      customerConfirmationName,
      customerIdType,
    },
  };
}
