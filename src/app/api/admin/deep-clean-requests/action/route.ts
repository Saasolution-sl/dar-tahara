import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/admin-auth";
import { authorizeApi } from "@/lib/portal-auth";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";
const ACTIONS = new Set(["review", "approve", "reject", "complete"]);

type Row = {
  id: string;
  status: string;
  is_free: boolean;
  payment_status: string;
  subscription_id: string;
  requested_date: string;
  customers: { email: string; full_name: string; preferred_language: Locale };
};

export async function POST(req: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const auth = await authorizeApi(["staff", "administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (["approve", "reject"].includes(action) && !(await authorizeApi(["administrator"])).ok) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(id) || !ACTIONS.has(action)) return NextResponse.json({ error: "invalid_action" }, { status: 400 });

  const rows = await serviceSelect<Row[]>(
    `deep_clean_requests?id=eq.${id}&select=id,status,is_free,payment_status,subscription_id,requested_date,customers(email,full_name,preferred_language)&limit=1`,
  );
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const notes = typeof body.notes === "string" ? body.notes.slice(0, 2000) : null;
  const { email, full_name: name, preferred_language: locale } = row.customers;

  if (action === "review") {
    if (row.status !== "submitted") return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
    await serviceUpdate("deep_clean_requests", `id=eq.${id}`, { status: "under_review" });
    return NextResponse.json({ ok: true, status: "under_review" });
  }

  if (action === "reject") {
    if (!["submitted", "under_review"].includes(row.status)) return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
    await serviceUpdate("deep_clean_requests", `id=eq.${id}`, { status: "rejected", admin_notes: notes, reviewed_by: auth.context.user.id, reviewed_at: new Date().toISOString() });
    await serviceInsert("audit_logs", { actor_user_id: auth.context.user.id, action: "deep_clean_request_rejected", resource_type: "deep_clean_request", resource_id: id, previous_value: { status: row.status }, new_value: { status: "rejected" } });
    await sendTransactionalEmail({ template: "deep_clean_request_rejected", locale, email, name });
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  if (action === "approve") {
    if (!["submitted", "under_review"].includes(row.status)) return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
    if (!row.is_free && row.payment_status !== "paid") return NextResponse.json({ error: "payment_required" }, { status: 409 });
    await serviceUpdate("deep_clean_requests", `id=eq.${id}`, { status: "scheduled", admin_notes: notes, reviewed_by: auth.context.user.id, reviewed_at: new Date().toISOString() });
    if (row.is_free) await serviceUpdate("subscriptions", `id=eq.${row.subscription_id}`, { deep_clean_free_used: true });
    await serviceInsert("audit_logs", { actor_user_id: auth.context.user.id, action: "deep_clean_request_approved", resource_type: "deep_clean_request", resource_id: id, previous_value: { status: row.status }, new_value: { status: "scheduled" } });
    await sendTransactionalEmail({ template: "deep_clean_request_approved", locale, email, name, date: row.requested_date });
    return NextResponse.json({ ok: true, status: "scheduled" });
  }

  // complete
  if (!["scheduled"].includes(row.status)) return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
  await serviceUpdate("deep_clean_requests", `id=eq.${id}`, { status: "completed", admin_notes: notes, reviewed_by: auth.context.user.id, reviewed_at: new Date().toISOString() });
  if (row.is_free) await serviceUpdate("subscriptions", `id=eq.${row.subscription_id}`, { deep_clean_free_used_at: new Date().toISOString() });
  await serviceInsert("audit_logs", { actor_user_id: auth.context.user.id, action: "deep_clean_request_completed", resource_type: "deep_clean_request", resource_id: id, previous_value: { status: row.status }, new_value: { status: "completed" } });
  return NextResponse.json({ ok: true, status: "completed" });
}
