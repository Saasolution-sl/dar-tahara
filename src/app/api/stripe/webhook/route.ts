import { NextRequest, NextResponse } from "next/server";
import {
  parseStripeEvent,
  retrievePaymentIntent,
  retrieveSetupIntent,
  retrieveStripeSubscription,
  setCustomerDefaultPaymentMethod,
  setStripeSubscriptionCancelAtPeriodEnd,
  type StripeCheckoutSession,
} from "@/lib/stripe";
import { serviceDelete, serviceInsert, serviceInsertIgnoreDuplicates, serviceSelect, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";
import { formatMoneyFromCents } from "@/lib/assessment";
import { getBillingPolicy } from "@/lib/billing-policy";
import { shouldSuspend, attemptTypeForStripeAttempt } from "@/lib/billing-lifecycle";
import { createPaymentLinkRecord } from "@/lib/billing-links";
import { cancelStripeSubscription } from "@/lib/stripe";
import { addUtcMonthsClamped } from "@/lib/early-termination-calculator";
import { serviceWindowAfterPayment } from "@/lib/subscription-activation";

export const runtime = "nodejs";

type AssessmentMailRow = { reference: string; preferred_date: string; assessment_price_cents: number; customers: { email: string; full_name: string; preferred_language: Locale } };

async function assessmentPaid(session: StripeCheckoutSession) {
  const id = session.metadata.assessment_id || session.client_reference_id;
  if (!id || session.payment_status !== "paid") return;
  let paymentMethodId: string | null = null;
  if (session.payment_intent && session.customer) {
    const paymentIntent = await retrievePaymentIntent(session.payment_intent);
    if (
      paymentIntent.status !== "succeeded"
      || paymentIntent.customer !== session.customer
      || !paymentIntent.payment_method
    ) {
      throw new Error("assessment_payment_method_not_reusable");
    }
    paymentMethodId = paymentIntent.payment_method;
    await setCustomerDefaultPaymentMethod({
      customerId: session.customer,
      paymentMethodId,
      idempotencyKey: `assessment_default_payment_method_${id}`,
    });
  }
  await serviceUpdate("home_assessments", `id=eq.${id}`, {
    payment_status: "paid", status: "assessment", stripe_payment_intent_id: session.payment_intent,
    stripe_customer_id: session.customer, paid_at: new Date().toISOString(), confirmed_at: new Date().toISOString(),
    stripe_payment_method_id: paymentMethodId,
  });
  if (session.customer) {
    const rows = await serviceSelect<{ customer_id: string }[]>(`home_assessments?id=eq.${id}&select=customer_id&limit=1`);
    if (rows[0]) {
      await serviceUpdate("customers", `id=eq.${rows[0].customer_id}`, {
        stripe_customer_id: session.customer,
        ...(paymentMethodId
          ? { payment_method_ready_at: new Date().toISOString() }
          : {}),
      });
    }
  }
  await serviceInsert("assessment_events", { assessment_id: id, event_type: "payment_confirmed", from_status: "awaiting_payment", to_status: "assessment", actor_type: "stripe", actor_reference: session.id });
  const rows = await serviceSelect<AssessmentMailRow[]>(`home_assessments?id=eq.${id}&select=reference,preferred_date,assessment_price_cents,customers(email,full_name,preferred_language)&limit=1`);
  const row = rows[0];
  if (row?.customers) {
    const actionUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.dartahara.com"}/${row.customers.preferred_language}/assessment/confirmation?session_id=${encodeURIComponent(session.id)}`;
    await Promise.all([
      sendTransactionalEmail({ template: "booking_confirmation", locale: row.customers.preferred_language, email: row.customers.email, name: row.customers.full_name, reference: row.reference, date: row.preferred_date, actionUrl }),
      sendTransactionalEmail({ template: "payment_confirmation", locale: row.customers.preferred_language, email: row.customers.email, name: row.customers.full_name, reference: row.reference, amount: formatMoneyFromCents(row.assessment_price_cents, row.customers.preferred_language), actionUrl }),
    ]);
  }
}

async function paymentMethodSetupCompleted(session: StripeCheckoutSession) {
  const customerId = session.metadata.customer_id;
  if (
    session.mode !== "setup"
    || session.status !== "complete"
    || !customerId
    || !session.customer
    || !session.setup_intent
  ) {
    throw new Error("payment_method_setup_incomplete");
  }

  const setupIntent = await retrieveSetupIntent(session.setup_intent);
  if (
    setupIntent.status !== "succeeded"
    || setupIntent.customer !== session.customer
    || !setupIntent.payment_method
  ) {
    throw new Error("payment_method_setup_not_reusable");
  }

  const rows = await serviceSelect<{
    id: string;
    stripe_customer_id: string | null;
  }[]>(
    `customers?id=eq.${encodeURIComponent(customerId)}&select=id,stripe_customer_id&limit=1`,
  );
  const customer = rows[0];
  if (
    !customer
    || (customer.stripe_customer_id && customer.stripe_customer_id !== session.customer)
  ) {
    throw new Error("payment_method_setup_customer_mismatch");
  }

  await setCustomerDefaultPaymentMethod({
    customerId: session.customer,
    paymentMethodId: setupIntent.payment_method,
    idempotencyKey: `payment_method_setup_default_${session.id}`,
  });
  const completedAt = new Date().toISOString();
  await serviceUpdate("customers", `id=eq.${customer.id}`, {
    stripe_customer_id: session.customer,
    payment_method_ready_at: completedAt,
  });
  await serviceInsert("audit_logs", {
    action: "customer_payment_method_saved",
    resource_type: "customer",
    resource_id: customer.id,
    new_value: {
      payment_method_ready_at: completedAt,
      source: "stripe_setup_intent",
    },
  });
}

async function subscriptionPaid(session: StripeCheckoutSession) {
  const subscriptionId = session.metadata.subscription_id;
  const assessmentId = session.metadata.assessment_id;
  if (!subscriptionId || !assessmentId || session.payment_status !== "paid") return;
  const activatedAt = new Date();
  const subscriptionRows = await serviceSelect<{
    billing_interval: "monthly" | "annual";
    contract_duration_months: number | null;
    original_contract_end_date: string | null;
  }[]>(
    `subscriptions?id=eq.${subscriptionId}&select=billing_interval,contract_duration_months,original_contract_end_date&limit=1`,
  );
  const localSubscription = subscriptionRows[0];
  const fixedTermEnd = localSubscription?.contract_duration_months
    ? addUtcMonthsClamped(activatedAt, localSubscription.contract_duration_months)
    : null;

  if (
    localSubscription?.billing_interval === "annual"
    && typeof session.subscription === "string"
  ) {
    await setStripeSubscriptionCancelAtPeriodEnd({
      subscriptionId: session.subscription,
      cancelAtPeriodEnd: true,
      idempotencyKey: `prepaid_manual_renewal_${subscriptionId}`,
    });
  }

  await serviceUpdate("subscriptions", `id=eq.${subscriptionId}`, {
    status: "active",
    stripe_subscription_id: session.subscription,
    stripe_checkout_session_id: session.id,
    activated_at: activatedAt.toISOString(),
    cancel_at_period_end: localSubscription?.billing_interval === "annual",
    ...(fixedTermEnd
      ? {
          current_contract_end_date: fixedTermEnd.toISOString().slice(0, 10),
          ...(!localSubscription?.original_contract_end_date
            ? { original_contract_end_date: fixedTermEnd.toISOString().slice(0, 10) }
            : {}),
        }
      : {}),
  });
  await serviceUpdate("home_assessments", `id=eq.${assessmentId}`, { status: "subscription_active" });
  await serviceInsert("assessment_events", { assessment_id: assessmentId, event_type: "subscription_activated", from_status: "approved", to_status: "subscription_active", actor_type: "stripe", actor_reference: session.id });
  const rows=await serviceSelect<{customer_id:string;customers:{auth_user_id:string|null}}[]>(`subscriptions?id=eq.${subscriptionId}&select=customer_id,customers(auth_user_id)&limit=1`);const owner=rows[0];
  if(owner){await serviceUpdate("customers",`id=eq.${owner.customer_id}`,{status:"customer"});if(owner.customers.auth_user_id)await serviceInsertIgnoreDuplicates("user_roles",{user_id:owner.customers.auth_user_id,role:"customer"},"user_id,role");await serviceInsertIgnoreDuplicates("payments",{customer_id:owner.customer_id,subscription_id:subscriptionId,provider_payment_id:session.payment_intent||session.id,amount_cents:session.amount_total||0,currency:session.currency||"eur",status:"succeeded",paid_at:new Date().toISOString()},"provider_payment_id");}
}

type InvoiceObject={id:string;customer:string|null;subscription:string|null;amount_due:number;amount_paid:number;currency:string;status:string;hosted_invoice_url:string|null;invoice_pdf:string|null;period_start:number;period_end:number;attempt_count?:number;number?:string|null;payment_intent?:string|null};
type SubscriptionMailRow={
  id:string;
  customer_id:string;
  property_id:string;
  assessment_id:string;
  billing_interval:"monthly"|"annual";
  contract_duration_months:number|null;
  activated_at:string|null;
  original_contract_end_date:string|null;
  customers:{auth_user_id:string|null;email:string;full_name:string;preferred_language:Locale};
};

async function localSubscriptionForProvider(
  providerSubscriptionId: string,
): Promise<SubscriptionMailRow | null> {
  const selection = "id,customer_id,property_id,assessment_id,billing_interval,contract_duration_months,activated_at,original_contract_end_date,customers(auth_user_id,email,full_name,preferred_language)";
  let rows = await serviceSelect<SubscriptionMailRow[]>(
    `subscriptions?stripe_subscription_id=eq.${encodeURIComponent(providerSubscriptionId)}&select=${selection}&limit=1`,
  );
  if (rows[0]) return rows[0];

  const providerSubscription = await retrieveStripeSubscription(providerSubscriptionId);
  const localId = providerSubscription.metadata?.subscription_id;
  if (!localId || !/^[0-9a-f-]{36}$/i.test(localId)) return null;
  await serviceUpdate("subscriptions", `id=eq.${localId}`, {
    stripe_subscription_id: providerSubscriptionId,
  });
  rows = await serviceSelect<SubscriptionMailRow[]>(
    `subscriptions?id=eq.${localId}&select=${selection}&limit=1`,
  );
  return rows[0] || null;
}

async function syncStripeInvoice(
  invoice: InvoiceObject,
  status: "open" | "paid",
): Promise<{ id: string; subscription: SubscriptionMailRow } | null> {
  if (!invoice.subscription) return null;
  const subscription = await localSubscriptionForProvider(invoice.subscription);
  if (!subscription) return null;
  const upserted = await serviceUpsert<{id:string}[]>("invoices", {
    customer_id: subscription.customer_id,
    subscription_id: subscription.id,
    assessment_id: subscription.assessment_id,
    stripe_invoice_id: invoice.id,
    invoice_number: invoice.number ?? undefined,
    amount_due_cents: invoice.amount_due,
    amount_paid_cents: invoice.amount_paid,
    currency: invoice.currency,
    status,
    failed_attempt_count: status === "paid" ? 0 : invoice.attempt_count ?? 0,
    hosted_invoice_url: invoice.hosted_invoice_url,
    invoice_pdf_url: invoice.invoice_pdf,
    period_start: new Date(invoice.period_start * 1000).toISOString(),
    period_end: new Date(invoice.period_end * 1000).toISOString(),
  }, "stripe_invoice_id");
  return upserted[0] ? { id: upserted[0].id, subscription } : null;
}

async function activateSubscriptionAfterFirstPayment(
  invoice: InvoiceObject,
  invoiceRowId: string,
  subscription: SubscriptionMailRow,
) {
  if (subscription.activated_at) return;
  const paidAt = new Date();
  const activatedAt = invoice.period_start
    ? new Date(invoice.period_start * 1000)
    : paidAt;
  const fixedTermEnd = subscription.contract_duration_months
    ? addUtcMonthsClamped(activatedAt, subscription.contract_duration_months)
    : null;
  const window = serviceWindowAfterPayment(paidAt);

  await serviceUpdate("subscriptions", `id=eq.${subscription.id}&activated_at=is.null`, {
    status: "active",
    activated_at: activatedAt.toISOString(),
    current_period_start: activatedAt.toISOString(),
    current_period_end: invoice.period_end
      ? new Date(invoice.period_end * 1000).toISOString()
      : null,
    ...(fixedTermEnd
      ? {
          current_contract_end_date: fixedTermEnd.toISOString().slice(0, 10),
          ...(!subscription.original_contract_end_date
            ? { original_contract_end_date: fixedTermEnd.toISOString().slice(0, 10) }
            : {}),
        }
      : {}),
  });
  await serviceUpdate("home_assessments", `id=eq.${subscription.assessment_id}`, {
    status: "subscription_active",
  });
  await serviceInsertIgnoreDuplicates("service_bookings", {
    customer_id: subscription.customer_id,
    property_id: subscription.property_id,
    subscription_id: subscription.id,
    assessment_id: subscription.assessment_id,
    source_invoice_id: invoiceRowId,
    booking_type: "subscription_service",
    status: "planning",
    service_window_start: window.start,
    service_window_end: window.end,
  }, "source_invoice_id");
  await serviceInsertIgnoreDuplicates("payments", {
    customer_id: subscription.customer_id,
    subscription_id: subscription.id,
    invoice_id: invoiceRowId,
    provider_payment_id: invoice.payment_intent || invoice.id,
    amount_cents: invoice.amount_paid,
    currency: invoice.currency,
    status: "succeeded",
    paid_at: paidAt.toISOString(),
  }, "provider_payment_id");
  await serviceUpdate("customers", `id=eq.${subscription.customer_id}`, {
    status: "customer",
  });
  if (subscription.customers.auth_user_id) {
    await serviceInsertIgnoreDuplicates("user_roles", {
      user_id: subscription.customers.auth_user_id,
      role: "customer",
    }, "user_id,role");
  }
  await Promise.all([
    serviceInsert("assessment_events", {
      assessment_id: subscription.assessment_id,
      event_type: "subscription_activated",
      from_status: "approved",
      to_status: "subscription_active",
      actor_type: "stripe",
      actor_reference: invoice.id,
      metadata: {
        subscription_id: subscription.id,
        first_service_window_start: window.start,
        first_service_window_end: window.end,
      },
    }),
    serviceInsert("customer_activity", {
      customer_id: subscription.customer_id,
      event_type: "first_service_booking_created",
      resource_type: "subscription",
      resource_id: subscription.id,
      public_summary: `Payment received. Your first service is being planned for ${window.start} to ${window.end}.`,
      metadata: {
        invoice_id: invoiceRowId,
        service_window_start: window.start,
        service_window_end: window.end,
      },
    }),
    serviceInsert("audit_logs", {
      actor_user_id: null,
      action: "first_subscription_payment_booking_created",
      resource_type: "subscription",
      resource_id: subscription.id,
      new_value: {
        invoice_id: invoiceRowId,
        service_window_start: window.start,
        service_window_end: window.end,
      },
    }),
  ]);
}

/**
 * Shared cleanup once an invoice is confirmed paid, whichever path paid it
 * (Stripe's own subscription billing, or our side-channel payment-link
 * checkout). Invalidates any other still-active payment links, clears the
 * collection stage, and restores the subscription ONLY when no other
 * open/overdue invoice remains for it: a customer can have more than one
 * unpaid invoice, and paying one must never silently reactivate services
 * while another is still owed.
 */
async function resolveInvoicePaymentResolved(invoiceId: string, subscriptionId: string | null) {
  await serviceUpdate("payment_links", `invoice_id=eq.${invoiceId}&status=eq.active`, { status: "invalidated", invalidated_at: new Date().toISOString() });
  await serviceUpdate("invoices", `id=eq.${invoiceId}`, { collection_stage: null });
  if (!subscriptionId) return;

  const subRows = await serviceSelect<{ operational_status: string }[]>(`subscriptions?id=eq.${subscriptionId}&select=operational_status&limit=1`);
  if (subRows[0]?.operational_status !== "suspended_for_non_payment") return;

  const stillOwed = await serviceSelect<{ id: string }[]>(
    `invoices?subscription_id=eq.${subscriptionId}&status=in.(open,overdue)&id=neq.${invoiceId}&select=id&limit=1`,
  );
  if (stillOwed.length > 0) return;

  await serviceUpdate("subscriptions", `id=eq.${subscriptionId}`, {
    operational_status: "active", suspended_at: null, suspension_reason: null, suspension_invoice_id: null,
  });
  await serviceUpdate("subscription_suspensions", `subscription_id=eq.${subscriptionId}&ended_at=is.null`, {
    ended_at: new Date().toISOString(), restored_by: "payment",
  });
}

async function invoiceCreated(invoice: InvoiceObject) {
  await syncStripeInvoice(invoice, "open");
}

async function invoicePaid(invoice: InvoiceObject) {
  const synced = await syncStripeInvoice(invoice, "paid");
  if (!synced) return;
  await resolveInvoicePaymentResolved(synced.id, synced.subscription.id);
  await activateSubscriptionAfterFirstPayment(
    invoice,
    synced.id,
    synced.subscription,
  );
  await sendTransactionalEmail({
    template: "invoice",
    locale: synced.subscription.customers.preferred_language,
    email: synced.subscription.customers.email,
    name: synced.subscription.customers.full_name,
    reference: invoice.id,
    amount: formatMoneyFromCents(
      invoice.amount_paid,
      synced.subscription.customers.preferred_language,
    ),
    actionUrl: invoice.hosted_invoice_url || undefined,
  });
}

type SuspensionMailRow = {
  id: string; customer_id: string; subscription_id: string | null; invoice_number: string | null;
  amount_due_cents: number; amount_paid_cents: number; failed_attempt_count: number; collection_stage: string | null;
  customers: { email: string; full_name: string; preferred_language: Locale };
};

/**
 * Stripe's own `attempt_count` on the invoice object is the source of
 * truth for how many times a subscription charge has been tried (Smart
 * Retries, timed by Stripe, not by this app): this reacts to that count
 * rather than running a second, competing retry scheduler. Once the
 * configured threshold is reached, suspends the subscription and sends the
 * first dunning email with a fresh 7-day payment link. Fully idempotent:
 * a redelivered webhook for the same attempt_count is a harmless no-op
 * (unique payment_attempts row), and once `collection_stage` is set the
 * suspend/email side effects never re-fire for later attempts on the same
 * invoice.
 */
async function invoicePaymentFailed(invoice: InvoiceObject) {
  if (!invoice.subscription) return;
  await invoiceCreated(invoice);
  await serviceUpdate("subscriptions", `stripe_subscription_id=eq.${encodeURIComponent(invoice.subscription)}`, { status: "past_due" });

  const attemptCount = invoice.attempt_count ?? 1;
  const rows = await serviceSelect<SuspensionMailRow[]>(
    `invoices?stripe_invoice_id=eq.${encodeURIComponent(invoice.id)}&select=id,customer_id,subscription_id,invoice_number,amount_due_cents,amount_paid_cents,failed_attempt_count,collection_stage,customers(email,full_name,preferred_language)&limit=1`,
  );
  const row = rows[0];
  if (!row) return; // Not yet synced locally (no invoice.paid/invoice.created event seen for it yet): nothing to attach the attempt to.

  const providerReference = `${invoice.id}_attempt_${attemptCount}`;
  await serviceInsertIgnoreDuplicates("payment_attempts", {
    invoice_id: row.id, customer_id: row.customer_id, subscription_id: row.subscription_id,
    provider_reference: providerReference, attempt_number: attemptCount,
    attempt_type: attemptTypeForStripeAttempt(attemptCount), amount_cents: invoice.amount_due,
    currency: invoice.currency, status: "failed", provider_response_reference: invoice.payment_intent ?? null,
  }, "invoice_id,provider_reference");

  await serviceUpdate("invoices", `id=eq.${row.id}`, { failed_attempt_count: attemptCount });

  const policy = await getBillingPolicy();
  if (!shouldSuspend(attemptCount, policy) || row.collection_stage) return;

  if (row.subscription_id) {
    const subRows = await serviceSelect<{ operational_status: string }[]>(`subscriptions?id=eq.${row.subscription_id}&select=operational_status&limit=1`);
    if (subRows[0]?.operational_status !== "suspended_for_non_payment") {
      await serviceUpdate("subscriptions", `id=eq.${row.subscription_id}`, {
        operational_status: "suspended_for_non_payment", suspended_at: new Date().toISOString(),
        suspension_reason: "non_payment", suspension_invoice_id: row.id,
      });
      await serviceInsert("subscription_suspensions", {
        subscription_id: row.subscription_id, customer_id: row.customer_id, triggering_invoice_id: row.id, reason: "non_payment",
      });
    }
  }

  const link = await createPaymentLinkRecord(row.id, "first_notice", policy);
  await serviceUpdate("invoices", `id=eq.${row.id}`, { collection_stage: "first_notice", first_notice_sent_at: new Date().toISOString() });

  const outstandingCents = row.amount_due_cents - row.amount_paid_cents;
  await sendTransactionalEmail({
    template: "payment_required_suspended",
    locale: row.customers.preferred_language, email: row.customers.email, name: row.customers.full_name,
    reference: row.invoice_number || row.id.slice(0, 8).toUpperCase(),
    amount: formatMoneyFromCents(outstandingCents, row.customers.preferred_language),
    date: new Intl.DateTimeFormat(row.customers.preferred_language, { day: "2-digit", month: "long", year: "numeric" }).format(link.expiresAt),
    actionUrl: link.url,
  });
}

type PaymentLinkInvoiceRow = {
  id: string;
  customer_id: string;
  subscription_id: string | null;
  amount_due_cents: number;
  invoice_type: "standard" | "early_termination_settlement" | "prepaid_renewal";
  renewal_term_start: string | null;
  renewal_term_end: string | null;
};

type SettlementCalculationRow = { id: string };
type SettlementSubscriptionRow = {
  id: string; stripe_subscription_id: string | null;
  customers: { email: string; full_name: string; preferred_language: Locale };
};

/**
 * Once a final-settlement invoice is actually paid, the cancellation is
 * fully resolved: any pre-existing invoices that were rolled into this
 * settlement remain classified as included (they were absorbed into the
 * settlement total, not paid individually), the real Stripe subscription is
 * cancelled for good, and the customer gets the completion email.
 */
async function settlementInvoicePaid(invoiceId: string, subscriptionId: string | null) {
  const calcRows = await serviceSelect<SettlementCalculationRow[]>(
    `early_termination_calculations?settlement_invoice_id=eq.${invoiceId}&select=id&limit=1`,
  );
  const calc = calcRows[0];
  if (calc) {
    await serviceUpdate("early_termination_calculations", `id=eq.${calc.id}`, { status: "settled" });
    await serviceUpdate(
      "invoices",
      `included_in_settlement_id=eq.${calc.id}&id=neq.${invoiceId}`,
      { status: "included_in_settlement" },
    );
  }

  if (!subscriptionId) return;
  const subRows = await serviceSelect<SettlementSubscriptionRow[]>(
    `subscriptions?id=eq.${subscriptionId}&select=id,stripe_subscription_id,customers(email,full_name,preferred_language)&limit=1`,
  );
  const subscription = subRows[0];
  if (!subscription) return;

  await serviceUpdate("subscriptions", `id=eq.${subscriptionId}`, {
    status: "cancelled", cancelled_at: new Date().toISOString(),
    cancellation_status: "settled", operational_status: "active",
  });

  if (subscription.stripe_subscription_id) {
    // Do not swallow this: if the provider cancel fails, the webhook must
    // fail too (Stripe retries) rather than telling the customer the
    // subscription is cancelled while it can still charge them.
    await cancelStripeSubscription({ subscriptionId: subscription.stripe_subscription_id, idempotencyKey: `cancel_${subscriptionId}` });
  }

  await sendTransactionalEmail({
    template: "cancellation_completed", locale: subscription.customers.preferred_language,
    email: subscription.customers.email, name: subscription.customers.full_name,
    reference: subscriptionId.slice(0, 8).toUpperCase(),
  });
}

/**
 * A customer paying through one of our secure payment links pays via a
 * fresh, standalone one-off Checkout Session (see stripe.ts), not through
 * Stripe's own invoice-payment flow: so this is a SEPARATE event
 * (checkout.session.completed/async_payment_succeeded tagged
 * kind=invoice_payment_link) from invoice.paid, not a variant of it. Known
 * trade-off, flagged plainly rather than hidden: Stripe's own invoice
 * object is not marked paid by this path (it has no knowledge of the
 * side-channel charge): our own `invoices` row is the paid source of
 * truth for the customer/admin-facing state, which is what this app
 * actually reads everywhere.
 */
async function invoicePaymentLinkPaid(session: StripeCheckoutSession) {
  const invoiceId = session.metadata.invoice_id;
  const paymentLinkId = session.metadata.payment_link_id;
  if (!invoiceId || !paymentLinkId || session.payment_status !== "paid") return;

  const rows = await serviceSelect<PaymentLinkInvoiceRow[]>(
    `invoices?id=eq.${invoiceId}&select=id,customer_id,subscription_id,amount_due_cents,invoice_type,renewal_term_start,renewal_term_end&limit=1`,
  );
  const invoice = rows[0];
  if (!invoice) return;

  await serviceInsertIgnoreDuplicates("payment_attempts", {
    invoice_id: invoice.id, customer_id: invoice.customer_id, subscription_id: invoice.subscription_id,
    provider_reference: session.payment_intent || session.id,
    attempt_number: 1,
    attempt_type: invoice.invoice_type === "early_termination_settlement"
      ? "final_settlement"
      : invoice.invoice_type === "prepaid_renewal"
        ? "prepaid_renewal"
        : "payment_link",
    amount_cents: session.amount_total || invoice.amount_due_cents, currency: session.currency || "eur",
    status: "succeeded", provider_response_reference: session.payment_intent || null,
  }, "invoice_id,provider_reference");

  await serviceUpdate("invoices", `id=eq.${invoice.id}`, {
    status: "paid", amount_paid_cents: invoice.amount_due_cents, paid_at: new Date().toISOString(),
  });
  await serviceUpdate("payment_links", `id=eq.${paymentLinkId}`, { status: "used", used_at: new Date().toISOString() });

  if (invoice.invoice_type === "early_termination_settlement") {
    await settlementInvoicePaid(invoice.id, invoice.subscription_id);
    return;
  }

  if (
    invoice.invoice_type === "prepaid_renewal"
    && invoice.subscription_id
    && invoice.renewal_term_start
    && invoice.renewal_term_end
  ) {
    await serviceUpdate("subscriptions", `id=eq.${invoice.subscription_id}`, {
      renewal_status: "paid",
      next_term_start: invoice.renewal_term_start,
      next_term_end: invoice.renewal_term_end,
    });
    await serviceInsert("audit_logs", {
      actor_user_id: null,
      action: "prepaid_renewal_payment_received",
      resource_type: "subscription",
      resource_id: invoice.subscription_id,
      previous_value: { renewal_status: "payment_requested" },
      new_value: {
        renewal_status: "paid",
        renewal_invoice_id: invoice.id,
        next_term_start: invoice.renewal_term_start,
        next_term_end: invoice.renewal_term_end,
      },
    });
    return;
  }

  await resolveInvoicePaymentResolved(invoice.id, invoice.subscription_id);

  const customerRows = await serviceSelect<{ email: string; full_name: string; preferred_language: Locale }[]>(
    `customers?id=eq.${invoice.customer_id}&select=email,full_name,preferred_language&limit=1`,
  );
  const customer = customerRows[0];
  if (customer) {
    await sendTransactionalEmail({
      template: "invoice", locale: customer.preferred_language, email: customer.email, name: customer.full_name,
      reference: invoice.id, amount: formatMoneyFromCents(invoice.amount_due_cents, customer.preferred_language),
    });
  }
}

type SubscriptionObject = {
  id: string; status: string; cancel_at_period_end?: boolean; current_period_start?: number; current_period_end?: number;
  pause_collection?: { behavior: string; resumes_at: number | null } | null;
  metadata?: Record<string, string>;
};
const SUB_STATUS_MAP: Record<string, string> = {
  active: "active", trialing: "active", past_due: "past_due", unpaid: "past_due",
  canceled: "cancelled", incomplete: "pending_payment", incomplete_expired: "cancelled", paused: "paused",
};
async function subscriptionSynced(sub: SubscriptionObject) {
  let localRows = await serviceSelect<{
    id: string;
    billing_interval: "monthly" | "annual";
    contract_duration_months: number | null;
    activated_at: string | null;
    original_contract_end_date: string | null;
  }[]>(
    `subscriptions?stripe_subscription_id=eq.${encodeURIComponent(sub.id)}&select=id,billing_interval,contract_duration_months,activated_at,original_contract_end_date&limit=1`,
  );
  if (
    !localRows[0]
    && sub.metadata?.subscription_id
    && /^[0-9a-f-]{36}$/i.test(sub.metadata.subscription_id)
  ) {
    await serviceUpdate(
      "subscriptions",
      `id=eq.${sub.metadata.subscription_id}`,
      { stripe_subscription_id: sub.id },
    );
    localRows = await serviceSelect<typeof localRows>(
      `subscriptions?id=eq.${sub.metadata.subscription_id}&select=id,billing_interval,contract_duration_months,activated_at,original_contract_end_date&limit=1`,
    );
  }
  const local = localRows[0];
  if (!local) return;
  let providerCancelAtPeriodEnd = Boolean(sub.cancel_at_period_end);
  if (local?.billing_interval === "annual" && !providerCancelAtPeriodEnd) {
    try {
      await setStripeSubscriptionCancelAtPeriodEnd({
        subscriptionId: sub.id,
        cancelAtPeriodEnd: true,
        idempotencyKey: `prepaid_manual_renewal_${local.id}`,
      });
      providerCancelAtPeriodEnd = true;
    } catch (error) {
      console.error(
        "[stripe-webhook] could not disable automatic prepaid boundary renewal",
        error instanceof Error ? error.message : "unknown",
      );
    }
  }

  const periodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : null;
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;
  const activatedAt = local?.activated_at
    ? new Date(local.activated_at)
    : periodStart;
  const fixedTermEnd = local?.billing_interval === "annual"
    ? periodEnd
    : activatedAt && local?.contract_duration_months
      ? addUtcMonthsClamped(activatedAt, local.contract_duration_months)
      : null;
  await serviceUpdate("subscriptions", `id=eq.${local.id}`, {
    status: !local.activated_at && sub.status === "active"
      ? "pending_payment"
      : SUB_STATUS_MAP[sub.status] || "past_due",
    cancel_at_period_end: providerCancelAtPeriodEnd,
    current_period_start: periodStart?.toISOString() ?? null,
    current_period_end: periodEnd?.toISOString() ?? null,
    ...(fixedTermEnd
      ? {
          current_contract_end_date: fixedTermEnd.toISOString().slice(0, 10),
          ...(!local?.original_contract_end_date
            ? { original_contract_end_date: fixedTermEnd.toISOString().slice(0, 10) }
            : {}),
        }
      : {}),
  });
  // Our own pause-request workflow drives pause state; this is only a safety
  // net so a Stripe-dashboard-initiated pause/resume isn't silently invisible.
  if (sub.pause_collection) {
    console.warn("[stripe-webhook] subscription has pause_collection set outside the pause-request workflow", sub.id, sub.pause_collection);
  }
}

type ChargeObject = { id: string; payment_intent: string | null; amount: number; amount_refunded: number; currency: string; refunds?: { data?: { id: string }[] } };
async function chargeRefunded(charge: ChargeObject) {
  if (!charge.payment_intent) return;
  const filter = `stripe_payment_intent_id=eq.${encodeURIComponent(charge.payment_intent)}`;
  const fully = charge.amount_refunded >= charge.amount;
  const rows = await serviceSelect<{ id: string; customer_id: string }[]>(`home_assessments?${filter}&select=id,customer_id&limit=1`);
  await serviceUpdate("home_assessments", filter, { payment_status: fully ? "refunded" : "partially_refunded" });
  const refundId = charge.refunds?.data?.[0]?.id;
  const assessment = rows[0];
  if (assessment && refundId) {
    await serviceUpsert("refunds", {
      stripe_refund_id: refundId, stripe_charge_id: charge.id, stripe_payment_intent_id: charge.payment_intent,
      assessment_id: assessment.id, customer_id: assessment.customer_id, amount_cents: charge.amount_refunded,
      currency: charge.currency, status: "succeeded", source: "stripe_webhook",
    }, "stripe_refund_id");
    await serviceInsert("assessment_events", { assessment_id: assessment.id, event_type: fully ? "refunded" : "partially_refunded", actor_type: "stripe", actor_reference: refundId });
  }
}

async function deepCleanPaid(session: StripeCheckoutSession) {
  const id = session.metadata.deep_clean_request_id;
  if (!id || session.payment_status !== "paid") return;
  await serviceUpdate("deep_clean_requests", `id=eq.${id}`, { payment_status: "paid" });
}

type SubscriptionScheduleObject = {
  id: string;
  subscription?: string | null;
  metadata?: Record<string, string>;
};

async function subscriptionScheduleSynced(schedule: SubscriptionScheduleObject) {
  const localId = schedule.metadata?.subscription_id;
  if (!localId || !/^[0-9a-f-]{36}$/i.test(localId)) return;
  await serviceUpdate("subscriptions", `id=eq.${localId}`, {
    stripe_subscription_schedule_id: schedule.id,
    ...(schedule.subscription
      ? { stripe_subscription_id: schedule.subscription }
      : {}),
  });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  try {
    const event = parseStripeEvent(raw, signature);
    const claimed=await serviceInsertIgnoreDuplicates<{stripe_event_id:string}[]>("stripe_webhook_events",{stripe_event_id:event.id,event_type:event.type},"stripe_event_id");
    if(!claimed.length)return NextResponse.json({received:true,duplicate:true});
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as unknown as StripeCheckoutSession;
      if (session.metadata?.kind === "home_assessment") await assessmentPaid(session);
      if (session.metadata?.kind === "payment_method_setup") await paymentMethodSetupCompleted(session);
      if (session.metadata?.kind === "subscription") await subscriptionPaid(session);
      if (session.metadata?.kind === "deep_clean") await deepCleanPaid(session);
      if (session.metadata?.kind === "invoice_payment_link") await invoicePaymentLinkPaid(session);
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as unknown as StripeCheckoutSession;
      if (session.metadata?.kind === "home_assessment" && session.metadata.assessment_id) {
        await serviceUpdate("home_assessments", `id=eq.${session.metadata.assessment_id}`, { payment_status: "expired", status: "cancelled" });
      }
    } else if (event.type === "invoice.created") {
      await invoiceCreated(event.data.object as unknown as InvoiceObject);
    } else if (event.type === "invoice.paid") {
      await invoicePaid(event.data.object as unknown as InvoiceObject);
    } else if (event.type === "invoice.payment_failed") {
      await invoicePaymentFailed(event.data.object as unknown as InvoiceObject);
    } else if (event.type === "customer.subscription.deleted") {
      const providerSubscription = event.data.object as { id?: string };
      if (providerSubscription.id) {
        const rows = await serviceSelect<{
          id: string;
          assessment_id: string;
          billing_interval: "monthly" | "annual";
          renewal_status: string | null;
          next_term_start: string | null;
          next_term_end: string | null;
        }[]>(
          `subscriptions?stripe_subscription_id=eq.${encodeURIComponent(providerSubscription.id)}&select=id,assessment_id,billing_interval,renewal_status,next_term_start,next_term_end&limit=1`,
        );
        const local = rows[0];
        if (
          local?.billing_interval === "annual"
          && local.renewal_status === "paid"
          && local.next_term_start
          && local.next_term_end
        ) {
          await serviceUpdate("subscriptions", `id=eq.${local.id}`, {
            status: "active",
            stripe_subscription_id: null,
            current_period_start: local.next_term_start,
            current_period_end: local.next_term_end,
            current_contract_end_date: local.next_term_end.slice(0, 10),
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
        } else if (local) {
          await serviceUpdate("subscriptions", `id=eq.${local.id}`, {
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            stripe_subscription_id: null,
          });
          await serviceUpdate("home_assessments", `id=eq.${local.assessment_id}`, {
            status: "cancelled",
          });
        }
      }
    } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      await subscriptionSynced(event.data.object as unknown as SubscriptionObject);
    } else if (
      event.type === "subscription_schedule.created"
      || event.type === "subscription_schedule.updated"
    ) {
      await subscriptionScheduleSynced(
        event.data.object as unknown as SubscriptionScheduleObject,
      );
    } else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as unknown as StripeCheckoutSession;
      if (session.metadata?.kind === "home_assessment" && session.metadata.assessment_id) {
        await serviceUpdate("home_assessments", `id=eq.${session.metadata.assessment_id}`, { payment_status: "failed" });
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as { id?: string };
      if (pi.id) await serviceUpdate("home_assessments", `stripe_payment_intent_id=eq.${encodeURIComponent(pi.id)}`, { payment_status: "failed" });
    } else if (event.type === "invoice.payment_action_required") {
      const invoice = event.data.object as unknown as InvoiceObject;
      if (invoice.subscription) await serviceUpdate("subscriptions", `stripe_subscription_id=eq.${encodeURIComponent(invoice.subscription)}`, { status: "past_due" });
    } else if (event.type === "charge.refunded") {
      await chargeRefunded(event.data.object as unknown as ChargeObject);
    } else if (event.type === "charge.dispute.created") {
      const dispute = event.data.object as { payment_intent?: string | null };
      if (dispute.payment_intent) await serviceUpdate("home_assessments", `stripe_payment_intent_id=eq.${encodeURIComponent(dispute.payment_intent)}`, { payment_status: "disputed" });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    try { const parsed=JSON.parse(raw) as {id?:string};if(parsed.id)await serviceDelete("stripe_webhook_events",`stripe_event_id=eq.${encodeURIComponent(parsed.id)}`); } catch {}
    console.error("[stripe-webhook]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "webhook_failed" }, { status: 400 });
  }
}
