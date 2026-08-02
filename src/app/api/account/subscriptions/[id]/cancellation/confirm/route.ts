import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import {
  serviceInsert,
  serviceInsertIgnoreDuplicates,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";
import { getBillingPolicy } from "@/lib/billing-policy";
import { computeExpiryInDays, isPaymentLinkExpired } from "@/lib/billing-lifecycle";
import { createPaymentLinkRecord } from "@/lib/billing-links";
import { cancelStripeSubscription } from "@/lib/stripe";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { formatMoneyFromCents, TERMS_VERSION } from "@/lib/assessment";
import { isSameOrigin } from "@/lib/request-security";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";

type CalculationSnapshot = {
  completedMonths: number;
  originalTier: { months: number };
  replacementTier: { months: number };
  originalMonthlyCents: number;
  replacementMonthlyCents: number;
  amountPreviouslyPaidCents: number;
  discountCorrectionCents: number;
  remainingMinimumMonths: number;
  remainingMinimumTermAmountCents: number;
  additionalChargesCents: number;
  deepCleanRecoveryCents: number;
  creditsCents: number;
  totalCents: number;
};

type CalculationRow = {
  id: string;
  subscription_id: string;
  customer_id: string;
  status: string;
  expires_at: string;
  total_cents: number;
  currency: string;
  original_term_code: string;
  replacement_term_code: string;
  included_invoice_ids: string[];
  calculation_snapshot: CalculationSnapshot;
  settlement_invoice_id: string | null;
};

type SubscriptionRow = {
  id: string;
  customer_id: string;
  status: string;
  billing_interval: "monthly" | "annual";
  cancellation_status: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  customers: { email: string; full_name: string; preferred_language: Locale };
};

type SettlementInvoiceRow = {
  id: string;
  invoice_number: string | null;
  amount_due_cents: number;
};

function idsFilter(ids: string[]): string | null {
  const valid = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  return valid.length > 0 ? `id=in.(${valid.join(",")})` : null;
}

async function activePaymentUrl(invoiceId: string): Promise<string | null> {
  const rows = await serviceSelect<{ token: string }[]>(
    `payment_links?invoice_id=eq.${invoiceId}&status=eq.active&order=created_at.desc&select=token&limit=1`,
  );
  const token = rows[0]?.token;
  if (!token) return null;
  const root = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dartahara.com").replace(/\/$/, "");
  return `${root}/api/account/invoices/pay-link/${token}`;
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
  const body = (await req.json().catch(() => ({}))) as { calculationId?: string };
  const calculationId = body.calculationId;
  if (
    !/^[0-9a-f-]{36}$/i.test(id)
    || !calculationId
    || !/^[0-9a-f-]{36}$/i.test(calculationId)
  ) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const calculationRows = await serviceSelect<CalculationRow[]>(
    `early_termination_calculations?id=eq.${calculationId}&select=id,subscription_id,customer_id,status,expires_at,total_cents,currency,original_term_code,replacement_term_code,included_invoice_ids,calculation_snapshot,settlement_invoice_id&limit=1`,
  );
  const calculation = calculationRows[0];
  if (
    !calculation
    || calculation.subscription_id !== id
    || calculation.customer_id !== auth.context.customerId
  ) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (calculation.status === "review_required") {
    return NextResponse.json({ error: "credit_review_required" }, { status: 409 });
  }
  if (
    (calculation.status === "accepted" || calculation.status === "settled")
    && calculation.settlement_invoice_id
  ) {
    return NextResponse.json({
      ok: true,
      settlementRequired: true,
      settlementInvoiceId: calculation.settlement_invoice_id,
      payUrl: await activePaymentUrl(calculation.settlement_invoice_id),
      totalCents: calculation.total_cents,
      duplicate: true,
    });
  }
  if (calculation.status === "settled" && calculation.total_cents === 0) {
    return NextResponse.json({
      ok: true,
      settlementRequired: false,
      totalCents: 0,
      duplicate: true,
    });
  }
  if (calculation.status !== "pending") {
    return NextResponse.json({ error: "calculation_not_pending" }, { status: 409 });
  }
  if (isPaymentLinkExpired(calculation.expires_at, new Date())) {
    await serviceUpdate(
      "early_termination_calculations",
      `id=eq.${calculation.id}&status=eq.pending`,
      { status: "expired" },
    );
    return NextResponse.json({ error: "calculation_expired" }, { status: 409 });
  }

  const subscriptionRows = await serviceSelect<SubscriptionRow[]>(
    `subscriptions?id=eq.${id}&select=id,customer_id,status,billing_interval,cancellation_status,stripe_subscription_id,current_period_end,customers(email,full_name,preferred_language)&limit=1`,
  );
  const subscription = subscriptionRows[0];
  if (!subscription || subscription.customer_id !== auth.context.customerId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (subscription.billing_interval !== "monthly") {
    return NextResponse.json({ error: "prepaid_contract" }, { status: 422 });
  }
  if (
    subscription.status === "cancelled"
    || subscription.cancellation_status === "settled"
  ) {
    return NextResponse.json({ error: "already_cancelled" }, { status: 409 });
  }

  const policy = await getBillingPolicy();
  const now = new Date();
  const locale = subscription.customers.preferred_language;
  const effectiveAt = policy.stopServicesImmediately
    ? now
    : new Date(subscription.current_period_end || now);
  const includedFilter = idsFilter(calculation.included_invoice_ids || []);

  if (calculation.total_cents === 0) {
    const claimed = await serviceUpdate<{ id: string }[]>(
      "early_termination_calculations",
      `id=eq.${calculation.id}&status=eq.pending`,
      {
        status: "settled",
        confirmed_at: now.toISOString(),
        terms_version: TERMS_VERSION,
      },
    );
    if (claimed.length === 0) {
      return NextResponse.json({
        ok: true,
        settlementRequired: false,
        totalCents: 0,
        duplicate: true,
      });
    }
    if (includedFilter) {
      await serviceUpdate("invoices", includedFilter, {
        status: "included_in_settlement",
        included_in_settlement_id: calculation.id,
      });
      await serviceUpdate(
        "payment_links",
        `invoice_id=in.(${calculation.included_invoice_ids.join(",")})&status=eq.active`,
        { status: "invalidated", invalidated_at: now.toISOString() },
      );
    }
    await serviceUpdate("subscriptions", `id=eq.${id}`, {
      cancellation_status: "settled",
      cancellation_requested_at: now.toISOString(),
      cancellation_effective_at: effectiveAt.toISOString(),
      original_term_code: calculation.original_term_code,
      termination_reason: "customer_early_termination",
      termination_calculation_id: calculation.id,
      status: policy.stopServicesImmediately ? "cancelled" : subscription.status,
      cancelled_at: policy.stopServicesImmediately ? now.toISOString() : null,
      operational_status: policy.stopServicesImmediately ? "cancellation_pending" : "active",
    });
    if (policy.stopServicesImmediately && subscription.stripe_subscription_id) {
      try {
        await cancelStripeSubscription({
          subscriptionId: subscription.stripe_subscription_id,
          idempotencyKey: `cancel_${id}`,
        });
      } catch (error) {
        console.error(
          "[cancellation-confirm] stripe cancel failed",
          error instanceof Error ? error.message : "unknown",
        );
      }
    }
    await sendTransactionalEmail({
      template: "cancellation_completed",
      locale,
      email: subscription.customers.email,
      name: subscription.customers.full_name,
      reference: id.slice(0, 8).toUpperCase(),
    });
    await serviceInsert("audit_logs", {
      actor_user_id: auth.context.user.id,
      action: "cancellation_confirmed_no_settlement_owed",
      resource_type: "subscription",
      resource_id: id,
      previous_value: { cancellation_status: subscription.cancellation_status },
      new_value: {
        cancellation_status: "settled",
        calculation_id: calculation.id,
        included_invoice_ids: calculation.included_invoice_ids,
      },
    });
    return NextResponse.json({ ok: true, settlementRequired: false, totalCents: 0 });
  }

  const invoiceNumber = `ETS-${now.getUTCFullYear()}-${calculation.id.slice(0, 8).toUpperCase()}`;
  const dueAt = computeExpiryInDays(
    now,
    policy.finalSettlementPaymentWindowDays,
  );
  const inserted = await serviceInsertIgnoreDuplicates<SettlementInvoiceRow[]>(
    "invoices",
    {
      customer_id: subscription.customer_id,
      subscription_id: id,
      invoice_number: invoiceNumber,
      invoice_type: "early_termination_settlement",
      is_final_settlement: true,
      early_termination_calculation_id: calculation.id,
      status: "open",
      amount_due_cents: calculation.total_cents,
      amount_paid_cents: 0,
      currency: calculation.currency,
      due_at: dueAt.toISOString(),
      invoice_details: calculation.calculation_snapshot,
    },
    "early_termination_calculation_id",
  );
  let settlementInvoice = inserted[0];
  if (!settlementInvoice) {
    const existing = await serviceSelect<SettlementInvoiceRow[]>(
      `invoices?early_termination_calculation_id=eq.${calculation.id}&select=id,invoice_number,amount_due_cents&limit=1`,
    );
    settlementInvoice = existing[0];
  }
  if (!settlementInvoice) {
    return NextResponse.json({ error: "settlement_invoice_failed" }, { status: 500 });
  }

  const claimed = await serviceUpdate<{ id: string }[]>(
    "early_termination_calculations",
    `id=eq.${calculation.id}&status=eq.pending`,
    {
      status: "accepted",
      confirmed_at: now.toISOString(),
      terms_version: TERMS_VERSION,
      settlement_invoice_id: settlementInvoice.id,
    },
  );
  if (claimed.length === 0) {
    return NextResponse.json({
      ok: true,
      settlementRequired: true,
      settlementInvoiceId: settlementInvoice.id,
      payUrl: await activePaymentUrl(settlementInvoice.id),
      totalCents: calculation.total_cents,
      duplicate: true,
    });
  }

  if (includedFilter) {
    await serviceUpdate("invoices", includedFilter, {
      status: "included_in_settlement",
      included_in_settlement_id: calculation.id,
    });
    await serviceUpdate(
      "payment_links",
      `invoice_id=in.(${calculation.included_invoice_ids.join(",")})&status=eq.active`,
      { status: "invalidated", invalidated_at: now.toISOString() },
    );
  }
  await serviceUpdate("subscriptions", `id=eq.${id}`, {
    cancellation_status: "confirmed",
    cancellation_requested_at: now.toISOString(),
    cancellation_effective_at: effectiveAt.toISOString(),
    original_term_code: calculation.original_term_code,
    termination_reason: "customer_early_termination",
    termination_calculation_id: calculation.id,
    operational_status: policy.stopServicesImmediately
      ? "cancellation_pending"
      : "active",
  });

  const existingUrl = await activePaymentUrl(settlementInvoice.id);
  const link = existingUrl
    ? { url: existingUrl, expiresAt: dueAt }
    : await createPaymentLinkRecord(
        settlementInvoice.id,
        "final_settlement",
        policy,
        policy.finalSettlementPaymentWindowDays,
      );
  const snapshot = calculation.calculation_snapshot;
  await Promise.all([
    sendTransactionalEmail({
      template: "cancellation_request_received",
      locale,
      email: subscription.customers.email,
      name: subscription.customers.full_name,
      reference: id.slice(0, 8).toUpperCase(),
      amount: formatMoneyFromCents(calculation.total_cents, locale),
    }),
    sendTransactionalEmail({
      template: "final_settlement_generated",
      locale,
      email: subscription.customers.email,
      name: subscription.customers.full_name,
      reference: settlementInvoice.invoice_number || invoiceNumber,
      amount: formatMoneyFromCents(calculation.total_cents, locale),
      date: new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(link.expiresAt),
      actionUrl: link.url,
      originalTerm: String(snapshot.originalTier.months),
      replacementTerm: String(snapshot.replacementTier.months),
      amountPaid: formatMoneyFromCents(snapshot.amountPreviouslyPaidCents, locale),
      priceAdjustment: formatMoneyFromCents(snapshot.discountCorrectionCents, locale),
      remainingTermAmount: formatMoneyFromCents(
        snapshot.remainingMinimumTermAmountCents,
        locale,
      ),
    }),
  ]);

  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: "cancellation_confirmed_settlement_generated",
    resource_type: "subscription",
    resource_id: id,
    previous_value: { cancellation_status: subscription.cancellation_status },
    new_value: {
      cancellation_status: "confirmed",
      calculation_id: calculation.id,
      settlement_invoice_id: settlementInvoice.id,
      total_cents: calculation.total_cents,
      included_invoice_ids: calculation.included_invoice_ids,
    },
  });

  return NextResponse.json({
    ok: true,
    settlementRequired: true,
    settlementInvoiceId: settlementInvoice.id,
    payUrl: link.url,
    totalCents: calculation.total_cents,
  });
}
