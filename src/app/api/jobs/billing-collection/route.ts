import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { getBillingPolicy } from "@/lib/billing-policy";
import { createPaymentLinkRecord } from "@/lib/billing-links";
import { cancelStripeSubscription } from "@/lib/stripe";
import { formatMoneyFromCents } from "@/lib/assessment";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** How long before a final-settlement invoice's due date to send the one reminder email. Not policy-configurable (unlike the core windows): a single sane default, same spirit as the rest of this job's fixed sweep cadence. */
const SETTLEMENT_REMINDER_WINDOW_HOURS = 72;

async function authorized(req: NextRequest): Promise<boolean> {
  return (await isAdminAuthorized()) || secureTokenEqual(req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null, process.env.BILLING_COLLECTION_JOB_SECRET);
}

type DueLinkRow = {
  id: string;
  invoice_id: string;
  invoices: {
    id: string; invoice_number: string | null; status: string;
    amount_due_cents: number; amount_paid_cents: number; subscription_id: string | null;
    customers: { email: string; full_name: string; preferred_language: Locale };
  };
};

/**
 * Sweeps expired payment links and advances each unpaid invoice's
 * collection stage: this is the app's own dunning-notice lifecycle, not a
 * second payment-retry scheduler (Stripe already retries the actual charge
 * on its own; the Stripe webhook reacts to that, see
 * `invoicePaymentFailed` in stripe/webhook/route.ts). Safe to run on any
 * cadence and to rerun: only ever acts on links that are still `active` and
 * already past their own `expires_at`, so a re-run after a partial failure
 * just picks up whatever wasn't finished.
 */
export async function POST(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const now = new Date().toISOString();
  const policy = await getBillingPolicy();

  const expiredFirstNotices = await serviceSelect<DueLinkRow[]>(
    `payment_links?link_type=eq.first_notice&status=eq.active&expires_at=lte.${now}&select=id,invoice_id,invoices(id,invoice_number,status,amount_due_cents,amount_paid_cents,subscription_id,customers(email,full_name,preferred_language))`,
  );
  let secondNoticesSent = 0;
  for (const row of expiredFirstNotices) {
    await serviceUpdate("payment_links", `id=eq.${row.id}`, { status: "expired" });
    const invoice = row.invoices;
    if (!invoice || invoice.status === "paid" || invoice.status === "void") continue;

    const link = await createPaymentLinkRecord(invoice.id, "second_notice", policy);
    await serviceUpdate("invoices", `id=eq.${invoice.id}`, { collection_stage: "second_notice", second_notice_sent_at: new Date().toISOString() });

    const outstandingCents = invoice.amount_due_cents - invoice.amount_paid_cents;
    // Lands on the subscriptions page with a query param that opens the
    // cancellation-preview modal for that subscription directly.
    const cancellationUrl = invoice.subscription_id
      ? `${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.dartahara.com").replace(/\/$/, "")}/account/subscriptions?requestCancellation=${invoice.subscription_id}`
      : undefined;
    await sendTransactionalEmail({
      template: "payment_required_final_notice",
      locale: invoice.customers.preferred_language, email: invoice.customers.email, name: invoice.customers.full_name,
      reference: invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase(),
      amount: formatMoneyFromCents(outstandingCents, invoice.customers.preferred_language),
      date: new Intl.DateTimeFormat(invoice.customers.preferred_language, { day: "2-digit", month: "long", year: "numeric" }).format(link.expiresAt),
      actionUrl: link.url,
      secondaryActionUrl: cancellationUrl,
    });
    secondNoticesSent++;
  }

  const expiredSecondNotices = await serviceSelect<DueLinkRow[]>(
    `payment_links?link_type=eq.second_notice&status=eq.active&expires_at=lte.${now}&select=id,invoice_id,invoices(id,status)`,
  );
  let markedSeriouslyOverdue = 0;
  for (const row of expiredSecondNotices) {
    await serviceUpdate("payment_links", `id=eq.${row.id}`, { status: "expired" });
    const invoice = row.invoices;
    if (!invoice || invoice.status === "paid" || invoice.status === "void") continue;
    await serviceUpdate("invoices", `id=eq.${invoice.id}`, { collection_stage: "seriously_overdue", seriously_overdue_at: new Date().toISOString() });
    markedSeriouslyOverdue++;
  }

  type SettlementCalcRow = {
    id: string; customer_id: string; subscription_id: string; total_cents: number; currency: string;
    settlement_reminder_sent_at: string | null; settlement_invoice_id: string | null;
  };
  type SettlementInvoiceRow = { id: string; invoice_number: string | null; status: string; due_at: string | null };
  type IncludedInvoiceRow = { id: string; due_at: string | null };
  type SettlementCustomerRow = { email: string; full_name: string; preferred_language: Locale };

  const acceptedCalcs = await serviceSelect<SettlementCalcRow[]>(
    `early_termination_calculations?status=eq.accepted&select=id,customer_id,subscription_id,total_cents,currency,settlement_reminder_sent_at,settlement_invoice_id`,
  );

  let settlementRemindersSent = 0;
  let settlementsDefaulted = 0;
  const nowMs = Date.now();

  for (const calc of acceptedCalcs) {
    if (!calc.settlement_invoice_id) continue;
    const invRows = await serviceSelect<SettlementInvoiceRow[]>(
      `invoices?id=eq.${calc.settlement_invoice_id}&select=id,invoice_number,status,due_at&limit=1`,
    );
    const invoice = invRows[0];
    if (!invoice || invoice.status !== "open" || !invoice.due_at) continue;
    const dueMs = new Date(invoice.due_at).getTime();

    if (dueMs <= nowMs) {
      // Past its resolution window: apply the configured unpaid-settlement policy.
      await serviceUpdate("early_termination_calculations", `id=eq.${calc.id}`, { status: "defaulted" });
      await serviceUpdate("invoices", `id=eq.${invoice.id}`, { status: "overdue" });

      const custRows = await serviceSelect<SettlementCustomerRow[]>(`customers?id=eq.${calc.customer_id}&select=email,full_name,preferred_language&limit=1`);
      const customer = custRows[0];

      if (policy.unpaidSettlementAction === "terminate_and_escalate") {
        const subRows = await serviceSelect<{ stripe_subscription_id: string | null }[]>(
          `subscriptions?id=eq.${calc.subscription_id}&select=stripe_subscription_id&limit=1`,
        );
        const stripeSubId = subRows[0]?.stripe_subscription_id;
        await serviceUpdate("subscriptions", `id=eq.${calc.subscription_id}`, {
          status: "cancelled", cancelled_at: new Date().toISOString(), cancellation_status: "voided", operational_status: "active",
        });
        if (stripeSubId) {
          try {
            await cancelStripeSubscription({ subscriptionId: stripeSubId, idempotencyKey: `cancel_defaulted_${calc.subscription_id}` });
          } catch (error) {
            console.error("[billing-collection] settlement-default cancel failed", error instanceof Error ? error.message : "unknown");
          }
        }
        await serviceUpdate("invoices", `id=eq.${invoice.id}`, { collection_stage: "escalation_eligible", escalation_eligible_at: new Date().toISOString() });
      } else {
        // 'continue_contract' (default) and 'manual_review' share the same
        // safe mechanical outcome: the original contract stands and
        // services stay suspended until resolved. 'manual_review' additionally
        // needs a human decision, which the admin invoices page surfaces
        // (escalation-eligible collection stage is not set here; there is no
        // dedicated manual-review queue in this phase, so review happens via
        // the audit log and the defaulted calculation itself).
        await serviceUpdate("subscriptions", `id=eq.${calc.subscription_id}`, {
          cancellation_status: "voided", operational_status: "suspended_for_non_payment",
        });
        const includedInvoices = await serviceSelect<IncludedInvoiceRow[]>(
          `invoices?included_in_settlement_id=eq.${calc.id}&select=id,due_at`,
        );
        for (const includedInvoice of includedInvoices) {
          const originalDueAt = includedInvoice.due_at ? new Date(includedInvoice.due_at).getTime() : Number.NaN;
          await serviceUpdate("invoices", `id=eq.${includedInvoice.id}`, {
            status: Number.isFinite(originalDueAt) && originalDueAt <= nowMs ? "overdue" : "open",
            included_in_settlement_id: null,
          });
        }
        const openSuspension = await serviceSelect<{ id: string }[]>(
          `subscription_suspensions?subscription_id=eq.${calc.subscription_id}&ended_at=is.null&select=id&limit=1`,
        );
        if (openSuspension.length === 0) {
          await serviceUpdate("subscriptions", `id=eq.${calc.subscription_id}`, { suspended_at: new Date().toISOString(), suspension_reason: "settlement_defaulted", suspension_invoice_id: invoice.id });
          await serviceInsert("subscription_suspensions", { subscription_id: calc.subscription_id, customer_id: calc.customer_id, triggering_invoice_id: invoice.id, reason: "settlement_defaulted" });
        }
      }

      await serviceInsert("audit_logs", {
        actor_user_id: null, action: "settlement_defaulted", resource_type: "subscription", resource_id: calc.subscription_id,
        previous_value: { calculation_id: calc.id, status: "accepted" },
        new_value: { calculation_id: calc.id, status: "defaulted", unpaid_settlement_action: policy.unpaidSettlementAction },
      });

      if (customer) {
        await sendTransactionalEmail({
          template: "cancellation_voided", locale: customer.preferred_language, email: customer.email, name: customer.full_name,
          reference: invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase(),
        });
      }
      settlementsDefaulted++;
      continue;
    }

    if (calc.settlement_reminder_sent_at) continue;
    if (dueMs - nowMs > SETTLEMENT_REMINDER_WINDOW_HOURS * 60 * 60 * 1000) continue;

    const custRows = await serviceSelect<SettlementCustomerRow[]>(`customers?id=eq.${calc.customer_id}&select=email,full_name,preferred_language&limit=1`);
    const customer = custRows[0];
    if (customer) {
      await sendTransactionalEmail({
        template: "final_settlement_reminder", locale: customer.preferred_language, email: customer.email, name: customer.full_name,
        reference: invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase(),
        amount: formatMoneyFromCents(calc.total_cents, customer.preferred_language),
        date: new Intl.DateTimeFormat(customer.preferred_language, { day: "2-digit", month: "long", year: "numeric" }).format(new Date(invoice.due_at)),
      });
    }
    await serviceUpdate("early_termination_calculations", `id=eq.${calc.id}`, { settlement_reminder_sent_at: new Date().toISOString() });
    settlementRemindersSent++;
  }

  return NextResponse.json({ ok: true, secondNoticesSent, markedSeriouslyOverdue, settlementRemindersSent, settlementsDefaulted });
}
