import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import {
  serviceInsert,
  serviceInsertIgnoreDuplicates,
  serviceSelect,
  serviceUpdate,
} from "@/lib/supabase-rpc";
import { getBillingPolicy } from "@/lib/billing-policy";
import { createPaymentLinkRecord } from "@/lib/billing-links";
import {
  computeNextPrepaidTerm,
  computePrepaidRenewalDueAt,
  determinePrepaidRenewalAction,
} from "@/lib/subscription-renewal";
import { setStripeSubscriptionCancelAtPeriodEnd } from "@/lib/stripe";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { formatMoneyFromCents } from "@/lib/assessment";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized(req: NextRequest): Promise<boolean> {
  return (await isAdminAuthorized())
    || secureTokenEqual(
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null,
      process.env.BILLING_COLLECTION_JOB_SECRET,
    );
}

type SubscriptionRow = {
  id: string;
  customer_id: string;
  status: string;
  billing_interval: "monthly" | "annual";
  billed_price_cents: number;
  currency: string;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  auto_renew: boolean;
  renewal_status: string | null;
  renewal_invoice_id: string | null;
  customers: {
    email: string;
    full_name: string;
    preferred_language: Locale;
  };
};

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
};

export async function POST(req: NextRequest) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const policy = await getBillingPolicy();
  const now = new Date();
  const subscriptions = await serviceSelect<SubscriptionRow[]>(
    "subscriptions?billing_interval=eq.annual&status=eq.active&current_period_end=not.is.null&select=id,customer_id,status,billing_interval,billed_price_cents,currency,stripe_subscription_id,current_period_end,auto_renew,renewal_status,renewal_invoice_id,customers(email,full_name,preferred_language)",
  );

  let paymentRequestsCreated = 0;
  let renewedTermsActivated = 0;
  let expiredTermsEnded = 0;

  for (const subscription of subscriptions) {
    const currentTermEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null;
    const action = determinePrepaidRenewalAction({
      billingInterval: subscription.billing_interval,
      subscriptionStatus: subscription.status,
      autoRenew: subscription.auto_renew,
      currentTermEnd,
      renewalStatus: subscription.renewal_status,
      asOf: now,
      leadDays: policy.prepaidRenewalLeadDays,
    });

    if (action === "request_payment" && currentTermEnd) {
      // Prevent Stripe from also charging automatically at the old annual
      // boundary before accepting a separate advance renewal payment.
      if (subscription.stripe_subscription_id) {
        try {
          await setStripeSubscriptionCancelAtPeriodEnd({
            subscriptionId: subscription.stripe_subscription_id,
            cancelAtPeriodEnd: true,
            idempotencyKey: `prepaid_renewal_manual_${subscription.id}_${currentTermEnd.toISOString().slice(0, 10)}`,
          });
        } catch (error) {
          console.error(
            "[prepaid-renewals] could not disable provider boundary renewal",
            subscription.id,
            error instanceof Error ? error.message : "unknown",
          );
          continue;
        }
      }

      const nextTerm = computeNextPrepaidTerm(currentTermEnd);
      const invoiceNumber = `REN-${nextTerm.start.getUTCFullYear()}-${subscription.id.slice(0, 8).toUpperCase()}`;
      const inserted = await serviceInsertIgnoreDuplicates<InvoiceRow[]>(
        "invoices",
        {
          customer_id: subscription.customer_id,
          subscription_id: subscription.id,
          invoice_number: invoiceNumber,
          invoice_type: "prepaid_renewal",
          status: "open",
          amount_due_cents: subscription.billed_price_cents,
          amount_paid_cents: 0,
          currency: subscription.currency,
          due_at: currentTermEnd.toISOString(),
          renewal_term_start: nextTerm.start.toISOString(),
          renewal_term_end: nextTerm.end.toISOString(),
          invoice_details: {
            title: "Prepaid Subscription Renewal",
            currentTermEnd: currentTermEnd.toISOString(),
            nextTermStart: nextTerm.start.toISOString(),
            nextTermEnd: nextTerm.end.toISOString(),
          },
        },
        "subscription_id,invoice_type,renewal_term_start",
      );
      let invoice = inserted[0];
      if (!invoice) {
        const existing = await serviceSelect<InvoiceRow[]>(
          `invoices?subscription_id=eq.${subscription.id}&invoice_type=eq.prepaid_renewal&renewal_term_start=eq.${encodeURIComponent(nextTerm.start.toISOString())}&select=id,invoice_number&limit=1`,
        );
        invoice = existing[0];
      }
      if (!invoice) continue;

      const linkWindowDays = Math.max(
        1,
        Math.ceil((currentTermEnd.getTime() - now.getTime()) / 86_400_000),
      );
      const existingLinks = await serviceSelect<{ token: string; expires_at: string }[]>(
        `payment_links?invoice_id=eq.${invoice.id}&status=eq.active&select=token,expires_at&limit=1`,
      );
      const link = existingLinks[0]
        ? {
            url: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.dartahara.com").replace(/\/$/, "")}/api/account/invoices/pay-link/${existingLinks[0].token}`,
            expiresAt: new Date(existingLinks[0].expires_at),
          }
        : await createPaymentLinkRecord(
            invoice.id,
            "prepaid_renewal",
            policy,
            linkWindowDays,
          );

      await serviceUpdate("subscriptions", `id=eq.${subscription.id}`, {
        cancel_at_period_end: true,
        renewal_status: "payment_requested",
        renewal_payment_due_at: computePrepaidRenewalDueAt(
          currentTermEnd,
          policy.prepaidRenewalLeadDays,
        ).toISOString(),
        renewal_invoice_id: invoice.id,
        next_term_start: nextTerm.start.toISOString(),
        next_term_end: nextTerm.end.toISOString(),
      });
      await sendTransactionalEmail({
        template: "annual_renewal_reminder",
        locale: subscription.customers.preferred_language,
        email: subscription.customers.email,
        name: subscription.customers.full_name,
        reference: invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase(),
        amount: formatMoneyFromCents(
          subscription.billed_price_cents,
          subscription.customers.preferred_language,
        ),
        date: new Intl.DateTimeFormat(
          subscription.customers.preferred_language,
          { day: "2-digit", month: "long", year: "numeric" },
        ).format(currentTermEnd),
        actionUrl: link.url,
      });
      await serviceInsert("audit_logs", {
        actor_user_id: null,
        action: "prepaid_renewal_payment_requested",
        resource_type: "subscription",
        resource_id: subscription.id,
        previous_value: { renewal_status: subscription.renewal_status },
        new_value: {
          renewal_status: "payment_requested",
          renewal_invoice_id: invoice.id,
          next_term_start: nextTerm.start.toISOString(),
        },
      });
      paymentRequestsCreated += 1;
    }

    if (action === "activate_paid_term" && currentTermEnd) {
      const nextTerm = computeNextPrepaidTerm(currentTermEnd);
      await serviceUpdate("subscriptions", `id=eq.${subscription.id}`, {
        status: "active",
        stripe_subscription_id: null,
        current_period_start: nextTerm.start.toISOString(),
        current_period_end: nextTerm.end.toISOString(),
        current_contract_end_date: nextTerm.end.toISOString().slice(0, 10),
        cancel_at_period_end: false,
        renewal_status: null,
        renewal_payment_due_at: null,
        renewal_invoice_id: null,
        next_term_start: null,
        next_term_end: null,
        pause_used: false,
        pause_months_used: 0,
        deep_clean_free_used: false,
        deep_clean_free_used_at: null,
      });
      await serviceInsert("audit_logs", {
        actor_user_id: null,
        action: "prepaid_renewal_term_activated",
        resource_type: "subscription",
        resource_id: subscription.id,
        previous_value: { current_period_end: currentTermEnd.toISOString() },
        new_value: {
          current_period_start: nextTerm.start.toISOString(),
          current_period_end: nextTerm.end.toISOString(),
        },
      });
      renewedTermsActivated += 1;
    }

    if (action === "end_after_current_term" && currentTermEnd) {
      await serviceUpdate("subscriptions", `id=eq.${subscription.id}`, {
        status: "cancelled",
        cancelled_at: currentTermEnd.toISOString(),
        renewal_status: subscription.auto_renew ? "expired" : "disabled",
        cancellation_effective_at: currentTermEnd.toISOString(),
        operational_status: "cancellation_pending",
      });
      if (subscription.renewal_invoice_id && subscription.auto_renew) {
        await serviceUpdate(
          "invoices",
          `id=eq.${subscription.renewal_invoice_id}&status=eq.open`,
          { status: "overdue" },
        );
      }
      await serviceInsert("audit_logs", {
        actor_user_id: null,
        action: subscription.auto_renew
          ? "prepaid_renewal_unpaid_term_ended"
          : "prepaid_non_renewal_term_ended",
        resource_type: "subscription",
        resource_id: subscription.id,
        previous_value: { status: subscription.status },
        new_value: {
          status: "cancelled",
          effective_at: currentTermEnd.toISOString(),
        },
      });
      expiredTermsEnded += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    paymentRequestsCreated,
    renewedTermsActivated,
    expiredTermsEnded,
  });
}
