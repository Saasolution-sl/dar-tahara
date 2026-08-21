import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceInsert, serviceSelect, serviceUpdate } from "@/lib/supabase-rpc";
import { reconcileAcStripeQuantity } from "@/lib/ac-billing-sync";

export const runtime = "nodejs";

type AcUnitRow = { id: string; coverage_type: string; status: string; subscription_id: string };

/**
 * Retires a paid add-on AC unit (never the included unit -- that requires
 * the replace flow, since retiring it would leave the subscription with no
 * included unit at all). Never deletes the row or its maintenance history;
 * only flips status, matching the deep-clean/pause admin action pattern.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  if (!reason) return NextResponse.json({ error: "reason_required" }, { status: 400 });

  const [unit] = await serviceSelect<AcUnitRow[]>(`ac_units?id=eq.${id}&select=id,coverage_type,status,subscription_id&limit=1`);
  if (!unit) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (unit.coverage_type === "included") return NextResponse.json({ error: "cannot_retire_included_unit" }, { status: 400 });
  if (unit.status === "retired") return NextResponse.json({ error: "already_retired" }, { status: 400 });

  await serviceUpdate("ac_units", `id=eq.${id}`, {
    status: "retired",
    retired_at: new Date().toISOString(),
    replacement_reason: reason,
  });

  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: "ac_unit_retired",
    resource_type: "ac_unit",
    resource_id: id,
    previous_value: { status: unit.status },
    new_value: { status: "retired", reason },
  });

  // Reflects the reduced paid-unit count in Stripe immediately, rather than
  // waiting for an unrelated future webhook to trigger reconciliation.
  await reconcileAcStripeQuantity(unit.subscription_id);

  return NextResponse.json({ ok: true });
}
