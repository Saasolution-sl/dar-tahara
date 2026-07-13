import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import { createSubscriptionCheckoutSession } from "@/lib/stripe";
import { serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";
type Row = { id:string; assessment_id:string; billing_interval:"monthly"|"annual"; billed_price_cents:number; frequency:string; customers:{ stripe_customer_id:string|null; preferred_language:Locale }; home_assessments:{ status:string } };

export async function POST(req: NextRequest) {
  if (!adminConfigured() || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({error:"not_configured"},{status:503});
  if (!isAdminAuthorized(req)) return NextResponse.json({error:"unauthorized"},{status:401});
  const { subscriptionId } = await req.json().catch(()=>({})) as {subscriptionId?:string};
  if (!subscriptionId || !/^[0-9a-f-]{36}$/i.test(subscriptionId)) return NextResponse.json({error:"invalid_request"},{status:400});
  const rows = await serviceSelect<Row[]>(`subscriptions?id=eq.${subscriptionId}&select=id,assessment_id,billing_interval,billed_price_cents,frequency,customers(stripe_customer_id,preferred_language),home_assessments(status)&limit=1`);
  const row=rows[0];
  if (!row || row.home_assessments.status!=="approved" || !row.customers.stripe_customer_id) return NextResponse.json({error:"not_ready"},{status:409});
  const session=await createSubscriptionCheckoutSession({subscriptionId:row.id,assessmentId:row.assessment_id,customerId:row.customers.stripe_customer_id,locale:row.customers.preferred_language,frequencyLabel:row.frequency,billingInterval:row.billing_interval,amountCents:row.billed_price_cents,requestOrigin:req.nextUrl.origin});
  await serviceUpdate("subscriptions",`id=eq.${row.id}`,{stripe_checkout_session_id:session.id});
  return NextResponse.json({checkoutUrl:session.url});
}
