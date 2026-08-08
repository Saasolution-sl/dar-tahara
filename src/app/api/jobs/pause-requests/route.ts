import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { secureTokenEqual } from "@/lib/whatsapp/security";
import { serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import type { Locale } from "@/i18n/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized(req: NextRequest): Promise<boolean> {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  return await isAdminAuthorized() || secureTokenEqual(bearer, process.env.PAUSE_REQUEST_JOB_SECRET);
}

type DueRow = {
  id: string;
  subscription_id: string;
  approved_start_date: string | null;
  approved_end_date: string | null;
  subscriptions: { id: string; customers: { email: string; full_name: string; preferred_language: Locale } };
};

/**
 * Stripe already stops/resumes billing on its own via `resumes_at`: this job
 * only keeps our own `pause_requests.status` / `subscriptions.status` fields
 * in sync with the dates an admin approved, for requests approved ahead of
 * their start date.
 */
export async function POST(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const today = new Date().toISOString().slice(0, 10);

  const starting = await serviceSelect<DueRow[]>(
    `pause_requests?status=eq.approved&approved_start_date=lte.${today}&select=id,subscription_id,approved_start_date,approved_end_date,subscriptions(id,customers(email,full_name,preferred_language))`,
  );
  for (const row of starting) {
    await serviceUpdate("pause_requests", `id=eq.${row.id}`, { status: "active" });
    await serviceUpdate("subscriptions", `id=eq.${row.subscription_id}`, { status: "paused" });
    await sendTransactionalEmail({
      template: "pause_starting_reminder", locale: row.subscriptions.customers.preferred_language,
      email: row.subscriptions.customers.email, name: row.subscriptions.customers.full_name,
      date: row.approved_start_date ?? undefined, details: row.approved_end_date ?? undefined,
    });
  }

  const ending = await serviceSelect<DueRow[]>(
    `pause_requests?status=eq.active&approved_end_date=lte.${today}&select=id,subscription_id,approved_start_date,approved_end_date,subscriptions(id,customers(email,full_name,preferred_language))`,
  );
  for (const row of ending) {
    await serviceUpdate("pause_requests", `id=eq.${row.id}`, { status: "completed" });
    await serviceUpdate("subscriptions", `id=eq.${row.subscription_id}`, { status: "active" });
    await sendTransactionalEmail({
      template: "subscription_resumption_reminder", locale: row.subscriptions.customers.preferred_language,
      email: row.subscriptions.customers.email, name: row.subscriptions.customers.full_name,
    });
  }

  return NextResponse.json({ ok: true, started: starting.length, completed: ending.length });
}
