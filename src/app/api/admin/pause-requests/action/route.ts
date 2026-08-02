import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/admin-auth";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { pauseStripeSubscription, resumeStripeSubscription } from "@/lib/stripe";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { formatMoneyFromCents } from "@/lib/assessment";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";
const ACTIONS = new Set(["review", "approve", "reject", "resume_early"]);

type Row = {
  id: string;
  status: string;
  subscription_id: string;
  requested_start_date: string;
  requested_end_date: string;
  approved_start_date: string | null;
  approved_end_date: string | null;
  subscriptions: {
    id: string;
    stripe_subscription_id: string | null;
    status: string;
    current_contract_end_date: string | null;
    original_contract_end_date: string | null;
    billed_price_cents: number;
    currency: string;
    customers: { email: string; full_name: string; preferred_language: Locale };
  };
};

function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00Z`).getTime();
  const end = new Date(`${endIso}T00:00:00Z`).getTime();
  return Math.round((end - start) / 86_400_000);
}

function addDaysUTC(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const auth = await authorizeApi(["staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (["approve", "reject", "resume_early"].includes(action) && !(await authorizeApi(["administrator"])).ok) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(id) || !ACTIONS.has(action)) return NextResponse.json({ error: "invalid_action" }, { status: 400 });

  const rows = await serviceSelect<Row[]>(
    `pause_requests?id=eq.${id}&select=id,status,subscription_id,requested_start_date,requested_end_date,approved_start_date,approved_end_date,subscriptions(id,stripe_subscription_id,status,current_contract_end_date,original_contract_end_date,billed_price_cents,currency,customers(email,full_name,preferred_language))&limit=1`,
  );
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const notes = typeof body.notes === "string" ? body.notes.slice(0, 2000) : null;
  const locale = row.subscriptions.customers.preferred_language;
  const email = row.subscriptions.customers.email;
  const name = row.subscriptions.customers.full_name;

  if (action === "review") {
    if (row.status !== "submitted") return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
    await serviceUpdate("pause_requests", `id=eq.${id}`, { status: "under_review" });
    return NextResponse.json({ ok: true, status: "under_review" });
  }

  if (action === "reject") {
    if (!["submitted", "under_review"].includes(row.status)) return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
    await serviceUpdate("pause_requests", `id=eq.${id}`, {
      status: "rejected", admin_notes: notes, customer_visible_note: notes,
      reviewed_by: auth.context.user.id, reviewed_at: new Date().toISOString(),
    });
    await serviceInsert("audit_logs", { actor_user_id: auth.context.user.id, action: "pause_request_rejected", resource_type: "pause_request", resource_id: id, previous_value: { status: row.status }, new_value: { status: "rejected" } });
    await sendTransactionalEmail({ template: "pause_request_rejected", locale, email, name });
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  if (action === "approve") {
    if (!["submitted", "under_review"].includes(row.status)) return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
    const stripeSubscriptionId = row.subscriptions.stripe_subscription_id;
    if (!stripeSubscriptionId) return NextResponse.json({ error: "subscription_not_billed" }, { status: 409 });

    const approvedStartDate = typeof body.approvedStartDate === "string" && body.approvedStartDate ? body.approvedStartDate : row.requested_start_date;
    const approvedEndDate = typeof body.approvedEndDate === "string" && body.approvedEndDate ? body.approvedEndDate : row.requested_end_date;
    if (approvedEndDate <= approvedStartDate) return NextResponse.json({ error: "invalid_dates" }, { status: 400 });

    let stripeResult;
    try {
      stripeResult = await pauseStripeSubscription({
        subscriptionId: stripeSubscriptionId,
        resumesAt: new Date(`${approvedEndDate}T00:00:00Z`),
        idempotencyKey: `pause_approve_${id}`,
      });
    } catch {
      return NextResponse.json({ error: "stripe_pause_failed" }, { status: 502 });
    }
    if (!stripeResult.pause_collection) return NextResponse.json({ error: "stripe_pause_failed" }, { status: 502 });

    const pauseDays = daysBetween(approvedStartDate, approvedEndDate);
    const currentContractEnd = row.subscriptions.current_contract_end_date;
    const originalContractEnd = row.subscriptions.original_contract_end_date || currentContractEnd;
    const newContractEnd = currentContractEnd ? addDaysUTC(currentContractEnd, pauseDays) : null;

    await serviceUpdate("pause_requests", `id=eq.${id}`, {
      status: "approved", approved_start_date: approvedStartDate, approved_end_date: approvedEndDate,
      admin_notes: notes, customer_visible_note: notes,
      reviewed_by: auth.context.user.id, reviewed_at: new Date().toISOString(),
    });
    await serviceUpdate("subscriptions", `id=eq.${row.subscription_id}`, {
      pause_used: true, pause_months_used: Math.ceil(pauseDays / 30),
      original_contract_end_date: originalContractEnd, current_contract_end_date: newContractEnd,
    });
    await serviceInsert("audit_logs", { actor_user_id: auth.context.user.id, action: "pause_request_approved", resource_type: "pause_request", resource_id: id, previous_value: { status: row.status }, new_value: { status: "approved", approvedStartDate, approvedEndDate } });
    await sendTransactionalEmail({ template: "pause_request_approved", locale, email, name, date: approvedStartDate, details: approvedEndDate });
    return NextResponse.json({ ok: true, status: "approved" });
  }

  // resume_early
  if (!["approved", "active"].includes(row.status)) return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
  const stripeSubscriptionId = row.subscriptions.stripe_subscription_id;
  if (!stripeSubscriptionId) return NextResponse.json({ error: "subscription_not_billed" }, { status: 409 });
  try {
    await resumeStripeSubscription({ subscriptionId: stripeSubscriptionId, idempotencyKey: `pause_resume_early_${id}` });
  } catch {
    return NextResponse.json({ error: "stripe_resume_failed" }, { status: 502 });
  }
  await serviceUpdate("pause_requests", `id=eq.${id}`, {
    status: "completed", admin_notes: notes,
    reviewed_by: auth.context.user.id, reviewed_at: new Date().toISOString(),
  });
  await serviceUpdate("subscriptions", `id=eq.${row.subscription_id}`, { status: "active" });
  await serviceInsert("audit_logs", { actor_user_id: auth.context.user.id, action: "pause_request_resumed_early", resource_type: "pause_request", resource_id: id, previous_value: { status: row.status }, new_value: { status: "completed" } });
  await sendTransactionalEmail({ template: "subscription_resumed_confirmation", locale, email, name, amount: formatMoneyFromCents(row.subscriptions.billed_price_cents, locale) });
  return NextResponse.json({ ok: true, status: "completed" });
}
