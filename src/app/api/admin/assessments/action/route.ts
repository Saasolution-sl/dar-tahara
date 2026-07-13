import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { formatMoneyFromCents } from "@/lib/assessment";
import type { Locale } from "@/i18n/config";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";
const ACTIONS = new Set(["start", "complete", "approve", "revise", "reject", "pause", "cancel", "assign", "message"]);
const NEXT: Record<string, string> = { start: "assessment", complete: "pending_review", approve: "approved", revise: "needs_revised_quote", reject: "rejected", pause: "paused", cancel: "cancelled" };

type Row = { id: string; reference: string; status: string; customer_id: string; property_id: string; requested_frequency: string; estimated_monthly_cents: number | null; requested_billing_interval: "monthly" | "annual"; customers: { email: string; phone:string; full_name: string; preferred_language: Locale } };

export async function POST(req: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!/^[0-9a-f-]{36}$/i.test(id) || !ACTIONS.has(action)) return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  const rows = await serviceSelect<Row[]>(`home_assessments?id=eq.${id}&select=id,reference,status,customer_id,property_id,requested_frequency,estimated_monthly_cents,requested_billing_interval,customers(email,phone,full_name,preferred_language)&limit=1`);
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (action === "assign") {
    const cleaner = typeof body.cleanerId === "string" && /^[0-9a-f-]{36}$/i.test(body.cleanerId) ? body.cleanerId : null;
    const inspector = typeof body.inspectorId === "string" && /^[0-9a-f-]{36}$/i.test(body.inspectorId) ? body.inspectorId : null;
    await serviceUpdate("home_assessments", `id=eq.${id}`, { assigned_cleaner_id: cleaner, assigned_inspector_id: inspector });
    await serviceInsert("assessment_events", { assessment_id:id,event_type:"staff_assigned",actor_type:"admin",metadata:{cleanerId:cleaner,inspectorId:inspector} });
    return NextResponse.json({ok:true,status:row.status});
  }
  if (action === "message") {
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 1500) : "";
    if (!message) return NextResponse.json({error:"message_required"},{status:400});
    const sent = await sendWhatsAppText(row.customers.phone, message);
    await serviceInsert("customer_messages", {customer_id:row.customer_id,assessment_id:id,channel:"whatsapp",direction:"outbound",recipient:row.customers.phone,body:message,provider_message_id:sent.id,status:sent.id?"sent":"failed",metadata:{actor:"admin"}});
    return NextResponse.json({ok:true,status:row.status});
  }
  const updates: Record<string, unknown> = { status: NEXT[action], assessment_notes: typeof body.notes === "string" ? body.notes.slice(0, 5000) : null };
  if (action === "start") updates.assessment_started_at = new Date().toISOString();
  if (action === "complete") updates.assessment_completed_at = new Date().toISOString();
  if (action === "revise") {
    const revised = Number(body.revisedMonthlyCents);
    if (!Number.isInteger(revised) || revised < 0) return NextResponse.json({ error: "invalid_quote" }, { status: 400 });
    updates.revised_monthly_cents = revised;
    updates.revised_annual_cents = Math.round(revised * 12 * 0.95);
    updates.revised_quote_reason = typeof body.notes === "string" ? body.notes.slice(0, 2000) : null;
    updates.revised_quote_status = "pending";
    updates.revised_quote_expires_at = new Date(Date.now() + 14 * 86400000).toISOString();
  }
  if (action === "reject") updates.decline_reason = typeof body.notes === "string" ? body.notes.slice(0, 2000) : null;
  if (action === "approve" && row.estimated_monthly_cents === null) {
    return NextResponse.json({ error: "quote_required" }, { status: 409 });
  }
  await serviceUpdate("home_assessments", `id=eq.${id}`, updates);
  if (action === "approve") {
    const monthly = row.estimated_monthly_cents;
    if (monthly === null) return NextResponse.json({ error: "quote_required" }, { status: 409 });
    const billed = row.requested_billing_interval === "annual" ? Math.round(monthly * 12 * 0.95) : monthly;
    await serviceInsert("subscriptions", { customer_id: row.customer_id, property_id: row.property_id, assessment_id: id, frequency: row.requested_frequency, billing_interval: row.requested_billing_interval, monthly_price_cents: monthly, billed_price_cents: billed, annual_discount_basis_points: row.requested_billing_interval === "annual" ? 500 : 0 });
  }
  await serviceInsert("assessment_events", { assessment_id: id, event_type: action, from_status: row.status, to_status: NEXT[action], actor_type: "admin", note: typeof body.notes === "string" ? body.notes.slice(0, 2000) : null });
  if (action === "complete") await sendTransactionalEmail({ template: "assessment_completed", locale: row.customers.preferred_language, email: row.customers.email, name: row.customers.full_name, reference: row.reference });
  if (action === "revise") {
    const tokenRows = await serviceSelect<{revised_quote_token:string}[]>(`home_assessments?id=eq.${id}&select=revised_quote_token&limit=1`);
    const token = tokenRows[0]?.revised_quote_token;
    const actionUrl = token ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://dartahara.com"}/${row.customers.preferred_language}/assessment/quote/${token}` : undefined;
    await sendTransactionalEmail({ template: "revised_quote", locale: row.customers.preferred_language, email: row.customers.email, name: row.customers.full_name, reference: row.reference, amount: formatMoneyFromCents(Number(updates.revised_monthly_cents), row.customers.preferred_language), actionUrl });
  }
  if (action === "reject") await sendTransactionalEmail({ template: "subscription_declined", locale: row.customers.preferred_language, email: row.customers.email, name: row.customers.full_name, reference: row.reference });
  return NextResponse.json({ ok: true, status: NEXT[action] });
}
