import { NextRequest, NextResponse } from "next/server";
import { parseStripeEvent, type StripeCheckoutSession } from "@/lib/stripe";
import { serviceInsert, serviceSelect, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";
import { formatMoneyFromCents } from "@/lib/assessment";

export const runtime = "nodejs";

type AssessmentMailRow = { reference: string; preferred_date: string; assessment_price_cents: number; customers: { email: string; full_name: string; preferred_language: Locale } };

async function assessmentPaid(session: StripeCheckoutSession) {
  const id = session.metadata.assessment_id || session.client_reference_id;
  if (!id || session.payment_status !== "paid") return;
  await serviceUpdate("home_assessments", `id=eq.${id}`, {
    payment_status: "paid", status: "assessment", stripe_payment_intent_id: session.payment_intent,
    stripe_customer_id: session.customer, paid_at: new Date().toISOString(), confirmed_at: new Date().toISOString(),
  });
  if (session.customer) {
    const rows = await serviceSelect<{ customer_id: string }[]>(`home_assessments?id=eq.${id}&select=customer_id&limit=1`);
    if (rows[0]) await serviceUpdate("customers", `id=eq.${rows[0].customer_id}`, { stripe_customer_id: session.customer });
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

async function subscriptionPaid(session: StripeCheckoutSession) {
  const subscriptionId = session.metadata.subscription_id;
  const assessmentId = session.metadata.assessment_id;
  if (!subscriptionId || !assessmentId || session.payment_status !== "paid") return;
  await serviceUpdate("subscriptions", `id=eq.${subscriptionId}`, { status: "active", stripe_subscription_id: session.subscription, stripe_checkout_session_id: session.id, activated_at: new Date().toISOString() });
  await serviceUpdate("home_assessments", `id=eq.${assessmentId}`, { status: "subscription_active" });
  await serviceInsert("assessment_events", { assessment_id: assessmentId, event_type: "subscription_activated", from_status: "approved", to_status: "subscription_active", actor_type: "stripe", actor_reference: session.id });
}

type InvoiceObject={id:string;customer:string|null;subscription:string|null;amount_due:number;amount_paid:number;currency:string;status:string;hosted_invoice_url:string|null;invoice_pdf:string|null;period_start:number;period_end:number};
type SubscriptionMailRow={id:string;customer_id:string;assessment_id:string;customers:{email:string;full_name:string;preferred_language:Locale}};
async function invoicePaid(invoice:InvoiceObject){if(!invoice.subscription)return;const rows=await serviceSelect<SubscriptionMailRow[]>(`subscriptions?stripe_subscription_id=eq.${encodeURIComponent(invoice.subscription)}&select=id,customer_id,assessment_id,customers(email,full_name,preferred_language)&limit=1`);const row=rows[0];if(!row)return;await serviceUpsert("invoices",{customer_id:row.customer_id,subscription_id:row.id,assessment_id:row.assessment_id,stripe_invoice_id:invoice.id,amount_due_cents:invoice.amount_due,amount_paid_cents:invoice.amount_paid,currency:invoice.currency,status:"paid",hosted_invoice_url:invoice.hosted_invoice_url,invoice_pdf_url:invoice.invoice_pdf,period_start:new Date(invoice.period_start*1000).toISOString(),period_end:new Date(invoice.period_end*1000).toISOString()},"stripe_invoice_id");await sendTransactionalEmail({template:"invoice",locale:row.customers.preferred_language,email:row.customers.email,name:row.customers.full_name,reference:invoice.id,amount:formatMoneyFromCents(invoice.amount_paid,row.customers.preferred_language),actionUrl:invoice.hosted_invoice_url||undefined});}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  try {
    const event = parseStripeEvent(raw, signature);
    const seen = await serviceSelect<{ stripe_event_id: string }[]>(`stripe_webhook_events?stripe_event_id=eq.${encodeURIComponent(event.id)}&select=stripe_event_id&limit=1`);
    if (seen.length) return NextResponse.json({ received: true, duplicate: true });
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as unknown as StripeCheckoutSession;
      if (session.metadata?.kind === "home_assessment") await assessmentPaid(session);
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
    }
    await serviceInsert("stripe_webhook_events", { stripe_event_id: event.id, event_type: event.type });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "webhook_failed" }, { status: 400 });
  }
}
