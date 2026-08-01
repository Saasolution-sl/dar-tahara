import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";

/**
 * DB-backed billing policy, with hardcoded defaults as a fallback — same
 * shape as feature-flags.ts's getFeatureFlags() and
 * subscription-duration-config.ts's getDurationTiers(). A thin DB round
 * trip with no logic of its own; the logic that consumes it
 * (billing-lifecycle.ts) is what's unit-tested.
 */

/** `earlyTerminationPolicy.unpaidSettlementAction` — what happens when a final-settlement invoice goes unpaid past its window. */
export type UnpaidSettlementAction = "continue_contract" | "terminate_and_escalate" | "manual_review";

export type BillingPolicy = {
  /** How many failed automatic Stripe attempts before services are suspended. */
  maxAutomaticAttemptsBeforeSuspension: number;
  /** How many days each generated payment link stays valid. */
  paymentLinkWindowDays: number;
  /** How many hours a cancellation-preview quote (early_termination_calculations row) stays valid before the customer must re-preview. */
  cancellationPreviewWindowHours: number;
  /** Final-settlement invoices are due within this many days of cancellation confirmation. */
  finalSettlementPaymentWindowDays: number;
  /** Fully prepaid renewals are requested this many days before the paid term ends. */
  prepaidRenewalLeadDays: number;
  /** What happens when a final-settlement invoice is not paid within its window. */
  unpaidSettlementAction: UnpaidSettlementAction;
  /** Whether confirming cancellation stops future services immediately vs. at period end. */
  stopServicesImmediately: boolean;
  deepCleanRecoveryEnabled: boolean;
  earlyTerminationEnabled: boolean;
};

export const DEFAULT_BILLING_POLICY: BillingPolicy = {
  maxAutomaticAttemptsBeforeSuspension: 2,
  paymentLinkWindowDays: 7,
  cancellationPreviewWindowHours: 48,
  finalSettlementPaymentWindowDays: 14,
  prepaidRenewalLeadDays: 30,
  unpaidSettlementAction: "continue_contract",
  stopServicesImmediately: true,
  deepCleanRecoveryEnabled: true,
  earlyTerminationEnabled: true,
};

type BillingPolicyRow = {
  max_automatic_attempts_before_suspension: number;
  payment_link_window_days: number;
  cancellation_preview_window_hours: number;
  final_settlement_payment_window_days: number;
  prepaid_renewal_lead_days: number;
  unpaid_settlement_action: UnpaidSettlementAction;
  stop_services_immediately: boolean;
  deep_clean_recovery_enabled: boolean;
  early_termination_enabled: boolean;
};

export async function getBillingPolicy(): Promise<BillingPolicy> {
  try {
    const rows = await serviceSelect<BillingPolicyRow[]>(
      "billing_policy_settings?select=max_automatic_attempts_before_suspension,payment_link_window_days,cancellation_preview_window_hours,final_settlement_payment_window_days,prepaid_renewal_lead_days,unpaid_settlement_action,stop_services_immediately,deep_clean_recovery_enabled,early_termination_enabled&limit=1",
    );
    const row = rows[0];
    if (!row) return DEFAULT_BILLING_POLICY;
    return {
      maxAutomaticAttemptsBeforeSuspension: row.max_automatic_attempts_before_suspension,
      paymentLinkWindowDays: row.payment_link_window_days,
      cancellationPreviewWindowHours: row.cancellation_preview_window_hours,
      finalSettlementPaymentWindowDays: row.final_settlement_payment_window_days,
      prepaidRenewalLeadDays: row.prepaid_renewal_lead_days,
      unpaidSettlementAction: row.unpaid_settlement_action,
      stopServicesImmediately: row.stop_services_immediately,
      deepCleanRecoveryEnabled: row.deep_clean_recovery_enabled,
      earlyTerminationEnabled: row.early_termination_enabled,
    };
  } catch {
    return DEFAULT_BILLING_POLICY;
  }
}
