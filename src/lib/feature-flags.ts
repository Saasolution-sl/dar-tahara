import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import { redirect } from "next/navigation";
import { isActive } from "@/lib/feature-flag-state";

export { isActive } from "@/lib/feature-flag-state";

export const FEATURE_KEYS = [
  "ai_assistant_enabled",
  "initial_assessment_booking_enabled",
  "early_access_enabled",
  "customer_registration_enabled",
  "customer_portal_enabled",
  "subscription_checkout_enabled",
  "annual_subscription_enabled",
  "monthly_subscription_enabled",
  "whatsapp_contact_enabled",
  "newsletter_signup_enabled",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type FeatureFlag = {
  key: FeatureKey;
  name: string;
  description: string;
  enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  public_disabled_message: string | null;
  fallback_cta_label: string | null;
  fallback_cta_url: string | null;
  updated_at: string;
  updated_by: string | null;
};

const defaults: Record<FeatureKey, Omit<FeatureFlag, "key">> = Object.fromEntries(
  FEATURE_KEYS.map((key) => [key, {
    name: key === "ai_assistant_enabled" ? "AI Assistant" : key.replaceAll("_", " "),
    description: key === "ai_assistant_enabled"
      ? "Controls whether the Dar Tahara AI Assistant is available to customers and website visitors."
      : "",
    enabled: [
      "ai_assistant_enabled",
      "early_access_enabled", "customer_registration_enabled", "annual_subscription_enabled",
      "monthly_subscription_enabled", "whatsapp_contact_enabled", "newsletter_signup_enabled",
    ].includes(key), starts_at: null, ends_at: null,
    public_disabled_message: key === "initial_assessment_booking_enabled"
      ? "Initial home assessments are not yet open for direct booking. Join early access and we will contact you when assessments become available in your area."
      : key === "ai_assistant_enabled"
        ? "Our automated assistant is temporarily unavailable. Please contact Dar Tahara Support."
        : null,
    fallback_cta_label: key === "initial_assessment_booking_enabled"
      ? "Join Early Access"
      : key === "ai_assistant_enabled" ? "Contact Support" : null,
    fallback_cta_url: key === "initial_assessment_booking_enabled"
      ? "/early-access"
      : key === "ai_assistant_enabled" ? "/#contact" : null,
    updated_at: new Date(0).toISOString(), updated_by: null,
  }]),
) as Record<FeatureKey, Omit<FeatureFlag, "key">>;

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const rows = await serviceSelect<FeatureFlag[]>(
      "feature_flags?select=key,name,description,enabled,starts_at,ends_at,public_disabled_message,fallback_cta_label,fallback_cta_url,updated_at,updated_by&order=key.asc",
    );
    const byKey = new Map(rows.map((row) => [row.key, row]));
    return FEATURE_KEYS.map((key) => byKey.get(key) || { key, ...defaults[key] });
  } catch {
    return FEATURE_KEYS.map((key) => ({ key, ...defaults[key] }));
  }
}

export async function getFeatureFlag(key: FeatureKey): Promise<FeatureFlag> {
  const flags = await getFeatureFlags();
  return flags.find((flag) => flag.key === key) || { key, ...defaults[key] };
}

export async function featureEnabled(key: FeatureKey): Promise<boolean> {
  return isActive(await getFeatureFlag(key));
}

export async function requireCustomerPortal(): Promise<void> {
  if (!await featureEnabled("customer_portal_enabled")) redirect("/account/assessments?portal=disabled");
}

export type PublicFeatureState = {
  assessmentBookingEnabled: boolean;
  earlyAccessEnabled: boolean;
  monthlySubscriptionEnabled: boolean;
  annualSubscriptionEnabled: boolean;
  whatsappEnabled: boolean;
  fallbackLabel: string;
  fallbackUrl: string;
  disabledMessage: string;
};

export async function getPublicFeatureState(locale: string): Promise<PublicFeatureState> {
  const flags = await getFeatureFlags();
  const byKey = new Map(flags.map((flag) => [flag.key, flag]));
  const assessment = byKey.get("initial_assessment_booking_enabled")!;
  const rawUrl = assessment.fallback_cta_url || "/early-access";
  const fallbackUrl = rawUrl.startsWith("/") && !rawUrl.startsWith(`/${locale}`)
    ? `/${locale}${rawUrl}` : rawUrl;
  return {
    assessmentBookingEnabled: isActive(assessment),
    earlyAccessEnabled: isActive(byKey.get("early_access_enabled")!),
    monthlySubscriptionEnabled: isActive(byKey.get("monthly_subscription_enabled")!),
    annualSubscriptionEnabled: isActive(byKey.get("annual_subscription_enabled")!),
    whatsappEnabled: isActive(byKey.get("whatsapp_contact_enabled")!),
    fallbackLabel: assessment.fallback_cta_label || "Join Early Access",
    fallbackUrl,
    disabledMessage: assessment.public_disabled_message || "Initial assessment booking is currently unavailable.",
  };
}
