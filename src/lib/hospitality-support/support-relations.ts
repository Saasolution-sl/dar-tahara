import type { SupportCategory } from "./types";

export type SupportRelatedField = "property" | "subscription" | "invoice" | "appointment" | "payment";

const RELATED_FIELDS_BY_CATEGORY = {
  cleaning_service: ["property", "appointment"],
  subscription: ["subscription"],
  appointment: ["appointment"],
  invoice: ["invoice"],
  payment: ["payment", "invoice"],
  key_management: ["property", "appointment"],
  smart_lock: ["property"],
  property_details: ["property"],
  employee_feedback: ["appointment", "property"],
  damage_missing_item: ["appointment", "property"],
  complaint: ["appointment", "property"],
  technical_issue: ["property"],
  account_access: [],
  other: [],
} as const satisfies Record<SupportCategory, readonly SupportRelatedField[]>;

export function relatedFieldsForCategory(category: SupportCategory | ""): readonly SupportRelatedField[] {
  return category ? RELATED_FIELDS_BY_CATEGORY[category] : [];
}
