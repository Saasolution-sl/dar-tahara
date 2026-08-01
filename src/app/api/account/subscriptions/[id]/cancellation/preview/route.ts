import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { getBillingPolicy } from "@/lib/billing-policy";
import { computeExpiryInHours } from "@/lib/billing-lifecycle";
import { getDurationTiers } from "@/lib/subscription-duration-config";
import { findDurationTier, type DurationTier } from "@/lib/subscription-duration";
import {
  calculateEarlyTermination,
  determineContractCycleState,
  evaluateEarlyTerminationEligibility,
  summarizeSettlementInvoiceAllocations,
} from "@/lib/early-termination-calculator";
import { calculateDeepCleanPriceCents } from "@/lib/deep-clean-pricing";
import { isSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

type SubscriptionRow = {
  id: string;
  customer_id: string;
  status: string;
  frequency: string;
  billing_interval: "monthly" | "annual";
  contract_duration_months: number | null;
  activated_at: string | null;
  pause_months_used: number;
  price_before_duration_discount_cents: number | null;
  currency: string;
  deep_clean_free_used: boolean;
  cancellation_status: string | null;
  original_contract_end_date: string | null;
  current_contract_end_date: string | null;
  pricing_snapshot: unknown;
  pricing_version: string | null;
  terms_version: string | null;
  properties:
    | { address_line1: string; city: string; declared_size_m2: number }[]
    | { address_line1: string; city: string; declared_size_m2: number }
    | null;
};

type InvoiceRow = {
  id: string;
  status: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  period_start: string | null;
  period_end: string | null;
};

function isDurationTier(value: unknown): value is DurationTier {
  if (!value || typeof value !== "object") return false;
  const tier = value as Partial<DurationTier>;
  return typeof tier.code === "string"
    && typeof tier.months === "number"
    && typeof tier.discountPercentage === "number"
    && typeof tier.enabled === "boolean"
    && typeof tier.includesFreeDeepClean === "boolean";
}

function agreementTiers(snapshot: unknown, configuredTiers: DurationTier[]): DurationTier[] {
  if (!snapshot || typeof snapshot !== "object") return configuredTiers;
  const tiers = (snapshot as { durationTiers?: unknown }).durationTiers;
  return Array.isArray(tiers) && tiers.length > 0 && tiers.every(isDurationTier)
    ? tiers
    : configuredTiers;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  }
  const auth = await authorizeApi(["customer", "staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!auth.context.customerId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  }

  const rows = await serviceSelect<SubscriptionRow[]>(
    `subscriptions?id=eq.${id}&select=id,customer_id,status,frequency,billing_interval,contract_duration_months,activated_at,pause_months_used,price_before_duration_discount_cents,currency,deep_clean_free_used,cancellation_status,original_contract_end_date,current_contract_end_date,pricing_snapshot,pricing_version,terms_version,properties(address_line1,city,declared_size_m2)&limit=1`,
  );
  const subscription = rows[0];
  if (!subscription || subscription.customer_id !== auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const now = new Date();
  const contractEnd = subscription.current_contract_end_date
    || subscription.original_contract_end_date;
  const eligibility = evaluateEarlyTerminationEligibility({
    billingMethod: subscription.billing_interval === "annual" ? "prepaid" : "monthly",
    contractDurationMonths: subscription.contract_duration_months,
    activatedAt: subscription.activated_at ? new Date(subscription.activated_at) : null,
    contractEndAt: contractEnd ? new Date(contractEnd) : null,
    asOf: now,
    subscriptionStatus: subscription.status,
    cancellationStatus: subscription.cancellation_status,
  });
  if (!eligibility.eligible) {
    const status = eligibility.reason === "already_terminated" ? 409 : 422;
    return NextResponse.json({ error: eligibility.reason }, { status });
  }

  const policy = await getBillingPolicy();
  if (!policy.earlyTerminationEnabled) {
    return NextResponse.json({ error: "feature_disabled" }, { status: 403 });
  }

  const configuredTiers = await getDurationTiers();
  const tiers = agreementTiers(subscription.pricing_snapshot, configuredTiers);
  const originalTier = findDurationTier(tiers, subscription.contract_duration_months!);
  if (!originalTier || !subscription.activated_at || subscription.price_before_duration_discount_cents == null) {
    return NextResponse.json({ error: "tier_configuration_error" }, { status: 500 });
  }

  const invoiceRows = await serviceSelect<InvoiceRow[]>(
    `invoices?subscription_id=eq.${id}&invoice_type=eq.standard&included_in_settlement_id=is.null&select=id,status,amount_due_cents,amount_paid_cents,period_start,period_end`,
  );
  const cycle = determineContractCycleState(
    new Date(subscription.activated_at),
    subscription.pause_months_used,
    now,
  );
  const allocation = summarizeSettlementInvoiceAllocations(
    invoiceRows.map((invoice) => ({
      id: invoice.id,
      status: invoice.status,
      amountDueCents: invoice.amount_due_cents,
      amountPaidCents: invoice.amount_paid_cents,
      periodStart: invoice.period_start ? new Date(invoice.period_start) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end) : null,
    })),
    cycle.currentPeriodStart,
  );

  const property = Array.isArray(subscription.properties)
    ? subscription.properties[0]
    : subscription.properties;
  const retailPriceCents = property
    ? calculateDeepCleanPriceCents(property.declared_size_m2)
    : null;
  const result = calculateEarlyTermination({
    activatedAt: new Date(subscription.activated_at),
    pauseMonthsUsed: subscription.pause_months_used,
    asOf: now,
    originalTier,
    tiers,
    priceBeforeDurationDiscountCents: subscription.price_before_duration_discount_cents,
    currency: subscription.currency,
    amountPreviouslyPaidCents: allocation.completedPeriodPaymentsCents,
    paymentsAllocatedToRemainingTermCents: allocation.remainingTermPaymentsCents,
    includedInvoiceOutstandingCents: allocation.includedInvoiceOutstandingCents,
    includedInvoiceIds: allocation.includedInvoiceIds,
    deepClean: {
      used: policy.deepCleanRecoveryEnabled && subscription.deep_clean_free_used,
      retailPriceCents,
    },
  });

  await serviceUpdate(
    "early_termination_calculations",
    `subscription_id=eq.${id}&status=in.(pending,review_required)`,
    { status: "superseded" },
  );

  const expiresAt = computeExpiryInHours(now, policy.cancellationPreviewWindowHours);
  const pricingSnapshot = {
    agreement: subscription.pricing_snapshot,
    pricingVersion: subscription.pricing_version,
    priceBeforeDurationDiscountCents: subscription.price_before_duration_discount_cents,
    originalTier: result.originalTier,
    replacementTier: result.replacementTier,
    calculatedAt: now.toISOString(),
  };
  const [calculation] = await serviceInsert<{ id: string }[]>(
    "early_termination_calculations",
    {
      subscription_id: id,
      customer_id: auth.context.customerId,
      original_term_code: originalTier.code,
      elapsed_months: result.completedMonths,
      reclassified_term_code: result.replacementTier.code,
      replacement_term_code: result.replacementTier.code,
      completed_months: result.completedMonths,
      current_contract_month: result.currentContractMonth,
      original_monthly_amount_cents: result.originalMonthlyCents,
      replacement_monthly_amount_cents: result.replacementMonthlyCents,
      amount_previously_paid_cents: result.amountPreviouslyPaidCents,
      recalculated_consumed_amount_cents: result.recalculatedConsumedPeriodCents,
      discount_correction_cents: result.discountCorrectionCents,
      remaining_minimum_months: result.remainingMinimumMonths,
      remaining_minimum_charge_cents: result.remainingMinimumTermAmountCents,
      remaining_minimum_term_amount_cents: result.remainingMinimumTermAmountCents,
      payments_allocated_to_remaining_term_cents: result.paymentsAllocatedToRemainingTermCents,
      outstanding_invoice_total_cents: result.includedInvoiceOutstandingCents,
      included_invoice_outstanding_cents: result.includedInvoiceOutstandingCents,
      included_invoice_ids: result.includedInvoiceIds,
      additional_charges_cents: result.additionalChargesCents,
      deep_clean_recovery_cents: result.deepCleanRecoveryCents,
      credits_cents: result.creditsCents,
      settlement_payments_received_cents: result.settlementPaymentsAlreadyReceivedCents,
      raw_total_cents: result.rawTotalCents,
      total_cents: result.totalCents,
      credit_review_required: result.creditReviewRequired,
      currency: result.currency,
      pricing_snapshot: pricingSnapshot,
      calculation_snapshot: result,
      terms_version: subscription.terms_version,
      status: result.creditReviewRequired ? "review_required" : "pending",
      expires_at: expiresAt.toISOString(),
    },
  );

  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: result.creditReviewRequired
      ? "early_termination_credit_review_required"
      : "early_termination_calculation_generated",
    resource_type: "subscription",
    resource_id: id,
    previous_value: null,
    new_value: {
      calculation_id: calculation?.id,
      total_cents: result.totalCents,
      raw_total_cents: result.rawTotalCents,
      included_invoice_ids: result.includedInvoiceIds,
    },
  });

  return NextResponse.json({
    calculationId: calculation?.id,
    expiresAt: expiresAt.toISOString(),
    contract: {
      frequency: subscription.frequency,
      property: property ? `${property.address_line1}, ${property.city}` : id,
      startDate: subscription.activated_at,
      originalEndDate: subscription.original_contract_end_date,
      originalTermMonths: originalTier.months,
      completedMonths: result.completedMonths,
      currentMonth: result.currentContractMonth,
      originalDiscountPercentage: originalTier.discountPercentage,
    },
    breakdown: result,
  });
}
