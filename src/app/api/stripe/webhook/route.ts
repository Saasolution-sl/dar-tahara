import { NextRequest, NextResponse } from "next/server";
import {
  parseStripeEvent,
  retrievePaymentIntent,
  retrieveSetupIntent,
  setCustomerDefaultPaymentMethod,
  type StripeCheckoutSession,
} from "@/lib/stripe";
import { serviceDelete, serviceInsert, serviceInsertIgnoreDuplicates, serviceSelect, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";
import { formatMoneyFromCents } from "@/lib/assessment";

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
    const actionUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dartahara.com"}/${row.customers.preferred_language}/assessment/confirmation?session_id=${encodeURIComponent(session.id)}`;
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
  await serviceUpdate("subscriptions", `id=eq.${subscriptionId}`, { status: "active", stripe_subscription_id: session.subscription, stripe_checkout_session_id: session.id, activated_at: new Date().toISOString() });
  await serviceUpdate("home_assessments", `id=eq.${assessmentId}`, { status: "subscription_active" });
  await serviceInsert("assessment_events", { assessment_id: assessmentId, event_type: "subscription_activated", from_status: "approved", to_status: "subscription_active", actor_type: "stripe", actor_reference: session.id });
  const rows=await serviceSelect<{customer_id:string;customers:{auth_user_id:string|null}}[]>(`subscriptions?id=eq.${subscriptionId}&select=customer_id,customers(auth_user_id)&limit=1`);const owner=rows[0];
  if(owner){await serviceUpdate("customers",`id=eq.${owner.customer_id}`,{status:"customer"});if(owner.customers.auth_user_id)await serviceInsertIgnoreDuplicates("user_roles",{user_id:owner.customers.auth_user_id,role:"customer"},"user_id,role");await serviceInsert("payments",{customer_id:owner.customer_id,subscription_id:subscriptionId,provider_payment_id:session.payment_intent||session.id,amount_cents:session.amount_total||0,currency:session.currency||"eur",status:"succeeded",paid_at:new Date().toISOString()});}
}

type InvoiceObject={id:string;customer:string|null;subscription:string|null;amount_due:number;amount_paid:number;currency:string;status:string;hosted_invoice_url:string|null;invoice_pdf:string|null;period_start:number;period_end:number};
type SubscriptionMailRow={id:string;customer_id:string;assessment_id:string;customers:{email:string;full_name:string;preferred_language:Locale}};
async function invoicePaid(invoice:InvoiceObject){if(!invoice.subscription)return;const rows=await serviceSelect<SubscriptionMailRow[]>(`subscriptions?stripe_subscription_id=eq.${encodeURIComponent(invoice.subscription)}&select=id,customer_id,assessment_id,customers(email,full_name,preferred_language)&limit=1`);const row=rows[0];if(!row)return;await serviceUpsert("invoices",{customer_id:row.customer_id,subscription_id:row.id,assessment_id:row.assessment_id,stripe_invoice_id:invoice.id,amount_due_cents:invoice.amount_due,amount_paid_cents:invoice.amount_paid,currency:invoice.currency,status:"paid",hosted_invoice_url:invoice.hosted_invoice_url,invoice_pdf_url:invoice.invoice_pdf,period_start:new Date(invoice.period_start*1000).toISOString(),period_end:new Date(invoice.period_end*1000).toISOString()},"stripe_invoice_id");await sendTransactionalEmail({template:"invoice",locale:row.customers.preferred_language,email:row.customers.email,name:row.customers.full_name,reference:invoice.id,amount:formatMoneyFromCents(invoice.amount_paid,row.customers.preferred_language),actionUrl:invoice.hosted_invoice_url||undefined});}

type SubscriptionObject = { id: string; status: string; cancel_at_period_end?: boolean; current_period_start?: number; current_period_end?: number };
const SUB_STATUS_MAP: Record<string, string> = {
  active: "active", trialing: "active", past_due: "past_due", unpaid: "past_due",
  canceled: "cancelled", incomplete: "pending_payment", incomplete_expired: "cancelled", paused: "paused",
};
async function subscriptionSynced(sub: SubscriptionObject) {
  await serviceUpdate("subscriptions", `stripe_subscription_id=eq.${encodeURIComponent(sub.id)}`, {
    status: SUB_STATUS_MAP[sub.status] || "past_due",
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
  });
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
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as unknown as StripeCheckoutSession;
      if (session.metadata?.kind === "home_assessment" && session.metadata.assessment_id) {
        await serviceUpdate("home_assessments", `id=eq.${session.metadata.assessment_id}`, { payment_status: "expired", status: "cancelled" });
      }
    } else if (event.type === "invoice.paid") {
      await invoicePaid(event.data.object as unknown as InvoiceObject);
    } else if (event.type === "invoice.payment_failed") {
      const invoice=event.data.object as unknown as InvoiceObject;
      if(invoice.subscription)await serviceUpdate("subscriptions",`stripe_subscription_id=eq.${encodeURIComponent(invoice.subscription)}`,{status:"past_due"});
    } else if (event.type === "customer.subscription.deleted") {
      const subscription=event.data.object as {id?:string};
      if(subscription.id){const rows=await serviceSelect<{assessment_id:string}[]>(`subscriptions?stripe_subscription_id=eq.${encodeURIComponent(subscription.id)}&select=assessment_id&limit=1`);await serviceUpdate("subscriptions",`stripe_subscription_id=eq.${encodeURIComponent(subscription.id)}`,{status:"cancelled",cancelled_at:new Date().toISOString()});if(rows[0])await serviceUpdate("home_assessments",`id=eq.${rows[0].assessment_id}`,{status:"cancelled"});}
    } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      await subscriptionSynced(event.data.object as unknown as SubscriptionObject);
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
